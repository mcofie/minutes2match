/**
 * Admin Analytics API
 * GET /api/admin/analytics
 * 
 * Returns aggregated analytics data for the admin dashboard
 */

import { createClient } from '@supabase/supabase-js'

interface AnalyticsData {
    users: {
        total: number
        today: number
        thisWeek: number
        thisMonth: number
        byGender: { male: number; female: number }
    }
    matches: {
        total: number
        unlocked: number
        pending: number
        partialPayment: number
    }
    payments: {
        totalRevenue: number
        todayRevenue: number
        thisWeekRevenue: number
        thisMonthRevenue: number
        byPurpose: { match_unlock: number; event_ticket: number }
        successCount: number
        pendingCount: number
    }
    events: {
        total: number
        upcoming: number
        totalBookings: number
        confirmedBookings: number
    }
}

export default defineEventHandler(async (event): Promise<AnalyticsData> => {
    const config = useRuntimeConfig()

    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({
            statusCode: 500,
            message: 'Server configuration error'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'm2m' }
    })

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Fetch all data in parallel
    const [
        { count: totalUsers },
        { count: todayUsers },
        { count: weekUsers },
        { count: monthUsers },
        { count: maleUsers },
        { count: femaleUsers },
        { count: totalMatches },
        { count: unlockedMatches },
        { count: pendingMatches },
        { count: partialPaymentMatches },
        { data: allPayments },
        { count: totalEvents },
        { count: upcomingEvents },
        { count: totalBookings },
        { count: confirmedBookings }
    ] = await Promise.all([
        // User counts
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('gender', 'male'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('gender', 'female'),

        // Match counts
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'unlocked'),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'partial_payment'),

        // Payments - need full data for revenue calculations
        supabase.from('payments').select('amount, status, purpose, created_at'),

        // Events
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('date', now.toISOString()),
        supabase.from('event_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('event_bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
    ])

    // Calculate payment stats
    const successPayments = allPayments?.filter(p => p.status === 'success') || []
    const pendingPayments = allPayments?.filter(p => p.status === 'pending') || []

    const totalRevenue = successPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const todayRevenue = successPayments
        .filter(p => new Date(p.created_at) >= new Date(startOfToday))
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    const thisWeekRevenue = successPayments
        .filter(p => new Date(p.created_at) >= new Date(startOfWeek))
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    const thisMonthRevenue = successPayments
        .filter(p => new Date(p.created_at) >= new Date(startOfMonth))
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    const matchUnlockRevenue = successPayments
        .filter(p => p.purpose === 'match_unlock')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    const eventTicketRevenue = successPayments
        .filter(p => p.purpose === 'event_ticket')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

    return {
        users: {
            total: totalUsers || 0,
            today: todayUsers || 0,
            thisWeek: weekUsers || 0,
            thisMonth: monthUsers || 0,
            byGender: {
                male: maleUsers || 0,
                female: femaleUsers || 0
            }
        },
        matches: {
            total: totalMatches || 0,
            unlocked: unlockedMatches || 0,
            pending: pendingMatches || 0,
            partialPayment: partialPaymentMatches || 0
        },
        payments: {
            totalRevenue,
            todayRevenue,
            thisWeekRevenue,
            thisMonthRevenue,
            byPurpose: {
                match_unlock: matchUnlockRevenue,
                event_ticket: eventTicketRevenue
            },
            successCount: successPayments.length,
            pendingCount: pendingPayments.length
        },
        events: {
            total: totalEvents || 0,
            upcoming: upcomingEvents || 0,
            totalBookings: totalBookings || 0,
            confirmedBookings: confirmedBookings || 0
        }
    }
})
