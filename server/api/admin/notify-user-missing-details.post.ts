/**
 * Admin API: Notify Individual User of Missing Profile Details
 * POST /api/admin/notify-user-missing-details
 * 
 * Target: Single User ID
 * Action: SMS + Internal Notification
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { randomUUID } from 'node:crypto'

const FIELD_LABELS: Record<string, string> = {
    display_name: 'Name',
    photo_url: 'Profile Photo',
    birth_date: 'Birth Date',
    gender: 'Gender',
    dating_persona: 'Dating Persona',
    height_cm: 'Height',
    occupation: 'Occupation',
    religion: 'Religion',
    genotype: 'Genotype',
    about_me: 'About Me',
    interests: 'Interests',
    location: 'Location',
    intent: 'Intent',
    interested_in: 'Interested In',
    instagram_handle: 'Instagram',
    snapchat_handle: 'Snapchat'
}

export default defineEventHandler(async (event) => {
    // Verify admin access
    const user = await serverSupabaseUser(event)
    const adminId = (user as any)?.sub

    if (!user || !adminId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any
    const body = await readBody(event)
    const { userId, dryRun, customSms, customNotification } = body

    if (!userId) {
        throw createError({ statusCode: 400, message: 'Missing userId' })
    }

    // Check if requester is admin
    const { data: admin } = await client
        .schema('m2m')
        .from('admins')
        .select('id')
        .eq('id', adminId)
        .single()

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await client
        .schema('m2m')
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError || !profile) {
        throw createError({ statusCode: 404, message: 'User not found' })
    }

    // Identify missing fields
    const missingFields: string[] = []

    // Core & Secondary fields
    const fieldsToCheck = Object.keys(FIELD_LABELS)
    fieldsToCheck.forEach(field => {
        const value = profile[field]
        if (field === 'interests') {
            if (!Array.isArray(value) || value.length === 0) {
                missingFields.push(FIELD_LABELS[field])
            }
        } else if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            missingFields.push(FIELD_LABELS[field])
        }
    })

    if (missingFields.length === 0) {
        return { success: true, message: 'Profile is already complete' }
    }

    // Build message
    const missingText = missingFields.join(', ')
    const smsMessage = customSms || `Hi ${profile.display_name || 'there'}! Your profile on Minutes 2 Match is missing: ${missingText}. Please update it at minutes2match.com/me to get better matches!`
    const notificationMessage = customNotification || `Your profile is missing some details: ${missingText}. Adding these will help us find better matches for you!`

    // Return preview if dryRun
    if (dryRun) {
        return {
            success: true,
            preview: true,
            missingFields,
            smsMessage,
            notificationMessage,
            phoneNumber: profile.phone
        }
    }

    // 1. Send SMS
    const config = useRuntimeConfig()
    let smsSent = false
    let smsError = null

    if (config.hubtelClientId && config.hubtelClientSecret) {
        try {
            const authToken = Buffer.from(`${config.hubtelClientId}:${config.hubtelClientSecret}`).toString('base64')
            await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    From: 'M2Match',
                    To: profile.phone,
                    Content: smsMessage
                }
            })
            smsSent = true

            // Log to sms_history
            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name || 'Unknown',
                    message: smsMessage,
                    status: 'sent',
                    sent_by: adminId
                })
        } catch (e: any) {
            console.error('Failed to send SMS:', e)
            smsError = e.message

            // Log failure
            await client
                .schema('m2m')
                .from('sms_history')
                .insert({
                    recipient_id: profile.id,
                    recipient_phone: profile.phone,
                    recipient_name: profile.display_name || 'Unknown',
                    message: smsMessage,
                    status: 'failed',
                    sent_by: adminId
                })
        }
    } else {
        smsError = 'SMS provider not configured'
    }

    // 2. Create Internal Notification
    const { error: notifError } = await client
        .schema('m2m')
        .from('notifications')
        .insert({
            user_id: profile.id,
            type: 'profile_reminder',
            title: 'Complete Your Profile ✍️',
            message: notificationMessage,
            data: { missingFields },
            read: false
        })

    if (notifError) {
        console.error('Failed to create notification:', notifError)
    }

    return {
        success: true,
        smsSent,
        smsError,
        notificationCreated: !notifError,
        missingFields
    }
})
