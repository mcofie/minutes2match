/**
 * Zend SMS API Utility
 * Centralized helper for sending SMS via Zend (https://www.tryzend.com/docs)
 * 
 * Base URL: https://api.tryzend.com
 * Auth: x-api-key header
 */

const ZEND_BASE_URL = 'https://api.tryzend.com'
const SENDER_ID = 'Mins2Match'

interface ZendSMSResponse {
    id: string
    status: string
    estimated_cost: number
    message: string
}

interface ZendBulkResponse {
    id: string
    status: string
    recipients: number
    estimated_cost: number
    message: string
}

interface ZendOTPSendResponse {
    id: string
    phone_number: string
    app: string
    channel: string
    expiry_minutes: number
    length: number
    status: string
    created_at: string
    expires_at: string
}

interface ZendOTPVerifyResponse {
    success: boolean
    message: string
    verified_at: string
    attempts_remaining: number
}

/**
 * Get Zend API headers with authentication
 */
function getZendHeaders(apiKey: string) {
    return {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
    }
}

/**
 * Get the absolute webhook URL for delivery status updates
 */
function getWebhookUrl() {
    try {
        const config = useRuntimeConfig()
        const baseUrl = config.public?.baseUrl

        // Skip if no base URL
        if (!baseUrl) return undefined

        // Skip for local environments as Zend cannot reach them and may reject them
        if (baseUrl.includes('localhost') || baseUrl.includes('0.0.0.0') || baseUrl.includes('127.0.0.1')) {
            console.log('[Zend] Skipping webhook_url for local environment')
            return undefined
        }

        // Ensure it starts with http
        if (!baseUrl.startsWith('http')) return undefined

        return `${baseUrl}/api/webhooks/zend-status`
    } catch (e) {
        return undefined
    }
}

/**
 * Send a single SMS via Zend
 */
export async function sendZendSMS(
    apiKey: string,
    to: string,
    body: string,
    options: {
        priority?: 'low' | 'normal' | 'high' | 'urgent',
        deliveryPriority?: 'speed' | 'cost'
    } = {}
): Promise<ZendSMSResponse> {
    const webhookUrl = getWebhookUrl()

    return await $fetch<ZendSMSResponse>(`${ZEND_BASE_URL}/messages`, {
        method: 'POST',
        headers: getZendHeaders(apiKey),
        body: {
            to,
            body,
            preferred_channels: ['sms'],
            sender_id: SENDER_ID,
            priority: options.priority || 'normal',
            ...(options.deliveryPriority ? { delivery_priority: options.deliveryPriority } : {}),
            ...(webhookUrl ? { webhook_url: webhookUrl } : {})
        }
    })
}

/**
 * Send bulk SMS via Zend
 */
export async function sendZendBulkSMS(
    apiKey: string,
    messages: Array<{ to: string; body: string }>,
    options: {
        priority?: 'low' | 'normal' | 'high' | 'urgent',
        deliveryPriority?: 'speed' | 'cost'
    } = {}
): Promise<ZendBulkResponse> {
    const webhookUrl = getWebhookUrl()

    return await $fetch<ZendBulkResponse>(`${ZEND_BASE_URL}/messages/bulk`, {
        method: 'POST',
        headers: getZendHeaders(apiKey),
        body: {
            messages,
            preferred_channels: ['sms'],
            fallback_enabled: false,
            priority: options.priority || 'normal',
            ...(options.deliveryPriority ? { delivery_priority: options.deliveryPriority } : {}),
            ...(webhookUrl ? { webhook_url: webhookUrl } : {})
        }
    })
}

/**
 * Send OTP via ZendOTP
 */
export async function sendZendOTP(
    apiKey: string,
    phoneNumber: string,
    expiry: number = 5,
    length: number = 6
): Promise<ZendOTPSendResponse> {
    return await $fetch<ZendOTPSendResponse>(`${ZEND_BASE_URL}/otp/send`, {
        method: 'POST',
        headers: getZendHeaders(apiKey),
        body: {
            phone_number: phoneNumber,
            app: 'minutes2match',
            channel: 'sms',
            expiry,
            length
        }
    })
}

/**
 * Verify OTP via ZendOTP
 */
export async function verifyZendOTP(
    apiKey: string,
    otpId: string,
    code: string
): Promise<ZendOTPVerifyResponse> {
    return await $fetch<ZendOTPVerifyResponse>(`${ZEND_BASE_URL}/otp/${otpId}/verify`, {
        method: 'POST',
        headers: getZendHeaders(apiKey),
        body: { code }
    })
}

export { ZEND_BASE_URL, SENDER_ID }
export type { ZendSMSResponse, ZendBulkResponse, ZendOTPSendResponse, ZendOTPVerifyResponse }
