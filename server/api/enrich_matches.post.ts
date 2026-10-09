import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

/**
 * POST /api/enrich_matches  { matchUserIds: string[] }
 *
 * Returns full profiles (plus Vibe Check answers) for the people the signed-in
 * member is matched with. Any requested ID that isn't one of the caller's
 * matches is silently left out, so this can't be used to read other members.
 */
export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const callerId = (user as any)?.id || (user as any)?.sub
    if (!callerId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const body = await readBody(event)
    const requested: string[] = Array.isArray(body?.matchUserIds)
        ? [...new Set(body.matchUserIds.filter((id: unknown): id is string => typeof id === 'string'))].slice(0, 100)
        : []
    if (requested.length === 0) return {}

    const client = serverSupabaseServiceRole(event)

    // Only people the caller actually has a match with
    const { data: matches, error: matchError } = await client
        .schema('m2m')
        .from('matches')
        .select('user_1_id, user_2_id')
        .or(`user_1_id.eq.${callerId},user_2_id.eq.${callerId}`)

    if (matchError) {
        console.error('Error checking matches for enrichment:', matchError)
        return {}
    }

    const partnerIds = new Set(
        (matches || []).map((m: any) => (m.user_1_id === callerId ? m.user_2_id : m.user_1_id))
    )
    const allowedIds = requested.filter(id => partnerIds.has(id))
    if (allowedIds.length === 0) return {}

    const { data: profiles, error } = await client
        .schema('m2m')
        .from('profiles')
        .select('*')
        .in('id', allowedIds)

    if (error) {
        console.error('Error enriching matches:', error)
        return {}
    }

    const { data: vibes } = await client
        .schema('m2m')
        .from('vibe_answers')
        .select('user_id, question_key, answer_value')
        .in('user_id', allowedIds)

    const profileMap: Record<string, any> = {}
    profiles?.forEach((p: any) => {
        // Internal fields a match never needs
        const { telegram_id, weekly_opt_in_until, ...rest } = p
        profileMap[p.id] = {
            ...rest,
            vibeAnswers: vibes?.filter((v: any) => v.user_id === p.id) || []
        }
    })

    return profileMap
})
