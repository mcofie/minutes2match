/**
 * Guest Middleware
 * Forbid logged in users from accessing guest-only pages (like login)
 * Redirects authenticated users to /me
 */

export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()
    const supabase = useSupabaseClient()

    // Fast path: composable already has user
    if (user.value) {
        return navigateTo('/me')
    }

    // Server: if no user on server, let client decide (Safari cookie delays)
    if (import.meta.server) {
        return
    }

    // Client: check Supabase client directly
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            console.log('[Guest Middleware] Session found via getSession, redirecting to /me')
            return navigateTo('/matches')
        }
    } catch { }

    // No session — user is a guest, allow access to login page
})
