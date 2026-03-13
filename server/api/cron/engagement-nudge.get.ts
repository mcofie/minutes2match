/**
 * Cron Component: User Engagement Nudges (Bi-weekly)
 * GET /api/cron/engagement-nudge
 * 
 * Target: Users who registered but have no matches, event bookings, or vibe-check activity.
 * Frequency: Bi-weekly (14 days) per user.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { notifyUser } from '~/server/utils/notify'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // 1. Verify cron secret
    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
        db: { schema: 'm2m' }
    })

    try {
        // Preparation: Set common values
        const nudgeIntervalDays = 14
        const engagementBroadcastId = '09117865-0373-455b-9d6a-54917454238e' // Constant UUID for this campaign
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        console.log('[Engagement Cron] Starting scan...')

        // 2. Fetch all IDs of users who HAVE activity or matches (to exclude them)
        // Extracting IDs in bulk to avoid N+1 queries later
        const [
            { data: matchData },
            { data: bookingData },
            { data: answerData },
            { data: recentNudges }
        ] = await Promise.all([
            supabase.from('matches').select('user_1_id, user_2_id'),
            supabase.from('event_bookings').select('user_id'),
            supabase.from('vibe_answers').select('user_id'),
            supabase.from('sms_history')
                .select('recipient_id, created_at')
                .eq('broadcast_id', engagementBroadcastId)
        ])

        const idsWithMatches = new Set((matchData || []).flatMap(m => [m.user_1_id, m.user_2_id]))
        const idsWithBookings = new Set((bookingData || []).map(b => b.user_id))
        const idsWithAnswers = new Set((answerData || []).map(a => a.user_id))

        // Map of recipient_id -> last nudge timestamp
        const lastNudgeMap = new Map<string, number>()
            ; (recentNudges || []).forEach(n => {
                if (n.recipient_id) {
                    const time = new Date(n.created_at).getTime()
                    const current = lastNudgeMap.get(n.recipient_id) || 0
                    if (time > current) lastNudgeMap.set(n.recipient_id, time)
                }
            })

        // 3. Fetch verified profiles older than 3 days
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, phone, display_name, created_at')
            .eq('is_verified', true)
            .lt('created_at', threeDaysAgo.toISOString())

        if (profileError) throw profileError
        if (!profiles || profiles.length === 0) return { success: true, nudged: 0 }

        let nudgedCount = 0
        const now = Date.now()

        for (const profile of profiles) {
            // A. Exclusions
            if (idsWithMatches.has(profile.id)) continue
            if (idsWithBookings.has(profile.id)) continue
            if (idsWithAnswers.has(profile.id)) continue

            // B. Frequency limit (Bi-weekly)
            const lastNudgeTime = lastNudgeMap.get(profile.id)
            if (lastNudgeTime) {
                const daysSinceLastNudge = (now - lastNudgeTime) / (1000 * 60 * 60 * 24)
                if (daysSinceLastNudge < nudgeIntervalDays) continue
            }

            // C. Send Nudge
            const firstName = (profile.display_name || 'there').split(' ')[0]
            const message = `Hi ${firstName}! Still looking for that perfect connection? We have new souls waiting. Complete your Vibe Check today to get matched: minutes2match.com/vibe-check`

            try {
                const result = await notifyUser(profile.id, message, { smsPriority: 'normal' })

                // Log to history
                // @ts-ignore
                await supabase.from('sms_history').insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name,
                    message,
                    status: 'sent',
                    broadcast_id: engagementBroadcastId,
                    sent_by: null // System
                })

                nudgedCount++
                console.log(`[Engagement Cron] Nudged ${profile.phone} (${profile.id}) via ${result.provider}`)
            } catch (smsError: any) {
                console.error(`[Engagement Cron] Failed for ${profile.phone}:`, smsError.message)
            }
        }

        // 4. Reporting
        if (nudgedCount > 0) {
            await notifyDiscord({
                title: '📈 Bi-weekly Engagement Nudges Sent',
                description: `Successfully sent ${nudgedCount} reminders to inactive registered users.`,
                color: DiscordColors.info,
                fields: [
                    { name: 'Campaign', value: 'New User Participation', inline: true },
                    { name: 'Target', value: 'No Matches/Activity', inline: true }
                ]
            })
        }

        return {
            success: true,
            nudged: nudgedCount,
            total_verified_scanned: profiles.length
        }

    } catch (err: any) {
        console.error('[Engagement Cron] Fatal error:', err.message)
        throw createError({ statusCode: 500, message: err.message })
    }
})
