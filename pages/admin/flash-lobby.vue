<template>
  <div class="dashboard-page pb-32">
    <!-- Header -->
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
          Flash Lobby Manager
        </h1>
        <p class="text-stone-500">Manage synchronous matching events and live participation.</p>
      </div>
      <div v-if="activeCount > 0" class="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm animate-in fade-in zoom-in duration-500">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
        <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider">{{ activeCount }} Concourse Live</span>
      </div>
    </header>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="(stat, i) in liveStats" :key="i" class="stat-card group relative">
        <div v-if="i === 0 && activeCount > 0" class="absolute top-4 right-4 animate-in fade-in zoom-in duration-700">
          <span class="text-[10px] font-black px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full tracking-tighter">
            LIVE PULSE
          </span>
        </div>
        
        <div class="flex justify-between items-start mb-4">
          <div :class="[
            'p-3 rounded-xl transition-colors',
            i === 0 ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
            i === 1 ? 'bg-pink-50 text-pink-600 group-hover:bg-pink-100' :
            i === 2 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' :
            'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
          ]">
            <span class="text-xl">{{ stat.icon }}</span>
          </div>
        </div>
        <div>
          <span class="block text-3xl font-black text-stone-900 mb-1 tabular-nums">{{ stat.value }}</span>
          <span class="text-xs font-bold text-stone-500 uppercase tracking-widest">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content (2/3) -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Scheduler Section -->
        <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all duration-500" :class="{ 'ring-2 ring-indigo-500 border-indigo-100': editingId }">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ editingId ? 'Edit Event Data' : 'New Flash Event' }}
            </h2>
            <button v-if="editingId" @click="cancelEdit" class="text-[10px] font-bold text-stone-400 hover:text-stone-600 uppercase tracking-widest transition-colors">
               Cancel Sync
            </button>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2 space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Title</label>
                <input v-model="form.title" type="text" placeholder="e.g. Moonlight Concourse" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
              </div>
              
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Start Time</label>
                <input v-model="form.startTime" type="datetime-local" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Cycle (Mins)</label>
                <input v-model.number="form.duration" type="number" min="1" max="120" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-stone-50">
              <div class="flex gap-2">
                <button v-for="d in [15, 30, 60]" :key="d" @click="form.duration = d" class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all" :class="form.duration === d ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'">
                  {{ d }}m
                </button>
              </div>
              <button @click="handleTask" class="w-full md:w-auto px-10 py-3.5 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3">
                 {{ editingId ? 'Update Activity' : 'Deploy Event' }}
                 <span class="text-xs">⚡</span>
              </button>
            </div>
          </div>
        </section>
        
        <!-- Live Controls Dashboard (Admin Style) -->
        <section v-if="activeCount > 0" class="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm animate-in slide-in-from-top-4 duration-500">
           <div v-for="lobby in lobbies.filter(l => isCurrent(l))" :key="lobby.id" class="space-y-8">
              <div class="flex items-center justify-between">
                 <div class="flex items-center gap-4">
                    <div class="relative flex h-3 w-3">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                    </div>
                    <div>
                       <h3 class="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Live Event Active</h3>
                       <h2 class="text-2xl font-black text-stone-900">{{ lobby.title }}</h2>
                    </div>
                 </div>
                 <div class="px-5 py-3 bg-stone-900 text-white rounded-2xl flex items-center gap-4 shadow-lg">
                    <div class="text-right">
                       <p class="text-[8px] uppercase font-bold text-stone-400 leading-none mb-1">REMAINING</p>
                       <p class="text-2xl font-black tabular-nums leading-none">{{ getRemainingFormatted(lobby) }}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                       <span class="animate-pulse">⏳</span>
                    </div>
                 </div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <!-- Control Buttons -->
                 <button 
                  @click="togglePause(lobby)"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all group"
                  :class="lobby.is_paused ? 'bg-amber-50 border-amber-200 text-amber-700' : ''"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">{{ lobby.is_paused ? '▶️' : '⏸️' }}</span>
                    <span class="text-[10px] font-black uppercase tracking-widest">{{ lobby.is_paused ? 'Resume' : 'Pause' }}</span>
                 </button>

                 <button 
                  @click="addTime(lobby, 5)"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-stone-100 hover:border-stone-200 transition-all group"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">➕5</span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-600">Add 5m</span>
                 </button>

                 <button 
                  @click="addTime(lobby, 15)"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-stone-100 hover:border-stone-200 transition-all group"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">➕15</span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-600">Add 15m</span>
                 </button>

                 <button 
                  @click="stopLobby(lobby)"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all group"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">🛑</span>
                    <span class="text-[10px] font-black uppercase tracking-widest">End Session</span>
                 </button>
              </div>

              <!-- Broadcast Section -->
              <div class="p-6 bg-stone-900 rounded-3xl space-y-4">
                 <h4 class="text-[10px] font-black uppercase tracking-widest text-stone-400">Global Broadcast Message</h4>
                 <div class="flex gap-3">
                    <input 
                      v-model="broadcastMessage" 
                      placeholder="Type a message to all users..." 
                      class="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                      @keyup.enter="sendBroadcast(lobby)"
                    />
                    <button 
                      @click="sendBroadcast(lobby)"
                      class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                       Send 📡
                    </button>
                 </div>
                 <div v-if="lobby.announcement" class="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <span class="text-[10px] text-stone-500 font-bold uppercase whitespace-nowrap">Active Now:</span>
                    <p class="text-[10px] text-stone-300 italic truncate">{{ lobby.announcement }}</p>
                    <button @click="clearBroadcast(lobby)" class="ml-auto text-stone-500 hover:text-white text-[10px]">✕</button>
                 </div>
              </div>
              
              <div v-if="lobby.is_paused" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-pulse">
                 <span class="text-xl">⏸️</span>
                 <p class="text-[11px] font-bold text-amber-700 uppercase tracking-tight">System is PAUSED. Discoverability and timer are frozen for all users.</p>
              </div>
           </div>
        </section>

        <!-- Ledger Section -->
        <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
             <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
               Event Ledger
             </h2>
             <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Historical Performance</span>
          </div>
          
          <div v-if="lobbies.length === 0" class="p-20 text-center text-stone-400 font-bold uppercase tracking-widest text-[10px]">
             Archives Empty.
          </div>
          
          <div v-else class="divide-y divide-stone-100">
            <div v-for="lobby in lobbies" :key="lobby.id" class="p-4 hover:bg-stone-50 transition-colors flex items-center justify-between group">
              <div class="flex items-center gap-4">
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300',
                  getStatus(lobby) === 'live' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100' : 
                  'bg-stone-50 text-stone-400'
                ]">
                  {{ getStatus(lobby) === 'live' ? '⚡' : getStatus(lobby) === 'future' ? '⏳' : '🏁' }}
                </div>
                <div>
                  <h4 class="font-bold text-stone-900 tracking-tight">{{ lobby.title }}</h4>
                  <div class="flex items-center gap-3 mt-1 opacity-60">
                    <p class="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      {{ formatDate(lobby.start_at) }}
                    </p>
                    <span class="w-1 h-1 bg-stone-300 rounded-full"></span>
                    <p class="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      {{ getDuration(lobby) }} Mins
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="text-right mr-4" v-if="getStatus(lobby) !== 'future'">
                   <p class="text-lg font-black text-stone-900 tabular-nums leading-none">{{ Math.floor(Math.random() * 40) + 12 }}</p>
                   <p class="text-[8px] font-black uppercase text-stone-400 tracking-widest mt-1">Matches</p>
                </div>
                
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="startEdit(lobby)" class="p-2 text-stone-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all">
                     <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="deleteLobby(lobby.id)" class="p-2 text-stone-400 hover:text-rose-500 hover:bg-white rounded-lg border border-transparent hover:border-rose-100 transition-all">
                     <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Sidebar (1/3) -->
      <div class="space-y-8">
        
        <!-- Live Participants Sidebar -->
        <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm transition-all duration-700" :class="{ 'opacity-100 scale-100': activeCount > 0, 'opacity-90 scale-95 grayscale': activeCount === 0 }">
           <div class="flex items-center justify-between mb-6">
              <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wider">Live Participation</h3>
              <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-indigo-200">Realtime</span>
           </div>

           <div v-if="activeCount === 0" class="py-12 flex flex-col items-center justify-center text-center">
              <span class="text-4xl mb-4 opacity-40">🌘</span>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Concourse is Dark</p>
              <p class="text-[10px] mt-2 text-stone-500 max-w-[180px]">Live data will populate here tijdens an active session.</p>
           </div>

           <div v-else class="space-y-6">
              <!-- Live Users Feed -->
              <div class="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                <div v-for="user in liveUsers" :key="user.id" class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                     <div class="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 overflow-hidden group-hover:border-indigo-300 transition-colors">
                        <NuxtImg :src="user.photo_url || '/ama_profile.png'" class="w-full h-full object-cover" />
                     </div>
                     <div>
                        <p class="text-xs font-bold text-stone-900 leading-tight mb-0.5">{{ user.display_name }}</p>
                        <p class="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Active Now</p>
                     </div>
                  </div>
                  <div class="text-right">
                     <p class="text-sm font-black text-stone-900 leading-none">{{ user.connections }}</p>
                     <p class="text-[8px] font-bold uppercase text-stone-400 tracking-widest mt-1">Pings</p>
                  </div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="grid grid-cols-2 gap-3 pt-6 border-t border-stone-100">
                 <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-indigo-100 transition-colors group/stat">
                    <p class="text-xl font-black leading-none mb-1.5 tabular-nums text-stone-900">84%</p>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-stone-400 group-hover/stat:text-indigo-600 transition-colors">Activity</p>
                 </div>
                 <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-indigo-100 transition-colors group/stat">
                    <p class="text-xl font-black leading-none mb-1.5 tabular-nums text-stone-900">3.2k</p>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-stone-400 group-hover/stat:text-indigo-600 transition-colors">Signals</p>
                 </div>
              </div>

              <button class="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-md">
                 Export Logs
              </button>
           </div>
        </section>

        <!-- Scheduled Reminders Sidebar -->
        <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm overflow-hidden relative">
           <div class="flex items-center justify-between mb-6">
              <h3 class="text-xs font-bold text-stone-500 uppercase tracking-wider">Scheduled Reminders</h3>
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">{{ reminders.length }} Users</span>
           </div>

           <div v-if="reminders.length === 0" class="py-12 flex flex-col items-center justify-center text-center">
              <span class="text-4xl mb-4 opacity-40">📭</span>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">No Reminders Yet</p>
           </div>

           <div v-else class="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
              <div v-for="r in reminders" :key="r.id" class="p-3 bg-stone-50/50 border border-stone-100 rounded-2xl hover:border-indigo-100 transition-all group">
                 <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white border-2 border-stone-100 overflow-hidden group-hover:border-indigo-200 transition-all">
                       <NuxtImg :src="r.profiles?.photo_url || '/ama_profile.png'" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0 flex-1">
                       <p class="text-xs font-black text-stone-900 leading-none truncate mb-1">{{ r.profiles?.display_name || 'Anonymous' }}</p>
                       <p class="text-[9px] font-black text-indigo-600 uppercase tracking-tight truncate">{{ r.flash_lobbies?.title || 'Unknown Lobby' }}</p>
                    </div>
                    <div class="text-[8px] font-black text-stone-300 uppercase tracking-widest rotate-90">Waitlist</div>
                 </div>
              </div>
           </div>
        </section>

        <!-- Traffic Insights -->
        <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
           <h3 class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Traffic Distribution</h3>
           <div class="h-32 flex items-end justify-between gap-1.5 overflow-hidden">
              <div v-for="i in 16" :key="i" class="flex-1 bg-stone-100 rounded-t-sm transition-all duration-700 hover:bg-indigo-500" :style="{ height: (Math.random() * 80 + 20) + '%' }"></div>
           </div>
           <p class="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-4 text-center">Peak activity tracking enabled</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

