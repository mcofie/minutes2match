import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const userId = user?.id || (user as any)?.sub

    if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event)

    let usePublicSchema = false

    // Find pending deletion request for user in m2m schema
    let { data: existing, error: findError } = await (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle()

    if (findError && (findError.code === '42P01' || findError.message?.includes('schema cache') || findError.message?.includes('does not exist') || findError.message?.includes('not find'))) {
        usePublicSchema = true
        const { data: pubExisting } = await client
            .from('account_deletion_requests')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .maybeSingle()
        existing = pubExisting
    }

    if (!existing) {
        throw createError({
            statusCode: 404,
            statusMessage: 'No pending account deletion request found to cancel.'
        })
    }

    // Update status to cancelled
    let updated = null
    let updateError = null

    if (usePublicSchema) {
        const res = await client
            .from('account_deletion_requests')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()
        updated = res.data
        updateError = res.error
    } else {
        const res = await (client as any)
            .schema('m2m')
            .from('account_deletion_requests')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single()
        updated = res.data
        updateError = res.error
    }

    if (updateError) {
        console.error('[Deletion Request Cancel] Error cancelling request:', updateError)
        throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    console.log(`[Account Deletion Request] User ${userId} cancelled deletion request ${existing.id}`)

    return {
        success: true,
        message: 'Account deletion request has been cancelled.',
        request: updated
    }
})
