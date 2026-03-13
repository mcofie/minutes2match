import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { event_id, code } = query
    const cleanCode = String(code || '').trim()
    const cleanEventId = String(event_id || '').trim()

    console.log('[Franchise Auth DEBUG] Request:', { event_id: cleanEventId, code: cleanCode })

    if (!cleanEventId || !cleanCode) {
        throw createError({ statusCode: 400, message: 'Missing event ID or access code' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // Verify the organizer access
    const { data: franchiseEvent, error } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('*')
        .eq('id', cleanEventId)
        .eq('access_code', cleanCode)
        .maybeSingle()

    console.log('[Franchise Auth DEBUG] DB Response:', { hasData: !!franchiseEvent, error })

    if (error) {
        console.error('[Franchise Auth DEBUG] Error:', error)
        throw createError({ statusCode: 500, message: `Database error: ${error.message}` })
    }

    if (!franchiseEvent) {
        throw createError({ statusCode: 403, message: 'No event found with that ID and code. Please check your link.' })
    }



    // Fetch participants list for management
    const { data: participants } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select(`
            id,
            participant_number,
            gender,
            created_at,
            profile:user_id (
                display_name,
                phone
            )
        `)
        .eq('event_id', cleanEventId)
        .order('created_at', { ascending: false })

    return {
        success: true,
        event: franchiseEvent,
        participants: participants || [],
        meta: {
            participantCount: participants?.length || 0
        }
    }

})
