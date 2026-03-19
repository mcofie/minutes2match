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
          <span class="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">{{ matches?.length || 0 }} matches</span>
       </div>
    </div>

    <!-- Flash Lobby Entry Point -->
    <div class="mb-4">
      <FlashLobbyBanner />
    </div>

    <!-- Quality Assurance Banner -->
    <div class="px-3 py-2.5 sm:p-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700 shadow-sm">
       <div class="w-6 h-6 sm:w-10 sm:h-10 bg-white dark:bg-stone-900 rounded-md sm:rounded-xl flex items-center justify-center text-sm sm:text-lg shadow-sm border border-emerald-100 dark:border-emerald-900/50 flex-shrink-0 mt-0.5 sm:mt-0">🛡️</div>
       <div class="flex-1 min-w-0">
          <p class="text-[8px] sm:text-[9px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest leading-relaxed">
             <span class="text-emerald-900 dark:text-emerald-300">Community Purity Protocol:</span> 
             <span class="opacity-80 ml-1">We actively purge inactive accounts every 48 hours. Your matches are guaranteed high-quality.</span>
          </p>
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
          :aiAnalysis="match.ai_analysis"
          :otherUserPaid="match.otherUserPaid"
          :availability="profile?.availability"
          :matchedUserAvailability="match.matchedProfile?.availability"
          @unlock="handleUnlockMatch(match)"
          @update-status="navigateToFeedback(match)"
        />
      </div>

      <!-- Date Suggestions: Partner Venues -->
      <div v-show="matches.some(m => m.status === 'unlocked' && m.currentUserPaid)" class="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 pt-16">
         <div class="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4 px-2">
            <div>
               <h3 class="text-3xl md:text-5xl font-serif font-bold tracking-tight dark:text-white mb-2 leading-none">The M2M <span class="italic text-rose-500">Curated Date.</span></h3>
               <p class="text-stone-500 dark:text-stone-400 text-sm md:text-base font-medium max-w-lg">We've partnered with Accra's finest spots to give you a discounted rate on your first date.</p>
            </div>
            <div class="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/10 px-4 py-2 rounded-full border border-rose-100 dark:border-rose-900/30">
               <span>Partner Deals Active</span>
               <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
         </div>

         <div v-if="partnerVenues.length > 0" class="flex flex-nowrap overflow-x-auto gap-6 pb-8 snap-x no-scrollbar md:px-2">
            <PartnerVenueCard 
               v-for="venue in partnerVenues" 
               :key="venue.id" 
               :venue="venue"
               :redemptionData="redemptions[venue.id] || null"
               :loading="claimingVenueIds.has(venue.id)"
               class="flex-shrink-0 snap-start"
               @claim="handleClaimDiscount(venue)"
               @reset="handleResetRedemption(venue.id)"
            />
         </div>
         <div v-else class="py-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
            <div class="text-3xl mb-3 grayscale opacity-40">🥂</div>
            <p class="text-sm font-bold text-stone-900 dark:text-stone-100">More curated spots coming soon</p>
            <p class="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold mt-1">We're handpicking the best date spots for you.</p>
         </div>


         <!-- Redemption Instructions Banner -->
         <div class="mt-4 p-6 bg-stone-900 dark:bg-stone-900 rounded-2xl border-2 border-black dark:border-stone-800 text-center relative overflow-hidden group">
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
            <div class="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
               <div class="text-left max-w-sm">
                  <h4 class="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">How it works:</h4>
                  <p class="text-stone-400 text-[10px] leading-relaxed">Simply show your **unlocked match profile** to the staff when you arrive at any partner venue to redeem your M2M rate.</p>
               </div>
               <div class="hidden md:block w-px h-12 bg-white/10"></div>
               <div class="flex items-center gap-4">
                  <span class="text-3xl opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">🥂</span>
                  <p class="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest text-left">Defy the small talk.<br/>Ignite the connection.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BlindProfileCard from '~/components/BlindProfileCard.vue'
import SkeletonMatchCard from '~/components/skeleton/MatchCard.vue'
import SubscriptionCard from '~/components/SubscriptionCard.vue'
import PartnerVenueCard from '~/components/PartnerVenueCard.vue'
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
const { isTMA, hapticFeedback } = useTelegram()

const matchStore = useMatchStore()
const { matches, loadingMatches } = storeToRefs(matchStore)
const { fetchMatches } = matchStore

// Partner Venues & Redemptions
const partnerVenues = ref<any[]>([])
const redemptions = ref<Record<string, any>>({})

const claimingVenueIds = ref<Set<string>>(new Set())

