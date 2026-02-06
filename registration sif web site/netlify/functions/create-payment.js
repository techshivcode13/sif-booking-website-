const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        const { name, age, mobile, email, roomType, amount } = JSON.parse(event.body);

        // Validate inputs
        if (!name || !age || !mobile || !roomType || !amount) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Validate age
        if (age < 18 || age > 100) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid age' })
            };
        }

        // Validate mobile (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid mobile number' })
            };
        }

        // Validate email if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email address' })
            };
        }

        // ⚠️ TESTING PRICES - REVERT BEFORE PRODUCTION!
        // Initialize Supabase with SERVICE ROLE key (server-side only)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Fetch valid price from database
        const { data: priceData, error: priceError } = await supabase
            .from('room_prices')
            .select('price')
            .eq('room_type', roomType)
            .single();

        if (priceError || !priceData) {
            console.error('Price fetch error:', priceError);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid room type' })
            };
        }

        const expectedPrice = priceData.price;

        if (amount !== expectedPrice) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `Price mismatch. Expected ${expectedPrice}, got ${amount}` })
            };
        }

        // Create booking record with PENDING status
        const { data: booking, error: dbError } = await supabase
            .from('bookings')
            .insert([{
                name,
                age: parseInt(age),
                mobile,
                email: email || null,
                room_type: roomType,
                amount,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create booking' })
            };
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `booking_${booking.id}`,
            notes: {
                booking_id: booking.id,
                room_type: roomType,
                customer_name: name
            }
        });

        // Return order details to frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                bookingId: booking.id,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            })
        };

    } catch (error) {
        console.error('SERVER ERROR:', {
            message: error.message,
            stack: error.stack,
            details: error
        });

        // Check if it's a Razorpay authentication error
        if (error.statusCode === 401) {
            console.error('AUTHENTICATION ERROR: Check your Razorpay Key ID and Secret in Netlify Environment Variables.');
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
