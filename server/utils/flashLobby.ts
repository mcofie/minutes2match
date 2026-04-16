import { createClient } from '@supabase/supabase-js'
import { calculateCompatibility } from '~/utils/compatibility'
import { normalizeGender, normalizeInterest } from '~/server/utils/flashLobbyRules'
import { notifyFlashLobbyLive } from '~/server/utils/notifications'

export const FLASH_LOBBY_RESPONSE_WINDOW_HOURS = 72

function getServiceClient() {
    const config = useRuntimeConfig()
    return createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' },
        auth: { persistSession: false }
    })
}

export async function getActiveFlashLobby() {
    const supabase = getServiceClient()
    const now = new Date().toISOString()
    const { data } = await supabase
        .from('flash_lobbies')
        .select('*')
        .lte('start_at', now)
        .gte('end_at', now)
        .maybeSingle()

    return data || null
}

export async function getMostRecentFlashLobby() {
    const supabase = getServiceClient()
    const now = new Date().toISOString()
    const { data } = await supabase
        .from('flash_lobbies')
        .select('*')
        .lt('end_at', now)
        .order('end_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    return data || null
}

export async function createFlashLobbyMatch(options: {
    initiatorId: string
    targetId: string
    lobbyId: string
    matchScore?: number
    unlockPrice?: number
    status?: 'pending_payment' | 'unlocked'
    reasons?: string[]
    fullyUnlocked?: boolean
}) {
    const supabase = getServiceClient()
    const {
        initiatorId,
        targetId,
        lobbyId,
        matchScore = 0,
        unlockPrice = 15,
        status = 'pending_payment',
        reasons = ['Flash Lobby Spark ⚡'],
        fullyUnlocked = false
    } = options

    const { data: existing } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_1_id.eq.${initiatorId},user_2_id.eq.${targetId}),and(user_1_id.eq.${targetId},user_2_id.eq.${initiatorId})`)
        .maybeSingle()

    if (existing) {
        if (fullyUnlocked && existing.status !== 'unlocked') {
            const { data: updatedMatch, error: updateError } = await supabase
                .from('matches')
                .update({
                    status: 'unlocked',
                    unlocked_at: new Date().toISOString(),
                    user_1_paid: true,
                    user_2_paid: true,
                    user_1_paid_at: existing.user_1_paid_at || new Date().toISOString(),
                    user_2_paid_at: existing.user_2_paid_at || new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (updateError || !updatedMatch) {
                throw createError({ statusCode: 500, message: updateError?.message || 'Failed to unlock existing flash lobby match' })
            }

            return updatedMatch
        }

        return existing
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    const { data, error } = await supabase
        .from('matches')
        .insert({
            user_1_id: initiatorId,
            user_2_id: targetId,
            status,
            unlock_price: unlockPrice,
            match_score: matchScore,
            created_by_label: 'flash_lobby',
            match_reasons: reasons,
            expires_at: status === 'unlocked' ? null : expiresAt,
            unlocked_at: status === 'unlocked' ? now : null,
            user_1_paid: fullyUnlocked,
            user_2_paid: fullyUnlocked,
            user_1_paid_at: fullyUnlocked ? now : null,
            user_2_paid_at: fullyUnlocked ? now : null,
            user_1_amount_paid: fullyUnlocked ? 0 : null,
            user_2_amount_paid: fullyUnlocked ? 0 : null
        })
        .select()
        .single()

    if (error || !data) {
        throw createError({ statusCode: 500, message: error?.message || 'Failed to create flash lobby match' })
    }

    return data
}

function toCompatibilityProfile(profile: any, fallbackInterest: 'male' | 'female' | 'everyone' = 'everyone') {
    return {
        ...profile,
        gender: normalizeGender(profile?.gender) || 'female',
        interested_in: normalizeInterest(profile?.interested_in) || fallbackInterest
    }
}

function calculateAge(birthDate?: string | null) {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return null
    let age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

function calculateLobbyFallbackScore(viewer: any, candidate: any) {
    let score = 52

    const viewerInterests = Array.isArray(viewer?.interests) ? viewer.interests : []
    const candidateInterests = Array.isArray(candidate?.interests) ? candidate.interests : []
    const sharedInterests = viewerInterests.filter((interest: string) => candidateInterests.includes(interest))
    score += Math.min(18, sharedInterests.length * 6)

    if (viewer?.intent && candidate?.intent) {
        if (viewer.intent === candidate.intent) score += 12
        else if (
            (viewer.intent === 'marriage' && candidate.intent === 'serious') ||
            (viewer.intent === 'serious' && candidate.intent === 'marriage')
        ) score += 7
    }

    if (viewer?.dating_persona && candidate?.dating_persona) {
        score += viewer.dating_persona === candidate.dating_persona ? 8 : 4
    }

    if (viewer?.location && candidate?.location && viewer.location === candidate.location) {
        score += 6
    }

    const viewerAge = calculateAge(viewer?.birth_date)
    const candidateAge = calculateAge(candidate?.birth_date)
    if (viewerAge !== null && candidateAge !== null) {
        const gap = Math.abs(viewerAge - candidateAge)
        if (gap <= 3) score += 8
        else if (gap <= 7) score += 5
        else if (gap <= 12) score += 2
        else score -= 6
    }

    if (viewer?.religion && candidate?.religion && viewer.religion === candidate.religion) {
        score += 4
    }

    return Math.max(35, Math.min(95, Math.round(score)))
}

export function calculateFlashLobbyPreviewScore(options: {
    viewerProfile: any
    viewerAnswers?: Array<{ question_key: string, answer: string }>
    candidateProfile: any
    candidateAnswers?: Array<{ question_key: string, answer: string }>
}) {
    const viewerProfile = toCompatibilityProfile(options.viewerProfile)
    const candidateProfile = toCompatibilityProfile(options.candidateProfile, 'everyone')
    candidateProfile.interested_in = viewerProfile.gender || candidateProfile.interested_in || 'everyone'

    const compatibilityScore = calculateCompatibility(
        viewerProfile as any,
        options.viewerAnswers || [],
        candidateProfile as any,
        options.candidateAnswers || []
    ).score

    if (compatibilityScore > 0) {
        return compatibilityScore
    }

    return calculateLobbyFallbackScore(viewerProfile, candidateProfile)
}

export async function calculateFlashLobbyMatchScore(options: {
    initiatorId: string
    targetId: string
}) {
    const supabase = getServiceClient()
    const { initiatorId, targetId } = options

    const [{ data: profiles }, { data: answers }] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, gender, interested_in, intent, location, religion, genotype, birth_date, dating_persona, occupation, badges, dealbreakers, min_age, max_age, preferences_extracted, interests')
            .in('id', [initiatorId, targetId]),
        supabase
            .from('vibe_answers')
            .select('user_id, question_key, answer_value')
            .in('user_id', [initiatorId, targetId])
    ])

    const initiatorProfileRaw = (profiles || []).find((profile: any) => profile.id === initiatorId)
    const targetProfileRaw = (profiles || []).find((profile: any) => profile.id === targetId)

    if (!initiatorProfileRaw || !targetProfileRaw) {
        return 0
    }

    const initiatorAnswers = (answers || [])
        .filter((answer: any) => answer.user_id === initiatorId)
        .map((answer: any) => ({
            question_key: answer.question_key,
            answer: answer.answer_value
        }))

    const targetAnswers = (answers || [])
        .filter((answer: any) => answer.user_id === targetId)
        .map((answer: any) => ({
            question_key: answer.question_key,
            answer: answer.answer_value
        }))

    return calculateFlashLobbyPreviewScore({
        viewerProfile: initiatorProfileRaw,
        viewerAnswers: initiatorAnswers,
        candidateProfile: targetProfileRaw,
        candidateAnswers: targetAnswers
    })
}

export async function expireStaleFlashLobbyIntents() {
    const supabase = getServiceClient()
    const cutoff = new Date(Date.now() - FLASH_LOBBY_RESPONSE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

    const { data: staleLobbies } = await supabase
        .from('flash_lobbies')
        .select('id')
        .lt('end_at', cutoff)

    const staleLobbyIds = (staleLobbies || []).map((lobby) => lobby.id)
    if (staleLobbyIds.length === 0) return 0

    const { data: staleIntents } = await supabase
        .from('flash_lobby_intents')
        .select('id')
        .in('lobby_id', staleLobbyIds)
        .eq('status', 'pending')

    if (!staleIntents?.length) return 0

    const staleIntentIds = staleIntents.map((intent) => intent.id)
    const { error } = await supabase
        .from('flash_lobby_intents')
        .update({
            status: 'expired',
            expired_at: new Date().toISOString()
        })
        .in('id', staleIntentIds)

    if (error) {
        console.error('[FlashLobby] Failed to expire stale intents:', error)
        return 0
    }

    return staleIntentIds.length
}

export async function processFlashLobbyLiveReminders() {
    const supabase = getServiceClient()
    const now = new Date().toISOString()

    const { data: liveLobbies } = await supabase
        .from('flash_lobbies')
        .select('id, title')
        .lte('start_at', now)
        .gte('end_at', now)

    if (!liveLobbies?.length) return 0

    const lobbyIds = liveLobbies.map((lobby) => lobby.id)
    const liveLobbyById = new Map(liveLobbies.map((lobby) => [lobby.id, lobby]))

    const { data: reminders } = await supabase
        .from('flash_lobby_reminders')
        .select('id, user_id, lobby_id, notified_live_at')
        .in('lobby_id', lobbyIds)
        .is('notified_live_at', null)

    if (!reminders?.length) return 0

    let processed = 0
    for (const reminder of reminders) {
        const lobby = liveLobbyById.get(reminder.lobby_id)
        if (!lobby) continue

        await notifyFlashLobbyLive(supabase as any, {
            userId: reminder.user_id,
            lobbyId: reminder.lobby_id,
            lobbyTitle: lobby.title || 'Flash Lobby'
        })

        await supabase
            .from('flash_lobby_reminders')
            .update({ notified_live_at: new Date().toISOString() })
            .eq('id', reminder.id)

        processed++
    }

    return processed
}
