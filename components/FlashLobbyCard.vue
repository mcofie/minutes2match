<template>
  <article 
    class="group relative h-[200px] min-h-[200px] max-h-[200px] bg-white rounded-2xl overflow-hidden transition-all duration-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex"
    :class="[isDisappearing ? 'opacity-0 scale-90 blur-md pointer-events-none' : 'opacity-100 scale-100 blur-0']"
  >
    <!-- Main Content Layout -->
    <div class="flex flex-1 items-stretch h-full overflow-hidden">
      <!-- Photo Section (Left) -->
      <div class="w-32 sm:w-36 flex-shrink-0 bg-stone-100 relative overflow-hidden group-hover:bg-stone-200 transition-colors h-full border-r-2 border-black">
        <!-- Gender Badge -->
        <div 
          v-if="gender"
          class="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/90 backdrop-blur-sm shadow-sm border border-stone-200"
          :class="gender?.toLowerCase() === 'female' ? 'text-pink-600' : 'text-blue-600'"
        >
          {{ gender?.toLowerCase() === 'female' ? '♀' : '♂' }}
        </div>
        
        <NuxtImg 
          v-if="photoUrl" 
          :src="photoUrl" 
          :alt="displayName"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          width="144"
          height="200"
          loading="lazy"
          placeholder
        />
        <div v-else class="flex flex-col items-center justify-center h-full opacity-20">
           <svg class="w-8 h-8 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
        </div>
      </div>

      <!-- Content Section (Right) -->
      <div class="flex flex-col flex-1 h-full p-3 min-w-0 bg-white relative">
        <!-- Persistent Content Stack -->
        <div class="flex-1 space-y-1.5 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="text-lg font-serif font-black italic text-black truncate leading-tight flex items-center gap-2">
                {{ displayName }}
                <span v-if="isVerified" class="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-500 border border-black flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <svg class="w-2 h-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </span>
              </h3>
              <div class="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-tight">
                <span>{{ age }} &middot; {{ location || 'Accra' }}</span>
              </div>
            </div>
            <div class="text-base opacity-30 mt-1">💕</div>
          </div>

          <!-- Shared Interests Badge -->
          <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100/50 rounded-md">
             <span class="text-[9px] font-black text-emerald-600 leading-tight">✨ {{ sharedInterests?.length || 0 }} shared interests</span>
          </div>

          <!-- Bio Snippet -->
          <p class="text-[11px] text-stone-600 line-clamp-2 leading-tight font-medium">
            "{{ bio || 'Enjoying life. Collecting moments.' }}"
          </p>
        </div>

        <!-- Footer Actions (Stays pinned to bottom) -->
        <div class="flex items-end justify-between pt-2">
          <div class="flex flex-col gap-0.5">
            <span class="text-[7px] font-black text-stone-400 uppercase tracking-widest leading-none">Status</span>
            <span class="text-[9px] font-black text-emerald-600 leading-none">Live Now</span>
          </div>

          <button 
            @click.stop="handleConnect"
            :disabled="isConnected || isDisappearing"
            class="px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border-2 border-black flex items-center justify-center min-w-[85px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            :class="isConnected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-stone-900 text-white hover:bg-black'"
          >
            {{ isConnected ? 'Message' : 'Connect' }}
          </button>
        </div>
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
  interestedIn?: string
  mood?: string
  matchScore: number
  interests: string[]
  sharedInterests?: string[]
  isVerified?: boolean
  isDisappearing?: boolean
  bio?: string
  location?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  connect: [id: string]
}>()

const isConnected = ref(false)

const handleConnect = () => {
  isConnected.value = true
  emit('connect', props.id)
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
