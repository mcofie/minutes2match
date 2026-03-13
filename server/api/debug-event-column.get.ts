import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)
    const { data, error } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('short_code')
        .limit(1)

    return { data, error }
})
