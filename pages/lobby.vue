<template>
  <div class="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto pb-20 md:pb-6">
    <Head>
      <Title>Lobby | Minutes 2 Match</Title>
    </Head>

    <!-- Header Section (Matching Events/Matches page style) -->
    <div class="flex items-center justify-between flex-wrap gap-4 px-1">
       <div class="space-y-1">
          <h2 class="text-2xl font-bold tracking-tight text-stone-900">{{ activeLobby?.title || 'The Flash Lobby' }}</h2>
          <div v-if="isLive" class="flex items-center gap-2">
             <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
             </span>
             <p class="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Live Pulse • {{ lobbyUsers.length }} Users Online</p>
          </div>
       </div>

       <div v-if="isLive" class="px-5 py-2.5 bg-stone-900 text-white rounded-xl shadow-lg flex items-center gap-4 transition-all hover:scale-[1.02]">
          <div class="flex flex-col items-end">
             <span class="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">Ends In</span>
             <div class="flex items-center gap-1.5" :class="{ 'text-rose-400 animate-pulse': remainingSeconds < 60 && !activeLobby?.is_paused }">
                <span v-if="remainingSeconds < 60 && !activeLobby?.is_paused" class="text-xs">🚨</span>
                <span class="text-base md:text-xl font-black tabular-nums tracking-tighter leading-none">{{ formattedRemaining }}</span>
             </div>
          </div>
          <div class="animate-pulse opacity-50">⏳</div>
       </div>
    </div>

    <!-- Global Broadcast Bar -->
    <transition name="slide-up">
       <div v-if="activeLobby?.announcement" class="p-6 bg-indigo-600 text-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
          <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-inner">📡</div>
          <div class="flex-1 overflow-hidden">
             <p class="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-200 leading-none mb-2">Live Admin Broadcast</p>
             <p class="text-sm md:text-lg font-bold leading-tight line-clamp-2">{{ activeLobby.announcement }}</p>
          </div>
       </div>
    </transition>

    <!-- Admin Override Panel (Dashboard Style) -->
    <div v-if="isAdmin && isLive" class="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-8 animate-in slide-in-from-top-4 duration-500 mb-12 relative overflow-hidden">
       <div class="absolute top-0 right-0 p-4">
          <span class="px-2 py-1 bg-stone-100 text-[8px] font-black rounded uppercase tracking-widest text-stone-400">Admin Override Active</span>
       </div>

       <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button @click="togglePause(activeLobby)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all group" :class="activeLobby?.is_paused ? 'bg-amber-50 border-amber-200 text-amber-700' : ''">
             <span class="text-3xl group-hover:scale-110 transition-transform">{{ activeLobby?.is_paused ? '▶️' : '⏸️' }}</span>
             <span class="text-[10px] font-black uppercase tracking-widest">{{ activeLobby?.is_paused ? 'Resume' : 'Pause' }}</span>
          </button>
          
          <button @click="addTime(activeLobby, 5)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-100 transition-all group">
             <span class="text-3xl group-hover:scale-110 transition-transform">➕5</span>
             <span class="text-[10px] font-black uppercase tracking-widest text-stone-500">Add 5m</span>
          </button>

          <button @click="addTime(activeLobby, 15)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-100 transition-all group">
             <span class="text-3xl group-hover:scale-110 transition-transform">➕15</span>
             <span class="text-[10px] font-black uppercase tracking-widest text-stone-500">Add 15m</span>
          </button>

          <button @click="stopLobby(activeLobby)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all group">
             <span class="text-3xl group-hover:scale-110 transition-transform">🛑</span>
             <span class="text-[10px] font-black uppercase tracking-widest">End Session</span>
          </button>
       </div>
    </div>

    <!-- Main Layout -->
    <div class="w-full relative min-h-[600px]">
       
       <!-- State: Offline / Waiting -->
       <div v-if="!loading && !isLive" class="py-24 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white/50 px-6">
          <span class="text-4xl block mb-4">⏳</span>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Flash Lobby is currently offline.</p>
       </div>

       <!-- State: PAUSED -->
       <div v-if="!loading && isLive && activeLobby?.is_paused" class="py-24 text-center border-2 border-dashed border-amber-200 rounded-3xl bg-amber-50/30 px-6">
          <span class="text-4xl block mb-4">⏸️</span>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Match Window is temporarily paused.</p>
          <p class="text-[9px] font-bold text-amber-500 uppercase mt-2 tracking-widest">Hold tight, we'll be back in orbit shortly.</p>
       </div>

      <!-- State: LIVE Discovery Grid -->
      <template v-if="isLive && !activeLobby?.is_paused">
          <!-- Mobile Active Sparks Reel -->
          <div v-if="activeConnections.length > 0" class="lg:hidden w-full overflow-hidden mb-6">
             <div class="flex items-center gap-3 mb-3 px-1">
                <span class="text-lg">⚡</span>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-black">Active Sparks</h3>
             </div>
             <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                <div 
                  v-for="user in activeConnections" 
                  :key="user.id"
                  @click="openChat(user)"
                  class="flex-shrink-0 flex flex-col items-center gap-2"
                >
                   <div class="w-14 h-14 rounded-full border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white active:scale-95 transition-transform">
                      <div class="w-full h-full rounded-full overflow-hidden border border-stone-100 bg-stone-50">
                         <NuxtImg v-if="user.photoUrl" :src="user.photoUrl" class="w-full h-full object-cover" />
                         <div v-else class="w-full h-full flex items-center justify-center text-stone-300">📱</div>
                      </div>
                   </div>
                   <span class="text-[9px] font-black uppercase tracking-tight text-center w-14 truncate">{{ user.displayName?.split(' ')[0] }}</span>
                </div>
             </div>
          </div>

          <!-- Main Lobby Discovery Area -->
          <main class="flex-1 min-w-0 relative z-10 w-full">
             <!-- Filter Bar -->
             <div v-if="isLive && remainingSeconds > 0" class="mb-10 p-4 md:p-5 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row flex-wrap md:items-center justify-between gap-6">
                <div v-if="profile?.gender !== 'male' && profile?.gender !== 'female'" class="flex flex-col gap-2 min-w-[120px]">
                   <span class="text-[9px] font-black uppercase tracking-widest text-stone-400">Targeting</span>
                   <div class="flex gap-1.5 p-1 bg-stone-50 rounded-xl border border-stone-100">
                      <button 
                        v-for="g in [{l: 'M', v: 'male'}, {l: 'F', v: 'female'}, {l: 'All', v: 'everyone'}]" 
                        :key="g.v"
                        @click="activeFilters.gender = g.v"
                        class="px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all"
                        :class="activeFilters.gender === g.v ? 'bg-black text-white' : 'text-stone-400'"
                      >
                        {{ g.l }}
                      </button>
                   </div>
                </div>
                <div v-else class="flex flex-col gap-2 min-w-[120px]">
                   <span class="text-[9px] font-black uppercase tracking-widest text-stone-400">Targeting</span>
                   <div class="px-4 py-2 bg-indigo-50 border border-indigo-100/50 rounded-xl text-[10px] font-black text-indigo-700 flex items-center justify-center gap-2">
                      <span>✨</span>
                      {{ profile?.gender === 'male' ? 'Female Matches' : 'Male Matches' }}
                   </div>
                </div>

                <div class="flex flex-col gap-2 grow md:min-w-[200px]">
                   <span class="text-[9px] font-black uppercase tracking-widest text-stone-400">Location</span>
                   <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs">📍</span>
                      <input v-model="activeFilters.location" placeholder="Search city..." class="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-black text-black shadow-none outline-none focus:border-black" />
                   </div>
                </div>

                <div class="flex flex-col gap-2 min-w-[130px]">
                   <span class="text-[9px] font-black uppercase tracking-widest text-stone-400">Persona</span>
                   <select v-model="activeFilters.persona" class="px-3 py-2 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-black text-black outline-none focus:border-black">
                      <option v-for="p in ['All', 'The Heartthrob', 'The Intellectual', 'The Adventurer', 'The Optimist', 'The Dreamer']" :key="p">{{ p }}</option>
                   </select>
                </div>

                <div class="flex flex-col gap-2 min-w-[110px]">
                   <span class="text-[9px] font-black uppercase tracking-widest text-stone-400">Age Range</span>
                   <div class="flex items-center gap-1.5">
                      <input type="number" v-model.number="activeFilters.minAge" class="w-12 px-1 py-2 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-black text-center focus:border-black outline-none" />
                      <span class="text-stone-300 font-bold text-xs">—</span>
                      <input type="number" v-model.number="activeFilters.maxAge" class="w-12 px-1 py-2 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-black text-center focus:border-black outline-none" />
                   </div>
                </div>
             </div>

             <!-- Loading / Results Grid -->
             <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <SkeletonFlashLobbyCard v-for="i in 6" :key="i" />
             </div>

             <div v-else-if="isLive && remainingSeconds > 0">
                <div v-if="lobbyUsers.length > 0" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-0.5">
                   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FlashLobbyCard 
                        v-for="user in lobbyUsers" 
                        :key="user.id"
                        v-bind="user"
                        @connect="onConnect"
                      />
                   </div>

                   <div v-if="hasMore" class="flex justify-center pt-8 pb-12">
                     <button @click="fetchParticipants(true)" :disabled="loadingMore" class="px-10 py-3 bg-white border-2 border-black rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 hover:-translate-y-0.5 transition-all">
                       {{ loadingMore ? 'Loading...' : 'Show more participants' }}
                     </button>
                   </div>
                </div>
                <div v-else class="py-24 text-center border-2 border-dashed border-stone-100 rounded-3xl bg-white/50 px-6">
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Scanning frequencies... Check back in a moment.</p>
                </div>
             </div>
          </main>
       </template>

       <!-- Collapsible Tray (Active Sparks) -->
       <aside 
         v-if="activeConnections.length > 0"
         class="lg:flex hidden fixed bottom-0 right-10 z-[150] w-72 flex-col transition-all duration-300 ease-in-out"
         :class="sidebarCollapsed ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'"
       >
          <button 
             @click="sidebarCollapsed = !sidebarCollapsed"
             class="px-5 py-3 bg-stone-900 text-white border-2 border-black border-b-0 rounded-t-2xl flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.1)] hover:bg-black transition-colors"
          >
             <div class="flex items-center gap-3">
                <span class="text-base text-yellow-400">⚡</span>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-stone-100">Active Sparks</h3>
             </div>
             <div class="flex items-center gap-3">
                <span class="px-1.5 py-0.5 bg-emerald-500 text-[8px] font-black uppercase rounded-full text-white">{{ activeConnections.length }}</span>
                <svg class="w-3 h-3 transition-transform duration-300" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/></svg>
             </div>
          </button>

          <div class="bg-white border-2 border-black border-b-0 flex flex-col h-96 overflow-hidden">
             <div class="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar bg-stone-50/30">
                <div v-if="isRestoring" class="flex flex-col items-center justify-center h-full opacity-40">
                   <div class="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   <p class="text-[8px] font-black uppercase mt-4 tracking-widest">Restoring Sparks...</p>
                </div>
                <div 
                   v-for="user in activeConnections" 
                   :key="user.id"
                   @click="openChat(user)"
                   class="group p-2.5 bg-white border-2 border-transparent hover:border-black rounded-xl transition-all cursor-pointer flex items-center gap-3 shadow-sm hover:shadow-none"
                >
                   <div class="w-9 h-9 rounded-full border border-stone-200 overflow-hidden bg-stone-100">
                      <NuxtImg v-if="user.photoUrl" :src="user.photoUrl" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-stone-400">📸</div>
                   </div>
                   <div class="min-w-0 flex-1">
                      <p class="text-[10px] font-black text-black truncate uppercase tracking-tight">{{ user.displayName }}</p>
                      <p class="text-[8px] font-bold text-emerald-500 truncate tracking-tight uppercase">Connected</p>
                   </div>
                   <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
             </div>
          </div>
       </aside>
    </div>

    <!-- Floating Chat Window -->
    <FloatingFlashChat 
      v-if="selectedChatUser"
      :user="selectedChatUser"
      :is-open="chatOpen"
      @close="closeChat"
    />

    <!-- Toasts -->
    <Transition name="fade">
       <div v-if="lastConnectSuccess" class="fixed bottom-16 left-1/2 -translate-x-1/2 z-[250] px-6 py-3 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center gap-3 border-2 border-black">
          <span class="text-lg">💥</span>
          <p class="text-[10px] font-black uppercase tracking-widest text-center">New Spark Formed!</p>
       </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import FlashLobbyCard from '~/components/FlashLobbyCard.vue'
