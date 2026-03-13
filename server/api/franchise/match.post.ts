import { serverSupabaseServiceRole } from '#supabase/server'
import { notifyUser } from '~/server/utils/notify'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { event_id, code } = body

    if (!event_id || !code) {
        throw createError({ statusCode: 400, message: 'Missing event ID or access code' })
    }

    const client = serverSupabaseServiceRole(event) as any

    // 1. Verify Organizer
    const { data: franchiseEvent, error: authError } = await client
        .schema('m2m')
        .from('franchise_events')
        .select('*')
        .eq('id', event_id)
        .eq('access_code', String(code).trim())
        .single()

    if (authError || !franchiseEvent) {
        throw createError({ statusCode: 403, message: 'Unauthorized' })
    }

    // 2. Fetch all participants and all "Yes" votes
    const { data: participants } = await client
        .schema('m2m')
        .from('franchise_participants')
        .select('user_id, participant_number, m2m.profiles(display_name, phone)')
        .eq('event_id', event_id)

    const { data: votes } = await client
        .schema('m2m')
        .from('speed_date_feedback')
        .select('*')
        .eq('event_id', event_id)
        .eq('vote', true)

    if (!participants || !votes) {
        return { success: false, message: 'No participants or votes found' }
    }

    // 3. Matchmaker Engine (Mutually Exclusive Logic)
    // Map participant numbers to user IDs for fast lookup
    const numToId = new Map(participants.map(p => [p.participant_number, p.user_id]))
    const idToInfo = new Map(participants.map(p => [p.user_id, p]))

    const matchesFound = []
    const processedPairs = new Set<string>()

    for (const vote of votes) {
        const fromId = vote.from_user_id
        const toId = numToId.get(vote.to_participant_number)
        const fromParticipantNum = idToInfo.get(fromId)?.participant_number

        if (!toId || !fromParticipantNum) continue

        // Check if the other person also said "Yes" to them
        const counterVote = votes.find(v =>
            v.from_user_id === toId &&
            v.to_participant_number === fromParticipantNum
        )

        if (counterVote) {
            const pairKey = [fromId, toId].sort().join(':')
            if (!processedPairs.has(pairKey)) {
                matchesFound.push({ user1: fromId, user2: toId })
                processedPairs.add(pairKey)
            }
        }
    }

    // 4. Record Matches and Notify
    // Franchise matches are "Pre-Unlocked"
    for (const match of matchesFound) {
        try {
            await client
                .schema('m2m')
                .from('matches')
                .upsert({
                    user_1_id: match.user1,
                    user_2_id: match.user2,
                    status: 'unlocked',
                    unlock_price: 0 // Franchise event matches are free
                })
        } catch (err) {
            console.error('[Franchise Match] Failed to record match:', err)
        }
    }

    // 5. Update Event Status
    await client
        .schema('m2m')
        .from('franchise_events')
        .update({ status: 'completed' })
        .eq('id', event_id)

    // 6. Broadcast Result Notification (Trigger SMS)
    // We send to everyone who participated
    for (const p of participants) {
        const user = (p.m2m as any).profiles
        if (user?.phone) {
            const matchCount = matchesFound.filter(m => m.user1 === p.user_id || m.user2 === p.user_id).length
            const message = matchCount > 0
                ? `Congrats ${user.display_name}! You matched with ${matchCount} people at ${franchiseEvent.title}! Reveal them now: https://m2match.com/matches`
                : `Thanks for joining ${franchiseEvent.title}! No matches this time, but 2,000+ others are waiting in the main pool: https://m2match.com/matches`

            await notifyUser(p.user_id, message)
        }
    }

    return {
        success: true,
        matchCount: matchesFound.length,
        notificationSent: participants.length
    }
})