const fetchVenues = async () => {
   try {
      const data = await $fetch('/api/venues')
      partnerVenues.value = data as any[]
   } catch (err) {
      console.error('Failed to fetch venues:', err)
   }
}

const fetchUserRedemptions = async () => {
   try {
      const data = await $fetch('/api/redemptions')
      if (Array.isArray(data)) {
         const newRedemptions: Record<string, any> = {}
         data.forEach((r: any) => {
            newRedemptions[r.venue_id] = {
               redemptionId: r.id,
               redeemedAt: r.redeemed_at
            }
         })
         redemptions.value = newRedemptions
      }
   } catch (err) {
      console.error('Failed to fetch user redemptions:', err)
   }
}


const handleClaimDiscount = async (venue: any) => {
   // Local check to prevent unnecessary network calls
   if (redemptions.value[venue.id]) {
      console.log(`[Frontend] Venue ${venue.id} already claimed. Aborting.`)
      return
   }

   // Find an unlocked match where the current user has paid
   const activeMatch = matches.value.find(m => m.status === 'unlocked' && m.currentUserPaid)

   
   console.log(`[Frontend] Claiming discount for ${venue.name}. Associated Match ID: ${activeMatch?.id || 'none'}`)
   
   claimingVenueIds.value.add(venue.id)
   try {
      haptic.hapticSuccess()
      const response = await $fetch('/api/redemptions', {
         method: 'POST',
         body: {
            venueId: venue.id,
            matchId: activeMatch?.id 
         }
      })
      
      if ((response as any).success) {
         redemptions.value = {
            ...redemptions.value,
            [venue.id]: {
               redemptionId: (response as any).redemptionId,
               redeemedAt: (response as any).redeemedAt
            }
         }
         
         const isReclaim = (response as any).message?.toLowerCase().includes('already')

         toast.success(
            isReclaim ? 'Ticket Restored!' : 'M2M Rate Claimed!', 
            isReclaim ? `Viewing your existing ticket for ${venue.name}.` : `Your ticket for ${venue.name} is ready.`
         )
      }

   } catch (err: any) {
      console.error('[Frontend] Redemption Error:', err)
      toast.error('Redemption Failed', err.data?.message || 'Could not record your claim. Please try again.')
   } finally {
      claimingVenueIds.value.delete(venue.id)
   }
}


const handleResetRedemption = (venueId: string) => {
   delete redemptions.value[venueId]
}
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
    
    // Force email generation from phone (ignore personal email)
    const paymentEmail = profile.value.phone 
       ? `${profile.value.phone.replace(/[\s\+\-]/g, '')}@m2match.com` 
       : 'customer@m2match.com'

    const response = await initializePayment(
       paymentEmail,
       match.unlock_price,
       'match_unlock',
       { userId: profile.value.id, matchId: match.id }
    )
    if (response.type === 'free_unlock' || response.type === 'subscription_unlock') {
        hapticFeedback('medium')
        toast.success(response.type === 'free_unlock' ? 'First Match Free!' : 'Unlocked with Subscription', 'Your match has been unlocked successfully.')
        await fetchMatches(profile.value.id)
        await fetchPendingMatchCount(profile.value.id)
        return
    }
    const authUrl = response.authorization_url || response.data?.authorization_url
    if (authUrl) window.location.href = authUrl
  } catch (error) {
    console.error('Unlock error:', error)
    hapticFeedback('heavy')
    toast.error('Payment failed', 'Failed to process payment. Please try again.')
  }
}

const handleSubscribe = async () => {
    if (!profile.value) return
    try {
        const { initializePayment } = usePaystack()
        const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'subscription_price_monthly').single() as { data: any, error: any }
        const price = settingsData?.value?.amount || 50
        
        // Force email generation from phone (ignore personal email)
        const paymentEmail = profile.value.phone 
           ? `${profile.value.phone.replace(/[\s\+\-]/g, '')}@m2match.com` 
           : 'customer@m2match.com'

        const response = await initializePayment(
            paymentEmail,
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
        await fetchMatches(currentUserId.value)
        fetchVenues()
        fetchUserRedemptions()
    } else {
        // Fallback: try to get userId directly if initDashboard couldn't resolve
        try {
            const supabaseClient = useSupabaseClient()
            const { data: { session } } = await supabaseClient.auth.getSession()
            const fallbackId = session?.user?.id
            if (fallbackId) {
                console.log('[Matches] Using fallback userId:', fallbackId)
                await initDashboard(true) // Force re-init
                await fetchMatches(fallbackId)
                fetchVenues()
                fetchUserRedemptions()
            } else {
                loadingMatches.value = false
            }
        } catch {
            loadingMatches.value = false
        }
    }
})
</script>
