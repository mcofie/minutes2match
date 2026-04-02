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

    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    console.log('[Cron:ExpireMatches] Running match expiry job...')

    const now = new Date()

    // 1. Find all expired matches (past expires_at, still pending or partial)
    const { data: expiredMatches, error } = await supabase
        .from('matches')
        .select(`
            id,
            user_1_id,
            user_2_id,
            user_1_paid,
            user_2_paid,
            unlock_price,
            status,
            expires_at,
            created_at,
            user_1:profiles!matches_user_1_id_fkey(display_name, phone),
            user_2:profiles!matches_user_2_id_fkey(display_name, phone)
        `)
        .in('status', ['pending_payment', 'partial_payment'])
        .lt('expires_at', now.toISOString())

    if (error) {
        console.error('[Cron:ExpireMatches] Query error:', error)
        throw createError({ statusCode: 500, message: 'Failed to query expired matches' })
    }

    if (!expiredMatches || expiredMatches.length === 0) {
        console.log('[Cron:ExpireMatches] No expired matches found.')
        return { success: true, processed: 0, credited: 0 }
    }

    console.log(`[Cron:ExpireMatches] Found ${expiredMatches.length} expired matches to process`)

    let processedCount = 0
    let creditedCount = 0

    for (const match of expiredMatches) {
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
            const unlockPrice = parseFloat(match.unlock_price) || 0

            // Credit the paying user if only one person paid (partial_payment)
            // Only apply to the GHS 15 tier
            if (match.status === 'partial_payment' && unlockPrice === CREDIT_ELIGIBLE_PRICE) {
                let payingUserId: string | null = null
                let payingUserName: string | null = null
                let unpaidUserId: string | null = null

                if (user1Paid && !user2Paid) {
                    payingUserId = match.user_1_id
                    payingUserName = user1Profile?.display_name
                    unpaidUserId = match.user_2_id
                } else if (user2Paid && !user1Paid) {
                    payingUserId = match.user_2_id
                    payingUserName = user2Profile?.display_name
                    unpaidUserId = match.user_1_id
                }

                if (payingUserId) {
                    // Credit the paying user
                    const creditResult = await creditUser(
                        payingUserId,
                        unlockPrice,
                        'match_expired_refund',
                        match.id,
                        `Refund: Match expired — partner did not unlock within 48 hours`
                    )

                    if (creditResult.success) {
                        creditedCount++
                        console.log(`[Cron:ExpireMatches] ✅ Credited ${payingUserName || payingUserId}: GHS ${unlockPrice} → Balance: GHS ${creditResult.newBalance}`)

                        // Notify the paying user about their credit
                        try {
                            await notifyUser(payingUserId, 
                                `Hi ${payingUserName || 'there'}! Your match expired because the other person didn't unlock in time. We've credited GHS ${unlockPrice} to your M2M wallet. Use it to unlock your next match for free! 💚`,
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
                    const msg = match.user_1_paid 
                        ? `Your match expired. Your GHS ${unlockPrice} has been credited to your M2M wallet. Use it on your next match! 💚`
                        : `A match opportunity expired. Don't miss the next one — unlock faster next time! ⏰`
                    await notifyUser(match.user_1_id, msg, { type: 'generic' }).catch(() => {})
                }
                if (match.user_2_id) {
                    const msg = match.user_2_paid 
                        ? `Your match expired. Your GHS ${unlockPrice} has been credited to your M2M wallet. Use it on your next match! 💚`
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
            { name: 'Credit Amount', value: `GHS ${creditedCount * CREDIT_ELIGIBLE_PRICE}`, inline: true }
        ],
        footer: 'M2M Credit System • Auto-Expiry Cron'
    })

    console.log(`[Cron:ExpireMatches] ✅ Done. Processed: ${processedCount}, Credited: ${creditedCount}`)

    return {
        success: true,
        processed: processedCount,
        credited: creditedCount,
        totalCreditAmount: creditedCount * CREDIT_ELIGIBLE_PRICE
    }
})
