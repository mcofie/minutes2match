import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const requestId = getRouterParam(event, 'id')

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const adminUserId = user.id || (user as any).sub
    if (!requestId) {
        throw createError({ statusCode: 400, statusMessage: 'Request ID is required' })
    }

    const client = await serverSupabaseServiceRole(event)

    // Verify admin privileges
    const { data: admin } = await (client as any)
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', adminUserId)
        .single()

    if (!admin) {
        const { data: publicAdmin } = await client
            .from('admins')
            .select('role')
            .eq('id', adminUserId)
            .single()
        if (!publicAdmin) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
        }
    }

    const body = await readBody(event).catch(() => ({})) || {}
    const { admin_notes } = body

    // Update request status to rejected
    const { data: updated, error: updateError } = await (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .update({
            status: 'rejected',
            admin_notes: admin_notes || 'Request rejected by admin',
            processed_by: adminUserId,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

    if (updateError) {
        console.error('[Reject Deletion] Failed to update request status:', updateError)
        throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    console.log(`[Reject Deletion] Admin ${adminUserId} rejected deletion request ${requestId}`)

    return {
        success: true,
        message: 'Account deletion request rejected.',
        request: updated
    }
})
