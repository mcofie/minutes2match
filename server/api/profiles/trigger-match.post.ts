import { runTargetedMatching } from '~/server/utils/matchmaker'

/**
 * Public endpoint to trigger JIT matching for a user (e.g. after vibe check retake)
 * POST /api/profiles/trigger-match
 * Body: { userId: string }
 * Auth: Verified user or Admin
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<{ userId: string }>(event)
    const { userId } = body

    if (!userId) {
        throw createError({ statusCode: 400, message: 'Missing userId' })
    }

    try {
        const result = await runTargetedMatching(userId)
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
