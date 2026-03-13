
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage } from '~/server/utils/telegram-bot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  console.log('[Telegram Webhook] Received update:', JSON.stringify(body, null, 2));

  if (!body || !body.message) {
    return { status: 'ignored' };
  }

  const { chat, text, from } = body.message;
  const chatId = chat.id;
  const tgUserId = from?.id;

  if (!text) return { status: 'ignored' };

  // Initialize Supabase Admin
  const supabaseAdmin = createClient(
    config.supabaseUrl || '',
    config.supabaseServiceKey || '',
    { auth: { persistSession: false } }
  );

  // Command Router
  if (text.startsWith('/start')) {
    return handleStart(chatId, config);
  } else if (text.startsWith('/matches')) {
    return handleMatches(chatId, tgUserId, supabaseAdmin, config);
  } else if (text.startsWith('/profile')) {
    return handleProfile(chatId, tgUserId, supabaseAdmin, config);
  } else if (text.startsWith('/events')) {
    return handleEvents(chatId, supabaseAdmin, config);
  } else if (text.startsWith('/help')) {
    return handleHelp(chatId);
  }

  return { status: 'success' };
});

async function handleStart(chatId: number, config: any) {
  const welcomeMessage = `
👋 *Welcome to Minutes 2 Match!*

Ready to find your vibe? Minutes 2 Match is a science-backed speed dating platform designed for meaningful connections.

*Commands:*
/matches - View your latest matches
/profile - See your profile status
/events - Browse upcoming events
/help - Show all commands
  `.trim();

  await sendTelegramMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Launch M2M App', web_app: { url: config.public.baseUrl } }],
        [{ text: '📅 View Events', web_app: { url: `${config.public.baseUrl}/events` } }]
      ]
    }
  });

  return { status: 'success' };
}

async function handleMatches(chatId: number, tgUserId: number, supabase: any, config: any) {
  if (!tgUserId) return { status: 'error' };

  // Find profile
  const { data: profile } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id')
    .eq('telegram_id', tgUserId.toString())
    .single();

  if (!profile) {
    return sendTelegramMessage(chatId, "⚠️ *Account Not Linked*\n\nPlease open the app first to link your Telegram account.", {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '🚀 Open App', web_app: { url: config.public.baseUrl } }]] }
    });
  }

  // Fetch matches with profile names
  const { data: matches } = await supabase
    .schema('m2m')
    .from('matches')
    .select(`
      id, 
      status, 
      match_score,
      user_1:user_1_id(display_name),
      user_2:user_2_id(display_name)
    `)
    .or(`user_1_id.eq.${profile.id},user_2_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!matches || matches.length === 0) {
    return sendTelegramMessage(chatId, "✨ You don't have any matches yet. Keep your profile updated and we'll notify you when someone vibes with you!");
  }

  let msg = "🔥 *Your Latest Matches*\n\n";
  matches.forEach((m: any) => {
    const status = m.status === 'unlocked' ? '✅ Unlocked' : '⏳ Pending';
    const score = m.match_score ? `${m.match_score}%` : '??%';
    msg += `💖 *Match* (${score})\nStatus: ${status}\n\n`;
  });

  msg += "Tap below to view full profiles and start chatting!";

  await sendTelegramMessage(chatId, msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '✨ Open My Match Deck', web_app: { url: `${config.public.baseUrl}/matches` } }]
      ]
    }
  });

  return { status: 'success' };
}

async function handleProfile(chatId: number, tgUserId: number, supabase: any, config: any) {
  if (!tgUserId) return { status: 'error' };

  const { data: profile } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('*')
    .eq('telegram_id', tgUserId.toString())
    .single();

  if (!profile) {
    return sendTelegramMessage(chatId, "❌ You haven't set up your M2M profile yet.", {
      reply_markup: { inline_keyboard: [[{ text: '🚀 Start Vibe Check', web_app: { url: `${config.public.baseUrl}/vibe-check` } }]] }
    });
  }

  const msg = `
👤 *Your M2M Profile*

*Name:* ${profile.display_name}
*Status:* ${profile.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
*Persona:* ${profile.dating_persona?.replace(/_/g, ' ') || 'Not set'}
*Interests:* ${profile.interests?.length || 0} selected

Keep your profile fresh to get better matches!
  `.trim();

  await sendTelegramMessage(chatId, msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⚙️ Edit Profile', web_app: { url: `${config.public.baseUrl}/me` } }]
      ]
    }
  });

  return { status: 'success' };
}

async function handleEvents(chatId: number, supabase: any, config: any) {
  const { data: events } = await supabase
    .schema('m2m')
    .from('events')
    .select('id, title, event_date, location')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3);

  if (!events || events.length === 0) {
    return sendTelegramMessage(chatId, "📅 No upcoming events scheduled right now. Check back soon!");
  }

  let msg = "🗓 *Upcoming Events*\n\n";
  const buttons = [];

  for (const event of events) {
    const date = new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    msg += `📍 *${event.title}*\n📅 ${date} • ${event.location}\n\n`;
    buttons.push([{ text: `🎟 View ${event.title}`, web_app: { url: `${config.public.baseUrl}/events/${event.id}` } }]);
  }

  await sendTelegramMessage(chatId, msg, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: buttons }
  });

  return { status: 'success' };
}

async function handleHelp(chatId: number) {
  const msg = `
🛠 *M2M Bot Commands*

/matches - Show your latest matches and status
/profile - Check your profile verification
/events - See upcoming speed dating events
/start - Return to the welcome menu
/help - Show this message
  `.trim();

  await sendTelegramMessage(chatId, msg, { parse_mode: 'Markdown' });
  return { status: 'success' };
}
