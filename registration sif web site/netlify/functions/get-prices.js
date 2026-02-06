const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data, error } = await supabase
            .from('room_prices')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier frontend lookup: { "Standard Room": 2500, ... }
        const prices = {};
        data.forEach(item => {
            prices[item.room_type] = item.price;
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(prices)
        };

    } catch (error) {
        console.error('Error fetching prices:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch prices' })
        };
    }
};
