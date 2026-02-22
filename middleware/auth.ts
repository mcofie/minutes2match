/**
 * Auth Middleware
 * Protects routes that require authentication
 * Redirects unauthenticated users to /login
 * 
 * Safari Fix: On client, checks both the reactive composable AND 
 * the Supabase client directly. This handles the case where the
 * composable hasn't been updated yet after a recent login.
 */

export default defineNuxtRouteMiddleware(async (to) => {
    // 1. Skip checks for public routes
    const publicRoutes = ['/', '/login', '/vibe-check']
    const isPublic = publicRoutes.some(route => to.path === route || to.path.startsWith('/vibe-check'))
    if (isPublic) return

    const user = useSupabaseUser()
    const supabase = useSupabaseClient()

    // 2. Fast path: user is already in the composable
    if (user.value) {
        return // Authenticated
    }

    // 3. SERVER: Defer to client — Safari may not have sent cookies yet
    if (import.meta.server) {
        console.log('[Auth Middleware] No user on server, deferring to client...')
        return
    }

    // 4. CLIENT: Check Supabase client directly (composable may lag behind)
    console.log('[Auth Middleware] No user in composable, checking Supabase client...')

    for (let i = 0; i < 3; i++) {
        try {
            // First try getSession (reads from local/cookie storage — faster)
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                console.log('[Auth Middleware] Session found via getSession on attempt:', i + 1)
                return // Authenticated — allow access
            }

            // Fallback to getUser (calls Supabase server to verify the JWT)
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                console.log('[Auth Middleware] User found via getUser on attempt:', i + 1)
                return // Authenticated — allow access
            }
        } catch {
            // Network error or expired token — retry
        }

        if (i < 2) await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)))
    }

    // 5. All checks failed — redirect to login
    console.log('[Auth Middleware] Authentication failed after all retries, redirecting to /login')
    return navigateTo('/login')
})