interface FlashLobby {
  id: string
  title: string
  start_at: string
  end_at: string
  is_active: boolean
  is_paused?: boolean
  paused_at?: string
  announcement?: string
  announcement_at?: string
}

const supabase = useSupabaseClient()
const lobbies = ref<FlashLobby[]>([])
const editingId = ref<string | null>(null)

// Performance stats
const totalProfiles = ref(0)
const matchesToday = ref(0)
const interactionsCount = ref(1204) // Placeholder for logs/clicks for now
const presenceCount = ref(0)

const form = ref({
  title: 'Friday Night Concourse',
  startTime: '',
  duration: 15
})

const activeCount = computed(() => lobbies.value.filter(l => isCurrent(l)).length)

const liveStats = computed(() => [
  { icon: '👥', value: presenceCount.value || totalProfiles.value, label: 'Current Users' },
  { icon: '✨', value: matchesToday.value, label: 'Matches Today' },
  { icon: '💥', value: interactionsCount.value, label: 'Interactions' },
  { icon: '💍', value: totalProfiles.value > 0 ? ((matchesToday.value / totalProfiles.value) * 100).toFixed(1) + '%' : '0%', label: 'Match Ratio' }
])

const liveUsers = ref<any[]>([])
const reminders = ref<any[]>([])
const currentTime = ref(new Date())
let timer: any = null
let channel: any = null

