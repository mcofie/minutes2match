/**
 * Cron Component: Post-Match Feedback Loop
 * GET /api/cron/match-feedback
 * 
 * Asks for feedback 3 days after a match is unlocked.
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
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        const threeDaysAgoISO = threeDaysAgo.toISOString()

        const fourDaysAgo = new Date()
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
        const fourDaysAgoISO = fourDaysAgo.toISOString()

        // Find matches unlocked ~3 days ago that don't have feedback yet
        const { data: matches, error } = await supabase
            .from('matches')
            .select('id, user_1:profiles!matches_user_1_id_fkey(id, display_name, phone), user_2:profiles!matches_user_2_id_fkey(id, display_name, phone)')
            .eq('status', 'unlocked')
            .is('feedback_status', null)
            .lt('unlocked_at', threeDaysAgoISO)
            .gt('unlocked_at', fourDaysAgoISO)

        if (error) throw error
        if (!matches || matches.length === 0) return { success: true, sent: 0 }

        const authToken = Buffer.from(`${config.hubtelClientId}:${config.hubtelClientSecret}`).toString('base64')
        let sentCount = 0

        for (const match of matches) {
            const u1 = match.user_1 as any
            const u2 = match.user_2 as any

            const users = [u1, u2]
            for (const user of users) {
                const partnerName = (user.id === u1.id) ? u2.display_name : u1.display_name
                const message = `Hi ${user.display_name}! How did it go with ${partnerName || 'your match'}? Tell us if it was a success here: minutes2match.com/matches`

                try {
                    await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                        method: 'POST',
                        headers: { 'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/json' },
                        body: { From: 'M2Match', To: user.phone, Content: message }
                    })
                    sentCount++
                } catch (e) { }
            }

            // Mark feedback as 'pending' so we don't spam
            await supabase.from('matches').update({ feedback_status: 'pending' }).eq('id', match.id)
        }

        await notifyDiscord({
            title: '📈 Match Feedback Loops',
            description: `Sent ${sentCount} feedback request SMS for matches from 3 days ago.`,
            color: DiscordColors.info
        })

        return { success: true, sent: sentCount }
    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message })
    }
})
