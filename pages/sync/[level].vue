<template>
  <div class="h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-white transition-colors duration-500 relative overflow-hidden">
    
    <!-- Inferno Lock Screen (Neo-Brutalist) -->
    <div v-if="level === 'inferno' && !infernoUnlocked" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-rose-500 text-black transition-transform duration-700 ease-in-out" :class="{'translate-y-full': fadeOutInferno}">
       
       <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#000 2px, transparent 2px); background-size: 24px 24px;"></div>

       <div class="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
         <!-- Brutalist Warning Pill -->
         <div class="bg-black text-rose-500 px-4 py-2 font-black uppercase tracking-widest text-xs border-2 border-black inline-block mb-6 transform -rotate-3 shadow-[4px_4px_0px_0px_#ffffff]">
            Restricted Area
         </div>
         
         <h1 class="text-6xl sm:text-7xl font-black uppercase tracking-tighter text-black mb-8 text-center leading-none">The<br>Inferno</h1>

         <!-- Message Card -->
         <div class="bg-white border-4 border-black p-5 mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            <p class="text-sm font-bold uppercase tracking-widest text-black text-center leading-relaxed">
               Proceed with caution.<br>Connections get deep here.
            </p>
         </div>
         
         <!-- Security Hold Button (Brutalist) -->
         <button 
           @mousedown="startUnlock" 
           @mouseup="cancelUnlock"
           @mouseleave="cancelUnlock"
           @touchstart.prevent="startUnlock"
           @touchend.prevent="cancelUnlock"
           class="w-40 h-40 rounded-full border-4 border-black bg-rose-400 flex flex-col items-center justify-center relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all select-none group focus:outline-none overflow-hidden"
         >
            <!-- Brutalist Fill Animation -->
            <div class="absolute inset-y-0 left-0 bg-black transition-all duration-100 ease-linear" :style="{ width: `${unlockProgress}%` }"></div>
            
            <!-- Brutalist Icon -->
            <svg class="w-10 h-10 mb-2 relative z-10 transition-transform group-active:scale-110" :class="{'text-white': unlockProgress > 45, 'text-black': unlockProgress <= 45}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
               <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
               <polyline points="2 17 12 22 22 17"></polyline>
               <polyline points="2 12 12 17 22 12"></polyline>
            </svg>

            <span class="font-black uppercase tracking-widest text-[10px] relative z-10 transition-colors" :class="{'text-white': unlockProgress > 60, 'text-black': unlockProgress <= 60}">
               {{ isUnlocking ? 'Unlocking...' : 'Hold to Enter' }}
            </span>
         </button>
       </div>
    </div>

    <!-- Background element -->
    <div class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

    <div v-if="loading" class="animate-pulse font-mono tracking-widest text-stone-500 dark:text-stone-400 text-sm z-10 font-bold uppercase">
      Establishing Sync...
    </div>

    <!-- Wildcard Quick View -->
    <div v-else-if="level === 'wildcard'" class="w-full max-w-sm mx-auto z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center h-full px-3">
      <div class="text-center mb-12 relative animate-in slide-in-from-bottom-2 fade-in" :key="pollData?.id">
        <div class="flex flex-col items-center justify-center mb-6">
           <h2 class="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-[10px] font-black uppercase tracking-widest border-2 border-black dark:border-stone-700 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] text-stone-600 dark:text-stone-300">Wildcard</h2>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black font-serif italic leading-tight text-black dark:text-white px-2">{{ pollData?.question || 'Drawing blank...' }}</h1>
      </div>

      <div class="space-y-6">
        <button 
          @click="fetchPoll" 
          class="w-full relative group bg-purple-500 text-white rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase tracking-widest text-sm"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ease-out" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"></circle>
              <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"></circle>
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"></circle>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
            </svg>
            Roll Die
          </span>
        </button>
      </div>
      
      <!-- Growth Loop Link -->
      <div class="mt-12 text-center pb-8 flex-shrink-0">
          <NuxtLink to="/shop" @click="trackDiscord('shop_visited')" class="text-[9px] font-black uppercase tracking-widest text-stone-500 border-2 border-stone-200 px-4 py-2 rounded-full hover:border-black hover:text-black transition-colors">
             Get Your Own Spark Deck →
          </NuxtLink>
      </div>
    </div>

    <!-- Poll View -->
    <div v-else-if="!hasVoted" class="w-full max-w-sm mx-auto z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center h-full px-3">
      <div class="text-center mb-12 relative">
        <div class="flex flex-col items-center justify-center mb-6">
           <h2 class="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-[10px] font-black uppercase tracking-widest border-2 border-black dark:border-stone-700 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] text-stone-600 dark:text-stone-300 transform transition-all hover:scale-105 active:scale-95 cursor-pointer">Vibe Check</h2>
           <div class="flex gap-2 mt-4" v-if="(pollData?.season && pollData?.season !== 'Standard') || (pollData?.country && pollData?.country !== 'Global')">
             <span v-if="pollData?.country !== 'Global'" class="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
               📍 {{ pollData?.country }}
             </span>
             <span v-if="pollData?.season !== 'Standard'" class="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
               ✨ {{ pollData?.season }}
             </span>
           </div>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black font-serif italic leading-tight text-black dark:text-white px-2">{{ pollData?.question || 'Loading Vibe...' }}</h1>
      </div>

      <div class="space-y-6">
        <button 
          @click="castVote('A')"
          :disabled="voting || !pollData?.id"
          class="w-full relative group bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] font-bold font-serif text-xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <span class="relative z-10">{{ pollData?.option_a_label || 'Standby' }}</span>
        </button>
        <button 
          @click="castVote('B')"
          :disabled="voting || !pollData?.id"
          class="w-full relative group bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] font-bold font-serif text-xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <span class="relative z-10">{{ pollData?.option_b_label || 'Standby' }}</span>
        </button>
      </div>
    </div>

    <!-- Results / Level Splash View -->
    <div v-else class="w-full max-w-sm mx-auto z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col justify-center h-full pt-10 pb-4 px-3 overflow-y-auto overflow-x-hidden">
      
      <!-- Top Level Header -->
      <div class="mb-8 relative flex flex-col items-center justify-center flex-shrink-0 mt-6">
         <h2 class="text-[10px] font-black uppercase tracking-widest mb-3 text-stone-500 dark:text-stone-400">Level Unlocked</h2>
         <h1 class="text-5xl sm:text-6xl font-black uppercase tracking-tight mb-2 text-black dark:text-white" :class="textColorClass">The {{ level }}</h1>
         
         <div class="flex gap-2 mt-2" v-if="(pollData?.season && pollData?.season !== 'Standard') || (pollData?.country && pollData?.country !== 'Global')">
             <span v-if="pollData?.country !== 'Global'" class="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
               📍 {{ pollData?.country }}
             </span>
             <span v-if="pollData?.season !== 'Standard'" class="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
               ✨ {{ pollData?.season }}
             </span>
         </div>
         
         <div class="w-16 h-2 mt-4 rounded-full border-2 border-black dark:border-stone-700" :class="bgClass"></div>
      </div>
      
      <!-- Live Results -->
      <div class="w-full bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 rounded-xl p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] flex-shrink-0">
         <div class="flex items-center justify-between mb-6">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Live Sync Data</h3>
            <span class="px-2 py-0.5 text-[8px] font-black uppercase text-white border-2 border-black rounded-full flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :class="bgClass">
               <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
               Live
            </span>
         </div>

         <div class="space-y-6">
            <!-- Option A Progress -->
            <div class="space-y-2">
               <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-black dark:text-white" :class="{'opacity-50': percentA < percentB}">
                  <span>{{ pollData?.option_a_label }}</span>
                  <span class="font-black">{{ percentA }}%</span>
               </div>
               <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-black dark:border-stone-700">
                  <div class="h-full transition-all duration-1000 ease-out border-r border-black dark:border-stone-700" :class="[percentA >= percentB ? bgClass : 'bg-stone-300 dark:bg-stone-600']" :style="{ width: percentA + '%' }"></div>
               </div>
            </div>
            
            <!-- Option B Progress -->
            <div class="space-y-2">
               <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-black dark:text-white" :class="{'opacity-50': percentB < percentA}">
                  <span>{{ pollData?.option_b_label }}</span>
                  <span class="font-black">{{ percentB }}%</span>
               </div>
               <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden border border-black dark:border-stone-700">
                  <div class="h-full transition-all duration-1000 ease-out border-r border-black dark:border-stone-700" :class="[percentB > percentA ? bgClass : 'bg-stone-300 dark:bg-stone-600']" :style="{ width: percentB + '%' }"></div>
               </div>
            </div>
         </div>
         
         <!-- Stance Validation -->
         <div v-if="userStanceMessage" class="mt-6 px-4 py-3 rounded-xl border-2 font-bold uppercase tracking-widest text-[10px] text-center transition-colors" :class="userStanceClass">
            {{ userStanceMessage }}
         </div>
      </div>

      <!-- Mood Radio -->
      <a 
        :href="playlistUri"
        target="_blank"
        @click="trackDiscord('mood_activated')"
        class="w-full py-4 rounded-xl flex flex-shrink-0 items-center justify-center gap-2 font-black uppercase tracking-widest text-sm transition-all border-2 border-black dark:border-stone-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none group text-white"
        :class="bgClass"
      >
        <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
        <span>Activate Mood</span>
      </a>
      
      <p class="text-center text-[10px] text-stone-500 dark:text-stone-400 mt-6 font-bold uppercase tracking-widest flex-shrink-0">
         {{ totalVotes }} Pulses Detected Globally
      </p>
      
      <!-- Growth Loop Link -->
      <div class="mt-12 text-center pb-8 flex-shrink-0">
          <NuxtLink to="/shop" @click="trackDiscord('shop_visited')" class="text-[9px] font-black uppercase tracking-widest text-stone-500 border-2 border-stone-200 px-4 py-2 rounded-full hover:border-black hover:text-black transition-colors">
             Get Your Own Spark Deck →
          </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import confetti from 'canvas-confetti'

