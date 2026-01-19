/**
 * Auth Middleware
 * Protects routes that require authentication
 * Redirects unauthenticated users to /login
 */

export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()

    // Allow public routes without any checks
    const publicRoutes = ['/', '/vibe-check', '/login']
    const isPublic = publicRoutes.some(route => to.path === route || to.path.startsWith('/vibe-check'))

    if (isPublic) {
        return
    }

    // Check if user is logged in
    if (!user.value) {
        console.log('[Auth] No user, redirecting to /login')
        return navigateTo('/login')
    }

    // User is authenticated - allow access
    // Profile verification is handled on individual pages, not middleware
    // This prevents redirect loops when profile doesn't exist
    console.log('[Auth] User authenticated:', user.value.id)
})
