/**
 * Cron Component: Vibe Refresh / Subscription Drip
 * GET /api/cron/vibe-refresh
 * 
 * Reminds users who have been "Waiting for Match" for 5+ days to refresh their profile.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { sendSMS } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabase = createClient(config.supabaseUrl!, config.supabaseServiceKey!, {
        db: { schema: 'm2m' }
    })

    try {
        const BROADCAST_ID = '76e2c391-7e45-423c-a901-49666f44383c'
        const NUDGE_INTERVAL_DAYS = 7
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

        console.log('[Vibe Refresh] Starting job...')

        // 1. Get all recent match user IDs to exclude them from the sweep
        const { data: recentMatches } = await supabase
            .from('matches')
            .select('user_1_id, user_2_id')
            .gt('created_at', fiveDaysAgo.toISOString())

        const activeMatchUserIds = new Set<string>()
        recentMatches?.forEach(m => {
            if (m.user_1_id) activeMatchUserIds.add(m.user_1_id)
            if (m.user_2_id) activeMatchUserIds.add(m.user_2_id)
        })

        // 2. Fetch candidates: active users who haven't had a match in 5 days
        const { data: users, error: profileError } = await supabase
            .from('profiles')
            .select('id, phone, display_name')
            .eq('is_active', true)
            .eq('is_verified', true)

        if (profileError) throw profileError

        // Filter out users with recent matches
        let candidates = (users || []).filter(u => !activeMatchUserIds.has(u.id))

        if (candidates.length === 0) return { success: true, sent: 0 }

        // 3. Frequency Capping: Filter based on recent nudges in sms_history
        const { data: recentHistory } = await supabase
            .from('sms_history')
            .select('recipient_id, created_at')
            .eq('broadcast_id', BROADCAST_ID)

        const lastNudgeMap = new Map<string, number>()
        recentHistory?.forEach(h => {
            const time = new Date(h.created_at).getTime()
            const existing = lastNudgeMap.get(h.recipient_id!) || 0
            if (time > existing) lastNudgeMap.set(h.recipient_id!, time)
        })

        const now = Date.now()
        candidates = candidates.filter(u => {
            const lastTime = lastNudgeMap.get(u.id)
            if (!lastTime) return true
            const daysSince = (now - lastTime) / (1000 * 60 * 60 * 24)
            return daysSince >= NUDGE_INTERVAL_DAYS
        })

        // 4. Batch Processing: Limit to 50 users per run to prevent timeout
        const MAX_BATCH_SIZE = 50
        const batch = candidates.slice(0, MAX_BATCH_SIZE)

        if (batch.length === 0) return { success: true, sent: 0, reason: 'Frequency cap' }

        let sentCount = 0

        for (const user of batch) {
            const firstName = (user.display_name || 'there').split(' ')[0]
            const message = `Hi ${firstName}! No matches recently? Try refreshing your "Hobbies" or "Interests" on Minutes2Match to increase your reach! minutes2match.com/me`

            try {
                // Using unified sendSMS for Hubtel Primary + Zend Fallback 
                await sendSMS(user.phone, message, { priority: 'normal' })

                // Log history with metadata
                // @ts-ignore
                await supabase.from('sms_history').insert({
                    recipient_id: user.id,
                    recipient_phone: user.phone,
                    recipient_name: user.display_name,
                    message,
                    status: 'sent',
                    broadcast_id: BROADCAST_ID
                })

                sentCount++
                console.log(`[Vibe Refresh] Sent to ${user.phone}`)
            } catch (err: any) {
                console.error(`[Vibe Refresh] Failed for ${user.phone}:`, err.message)
            }
        }

        if (sentCount > 0) {
            await notifyDiscord({
                title: '🌊 Vibe Refresh Drip sent',
                description: `Sent ${sentCount} "Vibe Refresh" SMS to users waiting for matches.`,
                color: DiscordColors.info
            })
        }

        return {
            success: true,
            sent: sentCount,
            remaining_candidates: candidates.length - batch.length
        }
    } catch (err: any) {
        console.error('[Vibe Refresh] Fatal error:', err.message)
        throw createError({ statusCode: 500, message: err.message })
    }
})
