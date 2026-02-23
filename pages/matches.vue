<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>Matches | Minutes 2 Match</Title>
    </Head>
    <div class="flex items-center justify-between flex-wrap gap-4">
       <h2 class="text-2xl font-bold tracking-tight dark:text-white">Your Connections</h2>
       <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-full">
             <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </span>
             <span class="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">High Quality Pool Verified</span>
          </div>
          <span class="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">{{ matches.length }} matches</span>
       </div>
    </div>

    <!-- Quality Assurance Banner -->
    <div class="p-4 bg-emerald-50/40 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
       <div class="w-10 h-10 bg-white dark:bg-stone-900 rounded-xl flex items-center justify-center text-xl shadow-sm border border-emerald-100 dark:border-emerald-900/50">🛡️</div>
       <div class="flex-1">
          <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 mb-0.5">Community Purity Protocol</h4>
          <p class="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider leading-relaxed opacity-80">We actively purge inactive accounts every 48 hours. Your matches are guaranteed to be high-quality and verified responsive.</p>
       </div>
    </div>

    <!-- Skeleton Loaders -->
    <div v-if="loadingMatches" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonMatchCard v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="matches.length === 0" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div class="py-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl bg-white dark:bg-stone-900">
         <span class="text-2xl md:text-3xl lg:text-4xl block mb-4 grayscale opacity-50">✨</span>
         <p class="font-bold text-stone-900 dark:text-stone-100 mb-1">Your connections are brewing</p>
         <p class="text-sm text-stone-500 dark:text-stone-400">We'll SMS you when you get matched!</p>
       </div>
       
       <!-- Show Pricing Model in Empty State -->
       <div class="px-2">
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold font-serif text-black dark:text-white">Want more matches?</h3>
            <p class="text-sm text-stone-500 dark:text-stone-400">Upgrade to Premium for priority matching.</p>
          </div>
          <SubscriptionCard :subscription="subscription" @subscribe="handleSubscribe" />
       </div>
    </div>

    <div v-else class="space-y-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BlindProfileCard
          v-for="match in matches"
          :key="match.id"
          :matchId="match.id"
          :age="getAge(match.matchedProfile?.birth_date)"
          :personaName="getPersonaData(match.matchedProfile?.dating_persona)?.name || 'Mystery'"
          :personaEmoji="getPersonaData(match.matchedProfile?.dating_persona)?.emoji || '✨'"
          :personaColor="getPersonaData(match.matchedProfile?.dating_persona)?.color || '#1a1a2e'"
          :vibePreview="getVibePreview(match.vibeAnswers)"
          :vibeSummary="getVibeSummary(match.vibeAnswers)"
          :unlockPrice="match.unlock_price"
          :unlocked="match.status === 'unlocked'"
          :currentUserPaid="match.currentUserPaid"
          :displayName="match.matchedProfile?.display_name"
          :photoUrl="match.matchedProfile?.photo_url"
          :phone="match.status === 'unlocked' ? match.matchedProfile?.phone : undefined"
          :preferredContactMethod="match.matchedProfile?.preferred_contact_method"
          :instagramHandle="match.matchedProfile?.instagram_handle"
          :snapchatHandle="match.matchedProfile?.snapchat_handle"
          :bio="match.matchedProfile?.about_me"
          :interests="match.matchedProfile?.interests"
          :sharedInterests="getSharedInterests(match.matchedProfile?.interests)"
          :expiresAt="match.expires_at"
          :matchedAt="match.created_at"
          :location="match.matchedProfile?.location"
          :gender="match.matchedProfile?.gender"
          :hasSubscription="!!subscription"
          :isFreeUnlockEligible="profile && !profile.has_used_free_unlock"
          @unlock="handleUnlockMatch(match)"
          @update-status="navigateToFeedback(match)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlindProfileCard from '~/components/BlindProfileCard.vue'