definePageMeta({
  layout: false // Unbranded minimal layout
})

const supabase = useSupabaseClient()
const route = useRoute()
const level = (route.params.level as string).toLowerCase()

// --- Inferno Gateway State ---
const infernoUnlocked = ref(level !== 'inferno')
const unlockProgress = ref(0)
const isUnlocking = ref(false)
const fadeOutInferno = ref(false)
let unlockTimer: any = null

const startUnlock = () => {
   isUnlocking.value = true
   if (navigator.vibrate) navigator.vibrate(50) 
   
   unlockTimer = setInterval(() => {
      unlockProgress.value += 3
      if (unlockProgress.value % 15 === 0 && navigator.vibrate) navigator.vibrate(20) 
      
      if (unlockProgress.value >= 100) {
         clearInterval(unlockTimer)
         if (navigator.vibrate) navigator.vibrate([200, 100, 200]) // unlock success
         fadeOutInferno.value = true
         trackDiscord('inferno_unlocked')
         setTimeout(() => { infernoUnlocked.value = true }, 700)
      }
   }, 40) // ~1.3 seconds hold
}

const cancelUnlock = () => {
   isUnlocking.value = false
   clearInterval(unlockTimer)
   unlockProgress.value = 0
}

// --- Audio Effects ---
const playBeep = () => {
   try {
     const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
     const osc = ctx.createOscillator()
     osc.type = 'sine'
     osc.frequency.setValueAtTime(900, ctx.currentTime)
     osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
     osc.connect(ctx.destination)
     osc.start()
     osc.stop(ctx.currentTime + 0.1)
   } catch (e) { /* ignore */ }
}

