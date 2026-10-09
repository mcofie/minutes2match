<template>
  <div class="w-full">
    <!-- Match card: clean, minimal (Popcorn-style product card) -->
    <article
      class="group flex h-full cursor-pointer flex-col rounded-[2rem] bg-gradient-to-b from-[#eceff3] to-[#f5f6f8] p-2.5 transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
      @click="navigateToConnection"
    >
      <!-- Photo -->
      <div class="relative aspect-square overflow-hidden rounded-[1.6rem] bg-[#e2e6eb] sm:aspect-[4/5]">
        <NuxtImg
          v-if="photoUrl"
          :src="photoUrl"
          :alt="displayName"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
          width="480"
          height="600"
        />
        <div v-else class="font-display absolute inset-0 flex items-center justify-center text-6xl text-[#b9bec6]">{{ displayName?.charAt(0) }}</div>

        <!-- Match score -->
        <span v-if="safeMatchScore > 0" class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#393737] backdrop-blur">
          {{ Math.round(safeMatchScore) }}% match
        </span>
      </div>

      <!-- Details -->
      <div class="flex flex-1 flex-col items-center px-3 pb-4 pt-5 text-center">
        <h3 class="font-display w-full truncate text-[1.75rem] leading-tight tracking-tight text-[#393737]">
          {{ displayName }}
        </h3>
        <p class="mt-1 text-base text-[#6c6b6b]">
          {{ age }} · {{ location || 'Accra' }}<template v-if="occupation"> · {{ occupation }}</template>
        </p>
        <p v-if="detailLine" class="mt-1 line-clamp-1 text-sm text-[#9b9690]">{{ detailLine }}</p>

        <!-- Action: every match is unlocked, so it's always one tap to the brief -->
        <div class="mt-auto flex w-full flex-col items-center pt-5">
          <span class="inline-flex items-center gap-2 text-base font-semibold text-[#393737]">
            View profile
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#393737] text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="m9 18 6-6-6-6" /></svg></span>
          </span>
        </div>
      </div>
    </article>

    <!-- Modals (cleaned up) -->
    <Teleport to="body">
      <div v-if="showAnalysisModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showAnalysisModal = false">
        <div class="relative w-full max-w-sm bg-white rounded-2xl border border-[#ece8e3] shadow-[0_10px_30px_rgba(52,38,25,0.07)] p-6">
           <button @click="showAnalysisModal = false" class="absolute top-4 right-4 text-stone-400 hover:text-[#393737]">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
           <h3 class="text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">{{ personaEmoji }}</span> Why you match
           </h3>
           <div class="space-y-4 mb-6">
              <p v-if="aiAnalysis" class="text-sm font-medium text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                 "{{ aiAnalysis }}"
              </p>
           </div>
           <button @click="showAnalysisModal = false; handleUnlock();" class="w-full py-3 bg-rose-500 text-white font-bold uppercase tracking-wider text-[10px] rounded-2xl hover:bg-rose-600 transition-all shadow-[0_10px_30px_rgba(52,38,25,0.07)] hover:shadow-none border border-[#ece8e3]">
              I'm interested
           </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showNudgeModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showNudgeModal = false">
        <div class="relative w-full max-w-sm bg-white rounded-2xl border border-[#ece8e3] shadow-[0_10px_30px_rgba(52,38,25,0.07)] p-6">
           <h3 class="font-display text-2xl text-[#393737] mb-1">Send a nudge</h3>
           <p class="text-sm text-[#6c6b6b] mb-4">We’ll text them a friendly reminder.</p>
           <textarea v-model="nudgeMessage" class="w-full p-4 bg-stone-50 border border-stone-200 focus:border-[#ece8e3] rounded-2xl text-xs font-medium focus:ring-0 mb-4 h-28 resize-none"></textarea>
           <div class="flex gap-2">
               <button @click="showNudgeModal = false" class="flex-1 py-3 bg-stone-100 text-stone-700 font-bold uppercase tracking-wider text-[10px] rounded-2xl hover:bg-stone-200 border border-transparent transition-all">
                  Cancel
               </button>
               <button @click="handleNudge" :disabled="nudging || !nudgeMessage.trim()" class="flex-1 py-3 bg-[#393737] text-white font-bold uppercase tracking-wider text-[10px] rounded-2xl hover:bg-stone-800 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(52,38,25,0.07)] active:shadow-none">
                  {{ nudging ? 'Sending…' : 'Send nudge' }}
               </button>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  matchId: string  // Required for navigation
  age: number
  personaName: string
  personaEmoji: string
  personaColor: string
  vibePreview: string
  vibeSummary?: string
  unlockPrice: number
  unlocked?: boolean
  currentUserPaid?: boolean
  displayName?: string
  photoUrl?: string
  phone?: string
  preferredContactMethod?: string
  instagramHandle?: string
  snapchatHandle?: string
  bio?: string
  interests?: string[]
  sharedInterests?: string[]
  expiresAt?: string
  creditBalance?: number
  matchedAt?: string
  location?: string
  gender?: 'male' | 'female'
  hasSubscription?: boolean
  isFreeUnlockEligible?: boolean
  aiAnalysis?: string
  otherUserPaid?: boolean
  availability?: any
  matchedUserAvailability?: any
  matchScore?: number | null
  matchReasons?: any | null
  intent?: string | null
  occupation?: string | null
  nudged?: boolean
}

