import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event)

    // Fetch from notifications table
    const { data: notifications, error: notifError } = await client
        .schema('m2m')
        .from('notifications')
        .select('id, type, title, message, data, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Fetch from SMS history (legacy)
    const { data: smsHistory, error: smsError } = await client
        .schema('m2m')
        .from('sms_history')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (notifError) {
        console.error('Error fetching notifications:', notifError)
    }
    if (smsError) {
        console.error('Error fetching SMS history:', smsError)
    }

    // Transform SMS history to notification format
    const smsNotifications = (smsHistory || []).map((sms: any) => ({
        id: sms.id,
        type: 'sms',
        title: 'SMS Message',
        message: sms.message || sms.content,
        data: {},
        read: true,
        created_at: sms.created_at
    }))

    // Combine and sort by date
    const combined = [...(notifications || []), ...smsNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50)

    return combined
})
