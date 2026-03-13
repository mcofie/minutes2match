import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const code = query.code as string

    if (!code) {
        throw createError({ statusCode: 400, message: 'Missing short code' })
    }

    const client = serverSupabaseServiceRole(event)

    // 1. Try finding an Event (Manager)
    const { data: eventData } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('id, access_code')
        .eq('short_code', code)
        .maybeSingle()

    if (eventData) {
        return {
            success: true,
            type: 'manager',
            target: `/manage/${eventData.id}?access=${eventData.access_code}`
        }
    }

    // 2. Try finding a Participant by short_code
    const { data: partData } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select('id')
        .eq('short_code', code)
        .maybeSingle()

    if (partData) {
        return {
            success: true,
            type: 'participant',
            target: `/speed-date/${partData.id}`
        }
    }

    // 3. FALLBACK: If code is a UUID, try direct participant ID lookup
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)
    if (isUUID) {
        const { data: directPart } = await client
            .schema('m2m')
            .from('franchise_participants')
            .select('id')
            .eq('id', code)
            .maybeSingle()

        if (directPart) {
            return { success: true, target: `/speed-date/${directPart.id}` }
        }
    }

    return { success: false, target: '/' }
})