import FloatingFlashChat from '~/components/FloatingFlashChat.vue'

definePageMeta({ layout: 'me', middleware: ['auth'] })

const { activeLobby, lobbyUsers, isLive, remainingSeconds, loading, loadingMore, hasMore, activeFilters, fetchParticipants, fetchLobbies } = useFlashLobby()
const { profile, initDashboard } = useDashboard()
const supabase = useSupabaseClient()

const isAdmin = ref(false)
const activeConnections = ref<any[]>([])
const isRestoring = ref(false)
const lastConnectSuccess = ref(false)
const selectedChatUser = ref<any>(null)
const chatOpen = ref(false)
const sidebarCollapsed = ref(true)

const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await (supabase.schema('m2m').from('admins') as any).select('role').eq('id', user.id).maybeSingle()
    isAdmin.value = !!data
}

const fetchExistingConnections = async () => {
   isRestoring.value = true
   try {
      const response = await $fetch<any>('/api/lobby/matches')
      if (response && response.matches && response.matches.length > 0) {
         activeConnections.value = response.matches
         sidebarCollapsed.value = false 
      }
   } catch (e) {
      console.error('[Lobby] Restore failed:', e)
   } finally {
      isRestoring.value = false
   }
}

const openChat = (user: any) => {
  selectedChatUser.value = user
  chatOpen.value = true
  sidebarCollapsed.value = true
}

