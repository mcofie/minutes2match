<template>
  <div v-if="activeLobby || nextLobby" class="relative group cursor-pointer" @click="isLive ? $router.push('/lobby') : null">
    
    <!-- Ticket Shadow -->
    <div class="absolute inset-0 bg-black/10 rounded-2xl blur-lg translate-y-2 group-hover:translate-y-3 transition-transform"></div>

    <!-- Main Ticket Body -->
    <div :class="[
      'relative flex flex-col md:flex-row items-stretch rounded-2xl border-[3px] border-black overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-500',
      isLive ? 'bg-indigo-600' : 'bg-white dark:bg-stone-900'
    ]">
      
      <!-- Primary Info Section (Stub) -->
      <div class="flex-1 p-6 flex items-center gap-6">
        <!-- Status Icon with Ticket Perforation Visual -->
        <div :class="[
          'w-16 h-16 rounded-xl border-[3px] border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 transition-transform group-hover:rotate-3',
          isLive ? 'bg-white text-indigo-600' : 'bg-stone-900 text-white'
        ]">
           {{ isLive ? '⚡' : '⏳' }}
        </div>

        <div class="space-y-1.5">
           <div class="flex items-center gap-3">
              <span v-if="isLive" class="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded tracking-widest animate-pulse">Live</span>
              <h2 :class="[
                'font-black tracking-tighter text-3xl md:text-3xl lg:text-4xl uppercase leading-none',
                isLive ? 'text-white' : 'text-black dark:text-white'
              ]">
                {{ isLive ? (activeLobby?.title || 'FLASH LOBBY') : (nextLobby?.title || 'NEXT SESSION') }}
              </h2>
           </div>
           <p :class="[
             'text-[10px] font-black uppercase tracking-[0.2em]',
             isLive ? 'text-indigo-100' : 'text-stone-400'
           ]">
             {{ isLive ? 'Synchronous Matches Active Now' : 'Secure your spot for the next wave' }}
           </p>
        </div>
      </div>

      <!-- Ticket Perforation Line (Visual) -->
      <div class="hidden md:flex flex-col items-center justify-between py-1 relative">
         <div class="w-6 h-6 rounded-full bg-[#FFFCF8] dark:bg-stone-950 border-[3px] border-black -mt-4"></div>
         <div class="w-px h-full border-l-[3px] border-dashed border-black/20"></div>
         <div class="w-6 h-6 rounded-full bg-[#FFFCF8] dark:bg-stone-950 border-[3px] border-black -mb-4"></div>
      </div>

      <!-- Action Section (Voucher) -->
      <div :class="[
        'w-full md:w-80 flex flex-col items-center justify-center p-6 gap-4',
        isLive ? 'bg-white/10' : 'bg-stone-50 dark:bg-stone-800/50'
      ]">
        
        <div class="flex flex-col items-center gap-1">
           <span :class="['text-[9px] font-black uppercase tracking-widest', isLive ? 'text-white/60' : 'text-stone-400']">
             {{ isLive ? 'Lobby Closes In' : 'Starts In' }}
           </span>
           <span :class="['text-2xl font-black tabular-nums font-mono', isLive ? 'text-white' : 'text-black dark:text-white']">
             {{ isLive ? formattedRemaining : countdownLabel }}
           </span>
        </div>

        <button 
          v-if="!isLive"
          @click.stop="toggleReminder"
          :disabled="isSettingReminder || reminderSet"
          class="w-full px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border-[3px] border-black flex items-center justify-center gap-2"
          :class="reminderSet ? 'bg-emerald-500 text-white border-black shadow-none' : 'bg-stone-900 text-white hover:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'"
        >
          <div v-if="isSettingReminder" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <template v-else>
             <span v-if="reminderSet">✅ ADDED TO LIST</span>
             <span v-else>🔔 REMIND ME</span>
          </template>
        </button>

        <button 
          v-else
          class="w-full px-6 py-3.5 bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
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
