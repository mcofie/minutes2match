import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { processEventScorecards } from '~/server/utils/eventScorecards'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = (user as any)?.id || (user as any)?.sub
  if (!user || !userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = serverSupabaseServiceRole(event) as any
  const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', userId).maybeSingle()
  if (!admin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const body = await readBody(event).catch(() => ({} as Record<string, any>))
  const eventId = String(body.eventId || '')
  const action = String(body.action || '')
  const deadlineHours = Number(body.deadlineHours || 12)

  if (!eventId || !['enable', 'open', 'close', 'process'].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid scorecard action' })
  }

  if (action === 'process') {
    const result = await processEventScorecards(client, { eventId })
    return { success: true, result }
  }

  const patch: Record<string, any> = {}

  if (action === 'enable') {
    patch.matching_enabled = true
    patch.scorecards_open = false
  }

  if (action === 'open') {
    patch.matching_enabled = true
    patch.scorecards_open = true
    patch.scorecard_deadline = new Date(Date.now() + (Math.max(1, deadlineHours) * 60 * 60 * 1000)).toISOString()
    patch.scorecards_processed_at = null
  }

  if (action === 'close') {
    patch.scorecards_open = false
  }

  const { error } = await client
    .schema('m2m')
    .from('events')
    .update(patch)
    .eq('id', eventId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    success: true,
    action,
    deadline: patch.scorecard_deadline || null
  }
})
