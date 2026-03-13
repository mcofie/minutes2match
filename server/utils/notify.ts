
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from './telegram-bot';
import { sendSMS } from './sms';

/**
 * Sends a notification to a specific user.
 * Prioritizes Telegram if the user has a linked account, falls back to SMS.
 */
export async function notifyUser(userId: string, message: string, options: { 
    smsPriority?: 'low' | 'normal' | 'high' | 'urgent',
    telegramOptions?: any 
} = {}) {
    const config = useRuntimeConfig();
    
    // Create admin client to fetch user profile
    const supabaseAdmin = createClient(
        config.supabaseUrl || process.env.SUPABASE_URL || '',
        config.supabaseServiceKey || '',
        { auth: { persistSession: false } }
    );

    // Fetch user profile to check for telegram_id and phone
    const { data: profile, error } = await supabaseAdmin
        .schema('m2m')
        .from('profiles')
        .select('phone, telegram_id')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new Error(`User profile not found: ${userId}`);
    }

    // 1. Try Telegram if available
    if (profile.telegram_id) {
        try {
            console.log(`[Notify] Sending Telegram notification to User ${userId}...`);
            
            // Add a native app button for Telegram users
            const telegramOptions = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🚀 Open M2M App',
                                web_app: { url: config.public.baseUrl || 'https://minutes2match.com' }
                            }
                        ]
                    ]
                },
                ...options.telegramOptions
            };

            await sendTelegramMessage(profile.telegram_id, message, telegramOptions);
            return { provider: 'telegram', success: true };
        } catch (tgError: any) {
            console.warn(`[Notify] Telegram delivery failed for User ${userId}: ${tgError.message}. Falling back to SMS.`);
            // Fallthrough to SMS
        }
    }

    // 2. Fallback to SMS
    console.log(`[Notify] Sending SMS notification to User ${userId} (${profile.phone})...`);
    const smsResult = await sendSMS(profile.phone, message, { priority: options.smsPriority });
    return smsResult;
}
