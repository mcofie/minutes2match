import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    // Using RPC or raw query if possible? No, but I can use information_schema via standard query if permissions allow.
    // Wait, Supabase usually hides information_schema over HTTP.

    // I will try to select short_code explicitly and see the error.
    const { data, error } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select('short_code')
        .limit(1)

    return { data, error }
})
