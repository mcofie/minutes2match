import { createClient } from '@supabase/supabase-js'
import { runTargetedMatching } from '~/server/utils/matchmaker'

/**
 * Endpoint to verify users and immediately trigger JIT matching.
 * POST /api/admin/users/verify
 * Body: { userIds: string[] }
 */
export default defineEventHandler(async (event) => {
    const body = await readBody<{ userIds: string[] }>(event)
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds)) {
        throw createError({ statusCode: 400, message: 'Invalid userIds' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // 1. Verify Users
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .in('id', userIds)

    if (updateError) {
        throw createError({ statusCode: 500, message: 'Failed to verify users' })
    }

    // 2. Trigger JIT Matching for each verified user
    const results = []
    for (const userId of userIds) {
        try {
            const matchResult = await runTargetedMatching(userId)
            results.push({ userId, matched: !!matchResult?.matched, score: matchResult?.score })
        } catch (err) {
            console.error(`[Admin Verify JIT] Failed for user ${userId}:`, err)
            results.push({ userId, error: true })
        }
    }

    return { 
        success: true, 
        message: `Verified ${userIds.length} users and ran JIT matching.`,
        details: results
    }
})
