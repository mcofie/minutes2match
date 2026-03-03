/**
 * Zend SMS API Server Route
 * POST /api/send-sms
 * 
 * SECURITY: This route keeps Zend API keys server-side only
 * Rate limited for OTP/user-facing use. Admins should use /api/admin/bulk-sms
 * 
 * Features:
 * - Phone normalization (accepts 0244..., +233244..., 233244...)
 * - Auto-retry once after 3s on failure
 */

// Rate limited for OTP/user-facing use. Admins should use /api/admin/bulk-sms

export default defineEventHandler(async (event) => {
    // Rate limit: 3 SMS per minute per IP to prevent OTP abuse
    // For bulk messaging, use /api/admin/bulk-sms which has no rate limit
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

    if (!config.zendApiKey) {
        throw createError({
            statusCode: 500,
            message: 'Zend API key not configured'
        })
    }

    // Normalize the phone number
    const normalizedPhone = normalizeGhanaPhone(to)

    // Try sending, retry once after 3s on failure
    try {
        const response = await sendZendSMS(config.zendApiKey, normalizedPhone, message, { priority: 'high' })
        return { success: true, messageId: response.id }
    } catch (firstError: any) {
        console.warn(`[SMS] First attempt failed for ${normalizedPhone}, retrying in 3s...`, firstError?.message)

        // Wait 3 seconds then retry
        await new Promise(resolve => setTimeout(resolve, 3000))

        try {
            const response = await sendZendSMS(config.zendApiKey, normalizedPhone, message, { priority: 'high' })
            console.log(`[SMS] Retry succeeded for ${normalizedPhone}`)
            return { success: true, messageId: response.id, retried: true }
        } catch (retryError: any) {
            console.error(`[SMS] Retry also failed for ${normalizedPhone}:`, retryError?.message)
            throw createError({
                statusCode: 500,
                message: 'Failed to send SMS after retry'
            })
        }
    }
})
