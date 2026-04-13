<template>
  <div class="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto pb-20 md:pb-6">
    <Head>
      <Title>Lobby | Minutes 2 Match</Title>
    </Head>

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4 px-1">
       <div class="space-y-1">
          <h2 class="text-2xl font-bold tracking-tight text-stone-900">{{ activeLobby?.title || 'The Flash Lobby' }}</h2>
          <div v-if="isLive" class="flex items-center gap-2">
             <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
             </span>
             <p class="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Live Pulse • {{ onlinePresenceIds.size }} Currently On Page</p>
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

    <!-- Admin Override Panel -->
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
       </div>

      <!-- State: LIVE Discovery Grid -->
      <template v-if="isLive && !activeLobby?.is_paused">
          <div v-if="activeConnections.length > 0" class="lg:hidden w-full overflow-hidden mb-6">
             <div class="flex items-center gap-3 mb-3 px-1">
                <span class="text-lg">⚡</span>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-black">Active Sparks</h3>
             </div>
             <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                <div v-for="user in activeConnections" :key="user.id" class="flex-shrink-0 flex flex-col items-center gap-2">
                   <div class="w-14 h-14 rounded-full border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                      <div class="w-full h-full rounded-full overflow-hidden border border-stone-100 bg-stone-50">
                         <NuxtImg v-if="user.photoUrl" :src="user.photoUrl" class="w-full h-full object-cover" />
                      </div>
                   </div>
                   <span class="text-[9px] font-black uppercase tracking-tight text-center w-14 truncate">{{ user.displayName?.split(' ')[0] }}</span>
                </div>
             </div>
          </div>

          <main class="flex-1 min-w-0 relative z-10 w-full">
             <div class="h-4"></div>
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
                        :is-online="onlinePresenceIds.has(user.id)"
                        @connect="onConnect"
                        @view-profile="openProfile"
                      />
                   </div>
                   <div v-if="hasMore" class="flex justify-center pt-8 pb-12">
                      <button @click="fetchParticipants(true)" :disabled="loadingMore" class="px-10 py-3 bg-white border-2 border-black rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        {{ loadingMore ? 'Loading...' : 'Show more' }}
                      </button>
                   </div>
                </div>
                <div v-else class="py-24 text-center border-2 border-dashed border-stone-100 rounded-3xl bg-white/50 px-6">
                   <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Scanning frequencies... Check back in a moment.</p>
                </div>
             </div>
          </main>
      </template>
    </div>

    <!-- Sidebar: Sparks Tracker -->
    <aside 
      class="fixed top-0 right-0 h-full bg-white border-l-4 border-black z-[150] transition-all duration-500 shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.1)]"
      :class="[sidebarCollapsed ? 'w-0 translate-x-full' : 'w-full md:w-80 translate-x-0']"
    >
       <div class="h-full flex flex-col p-6">
          <div class="flex items-center justify-between mb-8">
             <h3 class="text-xl font-black uppercase tracking-tighter italic">Your Sparks ⚡</h3>
             <button @click="sidebarCollapsed = true" class="p-2 hover:bg-stone-100 rounded-full">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <div class="flex-1 overflow-y-auto space-y-4 no-scrollbar">
             <div v-if="activeConnections.length === 0" class="flex flex-col items-center justify-center h-full opacity-30 text-center">
                <div class="text-4xl mb-4">🌪️</div>
                <p class="text-[10px] font-black uppercase tracking-widest">No sparks yet.</p>
             </div>
             <div v-for="conn in activeConnections" :key="conn.id" class="p-4 bg-stone-50 border-2 border-black rounded-2xl flex items-center gap-4 relative group">
                <div class="w-12 h-12 rounded-xl border-2 border-black overflow-hidden shrink-0">
                   <NuxtImg v-if="conn.photoUrl" :src="conn.photoUrl" class="w-full h-full object-cover" />
                </div>
                <div class="min-w-0">
                   <h4 class="text-[11px] font-black uppercase truncate">{{ conn.displayName }}</h4>
                   <span class="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Connection Formed</span>
                </div>
                <div v-if="conn.is_mutual" class="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-black animate-bounce">💥</div>
             </div>
          </div>
          <div class="mt-auto pt-6 border-t-2 border-dashed border-stone-200">
             <p class="text-[9px] font-bold text-stone-400 italic">Unlock matches after the session.</p>
          </div>
       </div>
    </aside>

    <!-- Sidebar Toggle -->
    <button v-if="activeConnections.length > 0" @click="sidebarCollapsed = false" class="fixed bottom-24 right-6 w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[140] hover:-translate-y-1 transition-all">
       <div class="relative">
          <span class="text-2xl">⚡</span>
          <span class="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-black flex items-center justify-center">{{ activeConnections.length }}</span>
       </div>
    </button>

    <!-- Classified Compatibility Report Modal -->
    <Transition name="fade-slide">
       <div v-if="selectedProfile" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" @click.self="closeProfile">
          <div class="bg-white w-full max-w-[420px] rounded-[40px] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col p-8 relative animate-in zoom-in-95 duration-300">
             
             <!-- Close Button -->
             <button @click="closeProfile" class="absolute top-8 right-8 text-stone-300 hover:text-black transition-colors">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>

             <!-- Header Section -->
             <div class="flex items-start gap-5 mb-8">
                <div class="w-20 h-20 bg-white border-4 border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                   <NuxtImg :src="selectedProfile.photoUrl || ''" class="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-20" />
                   <div class="absolute inset-0 flex items-center justify-center text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                      {{ selectedProfile.dating_persona === 'Homebody' ? '🏠' : '🌟' }}
                   </div>
                </div>
                <div class="flex-1">
                   <h3 class="text-3xl font-black uppercase text-black leading-tight tracking-tight mt-1">
                      THE {{ selectedProfile.dating_persona?.toUpperCase() || 'MYSTERY' }}<br/>CASE
                   </h3>
                   <p class="text-[10px] font-black tracking-widest text-rose-500 uppercase mt-2">Classified Compatibility Report</p>
                </div>
             </div>

             <!-- Connection Path -->
             <div class="flex items-center gap-3 mb-8 text-black">
                <svg class="w-6 h-6 rotate-90 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 10l-5 5-5-5"/></svg>
                <span class="text-sm font-black tracking-tight">Local Connection ({{ selectedProfile.location || 'East Legon' }}) 📍</span>
             </div>

             <!-- Shared Worldview -->
             <div class="bg-stone-50/80 rounded-3xl p-6 mb-6 border-2 border-stone-100 flex items-center justify-between">
                <div>
                   <p class="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Shared Worldview</p>
                   <div class="flex flex-wrap gap-2">
                      <span v-for="i in (selectedProfile.sharedInterests || selectedProfile.interests || []).slice(0, 3)" :key="i" class="text-base font-black text-black lowercase">{{ i }}</span>
                   </div>
                </div>
                <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-200">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>
                </div>
             </div>

             <!-- Score Block -->
             <div class="bg-black rounded-[32px] p-8 mb-8 flex items-end justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                <div>
                   <p class="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2">M2M Score</p>
                   <p class="text-[11px] font-black text-rose-500 uppercase tracking-widest">{{ selectedProfile.matchScore > 80 ? 'Elite Match' : 'Strong Probability' }}</p>
                </div>
                <div class="text-6xl font-black text-white italic tracking-tighter leading-none">
                   {{ selectedProfile.matchScore }}%
                </div>
             </div>

             <!-- Action Section -->
             <div class="space-y-4">
                <button 
                  @click="onConnect(selectedProfile.id); closeProfile()"
                  class="w-full py-6 bg-[#ff003c] text-white rounded-[24px] border-4 border-black text-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                >
                   Start Your Story
                   <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>

                <!-- Trust Badge -->
                <div class="flex justify-center">
                   <div class="inline-flex flex-col items-center px-6 py-2 bg-emerald-50 border-2 border-emerald-100 rounded-2xl">
                      <span class="text-xs font-black italic text-emerald-800 uppercase tracking-tight leading-none mb-1">Risk-Free Connection</span>
                      <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Refund if Ignored</span>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import FlashLobbyCard from '~/components/FlashLobbyCard.vue'

