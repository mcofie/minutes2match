import { serverSupabaseUser } from '#supabase/server'
import { runTargetedMatching } from '~/server/utils/matchmaker'
import { requireAdminAccess } from '~/server/utils/admin'

/**
 * Trigger JIT matching for a user (e.g. after a Vibe Check retake)
 * POST /api/profiles/trigger-match
 * Body: { userId?: string }  (defaults to the signed-in member)
 *
 * Auth: a signed-in member can only trigger matching for themselves.
 * Triggering it for someone else requires admin access.
 * Each run scores every member and may send match notifications, so it's rate limited.
 */
export default defineEventHandler(async (event) => {
    enforceRateLimit(event, { maxRequests: 5, windowSeconds: 60, prefix: 'trigger-match' })

    const user = await serverSupabaseUser(event)
    const callerId = (user as any)?.id || (user as any)?.sub
    if (!callerId) {
        throw createError({ statusCode: 401, statusMessage: 'Please sign in again.' })
    }

    const body = await readBody<{ userId?: string }>(event).catch(() => ({} as { userId?: string }))
    const targetUserId = body?.userId || callerId

    if (targetUserId !== callerId) {
        await requireAdminAccess(event) // throws 403 unless the caller is an admin
    }

    try {
        const result = await runTargetedMatching(targetUserId)
        return {
            success: true,
            matched: !!result?.matched,
            score: result?.score
        }
    } catch (err: any) {
        console.error('[Trigger Match] Logic failed:', err)
        throw createError({
            statusCode: 500,
            message: 'Failed to run matching logic'
        })
    }
})
