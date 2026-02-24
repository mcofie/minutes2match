import { defineStore } from 'pinia'
import { MatchService } from '~/services/MatchService'
import type { M2MDatabase } from '~/types/database.types'

export const useMatchStore = defineStore('matches', () => {
    const supabase = useSupabaseClient<M2MDatabase>()
    const matches = ref<any[]>([])
    const loadingMatches = ref(false)
    const initialized = ref(false)

    const fetchMatches = async (userId: string) => {
        loadingMatches.value = true
        if (!userId || userId === 'undefined') {
            loadingMatches.value = false
            return
        }
        try {
            const { data } = await supabase
                .from('matches')
                .select(`
                    *,
                    user_1:profiles!matches_user_1_id_fkey(*),
                    user_2:profiles!matches_user_2_id_fkey(*)
                `)
                .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
                .in('status', ['pending_payment', 'partial_payment', 'unlocked'])
                .order('created_at', { ascending: false })

            if (data && data.length > 0) {
                const partnerIds = data.map((m: any) => m.user_1_id === userId ? m.user_2_id : m.user_1_id).filter(Boolean)
                let enrichedProfiles: Record<string, any> = {}
                if (partnerIds.length > 0) {
                    enrichedProfiles = await MatchService.enrichMatches(partnerIds)
                }
                matches.value = data.map((match: any) => {
                    const partnerId = match.user_1_id === userId ? match.user_2_id : match.user_1_id
                    const basicProfile = match.user_1_id === userId ? match.user_2 : match.user_1
                    const fullProfile = enrichedProfiles[partnerId] || basicProfile
                    return {
                        ...match,
                        matchedProfile: fullProfile,
                        vibeAnswers: fullProfile?.vibeAnswers || [],
                        currentUserPaid: match.user_1_id === userId ? match.user_1_paid : match.user_2_paid
                    }
                })
            } else {
                matches.value = []
            }
            initialized.value = true
        } catch (err) {
            console.error('[MatchStore] Error fetching matches:', err)
        } finally {
            loadingMatches.value = false
        }
    }

    return {
        matches,
        loadingMatches,
        initialized,
        fetchMatches
    }
})
