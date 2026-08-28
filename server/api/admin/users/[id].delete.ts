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

    // Manually clean up all m2m data for this user before deleting from auth.users
    // This avoids FK constraint issues since not all tables have ON DELETE CASCADE
    const m2m = (client as any).schema('m2m')

    console.log('[Delete User] Cleaning up m2m data for user:', id)

    // Clean up tables that reference auth.users(id) directly (no cascade through profiles)
    const directAuthTables = [
        { table: 'lobby_messages', column: 'sender_id' },
        { table: 'auth_challenges', column: 'user_id' },
        { table: 'user_passkeys', column: 'user_id' },
        { table: 'flash_lobby_intents', column: 'sender_id' },
        { table: 'flash_lobby_intents', column: 'receiver_id' },
        { table: 'user_credits', column: 'user_id' },
        { table: 'credit_transactions', column: 'user_id' },
        { table: 'flash_lobby_sessions', column: 'user_id' },
        { table: 'flash_lobby_reminders', column: 'user_id' },
        { table: 'moderation_actions', column: 'user_id' },
    ]

    for (const { table, column } of directAuthTables) {
        try {
            await m2m.from(table).delete().eq(column, id)
        } catch (e) {
            // Table may not exist, skip
            console.log(`[Delete User] Skipping ${table}.${column}: ${(e as Error).message}`)
        }
    }

    // Nullify nullable FK columns that reference this user (to avoid blocking deletes)
    const nullableFKs = [
        { table: 'matches', column: 'created_by' },
        { table: 'reports', column: 'reviewed_by' },
        { table: 'payment_alerts', column: 'resolved_by' },
        { table: 'moderation_actions', column: 'created_by' },
        { table: 'matches', column: 'feedback_updated_by' },
    ]

    for (const { table, column } of nullableFKs) {
        try {
            await m2m.from(table).update({ [column]: null }).eq(column, id)
        } catch (e) {
            console.log(`[Delete User] Skipping nullify ${table}.${column}: ${(e as Error).message}`)
        }
    }

    // Clean up tables that reference m2m.profiles(id) — delete rows owned by this user
    const profileTables = [
        { table: 'account_deletion_requests', column: 'user_id' },
        { table: 'subscriptions', column: 'user_id' },
        { table: 'notifications', column: 'user_id' },
        { table: 'reports', column: 'reporter_id' },
        { table: 'reports', column: 'reported_user_id' },
        { table: 'match_feedback', column: 'user_id' },
        { table: 'event_scorecards', column: 'voter_user_id' },
        { table: 'event_scorecards', column: 'target_user_id' },
        { table: 'payment_alerts', column: 'user_id' },
        { table: 'sms_history', column: 'recipient_id' },
        { table: 'franchise_applications', column: 'user_id' },
        { table: 'franchise_messages', column: 'from_user_id' },
        { table: 'partner_venue_claims', column: 'user_id' },
        { table: 'referrals', column: 'referrer_id' },
        { table: 'matches', column: 'user_1_id' },
        { table: 'matches', column: 'user_2_id' },
        { table: 'event_bookings', column: 'user_id' },
        { table: 'event_qualifications', column: 'user_id' },
        { table: 'payments', column: 'user_id' },
        { table: 'vibe_answers', column: 'user_id' },
    ]

    for (const { table, column } of profileTables) {
        try {
            await m2m.from(table).delete().eq(column, id)
        } catch (e) {
            console.log(`[Delete User] Skipping ${table}.${column}: ${(e as Error).message}`)
        }
    }

    // Delete profile itself
    try {
        await m2m.from('profiles').delete().eq('id', id)
    } catch (e) {
        console.log(`[Delete User] Skipping profiles: ${(e as Error).message}`)
    }

    // Delete admin record if exists
    try {
        await m2m.from('admins').delete().eq('id', id)
    } catch (e) {
        console.log(`[Delete User] Skipping admins: ${(e as Error).message}`)
    }

    console.log('[Delete User] m2m cleanup complete, deleting auth user:', id)

    // Now delete from auth.users — should succeed since all FK references are gone
    const { error } = await client.auth.admin.deleteUser(id)

    if (error) {
        console.error('Error deleting user:', JSON.stringify(error, null, 2))
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to delete auth user: ${error.message || JSON.stringify(error)}`
        })
    }

    return { success: true }
})
