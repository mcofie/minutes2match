import crypto from 'node:crypto';

/**
 * Verifies the data received from the Telegram Mini App.
 * @param initData The raw initData string from the Telegram WebApp.
 * @param botToken The bot token from BotFather.
 * @returns boolean indicating if the data is valid.
 */
export function verifyTelegramData(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;

    // Remove hash from the params to check the rest
    urlParams.delete('hash');

    // Create a sorted string of key=value pairs joined by newlines
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Generate the secret key using the bot token and a static string "WebAppData"
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Generate the HMAC-SHA256 signature of the data check string
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify if the calculated hash matches the one from Telegram
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram verification error:', error);
    return false;
  }
}

/**
 * Parses the initData string into a usable object.
 */
export function parseTelegramInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const data: Record<string, any> = {};
  
  for (const [key, value] of params.entries()) {
    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }
  
  return data;
}
