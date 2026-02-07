/**
 * Submit User Report API
 * POST /api/reports
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    console.log('[Reports] User object:', JSON.stringify(user, null, 2))

    if (!user || !user.id) {
        throw createError({ statusCode: 401, message: 'Unauthorized - No valid user session' })
    }

    const body = await readBody(event)

    const { reportedUserId, matchId, reason, description } = body

    if (!reportedUserId || !reason) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: reportedUserId and reason are required'
        })
    }

    const validReasons = [
        'inappropriate_behavior',
        'fake_profile',
        'harassment',
        'spam',
        'underage',
        'other'
    ]

    if (!validReasons.includes(reason)) {
        throw createError({
            statusCode: 400,
            message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
        })
    }

    // Cannot report self
    if (reportedUserId === user.id) {
        throw createError({
            statusCode: 400,
            message: 'Cannot report yourself'
        })
    }

    const client = serverSupabaseServiceRole(event)

    // Check for duplicate reports (same reporter, same reported user, within last 24 hours)
    const { data: existingReport } = await client
        .schema('m2m')
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('reported_user_id', reportedUserId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle()

    if (existingReport) {
        throw createError({
            statusCode: 409,
            message: 'You have already reported this user recently. Our team is reviewing your report.'
        })
    }

    // Create report
    const { data: report, error } = await client
        .schema('m2m')
        .from('reports')
        .insert({
            reporter_id: user.id,
            reported_user_id: reportedUserId,
            match_id: matchId || null,
            reason,
            description: description || null,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('[Reports] Failed to create report:', JSON.stringify(error, null, 2))
        throw createError({
            statusCode: 500,
            message: `Failed to submit report: ${error.message || error.code || 'Unknown error'}`
        })
    }

    console.log(`[Reports] New report created: ${report.id} by ${user.id} against ${reportedUserId}`)

    return {
        success: true,
        message: 'Report submitted successfully. Our team will review it shortly.',
        reportId: report.id
    }
})
