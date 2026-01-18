/**
 * Admin Middleware
 * Protects admin routes - only users in admins table can access
 */

export default defineNuxtRouteMiddleware(async (to) => {
    // Skip middleware for login page
    if (to.path === '/admin/login') {
        return
    }

    const supabase = useSupabaseClient()

    // Get current session directly from Supabase (more reliable than useSupabaseUser)
    const { data: { session } } = await supabase.auth.getSession()

    // Must be logged in
    if (!session?.user) {
        console.log('[Admin Middleware] No session, redirecting to login')
        return navigateTo('/admin/login')
    }

    // Check if user is an admin
    const { data: admin, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', session.user.id)
        .single()

    if (error || !admin) {
        console.log('[Admin Middleware] Not an admin, redirecting to login', error)
        return navigateTo('/admin/login')
    }

    console.log('[Admin Middleware] Admin verified:', admin.role)
    // Admin is authorized, allow access
})
