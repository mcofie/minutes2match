/**
 * Admin API: Notify users with incomplete profiles
 * POST /api/admin/notify-incomplete-profiles
 * 
 * Finds users missing key profile details and sends them SMS reminders
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { M2MDatabase } from '~/types/database.types'

// Define required profile fields for a "complete" profile
const REQUIRED_FIELDS = ['display_name', 'photo_url', 'birth_date', 'gender', 'dating_persona'] as const

// Minimum number of missing fields to be considered "incomplete"
const MIN_MISSING_FIELDS = 2

export default defineEventHandler(async (event) => {
    // 1. Verify admin access
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.sub  // JWT uses 'sub' for user ID
    if (!user || !userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole<M2MDatabase>(event)

    // Check if user is admin
    const { data: admin } = await client
        .schema('m2m')
        .from('admins')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // 2. Fetch data
    const body = await readBody(event).catch(() => ({}))
    const dryRun = body.dryRun === true
    const customMessage = body.message as string | undefined

    const { data: profiles, error: profilesError } = await client
        .schema('m2m')
        .from('profiles')
        .select('id, phone, display_name, photo_url, birth_date, gender, dating_persona')
        .eq('is_verified', true)

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        throw createError({ statusCode: 500, message: 'Failed to fetch profiles' })
    }

    // 3. Logic
    const incompleteProfiles = (profiles || []).filter((profile) => {
        const missingFields = REQUIRED_FIELDS.filter(field => {
            const value = profile[field as keyof typeof profile]
            return !value || (typeof value === 'string' && value.trim() === '')
        })
        return missingFields.length >= MIN_MISSING_FIELDS
    }).map((profile) => {
        const missingFields = REQUIRED_FIELDS.filter(field => {
            const value = profile[field as keyof typeof profile]
            return !value || (typeof value === 'string' && value.trim() === '')
        })
        return {
            ...profile,
            missingFields,
            completenessPercent: Math.round(((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100)
        }
    })

    if (dryRun) {
        return {
            success: true,
            dryRun: true,
            totalIncomplete: incompleteProfiles.length,
            profiles: incompleteProfiles.map((p) => ({
                id: p.id,
                phone: p.phone,
                displayName: p.display_name || 'Unknown',
                missingFields: p.missingFields,
                completenessPercent: p.completenessPercent
            }))
        }
    }

    // 4. Notifications
    const config = useRuntimeConfig()
    if (!config.hubtelClientId || !config.hubtelClientSecret) {
        throw createError({ statusCode: 500, message: 'Hubtel credentials not configured' })
    }

    const authToken = Buffer.from(`${config.hubtelClientId}:${config.hubtelClientSecret}`).toString('base64')
    const broadcastId = crypto.randomUUID()
    const results: Array<{ phone: string; status: 'sent' | 'failed'; error?: string }> = []
    const defaultMessage = `Hi! Your Minutes 2 Match profile is incomplete. Complete it to unlock better matches! Visit: minutes2match.com/me`

    for (const profile of incompleteProfiles) {
        const message = customMessage || defaultMessage
        try {
            await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: { From: 'M2Match', To: profile.phone, Content: message }
            })

            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name || 'Unknown',
                    message,
                    status: 'sent',
                    broadcast_id: broadcastId,
                    sent_by: userId
                })
            results.push({ phone: profile.phone, status: 'sent' })
        } catch (error: any) {
            console.error(`Failed to send SMS to ${profile.phone}:`, error)
            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name || 'Unknown',
                    message,
                    status: 'failed',
                    broadcast_id: broadcastId,
                    sent_by: userId
                })
            results.push({ phone: profile.phone, status: 'failed', error: error.message })
        }
    }

    return {
        success: true,
        broadcastId,
        totalIncomplete: incompleteProfiles.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        results
    }
})
