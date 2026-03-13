import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_id, code, participant_id } = body

    if (!event_id || !code || !participant_id) {
        throw createError({ statusCode: 400, message: 'Missing required parameters' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // 1. Verify Organizer
    const { data: franchiseEvent, error: authError } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('id')
        .eq('id', event_id)
        .eq('access_code', String(code).trim())
        .single()

    if (authError || !franchiseEvent) {
        throw createError({ statusCode: 403, message: 'Unauthorized' })
    }

    // 2. Cleanup: Remove their feedback as well to keep things clean
    await client
        .schema('m2m')
        .from('speed_date_feedback')
        .delete()
        .eq('event_id', event_id)
        .eq('from_user_id', (await client.schema('m2m').from('franchise_participants').select('user_id').eq('id', participant_id).single()).data?.user_id)

    // 3. Remove Participant link
    const { error: deleteError } = await client
        .schema('m2m')
        .from('franchise_participants')
        .delete()
        .eq('id', participant_id)
        .eq('event_id', event_id)


    if (deleteError) {
        throw createError({ statusCode: 500, message: 'Failed to delete participant' })
    }

    return {
        success: true,
        message: 'Participant removed'
    }
})