const props = defineProps<Props>()

type NudgePayload = {
  message: string
  onSuccess?: () => void
  onError?: () => void
}

const emit = defineEmits<{
  unlock: []
  message: []
  'update-status': []
  nudge: [payload: NudgePayload]
}>()

const router = useRouter()

// Local state
const copied = ref(false)
const isUnlocking = ref(false)
const copiedIndex = ref<number | null>(null)
const showCelebration = ref(false)
// One quiet line under the name: intent + up to two shared interests
const detailLine = computed(() => {
  const parts: string[] = []
  if (props.intent) parts.push(props.intent.charAt(0).toUpperCase() + props.intent.slice(1))
  const shared = props.sharedInterests || []
  if (shared.length) parts.push(shared.slice(0, 2).map(i => getInterestLabel(i)).join(', ') + (shared.length > 2 ? ` +${shared.length - 2}` : ''))
  return parts.join(' · ')
})

const showNudgeModal = ref(false)
const nudging = ref(false)
const localNudged = ref(false)
const nudgeMessage = ref("Hey! Just unlocked our match. Hope you're having a great day!")
const showAnalysisModal = ref(false)
const hasNudged = computed(() => Boolean(props.nudged || localNudged.value))
const safeMatchScore = computed(() => props.matchScore ?? 0)

const handleNudge = async () => {
  if (!nudgeMessage.value.trim() || nudging.value) return
  
  nudging.value = true
  emit('nudge', {
    message: nudgeMessage.value.trim(),
    onSuccess: () => {
      localNudged.value = true
      showNudgeModal.value = false
      nudging.value = false
    },
    onError: () => {
      nudging.value = false
    }
  })
}

// Shared Availability Logic
const mutualAvailability = computed(() => {
  if (!props.availability || !props.matchedUserAvailability) return []
  
  const days = ['weekdays', 'friday', 'saturday', 'sunday']
  
  // Defensive parsing
  let user1Avail: any = {}
  let user2Avail: any = {}
  
  try {
     user1Avail = typeof props.availability === 'string' ? JSON.parse(props.availability) : props.availability
     user2Avail = typeof props.matchedUserAvailability === 'string' ? JSON.parse(props.matchedUserAvailability) : props.matchedUserAvailability
  } catch (e) {
     return []
  }

  if (!user1Avail || !user2Avail) return []

  const shared: { day: string, slots: string[] }[] = []
  for (const day of days) {
    const user1Slots = user1Avail[day] || []
    const user2Slots = user2Avail[day] || []
    
    if (!Array.isArray(user1Slots) || !Array.isArray(user2Slots)) continue
    
    const common = user1Slots.filter((slot: string) => user2Slots.includes(slot))
    
    if (common.length > 0) {
      shared.push({ 
        day: day === 'weekdays' ? 'Weekdays' : day.charAt(0).toUpperCase() + day.slice(1), 
        slots: common 
      })
    }
  }
  return shared
})

