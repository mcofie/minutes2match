/**
 * Get Shot by Token
 * GET /api/shots/[token]
 * 
 * Public endpoint - returns shot details for the target's landing page.
 * Initially hides shooter identity until "unlocked".
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

    const { data: shot } = await supabase
        .from('shots')
        .select('*')
        .eq('target_token', token)
        .maybeSingle()

    if (!shot) {
        throw createError({ statusCode: 404, message: 'Shot not found' })
    }

    // Check if expired
    if (new Date(shot.expires_at) < new Date()) {
        throw createError({ statusCode: 410, message: 'This shot has expired' })
    }

    // Check payment status
    if (shot.payment_status !== 'success') {
        throw createError({ statusCode: 402, message: 'Payment not yet confirmed' })
    }

    // Mark as viewed if first time
    if (shot.status === 'sent') {
        await supabase
            .from('shots')
            .update({ status: 'viewed', viewed_at: new Date().toISOString() })
            .eq('id', shot.id)
    }

    // Return data based on unlock status
    const isUnlocked = shot.status === 'unlocked' || (shot.status === 'viewed' && shot.unlocked_at)

    return {
        id: shot.id,
        targetName: shot.target_name,
        status: shot.status === 'sent' ? 'viewed' : shot.status,
        createdAt: shot.created_at,
        expiresAt: shot.expires_at,
        // Hints are always visible — they're the mystery clues
        hints: shot.hints || [],
        // Only reveal shooter info if unlocked
        shooterName: isUnlocked ? shot.shooter_name : null,
        shooterPhone: isUnlocked ? shot.shooter_phone : null,
        message: isUnlocked ? shot.message : null,
        isUnlocked
    }
})
