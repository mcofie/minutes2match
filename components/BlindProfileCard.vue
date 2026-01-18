<template>
  <article 
    class="group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
    :class="unlocked ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-stone-200 hover:border-stone-300'"
  >
    <!-- Photo Area -->
    <div class="relative h-64 bg-stone-100 overflow-hidden">
      <!-- Locked State Overlay -->
      <div v-if="!unlocked" class="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/80 backdrop-blur-sm z-10 transition-all duration-300 group-hover:bg-stone-100/60">
        <div class="bg-white p-4 rounded-full shadow-lg mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <svg class="w-8 h-8 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p class="text-xs font-bold uppercase tracking-widest text-stone-500">Private Profile</p>
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
      
      <p class="text-stone-600 leading-relaxed italic mb-6">
        {{ unlocked ? vibeSummary : `"${vibePreview}"` }}
      </p>
      
      <div v-if="unlocked && phone" class="flex items-center gap-2 text-stone-500 text-sm font-medium mb-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
        <svg class="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span>{{ phone }}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
      <template v-if="unlocked">
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
      </template>
      
      <template v-else-if="currentUserPaid">
        <div class="flex items-center gap-3 w-full">
          <span class="text-xl animate-pulse">⏳</span>
          <div>
            <span class="block text-sm font-bold text-stone-900">Waiting for them</span>
            <span class="block text-xs text-stone-500">We notified them via SMS</span>
          </div>
        </div>
      </template>
      
      <template v-else>
        <span class="text-lg font-bold text-stone-900">{{ formattedPrice }}</span>
        <UiButton
          variant="primary"
          size="sm"
          @click="$emit('unlock')"
        >
          Unlock Profile
        </UiButton>
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
}

const props = defineProps<Props>()

defineEmits<{
  unlock: []
  message: []
}>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(props.unlockPrice)
)
</script>
