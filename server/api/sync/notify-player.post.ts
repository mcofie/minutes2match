import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, level, country, pollId, details } = body

  // We conditionally rate-limit or format these based on action types
  const levelName = String(level || 'Unknown').toUpperCase()
  const loc = country || 'Global'

  if (action === 'scanned') {
    await notifyDiscord({
        title: `📱 New Spark Deck Scan`,
        description: `A unique device just scanned the physical QR code for **The ${levelName}**!`,
        color: DiscordColors.info,
        fields: [
            { name: 'Location', value: loc, inline: true },
            { name: 'Poll ID', value: String(pollId).substring(0,8), inline: true }
        ]
    })
  } else if (action === 'inferno_unlocked') {
    await notifyDiscord({
        title: `🔥 The Inferno Unlocked!`,
        description: `A player bravely bypassed the 1.5s security biometric hold to access the deepest level.`,
        color: DiscordColors.error, // Red for Inferno
        fields: [
            { name: 'Location', value: loc, inline: true }
        ]
    })
  } else if (action === 'voted') {
    const { option, label } = details || {}
    await notifyDiscord({
        title: `🗳️ Vote Cast: The ${levelName}`,
        description: `A player just dropped a vote for **${label || option}**!`,
        color: DiscordColors.success,
        fields: [
            { name: 'Location', value: loc, inline: true },
            { name: 'Selection', value: String(option), inline: true }
        ]
    })
  } else if (action === 'mood_activated') {
    await notifyDiscord({
        title: `🎵 Mood Activated`,
        description: `A player bumped the Spotify playlist for **The ${levelName}**!`,
        color: DiscordColors.payment, // Spotify colorish proxy
        fields: [
            { name: 'Location', value: loc, inline: true }
        ]
    })
  } else if (action === 'shop_visited') {
    await notifyDiscord({
        title: `🛍️ Shop Lead: Spark Deck`,
        description: `Someone playing a friend's deck just clicked *"Get Your Own Spark Deck"* and entered the growth loop!`,
        color: DiscordColors.signup,
        fields: [
            { name: 'Source Level', value: levelName, inline: true },
            { name: 'Location', value: loc, inline: true }
        ]
    })
  }
  
  return { success: true }
})
