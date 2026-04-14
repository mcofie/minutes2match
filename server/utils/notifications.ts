import { notifyUser } from '~/server/utils/notify'

type NotificationClient = {
    schema: (name: string) => NotificationClient
    from: (table: string) => any
}

interface CreateNotificationOptions {
    userId: string
    type: string
    title: string
    message: string
    data?: Record<string, any>
    dedupeKey?: string
}

export async function createInAppNotification(client: NotificationClient, options: CreateNotificationOptions) {
    const payload = {
        user_id: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        data: {
            ...(options.data || {}),
            ...(options.dedupeKey ? { dedupe_key: options.dedupeKey } : {})
        },
        read: false
    }

    if (options.dedupeKey) {
        const { data: existing } = await client
            .schema('m2m')
            .from('notifications')
            .select('id')
            .eq('user_id', options.userId)
            .eq('type', options.type)
            .contains('data', { dedupe_key: options.dedupeKey })
            .maybeSingle()

        if (existing?.id) return existing
    }

    const { data, error } = await client
        .schema('m2m')
        .from('notifications')
        .insert(payload)
        .select('id')
        .maybeSingle()

    if (error) {
        console.error('[Notifications] Failed to create in-app notification:', error)
        return null
    }

    return data || null
}

export async function notifyFlashLobbySparkReceived(client: NotificationClient, options: {
    recipientId: string
    senderName: string
    lobbyId: string
    lobbyTitle: string
    intentId: string
}) {
    const dedupeKey = `flash-lobby-received:${options.intentId}`
    await createInAppNotification(client, {
        userId: options.recipientId,
        type: 'flash_lobby_spark',
        title: 'A new spark is waiting for you',
        message: `${options.senderName} shot their shot in ${options.lobbyTitle}. Open Minutes 2 Match after the room closes to see why.`,
        data: { lobby_id: options.lobbyId, intent_id: options.intentId },
        dedupeKey
    })

    try {
        await notifyUser(
            options.recipientId,
            `⚡ ${options.senderName} sent you a spark in ${options.lobbyTitle}. Open Minutes 2 Match after the room closes to read it.`,
            { type: 'generic', smsPriority: 'normal' }
        )
    } catch (error) {
        console.error('[FlashLobby] Failed to send spark received notification:', error)
    }
}

export async function notifyFlashLobbyMutualUnlocked(client: NotificationClient, options: {
    userIds: [string, string]
    userNames: [string, string]
    matchId: string
}) {
    await Promise.all(options.userIds.map((userId, index) => {
        const otherName = options.userNames[index === 0 ? 1 : 0]
        return createInAppNotification(client, {
            userId,
            type: 'flash_lobby_mutual',
            title: 'It’s a mutual spark',
            message: `${otherName} sparked you back, so your Flash Lobby match is already fully open.`,
            data: { match_id: options.matchId },
            dedupeKey: `flash-lobby-mutual:${options.matchId}:${userId}`
        })
    }))

    await Promise.all(options.userIds.map((userId, index) => {
        const otherName = options.userNames[index === 0 ? 1 : 0]
        return notifyUser(
            userId,
            `💥 Mutual spark with ${otherName}. Your Flash Lobby match is now fully unlocked.`,
            { type: 'match', matchId: options.matchId, smsPriority: 'high' }
        ).catch((error) => {
            console.error('[FlashLobby] Failed to send mutual unlock notification:', error)
        })
    }))
}

export async function notifyFlashLobbyResolved(client: NotificationClient, options: {
    userId: string
    matchId: string
    title: string
    message: string
    dedupeKey: string
}) {
    await createInAppNotification(client, {
        userId: options.userId,
        type: 'flash_lobby_resolved',
        title: options.title,
        message: options.message,
        data: { match_id: options.matchId },
        dedupeKey: options.dedupeKey
    })
}

export async function notifyFlashLobbyLive(client: NotificationClient, options: {
    userId: string
    lobbyId: string
    lobbyTitle: string
}) {
    const dedupeKey = `flash-lobby-live:${options.lobbyId}:${options.userId}`

    await createInAppNotification(client, {
        userId: options.userId,
        type: 'flash_lobby_live',
        title: 'Flash Lobby is live now',
        message: `${options.lobbyTitle} just opened. Jump in now and send your sparks before the room closes.`,
        data: { lobby_id: options.lobbyId, route: '/lobby' },
        dedupeKey
    })

    try {
        await notifyUser(
            options.userId,
            `⚡ ${options.lobbyTitle} is live now on Minutes 2 Match. Open the app and jump into the Flash Lobby before it closes.`,
            { type: 'event', smsPriority: 'high' }
        )
    } catch (error) {
        console.error('[FlashLobby] Failed to send live reminder notification:', error)
    }
}
