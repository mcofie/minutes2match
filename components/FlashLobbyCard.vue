<template>
  <article 
    @click="emit('viewProfile', props.id)"
    class="group relative h-auto min-h-[200px] sm:h-[190px] bg-white border-2 border-black rounded-2xl overflow-hidden transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex"
    :class="[isDisappearing ? 'opacity-0 scale-90 blur-md pointer-events-none' : 'opacity-100 scale-100 blur-0']"
  >
    <!-- Main Content Layout -->
    <div class="flex flex-1 items-stretch h-full overflow-hidden">
      <!-- Image Section -->
      <div class="w-[120px] sm:w-[140px] flex-shrink-0 bg-stone-100 relative overflow-hidden h-full border-r-2 border-black">
        <!-- Gender Badge -->
        <div 
          v-if="gender"
          class="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-white ring-1 ring-stone-200 shadow-sm"
          :class="gender?.toLowerCase() === 'female' ? 'text-rose-500' : 'text-blue-500'"
        >
          {{ gender?.toLowerCase() === 'female' ? '♀' : '♂' }}
        </div>
        
        <NuxtImg 
          v-if="photoUrl" 
          :src="photoUrl" 
          :alt="displayName"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          width="140"
          height="190"
          loading="lazy"
        />
        <div v-else class="flex flex-col items-center justify-center h-full opacity-20">
           <svg class="w-8 h-8 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/></svg>
        </div>
      </div>

      <!-- Content Section -->
      <div class="flex-1 p-4 sm:p-5 flex flex-col justify-between relative bg-white min-w-0">
        <!-- Match Score Ring -->
        <div class="absolute top-3 right-3 w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-10">
           <span class="text-[10px] font-bold text-rose-500 leading-none">{{ Math.round(matchScore || 0) }}%</span>
        </div>

        <div>
          <h3 class="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-tight mb-1 truncate pr-12">
            {{ displayName }}
          </h3>
          <div class="text-[10px] font-medium text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <span>{{ age }} &middot; {{ location || 'Accra' }}</span>
          </div>

          <div class="mt-2.5 flex flex-wrap gap-1.5">
             <div v-if="intent" class="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-[9px] font-bold uppercase tracking-widest text-stone-600">
                Focus: {{ intent }}
             </div>
          </div>

          <!-- Shared Interests Highlights -->
          <div v-if="sharedInterests && sharedInterests.length > 0" class="mt-3 flex flex-col gap-1.5">
             <div class="flex flex-wrap gap-1">
                <span v-for="interest in sharedInterests.slice(0, 3)" :key="interest" class="px-2 py-1 bg-rose-50 border border-rose-100 rounded text-[9px] font-bold text-rose-600 lowercase">
                   {{ interest }}
                </span>
                <span v-if="sharedInterests.length > 3" class="px-2 py-1 bg-stone-50 border border-stone-100 rounded text-[9px] font-bold text-stone-400">
                   +{{ sharedInterests.length - 3 }}
                </span>
             </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
          <div class="flex flex-col shrink-0">
            <span class="text-[9px] sm:text-[10px] font-bold leading-none flex items-center gap-1.5" :class="isOnline ? 'text-emerald-500' : 'text-stone-400'">
               <span v-if="isOnline" class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
               {{ isOnline ? 'Active Now' : 'Offline' }}
            </span>
          </div>

          <button 
            @click.stop="emit('viewProfile', props.id)"
            :disabled="isDisappearing"
            class="px-5 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all bg-black text-white hover:bg-indigo-600 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
          >
            Send Spark ↗
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
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
  viewProfile: [id: string]
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
