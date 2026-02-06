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
        // Razorpay sends webhook with signature
        const signature = event.headers['x-razorpay-signature'];

        if (!signature) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing signature' })
            };
        }

        // 1. Verify webhook signature using the RAW body string
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(event.body) // Use raw body string
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid signature: Webhook tampering suspected');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid signature' })
            };
        }

        const payload = JSON.parse(event.body);

        // 2. Process only 'payment.captured' event
        if (payload.event === 'payment.captured') {
            const paymentEntity = payload.payload.payment.entity;
            const bookingId = paymentEntity.notes.booking_id;
            const paymentId = paymentEntity.id;

            if (!bookingId) {
                console.warn('Webhook received but no booking_id in notes');
                return { statusCode: 200, body: 'Ignored: No booking_id' };
            }

            // Initialize Supabase
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            // 3. Fetch current status to avoid double processing
            const { data: booking, error: fetchError } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (fetchError || !booking) {
                console.error('Failed to fetch booking:', fetchError);
                return { statusCode: 500, body: 'Booking not found' };
            }

            // If already PAID, just acknowledge (Frontend might have finished first)
            if (booking.status === 'PAID') {
                console.log(`Booking ${bookingId} already marked as PAID. Skipping email.`);
                return { statusCode: 200, body: 'Success: Already processed' };
            }

            // 4. Update status to PAID
            const { data: updatedData, error: updateError } = await supabase
                .from('bookings')
                .update({
                    status: 'PAID',
                    payment_id: paymentId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select();

            if (updateError) {
                console.error('Failed to update booking status:', updateError);
                return { statusCode: 500, body: 'Update failed' };
            }

            // 5. Generate Receipt and Send Email (Insurance fallback)
            try {
                const bookingRecord = updatedData[0];
                const serialNumber = `SIF-REC-2026-${String(bookingId).padStart(4, '0')}`;
                const bookingDate = new Date().toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });

                const receiptData = {
                    serialNumber,
                    date: bookingDate,
                    name: bookingRecord.name,
                    age: bookingRecord.age,
                    mobile: bookingRecord.mobile,
                    roomType: bookingRecord.room_type,
                    amount: bookingRecord.amount,
                    transactionId: paymentId
                };

                const pdfBuffer = await generateReceipt(receiptData);
                const resend = new Resend(process.env.RESEND_API_KEY);
                const emailHtml = getEmailTemplate(receiptData);

                await resend.emails.send({
                    from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
                    to: bookingRecord.email || (bookingRecord.mobile + '@example.com'),
                    subject: '🙏 Booking Confirmed - Sunyatee Retreat Shantivan',
                    html: emailHtml,
                    attachments: [{
                        filename: `Sunyatee-Receipt-${serialNumber}.pdf`,
                        content: pdfBuffer
                    }]
                });

                console.log(`Webhook successfully processed and email sent for booking ${bookingId}`);

            } catch (emailError) {
                console.error('Email sending failed in webhook (non-critical):', emailError);
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ status: 'success', message: 'Booking verified and email sent' })
            };
        }

        // Acknowledge other events (e.g. order.paid etc) to keep Razorpay happy
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Webhook processing error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
