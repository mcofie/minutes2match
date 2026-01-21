import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { db: { schema: 'm2m' } }
);

async function manualUpdatePayment() {
    const reference = 'we9xubxmfn';

    console.log('Manually updating payment with reference:', reference);

    // Update the payment status to success (WITHOUT provider_response column)
    const { data, error } = await supabase
        .from('payments')
        .update({
            status: 'success'
        })
        .eq('provider_ref', reference)
        .select();

    if (error) {
        console.error('Error updating payment:', error);
    } else {
        console.log('Payment updated successfully:', data);
    }

    // Now update the match status
    const matchId = '1c744fcc-c576-4967-9ce0-95b56926d733';
    const userId = '2920a098-9b0c-47fa-a50c-2a4dbbd5380c';

    console.log('\nFetching match:', matchId);

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

    if (matchError) {
        console.error('Error fetching match:', matchError);
        return;
    }

    if (!match) {
        console.log('Match not found. Listing all matches...');
        const { data: allMatches } = await supabase
            .from('matches')
            .select('id, user_1_id, user_2_id, status')
            .limit(5);
        console.log('Available matches:', allMatches);
        return;
    }

    console.log('Current match state:', {
        id: match.id,
        user_1_id: match.user_1_id,
        user_2_id: match.user_2_id,
        user_1_paid: match.user_1_paid,
        user_2_paid: match.user_2_paid,
        status: match.status
    });
}

manualUpdatePayment();
