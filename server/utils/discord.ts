/**
 * Discord Webhook Notification Utility
 * 
 * Sends rich embed messages to Discord for important user activities.
 * Configure DISCORD_WEBHOOK_URL in your .env file.
 */

interface DiscordField {
    name: string
    value: string
    inline?: boolean
}

interface DiscordNotification {
    title: string
    description?: string
    color?: number // Hex color as integer (e.g., 0x10b981 for emerald)
    fields?: DiscordField[]
    footer?: string
    thumbnail?: string
}

// Color presets for different event types
export const DiscordColors = {
    success: 0x10b981,   // Emerald green
    payment: 0x6366f1,   // Indigo
    warning: 0xf59e0b,   // Amber
    error: 0xef4444,     // Red
    info: 0x3b82f6,      // Blue
    match: 0xec4899,     // Pink
    signup: 0x8b5cf6,    // Purple
    redemption: 0xe11d48, // Rose-600
} as const

/**
 * Send a notification to Discord via webhook
 */
export async function notifyRedemption(redemption: {
    userName: string
    venueName: string
    discount: string
    location: string
    redemptionId: string
}) {
    await notifyDiscord({
        title: '🥂 New Venue Redemption!',
        color: DiscordColors.redemption,
        fields: [
            { name: 'User', value: redemption.userName, inline: true },
            { name: 'Venue', value: redemption.venueName, inline: true },
            { name: 'Offer', value: redemption.discount, inline: false },
            { name: 'Location', value: redemption.location, inline: true },
            { name: 'Ticket ID', value: redemption.redemptionId, inline: true },
        ]
    })
}
export async function notifyDiscord(notification: DiscordNotification): Promise<void> {
    const config = useRuntimeConfig()
    const webhookUrl = config.discordWebhookUrl

    if (!webhookUrl) {
        console.warn('⚠️ [Discord] Webhook URL not configured (DISCORD_WEBHOOK_URL), skipping notification')
        return
    }

    console.log(`[Discord] Attempting to send notification: ${notification.title}`)

    try {
        await $fetch(webhookUrl, {
            method: 'POST',
            body: {
                embeds: [{
                    title: notification.title,
                    description: notification.description,
                    color: notification.color ?? DiscordColors.info,
                    fields: notification.fields,
                    footer: notification.footer ? { text: notification.footer } : { text: 'Minutes2Match' },
                    thumbnail: notification.thumbnail ? { url: notification.thumbnail } : undefined,
                    timestamp: new Date().toISOString()
                }]
            }
        })
        console.log('[Discord] Notification sent:', notification.title)
    } catch (error: any) {
        // Don't let Discord errors break the main flow
        console.error('[Discord] Failed to send notification:', error.message)
    }
}

// Pre-built notification helpers for common events

export async function notifyNewSignup(user: { email: string; phone?: string; displayName?: string }) {
    await notifyDiscord({
        title: '👤 New User Signup',
        color: DiscordColors.signup,
        fields: [
            { name: 'Email', value: user.email, inline: true },
            { name: 'Phone', value: user.phone || 'Not provided', inline: true },
            { name: 'Name', value: user.displayName || 'Not set', inline: true },
        ]
    })
}

export async function notifyPaymentInitiated(payment: {
    amount: number
    currency: string
    purpose: string
    userEmail?: string
    reference: string
    shippingDetails?: {
       name: string
       phone: string
       address: string
    }
}) {
    let purposeEmoji = '🎟️'
    let purposeLabel = 'Event Ticket'

    if (payment.purpose === 'match_unlock') {
        purposeEmoji = '💍'
        purposeLabel = 'Match Unlock'
    } else if (payment.purpose === 'subscription') {
        purposeEmoji = '⭐'
        purposeLabel = 'Subscription'
    } else if (payment.purpose === 'shoot_your_shot') {
        purposeEmoji = '🎯'
        purposeLabel = 'Shoot Your Shot'
    } else if (payment.purpose === 'spark_deck') {
        purposeEmoji = '🛍️'
        purposeLabel = 'Spark Deck'
    }

    const fields: DiscordField[] = [
        { name: 'Amount', value: `${payment.currency} ${payment.amount}`, inline: true },
        { name: 'Type', value: purposeLabel, inline: true },
        { name: 'Reference', value: payment.reference, inline: true },
        { name: 'User', value: payment.userEmail || 'Unknown', inline: false },
    ]

    if (payment.shippingDetails) {
        fields.push({ name: 'Recipient', value: payment.shippingDetails.name, inline: true })
        fields.push({ name: 'Delivery', value: payment.shippingDetails.address, inline: false })
    }

    await notifyDiscord({
        title: `${purposeEmoji} Payment Initiated`,
        color: DiscordColors.warning,
        fields
    })
}

