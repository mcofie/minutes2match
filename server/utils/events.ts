import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

type EventClient = any

export function getEventBucketByGender(gender: string | null | undefined): 'male' | 'female' | null {
  const normalized = String(gender || '').trim().toLowerCase()
  if (normalized === 'male') return 'male'
  if (normalized === 'female') return 'female'
  return null
}

export function getEventTicketPrice(event: {
  ticket_price_male: number
  ticket_price_female: number
}, gender: string | null | undefined) {
  return getEventBucketByGender(gender) === 'female'
    ? Number(event.ticket_price_female || 0)
    : Number(event.ticket_price_male || 0)
}

export function formatPaymentEmail(phone: string | null | undefined) {
  const normalized = String(phone || '').replace(/[\s+\-]/g, '')
  return normalized ? `${normalized}@m2match.com` : 'user@m2match.com'
}

export async function resolveEventUserId(event: H3Event, body?: Record<string, any>) {
  let userId: string | null = null

  try {
    const user = await serverSupabaseUser(event)
    if (user?.id) userId = user.id
  } catch (err) {
    console.warn('[Events] serverSupabaseUser failed:', err)
  }

  if (!userId) {
    try {
      const client = await serverSupabaseClient(event)
      const { data: { session } } = await client.auth.getSession()
      if (session?.user?.id) userId = session.user.id
    } catch (err) {
      console.warn('[Events] session lookup failed:', err)
    }
  }

  if (!userId) {
    const headers = getHeaders(event)
    const authHeader = headers.authorization || headers.Authorization
    const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (bearer && bearer !== 'undefined') {
      try {
        const service = serverSupabaseServiceRole(event)
        const { data, error } = await service.auth.getUser(bearer)
        if (!error && data.user?.id) userId = data.user.id
      } catch (err) {
        console.warn('[Events] bearer verification failed:', err)
      }
    }
  }

  if (!userId && process.env.NODE_ENV !== 'production') {
    const headers = getHeaders(event)
    const headerUserId = headers['x-user-id'] || headers['X-User-Id']
    const queryUserId = getQuery(event).userId
    const debugUserId = body?.userId
    const fallbackUserId = headerUserId || queryUserId || debugUserId
    if (fallbackUserId && fallbackUserId !== 'undefined') {
      userId = String(fallbackUserId)
      console.warn('[Events] USER RECOVERED VIA INSECURE DEBUG FALLBACK:', userId)
    }
  }

  return userId
}

export async function fetchEventBookingContext(client: EventClient, options: {
  eventId: string
  userId: string
}) {
  const nowIso = new Date().toISOString()
  const [{ data: profile }, { data: event }, { data: qualification }, { data: existingBooking }] = await Promise.all([
    client.schema('m2m').from('profiles').select('id, display_name, phone, gender, birth_date').eq('id', options.userId).maybeSingle(),
    client.schema('m2m').from('events').select('*').eq('id', options.eventId).maybeSingle(),
    client.schema('m2m').from('event_qualifications').select('id, status').eq('event_id', options.eventId).eq('user_id', options.userId).maybeSingle(),
    client.schema('m2m').from('event_bookings').select('*').eq('event_id', options.eventId).eq('user_id', options.userId).maybeSingle()
  ])

  if (!event) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  if (new Date(event.event_date).toISOString() < nowIso) {
    throw createError({ statusCode: 400, statusMessage: 'This event has already started or ended' })
  }

  if (!event.is_public && (!qualification?.id || !['qualified', 'invited'].includes(String(qualification.status || '')))) {
    throw createError({ statusCode: 403, statusMessage: 'You are not currently qualified to book this event' })
  }

  if (event.status === 'draft' || event.status === 'completed') {
    throw createError({ statusCode: 400, statusMessage: 'This event is not open for booking' })
  }

  if (profile) {
    const isFemale = profile.gender === 'female'
    const minAge = isFemale ? event.female_min_age : event.male_min_age
    const maxAge = isFemale ? event.female_max_age : event.male_max_age

    if (minAge !== null || maxAge !== null) {
      if (!profile.birth_date) {
        throw createError({ statusCode: 403, statusMessage: 'Please set your birth date in your profile to book this event' })
      }
      const birthDate = new Date(profile.birth_date)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (minAge !== null && age < minAge) {
        throw createError({ statusCode: 403, statusMessage: `This event requires a minimum age of ${minAge}` })
      }
      if (maxAge !== null && age > maxAge) {
        throw createError({ statusCode: 403, statusMessage: `This event has a maximum age of ${maxAge}` })
      }
    }
  }

  return { profile, event, qualification, existingBooking }
}

