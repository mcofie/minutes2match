/**
 * Global SMS Utility
 * Orchestrates SMS delivery using Hubtel as the primary provider and Zend as the backup logic.
 */
import { sendHubtelSMS } from './hubtel'
import { sendZendSMS } from './zend'

export async function sendSMS(
    to: string,
    message: string,
    options: {
        provider?: 'hubtel' | 'zend',
        priority?: 'low' | 'normal' | 'high' | 'urgent',
    } = {}
) {
    const config = useRuntimeConfig()
    const { provider } = options

    // Ensure the number is nicely normalized
    const normalizedPhone = normalizeGhanaPhone(to)

    // Errors tracker
    let hubtelError: string | null = null

    const tryHubtel = async () => {
        if (!config.hubtelClientId || !config.hubtelClientSecret) {
            throw new Error('Hubtel credentials are not configured.')
        }
        const resp = await sendHubtelSMS(config.hubtelClientId, config.hubtelClientSecret, normalizedPhone, message)
        return { success: true, provider: 'hubtel', id: resp.MessageId }
    }

    const tryZend = async () => {
        if (!config.zendApiKey) {
            throw new Error('Zend API key is not configured.')
        }
        const resp = await sendZendSMS(config.zendApiKey, normalizedPhone, message, { priority: options.priority })
        return { success: true, provider: 'zend', id: resp.id }
    }

    // Explicit fallback or forced explicitly to use Zend
    if (provider === 'zend') {
        console.log(`[SMS] Explicitly routed to Zend for ${normalizedPhone}...`)
        return await tryZend()
    }

    // Primary: Hubtel
    try {
        console.log(`[SMS] Attempting Hubtel for ${normalizedPhone}...`)
        return await tryHubtel()
    } catch (e: any) {
        console.warn(`[SMS] Hubtel failed for ${normalizedPhone}: ${e.message}. Falling back to Zend...`)
        try {
            return await tryZend()
        } catch (zendError: any) {
            console.error(`[SMS] BOTH providers failed for ${normalizedPhone}. Zend Error:`, zendError.message)
            throw new Error(`SMS delivery strictly failed. Hubtel: ${e.message} | Zend: ${zendError.message}`)
        }
    }
}
