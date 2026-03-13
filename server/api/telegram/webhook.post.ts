
import { sendTelegramMessage } from '~/server/utils/telegram-bot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  // Verification: Telegram usually sends a secret token in the header if configured during setWebhook
  // But for now, we'll just process the update.
  
  if (!body || !body.message) {
    return { status: 'ignored' };
  }

  const { chat, text, from } = body.message;
  const chatId = chat.id;

  if (text === '/start') {
    const welcomeMessage = `
👋 *Welcome to Minutes 2 Match!*

Ready to find your vibe? Minutes 2 Match is a science-backed speed dating platform designed for meaningful connections.

Tap the button below to open the app and get started!
    `.trim();

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

    return { status: 'success', action: 'welcome_sent' };
  }

  // Handle other commands or messages here
  return { status: 'success' };
});
