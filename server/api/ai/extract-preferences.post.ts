import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Read a member's bio with AI (traits + meaning vectors), then look for a match with the new data.
 * POST /api/ai/extract-preferences
 * Body: { userId: string }. Members can only run this for themselves; admins for anyone.
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<{ userId: string }>(event)
    const { userId } = body || ({} as any)

    if (!userId || userId === 'undefined') {
        throw createError({ statusCode: 400, message: 'Invalid or missing userId' })
    }

    const caller = await serverSupabaseUser(event)
    const callerId = (caller as any)?.id || (caller as any)?.sub
    if (!callerId) throw createError({ statusCode: 401, message: 'Unauthorized' })
    if (callerId !== userId) await requireAdminAccess(event)

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, about_me')
        .eq('id', userId)
        .single()

    if (fetchError || !profile) {
        throw createError({ statusCode: 404, message: 'Profile not found' })
    }

    const outcome = await analyseMemberBio(supabase, profile)
    if (outcome === 'skipped') return { success: true, message: 'No bio to read yet' }
    if (outcome === 'failed') return { success: false, message: 'AI could not read this bio' }

    // New data may change who they fit with; look for a match (does nothing unless they're opted in and unmatched)
    try {
        const { runTargetedMatching } = await import('~/server/utils/matchmaker')
        await runTargetedMatching(userId)
    } catch (matchError) {
        console.error('[Matchmaker JIT] Failed after AI extraction:', matchError)
    }

    const { data } = await supabase.from('profiles').select('preferences_extracted').eq('id', userId).single()
    return { success: true, data: (data as any)?.preferences_extracted }
})
