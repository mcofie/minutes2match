/**
 * Cron Component: Vibe Refresh / Subscription Drip
 * GET /api/cron/vibe-refresh
 * 
 * Reminds users who have been "Waiting for Match" for 5+ days to refresh their profile.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

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
        // 1. Get all users who haven't had a match created in last 5 days
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

        // Get all users
        const { data: users } = await supabase.from('profiles').select('id, phone, display_name').eq('is_active', true)

        // Get users with recent matches
        const { data: recentMatches } = await supabase.from('matches').select('user_1_id, user_2_id').gt('created_at', fiveDaysAgo.toISOString())

        const usersWithMatches = new Set<string>()
        recentMatches?.forEach(m => {
            usersWithMatches.add(m.user_1_id!)
            usersWithMatches.add(m.user_2_id!)
        })

        const staleUsers = (users || []).filter(u => !usersWithMatches.has(u.id))

        if (staleUsers.length === 0) return { success: true, sent: 0 }

        const authToken = Buffer.from(`${config.hubtelClientId}:${config.hubtelClientSecret}`).toString('base64')
        let sentCount = 0

        for (const user of staleUsers) {
            const message = `Hey ${user.display_name || 'there'}! No matches recently? Try refreshing your "Hobbies" or "Interests" on Minutes2Match to increase your reach! minutes2match.com/me`

            try {
                await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                    method: 'POST',
                    headers: { 'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/json' },
                    body: { From: 'M2Match', To: user.phone, Content: message }
                })
                sentCount++
            } catch (e) { }
        }

        await notifyDiscord({
            title: '🌊 Vibe Refresh Drip sent',
            description: `Sent ${sentCount} "Vibe Refresh" SMS to users waiting for matches.`,
            color: DiscordColors.info
        })

        return { success: true, sent: sentCount }
    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message })
    }
})
