import { createClient } from '@supabase/supabase-js'

/**
 * Credit System Utility
 * Handles all credit balance operations with transactional safety.
 */

export interface CreditResult {
    success: boolean
    newBalance: number
    transactionId?: string
    error?: string
}

interface CreditRpcRow {
    success: boolean
    new_balance: number | string
    transaction_id?: string | null
    error?: string | null
}

function getSupabase() {
    const config = useRuntimeConfig()
    return createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })
}

/**
 * Get or create a user's credit balance record.
 */
export async function getUserBalance(userId: string): Promise<number> {
    const supabase = getSupabase()

    if (!userId || userId === 'undefined') {
        console.warn('[Credits] getUserBalance called with invalid userId:', userId)
        return 0
    }

    const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('[Credits] Error fetching balance:', error)
        return 0
    }

    return data?.balance ? parseFloat(data.balance) : 0
}

/**
 * Ensure a credit record exists for a user (upsert pattern).
 */
async function ensureCreditRecord(userId: string): Promise<void> {
    const supabase = getSupabase()

    if (!userId || userId === 'undefined') return

    const { data: existing } = await supabase
        .from('user_credits')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

    if (!existing) {
        await supabase
            .from('user_credits')
            .insert({ user_id: userId, balance: 0 })
    }
}

/**
 * Credit a user's balance (add funds).
 * Used when: match expires and paying user gets refunded.
 */
export async function creditUser(
    userId: string,
    amount: number,
    reason: 'match_expired_refund' | 'admin_adjustment' | 'promotional_credit' | 'wallet_topup',
    referenceId?: string,
    description?: string
): Promise<CreditResult> {
    if (!userId || userId === 'undefined') {
        return { success: false, newBalance: 0, error: 'Invalid User ID' }
    }

    if (amount <= 0) {
        return { success: false, newBalance: 0, error: 'Amount must be positive' }
    }

    try {
        const supabase = getSupabase()
        const { data, error } = await (supabase as any).rpc('apply_credit_transaction', {
            p_user_id: userId,
            p_amount: amount,
            p_type: 'credit',
            p_reason: reason,
            p_reference_id: referenceId || null,
            p_description: description || `Credit: ${reason}`
        })

        if (error) {
            console.error('[Credits] Credit RPC failed:', error)
            const currentBalance = await getUserBalance(userId)
            return { success: false, newBalance: currentBalance, error: error.message }
        }

        const row = (Array.isArray(data) ? data[0] : data) as CreditRpcRow | undefined
        const newBalance = Number(row?.new_balance || 0)

        if (!row?.success) {
            return {
                success: false,
                newBalance,
                error: row?.error || 'Credit transaction failed'
            }
        }

        console.log(`[Credits] ✅ Credited ${userId}: +GHS ${amount} → GHS ${newBalance} (${reason})`)

        return {
            success: true,
            newBalance,
            transactionId: row?.transaction_id || undefined
        }

    } catch (err: any) {
        console.error('[Credits] Unexpected error in creditUser:', err)
        return { success: false, newBalance: 0, error: err.message }
    }
}

/**
 * Debit a user's balance (spend credits).
 * Used when: user unlocks a match with credits.
 */
export async function debitUser(
    userId: string,
    amount: number,
    reason: 'match_unlock_spend',
    referenceId?: string,
    description?: string
): Promise<CreditResult> {
    if (!userId || userId === 'undefined') {
        return { success: false, newBalance: 0, error: 'Invalid User ID' }
    }

    if (amount <= 0) {
        return { success: false, newBalance: 0, error: 'Amount must be positive' }
    }

    try {
        const supabase = getSupabase()
        const { data, error } = await (supabase as any).rpc('apply_credit_transaction', {
            p_user_id: userId,
            p_amount: amount,
            p_type: 'debit',
            p_reason: reason,
            p_reference_id: referenceId || null,
            p_description: description || `Debit: ${reason}`
        })

        if (error) {
            console.error('[Credits] Debit RPC failed:', error)
            const currentBalance = await getUserBalance(userId)
            return { success: false, newBalance: currentBalance, error: error.message }
        }

        const row = (Array.isArray(data) ? data[0] : data) as CreditRpcRow | undefined
        const newBalance = Number(row?.new_balance || 0)

        if (!row?.success) {
            return {
                success: false,
                newBalance,
                error: row?.error || 'Credit debit failed'
            }
        }

        console.log(`[Credits] 💸 Debited ${userId}: -GHS ${amount} → GHS ${newBalance} (${reason})`)

        return {
            success: true,
            newBalance,
            transactionId: row?.transaction_id || undefined
        }

    } catch (err: any) {
        console.error('[Credits] Unexpected error in debitUser:', err)
        return { success: false, newBalance: 0, error: err.message }
    }
}
