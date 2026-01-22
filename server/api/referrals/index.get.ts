/**
 * Get User's Referral Info
 * GET /api/referrals
 * 
 * Returns the user's referral code and stats
 */

import { createClient } from '@supabase/supabase-js'

interface Referral {
    id: string
    status: string
    created_at: string
    reward_type: string | null
    reward_amount: number | null
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Get user from auth header or session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
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

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await createClient(
        supabaseUrl,
        config.supabaseServiceKey as string
    ).auth.getUser(token)

    if (authError || !user) {
        throw createError({
            statusCode: 401,
            message: 'Invalid token'
        })
    }

    // Get user's referral code
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()

    if (profileError) {
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch referral code'
        })
    }

    // Get referral stats
    const { data: referrals } = await supabase
        .from('referrals')
        .select('id, status, created_at, reward_type, reward_amount')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

    const typedReferrals = (referrals || []) as Referral[]

    const stats = {
        totalReferrals: typedReferrals.length,
        signedUp: typedReferrals.filter((r: Referral) => ['signed_up', 'paid', 'rewarded'].includes(r.status)).length,
        paid: typedReferrals.filter((r: Referral) => ['paid', 'rewarded'].includes(r.status)).length,
        rewarded: typedReferrals.filter((r: Referral) => r.status === 'rewarded').length,
        totalRewards: typedReferrals
            .filter((r: Referral) => r.status === 'rewarded')
            .reduce((sum: number, r: Referral) => sum + (r.reward_amount || 0), 0)
    }

    return {
        referralCode: profile?.referral_code,
        referralLink: `${config.public.baseUrl}/vibe-check?ref=${profile?.referral_code}`,
        stats,
        recentReferrals: typedReferrals.slice(0, 10)
    }
})