import SkeletonMatchCard from '~/components/skeleton/MatchCard.vue'
import SubscriptionCard from '~/components/SubscriptionCard.vue'
import { personas, type Persona } from '~/composables/usePersona'
import { useToast } from '~/composables/useToast'
import { useHaptic } from '~/composables/useHaptic'
import { useMatchStore } from '~/stores/useMatchStore'
import { storeToRefs } from 'pinia'
import type { M2MDatabase } from '~/types/database.types'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()
const haptic = useHaptic()
const { profile, subscription, fetchPendingMatchCount } = useDashboard()

const matchStore = useMatchStore()
const { matches, loadingMatches } = storeToRefs(matchStore)
const { fetchMatches } = matchStore
const getAge = (birthDate: string | null): number => {
  if (!birthDate) return 25
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const getPersonaData = (personaId: string | null): Persona | null => {
  if (!personaId) return null
  return personas[personaId] || null
}

const getVibePreview = (vibeAnswers: any[]): string => {
  const previews = ['Loves deep conversations', 'Weekend adventurer', 'Ambitious go-getter', 'Social butterfly']
  return previews[Math.floor(Math.random() * previews.length)]
}

const getVibeSummary = (vibeAnswers: any[]): string => {
  if (!vibeAnswers?.length) return 'Getting to know them...'
  const answers = vibeAnswers.map((a: any) => a.answer_value).join(', ')
  return `Enjoys ${answers}`
}

const getSharedInterests = (matchInterests: string[] | null): string[] => {
  if (!matchInterests || !profile.value?.interests?.length) return []
  return matchInterests.filter(interest => profile.value.interests.includes(interest))
}

const handleUnlockMatch = async (match: any) => {
  if (!profile.value || !profile.value.id || profile.value.id === 'undefined') return
  try {
    const { initializePayment } = usePaystack()
    const response = await initializePayment(
       profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
      match.unlock_price,
      'match_unlock',
      { userId: profile.value.id, matchId: match.id }
    )
    if (response.type === 'free_unlock' || response.type === 'subscription_unlock') {
        haptic.hapticSuccess()
        toast.success(response.type === 'free_unlock' ? 'First Match Free!' : 'Unlocked with Subscription', 'Your match has been unlocked successfully.')
        await fetchMatches(profile.value.id)
        await fetchPendingMatchCount(profile.value.id)
        return
    }
    const authUrl = response.authorization_url || response.data?.authorization_url
    if (authUrl) window.location.href = authUrl
  } catch (error) {
    console.error('Unlock error:', error)
    haptic.hapticError()
    toast.error('Payment failed', 'Failed to process payment. Please try again.')
  }
}

const handleSubscribe = async () => {
    if (!profile.value) return
    try {
        const { initializePayment } = usePaystack()
        const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'subscription_price_monthly').single() as { data: any, error: any }
        const price = settingsData?.value?.amount || 50
        const response = await initializePayment(
            profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
            price,
            'subscription',
            { userId: profile.value.id }
        )
        const authUrl = response.authorization_url || response.data?.authorization_url
        if (authUrl) window.location.href = authUrl
    } catch (error) {
        toast.error('Error', 'Failed to start subscription.')
    }
}

const navigateToFeedback = (match: any) => {
  navigateTo(`/me/connection/${match.id}?feedback=true`)
}

onMounted(async () => {
    const { initDashboard, currentUserId } = useDashboard()
    let success = await initDashboard()
    
    if (success && currentUserId.value) {
        fetchMatches(currentUserId.value)
    } else {
        // Fallback: try to get userId directly if initDashboard couldn't resolve
        try {
            const supabaseClient = useSupabaseClient()
            const { data: { session } } = await supabaseClient.auth.getSession()
            const fallbackId = session?.user?.id
            if (fallbackId) {
                console.log('[Matches] Using fallback userId:', fallbackId)
                await initDashboard(true) // Force re-init
                fetchMatches(fallbackId)
            } else {
                loadingMatches.value = false
            }
        } catch {
            loadingMatches.value = false
        }
    }
})
</script>
