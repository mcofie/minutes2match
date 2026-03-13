import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)
    const { data, error } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select(`
            *,
            profile:user_id (
                *
            )
        `)
        .limit(1)

    return { data, error }
})
