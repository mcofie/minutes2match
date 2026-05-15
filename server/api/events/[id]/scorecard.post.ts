import { createClient } from '@supabase/supabase-js'
import { fetchEventScorecardContext, fetchScorecardCandidates, saveEventScorecards } from '~/server/utils/eventScorecards'
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

  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const entries = Array.isArray(body.entries) ? body.entries : []

  if (!entries.length) {
    throw createError({ statusCode: 400, statusMessage: 'Please score at least one person you met' })
  }

  const config = useRuntimeConfig()
  const client = createClient(config.supabaseUrl, config.supabaseServiceKey, { db: { schema: 'm2m' } })

  const context = await fetchEventScorecardContext(client as any, { eventId, userId })
  if (!context.scorecardsOpen) {
    throw createError({ statusCode: 400, statusMessage: 'Scorecards are closed for this event right now' })
  }

  const candidates = await fetchScorecardCandidates(client as any, { eventId, userId })
  const allowedTargetIds = new Set(candidates.map((candidate: any) => candidate.id))
  const normalizedEntries = entries
    .map((entry: any) => ({
      targetUserId: String(entry.targetUserId || ''),
      decision: String(entry.decision || '') as 'match' | 'maybe' | 'pass',
      note: entry.note ? String(entry.note) : null
    }))
    .filter((entry: any) => allowedTargetIds.has(entry.targetUserId) && ['match', 'maybe', 'pass'].includes(entry.decision))

  if (!normalizedEntries.length) {
    throw createError({ statusCode: 400, statusMessage: 'No valid scorecard entries were submitted' })
  }

  await saveEventScorecards(client as any, {
    eventId,
    userId,
    entries: normalizedEntries
  })

  return {
    success: true,
    saved: normalizedEntries.length
  }
})
