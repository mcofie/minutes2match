import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { notifyNewSignup } from '~/server/utils/discord'
import { notifyUser } from '~/server/utils/notify'

/**
 * POST /api/auth/welcome
 *
 * The slow part of signing up, run as its own request once the member is signed in: a first
 * matching pass, the admin ping and the welcome message. It runs once per member (claimed with
 * profiles.welcomed_at), so retries and double calls are harmless.
 */
export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.id || (user as any)?.sub
    if (!userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const db = serverSupabaseServiceRole(event).schema('m2m') as any

    // Claim the welcome atomically: only the first call gets a row back
    const { data: claimed } = await db
        .from('profiles')
        .update({ welcomed_at: new Date().toISOString() })
        .eq('id', userId)
        .is('welcomed_at', null)
        .select('id, phone, display_name')
        .maybeSingle()
    if (!claimed) return { ok: true, alreadyWelcomed: true }

    const results = await Promise.allSettled([
        (async () => {
            const { runTargetedMatching } = await import('~/server/utils/matchmaker')
            const r = await runTargetedMatching(userId)
            if (r?.matched) console.log(`[Welcome] Immediate match for ${userId} (${r.score}%)`)
        })(),
        notifyNewSignup({
            email: `${String(claimed.phone || '').replace(/\D/g, '')}@m2m.app`,
            phone: claimed.phone,
            displayName: claimed.display_name,
        }),
        notifyUser(userId, `Welcome to Minutes 2 Match, ${claimed.display_name}! We're thrilled to have you. To start getting personalised matches, make sure your profile is complete.`, {
            type: 'generic',
            smsPriority: 'high',
            telegramOptions: {
                reply_markup: { inline_keyboard: [[{ text: 'Complete profile', web_app: { url: useRuntimeConfig().public.baseUrl + '/me' } }]] },
            },
        }),
    ])
    results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[Welcome] Step ${['matching', 'admin ping', 'welcome message'][i]} failed:`, r.reason)
    })
    return { ok: true }
})
