/**
 * Admin API: Notify users with missing optional details
 * POST /api/admin/notify-missing-details
 * 
 * Finds users missing secondary profile details (Height, Occupation, Religion, etc.)
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

// Define secondary fields to check
const SECONDARY_FIELDS = [
    'height_cm',
    'occupation',
    'religion',
    'genotype',
    'about_me',
    'interests'
] as const

export default defineEventHandler(async (event) => {
    console.log('Running notify-missing-details...')

    // Verify admin access
    const user = await serverSupabaseUser(event)
    const userId = (user as any)?.sub  // JWT uses 'sub' for user ID
    console.log('User ID:', userId)
    if (!user || !userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const client = serverSupabaseServiceRole(event) as any  // Cast to any to bypass TS schema typing issues

    // Check if user is admin
    let admin;
    try {
        const { data, error } = await client
            .schema('m2m')
            .from('admins')
            .select('id')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Admin check error:', error)
        }
        admin = data
    } catch (e) {
        console.error('Supabase client error:', e)
    }

    if (!admin) {
        throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // Get optional parameters from request body
    const body = await readBody(event).catch(() => ({}))
    const dryRun = body.dryRun === true
    const customMessage = body.message as string | undefined

    // Fetch all profiles from m2m schema
    console.log('Fetching profiles from m2m schema...')
    const { data: profiles, error: profilesError } = await client
        .schema('m2m')
        .from('profiles')
        .select('id, phone, display_name, photo_url, height_cm, occupation, religion, genotype, about_me, interests, min_age, max_age, is_verified')

    // If profilesError is "relation m2m.profiles does not exist", we know schema is wrong.
    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        throw createError({ statusCode: 500, message: 'Failed to fetch profiles: ' + profilesError.message })
    }

    console.log(`Fetched ${profiles?.length ?? 0} profiles total`)

    // Use all profiles (removed verified check to capture all users missing details)
    const targetProfiles = (profiles || []).map((profile: any) => {
        const missingFields: string[] = []

        // Check standard fields
        SECONDARY_FIELDS.forEach(field => {
            const value = profile[field as keyof typeof profile]

            // Check based on type
            if (field === 'interests') {
                if (!Array.isArray(value) || value.length === 0) {
                    missingFields.push('Interests')
                }
            } else if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                // Convert snake_case to Title Case for display
                const label = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                missingFields.push(label)
            }
        })

        // Check Age Preferences (if strictly default 18-50, maybe consider "not set"? 
        // But for now let's assume if it's there it's fine, unless user explicitly filters for *changed* preferences.
        // The prompt says "without ... Age Preferences set". 
        // If the DB defaults to 18-50, we can't easily know if they "set" it or left it. 
        // I'll skip age prefs in "missing" list for now unless they are NULL, which is unlikely if defaulted.)
        // But if they are null:
        if (profile.min_age === null || profile.max_age === null) {
            missingFields.push('Age Preferences')
        }

        return {
            ...profile,
            missingFields
        }
    }).filter((p: any) => p.missingFields.length > 0)
    // Filter to only those with at least 1 missing field? 
    // Yes, "list of users without...".

    // If dry run, just return the list
    if (dryRun) {
        return {
            success: true,
            dryRun: true,
            totalCount: targetProfiles.length,
            profiles: targetProfiles.map((p: any) => ({
                id: p.id,
                phone: p.phone,
                displayName: p.display_name || 'Unknown',
                missingFields: p.missingFields
            }))
        }
    }

    // Send SMS reminders
    const config = useRuntimeConfig()

    if (!config.hubtelClientId || !config.hubtelClientSecret) {
        throw createError({ statusCode: 500, message: 'Hubtel credentials not configured' })
    }

    const authToken = Buffer.from(
        `${config.hubtelClientId}:${config.hubtelClientSecret}`
    ).toString('base64')

    const broadcastId = crypto.randomUUID()
    const results: Array<{ phone: string; status: 'sent' | 'failed'; error?: string }> = []

    // Default message
    const defaultMessage = `Hi! Please complete your profile details (Occupation, Genotype, Interests, etc.) to get better matches on Minutes 2 Match. Update here: minutes2match.com/me`

    for (const profile of targetProfiles) {
        const message = customMessage || defaultMessage

        try {
            await $fetch('https://smsc.hubtel.com/v1/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    From: 'M2Match',
                    To: profile.phone,
                    Content: message
                }
            })

            // Log to sms_history
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

            // Log failure
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

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    return {
        success: true,
        broadcastId,
        totalCount: targetProfiles.length,
        sent: sentCount,
        failed: failedCount,
        results
    }
})
