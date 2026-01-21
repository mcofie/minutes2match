import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { db: { schema: 'm2m' } }
);

async function checkPayment() {
    const reference = 'we9xubxmfn';

    console.log('Checking for payment with reference:', reference);
    console.log('Supabase URL:', process.env.SUPABASE_URL);

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('provider_ref', reference);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data);
        console.log('Total found:', data?.length || 0);
    }

    // Also check all recent payments
    console.log('\n--- Recent payments ---');
    const { data: recentPayments, error: recentError } = await supabase
        .from('payments')
        .select('id, provider_ref, status, purpose, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentError) {
        console.error('Error fetching recent:', recentError);
    } else {
        console.log('Recent payments:', JSON.stringify(recentPayments, null, 2));
    }
}

checkPayment();
