/**
 * Track Referral Signup
 * POST /api/referrals/track
 * 
 * Called when a user signs up with a referral code
 */

import { createClient } from '@supabase/supabase-js'

interface TrackReferralBody {
    referralCode: string
    newUserId: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<TrackReferralBody>(event)
    const config = useRuntimeConfig()

    if (!body.referralCode || !body.newUserId) {
        throw createError({
            statusCode: 400,
            message: 'Missing referral code or user ID'
        })
    }

    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({
            statusCode: 500,
            message: 'Server configuration error'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Find the referrer by their code
    const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('referral_code', body.referralCode.toUpperCase())
        .single()

    if (referrerError || !referrer) {
        console.log('[Referral] Invalid referral code:', body.referralCode)
        return { success: false, message: 'Invalid referral code' }
    }

    // Don't allow self-referral
    if (referrer.id === body.newUserId) {
        return { success: false, message: 'Cannot refer yourself' }
    }

    // Update the new user's profile with referred_by
    await supabase
        .from('profiles')
        .update({ referred_by: referrer.id })
        .eq('id', body.newUserId)

    // Create referral record
    const { error: insertError } = await supabase
        .from('referrals')
        .insert({
            referrer_id: referrer.id,
            referred_id: body.newUserId,
            referral_code: body.referralCode.toUpperCase(),
            status: 'signed_up'
        })

    if (insertError) {
        console.error('[Referral] Failed to create referral record:', insertError)
        return { success: false, message: 'Failed to track referral' }
    }

    console.log(`[Referral] Tracked: ${referrer.display_name} referred user ${body.newUserId}`)

    return {
        success: true,
        message: 'Referral tracked successfully',
        referrerName: referrer.display_name
    }
})