const scheduleMatchRate = computed(() => {
  if (mutualAvailability.value.length === 0) return 0
  const slots = mutualAvailability.value.reduce((acc: number, curr: any) => acc + curr.slots.length, 0)
  // Max slots is ~12. Scale to 100.
  const score = Math.round((slots / 12) * 100)
  return Math.min(score + 30, 99) // Base 30 + slot bonus
})

// Navigate to dedicated connection page
const navigateToConnection = () => {
  router.push(`/me/connection/${props.matchId}`)
}

// Icebreaker API state
const icebreakers = ref<string[]>([])
const loadingIcebreakers = ref(false)
const icebreakersLoaded = ref(false)

const loadIcebreakers = async () => {
   if (icebreakersLoaded.value || loadingIcebreakers.value) return
   loadingIcebreakers.value = true
   
   try {
      const response = await $fetch<any>('/api/ai/icebreakers', {
         method: 'POST',
         body: {
            matchName: props.displayName,
            sharedInterests: props.sharedInterests || [],
            matchBio: props.bio,
            matchVibe: props.vibeSummary
         }
      })
      if (response && response.icebreakers && response.icebreakers.length > 0) {
         icebreakers.value = response.icebreakers
      }
   } catch (e) {
      console.error('Failed to load icebreakers', e)
   } finally {
      loadingIcebreakers.value = false
      icebreakersLoaded.value = true
   }
}


watch(() => props.unlocked, (newVal) => {
  if (newVal) {
    showCelebration.value = true
    isUnlocking.value = false // Reset loading on success
    setTimeout(() => { showCelebration.value = false }, 5000)
    loadIcebreakers()
  }
})

const handleUnlock = async () => {
  isUnlocking.value = true
  // Parent records the interest; once it lands this card re-renders (waiting / unlocked).
  // Reset in case the request failed so the button never stays stuck.
  emit('unlock')
  setTimeout(() => { isUnlocking.value = false }, 6000)
}

// Compatibility Score (based on shared interests)
const compatibilityScore = computed(() => {
  if (!props.sharedInterests || !props.interests || !Array.isArray(props.interests) || !Array.isArray(props.sharedInterests)) return 0
  if (props.interests.length === 0) return 0
  const sharedCount = props.sharedInterests.length
  const totalCount = props.interests.length
  const score = Math.round((sharedCount / Math.max(totalCount, 1)) * 100)
  return Math.min(score + 40, 99) // Base of 40% + shared interests bonus, max 99%
})

const compatibilityColor = computed(() => {
  const score = compatibilityScore.value || 0
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-stone-500'
})

// Match time ago
const matchedTimeAgo = computed(() => {
  if (!props.matchedAt) return ''
  const diff = Date.now() - new Date(props.matchedAt).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
})

// Time Scarcity Percentage
const timeRemainingPercentage = computed(() => {
   if (!props.expiresAt) return 0
   const end = new Date(props.expiresAt).getTime()
   const nowTime = now.value
   
   if (nowTime >= end) return 0
   
   // We use a 48hr window (standard match lifespan) as the scale base
   // This ensures the bar feels meaningful and "full" for new matches
   // regardless of when the actual database record was created.
   const standardWindow = 48 * 60 * 60 * 1000 // 48 hours
   const remaining = end - nowTime
   
   // Percentage of the 48hr window remaining
   const percentage = Math.max(0, Math.min(100, (remaining / standardWindow) * 100))
   
   // Visual hack: If there's time left, show at least a sliver (3%) so it doesn't look empty
   return percentage || 3
})

const cardClasses = computed(() => {
  if (props.unlocked) return 'border-emerald-400 ring-1 ring-emerald-400/20'
  if (props.currentUserPaid) return 'border-amber-400 ring-1 ring-amber-400/10'
  return 'border-stone-200 hover:border-stone-300'
})

