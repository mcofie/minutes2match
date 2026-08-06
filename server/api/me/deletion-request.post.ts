import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const userId = user?.id || (user as any)?.sub

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event) || {}
    const { reason, details } = body

    const client = serverSupabaseServiceRole(event)

    let usePublicSchema = false

    // Check existing pending request in m2m schema
    let { data: existingPending, error: checkError } = await (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

    if (checkError && (checkError.code === '42P01' || checkError.message?.includes('schema cache') || checkError.message?.includes('does not exist') || checkError.message?.includes('not find'))) {
        usePublicSchema = true
        const { data: pubPending, error: pubCheckError } = await client
            .from('account_deletion_requests')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .maybeSingle()

        if (pubCheckError) {
            console.error('[Deletion Request POST] Table missing in both schemas:', pubCheckError)
            throw createError({
                statusCode: 500,
                statusMessage: 'The account_deletion_requests table has not been created in your Supabase database yet. Please run migration 067_account_deletion_requests.sql in Supabase SQL editor.'
            })
        }
        existingPending = pubPending
    }

    if (existingPending) {
        throw createError({
            statusCode: 400,
            statusMessage: 'You already have a pending account deletion request under review by the back office.'
        })
    }

    // Insert new deletion request
    const insertPayload = {
        user_id: userId,
        reason: reason || 'Not specified',
        details: details || null,
        status: 'pending'
    }

    let request = null
    let insertError = null

    if (usePublicSchema) {
        const res = await client
            .from('account_deletion_requests')
            .insert(insertPayload)
            .select()
            .single()
        request = res.data
        insertError = res.error
    } else {
        const res = await (client as any)
            .schema('m2m')
            .from('account_deletion_requests')
            .insert(insertPayload)
            .select()
            .single()
        request = res.data
        insertError = res.error
    }

    if (insertError) {
        console.error('[Deletion Request POST] Error creating request:', insertError)
        throw createError({ statusCode: 500, statusMessage: insertError.message })
    }

    console.log(`[Account Deletion Request] User ${userId} submitted deletion request ${request.id}`)

    return {
        success: true,
        message: 'Your account deletion request has been submitted to the back office for review.',
        request
    }
})