// Neo-Brutalist Themes
const themes = {
  spark: {
    color: 'text-yellow-400',
    fill: 'bg-yellow-400',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  },
  fire: {
    color: 'text-orange-500',
    fill: 'bg-orange-500',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd'
  },
  inferno: {
    color: 'text-rose-500',
    fill: 'bg-rose-500',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DX1lVhptIYRda'
  },
  wildcard: {
    color: 'text-purple-500',
    fill: 'bg-purple-500',
    uri: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  }
}
const theme = themes[level as keyof typeof themes] || themes.spark
const textColorClass = computed(() => theme.color)
const bgClass = computed(() => theme.fill)

const loading = ref(true)
const voting = ref(false)
const hasVoted = ref(false)
const myVoteOption = ref<string | null>(null)
let realtimeChannel: any = null

const pollData = ref<any>({
  question: 'Loading Frequency...',
  option_a_label: 'Loading...',
  option_b_label: 'Loading...',
  option_a_count: 0,
  option_b_count: 0,
  spotify_uri: null
})

// Dispatch tracking events immediately to Discord via fire-and-forget
const trackDiscord = (action: string, details: any = {}) => {
   if (typeof window === 'undefined') return
   $fetch('/api/sync/notify-player', {
      method: 'POST',
      body: { 
         action, 
         level, 
         country: pollData.value?.country || 'Global', 
         pollId: pollData.value?.id, 
         details 
      }
   }).catch(() => {})
}

