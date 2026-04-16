import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const body = (await readBody<Record<string, any>>(event).catch(() => ({} as Record<string, any>))) as Record<string, any>
  const pollId = String(body.pollId || '')

  if (!pollId) {
    throw createError({ statusCode: 400, statusMessage: 'pollId is required' })
  }

  const { error } = await client
    .schema('m2m')
    .from('poll_questions')
    .delete()
    .eq('id', pollId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true }
})
