<template>
  <div class="w-full">
    <!-- Match Card - Neo-Brutalist Layout matching skeleton -->
    <article 
      class="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border-2 border-black dark:border-stone-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] cursor-pointer min-h-[200px] sm:min-h-[180px] h-full"
      @click="navigateToConnection"
    >
      <div class="flex h-full items-stretch">
        <!-- Photo Section (Left) -->
        <div class="w-32 sm:w-40 flex-shrink-0 bg-stone-100 dark:bg-stone-800 border-r-2 border-black dark:border-stone-800 relative overflow-hidden flex flex-col items-center justify-center">
          <template v-if="unlocked || currentUserPaid">
             <NuxtImg 
               v-if="photoUrl" 
               :src="photoUrl" 
               :alt="displayName"
               class="absolute inset-0 w-full h-full object-cover"
               loading="lazy"
               width="144"
               height="144"
             />
             <div v-else class="text-3xl font-bold opacity-20 text-stone-900">{{ displayName?.charAt(0) }}</div>
          </template>
          <div v-else class="absolute inset-0 w-full h-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
             <img v-if="photoUrl" :src="photoUrl" class="absolute inset-0 w-full h-full object-cover blur-[8px] opacity-70 scale-110 drop-shadow-md" />
             <!-- Mystery Overlay -->
             <div class="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
             
             <div class="relative z-10 flex flex-col items-center animate-pulse-subtle">
                <span class="text-2xl drop-shadow-lg filter grayscale opacity-40 mb-1.5">{{ currentUserPaid ? '⌛' : '🔒' }}</span>
                <span class="bg-black text-white px-2.5 py-1 rounded-md text-[7px] font-black uppercase tracking-[0.2em] shadow-lg border border-white/10 ring-1 ring-white/20 text-center">
                   {{ currentUserPaid ? 'Awaiting partner' : 'Classified' }}
                </span>
             </div>
          </div>
          
          <!-- Gender Badge Overlay -->
          <div 
            v-if="gender"
            class="absolute top-3 left-3 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold bg-white dark:bg-stone-800 border-2 border-black dark:border-stone-700 shadow-sm"
            :class="gender === 'female' ? 'text-rose-500' : 'text-blue-500'"
          >
             {{ gender === 'female' ? '♀' : '♂' }}
          </div>
        </div>
        
        <!-- Content Section (Right) -->
        <div class="flex-1 p-2.5 sm:p-4 flex flex-col justify-between bg-white dark:bg-stone-900 relative min-w-0">
          <!-- Match Score Activity Indicator (Revealed) -->
          <div v-if="unlocked || currentUserPaid" class="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20">
             <div class="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-white dark:bg-stone-900 rounded-full border border-stone-100 dark:border-stone-800 shadow-[2px_2px_8px_rgba(0,0,0,0.05)]">
                <!-- Radial Progress SVG -->
                <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle 
                      cx="50%" cy="50%" r="40%" 
                      class="stroke-stone-50 dark:stroke-stone-800/50 fill-none" 
                      stroke-width="2"
                   />
                   <circle 
                      cx="50%" cy="50%" r="40%" 
                      class="fill-none transition-all duration-1000 ease-out" 
                      :class="[
                         matchScore >= 80 ? 'stroke-emerald-500' : 
                         matchScore >= 60 ? 'stroke-blue-500' : 'stroke-rose-500'
                      ]"
                      stroke-width="2"
                      stroke-linecap="round"
                      :stroke-dasharray="2 * Math.PI * 40 + '%'"
                      :stroke-dashoffset="(2 * Math.PI * 40 * (1 - (matchScore || 0) / 100)) + '%'"
                   />
                </svg>
                <div class="flex flex-col items-center justify-center leading-none z-10">
                   <span 
                      class="text-[9px] sm:text-[11px] font-black"
                      :class="[
                         matchScore >= 80 ? 'text-emerald-600' : 
                         matchScore >= 60 ? 'text-blue-600' : 'text-rose-600'
                      ]"
                   >
                      {{ Math.round(matchScore || 0) }}<small class="text-[7px] opacity-70">%</small>
                   </span>
                   <span class="text-[5px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-tighter mt-0.5">Match</span>
                </div>
             </div>
          </div>

          <div class="flex flex-col h-full">
            <!-- Header Info -->
            <div class="pr-6 mb-1.5">
              <h3 class="text-base sm:text-lg font-serif font-black text-stone-900 dark:text-stone-100 leading-tight truncate">
                {{ (unlocked || currentUserPaid) ? displayName : 'The Enigma' }}
              </h3>
              <div class="text-[8px] font-black text-stone-400 dark:text-stone-500 flex items-center gap-1.5 uppercase tracking-[0.1em] leading-none mt-0.5">
                <span>{{ age }} &middot; {{ location || 'Accra' }}</span>
                <span v-if="personaEmoji" class="text-base -mt-0.5">{{ personaEmoji }}</span>
              </div>
            </div>

            <!-- Compatibility Badges (Revealed vs Mystery) -->
            <div v-if="unlocked || currentUserPaid" class="flex flex-wrap gap-1.5 py-1">
               <!-- Intent Status -->
               <div v-if="intent" class="flex items-center">
                  <div class="px-2 py-0.5 bg-stone-100/50 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700/50 rounded-lg flex items-center gap-1">
                     <span class="text-[9px] leading-none">{{ intent.toLowerCase().includes('marriage') ? '💍' : '✨' }}</span>
                     <span class="text-[7.5px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">{{ intent }}</span>
                  </div>
               </div>
               
               <!-- Shared Interests with Emojis -->
               <div v-if="sharedInterests && sharedInterests.length > 0" class="flex flex-wrap gap-1.5 items-center">
                  <span v-for="interest in sharedInterests.slice(0, 2)" :key="interest" class="px-2 py-0.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/20 rounded-lg text-[7.5px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                     {{ getInterestLabel(interest) }}
                  </span>
                  <span v-if="sharedInterests.length > 2" class="text-[8px] font-black text-stone-300 dark:text-stone-600 uppercase tracking-widest pl-0.5">
                     +{{ sharedInterests.length - 2 }} More
                  </span>
               </div>
            </div>

            <!-- The Interest Tease (Curiosity Driver for Locked Matches) -->
            <div v-else class="flex flex-col gap-1.5 py-0.5">
               <div v-if="sharedInterests && sharedInterests.length > 0" class="flex items-center gap-1.5">
                  <div class="flex -space-x-1 overflow-hidden">
                     <div v-for="i in Math.min(3, sharedInterests.length)" :key="i" class="w-3.5 h-3.5 rounded bg-stone-100 dark:bg-stone-800 border border-white dark:border-stone-900 shadow-sm flex items-center justify-center">
                        <span class="text-[6px] font-black text-rose-500/40">✓</span>
                     </div>
                  </div>
                  <span class="text-[7.5px] font-black text-stone-300 dark:text-stone-700 uppercase tracking-widest">
                     {{ sharedInterests.length }} Shared Interests
                  </span>
               </div>
               
               <div v-if="matchScore && matchScore > 75" class="flex items-center gap-1 opacity-50">
                  <span class="text-[9px] leading-none">✨</span>
                  <span class="text-[7px] font-black text-emerald-500 uppercase tracking-widest">High Potential</span>
               </div>
            </div>

            <!-- Action / Status Logic -->
            <div class="mt-auto pt-2 flex flex-col relative border-t border-stone-100/50 dark:border-stone-800">
               <!-- Expiry Progress Bar -->
               <div v-if="!unlocked && expiresAt" class="mb-2 flex flex-col gap-1 opacity-90">
                  <div class="flex items-center justify-between px-0.5">
                     <span class="text-[7px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-[0.2em]">Expires In</span>
                     <span class="text-[8px] font-mono font-black text-rose-500 tabular-nums uppercase">{{ liveCountdown.display }}</span>
                  </div>
                  <div class="h-1.5 w-full bg-stone-100/80 dark:bg-stone-800/80 rounded-full overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
                     <div 
                        class="h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                        :class="[
                           timeRemainingPercentage > 15 ? 'bg-rose-500' : 'bg-rose-600 animate-pulse',
                        ]"
                        :style="{ width: `${timeRemainingPercentage || 3}%` }"
                     ></div>
                  </div>
               </div>

               <template v-if="!unlocked">
                  <!-- Awaiting Unlock State -->
                  <div v-if="currentUserPaid" class="w-full">
                     <button 
                       @click.stop="showNudgeModal = true"
                       class="group/nudge w-full py-2.5 bg-amber-400 text-black border-2 border-black hover:bg-amber-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2"
                     >
                        Nudge
                        <span class="text-[12px] leading-none group-hover/nudge:translate-x-0.5 transition-transform">↗</span>
                     </button>
                  </div>
                  
                  <!-- Locked State / Action Button -->
                  <button 
                    v-else
                    @click.stop="handleUnlock"
                    :disabled="isUnlocking"
                    class="group/unlock w-full px-4 py-2.5 bg-black dark:bg-stone-100 text-white dark:text-black hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0.5 disabled:translate-y-0.5 flex items-center justify-between"
                  >
                    <span v-if="!isUnlocking" class="flex items-center gap-1 opacity-90 transition-opacity">
                       <span class="w-1 h-1 rounded-full" :class="isFreeUnlockEligible ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                       {{ isFreeUnlockEligible ? 'FREE' : formattedPrice }}
                    </span>
                    <span v-else class="flex items-center gap-1.5 opacity-50">
                       <span class="w-2 h-2 rounded-full bg-white dark:bg-black border-2 border-stone-400 animate-ping"></span>
                       SECURE
                    </span>

                    <span class="flex items-center gap-1">
                       <template v-if="!isUnlocking">
                          {{ isFreeUnlockEligible ? 'Claim' : 'Unlock' }}
                          <span class="text-[12px] leading-none group-hover/unlock:translate-x-0.5 transition-transform">↗</span>
                       </template>
                       <template v-else>
                          <span class="animate-pulse">Processing...</span>
                       </template>
                    </span>
                  </button>
               </template>
            </div>
          </div>
        </div>
      </div>
    </article>

    <!-- Modals (cleaned up) -->
    <Teleport to="body">
      <div v-if="showAnalysisModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showAnalysisModal = false">
        <div class="relative w-full max-w-sm bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
           <button @click="showAnalysisModal = false" class="absolute top-4 right-4 text-stone-400 hover:text-black">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
           <h3 class="text-lg font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span class="text-2xl">{{ personaEmoji }}</span> Intelligence
           </h3>
           <div class="space-y-4 mb-6">
              <p v-if="aiAnalysis" class="text-sm font-medium text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-100">
                 "{{ aiAnalysis }}"
              </p>
           </div>
           <button @click="showAnalysisModal = false; handleUnlock();" class="w-full py-3 bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-rose-600 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 border-2 border-black">
              Initialize Connection
           </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showNudgeModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="showNudgeModal = false">
        <div class="relative w-full max-w-sm bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-6">
           <h3 class="text-lg font-serif font-bold text-stone-900 mb-2">Priority Nudge</h3>
           <p class="text-xs text-stone-500 mb-4">Send a direct reminder via SMS.</p>
           <textarea v-model="nudgeMessage" class="w-full p-4 bg-stone-50 border border-stone-200 focus:border-black rounded-xl text-xs font-medium focus:ring-0 mb-4 h-28 resize-none"></textarea>
           <div class="flex gap-2">
               <button @click="showNudgeModal = false" class="flex-1 py-3 bg-stone-100 text-stone-700 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-stone-200 border-2 border-transparent transition-all">
                  Cancel
               </button>
               <button @click="handleNudge" :disabled="nudging || !nudgeMessage.trim()" class="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5">
                  {{ nudging ? 'Sending...' : 'Transmit' }}
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

const emit = defineEmits<{
  unlock: []
  message: []
  'update-status': []
  nudge: [message: string]
}>()

const router = useRouter()

// Local state
const copied = ref(false)
const isUnlocking = ref(false)
const copiedIndex = ref<number | null>(null)
const showCelebration = ref(false)
const showNudgeModal = ref(false)
const nudging = ref(false)
const nudged = ref(props.nudged || false)
const nudgeMessage = ref("Hey! Just unlocked our match. Hope you're having a great day!")
const showAnalysisModal = ref(false)

const handleNudge = async () => {
  if (!nudgeMessage.value.trim() || nudging.value) return
  
  nudging.value = true
  try {
    emit('nudge', nudgeMessage.value)
    nudged.value = true
    showNudgeModal.value = false
  } catch (e) {
    console.error('Nudge failed', e)
  } finally {
    nudging.value = false
  }
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
  // Emit the event to parent
  emit('unlock')
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