const closeChat = () => { chatOpen.value = false }

const onConnect = async (id: string) => {
   const userIdx = lobbyUsers.value.findIndex(u => (u as any).id === id)
   if (userIdx === -1) return
   
   const targetUser = { ...lobbyUsers.value[userIdx] }
   targetUser.isDisappearing = true

   try {
      const response = await $fetch<any>('/api/lobby/connect', { method: 'POST', body: { targetId: id } })
      lastConnectSuccess.value = true
      
      const matchId = response?.matchId

      setTimeout(() => {
         activeConnections.value.unshift({ ...targetUser, matchId })
         lobbyUsers.value = lobbyUsers.value.filter(u => (u as any).id !== id)
         openChat({ ...targetUser, matchId })
      }, 600)
      setTimeout(() => { lastConnectSuccess.value = false }, 3000)
   } catch (err) {
      console.error('Lobby connect error:', err)
   }
}

// Admin Controls
const runControl = async (action: string, lobbyId: string, minutes?: number) => {
   try {
      await $fetch('/api/admin/flash-lobby/control', {
         method: 'POST',
         body: { action, lobbyId, minutes }
      })
      await fetchLobbies()
   } catch (err: any) {
      console.error('[Admin] Lobby override failed:', err)
   }
}

const togglePause = async (lobby: any) => {
   const action = lobby.is_paused ? 'resume' : 'pause'
   await runControl(action, lobby.id)
}

const addTime = async (lobby: any, minutes: number) => {
   await runControl('addTime', lobby.id, minutes)
}

const stopLobby = async (lobby: any) => {
   if (!confirm('Stop this live lobby?')) return
   await runControl('stop', lobby.id)
}

const formattedRemaining = computed(() => {
   if (!remainingSeconds?.value) return '00:00'
   const mins = Math.floor(remainingSeconds.value / 60)
   const secs = remainingSeconds.value % 60
   return `${mins}:${secs.toString().padStart(2, '0')}`
})

onMounted(async () => { 
   await initDashboard()
   checkAdmin()
   fetchExistingConnections() 
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 20px); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
