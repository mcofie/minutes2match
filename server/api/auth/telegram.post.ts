import { createClient } from '@supabase/supabase-js';
import { verifyTelegramData, parseTelegramInitData } from '~/server/utils/telegram';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { initData } = body;

  if (!initData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing initData',
    });
  }

  // 1. Verify Telegram Data
  const isValid = verifyTelegramData(initData, config.telegramBotToken);
  // Allow bypassing in development for easier testing
  if (!isValid && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Telegram data',
    });
  }

  // 2. Parse User Data
  const parsedData = parseTelegramInitData(initData);
  const tgUser = parsedData.user;

  if (!tgUser || !tgUser.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user data in initData',
    });
  }

  const telegramId = tgUser.id.toString();
  
  // Create admin client
  const supabaseAdmin = createClient(
    config.supabaseUrl || process.env.SUPABASE_URL || '',
    config.supabaseServiceKey || '',
    { auth: { persistSession: false } }
  );

  // 3. Check if user already exists by telegram_id
  let { data: profile, error: profileError } = await supabaseAdmin
    .schema('m2m')
    .from('profiles')
    .select('id, phone, display_name, gender, intent, interested_in')
    .eq('telegram_id', telegramId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('[Telegram Auth] Profile fetch error:', profileError);
  }

  if (profile) {
    // 4. User exists - Log them in (similar to login.post.ts)
    
    // Check if they have completed vibe check
    const { count: vibeAnswerCount } = await supabaseAdmin
        .schema('m2m')
        .from('vibe_answers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id);

    const hasCompletedVibeCheck = !!(
        profile.gender &&
        profile.intent &&
        profile.interested_in &&
        vibeAnswerCount && vibeAnswerCount > 0
    );

    // Get auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id);

    if (authError || !authData.user) {
        throw createError({
            statusCode: 404,
            statusMessage: 'User account not found'
        });
    }

    // Generate temp password
    const tempPassword = `tg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        password: tempPassword,
        email_confirm: true
    });

    return {
      success: true,
      user: tgUser,
      isRegistered: true,
      email: authData.user.email,
      password: tempPassword,
      displayName: profile.display_name,
      hasCompletedVibeCheck
    };
  }

  // 5. User not found - Return info so frontend can handle it
  return {
    success: true,
    user: tgUser,
    isRegistered: false,
    message: 'User not registered with Telegram'
  };
});
