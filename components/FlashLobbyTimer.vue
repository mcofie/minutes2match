<template>
  <div class="relative flex items-center gap-6 px-8 py-4 bg-white/70 backdrop-blur-2xl rounded-3xl border border-stone-100 overflow-hidden group">
    <!-- Visual Glow -->
    <div class="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
    
    <!-- Countdown Dial -->
    <div class="relative w-12 h-12 flex items-center justify-center">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 32 32">
        <circle 
          class="text-stone-100" 
          stroke-width="3" 
          stroke="currentColor" 
          fill="transparent" 
          r="14" 
          cx="16" 
          cy="16" 
        />
        <circle 
          class="transition-all duration-1000" 
          :class="isWarning ? 'text-rose-500' : 'text-indigo-500'"
          stroke-width="3" 
          :stroke-dasharray="88" 
          :stroke-dashoffset="remainingDash" 
          stroke-linecap="round" 
          stroke="currentColor" 
          fill="transparent" 
          r="14" 
          cx="16" 
          cy="16" 
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span 
          class="w-1.5 h-1.5 rounded-full animate-pulse" 
          :class="isWarning ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.3)]'"
        ></span>
      </div>
    </div>

    <!-- Time & Status Text -->
    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-mono font-black tabular-nums tracking-tighter" :class="isWarning ? 'text-rose-600' : 'text-stone-900'">
          {{ formattedTime }}
        </span>
        <span v-if="isLive" class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest" :class="isWarning ? 'bg-rose-500/10 text-rose-600' : 'bg-indigo-500/10 text-indigo-600'">
          Live
        </span>
      </div>
      <p class="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] leading-none">
        Flash Lobby Expiry
      </p>
    </div>

    <!-- Right Side: Interaction Status -->
    <div class="ml-auto flex -space-x-2">
      <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full border-2 border-white bg-stone-200 animate-pulse"></div>
      <div class="w-8 h-8 rounded-full border-2 border-white bg-stone-900 flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg">
        +24
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  totalSeconds: number
  remainingSeconds: number
  isLive?: boolean
}>()

const isWarning = computed(() => props.remainingSeconds < 60) // Red alert last 60s

const formattedTime = computed(() => {
  const mins = Math.floor(props.remainingSeconds / 60)
  const secs = props.remainingSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const remainingDash = computed(() => {
  const percentage = props.remainingSeconds / props.totalSeconds
  return 88 - (88 * percentage)
})
</script>
