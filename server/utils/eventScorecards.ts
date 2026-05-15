import { createInAppNotification } from '~/server/utils/notifications'
import { notifyUser } from '~/server/utils/notify'

type ScorecardClient = any

export async function fetchEventScorecardContext(client: ScorecardClient, options: {
  eventId: string
  userId: string
}) {
  const [{ data: event }, { data: booking }, { data: profile }] = await Promise.all([
    client.schema('m2m').from('events').select('*').eq('id', options.eventId).maybeSingle(),
    client.schema('m2m').from('event_bookings').select('*').eq('event_id', options.eventId).eq('user_id', options.userId).maybeSingle(),
    client.schema('m2m').from('profiles').select('id, display_name, gender').eq('id', options.userId).maybeSingle()
  ])

  if (!event) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  if (!event.matching_enabled) {
    throw createError({ statusCode: 400, statusMessage: 'Scorecards are not enabled for this event' })
  }

  if (!booking || booking.status !== 'checked_in') {
    throw createError({ statusCode: 403, statusMessage: 'Only checked-in attendees can submit scorecards' })
  }

  const scorecardsOpen = Boolean(event.scorecards_open) && (!event.scorecard_deadline || new Date(event.scorecard_deadline).getTime() > Date.now())

  return { event, booking, profile, scorecardsOpen }
}

