<template>
  <article 
    class="group relative h-auto min-h-[220px] bg-white rounded-[40px] overflow-hidden transition-all duration-500 border border-stone-50 hover:shadow-2xl hover:-translate-y-2 flex flex-col sm:flex-row"
    :class="[isDisappearing ? 'opacity-0 scale-90 blur-md pointer-events-none' : 'opacity-100 scale-100 blur-0']"
  >
    <!-- Main Content Layout -->
    <div class="flex flex-1 items-stretch h-full overflow-hidden">
      <!-- Image Section (Left) -->
      <div class="w-[120px] sm:w-[160px] flex-shrink-0 bg-stone-50 relative overflow-hidden h-full border-r border-stone-50">
        <!-- Gender Badge -->
        <div 
          v-if="gender"
          class="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black bg-white ring-2 ring-black shadow-sm"
          :class="gender?.toLowerCase() === 'female' ? 'text-rose-500' : 'text-blue-500'"
        >
          {{ gender?.toLowerCase() === 'female' ? '♀' : '♂' }}
        </div>
        
        <NuxtImg 
          v-if="photoUrl" 
          :src="photoUrl" 
          :alt="displayName"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          width="160"
          height="220"
          loading="lazy"
        />
        <div v-else class="flex flex-col items-center justify-center h-full opacity-10 bg-stone-100">
           <svg class="w-10 h-10 text-stone-900" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
      </div>

      <!-- Content Section (Right) -->
      <div class="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-white">
        <!-- Match Score Indicator (Top Right) -->
        <div class="absolute top-6 right-6 w-12 h-12 rounded-full border-[3px] border-rose-100 flex items-center justify-center bg-rose-50 animate-pulse-subtle">
           <span class="text-[12px] font-black text-[#ff003c]">{{ matchScore }}%</span>
        </div>

        <div>
          <h3 class="text-3xl font-serif font-black italic text-stone-900 leading-tight flex items-center gap-1.5 mb-1">
            {{ displayName }}
            <span v-if="isVerified" class="inline-flex w-5 h-5 rounded-full bg-blue-500 items-center justify-center border-2 border-white shadow-sm">
               <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            </span>
          </h3>
          
          <div class="text-[13px] font-bold text-stone-700 flex items-center gap-2 mb-4">
            <span>{{ age }} &middot; {{ location || 'Accra' }}</span>
            <span v-if="occupation" class="text-stone-300">|</span>
            <span v-if="occupation" class="text-stone-400 font-black uppercase tracking-tight">{{ occupation }}</span>
          </div>

          <!-- Secondary Info Badges -->
          <div class="flex flex-wrap gap-2 mb-5">
             <div v-if="intent" class="px-3 py-1.5 bg-rose-50 text-[#881337] border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest italic">
                INTENTION: {{ formatIntent(intent) }}
             </div>
             
             <div v-if="mood" class="px-3 py-1.5 bg-stone-50 text-stone-500 border border-stone-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                {{ mood.replace('_', ' ') }}
             </div>
          </div>

          <!-- Shared Interests Section -->
          <div v-if="sharedInterests && sharedInterests.length > 0" class="pt-4 border-t border-stone-50">
             <p class="text-[9px] font-bold text-stone-300 uppercase tracking-widest mb-3 italic">Mutual Ground</p>
             <div class="flex flex-wrap gap-1.5">
                <span v-for="interest in sharedInterests.slice(0, 3)" :key="interest" class="text-[10px] font-black text-stone-600 bg-stone-50 px-3 py-1 rounded-full border border-stone-100 lowercase">
                   {{ interest }}
                </span>
                <span v-if="sharedInterests.length > 3" class="text-[9px] font-bold text-stone-300 self-center ml-1">+{{ sharedInterests.length - 3 }}</span>
             </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-stone-50 mt-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-stone-300'"></span>
            <span class="text-[11px] font-black uppercase tracking-widest text-stone-400">{{ isOnline ? 'Live' : 'Active' }}</span>
          </div>

          <button 
            @click.stop="handleConnect"
            :disabled="isConnected || isDisappearing"
            class="px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-lg active:scale-95"
            :class="isConnected ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-[#ff003c] text-white shadow-rose-100 hover:bg-rose-600'"
          >
            {{ isConnected ? 'Success!' : 'Connect' }}
          </button>
        </div>
      </div>
    </article>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
interface Props {
  id: string
  displayName: string
  photoUrl: string | null
  age: number
  gender: string
  isOnline?: boolean
  interestedIn?: string
  mood?: string
  intent?: string
  matchScore: number
  interests: string[]
  sharedInterests?: string[]
  dealbreakers?: Record<string, any>
  isVerified?: boolean
  isDisappearing?: boolean
  bio?: string
  location?: string
  occupation?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  connect: [id: string],
  viewProfile: [id: string]
}>()

const isConnected = ref(false)

const handleConnect = () => {
  isConnected.value = true
  emit('connect', props.id)
}

const formatIntent = (val: string) => {
  if (val === 'serious') return 'Serious'
  if (val === 'marriage') return 'Marriage'
  if (val === 'casual') return 'Casual'
  if (val === 'friendship') return 'Friendship'
  return val
}

const formatDealbreaker = (key: string, val: any) => {
   // Assuming dealbreakers are like { smoker: 'no', carrier: 'no' }
   const labels: Record<string, string> = {
      smoker: 'Smoker',
      carrier: 'Genotype Carrier',
      religion: 'Different Religion',
      kids: 'Has Kids'
   }
   return labels[key] || key
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