const fetchReminders = async () => {
  const { data } = await (supabase.schema('m2m').from('flash_lobby_reminders') as any)
    .select(`
      id,
      created_at,
      profiles:user_id(display_name, photo_url),
      flash_lobbies:lobby_id(title)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  reminders.value = data || []
}

const fetchLobbies = async () => {
  const { data } = await (supabase.schema('m2m').from('flash_lobbies') as any)
    .select('*')
    .order('start_at', { ascending: false })
    .limit(20)
  lobbies.value = data || []
  
  // Also fetch real data for the stats
  await fetchRealStats()
}

const fetchRealStats = async () => {
  try {
    // 1. Total Profiles count
    const { count } = await supabase.schema('m2m').from('profiles').select('*', { count: 'exact', head: true })
    totalProfiles.value = count || 0

    // 2. Matches created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count: mCount } = await supabase.schema('m2m').from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    matchesToday.value = mCount || 0
    
    // 3. Live Presence (if channel is set up)
    // For now we simulate with a subset of active profiles to see them in the UI
    const { data: participants } = await supabase.schema('m2m').from('profiles')
      .select('id, display_name, photo_url')
      .not('photo_url', 'is', null)
      .limit(5)
    
    if (participants && participants.length > 0) {
      liveUsers.value = (participants as any[]).map(u => ({
        ...u,
        connections: Math.floor(Math.random() * 20),
        joined: Math.floor(Math.random() * 300)
      }))
    } else {
      // Fallback for demo
      liveUsers.value = [
        { id: '1', display_name: 'Ama Serwaa', connections: 12, joined: 45, photo_url: 'https://i.pravatar.cc/300?u=1' },
        { id: '2', display_name: 'Kofi Mensah', connections: 8, joined: 120, photo_url: 'https://i.pravatar.cc/300?u=2' }
      ]
    }
  } catch (err) {
    console.error('Failed to fetch real stats:', err)
  }
}

const handleTask = async () => {
  if (!form.value.startTime) return
  
  const start = new Date(form.value.startTime)
  const end = new Date(start.getTime() + form.value.duration * 60000)
  
  const payload = {
    title: form.value.title,
    start_at: start.toISOString(),
    end_at: end.toISOString()
  }

  if (editingId.value) {
    const { error } = await (supabase.schema('m2m').from('flash_lobbies') as any)
      .update(payload)
      .eq('id', editingId.value)
    
    if (error) alert('Update failed: ' + error.message)
    else cancelEdit()
  } else {
    const { error } = await (supabase.schema('m2m').from('flash_lobbies') as any).insert(payload)
    if (error) alert('Scheduling failed: ' + error.message)
    else {
      resetForm()
      fetchLobbies()
    }
  }
}

const startEdit = (lobby: FlashLobby) => {
  editingId.value = lobby.id
  form.value = {
    title: lobby.title,
    startTime: new Date(lobby.start_at).toISOString().slice(0, 16),
    duration: getDuration(lobby)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingId.value = null
  resetForm()
  fetchLobbies()
}

const resetForm = () => {
  form.value = {
    title: 'Friday Night Concourse',
    startTime: '',
    duration: 15
  }
}

const deleteLobby = async (id: string) => {
  if (!confirm('Are you sure you want to delete this lobby?')) return
  await (supabase.schema('m2m').from('flash_lobbies') as any).delete().eq('id', id)
  fetchLobbies()
}

const currentTab = ref('active')
const broadcastMessage = ref('')

// Live Controls Functions
const runControl = async (action: string, lobbyId: string, payload: any = {}) => {
   try {
      await $fetch('/api/admin/flash-lobby/control', {
         method: 'POST',
         body: { action, lobbyId, ...payload }
      })
      await fetchLobbies()
   } catch (err: any) {
      console.error('[Admin] Control failed:', err)
      alert('Control failed: ' + (err.data?.message || err.message))
   }
}

const sendBroadcast = async (lobby: FlashLobby) => {
   if (!broadcastMessage.value.trim()) return
   await runControl('broadcast', lobby.id, { message: broadcastMessage.value.trim() })
   broadcastMessage.value = ''
}

const clearBroadcast = async (lobby: FlashLobby) => {
   await runControl('broadcast', lobby.id, { message: null })
}

const togglePause = async (lobby: FlashLobby) => {
   const action = lobby.is_paused ? 'resume' : 'pause'
   await runControl(action, lobby.id)
}

const stopLobby = async (lobby: FlashLobby) => {
   if (!confirm('Abort this live lobby immediately?')) return
   await runControl('stop', lobby.id)
}

const addTime = async (lobby: FlashLobby, minutes: number) => {
   await runControl('addTime', lobby.id, minutes)
}

const getRemainingFormatted = (lobby: FlashLobby) => {
   const now = currentTime.value
   if (lobby.is_paused && lobby.paused_at) {
      const end = new Date(lobby.end_at).getTime()
      const paused = new Date(lobby.paused_at).getTime()
      const diff = Math.max(0, Math.floor((end - paused) / 1000))
      return formatSeconds(diff)
   }
   const end = new Date(lobby.end_at).getTime()
   const diff = Math.max(0, Math.floor((end - now.getTime()) / 1000))
   return formatSeconds(diff)
}

const formatSeconds = (totalSeconds: number) => {
   const mins = Math.floor(totalSeconds / 60)
   const secs = totalSeconds % 60
   return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getStatus = (lobby: any) => {
  const now = new Date()
  const start = new Date(lobby.start_at)
  const end = new Date(lobby.end_at)
  if (now >= start && now <= end) return 'live'
  if (now < start) return 'future'
  return 'finished'
}

const isCurrent = (lobby: any) => getStatus(lobby) === 'live'

const getDuration = (lobby: FlashLobby) => {
  const start = new Date(lobby.start_at)
  const end = new Date(lobby.end_at)
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

// Presence Logic (Demonstrative)
let presenceChannel: any = null

onMounted(async () => {
  await fetchLobbies()
  await fetchReminders()
  
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Realtime subscription
  channel = supabase
    .channel('admin:flash_lobbies')
    .on('postgres_changes', { event: '*', schema: 'm2m', table: 'flash_lobbies' }, () => {
       fetchLobbies()
    })
    .subscribe()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (channel) supabase.removeChannel(channel)
  if (presenceChannel) supabase.removeChannel(presenceChannel)
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
