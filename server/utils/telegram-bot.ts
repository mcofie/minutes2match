
/**
 * Telegram Bot API Utility
 * Used for sending notifications and responding to webhooks.
 */

export async function sendTelegramMessage(chatId: string | number, text: string, options: {
    parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2',
    reply_markup?: any
} = {}) {
    const config = useRuntimeConfig();
    const token = config.telegramBotToken;

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await $fetch<any>(url, {
        method: 'POST',
        body: {
            chat_id: chatId,
            text,
            ...options
        }
    });

    return response;
}

export async function sendTelegramPhoto(chatId: string | number, photoUrl: string, options: {
    caption?: string,
    parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2',
    reply_markup?: any
} = {}) {
    const config = useRuntimeConfig();
    const token = config.telegramBotToken;

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const url = `https://api.telegram.org/bot${token}/sendPhoto`;

    const response = await $fetch<any>(url, {
        method: 'POST',
        body: {
            chat_id: chatId,
            photo: photoUrl,
            ...options
        }
    });

    return response;
}

export async function sendTelegramVideo(chatId: string | number, videoUrl: string, options: {
    caption?: string,
    parse_mode?: 'Markdown' | 'HTML' | 'MarkdownV2',
    reply_markup?: any
} = {}) {
    const config = useRuntimeConfig();
    const token = config.telegramBotToken;

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const url = `https://api.telegram.org/bot${token}/sendVideo`;

    const response = await $fetch<any>(url, {
        method: 'POST',
        body: {
            chat_id: chatId,
            video: videoUrl,
            ...options
        }
    });

    return response;
}

/**
 * Sets the webhook for the Telegram bot.
 */
export async function setTelegramWebhook(url: string): Promise<any> {
    const config = useRuntimeConfig();
    const token = config.telegramBotToken;

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const apiUrl = `https://api.telegram.org/bot${token}/setWebhook`;

    const response = await $fetch<any>(apiUrl, {
        method: 'POST',
        body: { url }
    });

    return response;
}

export async function setTelegramBotCommands(commands: { command: string, description: string }[]) {
    const config = useRuntimeConfig();
    const token = config.telegramBotToken;

    if (!token) {
        throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
    }

    const url = `https://api.telegram.org/bot${token}/setMyCommands`;

    const response = await $fetch<any>(url, {
        method: 'POST',
        body: { commands }
    });

    return response;
}
