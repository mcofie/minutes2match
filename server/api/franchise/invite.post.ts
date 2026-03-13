import { serverSupabaseServiceRole } from '#supabase/server'
import { notifyUser } from '~/server/utils/notify'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_id, code } = body
    console.log('[Franchise Invite DEBUG] Request:', { event_id, code })

    if (!event_id || !code) {

        throw createError({ statusCode: 400, message: 'Missing event ID or access code' })
    }

    const client = serverSupabaseServiceRole(event) as any
    const config = useRuntimeConfig()
    const baseUrl = config.public.baseUrl || 'http://localhost:3000'

    // 1. Verify Organizer
    const { data: franchiseEvent, error: authError } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('*')
        .eq('id', event_id)
        .eq('access_code', String(code).trim())
        .single()

    if (authError || !franchiseEvent) {
        throw createError({ statusCode: 403, message: 'Unauthorized access' })
    }

    // 2. Fetch all participants with their names and phones
    const { data: participants, error: partError } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select(`
            *,
            profile:user_id (
                display_name,
                phone
            )
        `)
        .eq('event_id', event_id)

    if (partError || !participants) {
        console.error('[Franchise Invite DEBUG] Fetch Error:', partError)
        throw createError({ statusCode: 500, message: 'Failed to fetch guest list' })
    }


    const results = { sent: 0, failed: 0 }

    // 3. Batch Send Invites
    for (const p of (participants as any[])) {
        const name = p.profile?.display_name || 'Guest'
        const phone = p.profile?.phone
        const linkCode = p.short_code || p.id // Fallback to raw ID if short_code didn't migrate
        const link = `${baseUrl}/s/${linkCode}`


        if (!phone) continue

        const message = `Hi ${name.split(' ')[0]}, welcome to ${franchiseEvent.title}! Open your Digital Match Card here: ${link}. Tap YES/NO for each person you meet.`

        try {
            await notifyUser(p.user_id, message)
            results.sent++
        } catch (err) {
            console.error(`[Franchise Invite] Failed to send to ${phone}:`, err)
            results.failed++
        }
    }

    // 4. Set event to active if it was in draft
    if (franchiseEvent.status === 'draft' && results.sent > 0) {
        await client
            .schema('m2m')
            .from('franchise_events')
            .update({ status: 'active' })
            .eq('id', event_id)
    }

    return {
        success: true,
        stats: results,
        message: `Invitations broadcasted to ${results.sent} guests.`
    }
})
