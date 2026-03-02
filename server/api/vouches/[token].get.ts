/**
 * Get Vouch by Token
 * GET /api/vouches/[token]
 * 
 * Public endpoint - returns vouch details for a friend's landing page.
 * The token identifies which friend (A or B) is viewing.
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const token = getRouterParam(event, 'token')

    if (!token) {
        throw createError({ statusCode: 400, message: 'Missing token' })
    }

    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    // Try to find the vouch by friend A or friend B token
    let vouch = null
    let friendRole: 'a' | 'b' | null = null

    // Check friend A token
    const { data: vouchA } = await supabase
        .from('vouches')
        .select('*')
        .eq('friend_a_token', token)
        .maybeSingle()

    if (vouchA) {
        vouch = vouchA
        friendRole = 'a'
    } else {
        // Check friend B token
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
        throw createError({ statusCode: 404, message: 'Vouch not found or expired' })
    }

    // Check if expired
    if (new Date(vouch.expires_at) < new Date()) {
        throw createError({ statusCode: 410, message: 'This vouch has expired' })
    }

    // Return safe data (don't expose other friend's phone or tokens)
    const yourName = friendRole === 'a' ? vouch.friend_a_name : vouch.friend_b_name
    const yourAccepted = friendRole === 'a' ? vouch.friend_a_accepted : vouch.friend_b_accepted
    const otherName = friendRole === 'a' ? vouch.friend_b_name : vouch.friend_a_name

    return {
        id: vouch.id,
        matcherName: vouch.matcher_name,
        matcherNote: vouch.matcher_note,
        yourName,
        yourAccepted,
        otherName,
        friendRole,
        status: vouch.status,
        createdAt: vouch.created_at,
        expiresAt: vouch.expires_at
    }
})
