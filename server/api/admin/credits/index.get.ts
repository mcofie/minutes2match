import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * GET /api/admin/credits
 * Returns all credit transactions across all users.
 */
export default defineEventHandler(async (event) => {
    const client = serverSupabaseServiceRole(event) as any

    const { page = 1, pageSize = 50, type = 'credit', reason = '', search = '' } = getQuery(event)
    const from = (Number(page) - 1) * Number(pageSize)
    const to = from + Number(pageSize) - 1

    try {
        let query = client
            .schema('m2m')
            .from('credit_transactions')
            .select(`
                id,
                amount,
                type,
                reason,
                description,
                balance_after,
                created_at,
                reference_id,
                user_id,
                user:profiles!user_id(id, display_name, phone, photo_url)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })

        if (type) {
            query = query.eq('type', type)
        }

        if (reason) {
            query = query.eq('reason', reason)
        }

        const { data, count, error } = await query.range(from, to)

        if (error) throw error

        let transactions = data || []

        if (search) {
            const lowerSearch = String(search).toLowerCase()
            transactions = transactions.filter((tx: any) => {
                const name = tx.user?.display_name?.toLowerCase() || ''
                const phone = tx.user?.phone?.toLowerCase() || ''
                return name.includes(lowerSearch) || phone.includes(lowerSearch)
            })
        }

        // Calculate global stats (cumulative credits issued)
        const { data: globalStats } = await client
            .schema('m2m')
            .from('credit_transactions')
            .select('amount')
            .eq('type', 'credit')

        const totalCreditsIssued = globalStats?.reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0

        return {
            transactions,
            total: count || 0,
            totalCreditsIssued
        }
    } catch (err: any) {
        console.error('[Admin Credits API] Error:', err)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch credit transactions'
        })
    }
})