definePageMeta({ layout: 'me', middleware: ['auth'] })

const { activeLobby, lobbyUsers, isLive, remainingSeconds, loading, loadingMore, hasMore, totalCount, activeFilters, fetchParticipants, fetchLobbies } = useFlashLobby()
const { profile, initDashboard } = useDashboard()
const supabase = useSupabaseClient()

const isAdmin = ref(false)
const activeConnections = ref<any[]>([])
const onlinePresenceIds = ref<Set<string>>(new Set())
const isRestoring = ref(false)
const lastConnectSuccess = ref(false)
const sidebarCollapsed = ref(true)
const selectedProfile = ref<any>(null)

const openProfile = (id: string) => {
   const user = lobbyUsers.value.find(u => u.id === id)
   if (user) selectedProfile.value = user
}
const closeProfile = () => { selectedProfile.value = null }

const formatDealbreaker = (key: string, val: any) => {
   const labels: Record<string, string> = {
      smoker: 'Smoker',
      carrier: 'Genotype Carrier',
      religion: 'Different Religion',
      kids: 'Has Kids'
   }
   return labels[key] || key
}

const setupPresence = () => {
   if (!profile.value?.id) return
   const presenceChannel = supabase.channel('lobby-presence', { config: { presence: { key: profile.value.id } } })
   presenceChannel.on('presence', { event: 'sync' }, () => {
       const state = presenceChannel.presenceState()
       const ids = new Set<string>()
       Object.keys(state).forEach(key => ids.add(key))
       onlinePresenceIds.value = ids
   }).subscribe(async (status) => {
       if (status === 'SUBSCRIBED') {
         await presenceChannel.track({ id: profile.value.id, name: profile.value.display_name, online_at: new Date().toISOString() })
       }
   })
}

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
      if (response?.matches) activeConnections.value = response.matches
   } catch (e) {
      console.error('[Lobby] Restore failed:', e)
   } finally {
      isRestoring.value = false
   }
}