export async function notifyPaymentSuccess(payment: {
    amount: number
    currency: string
    purpose: string
    userEmail?: string
    reference: string
}) {
    let purposeEmoji = '🎟️'
    let purposeLabel = 'Event Ticket'

    if (payment.purpose === 'match_unlock') {
        purposeEmoji = '💕'
        purposeLabel = 'Match Unlock'
    } else if (payment.purpose === 'subscription') {
        purposeEmoji = '💎'
        purposeLabel = 'Subscription'
    } else if (payment.purpose === 'shoot_your_shot') {
        purposeEmoji = '🚀'
        purposeLabel = 'Shoot Your Shot'
    } else if (payment.purpose === 'spark_deck') {
        purposeEmoji = '🎁'
        purposeLabel = 'Spark Deck'
    }

    await notifyDiscord({
        title: `${purposeEmoji} Payment Received`,
        color: DiscordColors.payment,
        fields: [
            { name: 'Amount', value: `${payment.currency} ${payment.amount}`, inline: true },
            { name: 'Type', value: purposeLabel, inline: true },
            { name: 'Reference', value: payment.reference, inline: true },
            { name: 'User', value: payment.userEmail || 'Unknown', inline: false },
        ]
    })
}

export async function notifyMatchUnlocked(match: {
    user1Name: string
    user2Name: string
    matchId: string
    fullyUnlocked: boolean
}) {
    if (match.fullyUnlocked) {
        await notifyDiscord({
            title: '💕 Match Fully Unlocked!',
            description: `Both users have paid - they can now see each other's profiles!`,
            color: DiscordColors.match,
            fields: [
                { name: 'User 1', value: match.user1Name, inline: true },
                { name: 'User 2', value: match.user2Name, inline: true },
            ]
        })
    } else {
        await notifyDiscord({
            title: '🔓 Partial Match Unlock',
            description: `One user has unlocked, waiting for the other.`,
            color: DiscordColors.warning,
            fields: [
                { name: 'Match ID', value: match.matchId.substring(0, 8), inline: true },
            ]
        })
    }
}

export async function notifyEventBooking(booking: {
    eventName: string
    userName: string
    ticketCount?: number
}) {
    await notifyDiscord({
        title: '🎟️ Event Booking Confirmed',
        color: DiscordColors.success,
        fields: [
            { name: 'Event', value: booking.eventName, inline: true },
            { name: 'User', value: booking.userName, inline: true },
            { name: 'Tickets', value: String(booking.ticketCount || 1), inline: true },
        ]
    })
}

export async function notifyLobbyReminder(data: {
    lobbyName: string
    userName: string
    userPhone: string
}) {
    await notifyDiscord({
        title: '⚡ New Flash Lobby Reminder',
        color: DiscordColors.info,
        fields: [
            { name: 'Lobby', value: data.lobbyName, inline: true },
            { name: 'User', value: data.userName, inline: true },
            { name: 'Phone', value: data.userPhone, inline: true },
        ]
    })
}

export async function notifyError(error: {
    context: string
    message: string
    userId?: string
}) {
    await notifyDiscord({
        title: '🚨 Error Alert',
        description: `An error occurred in: ${error.context}`,
        color: DiscordColors.error,
        fields: [
            { name: 'Error', value: error.message.substring(0, 200), inline: false },
            { name: 'User ID', value: error.userId || 'N/A', inline: true },
        ]
    })
}

export async function notifyUserLogin(user: {
    phone: string
    displayName?: string | null
    isNewUser: boolean
    method?: string
}) {
    const emoji = user.isNewUser ? '🆕' : (user.method === 'passkey' ? '👤' : '👋')
    const title = user.isNewUser ? `${emoji} New User Login!` : `${emoji} User Logged In`
    const color = user.isNewUser ? DiscordColors.signup : DiscordColors.info

    await notifyDiscord({
        title,
        color,
        fields: [
            { name: 'Phone', value: user.phone, inline: true },
            { name: 'Name', value: user.displayName || 'Not set', inline: true },
            { name: 'Type', value: user.isNewUser ? '🌟 First Login' : 'Returning User', inline: true },
            { name: 'Method', value: user.method || 'SMS OTP', inline: true },
        ]
    })
}
