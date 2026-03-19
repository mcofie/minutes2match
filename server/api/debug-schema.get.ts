import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    const { data: profile } = await client
        .schema('m2m')
        .from('profiles')
        .select('*')
        .limit(1)
        .single()

    return { 
        keys: profile ? Object.keys(profile) : null
    }
})
