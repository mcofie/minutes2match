import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const id = query.id as string

    if (!id) {
        throw createError({ statusCode: 400, message: 'Missing participant ID' })
    }

    const client = serverSupabaseServiceRole(event)

    // 1. Fetch Participant, Event, and Profile Info securely
    const { data, error } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select(`
            id,
            participant_number,
            gender,
            event:event_id (
                id,
                title,
                status
            ),
            user:user_id (
                id,
                display_name
            )
        `)
        .eq('id', id)
        .single()

    if (error || !data) {
        console.error('[Participant Data API] Error:', error)
        throw createError({ statusCode: 404, message: 'Invalid or expired invitation link.' })
    }

    return { success: true, participant: data }
})