export async function getEventAvailabilitySnapshot(client: EventClient, options: {
  eventId: string
}) {
  const { data: bookings } = await client
    .schema('m2m')
    .from('event_bookings')
    .select(`
      status,
      user:profiles!event_bookings_user_id_fkey(gender)
    `)
    .eq('event_id', options.eventId)
    .in('status', ['confirmed', 'checked_in', 'waitlisted'])

  let maleReserved = 0
  let femaleReserved = 0
  let maleWaitlisted = 0
  let femaleWaitlisted = 0

  for (const booking of (bookings || []) as any[]) {
    const bucket = getEventBucketByGender(booking.user?.gender)
    if (!bucket) continue

    if (booking.status === 'waitlisted') {
      if (bucket === 'male') maleWaitlisted++
      if (bucket === 'female') femaleWaitlisted++
      continue
    }

    if (bucket === 'male') maleReserved++
    if (bucket === 'female') femaleReserved++
  }

  return {
    maleReserved,
    femaleReserved,
    maleWaitlisted,
    femaleWaitlisted
  }
}

export async function processEventBookingLifecycle(client: EventClient, options: {
  eventId?: string | null
} = {}) {
  const rpcArgs = {
    p_event_id: options.eventId || null
  }

  const { data: cleaned, error: cleanupError } = await client.rpc('cleanup_stale_pending_event_bookings', rpcArgs)
  if (cleanupError) {
    throw createError({ statusCode: 500, statusMessage: cleanupError.message })
  }

  const { data: promoted, error: promoteError } = await client.rpc('promote_event_waitlist', rpcArgs)
  if (promoteError) {
    throw createError({ statusCode: 500, statusMessage: promoteError.message })
  }

  return {
    cleaned: cleaned || [],
    promoted: promoted || []
  }
}

export async function fetchVisibleEventsForUser(client: EventClient, userId?: string | null) {
  const { data: allEvents, error: eventsError } = await client
    .schema('m2m')
    .from('events')
    .select('*')
    .in('status', ['open', 'waitlist'])
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  if (eventsError) {
    throw createError({ statusCode: 500, statusMessage: eventsError.message })
  }

  const events = allEvents || []
  if (!userId) {
    return {
      events: events.filter((event: any) => event.is_public === true),
      bookings: {}
    }
  }

  const [{ data: qualifications, error: qualificationsError }, { data: bookings, error: bookingsError }] = await Promise.all([
    client
      .schema('m2m')
      .from('event_qualifications')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('status', ['qualified', 'invited']),
    client
      .schema('m2m')
      .from('event_bookings')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'waitlisted', 'checked_in'])
  ])

  if (qualificationsError) {
    throw createError({ statusCode: 500, statusMessage: qualificationsError.message })
  }

  if (bookingsError) {
    throw createError({ statusCode: 500, statusMessage: bookingsError.message })
  }

  const qualifiedEventIds = new Set((qualifications || []).map((row: any) => row.event_id))
  const bookingMap = Object.fromEntries((bookings || []).map((row: any) => [row.event_id, row.status]))

  return {
    events: events.filter((event: any) => event.is_public === true || qualifiedEventIds.has(event.id) || Boolean(bookingMap[event.id])),
    bookings: bookingMap
  }
}

export async function fetchVisibleEventDetail(client: EventClient, options: {
  eventId: string
  userId?: string | null
}) {
  const userId = options.userId || null

  const [{ data: eventData, error: eventError }, { data: bookingData, error: bookingError }, { data: qualificationData, error: qualificationError }] = await Promise.all([
    client.schema('m2m').from('events').select('*').eq('id', options.eventId).maybeSingle(),
    userId
      ? client.schema('m2m').from('event_bookings').select('*').eq('event_id', options.eventId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    userId
      ? client.schema('m2m').from('event_qualifications').select('*').eq('event_id', options.eventId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ])

  if (eventError) {
    throw createError({ statusCode: 500, statusMessage: eventError.message })
  }

  if (bookingError) {
    throw createError({ statusCode: 500, statusMessage: bookingError.message })
  }

  if (qualificationError) {
    throw createError({ statusCode: 500, statusMessage: qualificationError.message })
  }

  if (!eventData) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  const canView = eventData.is_public === true
    || Boolean(bookingData)
    || Boolean(qualificationData && ['qualified', 'invited'].includes(String(qualificationData.status || '')))

  if (!canView) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  let waitlistMeta: { position: number; bucket: string | null } | null = null
  if (userId && bookingData?.status === 'waitlisted') {
    const { data: profileData } = await client
      .schema('m2m')
      .from('profiles')
      .select('gender')
      .eq('id', userId)
      .maybeSingle()

    const bucket = getEventBucketByGender(profileData?.gender)
    if (bucket) {
      const { data: waitlistedBookings } = await client
        .schema('m2m')
        .from('event_bookings')
        .select(`
          id,
          created_at,
          user:profiles!event_bookings_user_id_fkey(gender)
        `)
        .eq('event_id', options.eventId)
        .eq('status', 'waitlisted')
        .order('created_at', { ascending: true })

      const queue = (waitlistedBookings || []).filter((row: any) => getEventBucketByGender(row.user?.gender) === bucket)
      const index = queue.findIndex((row: any) => row.id === bookingData.id)
      waitlistMeta = {
        position: index >= 0 ? index + 1 : queue.length + 1,
        bucket
      }
    }
  }

  return {
    event: eventData,
    booking: bookingData,
    qualification: qualificationData,
    waitlistMeta
  }
}
