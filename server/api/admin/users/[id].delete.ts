import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const id = getRouterParam(event, 'id')

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const userId = user.id || (user as any).sub

    if (!userId) {
        console.error('[Delete User] Invalid session user:', user)
        const keys = user ? Object.keys(user).join(',') : 'null'
        throw createError({
            statusCode: 401,
            statusMessage: `Unauthorized - invalid session. User object keys: ${keys}`
        })
    }

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    const client = await serverSupabaseServiceRole(event)

    console.log('[Delete User] Validating admin access for user:', userId)

    // Verify admin privileges
    // Cast client to any to avoid lint error with schema() if types are strict
    const { data: admin, error: adminError } = await (client as any)
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single()

    let hasAccess = false

    if (adminError || !admin) {
        console.error('[Delete User] m2m.admins check failed:', adminError)

        // Fallback: Check public schema just in case
        const { data: publicAdmin } = await client
            .from('admins')
            .select('role')
            .eq('id', userId)
            .single()

        if (publicAdmin) {
            console.log('[Delete User] Found admin in public schema')
            hasAccess = true
        } else {
            const errorDetails = adminError ? adminError.message : 'Record not found'
            throw createError({
                statusCode: 403,
                statusMessage: `Forbidden: Admin access required. User ${userId} not found in m2m.admins. DB Error: ${errorDetails}`
            })
        }
    } else {
        hasAccess = true
        console.log('[Delete User] Admin access verified')
    }

    if (!hasAccess) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    // Self-deletion check
    if (userId === id) {
        throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })
    }

    // Delete user from auth.users (cascade deletes profile)
    const { error } = await client.auth.admin.deleteUser(id)

    if (error) {
        console.error('Error deleting user:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
