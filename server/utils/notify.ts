
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from './telegram-bot';
import { sendSMS } from './sms';

/**
 * Sends a notification to a specific user.
 * Prioritizes Telegram if the user has a linked account, falls back to SMS.
 */
export async function notifyUser(userId: string, message: string, options: { 
    type?: 'match' | 'event' | 'generic',
    matchId?: string,
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

    // Fetch user profile to check for telegram_id, phone, and active status
    const { data: profile, error } = await supabaseAdmin
        .schema('m2m')
        .from('profiles')
        .select('phone, telegram_id, is_active')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        throw new Error(`User profile not found: ${userId}`);
    }

    // [Incognito Protocol] Suppress non-urgent notifications if user is inactive
    const isUrgent = options.smsPriority === 'urgent' || options.smsPriority === 'high';
    if (!profile.is_active && !isUrgent) {
        console.log(`[Notify] suppressing non-urgent notification for inactive user ${userId}`);
        return { provider: 'none', success: true, suppressed: true };
    }

    // 1. Try Telegram if available
    if (profile.telegram_id) {
        try {
            console.log(`[Notify] Sending Telegram notification to User ${userId}...`);
            
            // Default interactive button
            const defaultKeyboard = [
                [
                    {
                        text: '🚀 Open M2M App',
                        web_app: { url: config.public.baseUrl || 'https://minutes2match.com' }
                    }
                ]
            ];

            // If it's a match, try to send a rich photo card
            if (options.type === 'match' && options.matchId) {
                const { data: match } = await supabaseAdmin
                    .schema('m2m')
                    .from('matches')
                    .select('user_1_id, user_2_id')
                    .eq('id', options.matchId)
                    .single();

                if (match) {
                    const otherUserId = match.user_1_id === userId ? match.user_2_id : match.user_1_id;
                    const { data: otherProfile } = await supabaseAdmin
                        .schema('m2m')
                        .from('profiles')
                        .select('photo_url, display_name')
                        .eq('id', otherUserId)
                        .single();

                    if (otherProfile?.photo_url) {
                        const { sendTelegramPhoto } = await import('./telegram-bot');
                        await sendTelegramPhoto(profile.telegram_id, otherProfile.photo_url, {
                            caption: `🔥 *New Match Alert!*\n\n${message}`,
                            parse_mode: 'Markdown',
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: `👀 View ${otherProfile.display_name}`, web_app: { url: `${config.public.baseUrl}/matches` } }]
                                ]
                            }
                        });
                        return { provider: 'telegram', success: true, rich: true };
                    }
                }
            }
            
            // Standard Text Notification
            const telegramOptions = {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: options.telegramOptions?.reply_markup?.inline_keyboard || defaultKeyboard
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

    // 2. Fallback to SMS (Standard)
    console.log(`[Notify] Sending SMS notification to User ${userId} (${profile.phone})...`);
    const smsResult = await sendSMS(profile.phone, message, { priority: options.smsPriority });
    return smsResult;
}
