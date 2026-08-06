import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const userId = user.id || (user as any).sub
    const client = await serverSupabaseServiceRole(event)

    // Admin verification check
    const { data: admin } = await (client as any)
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single()

    if (!admin) {
        const { data: publicAdmin } = await client
            .from('admins')
            .select('role')
            .eq('id', userId)
            .single()
        if (!publicAdmin) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
        }
    }

    const query = getQuery(event)
    const statusFilter = (query.status as string) || ''
    const searchQuery = (query.search as string || '').toLowerCase().trim()

    // Fetch deletion requests (m2m schema)
    let dbQuery = (client as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (statusFilter) {
        dbQuery = dbQuery.eq('status', statusFilter)
    }

    let { data: requests, error } = await dbQuery

    if (error && (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist') || error.message?.includes('not find'))) {
        let pubDbQuery = client
            .from('account_deletion_requests')
            .select('*')
            .order('created_at', { ascending: false })

        if (statusFilter) {
            pubDbQuery = pubDbQuery.eq('status', statusFilter)
        }

        const pubRes = await pubDbQuery
        if (!pubRes.error) {
            requests = pubRes.data
            error = null
        } else {
            console.warn('[Admin Deletion Requests] Table missing in DB')
            return {
                success: true,
                requests: [],
                stats: { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
            }
        }
    }

    if (error) {
        console.error('[Admin Deletion Requests] Error:', error)
        return {
            success: true,
            requests: [],
            stats: { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        }
    }

    if (!requests || requests.length === 0) {
        return {
            success: true,
            requests: [],
            stats: { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
        }
    }

    // Collect user IDs for profile details lookup
    const userIds = [...new Set(requests.map((r: any) => r.user_id))]

    const { data: profiles } = await (client as any)
        .schema('m2m')
        .from('profiles')
        .select('id, display_name, phone, photo_url, gender, birth_date, created_at')
        .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Calculate stats
    const stats = {
        pending: requests.filter((r: any) => r.status === 'pending').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        rejected: requests.filter((r: any) => r.status === 'rejected').length,
        cancelled: requests.filter((r: any) => r.status === 'cancelled').length
    }

    // Combine request with profile info
    let enrichedRequests = requests.map((req: any) => {
        const prof: any = profileMap.get(req.user_id) || {}
        return {
            ...req,
            user_display_name: prof.display_name || 'Anonymous User',
            user_phone: prof.phone || 'N/A',
            user_photo_url: prof.photo_url || null,
            user_gender: prof.gender || null,
            user_birth_date: prof.birth_date || null,
            user_created_at: prof.created_at || null
        }
    })

    if (searchQuery) {
        enrichedRequests = enrichedRequests.filter((r: any) =>
            r.user_display_name.toLowerCase().includes(searchQuery) ||
            r.user_phone.toLowerCase().includes(searchQuery) ||
            (r.reason && r.reason.toLowerCase().includes(searchQuery))
        )
    }

    return {
        success: true,
        requests: enrichedRequests,
        stats
    }
})
