
import { setTelegramWebhook } from '~/server/utils/telegram-bot';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  // Basic security to prevent accidental/malicious resets
  const secret = query.secret;
  if (!secret || secret !== config.cronSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const baseUrl = config.public.baseUrl;
  if (!baseUrl) {
    throw createError({ statusCode: 400, statusMessage: 'BASE_URL not configured' });
  }

  const webhookUrl = `${baseUrl}/api/telegram/webhook`;
  
  try {
    const result: any = await setTelegramWebhook(webhookUrl);
    return {
      success: true,
      webhook_url: webhookUrl,
      telegram_response: result
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
});