const interestLabels: Record<string, string> = {
  travel: 'Travel ✈️', fitness: 'Fitness 💪', cooking: 'Cooking 🍳',
  movies: 'Movies 🎬', music: 'Music 🎵', gaming: 'Gaming 🎮',
  reading: 'Reading 📚', art: 'Art 🎨', sports: 'Sports ⚽',
  tech: 'Tech 💻', fashion: 'Fashion 👗', food: 'Foodie 🍕',
  nature: 'Nature 🌿', photography: 'Photography 📸', dancing: 'Dancing 💃',
  entrepreneurship: 'Business 💼'
}

const getInterestLabel = (interestId: string): string => interestLabels[interestId] || interestId

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(props.unlockPrice)
)

const whatsappLink = computed(() => {
  if (!props.phone) return '#'
  let cleanPhone = props.phone.replace(/[\s-]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '233' + cleanPhone.slice(1)
  else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('233')) cleanPhone = '233' + cleanPhone
  cleanPhone = cleanPhone.replace(/^\+/, '')
  const message = encodeURIComponent(icebreakers.value?.[0] || `Hi ${props.displayName || 'there'}! 👋 We matched on Minutes2Match.`)
  return `https://wa.me/${cleanPhone}?text=${message}`
})

const proposeDateWhatsAppLink = computed(() => {
  if (!props.phone) return '#'
  let cleanPhone = props.phone.replace(/[\s-]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '233' + cleanPhone.slice(1)
  else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('233')) cleanPhone = '233' + cleanPhone
  cleanPhone = cleanPhone.replace(/^\+/, '')
  
  let sharedNote = ""
  if (mutualAvailability.value.length > 0) {
    const first = mutualAvailability.value[0]
    sharedNote = ` I saw we're both free on ${first.day} ${first.slots.join(' & ')}!`
  }
  
  const message = encodeURIComponent(`Hi ${props.displayName || 'there'}! 👋 I saw we matched on M2M.${sharedNote} 🥂 Are you free for drinks at an M2M Partner Venue?`)
  return `https://wa.me/${cleanPhone}?text=${message}`
})

const openContactMethod = () => {
  if (props.preferredContactMethod === 'instagram' && props.instagramHandle) {
    window.open(`https://instagram.com/${props.instagramHandle.replace('@', '')}`, '_blank')
  } else if (props.preferredContactMethod === 'snapchat' && props.snapchatHandle) {
    window.open(`https://snapchat.com/add/${props.snapchatHandle}`, '_blank')
  } else if (props.phone) {
    window.open(whatsappLink.value, '_blank')
  }
}

const copyPhone = () => {
  if (props.phone) {
    navigator.clipboard.writeText(props.phone)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const copyIcebreaker = (text: string, index: number) => {
  navigator.clipboard.writeText(text)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = null }, 2000)
}

// Credit-based unlock
const hasSufficientCredit = computed(() => {
  return (props.creditBalance || 0) >= props.unlockPrice
})

// Live Countdown Timer
const now = ref(Date.now())
let countdownInterval: ReturnType<typeof setInterval> | null = null

const liveCountdown = computed(() => {
  if (!props.expiresAt) return { total: 0, hours: 0, minutes: 0, seconds: 0, display: '—' }
  const diff = new Date(props.expiresAt).getTime() - now.value
  if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0, display: 'Expired' }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  let display = ''
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remainHours = hours % 24
    display = `${days}d ${remainHours}h ${String(minutes).padStart(2, '0')}m`
  } else if (hours > 0) {
    display = `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  } else {
    display = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }
  
  return { total: diff, hours, minutes, seconds, display }
})

const hoursRemaining = computed(() => liveCountdown.value.hours)

const formatTimeRemaining = computed(() => liveCountdown.value.display)

onMounted(() => {
  // Start countdown interval for live timer
  if (props.expiresAt && !props.unlocked) {
    countdownInterval = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
  
  if (props.unlocked) {
    showCelebration.value = true
    setTimeout(() => { showCelebration.value = false }, 5000)
    loadIcebreakers()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
}

/* Modal Entry Animation */
.animate-in {
  animation: premium-modal-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes premium-modal-enter {
  from { 
    opacity: 0; 
    transform: scale(0.92) translateY(30px); 
    filter: blur(10px);
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
    filter: blur(0);
  }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.95;
    transform: scale(0.995);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Modal Content Scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 5px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}

/* Prevent layout shift on hover */
article {
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
