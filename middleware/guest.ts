/**
 * Guest Middleware
 * Forbid logged in users from accessing guest-only pages (like login)
 * Redirects authenticated users to /me
 */

export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()

    if (user.value) {
        console.log('[Guest Middleware] User already authenticated, redirecting to /me')
        return navigateTo('/me')
    }
})
