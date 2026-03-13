import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const body = await readBody(event)
    const { event_id, from_participant_id, target_participant_number, vote, comment } = body

    if (!event_id || !target_participant_number || vote === undefined) {
        throw createError({ statusCode: 400, message: 'Missing vote data' })
    }

    const client = serverSupabaseServiceRole(event) as any
    let finalUserId = user?.id

    // If not logged in, we must resolve user_id from participant_id
    if (!finalUserId) {
        if (!from_participant_id) throw createError({ statusCode: 401, message: 'Authentication required' })

        const { data: part } = await client
            .schema('m2m')
            .from('franchise_participants')
            .select('user_id')
            .eq('id', from_participant_id)
            .single()

        if (!part) throw createError({ statusCode: 403, message: 'Invalid participant session' })
        finalUserId = part.user_id
    }


    // Record the speed date feedback
    const { data, error } = await client
        .schema('m2m')
        .from('speed_date_feedback')
        .upsert({
            event_id,
            from_user_id: finalUserId,
            to_participant_number: String(target_participant_number),
            vote: Boolean(vote),
            comment: comment || null
        })

        .select()
        .single()

    if (error) {
        console.error('[Franchise Vote] Error recording feedback:', error)
        throw createError({ statusCode: 500, message: 'Failed to save your choice' })
    }

    return {
        success: true,
        message: 'Vote recorded!'
    }
})
