/**
 * Respond to a Vouch
 * POST /api/vouches/respond
 * 
 * Public endpoint - friend accepts or declines a vouch.
 * When both accept, status moves to 'matched' and matcher is notified.
 */

import { createClient } from '@supabase/supabase-js'
import { notifyDiscord, DiscordColors } from '~/server/utils/discord'

export default defineEventHandler(async (event) => {
    const { token, accept } = await readBody(event)

    if (!token || typeof accept !== 'boolean') {
        throw createError({ statusCode: 400, message: 'Missing token or accept field' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Find vouch by token
    let vouch = null
    let friendRole: 'a' | 'b' | null = null

    const { data: vouchA } = await supabase
        .from('vouches')
        .select('*')
        .eq('friend_a_token', token)
        .maybeSingle()

    if (vouchA) {
        vouch = vouchA
        friendRole = 'a'
    } else {
        const { data: vouchB } = await supabase
            .from('vouches')
            .select('*')
            .eq('friend_b_token', token)
            .maybeSingle()

        if (vouchB) {
            vouch = vouchB
            friendRole = 'b'
        }
    }

    if (!vouch) {
        throw createError({ statusCode: 404, message: 'Vouch not found' })
    }

    if (vouch.status === 'matched' || vouch.status === 'declined' || vouch.status === 'expired') {
        throw createError({ statusCode: 400, message: 'This vouch is no longer active' })
    }

    if (new Date(vouch.expires_at) < new Date()) {
        throw createError({ statusCode: 410, message: 'This vouch has expired' })
    }

    // Check if already responded
    const alreadyAccepted = friendRole === 'a' ? vouch.friend_a_accepted : vouch.friend_b_accepted
    if (alreadyAccepted) {
        return { success: true, message: 'You have already accepted this vouch', status: vouch.status }
    }

    if (!accept) {
        // Decline
        await supabase
            .from('vouches')
            .update({ status: 'declined' })
            .eq('id', vouch.id)

        return { success: true, message: 'Vouch declined', status: 'declined' }
    }

    // Accept
    const now = new Date().toISOString()
    const updateFields: any = {}

    if (friendRole === 'a') {
        updateFields.friend_a_accepted = true
        updateFields.friend_a_accepted_at = now
    } else {
        updateFields.friend_b_accepted = true
        updateFields.friend_b_accepted_at = now
    }

    // Check if the other friend has already accepted
    const otherAccepted = friendRole === 'a' ? vouch.friend_b_accepted : vouch.friend_a_accepted

    if (otherAccepted) {
        // BOTH accepted → matched!
        updateFields.status = 'matched'
    } else {
        // Only one accepted so far
        updateFields.status = 'partial'
    }

    await supabase
        .from('vouches')
        .update(updateFields)
        .eq('id', vouch.id)

    // If matched, notify everyone
    if (updateFields.status === 'matched') {
        const baseUrl = config.public.baseUrl || 'https://minutes2match.com'

        // Notify matcher
        const matcherMessage = `Great news ${vouch.matcher_name}! ${vouch.friend_a_name} and ${vouch.friend_b_name} both accepted your vouch! Your matchmaking worked`
        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to: vouch.matcher_phone, message: matcherMessage }
            })
        } catch (e) {
            console.error('[Vouch] Failed to notify matcher:', e)
        }

        // Notify Friend A with Friend B's name and phone
        const friendAMessage = `${vouch.friend_a_name}, you've been matched with ${vouch.friend_b_name} on Minutes2Match! Your friend ${vouch.matcher_name} vouched for this connection. Reach out to them at ${vouch.friend_b_phone}. Visit ${baseUrl} to learn more!`
        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to: vouch.friend_a_phone, message: friendAMessage }
            })
        } catch (e) {
            console.error('[Vouch] Failed to notify Friend A:', e)
        }

        // Notify Friend B with Friend A's name and phone
        const friendBMessage = `${vouch.friend_b_name}, you've been matched with ${vouch.friend_a_name} on Minutes2Match! Your friend ${vouch.matcher_name} vouched for this connection. Reach out to them at ${vouch.friend_a_phone}. Visit ${baseUrl} to learn more!`
        try {
            await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to: vouch.friend_b_phone, message: friendBMessage }
            })
        } catch (e) {
            console.error('[Vouch] Failed to notify Friend B:', e)
        }

        // Discord
        await notifyDiscord({
            title: '💕 Vouch Match Made!',
            description: `${vouch.matcher_name} successfully matched ${vouch.friend_a_name} & ${vouch.friend_b_name}!`,
            color: DiscordColors.match,
        })
    }

    return {
        success: true,
        status: updateFields.status,
        message: updateFields.status === 'matched'
            ? 'You\'re matched! Both of you will receive details shortly.'
            : 'Accepted! Waiting for the other person to respond.'
    }
})
