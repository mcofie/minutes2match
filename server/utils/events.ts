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
    const debugUserId = body?.userId
    if (debugUserId && debugUserId !== 'undefined') {
      userId = String(debugUserId)
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
    client.schema('m2m').from('profiles').select('id, display_name, phone, gender').eq('id', options.userId).maybeSingle(),
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
    .in('status', ['pending', 'confirmed', 'checked_in', 'waitlisted'])

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
