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

    const supabase = getSupabase()

    try {
        await ensureCreditRecord(userId)

        // Fetch current balance
        const { data: current } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single()

        const currentBalance = current ? parseFloat(current.balance) : 0
        const newBalance = Math.round((currentBalance + amount) * 100) / 100

        // Update balance
        const { error: updateError } = await supabase
            .from('user_credits')
            .update({ balance: newBalance })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[Credits] Balance update failed:', updateError)
            return { success: false, newBalance: currentBalance, error: updateError.message }
        }

        // Record transaction
        const { data: txn, error: txnError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount,
                type: 'credit',
                reason,
                reference_id: referenceId || null,
                description: description || `Credit: ${reason}`,
                balance_after: newBalance
            })
            .select('id')
            .single()

        if (txnError) {
            console.error('[Credits] Transaction log failed:', txnError)
        }

        console.log(`[Credits] ✅ Credited ${userId}: +GHS ${amount} → GHS ${newBalance} (${reason})`)

        return {
            success: true,
            newBalance,
            transactionId: txn?.id
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

    const supabase = getSupabase()

    try {
        await ensureCreditRecord(userId)

        // Fetch current balance
        const { data: current } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single()

        const currentBalance = current ? parseFloat(current.balance) : 0

        if (currentBalance < amount) {
            return {
                success: false,
                newBalance: currentBalance,
                error: `Insufficient balance. Have GHS ${currentBalance}, need GHS ${amount}`
            }
        }

        const newBalance = Math.round((currentBalance - amount) * 100) / 100

        // Update balance
        const { error: updateError } = await supabase
            .from('user_credits')
            .update({ balance: newBalance })
            .eq('user_id', userId)

        if (updateError) {
            console.error('[Credits] Balance debit failed:', updateError)
            return { success: false, newBalance: currentBalance, error: updateError.message }
        }

        // Record transaction
        const { data: txn, error: txnError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount,
                type: 'debit',
                reason,
                reference_id: referenceId || null,
                description: description || `Debit: ${reason}`,
                balance_after: newBalance
            })
            .select('id')
            .single()

        if (txnError) {
            console.error('[Credits] Transaction log failed:', txnError)
        }

        console.log(`[Credits] 💸 Debited ${userId}: -GHS ${amount} → GHS ${newBalance} (${reason})`)

        return {
            success: true,
            newBalance,
            transactionId: txn?.id
        }

    } catch (err: any) {
        console.error('[Credits] Unexpected error in debitUser:', err)
        return { success: false, newBalance: 0, error: err.message }
    }
}
