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

    console.log(`[Bulk SMS] Starting batch of ${recipients.length} messages via orchestrated providers`)

    // Process messages - use unified sendSMS for Hubtel primary + Zend fallback
    const results: SMSResult[] = []
    let successCount = 0
    let failCount = 0

    // Process in batches of 10 to avoid overwhelming providers or timing out
    const EXECUTION_BATCH_SIZE = 10

    for (let i = 0; i < recipients.length; i += EXECUTION_BATCH_SIZE) {
        const batch = recipients.slice(i, i + EXECUTION_BATCH_SIZE)

        const batchPromises = batch.map(async (recipient) => {
            if (!recipient.phone) {
                return { phone: 'unknown', success: false, error: 'No phone number' }
            }

            try {
                // Use the unified sendSMS utility which handles:
                // 1. Normalization
                // 2. Hubtel Primary
                // 3. Zend Fallback
                // 4. Emoji stripping
                const personalizedMessage = recipient.name
                    ? message.replace(/\{name\}/g, recipient.name)
                    : message

                const result = await sendSMS(recipient.phone, personalizedMessage, { priority: 'normal' })

                return {
                    phone: recipient.phone,
                    success: true,
                    messageId: result.id,
                    provider: result.provider
                }
            } catch (error: any) {
                console.error(`[Bulk SMS] Failed to send to ${recipient.phone}:`, error.message)
                return {
                    phone: recipient.phone,
                    success: false,
                    error: error.message || 'Failed to send'
                }
            }
        })

        const batchResults = await Promise.all(batchPromises)

        for (const res of batchResults) {
            results.push(res)
            if (res.success) {
                successCount++
            } else {
                failCount++
            }
        }

        // Small delay between execution batches
        if (i + EXECUTION_BATCH_SIZE < recipients.length) {
            await delay(200)
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
