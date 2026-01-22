<template>
  <div>
    <!-- Compact Card -->
    <article 
      class="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      :class="[
        cardClasses,
        'hover:shadow-xl hover:-translate-y-0.5'
      ]"
      @click="navigateToConnection"
    >
      <!-- Full Card Layout -->
      <div class="flex">
        <!-- Photo Section -->
        <div class="relative w-36 aspect-[3/4] flex-shrink-0 overflow-hidden bg-stone-100 flex items-center justify-center">
          <!-- Gender Badge - Top Left -->
          <div 
            v-if="gender"
            class="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/90 backdrop-blur-sm shadow-sm border border-stone-200"
            :class="gender === 'female' ? 'text-pink-600' : 'text-blue-600'"
          >
            {{ gender === 'female' ? '♀' : '♂' }}
          </div>
          
          <!-- Unlocked Photo -->
          <template v-if="unlocked">
            <img 
              v-if="photoUrl" 
              :src="photoUrl" 
              :alt="displayName" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-stone-200">
              <span class="text-4xl font-black text-stone-300">{{ displayName?.charAt(0) || '?' }}</span>
            </div>
          </template>
          
          <!-- Locked State - Clean & Minimal -->
          <div v-else class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-stone-50">
            <!-- Subtle Dot Pattern -->
             <div class="absolute inset-0 opacity-[0.15]" style="background-image: radial-gradient(#9ca3af 1px, transparent 1px); background-size: 10px 10px;"></div>
            
            <!-- Lock Icon -->
            <div class="relative z-10 w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center mb-2">
              <svg v-if="currentUserPaid" class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            
            <span class="text-[9px] font-bold text-stone-400 uppercase tracking-widest relative z-10">Private</span>
          </div>
        </div>
        
        <!-- Content Section -->
        <div class="flex-1 p-4 min-w-0 flex flex-col justify-between">
          <!-- Header -->
          <div>
            <!-- Name Row -->
            <div class="flex items-start justify-between gap-2 mb-1">
              <div class="min-w-0">
                <h3 class="font-bold text-stone-900 truncate text-[17px] tracking-tight flex items-center gap-2">
                  {{ unlocked ? displayName : 'Mystery Match' }}
                  <span v-if="unlocked" class="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg class="w-2 h-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                </h3>
              </div>
              
              <!-- Persona Emoji -->
              <span class="flex-shrink-0 text-lg opacity-80 filter grayscale-[20%]" :title="personaName">
                {{ personaEmoji }}
              </span>
            </div>
            
            <!-- Meta Info -->
            <div class="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-2.5">
              <span class="text-stone-700">{{ age }}</span>
              <span v-if="location" class="flex items-center gap-1.5">
                <span class="w-0.5 h-0.5 rounded-full bg-stone-300"></span>
                <span class="capitalize truncate max-w-[120px]">{{ location }}</span>
              </span>
            </div>
            
            <!-- Shared Interests -->
            <div v-if="sharedInterests && sharedInterests.length > 0" class="mb-2">
              <div class="inline-flex items-center gap-1.5 py-0.5">
                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                  ✨ {{ sharedInterests.length }} shared interests
                </span>
              </div>
            </div>

            <!-- Bio/Teaser -->
            <p v-if="unlocked && bio" class="text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {{ bio }}
            </p>
            <p v-else-if="!unlocked" class="text-xs text-stone-400 line-clamp-2 leading-relaxed italic">
              Unlock to reveal common interests & bio...
            </p>
          </div>
          
          <!-- Footer Actions -->
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-stone-50">
            <template v-if="unlocked">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Status</span>
                <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  Matched
                </span>
              </div>
              <button 
                @click.stop="openWhatsApp"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-all shadow-sm"
              >
                Message
              </button>
            </template>
            
            <template v-else-if="currentUserPaid">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                   Pending Match
                </span>
                <span v-if="expiresAt" class="text-[10px] text-stone-400 font-medium mt-0.5">
                  Expires in {{ formatTimeRemaining }}
                </span>
              </div>
              <div class="w-6 h-6 flex items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            </template>
            
            <template v-else>
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Unlock Fee</span>
                <span class="text-sm font-bold text-stone-900 mt-0.5">{{ formattedPrice }}</span>
              </div>
              <button 
                @click.stop="$emit('unlock')"
                class="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm"
              >
                Unlock
              </button>
            </template>
          </div>
        </div>
      </div>
      
      <!-- Hover Glow Effect -->
      <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none"></div>
    </article>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-all duration-300"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-stone-200">
          <!-- Header Image -->
          <div class="relative h-48 bg-stone-100 flex-shrink-0 border-b border-stone-100">
            <button 
              @click="showModal = false"
              class="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <!-- Compatibility Badge -->
            <div 
              v-if="compatibilityScore"
              class="absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-stone-200"
            >
              <span class="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" :class="compatibilityScore >= 80 ? 'bg-emerald-500' : 'bg-stone-900'"></span>
                {{ compatibilityScore }}% Match
              </span>
            </div>
            
            <!-- Photo Layer -->
            <div class="absolute inset-0">
              <template v-if="unlocked">
                <img v-if="photoUrl" :src="photoUrl" :alt="displayName" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center bg-stone-50">
                  <span class="text-6xl font-bold text-stone-200 tracking-tighter">{{ displayName?.charAt(0) || '?' }}</span>
                </div>
              </template>
              <template v-else>
                <div class="w-full h-full flex items-center justify-center bg-stone-100/50 overflow-hidden relative">
                   <!-- Subtle Pattern Background -->
                  <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#444 1px, transparent 1px); background-size: 12px 12px;"></div>
                  <span class="text-6xl font-black text-stone-200 relative z-10">?</span>
                </div>
                <!-- Locked Overlay -->
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-stone-50/40 backdrop-blur-[3px]">
                  <div class="p-3 rounded-full bg-white border border-stone-100 shadow-sm mb-3">
                    <svg v-if="currentUserPaid" class="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    <svg v-else class="w-6 h-6 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <p v-if="currentUserPaid" class="text-xs font-bold text-amber-600 tracking-wider uppercase bg-amber-50 px-3 py-1 rounded-md border border-amber-100">Waiting for Reveal</p>
                  <p v-else class="text-xs font-bold text-stone-500 tracking-wider uppercase bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200">Private Profile</p>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Content Container -->
          <div class="px-6 pb-6 flex-1 overflow-y-auto min-h-0 relative bg-white">
            <!-- Profile Header -->
            <div class="pt-6 mb-6">
              <div class="flex items-start justify-between">
                <div>
                  <h2 v-if="unlocked" class="text-2xl font-bold text-stone-900 flex items-center gap-2 tracking-tight">
                    {{ displayName }}
                    <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                    </svg>
                  </h2>
                  <h2 v-else class="text-2xl font-bold text-stone-300 tracking-tight">Mystery Match</h2>
                  
                  <div class="flex items-center gap-3 text-stone-500 mt-1 text-sm font-medium">
                    <span>{{ age }} years</span>
                    <span v-if="gender" class="flex items-center gap-1 before:content-['•'] before:mr-3 before:text-stone-300">
                      {{ gender === 'female' ? 'Female' : 'Male' }}
                    </span>
                    <span v-if="location" class="flex items-center gap-1 before:content-['•'] before:mr-3 before:text-stone-300">
                      {{ location }}
                    </span>
                  </div>
                </div>
                <div 
                  class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-100"
                >
                  <span class="text-xl">{{ personaEmoji }}</span>
                </div>
              </div>
            </div>
            
            <!-- Unified Content Sections -->
            <div class="space-y-6">
              <!-- Bio -->
              <div v-if="(currentUserPaid || unlocked)">
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-widest mb-2">About</h3>
                <p v-if="bio" class="text-stone-600 leading-relaxed text-[15px]">"{{ bio }}"</p>
                <p v-else class="text-stone-400 italic text-sm">No bio shared yet.</p>
              </div>
              <div v-else>
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-widest mb-2">The Vibe</h3>
                <div class="p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <p class="italic text-stone-600 leading-relaxed">"{{ vibePreview }}"</p>
                </div>
                <p class="text-xs text-stone-400 mt-2 font-medium flex items-center gap-1">
                  � Unlock to see full profile & contact info
                </p>
              </div>
              
              <!-- Interests (Visible Teaser) -->
              <div v-if="sharedInterests && sharedInterests.length > 0">
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="text-emerald-500">✨</span> In Common
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="interest in sharedInterests" 
                    :key="interest"
                    class="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-md text-xs font-bold border border-emerald-100"
                  >
                    {{ getInterestLabel(interest) }}
                  </span>
                </div>
              </div>
              
              <!-- Icebreakers -->
              <div v-if="unlocked && icebreakers.length > 0">
                <h3 class="text-xs font-bold text-stone-900 uppercase tracking-widest mb-3">
                  Icebreakers
                </h3>
                <div class="space-y-2">
                  <button 
                    v-for="(icebreaker, idx) in icebreakers" 
                    :key="idx"
                    @click="copyIcebreaker(icebreaker, idx)"
                    class="w-full text-left p-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-sm text-stone-600 transition-colors border border-stone-100 flex gap-3 group items-center"
                  >
                    <span class="text-stone-300 group-hover:text-stone-400">💬</span>
                    <span class="flex-1">"{{ icebreaker }}"</span>
                    <span v-if="copiedIndex === idx" class="text-emerald-500 text-xs font-bold animate-in fade-in zoom-in">Copied!</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sticky Footer Actions -->
          <div class="p-4 border-t border-stone-100 bg-white z-20">
            <template v-if="unlocked && phone">
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 rounded-lg border border-stone-200">
                  <span class="flex-1 font-mono text-stone-600 text-sm pl-2">{{ phone }}</span>
                  <button @click="copyPhone" class="px-3 py-1 bg-stone-100 text-[10px] font-bold text-stone-600 rounded hover:bg-stone-200 uppercase tracking-wide">
                    {{ copied ? 'Copied' : 'Copy' }}
                  </button>
                </div>
                
                <div class="flex gap-3">
                  <a 
                    :href="whatsappLink" 
                    target="_blank"
                    class="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-[#1C1917] text-white rounded-lg font-bold hover:bg-black transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a 
                    :href="`tel:${phone}`"
                    class="flex-1 flex items-center justify-center px-6 py-3 bg-stone-100 text-stone-900 border border-stone-200 rounded-lg font-bold hover:bg-stone-200 transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>
            </template>
            
            <template v-else-if="!unlocked && !currentUserPaid">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-2xl font-bold text-stone-900 tracking-tight">{{ formattedPrice }}</p>
                  <p class="text-xs text-stone-500 font-medium">One-time unlock fee</p>
                </div>
                <button 
                  @click="handleUnlock"
                  :disabled="isUnlocking"
                  class="flex-1 py-3 bg-[#1C1917] text-white rounded-lg font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  <span v-if="isUnlocking" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {{ isUnlocking ? 'Unlocking...' : 'Unlock Profile' }}
                </button>
              </div>
            </template>
            
            <template v-else>
              <div class="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-3">
                <div class="text-xl">⏳</div>
                <div>
                  <p class="text-sm font-bold text-amber-900">Waiting for them...</p>
                  <p class="text-xs text-amber-700/80">We've nudged them via SMS.</p>
                </div>
              </div>
            </template>
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
  bio?: string
  interests?: string[]
  sharedInterests?: string[]
  expiresAt?: string
  matchedAt?: string
  location?: string
  gender?: 'male' | 'female'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  unlock: []
  message: []
}>()

