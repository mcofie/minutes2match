import { createClient } from '@supabase/supabase-js'

export const unlockMatch = async (matchId: string, userId: string): Promise<void> => {
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({
            statusCode: 500,
            message: 'Server configuration error: Supabase credentials missing'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Fetch match
    const { data: match, error: matchFetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

    if (matchFetchError || !match) {
        console.error('[MatchUtil] Failed to fetch match:', matchFetchError)
        throw createError({ statusCode: 404, message: 'Match not found' })
    }

    // Determine which user is paying/unlocking
    const isUser1 = match.user_1_id === userId
    const isUser2 = match.user_2_id === userId

    if (!isUser1 && !isUser2) {
        console.error('[MatchUtil] User not part of this match:', userId, matchId)
        throw createError({ statusCode: 403, message: 'User not part of match' })
    }

    // Prepare update data
    const updateData: Record<string, any> = {}

    if (isUser1) {
        updateData.user_1_paid = true
        updateData.user_1_paid_at = new Date().toISOString()
    } else {
        updateData.user_2_paid = true
        updateData.user_2_paid_at = new Date().toISOString()
    }

    // Check if the OTHER user has already paid
    const otherUserPaid = isUser1 ? match.user_2_paid : match.user_1_paid

    if (otherUserPaid) {
        // BOTH users have now paid - FULLY UNLOCK
        updateData.status = 'unlocked'
        updateData.unlocked_at = new Date().toISOString()
        console.log(`[MatchUtil] ✅ Match ${matchId} FULLY UNLOCKED`)
    } else {
        // Only one user has paid - set to partial_payment
        updateData.status = 'partial_payment'
        console.log(`[MatchUtil] ⏳ Match ${matchId} PARTIAL - waiting for other user`)
    }

    // Update match record
    const { error: updateError } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)

    if (updateError) {
        console.error('[MatchUtil] Failed to update match:', updateError)
        throw createError({ statusCode: 500, message: 'Failed to update match status' })
    }
}
