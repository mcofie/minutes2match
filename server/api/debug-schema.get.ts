import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event)

    const { data: columns, error } = await client
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'm2m')
        .eq('table_name', 'franchise_participants')

    return { columns, error }
})
