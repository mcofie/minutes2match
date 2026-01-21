import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { db: { schema: 'm2m' } }
);

async function checkSchema() {
    // Get a sample payment to see columns
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data[0]) {
        console.log('Payment table columns:', Object.keys(data[0]));
        console.log('Sample record:', JSON.stringify(data[0], null, 2));
    }

    // Check matches table
    console.log('\n--- Checking matches table ---');
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .limit(1);

    if (matchError) {
        console.error('Matches error:', matchError);
    } else if (matches && matches[0]) {
        console.log('Matches table columns:', Object.keys(matches[0]));
    } else {
        console.log('No matches found');
    }
}

checkSchema();
