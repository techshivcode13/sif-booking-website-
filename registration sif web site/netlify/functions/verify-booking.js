const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { Resend } = require('resend');
const { generateReceipt } = require('./utils/generate-receipt');
const { getEmailTemplate } = require('./utils/email-template');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = JSON.parse(event.body);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // 1. Verify Signature (CRITICAL SECURITY STEP)
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error('Invalid signature: Potential tampering detected.');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid Payment Signature' })
            };
        }

        // 2. Fetch current status to avoid double processing (Idempotency)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: currentBooking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', booking_id)
            .single();

        if (fetchError || !currentBooking) {
            console.error('Fetch error:', fetchError);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Booking not found' })
            };
        }

        // If already PAID, just return success (Webhook or another process finished first)
        if (currentBooking.status === 'PAID') {
            console.log(`Booking ${booking_id} already marked as PAID. Skipping update/email.`);
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Already processed' })
            };
        }

        // 3. Signature is Valid and status is PENDING -> Update Database
        const { data, error } = await supabase
            .from('bookings')
            .update({
                status: 'PAID',
                payment_id: razorpay_payment_id
            })
            .eq('id', booking_id)
            .select();

        if (error) {
            console.error('Database update failed:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Payment verified but database update failed',
                    details: error.message || error,
                    hint: error.hint || 'No hint',
                    code: error.code || 'No code'
                })
            };
        }

        // 3. Send Email with PDF Receipt
        try {
            const bookingRecord = data[0];

            // Generate serial number for receipt
            const serialNumber = `SIF-REC-2026-${String(booking_id).padStart(4, '0')}`;

            // Format date
            const bookingDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            // Prepare receipt data
            const receiptData = {
                serialNumber: serialNumber,
                date: bookingDate,
                name: bookingRecord.name,
                age: bookingRecord.age,
                mobile: bookingRecord.mobile,
                roomType: bookingRecord.room_type,
                amount: bookingRecord.amount,
                transactionId: razorpay_payment_id
            };

            // Generate PDF receipt
            const pdfBuffer = await generateReceipt(receiptData);

            // Initialize Resend
            const resend = new Resend(process.env.RESEND_API_KEY);

            // Get email template
            const emailHtml = getEmailTemplate(receiptData);

            // Send email with PDF attachment
            const emailResult = await resend.emails.send({
                from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
                to: bookingRecord.email || bookingRecord.mobile + '@example.com', // Fallback if email not available
                subject: '🙏 Booking Confirmed - Sunyatee Retreat Shantivan',
                html: emailHtml,
                attachments: [
                    {
                        filename: `Sunyatee-Receipt-${serialNumber}.pdf`,
                        content: pdfBuffer
                    }
                ]
            });

            console.log('Email sent successfully:', emailResult);

        } catch (emailError) {
            // Log error but don't fail the entire request
            // Payment is already confirmed, email is secondary
            console.error('Email sending failed (non-critical):', emailError);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Payment verified and booking updated'
            })
        };

    } catch (error) {
        console.error('Verification Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
