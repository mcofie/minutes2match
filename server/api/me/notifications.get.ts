import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event)

    const { data, error } = await client
        .schema('m2m')
        .from('sms_history')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notifications:', error)
        throw createError({ statusCode: 500, message: 'Failed to fetch messages' })
    }

    return data
})
