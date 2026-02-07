/**
 * Admin API: Request Match Feedback
 * POST /api/admin/request-match-feedback
 * 
 * Sends SMS notifications to matched users requesting feedback on their connections.
 * Can target specific matches or all unlocked matches without recent feedback.
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
    console.log('Running request-match-feedback...')

    // Log body for debugging
    const body = await readBody(event).catch(() => ({}))
    console.log('Request body:', body)

    // Verify admin access
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.sub

    if (!user || !userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // Check if user is admin
    const { data: admin, error: adminError } = await client
        .schema('m2m')
        .from('admins')
        .select('id')
        .eq('id', userId)
        .single()

    if (adminError || !admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // Get request parameters (body already read for logging)
    const dryRun = body.dryRun === true
    const matchIds = body.matchIds as string[] | undefined // Optional: specific match IDs
    const customMessage = body.message as string | undefined
    const feedbackDaysThreshold = body.daysSinceUnlock ?? 3 // Default: request feedback for matches unlocked 3+ days ago

    // Query for matches to notify
    let query = client
        .schema('m2m')
        .from('matches')
        .select(`
            id,
            user_1_id,
            user_2_id,
            unlocked_at,
            feedback_status,
            user_1:profiles!matches_user_1_id_fkey(id, phone, display_name),
            user_2:profiles!matches_user_2_id_fkey(id, phone, display_name)
        `)
        .eq('status', 'unlocked')

    // Filter by specific match IDs if provided
    if (matchIds && matchIds.length > 0) {
        query = query.in('id', matchIds)
    } else {
        // Otherwise, filter by feedback status and unlock date
        query = query.or('feedback_status.is.null,feedback_status.eq.pending')

        // Only notify for matches unlocked at least X days ago
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - feedbackDaysThreshold)
        query = query.lte('unlocked_at', cutoffDate.toISOString())
    }

    const { data: matches, error: matchesError } = await query

    if (matchesError) {
        console.error('Error fetching matches:', matchesError)
        throw createError({ statusCode: 500, message: 'Failed to fetch matches: ' + matchesError.message })
    }

    if (!matches || matches.length === 0) {
        return {
            success: true,
            message: 'No matches found requiring feedback requests',
            totalMatches: 0,
            totalNotifications: 0
        }
    }

    // Build list of users to notify (both parties in each match)
    const usersToNotify: Array<{
        userId: string
        phone: string
        displayName: string
        matchId: string
        partnerName: string
    }> = []

    for (const match of matches) {
        // User 1
        if (match.user_1?.phone) {
            usersToNotify.push({
                userId: match.user_1.id,
                phone: match.user_1.phone,
                displayName: match.user_1.display_name || 'User',
                matchId: match.id,
                partnerName: match.user_2?.display_name || 'your match'
            })
        }
        // User 2
        if (match.user_2?.phone) {
            usersToNotify.push({
                userId: match.user_2.id,
                phone: match.user_2.phone,
                displayName: match.user_2.display_name || 'User',
                matchId: match.id,
                partnerName: match.user_1?.display_name || 'your match'
            })
        }
    }

    console.log(`Found ${matches.length} matches, ${usersToNotify.length} users to notify`)

    // If dry run, just return the list
    if (dryRun) {
        return {
            success: true,
            dryRun: true,
            totalMatches: matches.length,
            totalNotifications: usersToNotify.length,
            users: usersToNotify.map(u => ({
                phone: u.phone,
                displayName: u.displayName,
                matchId: u.matchId,
                partnerName: u.partnerName
            }))
        }
    }

    // Send SMS notifications
    const config = useRuntimeConfig()

    if (!config.hubtelClientId || !config.hubtelClientSecret) {
        throw createError({ statusCode: 500, message: 'Hubtel credentials not configured' })
    }

    const authToken = Buffer.from(
        `${config.hubtelClientId}:${config.hubtelClientSecret}`
    ).toString('base64')

    const broadcastId = randomUUID()
    const results: Array<{ phone: string; status: 'sent' | 'failed'; error?: string }> = []

    for (const userToNotify of usersToNotify) {
        // Build direct link to the specific connection
        const connectionUrl = `minutes2match.com/me/connection/${userToNotify.matchId}`

        // Default message with direct link
        const defaultMessage = `Hey ${userToNotify.displayName}! How's it going with ${userToNotify.partnerName}? Let us know here: ${connectionUrl}`

        // Use custom message if provided, otherwise default
        let message = customMessage || defaultMessage
        message = message.replace('{name}', userToNotify.displayName)
        message = message.replace('{partner}', userToNotify.partnerName)
        message = message.replace('{link}', connectionUrl)

        try {
            await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    From: 'M2Match',
                    To: userToNotify.phone,
                    Content: message
                }
            })

            // Log to sms_history
            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: userToNotify.userId,
                    recipient_phone: userToNotify.phone,
                    recipient_name: userToNotify.displayName,
                    message,
                    status: 'sent',
                    broadcast_id: broadcastId,
                    sent_by: userId
                })

            results.push({ phone: userToNotify.phone, status: 'sent' })
        } catch (error: any) {
            console.error(`Failed to send SMS to ${userToNotify.phone}:`, error)

            // Log failure
            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: userToNotify.userId,
                    recipient_phone: userToNotify.phone,
                    recipient_name: userToNotify.displayName,
                    message,
                    status: 'failed',
                    broadcast_id: broadcastId,
                    sent_by: userId
                })

            results.push({ phone: userToNotify.phone, status: 'failed', error: error.message })
        }
    }

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    return {
        success: true,
        broadcastId,
        totalMatches: matches.length,
        totalNotifications: usersToNotify.length,
        sent: sentCount,
        failed: failedCount,
        results
    }
})
