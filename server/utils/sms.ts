/**
 * Global SMS Utility
 * Orchestrates SMS delivery using Hubtel as the primary provider and Zend as the backup logic.
 */
import { sendHubtelSMS } from './hubtel'
import { sendZendSMS } from './zend'
import { createClient } from '@supabase/supabase-js'
import { sendTelegramMessage } from './telegram-bot'

/**
 * Strips all emojis and non-standard characters from a string to ensure SMS compatibility.
 */
export function stripEmojis(text: string): string {
    return text.replace(/[^\p{L}\p{N}\p{P}\p{Z}\^$\n]/gu, '')
}

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
    // Strip emojis for better SMS delivery and character count
    const cleanMessage = stripEmojis(message)

    // Errors tracker
    let hubtelError: string | null = null

const tryTelegram = async () => {
    try {
        const supabase = createClient(
            config.supabaseUrl || '',
            config.supabaseServiceKey || '',
            { auth: { persistSession: false } }
        );

        const { data: profile } = await supabase
            .schema('m2m')
            .from('profiles')
            .select('telegram_id')
            .eq('phone', normalizedPhone)
            .single();

        if (profile?.telegram_id) {
            console.log(`[SMS] User has Telegram linked. Routing message via Telegram Bot for ${normalizedPhone}...`);
            await sendTelegramMessage(profile.telegram_id, cleanMessage);
            return { success: true, provider: 'telegram', id: 'tg_' + Date.now() };
        }
    } catch (err: any) {
        console.warn(`[SMS] Telegram routing failed or unsupported for ${normalizedPhone}: ${err.message}. Falling back to standard SMS...`);
    }
    return null;
}

// 1. Try Telegram First (Fastest, Free, Rich Text)
if (provider !== 'hubtel' && provider !== 'zend') {
    const tgResult = await tryTelegram();
    if (tgResult) return tgResult;
}

    const tryHubtel = async () => {
        if (!config.hubtelClientId || !config.hubtelClientSecret) {
            throw new Error('Hubtel credentials are not configured.')
        }
        const resp = await sendHubtelSMS(config.hubtelClientId, config.hubtelClientSecret, normalizedPhone, cleanMessage)
        return { success: true, provider: 'hubtel', id: resp.MessageId }
    }

    const tryZend = async () => {
        if (!config.zendApiKey) {
            throw new Error('Zend API key is not configured.')
        }
        const resp = await sendZendSMS(config.zendApiKey, normalizedPhone, cleanMessage, { priority: options.priority })
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
