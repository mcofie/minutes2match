
import { createClient } from '@supabase/supabase-js';
import { sendTelegramMessage, sendTelegramPhoto, sendTelegramVideo, setTelegramBotCommands } from '~/server/utils/telegram-bot';
import { calculatePersona, personas } from '~/server/utils/personas';
import { notifyDiscord, DiscordColors } from '~/server/utils/discord';

// Constants for Conversational Vibe Check
const CORE_QUESTIONS = [
  { 
    key: 'love_language', 
    question: "How do you most feel loved? ❤️", 
    options: ['Words of Affirmation 💬', 'Acts of Service 🛠️', 'Gifts 🎁', 'Quality Time ⏰', 'Physical Touch 🫂'] 
  },
  { 
    key: 'conflict_style', 
    question: "When we disagree, I prefer to... 🧘", 
    options: ['Talk it out immediately 🗣️', 'Take space first 🧘', 'Find a quick compromise 🤝'] 
  },
  { 
    key: 'social_energy', 
    question: "On a scale of homebody to social butterfly, I am... 🦋", 
    options: ['Full homebody 🛋️', 'Balanced ⚖️', 'Life of the party 🦋'] 
  },
  { 
    key: 'life_priority', 
    question: "In 5 years, my biggest priority is... 🎯", 
    options: ['Career & wealth 💼', 'Family 👨‍👩‍👧', 'Travel & experiences 🌍'] 
  },
  { 
    key: 'relationship_pace', 
    question: "When it comes to relationships, I prefer to... 🐢", 
    options: ['Take it slow 🐢', 'Go with the flow 🌊', 'Move with intention 🎯'] 
  }
];

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);

  if (!body || (!body.message && !body.callback_query && !body.inline_query)) {
    return { status: 'ignored' };
  }

  // Initialize Supabase Admin
  const supabase = createClient(
    config.supabaseUrl || '',
    config.supabaseServiceKey || '',
    { auth: { persistSession: false } }
  );

  // 0. Handle Inline Queries (Viral Sharing)
  if (body.inline_query) {
    return handleInlineQuery(body.inline_query, supabase, config);
  }

  // Handle both text messages, button clicks (callback_queries), and shared contacts
  const isCallback = !!body.callback_query;
  const isContact = !!body.message?.contact;
  const chatId = isCallback ? body.callback_query.message.chat.id : body.message.chat.id;
  const tgUserId = isCallback ? body.callback_query.from.id : body.message.from.id;
  const text = isCallback ? body.callback_query.data : body.message?.text;
  const contact = isContact ? body.message.contact : null;

  // 1. Get current conversation state
  const { data: session } = await supabase
    .schema('m2m')
    .from('telegram_bot_states')
    .select('*')
    .eq('chat_id', chatId)
    .single();

  // 1.5 Handle Shared Contact
  if (isContact && contact && session?.state === 'WAITING_FOR_CONTACT') {
    return handleContactShared(chatId, tgUserId, contact, supabase);
  }

  // 2. Handle Commands
  if (text?.startsWith('/start')) {
    await clearState(chatId, supabase);
    return handleStart(chatId, config);
  }

  if (text?.startsWith('/vibe')) {
    return startVibeCheck(chatId, tgUserId, supabase);
  }

  if (text?.startsWith('/matches')) {
    return handleMatches(chatId, tgUserId, supabase, config);
  }

  if (text?.startsWith('/profile')) {
    return handleProfile(chatId, tgUserId, supabase, config);
  }

  if (text?.startsWith('/events')) {
    return handleEvents(chatId, supabase, config);
  }

  if (text?.startsWith('/help')) {
    return handleHelp(chatId);
  }

  // 3. Handle Conversational State
  if (session && session.state === 'VIBE_CHECK') {
    return handleVibeCheckStep(chatId, tgUserId, text, session, supabase, config);
  }

  // Default Fallback
  if (!isCallback && text && !text.startsWith('/')) {
    await sendTelegramMessage(chatId, "I didn't quite catch that. Try /help to see what I can do!");
  }

  return { status: 'success' };
});

async function clearState(chatId: number, supabase: any) {
  await supabase.schema('m2m').from('telegram_bot_states').delete().eq('chat_id', chatId);
}

