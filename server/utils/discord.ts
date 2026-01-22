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
} as const

/**
 * Send a notification to Discord via webhook
 */
export async function notifyDiscord(notification: DiscordNotification): Promise<void> {
    const config = useRuntimeConfig()
    const webhookUrl = config.discordWebhookUrl

    if (!webhookUrl) {
        console.warn('[Discord] Webhook URL not configured, skipping notification')
        return
    }

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

export async function notifyPaymentSuccess(payment: {
    amount: number
    currency: string
    purpose: string
    userEmail?: string
    reference: string
}) {
    const purposeEmoji = payment.purpose === 'match_unlock' ? '💕' : '🎟️'
    const purposeLabel = payment.purpose === 'match_unlock' ? 'Match Unlock' : 'Event Ticket'

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
}) {
    const emoji = user.isNewUser ? '🆕' : '👋'
    const title = user.isNewUser ? `${emoji} New User Login!` : `${emoji} User Logged In`
    const color = user.isNewUser ? DiscordColors.signup : DiscordColors.info

    await notifyDiscord({
        title,
        color,
        fields: [
            { name: 'Phone', value: user.phone, inline: true },
            { name: 'Name', value: user.displayName || 'Not set', inline: true },
            { name: 'Type', value: user.isNewUser ? '🌟 First Login' : 'Returning User', inline: true },
        ]
    })
}
