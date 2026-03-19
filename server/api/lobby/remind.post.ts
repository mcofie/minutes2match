import { serverSupabaseUser, serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'
import { notifyUser } from '~/server/utils/notify'
import { notifyLobbyReminder } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
  // 1. Identity Resolution
  let userId: string | null = null
  try {
     const user = await serverSupabaseUser(event)
     if (user?.id) userId = user.id
  } catch (e) {}

  if (!userId) {
     try {
        const client = await serverSupabaseClient(event)
        const { data: { session } } = await client.auth.getSession()
        if (session?.user?.id) userId = session.user.id
     } catch (e) {}
  }

  if (!userId) {
     console.error('[LobbyRemind] Auth error: No userId found')
     throw createError({ statusCode: 401, statusMessage: 'Please sign in to set a reminder' })
  }

  const { lobbyId } = await readBody(event)
  if (!lobbyId) throw createError({ statusCode: 400, statusMessage: 'lobbyId is required' })

  const service = serverSupabaseServiceRole(event)
  console.log(`[LobbyRemind] Processing reminder for Lobby:${lobbyId} User:${userId}`)

  // 1. Check if reminder already exists
  const { data: existing } = await service
    .schema('m2m')
    .from('flash_lobby_reminders')
    .select('id')
    .eq('user_id', userId)
    .eq('lobby_id', lobbyId)
    .maybeSingle()

  if (existing) {
     console.log('[LobbyRemind] Existing reminder found, skipping notifications.')
     return { success: true, message: 'Already set', isNew: false }
  }

  // 2. Fetch Context Data (Lobby & User)
  const [lobbyRes, profileRes] = await Promise.all([
     service.schema('m2m').from('flash_lobbies').select('title, start_at').eq('id', lobbyId).single(),
     service.schema('m2m').from('profiles').select('display_name, phone').eq('id', userId).maybeSingle()
  ])

  if (lobbyRes.error || !lobbyRes.data) {
     console.error('[LobbyRemind] Lobby fetch error:', lobbyRes.error)
     throw createError({ statusCode: 404, statusMessage: 'Lobby not found' })
  }
  
  const lobby = lobbyRes.data
  const profile = profileRes.data

  // 3. Persist Reminder
  const { error: insertError } = await service
    .schema('m2m')
    .from('flash_lobby_reminders')
    .insert([{ user_id: userId, lobby_id: lobbyId }])

  if (insertError) {
     console.error('[LobbyRemind] Insert error:', insertError)
     throw createError({ statusCode: 500, statusMessage: insertError.message })
  }

  // 4. Notifications (Fire & Forget)
  console.log('[LobbyRemind] Firing notifications...')
  
  const startTime = new Date(lobby.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const startDate = new Date(lobby.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  
  const smsMessage = `⚡ M2M Flash Lobby: Your reminder is set for "${lobby.title}" on ${startDate} at ${startTime}. We'll text you when it's live!`
  
  // Send SMS to User
  notifyUser(userId, smsMessage, { type: 'event', smsPriority: 'high' })
     .then(() => console.log('[LobbyRemind] SMS sent successfully'))
     .catch(e => console.error('[LobbyNotify] SMS Failed:', e))

  // Notify Admin on Discord
  notifyLobbyReminder({
     lobbyName: lobby.title,
     userName: profile?.display_name || 'Anonymous User',
     userPhone: profile?.phone || 'Unknown'
  })
     .then(() => console.log('[LobbyRemind] Discord alert sent successfully'))
     .catch(e => console.error('[LobbyNotify] Discord Failed:', e))

  return { success: true, message: 'Reminder set & notified', isNew: true }
})