async function startVibeCheck(chatId: number, tgUserId: number, supabase: any) {
  // Check if they already have a profile
  const { data: profile } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id, dating_persona, phone')
    .eq('telegram_id', tgUserId.toString())
    .single();

  if (profile?.dating_persona) {
    return sendTelegramMessage(chatId, `✨ *You've already found your vibe!*\n\nYour persona is *${profile.dating_persona.replace(/_/g, ' ')}*.\n\nUse /matches to see who fits your energy!`);
  }

  // If we don't have their phone number, we must request it first
  if (!profile?.phone) {
    await supabase.schema('m2m').from('telegram_bot_states').upsert({
      chat_id: chatId,
      tg_user_id: tgUserId,
      state: 'WAITING_FOR_CONTACT',
      current_step: 0,
      answers: {}
    });

    return sendTelegramMessage(chatId, "🔐 *Security Check*\n\nTo link your profile, I need to verify your identity. Please share your phone number using the button below:", {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: "📱 Share My Number", request_contact: true }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  // Already have phone, start survey
  await supabase.schema('m2m').from('telegram_bot_states').upsert({
    chat_id: chatId,
    tg_user_id: tgUserId,
    state: 'VIBE_CHECK',
    current_step: 0,
    answers: {}
  });

  return askQuestion(chatId, CORE_QUESTIONS[0]);
}

async function handleContactShared(chatId: number, tgUserId: number, contact: any, supabase: any) {
  // 1. Sanitize phone
  const phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
  
  // 2. Clear keyboard
  await sendTelegramMessage(chatId, "✅ Phone verified! Let's find your vibe now...", {
    reply_markup: { remove_keyboard: true }
  });

  // 3. Check if profile exists with this phone but different/no telegram_id
  const { data: existingProfile } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .single();

  if (existingProfile) {
    // Link telegram_id to existing profile
    await supabase.schema('m2m').from('profiles').update({
        telegram_id: tgUserId.toString()
    }).eq('id', existingProfile.id);
  }

  // 4. Update session to VIBE_CHECK and store phone
  await supabase.schema('m2m').from('telegram_bot_states').update({
    state: 'VIBE_CHECK',
    current_step: 0,
    answers: { phone } // Initialize answers with phone
  }).eq('chat_id', chatId);

  // Notify Discord
  await notifyDiscord({
    title: '💬 Telegram Lead Started Vibe Check',
    description: `A user shared their contact via the Telegram bot.`,
    color: DiscordColors.info,
    fields: [
        { name: 'Phone', value: phone, inline: true },
        { name: 'Telegram ID', value: tgUserId.toString(), inline: true }
    ]
  });

  return askQuestion(chatId, CORE_QUESTIONS[0]);
}

async function askQuestion(chatId: number, questionObj: any) {
  const keyboard = {
    inline_keyboard: questionObj.options.map((opt: string) => [
      { text: opt, callback_data: `ans:${questionObj.key}:${opt}` }
    ])
  };

  await sendTelegramMessage(chatId, `*Vibe Check (1/5)*\n\n${questionObj.question}`, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

async function handleVibeCheckStep(chatId: number, tgUserId: number, data: string, session: any, supabase: any, config: any) {
  if (!data.startsWith('ans:')) return;

  const [_, key, value] = data.split(':');
  const answers = { ...session.answers, [key]: value };
  const nextStep = session.current_step + 1;

  if (nextStep < CORE_QUESTIONS.length) {
    // Save progress and ask next
    await supabase.schema('m2m').from('telegram_bot_states').update({
      current_step: nextStep,
      answers: answers
    }).eq('chat_id', chatId);

    const nextQ = CORE_QUESTIONS[nextStep];
    const keyboard = {
      inline_keyboard: nextQ.options.map((opt: string) => [
        { text: opt, callback_data: `ans:${nextQ.key}:${opt}` }
      ])
    };

    return sendTelegramMessage(chatId, `*Vibe Check (${nextStep + 1}/5)*\n\n${nextQ.question}`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } else {
    // Survey Finished!
    await sendTelegramMessage(chatId, "Calculating your persona... 🔍");
    
    const persona = calculatePersona(answers);
    
    // Check if profile exists to update, otherwise we ask them to open the app to finish
    const { data: profile } = await supabase
      .schema('m2m')
      .from('profiles')
      .select('id')
      .eq('telegram_id', tgUserId.toString())
      .single();

    if (profile) {
      // Update existing profile
      await supabase.schema('m2m').from('profiles').update({
        dating_persona: persona.id
      }).eq('id', profile.id);

      // Also save answers to vibe_answers table
      const vibeEntries = Object.entries(answers).map(([qKey, qVal]) => ({
        user_id: profile.id,
        question_key: qKey,
        answer_value: qVal
      }));
      await supabase.schema('m2m').from('vibe_answers').upsert(vibeEntries, { onConflict: 'user_id,question_key' });

      await sendTelegramMessage(chatId, `🎉 *Persona Found: ${persona.name} ${persona.emoji}*\n\n${persona.description}\n\nYour profile has been updated! Use /matches to see your compatibility scores.`);
    } else {
      // No profile - they need to register via the app first but we can capture the "draft"
      const phoneParam = answers.phone ? `&phone=${encodeURIComponent(answers.phone)}` : '';
      await sendTelegramMessage(chatId, `🎉 *You're an ${persona.name} ${persona.emoji}!*\n\n${persona.description}\n\nTo see your matches and join events, you need to create an account. Tap below to launch M2M!`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Finish Registration', web_app: { url: `${config.public.baseUrl}/vibe-check?persona=${persona.id}${phoneParam}` } }]
          ]
        }
      });
    }

    // Notify Discord
    await notifyDiscord({
      title: '🤖 Telegram Vibe Check Completed',
      description: `User completed their vibe check directly in Telegram!`,
      color: DiscordColors.success,
      fields: [
          { name: 'Persona', value: `${persona.name} ${persona.emoji}`, inline: true },
          { name: 'Status', value: profile ? 'Updated existing profile' : 'Created draft profile', inline: true }
      ]
    });

    // Clear state
    await clearState(chatId, supabase);
  }
}

async function handleStart(chatId: number, config: any) {
  const welcomeMessage = `
👋 *Welcome to Minutes 2 Match!*

Ready to find your vibe? Minutes 2 Match is a science-backed speed dating platform designed for meaningful connections.

*Commands:*
/vibe - Start conversational Vibe Check
/matches - View your latest matches
/profile - See your profile status
/events - Browse upcoming events
  `.trim();

  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 Launch M2M App', web_app: { url: config.public.baseUrl } }],
      [{ text: '✨ Find My Vibe', callback_data: '/vibe' }]
    ]
  };

  // The URL to the welcome video (.mp4 format).
  // Replace this with your actual video URL once hosted!
  const videoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'; 
  
  // Your preferred welcome image
  const fallbackPhoto = 'https://ziglffbvcexvwguqopqm.supabase.co/storage/v1/object/public/m2m-assets/welcome_v2.png'; // Please upload the new image to this path in Supabase

  try {
    // Set Bot Commands Menu (Persistent)
    await setTelegramBotCommands([
      { command: 'matches', description: 'View your latest matches' },
      { command: 'events', description: 'Browse upcoming events' },
      { command: 'profile', description: 'See your profile status' },
      { command: 'vibe', description: 'Start Vibe Check' },
      { command: 'help', description: 'Show all commands' }
    ]);

    await sendTelegramVideo(chatId, videoUrl, {
      caption: welcomeMessage,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (err) {
    // If video fails, try to send the cinematic Hero Photo I created
    console.warn('[Telegram] Video failed, attempting cinematic photo fallback');
    try {
      await sendTelegramPhoto(chatId, fallbackPhoto, {
        caption: welcomeMessage,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (photoErr) {
      // Fallback to pure text as a last resort
      await sendTelegramMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
  }

  return { status: 'success' };
}

// Reuse existing handlers from previous version...
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
  
    // Fetch matches
    const { data: matches } = await supabase
      .schema('m2m')
      .from('matches')
      .select(`
        id, 
        status, 
        match_score,
        user_1:user_1_id(id, display_name, dating_persona, photo_url, gender, birth_date, location),
        user_2:user_2_id(id, display_name, dating_persona, photo_url, gender, birth_date, location)
      `)
      .or(`user_1_id.eq.${profile.id},user_2_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!matches || matches.length === 0) {
      return sendTelegramMessage(chatId, "✨ You don't have any matches yet. Keep your profile updated and we'll notify you when someone vibes with you!");
    }
  
    await sendTelegramMessage(chatId, `🔥 *You have ${matches.length} recent match${matches.length !== 1 ? 'es' : ''}!*\n\nHere's who caught your vibe:`, {
        parse_mode: 'Markdown'
    });

    for (const m of matches) {
      const otherUser = m.user_1.id === profile.id ? m.user_2 : m.user_1;
      
      const status = m.status === 'unlocked' ? '✅ Unlocked' : '🔒 Locked';
      const score = m.match_score ? `${m.match_score}%` : '??%';
      const persona = otherUser.dating_persona ? personas[otherUser.dating_persona] : null;
      const personaText = persona ? `${persona.name} ${persona.emoji}` : 'Unknown Vibe';
      
      let ageText = '';
      if (otherUser.birth_date) {
        const diffMs = Date.now() - new Date(otherUser.birth_date).getTime();
        const ageDate = new Date(diffMs); 
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        ageText = `, ${age}`;
      }
      
      const caption = `
💖 *Match Compatibility: ${score}*

👤 *${otherUser.display_name}*${ageText}
📍 ${otherUser.location ? otherUser.location.charAt(0).toUpperCase() + otherUser.location.slice(1) : 'Unknown location'}
✨ ${personaText}

*Status:* ${status}
      `.trim();

      const buttonText = m.status === 'unlocked' ? '💬 Open Chat in App' : '🔓 Unlock Match';
      const keyboard = {
        inline_keyboard: [
          [{ text: buttonText, web_app: { url: `${config.public.baseUrl}/matches` } }]
        ]
      };

      if (otherUser.photo_url && otherUser.photo_url.startsWith('https://')) {
        try {
            await sendTelegramPhoto(chatId, otherUser.photo_url, {
                caption,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (err) {
            // Fallback to text if photo fails
            await sendTelegramMessage(chatId, caption, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
      } else {
        await sendTelegramMessage(chatId, caption, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
      }
    }
  
    // Add final trailing button to see all
    await sendTelegramMessage(chatId, "Tap the button below to view all your connections inside M2M.", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "✨ Open Full Match Deck", web_app: { url: `${config.public.baseUrl}/matches` } }]
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
  
    const persona = profile.dating_persona ? personas[profile.dating_persona] : null;

    const msg = `
👤 *Your M2M Profile*

*Name:* ${profile.display_name}
*Vibe:* ${persona ? `${persona.name} ${persona.emoji}` : 'Not set'}
*Status:* ${profile.is_verified ? '✅ Verified' : '⏳ Pending'}
*Location:* ${profile.location ? profile.location.charAt(0).toUpperCase() + profile.location.slice(1) : 'Unknown'}

Keep your profile fresh to get better matches!
    `.trim();
  
    const keyboard = {
        inline_keyboard: [
          [{ text: '⚙️ Edit Profile', web_app: { url: `${config.public.baseUrl}/me` } }]
        ]
    };

    if (profile.photo_url && profile.photo_url.startsWith('https://')) {
        try {
            await sendTelegramPhoto(chatId, profile.photo_url, {
                caption: msg,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (err) {
            await sendTelegramMessage(chatId, msg, {
              parse_mode: 'Markdown',
              reply_markup: keyboard
            });
        }
    } else {
        await sendTelegramMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
    }
  
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

/vibe - Discover your dating persona in chat
/matches - Show your latest matches and status
/profile - Check your profile status
/events - See upcoming speed dating events
/start - Return to the welcome menu
  `.trim();

  await sendTelegramMessage(chatId, msg, { parse_mode: 'Markdown' });
  return { status: 'success' };
}
async function handleInlineQuery(inlineQuery: any, supabase: any, config: any) {
  const query = inlineQuery.query || '';
  
  // Fetch upcoming events to suggest
  const { data: events } = await supabase
    .schema('m2m')
    .from('events')
    .select('*')
    .eq('status', 'open')
    .gte('event_date', new Date().toISOString())
    .limit(5);

  const results = (events || []).map((event: any) => ({
    type: 'article',
    id: event.id,
    title: `🎟️ ${event.title}`,
    description: `Join me at ${event.venue} on ${new Date(event.event_date).toLocaleDateString()}`,
    thumb_url: event.cover_image_url,
    input_message_content: {
      message_text: `👋 Hey! You should join me at *${event.title}* on Minutes 2 Match!\n\n📍 Venue: ${event.venue}\n🗓 Date: ${new Date(event.event_date).toLocaleDateString()}\n\n[Check out the event here](${config.public.baseUrl}/events)`,
      parse_mode: 'Markdown'
    },
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎟️ View Event Information', url: `${config.public.baseUrl}/events` }]
      ]
    }
  }));

  const token = config.telegramBotToken;
  await $fetch(`https://api.telegram.org/bot${token}/answerInlineQuery`, {
    method: 'POST',
    body: {
      inline_query_id: inlineQuery.id,
      results,
      cache_time: 300 // 5 minutes
    }
  });

  return { status: 'success' };
}
