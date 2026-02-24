/**
 * Admin Bulk SMS API
 * POST /api/admin/bulk-sms
 * 
 * Sends SMS messages to multiple recipients with proper throttling and retry logic.
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

// Delay between SMS sends to avoid rate limiting from Hubtel
const DELAY_BETWEEN_SMS_MS = 500 // 500ms = max 120 SMS/minute

// Max retries per message
const MAX_RETRIES = 2

async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function sendSingleSMS(
    to: string,
    message: string,
    authToken: string,
    retryCount = 0
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const response = await $fetch<{ MessageId: string; Status: number }>(
            'https://smsc.hubtel.com/v1/messages/send',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    From: 'M2Match',
                    To: to,
                    Content: message
                }
            }
        )

        return {
            success: true,
            messageId: response.MessageId
        }
    } catch (error: any) {
        console.error(`[Bulk SMS] Failed to send to ${to}:`, error.message)

        // Retry logic for transient errors
        if (retryCount < MAX_RETRIES) {
            console.log(`[Bulk SMS] Retrying ${to} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`)
            await delay(1000 * (retryCount + 1)) // Exponential backoff
            return sendSingleSMS(to, message, authToken, retryCount + 1)
        }

        return {
            success: false,
            error: error.data?.message || error.message || 'Failed to send'
        }
    }
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

    if (!adminRecord) {
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

    if (recipients.length > 500) {
        throw createError({ statusCode: 400, message: 'Maximum 500 recipients per batch' })
    }

    // Validate Hubtel credentials
    if (!config.hubtelClientId || !config.hubtelClientSecret) {
        throw createError({ statusCode: 500, message: 'Hubtel credentials not configured' })
    }

    const authToken = Buffer.from(
        `${config.hubtelClientId}:${config.hubtelClientSecret}`
    ).toString('base64')

    console.log(`[Bulk SMS] Starting batch of ${recipients.length} messages`)

    // Process messages with throttling
    const results: SMSResult[] = []
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i]

        // Clean phone number
        let phone = recipient.phone.replace(/\s+/g, '').replace(/^0+/, '')
        if (!phone.startsWith('+')) {
            phone = '+233' + phone.replace(/^233/, '')
        }

        // Personalize message if name is provided
        let personalizedMessage = message
        if (recipient.name) {
            personalizedMessage = message.replace(/\{name\}/g, recipient.name)
        }

        // Send SMS
        const result = await sendSingleSMS(phone, personalizedMessage, authToken)

        results.push({
            phone: recipient.phone,
            ...result
        })

        if (result.success) {
            successCount++
        } else {
            failCount++
        }

        // Log progress
        if ((i + 1) % 10 === 0) {
            console.log(`[Bulk SMS] Progress: ${i + 1}/${recipients.length} (${successCount} success, ${failCount} failed)`)
        }

        // Delay before next SMS
        if (i < recipients.length - 1) {
            await delay(DELAY_BETWEEN_SMS_MS)
        }
    }

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