const onConnect = async (id: string) => {
   const userIdx = lobbyUsers.value.findIndex(u => u.id === id)
   if (userIdx === -1) return
   const targetUser = { ...lobbyUsers.value[userIdx] }
   try {
      const response = await $fetch<any>('/api/lobby/connect', { method: 'POST', body: { targetId: id, reaction: 'Instant Spark ⚡' } })
      lastConnectSuccess.value = true
      setTimeout(() => {
         activeConnections.value.unshift({ ...targetUser, matchId: response?.matchId })
         lobbyUsers.value = lobbyUsers.value.filter(u => u.id !== id)
         if (sidebarCollapsed.value) sidebarCollapsed.value = false
      }, 600)
      setTimeout(() => { lastConnectSuccess.value = false }, 3000)
   } catch (err) {
      console.error('Lobby connect error:', err)
   }
}

const runControl = async (action: string, lobbyId: string, minutes?: number) => {
   try {
      await $fetch('/api/admin/flash-lobby/control', { method: 'POST', body: { action, lobbyId, minutes } })
      await fetchLobbies()
   } catch (err) {
      console.error('[Admin] Lobby override failed:', err)
   }
}

const togglePause = (lobby: any) => runControl(lobby.is_paused ? 'resume' : 'pause', lobby.id)
const addTime = (lobby: any, minutes: number) => runControl('addTime', lobby.id, minutes)
const stopLobby = (lobby: any) => { if (confirm('Stop this live lobby?')) runControl('stop', lobby.id) }

const formattedRemaining = computed(() => {
   if (!remainingSeconds?.value) return '00:00'
   const mins = Math.floor(remainingSeconds.value / 60)
   const secs = remainingSeconds.value % 60
   return `${mins}:${secs.toString().padStart(2, '0')}`
})

onMounted(async () => { 
   await initDashboard()
   checkAdmin()
   setupPresence()
   fetchExistingConnections() 
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 20px); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
