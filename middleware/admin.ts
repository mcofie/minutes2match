import type { M2MDatabase } from '~/types/database.types'
/**
 * Admin Middleware
 * Protects admin routes - only users in admins table can access
 * 
 * Uses both getSession() and getUser() for Safari compatibility.
 */

export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware for login page
    if (to.path === '/admin/login') {
        return
    }

    const supabase = useSupabaseClient<M2MDatabase>()

    // Try to get the current user via multiple methods
    let userId: string | null = null

    // Method 1: Try getSession (reads from storage - fast)
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            userId = session.user.id
        }
    } catch { }

    // Method 2: If session not found, try getUser (verifies with server)
    if (!userId) {
        for (let i = 0; i < 3; i++) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    userId = user.id
                    break
                }
            } catch { }

            if (import.meta.client && i < 2) {
                await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)))
            } else {
                break
            }
        }
    }

    // Must be logged in
    if (!userId) {
        console.log('[Admin Middleware] No session found, redirecting to login')
        return navigateTo('/admin/login')
    }

    interface Admin {
        role: 'super_admin' | 'moderator' | 'support'
    }

    const { data, error } = await supabase
        .schema('m2m')
        .from('admins')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

    const admin = data as unknown as Admin | null

    if (error || !admin) {
        console.log('[Admin Middleware] Not an admin, redirecting to login', error)
        return navigateTo('/admin/login')
    }

    console.log('[Admin Middleware] Admin verified:', admin.role)
})
