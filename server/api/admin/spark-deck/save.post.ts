import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const { client } = await requireAdminAccess(event)
  const body = (await readBody<Record<string, any>>(event).catch(() => ({} as Record<string, any>))) as Record<string, any>

  const id = String(body.id || '')
  const levelId = String(body.level_id || '').toLowerCase()
  const season = String(body.season || 'Standard')
  const country = String(body.country || 'Global')
  const question = String(body.question || '').trim()
  const optionALabel = String(body.option_a_label || '').trim()
  const optionBLabel = String(body.option_b_label || '').trim()
  const spotifyUri = typeof body.spotify_uri === 'string' && body.spotify_uri.trim() ? body.spotify_uri.trim() : null
  const isActive = body.is_active === true

  if (!['spark', 'fire', 'inferno', 'wildcard'].includes(levelId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid level' })
  }

  if (!question) {
    throw createError({ statusCode: 400, statusMessage: 'Question is required' })
  }

  if (levelId !== 'wildcard' && (!optionALabel || !optionBLabel)) {
    throw createError({ statusCode: 400, statusMessage: 'Both option labels are required' })
  }

  const payload = {
    level_id: levelId,
    season,
    country,
    question,
    option_a_label: levelId === 'wildcard' ? null : optionALabel,
    option_b_label: levelId === 'wildcard' ? null : optionBLabel,
    spotify_uri: levelId === 'wildcard' ? null : spotifyUri,
    is_active: isActive
  }

  let savedPoll: any = null
  let created = false

  if (id) {
    const { data, error } = await client
      .schema('m2m')
      .from('poll_questions')
      .update(payload as any)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to update poll' })
    }

    savedPoll = data
  } else {
    const { data, error } = await client
      .schema('m2m')
      .from('poll_questions')
      .insert(payload as any)
      .select('*')
      .single()

    if (error || !data) {
      throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to create poll' })
    }

    savedPoll = data
    created = true
  }

  if (savedPoll.is_active) {
    const { error: deactivateError } = await client
      .schema('m2m')
      .from('poll_questions')
      .update({ is_active: false } as any)
      .eq('level_id', savedPoll.level_id)
      .eq('country', savedPoll.country || 'Global')
      .eq('season', savedPoll.season || 'Standard')
      .neq('id', savedPoll.id)

    if (deactivateError) {
      throw createError({ statusCode: 500, statusMessage: deactivateError.message })
    }
  }

  if (created) {
    await notifyDiscord({
      title: '🎴 New Spark Deck Poll Created',
      color: DiscordColors.info,
      fields: [
        { name: 'Level', value: savedPoll.level_id.toUpperCase(), inline: true },
        { name: 'Targeting', value: `${savedPoll.country || 'Global'} • ${savedPoll.season || 'Standard'}`, inline: true },
        { name: 'Question', value: savedPoll.question || 'Unknown', inline: false },
        ...(savedPoll.level_id === 'wildcard' ? [] : [{ name: 'Options', value: `A: ${savedPoll.option_a_label}\nB: ${savedPoll.option_b_label}`, inline: false }])
      ]
    }).catch(() => {})
  }

  if (savedPoll.is_active) {
    await notifyDiscord({
      title: created ? '✨ Spark Deck Poll Created Live' : '✨ Spark Deck Poll went LIVE!',
      description: `Players scanning cards for **The ${savedPoll.level_id.toUpperCase()}** will now see this question immediately.`,
      color: DiscordColors.success,
      fields: [
        { name: 'Targeting', value: `${savedPoll.country || 'Global'} • ${savedPoll.season || 'Standard'}`, inline: true },
        { name: 'Question', value: savedPoll.question || 'Unknown', inline: false }
      ]
    }).catch(() => {})
  }

  return {
    success: true,
    poll: savedPoll,
    created
  }
})
