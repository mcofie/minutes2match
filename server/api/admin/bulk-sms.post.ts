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
    phone: string
    name?: string
}

interface SMSResult {
    phone: string
    success: boolean
    messageId?: string
    error?: string
}

// Max recipients per bulk API call (Zend may have its own limits)
const BULK_BATCH_SIZE = 100

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

    // Fallback for primary developer if not in DB yet
    const isDevAdmin = user.email === 'maxcofie@gmail.com'

    if (!adminRecord && !isDevAdmin) {
        console.warn(`[Admin] Denied access to ${user.email} (${user.id})`)
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    if (isDevAdmin && !adminRecord) {
        console.log(`[Admin] Developer bypass granted for ${user.email}`)
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

    if (recipients.length > 500) {
        throw createError({ statusCode: 400, message: 'Maximum 500 recipients per batch' })
    }

    // Validate Zend credentials
    if (!config.zendApiKey) {
        throw createError({ statusCode: 500, message: 'Zend API key not configured' })
    }

    console.log(`[Bulk SMS] Starting batch of ${recipients.length} messages via Zend`)

    // Process messages - use Zend bulk API in batches
    const results: SMSResult[] = []
    let successCount = 0
    let failCount = 0

    // Prepare all messages with cleaned phone numbers and personalized content
    const preparedMessages = recipients.map(recipient => {
        let phone = recipient.phone.replace(/\s+/g, '').replace(/^0+/, '')
        if (!phone.startsWith('+')) {
            phone = '+233' + phone.replace(/^233/, '')
        }

        let personalizedMessage = message
        if (recipient.name) {
            personalizedMessage = message.replace(/\{name\}/g, recipient.name)
        }

        // Strip emojis as requested
        personalizedMessage = stripEmojis(personalizedMessage)

        return { phone, body: personalizedMessage, originalPhone: recipient.phone }
    })

    // Send in batches using Zend bulk API
    for (let batchStart = 0; batchStart < preparedMessages.length; batchStart += BULK_BATCH_SIZE) {
        const batch = preparedMessages.slice(batchStart, batchStart + BULK_BATCH_SIZE)

        try {
            const bulkMessages = batch.map(m => ({ to: m.phone, body: m.body }))
            await sendZendBulkSMS(config.zendApiKey, bulkMessages, { priority: 'normal' })

            // Mark all in batch as successful
            for (const msg of batch) {
                results.push({ phone: msg.originalPhone, success: true })
                successCount++
            }

            console.log(`[Bulk SMS] Batch ${batchStart + 1}-${batchStart + batch.length} sent successfully`)
        } catch (bulkError: any) {
            console.warn(`[Bulk SMS] Bulk send failed for batch, falling back to individual sends...`, bulkError?.message)

            // Fallback: send individually
            for (const msg of batch) {
                try {
                    const response = await sendZendSMS(config.zendApiKey, msg.phone, msg.body, { priority: 'normal' })
                    results.push({ phone: msg.originalPhone, success: true, messageId: response.id })
                    successCount++
                } catch (error: any) {
                    console.error(`[Bulk SMS] Failed to send to ${msg.phone}:`, error.message)
                    results.push({
                        phone: msg.originalPhone,
                        success: false,
                        error: error.data?.message || error.message || 'Failed to send'
                    })
                    failCount++
                }

                // Small delay between individual sends
                await delay(200)
            }
        }

        // Delay between batches
        if (batchStart + BULK_BATCH_SIZE < preparedMessages.length) {
            await delay(500)
        }
    }

    // Log progress
    console.log(`[Bulk SMS] Completed: ${successCount} success, ${failCount} failed out of ${recipients.length}`)

    return {
        success: true,
        summary: {
            total: recipients.length,
            sent: successCount,
            failed: failCount
        },
        results
    }
})