export async function fetchScorecardCandidates(client: ScorecardClient, options: {
  eventId: string
  userId: string
}) {
  const { data: bookings, error } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      user_id,
      profile:profiles!event_bookings_user_id_fkey(
        id,
        display_name,
        gender,
        dating_persona,
        intent,
        occupation,
        photo_url
      )
    `)
    .eq('event_id', options.eventId)
    .eq('status', 'checked_in')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return (bookings || [])
    .map((row: any) => row.profile)
    .filter((profile: any) => profile?.id && profile.id !== options.userId)
}

export async function fetchExistingScorecards(client: ScorecardClient, options: {
  eventId: string
  userId: string
}) {
  const { data, error } = await client
    .schema('m2m')
    .from('event_scorecards')
    .select('target_user_id, decision, note, submitted_at')
    .eq('event_id', options.eventId)
    .eq('voter_user_id', options.userId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || []
}

export async function saveEventScorecards(client: ScorecardClient, options: {
  eventId: string
  userId: string
  entries: Array<{ targetUserId: string, decision: 'match' | 'maybe' | 'pass', note?: string | null }>
}) {
  const payload = options.entries.map((entry) => ({
    event_id: options.eventId,
    voter_user_id: options.userId,
    target_user_id: entry.targetUserId,
    decision: entry.decision,
    note: entry.note?.trim() || null,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  const { error } = await client
    .schema('m2m')
    .from('event_scorecards')
    .upsert(payload, { onConflict: 'event_id,voter_user_id,target_user_id' })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
}

async function findExistingMatch(client: ScorecardClient, userA: string, userB: string) {
  const { data, error } = await client
    .schema('m2m')
    .from('matches')
    .select('*')
    .or(`and(user_1_id.eq.${userA},user_2_id.eq.${userB}),and(user_1_id.eq.${userB},user_2_id.eq.${userA})`)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data || null
}

export async function processEventScorecards(client: ScorecardClient, options: {
  eventId: string
}) {
  const [{ data: event }, { data: checkedInParticipants }, { data: votes, error: votesError }] = await Promise.all([
    client.schema('m2m').from('events').select('*').eq('id', options.eventId).single(),
    client.schema('m2m').from('event_bookings').select('user_id').eq('event_id', options.eventId).eq('status', 'checked_in'),
    client.schema('m2m').from('event_scorecards').select('*').eq('event_id', options.eventId).eq('decision', 'match')
  ])

  if (!event?.matching_enabled) {
    throw createError({ statusCode: 400, statusMessage: 'Scorecards are not enabled for this event' })
  }

  if (votesError) {
    throw createError({ statusCode: 500, statusMessage: votesError.message })
  }

  const checkedInUserIds = new Set((checkedInParticipants || []).map((row: any) => row.user_id).filter(Boolean))
  const yesVotes = (votes || []).filter((vote: any) => checkedInUserIds.has(vote.voter_user_id) && checkedInUserIds.has(vote.target_user_id))

  const participants = Array.from(checkedInUserIds)
  const { data: profiles } = participants.length
    ? await client.schema('m2m').from('profiles').select('id, display_name').in('id', participants)
    : { data: [] as any[] }

  const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]))
  const mutualPairs: Array<{ user1: string, user2: string }> = []
  const processed = new Set<string>()

  for (const vote of yesVotes) {
    const counterVote = yesVotes.find((entry: any) =>
      entry.voter_user_id === vote.target_user_id && entry.target_user_id === vote.voter_user_id
    )
    if (!counterVote) continue

    const pairKey = [vote.voter_user_id, vote.target_user_id].sort().join(':')
    if (processed.has(pairKey)) continue
    processed.add(pairKey)
    mutualPairs.push({
      user1: pairKey.split(':')[0],
      user2: pairKey.split(':')[1]
    })
  }

  let createdCount = 0
  const unlockedMatchIds: string[] = []

  for (const pair of mutualPairs) {
    const existing = await findExistingMatch(client, pair.user1, pair.user2)
    if (existing?.status === 'unlocked') {
      unlockedMatchIds.push(existing.id)
      continue
    }

    const now = new Date().toISOString()

    if (existing?.id) {
      const { error } = await client
        .schema('m2m')
        .from('matches')
        .update({
          status: 'unlocked',
          unlock_price: 0,
          unlocked_at: now,
          user_1_paid: true,
          user_2_paid: true,
          user_1_paid_at: existing.user_1_paid_at || now,
          user_2_paid_at: existing.user_2_paid_at || now,
          user_1_amount_paid: existing.user_1_amount_paid || 0,
          user_2_amount_paid: existing.user_2_amount_paid || 0,
          created_by_label: existing.created_by_label || 'event_scorecard'
        })
        .eq('id', existing.id)

      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
      }

      unlockedMatchIds.push(existing.id)
    } else {
      const { data: created, error } = await client
        .schema('m2m')
        .from('matches')
        .insert({
          user_1_id: pair.user1,
          user_2_id: pair.user2,
          status: 'unlocked',
          unlock_price: 0,
          unlocked_at: now,
          user_1_paid: true,
          user_2_paid: true,
          user_1_paid_at: now,
          user_2_paid_at: now,
          user_1_amount_paid: 0,
          user_2_amount_paid: 0,
          created_by_label: 'event_scorecard'
        })
        .select('id')
        .single()

      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
      }

      if (created?.id) unlockedMatchIds.push(created.id)
      createdCount++
    }

    const [user1Profile, user2Profile] = [profileMap.get(pair.user1) as any, profileMap.get(pair.user2) as any]

    await Promise.all([pair.user1, pair.user2].map((userId, index) => {
      const otherProfile = index === 0 ? user2Profile : user1Profile
      const matchId = unlockedMatchIds[unlockedMatchIds.length - 1]
      return Promise.all([
        createInAppNotification(client, {
          userId,
          type: 'event_mutual_match',
          title: 'It’s a mutual event match',
          message: `${otherProfile?.display_name || 'Someone you met'} matched with you at ${event.title}. Your connection is already unlocked.`,
          data: { match_id: matchId, event_id: options.eventId, route: '/matches' },
          dedupeKey: `event-mutual:${matchId}:${userId}`
        }),
        notifyUser(
          userId,
          `🎉 You matched with ${otherProfile?.display_name || 'someone you met'} at ${event.title}. Your connection is already unlocked in Minutes 2 Match.`,
          { type: 'match', matchId, smsPriority: 'high' }
        ).catch((error) => {
          console.error('[EventScorecards] Failed to notify event mutual match:', error)
        })
      ])
    }))
  }

  const { error: updateError } = await client
    .schema('m2m')
    .from('events')
    .update({
      scorecards_open: false,
      scorecards_processed_at: new Date().toISOString()
    })
    .eq('id', options.eventId)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return {
    totalParticipants: checkedInUserIds.size,
    voteCount: yesVotes.length,
    mutualCount: mutualPairs.length,
    createdCount,
    unlockedMatchIds
  }
}
