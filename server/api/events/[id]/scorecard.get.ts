import { createClient } from '@supabase/supabase-js'
import { fetchEventScorecardContext, fetchExistingScorecards, fetchScorecardCandidates } from '~/server/utils/eventScorecards'
import { resolveEventUserId } from '~/server/utils/events'

export default defineEventHandler(async (event) => {
  const eventId = String(getRouterParam(event, 'id') || '')
  if (!eventId) {
    throw createError({ statusCode: 400, statusMessage: 'Event id is required' })
  }

  const userId = await resolveEventUserId(event)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const client = createClient(config.supabaseUrl, config.supabaseServiceKey, { db: { schema: 'm2m' } })

  const context = await fetchEventScorecardContext(client as any, { eventId, userId })
  const [candidates, existing] = await Promise.all([
    fetchScorecardCandidates(client as any, { eventId, userId }),
    fetchExistingScorecards(client as any, { eventId, userId })
  ])

  return {
    event: context.event,
    booking: context.booking,
    scorecardsOpen: context.scorecardsOpen,
    candidates,
    existing
  }
})
