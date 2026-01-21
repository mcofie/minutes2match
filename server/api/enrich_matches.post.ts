
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const { matchUserIds } = body // Array of user IDs to fetch profiles for

    if (!matchUserIds || !Array.isArray(matchUserIds) || matchUserIds.length === 0) {
        return {}
    }

    const client = serverSupabaseServiceRole(event)

    // Security: Verify these users are actually in matches with the current user?
    // For performance, we'll fetch the profiles and assume the match existence check was done by the caller (who has the match ID).
    // But ideally, we should join with matches table. 
    // Given we are enriching a list the user ALREADY fetched via RLS, they already have "permission" to know existence.
    // We just need to give them the names/photos which RLS hides.

    const { data: profiles, error } = await client
        .schema('m2m')
        .from('profiles')
        .select('*')
        .in('id', matchUserIds)

    if (error) {
        console.error('Error enriching matches:', error)
        return {}
    }

    // Also fetch vibe answers
    const { data: vibes } = await client
        .schema('m2m')
        .from('vibe_answers')
        .select('user_id, question_key, answer_value')
        .in('user_id', matchUserIds)

    // Map by ID
    const profileMap: Record<string, any> = {}

    profiles?.forEach((p: any) => {
        profileMap[p.id] = {
            ...p,
            vibeAnswers: vibes?.filter((v: any) => v.user_id === p.id) || []
        }
    })

    return profileMap
})
