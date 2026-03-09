import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // Optional: Only allow authenticated users to fetch venues
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any

    const { data: venues, error } = await client
        .schema('m2m')
        .from('partner_venues')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching venues:', error)
        throw createError({ statusCode: 500, message: 'Error fetching venues' })
    }

    return venues
})
