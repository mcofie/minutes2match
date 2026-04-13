/**
 * Match Auto-Expiry Cron
 * GET /api/cron/expire-matches
 * 
 * Runs periodically (recommended: every 30 minutes) to:
 * 1. Find matches past their expires_at that are still pending/partial
 * 2. Credit the paying user (if any) with GHS refund into M2M Credits
 * 3. Set match status to 'expired'
 * 4. Notify affected users via SMS
 */

import { createClient } from '@supabase/supabase-js'
import { creditUser } from '~/server/utils/credits'
import { notifyUser } from '~/server/utils/notify'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

const CREDIT_ELIGIBLE_PRICE = 15 // Only GHS 15 tier gets credits

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Cron security
    const authHeader = getHeader(event, 'authorization')
    if (authHeader !== `Bearer ${config.cronSecret}`) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[Cron:ExpireMatches] Missing Supabase configuration')
        throw createError({ statusCode: 500, message: 'Server configuration error: SUPABASE_URL or SUPABASE_SERVICE_KEY missing' })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    console.log('[Cron:ExpireMatches] Running match expiry job...')

    const now = new Date()

    // 1. Find all expired matches (past expires_at, still pending or partial)
    // Using '*' to avoid 400 errors if 'amount_paid' columns are missing in some environments
    const { data: expiredMatches, error } = await supabase
        .from('matches')
        .select(`
            *,
            user_1:profiles!matches_user_1_id_fkey(display_name, phone),
            user_2:profiles!matches_user_2_id_fkey(display_name, phone)
        `)
        .in('status', ['pending_payment', 'partial_payment'])
        .lt('expires_at', now.toISOString())

    if (error) {
        console.error('[Cron:ExpireMatches] Query error:', JSON.stringify(error))
        throw createError({ 
            statusCode: 500, 
            message: `Failed to query expired matches: ${error.message}`,
            data: error
        })
    }

    if (!expiredMatches || expiredMatches.length === 0) {
        console.log('[Cron:ExpireMatches] No expired matches found.')
        return { success: true, processed: 0, credited: 0, message: 'No matches expired' }
    }

    console.log(`[Cron:ExpireMatches] Found ${expiredMatches.length} expired matches to process`)

    let processedCount = 0
    let creditedCount = 0
    let totalRefunded = 0

    for (const match of (expiredMatches as any[])) {
        try {
            // Helper to extract profile from object or array
            const getProfile = (p: any): any => {
                if (!p) return null
                return Array.isArray(p) ? p[0] : p
            }

            const user1Profile = getProfile(match.user_1)
            const user2Profile = getProfile(match.user_2)

            // Determine who paid and who didn't
            const user1Paid = match.user_1_paid
            const user2Paid = match.user_2_paid
            
            // Get actual amounts paid (handle potential missing columns gracefully)
            const user1AmountPaid = parseFloat(match.user_1_amount_paid) || 0
            const user2AmountPaid = parseFloat(match.user_2_amount_paid) || 0
            const unlockPrice = parseFloat(match.unlock_price) || 15

            // Credit the paying user if only one person paid (partial_payment)
            // Only apply if they actually paid a positive amount (Free matches don't get refunds)
            if (match.status === 'partial_payment') {
                let payingUserId: string | null = null
                let payingUserName: string | null = null
                let refundAmount = 0

                if (user1Paid && !user2Paid && user1AmountPaid > 0) {
                    payingUserId = match.user_1_id
                    payingUserName = user1Profile?.display_name
                    refundAmount = user1AmountPaid
                } else if (user2Paid && !user1Paid && user2AmountPaid > 0) {
                    payingUserId = match.user_2_id
                    payingUserName = user2Profile?.display_name
                    refundAmount = user2AmountPaid
                }

                if (payingUserId && refundAmount > 0) {
                    // Credit the paying user
                    const creditResult = await creditUser(
                        payingUserId,
                        refundAmount,
                        'match_expired_refund',
                        match.id,
                        `Refund: Match expired — partner did not unlock within 48 hours`
                    )

                    if (creditResult.success) {
                        creditedCount++
                        totalRefunded += refundAmount
                        console.log(`[Cron:ExpireMatches] ✅ Credited ${payingUserName || payingUserId}: GHS ${refundAmount} → Balance: GHS ${creditResult.newBalance}`)

                        // Notify the paying user about their credit
                        try {
                            await notifyUser(payingUserId, 
                                `Hi ${payingUserName || 'there'}! Your match expired because the other person didn't unlock in time. We've credited GHS ${refundAmount} to your M2M wallet. Use it to unlock your next match for free! 💚`,
                                { type: 'generic', smsPriority: 'high' }
                            )
                        } catch (notifErr) {
                            console.error(`[Cron:ExpireMatches] Notification failed for ${payingUserId}:`, notifErr)
                        }
                    } else {
                        console.error(`[Cron:ExpireMatches] ❌ Credit failed for ${payingUserId}:`, creditResult.error)
                    }
                }
            }

            // 2. Set match status to 'expired'
            const { error: updateError } = await supabase
                .from('matches')
                .update({ status: 'expired' })
                .eq('id', match.id)

            if (updateError) {
                console.error(`[Cron:ExpireMatches] Failed to expire match ${match.id}:`, updateError)
                continue
            }

            processedCount++

            // 3. Notify users about the expiry
            try {
                // Notify both users
                if (match.user_1_id) {
                    const msg = (match.user_1_paid && parseFloat(match.user_1_amount_paid as any) > 0) 
                        ? `Your match expired. Your GHS ${match.user_1_amount_paid} has been credited to your M2M wallet. Use it on your next match! 💚`
                        : `A match opportunity expired. Don't miss the next one — unlock faster next time! ⏰`
                    await notifyUser(match.user_1_id, msg, { type: 'generic' }).catch(() => {})
                }
                if (match.user_2_id) {
                    const msg = (match.user_2_paid && parseFloat(match.user_2_amount_paid as any) > 0) 
                        ? `Your match expired. Your GHS ${match.user_2_amount_paid} has been credited to your M2M wallet. Use it on your next match! 💚`
                        : `A match opportunity expired. Don't miss the next one — unlock faster next time! ⏰`
                    await notifyUser(match.user_2_id, msg, { type: 'generic' }).catch(() => {})
                }
            } catch (notifErr) {
                console.error(`[Cron:ExpireMatches] Notification error for match ${match.id}:`, notifErr)
            }

        } catch (matchErr) {
            console.error(`[Cron:ExpireMatches] Error processing match ${match.id}:`, matchErr)
        }
    }

    // Discord summary
    await notifyDiscord({
        title: '⏰ Match Expiry Job Complete',
        description: `Processed ${processedCount} expired matches.`,
        color: DiscordColors.warning,
        fields: [
            { name: 'Total Expired', value: `${processedCount}`, inline: true },
            { name: 'Credits Issued', value: `${creditedCount}`, inline: true },
            { name: 'Credit Amount', value: `GHS ${totalRefunded}`, inline: true }
        ],
        footer: 'M2M Credit System • Auto-Expiry Cron'
    })

    console.log(`[Cron:ExpireMatches] ✅ Done. Processed: ${processedCount}, Credited: ${creditedCount}, Refunded: GHS ${totalRefunded}`)

    return {
        success: true,
        processed: processedCount,
        credited: creditedCount,
        totalCreditAmount: totalRefunded
    }
})
