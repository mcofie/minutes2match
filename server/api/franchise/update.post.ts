import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_id, code, updates } = body

    if (!event_id || !code || !updates) {
        throw createError({ statusCode: 400, message: 'Missing update data' })
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
        throw createError({ statusCode: 403, message: 'Unauthorized access' })
    }

    // 2. Filter allowed updateable fields
    const allowedFields = ['title', 'location', 'event_date', 'status']
    const cleanUpdates: any = {}

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            cleanUpdates[field] = updates[field]
        }
    }

    // 3. Perform update
    const { data, error } = await client
        .schema('m2m')
        .from('franchise_events')
        .update(cleanUpdates)
        .eq('id', event_id)
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: `Failed to update event: ${error.message}` })
    }

    return {
        success: true,
        event: data
    }
})
