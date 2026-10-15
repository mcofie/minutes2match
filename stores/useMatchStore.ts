import { defineStore } from 'pinia'
import { MatchService } from '~/services/MatchService'
import type { M2MDatabase } from '~/types/database.types'

// Named columns: members can't read the private feedback/notes columns (migration 077)
const MEMBER_MATCH_COLUMNS = 'id, user_1_id, user_2_id, status, unlock_price, created_at, unlocked_at, user_1_paid, user_2_paid, user_1_contacted, user_2_contacted, contact_exchanged, expires_at, match_score, match_reasons, match_warnings, ai_analysis, created_by_label, is_from_lobby, match_breakdown, match_confidence'

export const useMatchStore = defineStore('matches', () => {
    const supabase = useSupabaseClient<M2MDatabase>()
    const matches = ref<any[]>([])
    const loadingMatches = ref(false)
    const initialized = ref(false)

    const fetchMatches = async (userId: string) => {
        // Already have matches from earlier: keep showing them and refresh quietly
        loadingMatches.value = !initialized.value
        if (!userId || userId === 'undefined') {
            loadingMatches.value = false
            return
        }
        try {
            const { data } = await supabase
                .from('matches')
                // Profiles come from enrichMatches below (one call for all partners)
                .select(MEMBER_MATCH_COLUMNS)
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
                    const isUser1 = match.user_1_id === userId
                    const partnerId = isUser1 ? match.user_2_id : match.user_1_id
                    const fullProfile = enrichedProfiles[partnerId] || null
                    return {
                        ...match,
                        matchedProfile: fullProfile,
                        vibeAnswers: fullProfile?.vibeAnswers || [],
                        currentUserPaid: isUser1 ? match.user_1_paid : match.user_2_paid,
                        otherUserPaid: isUser1 ? match.user_2_paid : match.user_1_paid,
                        nudged: isUser1 ? match.user_1_contacted : match.user_2_contacted
                    }
                }).filter((m: any) => m.matchedProfile && m.matchedProfile.is_active !== false)
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
