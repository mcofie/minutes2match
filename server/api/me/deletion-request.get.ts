import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        const userId = user?.id || (user as any)?.sub

        if (!userId) {
            return { success: true, request: null }
        }

        const client = serverSupabaseServiceRole(event)

        // Query active or latest account deletion request for this user in m2m schema
        const { data: request, error } = await (client as any)
            .schema('m2m')
            .from('account_deletion_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            // Try public schema fallback
            const { data: pubReq, error: pubError } = await client
                .from('account_deletion_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (!pubError) {
                return { success: true, request: pubReq || null }
            }

            console.warn('[Deletion Request GET] Error or table missing:', error.message)
            return { success: true, request: null }
        }

        return {
            success: true,
            request: request || null
        }
    } catch (err: any) {
        console.warn('[Deletion Request GET] Exception handled:', err?.message || err)
        return {
            success: true,
            request: null
        }
    }
})
