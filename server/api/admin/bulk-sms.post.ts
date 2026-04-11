/**
 * Admin Bulk SMS API
 * POST /api/admin/bulk-sms
 * 
 * Sends SMS messages to multiple recipients via Zend bulk API.
 * Requires admin authentication.
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'

interface SMSRecipient {
    id: string
    phone: string
    name?: string
}

interface SMSResult {
    id: string
    phone: string
    success: boolean
    messageId?: string
    error?: string
    provider?: string
}

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default defineEventHandler(async (event) => {
    // 1. Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const config = useRuntimeConfig()
    const supabase = serverSupabaseServiceRole<M2MDatabase>(event)

    // 2. Check admin status in m2m schema
    const { data: adminRecord } = await supabase
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    const isDevAdmin = user.email === 'maxcofie@gmail.com'
    if (!adminRecord && !isDevAdmin) {
        console.warn(`[Admin] Denied access to ${user.email} (${user.id})`)
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // 3. Parse request body
    const body = await readBody(event)
    const { recipients, message } = body as { recipients: SMSRecipient[]; message: string }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw createError({ statusCode: 400, message: 'Recipients array is required' })
    }

    if (!message || typeof message !== 'string') {
        throw createError({ statusCode: 400, message: 'Message is required' })
    }

    if (recipients.length > 1000) {
        throw createError({ statusCode: 400, message: 'Maximum 1000 recipients per batch' })
    }

    console.log(`[Bulk SMS] Starting broadcast to ${recipients.length} recipients...`)

    const broadcastId = crypto.randomUUID()
    const results: SMSResult[] = []
    const historyToInsert: any[] = []
    
    let successCount = 0
    let failCount = 0

    // Process in batches to balance speed and stability
    const BATCH_SIZE = 10
    const INTER_BATCH_DELAY = 150 // ms

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE)
        
        const batchPromises = batch.map(async (recipient) => {
            if (!recipient.phone) {
                return { id: recipient.id, phone: 'unknown', success: false, error: 'No phone number' } as SMSResult
            }

            try {
                const personalizedMessage = recipient.name
                    ? message.replace(/\{name\}/g, recipient.name)
                    : message

                // Use the orchestrator (Telegram -> Hubtel -> Zend)
                const result = await sendSMS(recipient.phone, personalizedMessage, { priority: 'normal' })

                return {
                    id: recipient.id,
                    phone: recipient.phone,
                    success: true,
                    messageId: result.id,
                    provider: result.provider
                } as SMSResult
            } catch (error: any) {
                console.error(`[Bulk SMS] Failed for ${recipient.phone}:`, error.message)
                return {
                    id: recipient.id,
                    phone: recipient.phone,
                    success: false,
                    error: error.message || 'Failed'
                } as SMSResult
            }
        })

        const batchResults = await Promise.all(batchPromises)

        for (let j = 0; j < batchResults.length; j++) {
            const res = batchResults[j]
            const recipient = batch[j]
            
            results.push(res)
            
            if (res.success) successCount++
            else failCount++

            // Prepare history log
            historyToInsert.push({
                recipient_id: recipient.id,
                recipient_phone: recipient.phone,
                recipient_name: recipient.name,
                message: recipient.name ? message.replace(/\{name\}/g, recipient.name) : message,
                status: res.success ? 'sent' : 'failed',
                broadcast_id: broadcastId,
                sent_by: user.id
            })
        }

        // Add a small delay between batches
        if (i + BATCH_SIZE < recipients.length) {
            await delay(INTER_BATCH_DELAY)
        }
    }

    // Bulk Log to DB
    if (historyToInsert.length > 0) {
        console.log(`[Bulk SMS] Logging ${historyToInsert.length} history records...`)
        const { error: logError } = await supabase
            .schema('m2m')
            .from('sms_history')
            .insert(historyToInsert)
        
        if (logError) {
            console.error('[Bulk SMS] Failed to log history:', logError)
        }
    }

    console.log(`[Bulk SMS] Broadcast ${broadcastId} finished: ${successCount} success, ${failCount} failed.`)

    return {
        success: true,
        broadcastId,
        summary: {
            total: recipients.length,
            sent: successCount,
            failed: failCount
        },
        results
    }
})