// Compute playlist dynamically from the active poll!
const playlistUri = computed(() => {
   if (pollData.value?.spotify_uri) return pollData.value.spotify_uri
   return theme.uri
})

const fetchPoll = async () => {
  // 1. Try URL parameters first (if they scanned a special QR code)
  let userCountry = (route.query.country || route.query.region) as string
  const userSeason = (route.query.season || 'Standard') as string
  
  // 2. If no country in URL, auto-detect instantly via fast IP lookup
  if (!userCountry) {
     try {
        const geoRes = await fetch('https://get.geojs.io/v1/ip/country.json')
        const geoData = await geoRes.json()
        if (geoData && geoData.name) {
           userCountry = geoData.name // e.g. "Ghana", "United Kingdom", "United States"
        } else {
           userCountry = 'Global'
        }
     } catch (e) {
        console.warn('Geo lookup failed, falling back to Global', e)
        userCountry = 'Global'
     }
  }

  // WILDCARD - Dynamic Random Select
  if (level === 'wildcard') {
     const { data: wildcards } = await supabase.schema('m2m').from('poll_questions')
        .select('*')
        .eq('level_id', 'wildcard')
        .eq('is_active', true)
        
     if (wildcards && wildcards.length > 0) {
        pollData.value = wildcards[Math.floor(Math.random() * wildcards.length)]
        return
     }
  }

  // 3. Attempt to find an EXACT MATCH for this specific region/season
  const { data: exactMatch } = await supabase.schema('m2m').from('poll_questions')
    .select('*')
    .eq('level_id', level)
    .eq('is_active', true)
    .ilike('country', userCountry) // Case-insensitive match (e.g. 'Ghana' matches 'ghana')
    .eq('season', userSeason)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    
  if (exactMatch) {
    pollData.value = exactMatch
  } else {
    // 4. Fallback to the Global/Standard active poll if no regional one exists yet
    const { data: fallback } = await supabase.schema('m2m').from('poll_questions')
      .select('*')
      .eq('level_id', level)
      .eq('is_active', true)
      .eq('country', 'Global')
      .eq('season', 'Standard')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (fallback) {
       pollData.value = fallback
    } else {
       pollData.value = {
         id: null,
         question: 'No active vibe check detected.',
         option_a_label: 'Standby',
         option_b_label: 'Standby',
         option_a_count: 0,
         option_b_count: 0,
         spotify_uri: null,
         country: 'Global',
         season: 'Standard'
       }
       voting.value = true // Visually disables buttons
    }
  }
}

const setupRealtime = () => {
  if (!pollData.value?.id) return
  
  // Now we subscribe to the EXACT poll by its Unique ID, not just 'spark'
  realtimeChannel = supabase.channel(`m2m:poll_${pollData.value.id}`)
    .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'm2m', 
        table: 'poll_questions',
        filter: `id=eq.${pollData.value.id}`
     }, (payload) => {
      pollData.value = payload.new
    })
    .on('broadcast', { event: 'confetti' }, () => {
      // Admin hit the Confetti button!
      import('canvas-confetti').then((module) => {
         const fireConfetti = module.default
         fireConfetti({
           particleCount: 150,
           spread: 80,
           origin: { y: 0.6 },
           colors: ['#000000', '#ffffff', '#F59E0B', '#F43F5E']
         })
         if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500])
      })
    })
    .subscribe()
}

