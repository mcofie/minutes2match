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

    // Fetch deletion request
    const { data: delReq, error: reqError } = await (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (reqError || !delReq) {
        throw createError({ statusCode: 444, statusMessage: 'Account deletion request not found' })
    }

    const targetUserId = delReq.user_id

    // Prevent deleting admin self via this endpoint
    if (adminUserId === targetUserId) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account through deletion request approval.' })
    }

    const body = await readBody(event).catch(() => ({})) || {}
    const { admin_notes } = body

    // Check if admin user ID exists in m2m.profiles to satisfy foreign key constraint if present
    const { data: adminProf } = await (client as any)
        .schema('m2m')
        .from('profiles')
        .select('id')
        .eq('id', adminUserId)
        .maybeSingle()

    const processedBy = adminProf?.id ? adminUserId : null

    // Update request status to approved FIRST
    const { error: updateError } = await (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .update({
            status: 'approved',
            admin_notes: admin_notes || 'Approved by admin',
            processed_by: processedBy,
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (updateError) {
        console.error('[Approve Deletion] Failed to update request status:', updateError)
        throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    // Delete user from Supabase auth.users (cascades to profile & user data)
    const { error: deleteError } = await client.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
        console.error(`[Approve Deletion] Auth delete user ${targetUserId} failed:`, deleteError)
        // Note: request record is marked approved, but log error for admin
        throw createError({
            statusCode: 500,
            statusMessage: `Status marked approved, but user auth deletion failed: ${deleteError.message}`
        })
    }

    console.log(`[Approve Deletion] Admin ${adminUserId} approved deletion for user ${targetUserId} (Request ${requestId})`)

    return {
        success: true,
        message: 'Account deletion request approved and user account successfully deleted.'
    }
})