const router = useRouter()

// Local state
const showModal = ref(false)
const copied = ref(false)
const isUnlocking = ref(false)
const copiedIndex = ref<number | null>(null)
const showCelebration = ref(false)

// Navigate to dedicated connection page
const navigateToConnection = () => {
  router.push(`/me/connection/${props.matchId}`)
}

onMounted(() => {
  if (props.unlocked) {
    showCelebration.value = true
    setTimeout(() => { showCelebration.value = false }, 5000)
  }
})

watch(() => props.unlocked, (newVal) => {
  if (newVal) {
    showCelebration.value = true
    isUnlocking.value = false // Reset loading on success
    setTimeout(() => { showCelebration.value = false }, 5000)
  }
})

const handleUnlock = async () => {
  isUnlocking.value = true
  // Emit the event to parent
  emit('unlock')
  // We don't close modal immediately, wait for parent to update props.unlocked or handle error
  // If we wanted to fake it for UI feel:
  // setTimeout(() => { showModal.value = false }, 1000) 
  // But better to wait for prop change or let parent handle route.
}

// Compatibility Score (based on shared interests)
const compatibilityScore = computed(() => {
  if (!props.sharedInterests || !props.interests) return null
  if (props.interests.length === 0) return null
  const score = Math.round((props.sharedInterests.length / Math.max(props.interests.length, 1)) * 100)
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

// Icebreaker suggestions based on shared interests
const icebreakers = computed(() => {
  if (!props.sharedInterests || props.sharedInterests.length === 0) {
    return [
      `Hi ${props.displayName || 'there'}! I noticed we matched. What's keeping you busy these days?`,
      `Hey! 👋 Excited to connect with you. What made you join Minutes2Match?`
    ]
  }
  
  const suggestions: string[] = []
  const name = props.displayName || 'there'
  
  props.sharedInterests.slice(0, 2).forEach(interest => {
    switch (interest) {
      case 'travel':
        suggestions.push(`Hi ${name}! I saw we both love traveling ✈️ What's the most memorable place you've visited?`)
        break
      case 'fitness':
        suggestions.push(`Hey ${name}! Fellow fitness enthusiast here 💪 What's your go-to workout?`)
        break
      case 'cooking':
        suggestions.push(`Hi ${name}! I noticed we're both into cooking 🍳 What's your signature dish?`)
        break
      case 'movies':
        suggestions.push(`Hey ${name}! Movie lover here too 🎬 Seen anything good lately?`)
        break
      case 'music':
        suggestions.push(`Hi ${name}! What kind of music gets you going? 🎵`)
        break
      case 'food':
        suggestions.push(`Hey ${name}! Fellow foodie here 🍕 What's your favorite spot in town?`)
        break
      case 'reading':
        suggestions.push(`Hi ${name}! I love that we both enjoy reading 📚 Any book recommendations?`)
        break
      default:
        suggestions.push(`Hi ${name}! Great that we have ${getInterestLabel(interest)} in common! Tell me more about it.`)
    }
  })
  
  return suggestions.slice(0, 2)
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
  const message = encodeURIComponent(icebreakers.value[0] || `Hi ${props.displayName || 'there'}! 👋 We matched on Minutes2Match.`)
  return `https://wa.me/${cleanPhone}?text=${message}`
})

const openWhatsApp = () => {
  if (props.phone) window.open(whatsappLink.value, '_blank')
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

const hoursRemaining = computed(() => {
  if (!props.expiresAt) return 0
  const diffMs = new Date(props.expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
})

const formatTimeRemaining = computed(() => {
  const hours = hoursRemaining.value
  if (hours <= 0) return 'Expired'
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
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
