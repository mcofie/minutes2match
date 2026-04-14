import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { notifyFlashLobbyLifecycle } from '~/server/utils/discord'
import type { M2MDatabase } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    // 1. Verify admin access
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.id || (user as any)?.sub
    if (!user || !userId) throw createError({ statusCode: 401, message: 'Unauthorized' })

    const client = serverSupabaseServiceRole<M2MDatabase>(event)
    const { data: admin } = await client.schema('m2m').from('admins').select('id').eq('id', userId).maybeSingle()
    if (!admin) throw createError({ statusCode: 403, message: 'Admin access required' })

    // 2. Process body
    const body = await readBody(event)
    const { action, lobbyId, minutes, amount, unit } = body

    if (!lobbyId) throw createError({ statusCode: 400, message: 'Missing lobbyId' })

    const { data: lobby } = await client.schema('m2m').from('flash_lobbies').select('*').eq('id', lobbyId).single()
    if (!lobby) throw createError({ statusCode: 404, message: 'Lobby not found' })

    const now = new Date()
    let update: any = {}

    if (action === 'pause') {
        update = { is_paused: true, paused_at: now.toISOString() }
    } else if (action === 'resume') {
        if (!lobby.is_paused || !lobby.paused_at) {
             // If for some reason paused_at is missing, just resume as is
             update = { is_paused: false, paused_at: null }
        } else {
            const end = new Date(lobby.end_at).getTime()
            const pausedAt = new Date(lobby.paused_at).getTime()
            const timeLeft = end - pausedAt
            const newEnd = new Date(now.getTime() + timeLeft)
            update = { is_paused: false, paused_at: null, end_at: newEnd.toISOString() }
        }
    } else if (action === 'stop') {
        update = { end_at: now.toISOString(), is_paused: false }
    } else if (action === 'addTime') {
        const end = new Date(lobby.end_at)
        const incrementAmount = Number.isFinite(Number(amount)) ? Number(amount) : Number(minutes || 5)
        const incrementUnit = unit === 'days' ? 'days' : unit === 'hours' ? 'hours' : 'minutes'
        const multiplier = incrementUnit === 'days' ? 1440 : incrementUnit === 'hours' ? 60 : 1
        const newEnd = new Date(end.getTime() + incrementAmount * multiplier * 60000)
        update = { end_at: newEnd.toISOString() }
    } else if (action === 'broadcast') {
        update = { announcement: body.message, announcement_at: now.toISOString() }
    } else {
        throw createError({ statusCode: 400, message: 'Invalid action' })
    }

    const { data: updatedLobby, error: updateError } = await client.schema('m2m').from('flash_lobbies').update(update).eq('id', lobbyId).select().single()
    if (updateError) {
        console.error('[Admin] Lobby control update error:', updateError)
        throw createError({ statusCode: 500, message: updateError.message })
    }

    const actionMap: Record<string, 'paused' | 'resumed' | 'stopped' | 'broadcast' | null> = {
        pause: 'paused',
        resume: 'resumed',
        stop: 'stopped',
        addTime: null,
        broadcast: 'broadcast'
    }

    const lifecycleAction = actionMap[action]
    if (lifecycleAction) {
        await notifyFlashLobbyLifecycle({
            action: lifecycleAction,
            lobbyName: updatedLobby.title || lobby.title || 'Flash Lobby',
            startAt: updatedLobby.start_at,
            endAt: updatedLobby.end_at,
            announcement: action === 'broadcast' ? body.message : undefined
        })
    } else if (action === 'addTime') {
        await notifyFlashLobbyLifecycle({
            action: 'updated',
            lobbyName: updatedLobby.title || lobby.title || 'Flash Lobby',
            startAt: updatedLobby.start_at,
            endAt: updatedLobby.end_at
        })
    }

    return { success: true, lobby: updatedLobby }
})
