import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const body = (await readBody<Record<string, any>>(event).catch(() => ({} as Record<string, any>))) as Record<string, any>
  const pollId = String(body.pollId || '')

  if (!pollId) {
    throw createError({ statusCode: 400, statusMessage: 'pollId is required' })
  }

  const { data: poll, error: pollError } = await client
    .schema('m2m')
    .from('poll_questions')
    .select('*')
    .eq('id', pollId)
    .single()

  if (pollError || !poll) {
    throw createError({ statusCode: 404, statusMessage: 'Poll not found' })
  }

  const newStatus = !poll.is_active

  const { data: updatedPoll, error: updateError } = await client
    .schema('m2m')
    .from('poll_questions')
    .update({ is_active: newStatus } as any)
    .eq('id', pollId)
    .select('*')
    .single()

  if (updateError || !updatedPoll) {
    throw createError({ statusCode: 500, statusMessage: updateError?.message || 'Failed to update poll status' })
  }

  if (newStatus) {
    const { error: deactivateError } = await client
      .schema('m2m')
      .from('poll_questions')
      .update({ is_active: false } as any)
      .eq('level_id', updatedPoll.level_id)
      .eq('country', updatedPoll.country || 'Global')
      .eq('season', updatedPoll.season || 'Standard')
      .neq('id', updatedPoll.id)

    if (deactivateError) {
      throw createError({ statusCode: 500, statusMessage: deactivateError.message })
    }

    await notifyDiscord({
      title: '✨ Spark Deck Poll went LIVE!',
      description: `Players scanning cards for **The ${updatedPoll.level_id.toUpperCase()}** will now see this question immediately.`,
      color: DiscordColors.success,
      fields: [
        { name: 'Targeting', value: `${updatedPoll.country || 'Global'} • ${updatedPoll.season || 'Standard'}`, inline: true },
        { name: 'Question', value: updatedPoll.question || 'Unknown', inline: false }
      ]
    }).catch(() => {})
  }

  return { success: true, poll: updatedPoll }
})
