import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any
    const { matchId } = getQuery(event)

    try {
        let query = client
            .schema('m2m')
            .from('venue_redemptions')
            .select('*')
            .eq('user_id', user.id)

        // Strict UUID check for matchId if provided
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (matchId && uuidRegex.test(String(matchId))) {
            query = query.eq('match_id', String(matchId))
        }

        const { data, error } = await query.order('redeemed_at', { ascending: false })

        if (error) {
            console.error('[Redemption GET] Database Error:', error)
            return []
        }

        return data || []
    } catch (err: any) {
        console.error('[Redemption GET] Unexpected Error:', err)
        return []
    }
})

