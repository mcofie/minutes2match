/**
 * Hubtel SMS API Server Route
 * POST /api/send-sms
 * 
 * SECURITY: This route keeps Hubtel API keys server-side only
 */

import { enforceRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
    // Rate limit: 3 SMS per minute per IP to prevent abuse
    enforceRateLimit(event, {
        maxRequests: 3,
        windowSeconds: 60,
        prefix: 'sms'
    })

    const { to, message } = await readBody(event)

    if (!to || !message) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: to, message'
        })
    }

    const config = useRuntimeConfig()

    if (!config.hubtelClientId || !config.hubtelClientSecret) {
        throw createError({
            statusCode: 500,
            message: 'Hubtel credentials not configured'
        })
    }

    try {
        const authToken = Buffer.from(
            `${config.hubtelClientId}:${config.hubtelClientSecret}`
        ).toString('base64')

        const response = await $fetch<{ MessageId: string; Status: number }>('https://smsc.hubtel.com/v1/messages/send', {
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
        })

        return {
            success: true,
            messageId: response.MessageId
        }
    } catch (error: any) {
        console.error('Hubtel SMS Error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to send SMS'
        })
    }
})
