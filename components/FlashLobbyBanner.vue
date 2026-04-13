<template>
  <div v-if="activeLobby || nextLobby" class="relative group cursor-pointer w-full max-w-sm md:max-w-3xl mx-auto" @click="isLive ? $router.push('/lobby') : null">
    
    <!-- Main Ticket Body -->
    <div :class="[
      'relative flex flex-col md:flex-row md:items-stretch rounded-[24px] border-[3px] border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 active:translate-x-1 active:translate-y-1 active:shadow-none',
      isLive ? 'bg-indigo-600' : 'bg-white dark:bg-stone-900 text-black'
    ]">
      
      <!-- Top Section -->
      <div class="p-6 md:p-8 flex flex-1 items-center md:items-start gap-4 md:gap-6 bg-white">
         <!-- Icon Box -->
         <div class="w-20 h-20 md:w-24 md:h-24 rounded-[20px] md:rounded-[24px] bg-black flex items-center justify-center text-4xl md:text-5xl shrink-0 shadow-inner border border-stone-800">
           {{ isLive ? '💥' : '⏳' }}
         </div>
         <div class="flex flex-col justify-center">
            <h2 class="font-sans font-black text-[32px] md:text-[40px] tracking-tight leading-none uppercase mb-2">
              {{ isLive ? (activeLobby?.title || 'FLASH LOBBY') : (nextLobby?.title || 'PILOT') }}
            </h2>
            <p class="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] leading-[1.4] text-stone-400">
              {{ isLive ? 'Synchronous Matches Active Now' : 'Secure your spot for the next wave' }}
            </p>
         </div>
      </div>

      <!-- Desktop Divider -->
      <div class="hidden md:block w-px bg-stone-100 shrink-0 relative">
         <!-- Tiny ticket punch details if you want an extra touch -->
         <div class="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-[#FAFAFA] border-[3px] border-black"></div>
         <div class="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-[#FAFAFA] border-[3px] border-black"></div>
      </div>

      <!-- Bottom Section -->
      <div :class="['px-6 py-6 pb-7 md:p-8 md:w-[320px] flex flex-col items-center justify-center text-center shrink-0 border-t-[3px] border-dashed border-stone-200 md:border-none', isLive ? 'bg-indigo-700' : 'bg-[#F9F8F6]']">
         <span class="text-[12px] md:text-[11px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-stone-400 mb-1 md:mb-2">
           {{ isLive ? 'Lobby Closes In' : 'Starts In' }}
         </span>
         <span class="text-[32px] md:text-[36px] font-mono font-black tabular-nums tracking-widest mb-6 md:mb-5 leading-none">
           {{ isLive ? formattedRemaining : countdownLabel }}
         </span>

         <button 
           v-if="!isLive"
           @click.stop="toggleReminder"
           :disabled="isSettingReminder || reminderSet"
           class="w-full py-4 rounded-[16px] font-black uppercase text-xs md:text-[11px] tracking-[0.1em] md:tracking-[0.15em] transition-all text-white bg-black hover:bg-stone-900 shadow-sm flex items-center justify-center gap-2 border-[3px] border-black"
         >
           <div v-if="isSettingReminder" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
           <template v-else>
              <span v-if="reminderSet">✅ ADDED TO LIST</span>
              <span v-else>🔔 REMIND ME</span>
           </template>
         </button>

         <button 
           v-else
           class="w-full py-4 rounded-[16px] bg-white text-indigo-600 font-black uppercase tracking-[0.1em] text-xs transition-all border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
         >
           ENTER NOW 🚀
         </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { activeLobby, nextLobby, isLive, timeUntilNext, remainingSeconds } = useFlashLobby()
const router = useRouter()

const isSettingReminder = ref(false)
const reminderSet = ref(false)

const checkExisting = async () => {
   if (!nextLobby.value || isLive.value) return
   try {
      const resp = await $fetch<any>('/api/lobby/remind', {
         params: { lobbyId: nextLobby.value.id }
      })
      reminderSet.value = !!resp.hasReminder
   } catch (e) {}
}

watch(nextLobby, (newVal) => {
   if (newVal) checkExisting()
}, { immediate: true })

const toggleReminder = async () => {
   if (!nextLobby.value || reminderSet.value) return
   
   isSettingReminder.value = true
   try {
      await $fetch('/api/lobby/remind', {
         method: 'POST',
         body: { lobbyId: nextLobby.value.id }
      })
      reminderSet.value = true
   } catch (err) {
      console.error('Lobby reminder error:', err)
   } finally {
      isSettingReminder.value = false
   }
}

const formattedRemaining = computed(() => {
   if (!remainingSeconds?.value) return '00:00'
   const mins = Math.floor(remainingSeconds.value / 60)
   const secs = remainingSeconds.value % 60
   return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const countdownLabel = computed(() => {
  if (!timeUntilNext.value || timeUntilNext.value < 0) return '00:00:00'
  const diff = timeUntilNext.value
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
</script>
