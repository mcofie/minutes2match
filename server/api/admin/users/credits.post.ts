import { serverSupabaseUser, serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'
import { creditUser, debitUser } from '~/server/utils/credits'

/**
 * Admin Credit Adjustment Endpoint
 * POST /api/admin/users/credits
 * 
 * Allows admins to reward or deduct credits from users.
 */
export default defineEventHandler(async (event) => {
    // 1. Verify Admin Session
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 1.5. Establish clients
    const userClient = await serverSupabaseClient(event)
    const serviceClient = serverSupabaseServiceRole(event)
    
    console.log('[Admin Credits API] Verifying admin status for:', user.id)

    // Check admin status using the user's own client (matching middleware logic)
    const { data: admin, error: adminError } = await userClient
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const isDevAdmin = user.email === 'maxcofie@gmail.com'

    if ((adminError || !admin) && !isDevAdmin) {
        console.error('[Admin Credits API] Admin check failed:', adminError || 'Admin record not found')
        throw createError({ statusCode: 403, message: 'Forbidden: Admin access required' })
    }

    const adminRole = admin ? (admin as any).role : 'super_admin'
    console.log('[Admin Credits API] Admin verified as:', adminRole)

    // 2. Parse Body
    const body = await readBody(event)
    const { userId, amount, type, reason, description } = body

    if (!userId || !amount || !type || !reason) {
        throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    if (amount <= 0) {
        throw createError({ statusCode: 400, message: 'Amount must be greater than zero' })
    }

    // 3. Process Adjustment
    let result
    if (type === 'credit') {
        result = await creditUser(
            userId,
            amount,
            reason === 'reward' ? 'promotional_credit' : 'admin_adjustment',
            undefined,
            description || `Admin adjustment: ${reason}`
        )
    } else if (type === 'debit') {
        result = await debitUser(
            userId,
            amount,
            'match_unlock_spend', // We reuse this for now or could add 'admin_deduction' if needed
            undefined,
            description || `Admin deduction: ${reason}`
        )
    } else {
        throw createError({ statusCode: 400, message: 'Invalid adjustment type' })
    }

    if (!result.success) {
        throw createError({ 
            statusCode: 500, 
            message: result.error || 'Failed to adjust credits' 
        })
    }

    return {
        success: true,
        newBalance: result.newBalance,
        message: `Successfully ${type}ed GHS ${amount} to user ${userId}`
    }
})
