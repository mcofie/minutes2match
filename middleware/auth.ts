/**
 * Auth Middleware
 * Protects routes that require authentication
 * Redirects unauthenticated users to /login
 */

export default defineNuxtRouteMiddleware(async (to) => {
    const user = useSupabaseUser()
    const supabase = useSupabaseClient()

    // Allow public routes
    const publicRoutes = ['/', '/vibe-check', '/login']
    if (publicRoutes.some(route => to.path.startsWith(route))) {
        return
    }

    // Check if user is logged in
    if (!user.value) {
        return navigateTo('/login')
    }

    // Check if profile is complete (has verified phone)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.value.id)
        .single()

    if (!profile?.is_verified) {
        return navigateTo('/vibe-check')
    }
})

