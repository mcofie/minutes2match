import { notifyDiscord, DiscordColors } from '~/server/utils/discord'
import { requireAdminAccess } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdminAccess(event)
  const body = await readBody(event)
  const { action, poll } = body

  if (action === 'created') {
    await notifyDiscord({
        title: `🎴 New Spark Deck Poll Created`,
        color: DiscordColors.info,
        fields: [
            { name: 'Level', value: (poll.level_id || '').toUpperCase(), inline: true },
            { name: 'Targeting', value: `${poll.country || 'Global'} • ${poll.season || 'Standard'}`, inline: true },
            { name: 'Question', value: poll.question || 'Unknown', inline: false },
            { name: 'Options', value: `A: ${poll.option_a_label}\nB: ${poll.option_b_label}`, inline: false }
        ]
    })
  } else if (action === 'live') {
    await notifyDiscord({
        title: `✨ Spark Deck Poll went LIVE!`,
        description: `Players scanning cards for **The ${(poll.level_id || '').toUpperCase()}** will now see this question immediately.`,
        color: DiscordColors.success,
        fields: [
            { name: 'Targeting', value: `${poll.country || 'Global'} • ${poll.season || 'Standard'}`, inline: true },
            { name: 'Question', value: poll.question || 'Unknown', inline: false }
        ]
    })
  } else if (action === 'confetti') {
    await notifyDiscord({
        title: `🎉 Host Triggered Confetti!`,
        description: `An admin just blasted live confetti to all active players viewing **The ${(poll.level_id || '').toUpperCase()}**!`,
        color: DiscordColors.match,
        fields: [
            { name: 'Question', value: poll.question || 'Unknown', inline: false }
        ]
    })
  }
  
  return { success: true }
})
