import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    // Check count in both schemas
    const { count: publicCount } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    const { count: m2mCount } = await client
        .schema('m2m')
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    return { 
        public: publicCount, 
        m2m: m2mCount,
        note: "Checking where the real users are."
    }
})
