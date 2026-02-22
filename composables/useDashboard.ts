import type { M2MDatabase } from '~/types/database.types'

export const useDashboard = () => {
    const supabase = useSupabaseClient<M2MDatabase>() as any
    const user = useSupabaseUser()
    const toast = useToast()

    // Use useState for shared state across all components/pages
    const authReady = useState<boolean>('dash_authReady', () => false)
    const currentUserId = useState<string | null>('dash_currentUserId', () => null)
    const profile = useState<any>('dash_profile', () => null)
    const subscription = useState<any>('dash_subscription', () => null)
    const loadingSubscription = useState<boolean>('dash_loadingSubscription', () => true)
    const isProfileIncomplete = useState<boolean>('dash_isProfileIncomplete', () => false)
    const pendingMatchCount = useState<number>('dash_pendingMatchCount', () => 0)
    const trustScore = useState<number>('dash_trustScore', () => 30)

    // Fetch profile by ID
    const fetchProfileById = async (userId: string) => {
        if (!userId || userId === 'undefined') {
            console.warn('[Dashboard] fetchProfileById called with invalid userId:', userId)
            return null
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single() as { data: any, error: any }

            profile.value = data
            if (data) {
                let score = 30 // Base score
                if (data.photo_url && !data.photo_url.includes('placeholder')) score += 20
                if (data.phone) score += 20
                if (data.instagram_handle) score += 10
                if (data.location && data.gender && data.birth_date) score += 20
                trustScore.value = Math.min(score, 100)

                // Check if profile is incomplete
                const missingPhoto = !data.photo_url || data.photo_url.includes('placeholder')
                const missingVibe = !data.dating_persona
                const missingBasic = !data.gender || !data.birth_date || !data.location
                isProfileIncomplete.value = missingPhoto || missingVibe || missingBasic
            }
            return data
        } catch (err) {
            console.error('[Dashboard] Error fetching profile:', err)
            return null
        }
    }

    const fetchSubscription = async (userId: string) => {
        if (!userId || userId === 'undefined') return
        loadingSubscription.value = true
        try {
            const { data } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('end_date', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data && new Date(data.end_date) > new Date()) {
                subscription.value = data
            } else {
                subscription.value = null
            }
        } catch (error) {
            console.error('[Dashboard] Error fetching subscription:', error)
        } finally {
            loadingSubscription.value = false
        }
    }

    const fetchPendingMatchCount = async (userId: string) => {
        if (!userId || userId === 'undefined') return
        try {
            const { data } = await supabase
                .from('matches')
                .select('id')
                .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
                .eq('status', 'pending_payment')

            pendingMatchCount.value = data?.length || 0
        } catch (error) {
            console.error('[Dashboard] Error fetching match count:', error)
        }
    }

    const initializing = useState<boolean>('dash_initializing', () => false)

    const initDashboard = async (force = false) => {
        if (authReady.value && !force) return true
        if (initializing.value) {
            // Wait for existing initialization to finish
            let waitCount = 0
            while (initializing.value && waitCount < 50) {
                await new Promise(resolve => setTimeout(resolve, 100))
                waitCount++
            }
            return authReady.value
        }

        initializing.value = true
        try {
            let userId: string | null = null

            // Try multiple times to resolve the session
            // After SPA navigation from login, the Supabase module 
            // may take a moment to fully establish the session
            for (let attempt = 0; attempt < 5; attempt++) {
                // Check composable first (fastest)
                if (user.value?.id) {
                    userId = user.value.id
                    break
                }

                // Try getSession (reads from storage)
                try {
                    const { data: sessionData } = await supabase.auth.getSession()
                    if (sessionData?.session?.user?.id) {
                        userId = sessionData.session.user.id
                        break
                    }
                } catch { }

                // On last attempt, try getUser (calls server)
                if (attempt === 4) {
                    try {
                        const { data: { user: authUser } } = await supabase.auth.getUser()
                        if (authUser?.id) {
                            userId = authUser.id
                            break
                        }
                    } catch { }
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 400))
            }

            if (userId) {
                currentUserId.value = userId
                // Trigger fetches in parallel
                await Promise.all([
                    fetchProfileById(userId),
                    fetchSubscription(userId),
                    fetchPendingMatchCount(userId)
                ])
                authReady.value = true
                return true
            } else {
                console.warn('[Dashboard] Could not initialize: No user session found after retries')
                return false
            }
        } finally {
            initializing.value = false
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error('[Dashboard] Logout error:', err)
        } finally {
            // Hard browser redirect is the only way to guarantee a clean slate
            // in all browsers including Safari
            window.location.href = '/'
        }
    }

    return {
        authReady,
        currentUserId,
        profile,
        subscription,
        loadingSubscription,
        isProfileIncomplete,
        pendingMatchCount,
        trustScore,
        initDashboard,
        fetchProfileById,
        fetchSubscription,
        fetchPendingMatchCount,
        logout
    }
}
