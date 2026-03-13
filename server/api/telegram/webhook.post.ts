
import { sendTelegramMessage } from '~/server/utils/telegram-bot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  // Verification: Telegram usually sends a secret token in the header if configured during setWebhook
  // But for now, we'll just process the update.
  
  console.log('[Telegram Webhook] Received update:', JSON.stringify(body, null, 2));

  if (!body || !body.message) {
    return { status: 'ignored' };
  }

  const { chat, text } = body.message;
  const chatId = chat.id;

  if (text?.startsWith('/start')) {
    const welcomeMessage = `
👋 *Welcome to Minutes 2 Match!*

Ready to find your vibe? Minutes 2 Match is a science-backed speed dating platform designed for meaningful connections.

Tap the button below to open the app and get started!
    `.trim();

    try {
      await sendTelegramMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Open M2M App',
                web_app: { url: config.public.baseUrl || 'https://minutes2match.com' }
              }
            ],
            [
              {
                text: '📅 View Events',
                web_app: { url: `${config.public.baseUrl}/events` }
              }
            ]
          ]
        }
      });
      console.log('[Telegram Webhook] Welcome message sent to chatId:', chatId);
    } catch (err: any) {
      console.error('[Telegram Webhook] Failed to send welcome message:', err.message);
    }

    return { status: 'success', action: 'welcome_sent' };
  }

  // Handle other commands or messages here
  return { status: 'success' };
});
