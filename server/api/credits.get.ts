import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getUserBalance } from '~/server/utils/credits'

/**
 * GET /api/credits
 * Returns the authenticated user's M2M Credit balance and recent transactions.
 */
export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any

    try {
        const balance = await getUserBalance(user.id)

        // Fetch recent transactions
        const { data: transactions } = await client
            .schema('m2m')
            .from('credit_transactions')
            .select('id, amount, type, reason, description, balance_after, created_at, reference_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        return {
            balance,
            transactions: transactions || []
        }
    } catch (err: any) {
        console.error('[Credits API] Error:', err)
        return { balance: 0, transactions: [] }
    }
})
