<template>
  <div>
    <!-- Compact Card -->
    <article 
      class="group relative rounded-[40px] overflow-hidden cursor-pointer transition-all duration-500 border border-stone-100 bg-white hover:-translate-y-1.5 hover:shadow-2xl h-full flex flex-row"
      @click="navigateToConnection"
    >
      <div class="flex flex-row h-full w-full">
        <!-- Image Section (Left) -->
        <div class="relative w-[40%] sm:w-[45%] h-full flex-shrink-0 overflow-hidden bg-stone-50 border-r border-stone-100">
          <!-- Gender Badge Overlay -->
          <div 
            v-if="gender"
            class="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black bg-white ring-2 ring-black shadow-sm"
            :class="gender === 'female' ? 'text-rose-500' : 'text-blue-500'"
          >
            {{ gender === 'female' ? '♀' : '♂' }}
          </div>
          
          <!-- Image Layer -->
          <div class="w-full h-full relative group">
            <template v-if="unlocked || currentUserPaid">
              <NuxtImg 
                v-if="photoUrl" 
                :src="photoUrl" 
                :alt="displayName" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                width="200"
                height="300"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-stone-100 italic font-black text-stone-300">{{ displayName?.charAt(0) }}</div>
            </template>
            <div v-else class="w-full h-full bg-stone-200 relative overflow-hidden">
               <img v-if="photoUrl" :src="photoUrl" class="absolute inset-0 w-full h-full object-cover blur-[20px] scale-125 opacity-40" />
               <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-4xl">🔒</span>
               </div>
            </div>

            <!-- Action Button Overlay (Bottom Center of Image) -->
            <div class="absolute bottom-6 inset-x-0 w-full flex justify-center px-4 animate-in slide-in-from-bottom-4 duration-700">
               <button 
                 @click.stop="unlocked ? navigateToConnection() : handleUnlock()"
                 class="px-8 py-3.5 bg-[#ff003c] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl hover:scale-105 active:scale-95 transition-all shadow-rose-200"
               >
                  {{ unlocked ? 'LET\'S TALK' : 'MATCH' }}
               </button>
            </div>
          </div>
        </div>

        <!-- Content Section (Right) -->
        <div class="flex-1 p-8 sm:p-10 flex flex-col justify-start relative">
          <!-- Match Score Circle (Top Right) -->
          <div class="absolute top-8 right-8 w-14 h-14 rounded-full border-[3.5px] border-rose-100 flex items-center justify-center bg-rose-50 animate-pulse-subtle">
             <span class="text-[14px] font-black text-[#ff003c]">{{ Math.round(matchScore || 0) }}%</span>
          </div>

          <!-- Profile Details Stack -->
          <div class="space-y-1.5 max-w-[80%]">
             <h3 class="text-4xl font-serif font-black text-stone-900 tracking-tighter italic">
                {{ (unlocked || currentUserPaid) ? displayName : 'Mystery Fan' }}
                <span v-if="unlocked || currentUserPaid" class="inline-flex ml-1 w-6 h-6 rounded-full bg-blue-500 items-center justify-center border-2 border-white shadow-sm ring-1 ring-blue-500/20">
                   <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                </span>
             </h3>
             
             <div class="flex items-center gap-2 text-xl font-bold text-stone-800 tracking-tight">
                <span>{{ age }}</span>
                <span class="text-stone-300">•</span>
                <span class="text-stone-600 font-medium">{{ location || 'East Legon' }}</span>
                <span class="text-2xl">{{ personaEmoji }}</span>
             </div>

             <div v-if="occupation" class="text-lg font-black text-stone-400 -mt-1 uppercase tracking-tight">
                {{ occupation }}
             </div>
          </div>

          <!-- Secondary Details -->
          <div class="mt-6 flex flex-col gap-6">
             <!-- Intent -->
             <div v-if="intent" class="inline-flex self-start px-4 py-2.5 bg-rose-50 text-[#881337] rounded-xl border border-rose-100 font-black uppercase tracking-widest text-[11px] italic">
                INTENTION: {{ intent }}
             </div>

             <!-- SHARED INTERESTS (NEW) -->
             <div class="border-t border-stone-50 pt-6">
                <p class="text-[11px] font-black text-stone-300 uppercase tracking-widest mb-4">Shared Foundation</p>
                <div class="flex flex-wrap gap-2.5">
                   <template v-if="sharedInterests && sharedInterests.length > 0">
                      <div v-for="interest in sharedInterests.slice(0, 4)" :key="interest" class="px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-2 shadow-sm">
                         <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                         <span class="text-xs font-black text-stone-700 lowercase leading-none">{{ interest }}</span>
                      </div>
                   </template>
                   <template v-else>
                      <div class="px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100 text-[11px] font-bold text-stone-400 italic">
                         Syncing Worldview...
                      </div>
                   </template>
                </div>
             </div>
          </div>
        </div>
      </div>
    </article>

          <!-- Compact Timer -->
          <div v-if="!unlocked && expiresAt && liveCountdown.total > 0" class="mt-3 flex items-center gap-2">
             <div class="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden border border-stone-100">
                <div 
                  class="h-full transition-all duration-1000"
                  :class="liveCountdown.hours < 6 ? 'bg-rose-500' : liveCountdown.hours < 24 ? 'bg-amber-400' : 'bg-emerald-400'"
                  :style="{ width: `${timeRemainingPercentage}%` }"
                ></div>
             </div>
             <span class="text-[10px] font-mono font-black tabular-nums text-stone-500 shrink-0">{{ liveCountdown.display }} left</span>
          </div>
          <div v-else-if="!unlocked && expiresAt && liveCountdown.total <= 0" class="mt-2 px-1">
             <div class="text-[9px] font-black uppercase tracking-widest text-rose-500 text-center py-1 bg-rose-50 rounded border border-rose-100">⏰ Match Expired</div>
          </div>

          <div class="mt-2 pt-2 border-t border-stone-100 min-h-[38px] flex flex-col justify-center">
            <template v-if="unlocked">
              <div class="flex gap-2 w-full">
              </div>
            </template>
            <template v-else-if="currentUserPaid">
              <div class="flex flex-col gap-1 w-full text-center">
                  <p class="text-[9px] font-black text-amber-600 uppercase tracking-[0.1em] animate-pulse">⏳ Awaiting Their Unlock</p>
                  <p class="text-[8px] font-bold text-stone-400 leading-none">Auto-refund if they miss the window.</p>
                  <div class="mt-2">
                    <button 
                      v-if="!nudged"
                      @click.stop="showNudgeModal = true"
                      :disabled="nudging"
                      class="w-full flex justify-center items-center py-2.5 bg-amber-400 text-black text-[10px] font-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all whitespace-nowrap uppercase tracking-widest"
                    >
                      <span v-if="nudging" class="animate-spin inline-block w-3 h-3 border-2 border-black/30 border-t-black rounded-full mr-1"></span>
                      <span>Nudge</span>
                    </button>
                    <div v-else class="w-full py-2 bg-stone-50 border-2 border-dashed border-stone-200 rounded text-center">
                       <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Nudged via SMS</span>
                    </div>
                  </div>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col gap-2 w-full mt-1.5">
                <!-- Premium Info Card -->
                <div 
                  class="relative flex items-center justify-between p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-stone-50/50 border border-stone-100"
                >
                  <div class="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div v-if="hasSubscription || isFreeUnlockEligible || hasSufficientCredit" class="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm text-xs sm:text-sm border border-stone-100">
                      {{ hasSubscription ? '👑' : isFreeUnlockEligible ? '🎁' : '💚' }}
                    </div>
                    
                    <div class="flex flex-col min-w-0">
                      <template v-if="hasSubscription">
                        <span class="text-[10px] sm:text-xs font-black text-amber-900 truncate">PREMIUM</span>
                      </template>
                      <template v-else-if="isFreeUnlockEligible">
                        <span class="text-[10px] sm:text-sm font-black text-emerald-900 truncate">FREE MATCH</span>
                      </template>
                      <template v-else-if="hasSufficientCredit">
                        <span class="text-[10px] sm:text-xs font-black text-green-800 truncate">M2M CREDIT</span>
                      </template>
                      <template v-else>
                        <span class="text-sm sm:text-[17px] font-black text-black leading-none truncate">{{ formattedPrice }}</span>
                      </template>
                    </div>
                  </div>

                  <div 
                    v-if="!hasSubscription && !isFreeUnlockEligible"
                    class="px-1.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-end justify-center leading-none shrink-0 text-right"
                  >
                    <span class="text-[8px] sm:text-[10px] font-black text-emerald-700 uppercase italic">Risk-Free</span>
                    <span class="text-[5px] sm:text-[6.5px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">Refund if ignored</span>
                  </div>
                </div>

                 <!-- Action Button -->
                <button 
                  @click.stop="handleUnlock"
                  :disabled="isUnlocking"
                  class="w-full flex justify-center py-2.5 bg-black text-white text-[10px] font-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all whitespace-nowrap uppercase tracking-widest"
                >
                  <div class="flex items-center gap-1 relative z-10 font-black">
                    <span v-if="isUnlocking" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span v-else>{{ isFreeUnlockEligible || hasSubscription ? 'Claim' : 'Unlock' }}</span>
                  </div>
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <!-- Hover Glow Effect -->
      <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none"></div>
    </article>



    <!-- "The Match Case" Modal (Minimal) -->
    <Teleport to="body">
      <div 
        v-if="showAnalysisModal" 
        class="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-all duration-300"
        @click.self="showAnalysisModal = false"
      >
        <div class="relative w-full max-w-sm bg-white rounded-3xl border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col p-8 animate-in zoom-in-95 duration-200">
           <button @click="showAnalysisModal = false" class="absolute top-6 right-6 text-stone-300 hover:text-stone-900 transition-colors">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>

           <!-- Header -->
           <div class="flex items-center gap-4 mb-8">
              <div class="shrink-0 w-16 h-16 bg-stone-50 rounded-2xl border-2 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {{ personaEmoji }}
              </div>
              <div>
                 <h3 class="text-xl font-black uppercase tracking-tight text-black leading-tight">The {{ personaName }} Case</h3>
                 <p class="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-1">Classified Compatibility Report</p>
              </div>
           </div>

           <!-- Body Content -->
           <div class="space-y-6 mb-8">
              <!-- AI Narrative Quote -->
              <div v-if="aiAnalysis" class="relative">
                 <div class="absolute -left-3 top-0 bottom-0 w-[3px] bg-black rounded-full"></div>
                 <p class="text-[14px] font-semibold text-stone-800 leading-relaxed pl-1">
                    "{{ aiAnalysis }}"
                 </p>
              </div>

              <!-- Match Reasons List -->
              <div v-if="matchReasons?.length" class="space-y-4">
                 <div v-for="(reason, idx) in matchReasons.slice(0, 3)" :key="idx" class="flex items-start gap-3">
                    <span class="text-rose-500 font-black text-lg leading-none -mt-1">↳</span>
                    <p class="text-sm font-bold text-stone-800 leading-snug">{{ reason }}</p>
                 </div>
              </div>

              <!-- Shared Foundation (Interests) -->
              <div v-if="sharedInterests?.length" class="p-5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                 <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Shared Worldview</span>
                    <span class="text-xs font-black text-stone-900">{{ sharedInterests.slice(0, 3).join(', ') || 'Aligned Outlook' }}</span>
                 </div>
                 <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-black">✓</div>
              </div>
              
              <!-- Confidence Score -->
              <div class="flex items-center justify-between p-6 bg-black text-white rounded-2xl">
                 <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">M2M Score</span>
                    <span class="text-xs font-black uppercase text-rose-500">Strong Probability</span>
                 </div>
                 <span class="text-5xl font-black tracking-tighter">{{ Math.round(matchScore || 0) }}%</span>
              </div>
           </div>

           <!-- Action -->
           <button 
              @click="showAnalysisModal = false; handleUnlock();"
              class="w-full py-5 bg-rose-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all flex items-center justify-center gap-3 group"
           >
              Start Your Story
              <span class="text-xl group-hover:translate-x-2 transition-transform">→</span>
           </button>
        </div>
      </div>
    </Teleport>

    <!-- Nudge Modal (Minimal) -->
    <Teleport to="body">
      <div 
        v-if="showNudgeModal" 
        class="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-all duration-300"
        @click.self="showNudgeModal = false"
      >
        <div class="relative w-full max-w-sm bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-in zoom-in-95 duration-200">
           <button @click="showNudgeModal = false" class="absolute top-4 right-4 text-stone-400 hover:text-black transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>

           <h3 class="text-lg font-black uppercase tracking-widest text-black mb-1">Send a Nudge</h3>
           <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 italic">Remind them you're interested</p>

           <div class="space-y-4">
              <textarea 
                v-model="nudgeMessage"
                class="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-xl text-sm font-medium focus:border-black focus:ring-0 transition-colors resize-none h-32"
                placeholder="Type your nudge message..."
              ></textarea>

              <button 
                @click="handleNudge"
                :disabled="nudging || !nudgeMessage.trim()"
                class="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="nudging" class="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"></span>
                <span>{{ nudging ? 'Sending...' : 'Send SMS Nudge' }}</span>
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
   if (!props.matchedAt || !props.expiresAt) return 0
   const start = new Date(props.matchedAt).getTime()
   const end = new Date(props.expiresAt).getTime()
   
   if (now.value >= end) return 0
   const totalDuration = end - start
   const remaining = end - now.value
   return Math.max(0, Math.min(100, (remaining / totalDuration) * 100))
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
