<template>
  <article 
    class="group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
    :class="unlocked ? 'border-orange-500 ring-2 ring-orange-500/10' : currentUserPaid ? 'border-amber-400 ring-2 ring-amber-400/10' : 'border-stone-200 hover:border-stone-300'"
  >
    <!-- Photo Area -->
    <div class="relative h-64 bg-stone-100 overflow-hidden">
      <!-- Locked State Overlay -->
      <div v-if="!unlocked" class="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/80 backdrop-blur-sm z-10 transition-all duration-300 group-hover:bg-stone-100/60">
        <div class="bg-white p-4 rounded-full shadow-lg mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <!-- Show different icon if user paid -->
          <svg v-if="currentUserPaid" class="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
          </svg>
          <svg v-else class="w-8 h-8 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p v-if="currentUserPaid" class="text-xs font-bold uppercase tracking-widest text-amber-600">Waiting for Reveal</p>
        <p v-else class="text-xs font-bold uppercase tracking-widest text-stone-500">Private Profile</p>
      </div>

      <!-- Photo (or specific placeholder) -->
      <img 
        v-if="photoUrl && unlocked" 
        :src="photoUrl" 
        :alt="displayName"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-bold text-4xl">
        {{ unlocked ? (displayName?.charAt(0) || '?') : '?' }}
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">{{ age }} years</span>
        <span 
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
          :style="{ backgroundColor: personaColor }"
        >
          {{ personaEmoji }} {{ personaName }}
        </span>
      </div>
      
      <h3 v-if="unlocked" class="text-xl font-bold text-stone-900 mb-2">{{ displayName }}</h3>
      
      <!-- Progressive Reveal: Show bio when user has paid -->
      <template v-if="currentUserPaid || unlocked">
        <p v-if="bio" class="text-stone-600 leading-relaxed mb-3 line-clamp-2">
          "{{ bio }}"
        </p>
        <p v-else class="text-stone-500 italic mb-3 text-sm">
          No bio added yet
        </p>
        
        <!-- Shared Interests (highlighted) -->
        <div v-if="sharedInterests && sharedInterests.length > 0" class="mb-4">
          <p class="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <span>✨</span> {{ sharedInterests.length }} Common Interest{{ sharedInterests.length > 1 ? 's' : '' }}
          </p>
          <div class="flex flex-wrap gap-1.5">
            <span 
              v-for="interest in sharedInterests.slice(0, 4)" 
              :key="interest"
              class="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100"
            >
              {{ getInterestLabel(interest) }}
            </span>
            <span 
              v-if="sharedInterests.length > 4" 
              class="px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-xs font-medium"
            >
              +{{ sharedInterests.length - 4 }} more
            </span>
          </div>
        </div>
        
        <!-- Their Interests -->
        <div v-else-if="interests && interests.length > 0" class="mb-4">
          <p class="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Their Interests</p>
          <div class="flex flex-wrap gap-1.5">
            <span 
              v-for="interest in interests.slice(0, 4)" 
              :key="interest"
              class="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium"
            >
              {{ getInterestLabel(interest) }}
            </span>
            <span 
              v-if="interests.length > 4" 
              class="px-2 py-1 bg-stone-50 text-stone-400 rounded-full text-xs font-medium"
            >
              +{{ interests.length - 4 }}
            </span>
          </div>
        </div>
      </template>
      
      <!-- Before payment: Just show vibe preview -->
      <template v-else>
        <p class="text-stone-600 leading-relaxed italic mb-3">
          "{{ vibePreview }}"
        </p>
        <p class="text-xs text-stone-400 mb-4">💡 Pay to unlock their bio & interests</p>
      </template>
      
      <!-- Phone (only when fully unlocked) -->
      <div v-if="unlocked && phone" class="flex items-center gap-2 text-stone-500 text-sm font-medium mb-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
        <svg class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>{{ phone }}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-6 py-4 bg-stone-50 border-t border-stone-100">
      <template v-if="unlocked">
        <div class="flex items-center justify-between">
          <span class="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Unlocked
          </span>
          <UiButton
            variant="outline"
            size="sm"
            @click="$emit('message')"
          >
            Message
          </UiButton>
        </div>
      </template>
      
      <template v-else-if="currentUserPaid">
        <div class="space-y-3">
          <!-- Expiration Timer -->
          <div v-if="expiresAt" class="flex items-center justify-between text-xs">
            <span class="text-stone-500">Match expires in:</span>
            <span class="font-bold" :class="hoursRemaining <= 24 ? 'text-red-500' : 'text-amber-600'">
              ⏱️ {{ formatTimeRemaining }}
            </span>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="text-2xl">⏳</span>
            <div class="flex-1">
              <span class="block text-sm font-bold text-stone-900">Waiting for them to unlock</span>
              <span class="block text-xs text-stone-500">They've been notified via SMS</span>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-stone-900">{{ formattedPrice }}</span>
          <UiButton
            variant="primary"
            size="sm"
            @click="$emit('unlock')"
          >
            Unlock Profile
          </UiButton>
        </div>
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

interface Props {
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
  // Progressive reveal props
  bio?: string
  interests?: string[]
  sharedInterests?: string[]
  // Expiration prop
  expiresAt?: string // ISO date string
}

const props = defineProps<Props>()

defineEmits<{
  unlock: []
  message: []
}>()

// Interest labels map
const interestLabels: Record<string, string> = {
  travel: 'Travel ✈️',
  fitness: 'Fitness 💪',
  cooking: 'Cooking 🍳',
  movies: 'Movies 🎬',
  music: 'Music 🎵',
  gaming: 'Gaming 🎮',
  reading: 'Reading 📚',
  art: 'Art 🎨',
  sports: 'Sports ⚽',
  tech: 'Tech 💻',
  fashion: 'Fashion 👗',
  food: 'Foodie 🍕',
  nature: 'Nature 🌿',
  photography: 'Photography 📸',
  dancing: 'Dancing 💃',
  entrepreneurship: 'Business 💼'
}

const getInterestLabel = (interestId: string): string => {
  return interestLabels[interestId] || interestId
}

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(props.unlockPrice)
)

// Expiration timer computeds
const hoursRemaining = computed(() => {
  if (!props.expiresAt) return 0
  const now = new Date()
  const expiry = new Date(props.expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
})

const formatTimeRemaining = computed(() => {
  if (!props.expiresAt) return ''
  const hours = hoursRemaining.value
  if (hours <= 0) return 'Expired'
  if (hours < 24) return `${hours}h remaining`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
