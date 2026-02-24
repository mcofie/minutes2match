/**
 * Match Expiration Reminder
 * GET /api/cron/match-expiration-reminder
 * 
 * Sends SMS reminders to users 24 hours before their match expires
 * Should be called by a cron job daily
 */

import { createClient } from '@supabase/supabase-js'
import type { M2MDatabase } from '~/types/database.types'

interface ProfileSummary {
    display_name: string | null
    phone: string | null
}

interface ExpiringMatch {
    id: string
    expires_at: string
    user_1_id: string
    user_2_id: string
    user_1_paid: boolean
    user_2_paid: boolean
    user_1: ProfileSummary | ProfileSummary[] | null
    user_2: ProfileSummary | ProfileSummary[] | null
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Simple API key check for cron security
    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        console.log('[Cron] Unauthorized access attempt')
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({ statusCode: 500, statusMessage: 'Server configuration error: SUPABASE_URL or SUPABASE_SERVICE_KEY missing' })
    }

    const supabase = createClient<M2MDatabase, 'm2m'>(
        supabaseUrl,
        supabaseServiceKey,
        { db: { schema: 'm2m' } }
    )

    console.log('[Cron] Running match expiration reminder job...')

    // Find matches expiring in 24-26 hours (to account for cron timing variance)
    const now = new Date()
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000)

    const { data, error } = await supabase
        .from('matches')
        .select(`
            id,
            expires_at,
            user_1_id,
            user_2_id,
            user_1_paid,
            user_2_paid,
            user_1:profiles!matches_user_1_id_fkey(display_name, phone),
            user_2:profiles!matches_user_2_id_fkey(display_name, phone)
        `)
        .eq('status', 'partial_payment')
        .gte('expires_at', now.toISOString())
        .lte('expires_at', in26Hours.toISOString())

    if (error) {
        console.error('[Cron] Failed to fetch expiring matches:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch matches' })
    }

    const expiringMatches = data as unknown as ExpiringMatch[]
    console.log(`[Cron] Found ${expiringMatches?.length || 0} matches expiring soon`)

    let sentCount = 0

    for (const match of expiringMatches || []) {
        // Helper to extract profile from object or array
        const getProfile = (p: ProfileSummary | ProfileSummary[] | null): ProfileSummary | null => {
            if (!p) return null
            return Array.isArray(p) ? p[0] : p
        }

        const unpaidUser = match.user_1_paid ? getProfile(match.user_2) : getProfile(match.user_1)
        const paidUser = match.user_1_paid ? getProfile(match.user_1) : getProfile(match.user_2)

        if (!unpaidUser?.phone) {
            console.log(`[Cron] Skipping match ${match.id} - unpaid user has no phone`)
            continue
        }

        const paidName = paidUser?.display_name || 'Someone'
        const message = `⏰ Reminder: ${paidName}'s match unlock expires in 24 hours! Log in now to see if you want to connect: ${config.public?.baseUrl || 'https://minutes2match.com'}/me`

        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                baseURL: config.public?.baseUrl || 'http://localhost:3000',
                body: {
                    to: unpaidUser.phone,
                    message
                }
            })

            sentCount++
            console.log(`[Cron] Sent reminder for match ${match.id} to ${unpaidUser.phone}`)
        } catch (smsError) {
            console.error(`[Cron] Failed to send SMS for match ${match.id}:`, smsError)
        }
    }

    console.log(`[Cron] Completed. Sent ${sentCount} reminders.`)

    return {
        success: true,
        matchesFound: expiringMatches?.length || 0,
        remindersSent: sentCount
    }
})