onMounted(async () => {
  try {
     const { data: { session } } = await supabase.auth.getSession()
     if (!session) {
       await supabase.auth.signInAnonymously()
     }

     // Fetch the seasonal/random poll first!
     await fetchPoll()
     
     if (typeof window !== 'undefined' && pollData.value?.id) {
        // Only block if they voted on THIS specific question ID, not just the level string
        const modernVoteKey = `m2m_voted_poll_${pollData.value.id}`
        const modernVoteOption = localStorage.getItem(`${modernVoteKey}_option`)
        
        // Backwards compatibility check
        const legacyStoredVote = level !== 'wildcard' ? localStorage.getItem(`m2m_voted_${level}`) : null
        const legacyStoredOption = level !== 'wildcard' ? localStorage.getItem(`m2m_voted_${level}_option`) : null
        
        if (localStorage.getItem(modernVoteKey) || legacyStoredVote) {
           hasVoted.value = true
        }
        if (modernVoteOption || legacyStoredOption) {
           myVoteOption.value = modernVoteOption || legacyStoredOption
        }
     }
     
     // Log a unique view!
     if (pollData.value?.id) {
       const viewKey = `m2m_viewed_${pollData.value.id}`
       if (!localStorage.getItem(viewKey)) {
         if (typeof window !== 'undefined') localStorage.setItem(viewKey, 'true')
         await (supabase as any).rpc('increment_view', { poll_id: pollData.value.id }).catch(() => {})
         trackDiscord('scanned') // Announce scan
       }
     }
     
     // Then setup realtime using the unique poll ID
     setupRealtime()
       
  } catch (error) {
     console.error('Sync failed:', error)
  } finally {
     loading.value = false
  }
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

const castVote = async (option: 'A' | 'B') => {
  if (!pollData.value || !pollData.value.id) return 
  
  voting.value = true
  playBeep()
  if (navigator.vibrate) navigator.vibrate([100, 50, 100])
  
  if (option === 'A') pollData.value.option_a_count++
  if (option === 'B') pollData.value.option_b_count++
  hasVoted.value = true
  myVoteOption.value = option
  
  if (typeof window !== 'undefined') {
     // Save per-poll to enable unlimited Wildcard votes
     localStorage.setItem(`m2m_voted_poll_${pollData.value.id}`, 'true')
     localStorage.setItem(`m2m_voted_poll_${pollData.value.id}_option`, option)
     
     // Legacy support strictly for traditional levels
     if (level !== 'wildcard') {
        localStorage.setItem(`m2m_voted_${level}`, 'true')
        localStorage.setItem(`m2m_voted_${level}_option`, option)
     }
  }
  
  // Use the exact poll ID so it works across seasons
  const { error } = await (supabase as any).rpc('increment_vote', { 
    poll_id: pollData.value.id, 
    option_selected: option 
  })
  if (error) console.error('Vote err:', error)

  const label = option === 'A' ? pollData.value.option_a_label : pollData.value.option_b_label
  trackDiscord('voted', { option, label })
  
  voting.value = false
}

const totalVotes = computed(() => {
  if (!pollData.value) return 0
  return pollData.value.option_a_count + pollData.value.option_b_count
})

const percentA = computed(() => {
  if (totalVotes.value === 0) return 50
  return Math.round((pollData.value.option_a_count / totalVotes.value) * 100)
})

const percentB = computed(() => {
  if (totalVotes.value === 0) return 50
  return 100 - percentA.value
})

const userStanceMessage = computed(() => {
  if (!myVoteOption.value || totalVotes.value === 0) return null
  const myPercent = myVoteOption.value === 'A' ? percentA.value : percentB.value
  
  if (myPercent > 50) return `Valid. You agree with ${myPercent}% of the room. ✨`
  if (myPercent < 50) return `Oof. Controversial take. Only ${myPercent}% agree with you. 👀`
  return `Wow, perfectly split down the middle! ⚖️`
})

const userStanceClass = computed(() => {
  if (!myVoteOption.value || totalVotes.value === 0) return ''
  const myPercent = myVoteOption.value === 'A' ? percentA.value : percentB.value
  
  if (myPercent > 50) return 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800'
  if (myPercent < 50) return 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800'
  return 'bg-stone-50 border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700'
})
</script>
