const { createClient } = require('@supabase/supabase-js');
const { generateReceipt } = require('./utils/generate-receipt');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const adminSecret = event.headers['x-admin-secret'];
        const bookingId = event.queryStringParameters.bookingId;

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        if (!bookingId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing bookingId' })
            };
        }

        // Initialize Supabase
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Fetch booking
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error || !booking) {
            console.error('Fetch error:', error);
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Booking not found' })
            };
        }

        // Prepare data for PDF
        const bookingData = {
            serialNumber: `SIF/${new Date().getFullYear()}/${booking.id.toString().slice(0, 6)}`,
            date: new Date(booking.created_at).toLocaleDateString('en-IN'),
            name: booking.name,
            age: booking.age,
            roomType: booking.room_type,
            mobile: booking.mobile,
            transactionId: booking.payment_id || 'N/A',
            amount: booking.amount
        };

        // Generate PDF
        const pdfBuffer = await generateReceipt(bookingData);

        // Return PDF
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Receipt_${booking.name.replace(/\s+/g, '_')}.pdf"`,
            },
            body: pdfBuffer.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('Download error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
