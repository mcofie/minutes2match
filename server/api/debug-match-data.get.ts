import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    const { data: match } = await client
        .schema('m2m')
        .from('matches')
        .select(`
            ai_analysis, match_score, match_reasons,
            matchedProfile:user_1_id (ai_analysis)
        `)
        .limit(1)
        .single()

    return match
})
