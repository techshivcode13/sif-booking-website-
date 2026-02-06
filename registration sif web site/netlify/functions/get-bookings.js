const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Only allow GET or POST
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const adminSecret = event.headers['x-admin-secret'];
        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized: Invalid Admin Secret' })
            };
        }

        // Initialize Supabase with SERVICE ROLE key to bypass RLS policies
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Fetch all bookings
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to fetch bookings');
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error: ' + error.message })
        };
    }
};
