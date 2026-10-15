/**
 * Cron: ask how introductions went
 * GET /api/cron/match-feedback   (Authorization: Bearer <CRON_SECRET>, run daily)
 *
 * For introductions made 4 to 21 days ago that we haven't asked about yet, message each person
 * who hasn't answered with a link straight to the question on their match page. Each match is
 * asked once (feedback_requested_at). A wide window means a missed day doesn't lose anyone.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { notifyUser } from '~/server/utils/notify'

const DAY = 24 * 60 * 60 * 1000

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
        const now = Date.now()
        const matches = await fetchAllRows<any>(() => supabase
            .from('matches')
            .select('id, user_1_id, user_2_id, user_1_feedback, user_2_feedback, user_1:profiles!matches_user_1_id_fkey(id, display_name), user_2:profiles!matches_user_2_id_fkey(id, display_name)')
            .neq('status', 'expired')
            .is('feedback_requested_at', null)
            .lte('created_at', new Date(now - 4 * DAY).toISOString())
            .gte('created_at', new Date(now - 21 * DAY).toISOString())
            .order('created_at'))

        const baseUrl = config.public.baseUrl || 'https://minutes2match.com'
        const firstName = (u: any) => (u?.display_name || '').split(' ')[0] || 'there'
        let sent = 0

        for (const match of matches) {
            const people = [
                { me: match.user_1, them: match.user_2, answered: !!match.user_1_feedback },
                { me: match.user_2, them: match.user_1, answered: !!match.user_2_feedback }
            ]
            for (const { me, them, answered } of people) {
                if (answered || !me?.id) continue
                const link = `${baseUrl}/me/connection/${match.id}?feedback=1`
                const message = `Hi ${firstName(me)}! How's it going with ${firstName(them)}? One tap tells us: ${link}`
                try {
                    await notifyUser(me.id, message, { type: 'generic', smsPriority: 'low' })
                    sent++
                } catch (e) {
                    console.error('[Feedback cron] Notify failed for', me.id, e)
                }
            }
            await supabase.from('matches').update({ feedback_requested_at: new Date().toISOString() }).eq('id', match.id)
        }

        if (matches.length) {
            await notifyDiscord({
                title: '📈 Feedback requests',
                description: `Asked about ${matches.length} introduction${matches.length === 1 ? '' : 's'} (${sent} message${sent === 1 ? '' : 's'}).`,
                color: DiscordColors.info
            })
        }

        return { success: true, matches: matches.length, sent }
    } catch (err: any) {
        throw createError({ statusCode: 500, message: err.message })
    }
})
