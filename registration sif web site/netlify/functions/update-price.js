const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        // Authenticate
        const adminSecret = event.headers['x-admin-secret'];
        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            console.warn('Unauthorized price update attempt');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const { roomType, newPrice } = JSON.parse(event.body);

        if (!roomType || newPrice === undefined || newPrice === null || isNaN(newPrice)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing roomType or valid newPrice' })
            };
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Upsert price (Insert or Update)
        const { data, error } = await supabase
            .from('room_prices')
            .upsert({
                room_type: roomType,
                price: parseInt(newPrice),
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Price updated successfully', data })
        };

    } catch (error) {
        console.error('Error updating price:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
