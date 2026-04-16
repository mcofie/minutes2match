<template>
  <div class="dashboard-page pb-32">
    <!-- Header -->
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
          Flash Lobby Manager
        </h1>
        <p class="text-stone-500">Run live spark rooms, track conversion health, and guide the room in real time.</p>
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
    <div class="mb-3">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Flash Lobby Conversion Report</p>
    </div>
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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="(stat, i) in conversionStats" :key="stat.label" class="stat-card group relative">
        <div class="flex justify-between items-start mb-4">
          <div :class="[
            'p-3 rounded-xl transition-colors',
            i === 0 ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' :
            i === 1 ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' :
            i === 2 ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-100' :
            'bg-violet-50 text-violet-600 group-hover:bg-violet-100'
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

    <div class="mb-3">
      <p class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Operator Insights</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="(stat, i) in operatorInsightStats" :key="stat.label" class="stat-card group relative">
        <div class="flex justify-between items-start mb-4">
          <div :class="[
            'p-3 rounded-xl transition-colors',
            i === 0 ? 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100' :
            i === 1 ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-100' :
            i === 2 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' :
            'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
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
                <label class="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Duration</label>
                <div class="grid grid-cols-[1fr_120px] gap-3">
                  <input v-model.number="form.duration" type="number" min="1" max="365" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                  <select v-model="form.durationUnit" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all">
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-stone-50">
              <div class="flex gap-2">
                <button
                  v-for="preset in durationPresets"
                  :key="preset.label"
                  @click="setDurationPreset(preset.value, preset.unit)"
                  class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  :class="form.duration === preset.value && form.durationUnit === preset.unit ? 'bg-stone-900 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'"
                >
                  {{ preset.label }}
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
                  @click="addTime(lobby, 1, 'hours')"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-stone-100 hover:border-stone-200 transition-all group"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">➕1h</span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-600">Add 1 Hour</span>
                 </button>

                 <button 
                  @click="addTime(lobby, 1, 'days')"
                  class="p-5 rounded-2xl border border-stone-100 bg-stone-50/50 flex flex-col items-center gap-3 hover:bg-stone-100 hover:border-stone-200 transition-all group"
                 >
                    <span class="text-2xl transition-transform group-hover:scale-110">➕1d</span>
                    <span class="text-[10px] font-black uppercase tracking-widest text-stone-600">Add 1 Day</span>
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
             <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Durations, mutuals, and room history</span>
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
                      {{ formatDurationMinutes(getDurationMinutes(lobby)) }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="text-right mr-4" v-if="getStatus(lobby) !== 'future'">
                   <p class="text-lg font-black text-stone-900 tabular-nums leading-none">{{ getLobbyMetric(lobby.id, 'mutualSparks') }}</p>
                   <p class="text-[8px] font-black uppercase text-stone-400 tracking-widest mt-1">Mutuals</p>
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
              <div class="space-y-4 max-h-[420px] overflow-y-auto no-scrollbar">
                <div v-for="user in liveUsers" :key="user.id" class="rounded-2xl border border-stone-100 bg-stone-50/70 p-3 transition-all hover:border-indigo-100 hover:bg-white">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 overflow-hidden">
                        <NuxtImg :src="user.photo_url || '/ama_profile.png'" class="w-full h-full object-cover" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-stone-900 leading-tight mb-0.5 truncate">{{ user.display_name }}</p>
                        <p class="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{{ userSessionLabel(user) }}</p>
                      </div>
                    </div>
                    <span class="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-emerald-700">
                      Live
                    </span>
                  </div>

                  <div class="mt-3 grid grid-cols-3 gap-2">
                    <button
                      @click="moderateLiveUser(user, 'remove_user')"
                      class="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2 text-[9px] font-black uppercase tracking-widest text-amber-700 transition hover:bg-amber-100"
                    >
                      Remove
                    </button>
                    <button
                      @click="moderateLiveUser(user, 'hide_profile')"
                      class="rounded-xl border border-sky-200 bg-sky-50 px-2 py-2 text-[9px] font-black uppercase tracking-widest text-sky-700 transition hover:bg-sky-100"
                    >
                      Hide
                    </button>
                    <button
                      @click="moderateLiveUser(user, 'block_rejoin')"
                      class="rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-[9px] font-black uppercase tracking-widest text-rose-700 transition hover:bg-rose-100"
                    >
                      Block
                    </button>
                  </div>
                </div>
              </div>

              <!-- Detailed Stats -->
              <div class="grid grid-cols-2 gap-3 pt-6 border-t border-stone-100">
                 <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-indigo-100 transition-colors group/stat">
                    <p class="text-xl font-black leading-none mb-1.5 tabular-nums text-stone-900">{{ presenceCount }}</p>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-stone-400 group-hover/stat:text-indigo-600 transition-colors">Live Now</p>
                 </div>
                 <div class="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-indigo-100 transition-colors group/stat">
                    <p class="text-xl font-black leading-none mb-1.5 tabular-nums text-stone-900">{{ activeCount }}</p>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-stone-400 group-hover/stat:text-indigo-600 transition-colors">Live Rooms</p>
                 </div>
              </div>
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
const lobbyMetrics = ref<Record<string, { sparksSent: number, mutualSparks: number, unlockRate: number, superConnectRate: number }>>({})

// Performance stats
const totalProfiles = ref(0)
const matchesToday = ref(0)
const presenceCount = ref(0)

const form = ref({
  title: 'Friday Night Concourse',
  startTime: '',
  duration: 2,
  durationUnit: 'hours' as 'minutes' | 'hours' | 'days'
})

const durationPresets = [
  { label: '30m', value: 30, unit: 'minutes' as const },
  { label: '2h', value: 2, unit: 'hours' as const },
  { label: '6h', value: 6, unit: 'hours' as const },
  { label: '1d', value: 1, unit: 'days' as const }
]

const activeCount = computed(() => lobbies.value.filter(l => isCurrent(l)).length)
const liveLobbyIds = computed(() => lobbies.value.filter(l => isCurrent(l)).map(l => l.id))
const liveSparkCount = computed(() => liveLobbyIds.value.reduce((sum, lobbyId) => {
  const metric = lobbyMetrics.value[lobbyId]
  return sum + (metric?.sparksSent || 0)
}, 0))

const conversionOverview = computed(() => {
  const metrics = Object.values(lobbyMetrics.value)
  const sparksSent = metrics.reduce((sum, metric) => sum + metric.sparksSent, 0)
  const mutualSparks = metrics.reduce((sum, metric) => sum + metric.mutualSparks, 0)
  const unlockRate = sparksSent > 0
    ? ((metrics.reduce((sum, metric) => sum + (metric.unlockRate * metric.sparksSent), 0)) / sparksSent)
    : 0
  const superConnectRate = sparksSent > 0
    ? ((metrics.reduce((sum, metric) => sum + (metric.superConnectRate * metric.sparksSent), 0)) / sparksSent)
    : 0

  return {
    sparksSent,
    mutualSparks,
    unlockRate,
    superConnectRate
  }
})

const liveStats = computed(() => [
  { icon: '👥', value: presenceCount.value, label: 'Live Now' },
  { icon: '✨', value: matchesToday.value, label: 'Matches Today' },
  { icon: '⚡', value: liveSparkCount.value, label: 'Live Sparks' },
  { icon: '🛋️', value: activeCount.value, label: 'Open Rooms' }
])

const conversionStats = computed(() => [
  { icon: '⚡', value: conversionOverview.value.sparksSent, label: 'Sparks Sent' },
  { icon: '💥', value: conversionOverview.value.mutualSparks, label: 'Mutual Sparks' },
  { icon: '🔓', value: `${conversionOverview.value.unlockRate.toFixed(1)}%`, label: 'Unlock Rate' },
  { icon: '🚀', value: `${conversionOverview.value.superConnectRate.toFixed(1)}%`, label: 'Super Connect Rate' }
])

const moderationSummary = ref({
  removed: 0,
  hidden: 0,
  blocked: 0
})

const operatorInsights = ref({
  totalJoins: 0,
  uniqueAttendees: 0,
  avgMinutesInRoom: 0,
  pendingReviewCount: 0,
  postLobbyUnlocks: 0,
  postLobbyMutuals: 0,
  superConnectConversions: 0,
  postLobbyConversionRate: 0,
  unlockedRate: 0,
  pendingIntents7d: 0
})

const operatorInsightStats = computed(() => [
  { icon: '🫶', value: operatorInsights.value.uniqueAttendees, label: 'Unique Attendees' },
  { icon: '⏱️', value: `${operatorInsights.value.avgMinutesInRoom}m`, label: 'Avg Time In Room' },
  { icon: '🗂️', value: operatorInsights.value.pendingReviewCount, label: 'Awaiting Review' },
  { icon: '🛡️', value: moderationSummary.value.removed + moderationSummary.value.hidden + moderationSummary.value.blocked, label: 'Active Moderation' }
])

const liveUsers = ref<any[]>([])
const reminders = ref<any[]>([])
const currentTime = ref(new Date())
let timer: any = null
let channel: any = null
let attendanceInterval: ReturnType<typeof setInterval> | null = null

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
  await fetchLobbyMetrics()
  await fetchOperatorInsights()
}

const fetchLobbyMetrics = async () => {
  const lobbyIds = lobbies.value.map(lobby => lobby.id)
  if (!lobbyIds.length) {
    lobbyMetrics.value = {}
    return
  }

  const { data: intents } = await (supabase.schema('m2m').from('flash_lobby_intents') as any)
    .select('id, lobby_id, status, is_super_connect, super_connect_paid, match_id')
    .in('lobby_id', lobbyIds)

  const metrics: Record<string, { sparksSent: number, mutualSparks: number, unlockRate: number, superConnectRate: number }> = {}

  lobbyIds.forEach((lobbyId) => {
    const lobbyIntents = (intents || []).filter((intent: any) => intent.lobby_id === lobbyId)
    const sparksSent = lobbyIntents.length
    const mutualSparks = new Set(
      lobbyIntents
        .filter((intent: any) => intent.status === 'mutual' && intent.match_id)
        .map((intent: any) => intent.match_id)
    ).size
    const converted = new Set(
      lobbyIntents
        .filter((intent: any) => ['mutual', 'converted_to_match'].includes(intent.status) && intent.match_id)
        .map((intent: any) => intent.match_id)
    ).size
    const superConnects = lobbyIntents.filter((intent: any) => intent.is_super_connect || intent.super_connect_paid).length

    metrics[lobbyId] = {
      sparksSent,
      mutualSparks,
      unlockRate: sparksSent > 0 ? (converted / sparksSent) * 100 : 0,
      superConnectRate: sparksSent > 0 ? (superConnects / sparksSent) * 100 : 0
    }
  })

  lobbyMetrics.value = metrics
}

const fetchLiveUsers = async () => {
  try {
    const response = await $fetch<any>('/api/lobby/attendance')
    presenceCount.value = response?.count || 0
    liveUsers.value = response?.users || []
  } catch (err) {
    console.error('[Admin] Failed to fetch live users:', err)
    presenceCount.value = 0
    liveUsers.value = []
  }
}

const fetchOperatorInsights = async () => {
  try {
    const response = await $fetch<any>('/api/admin/flash-lobby/insights')
    operatorInsights.value = {
      totalJoins: response?.totalJoins || 0,
      uniqueAttendees: response?.uniqueAttendees || 0,
      avgMinutesInRoom: response?.avgMinutesInRoom || 0,
      pendingReviewCount: response?.pendingReviewCount || 0,
      postLobbyUnlocks: response?.postLobbyUnlocks || 0,
      postLobbyMutuals: response?.postLobbyMutuals || 0,
      superConnectConversions: response?.superConnectConversions || 0,
      postLobbyConversionRate: response?.postLobbyConversionRate || 0,
      unlockedRate: response?.unlockedRate || 0,
      pendingIntents7d: response?.pendingIntents7d || 0
    }
    moderationSummary.value = {
      removed: response?.moderationBreakdown?.removed || 0,
      hidden: response?.moderationBreakdown?.hidden || 0,
      blocked: response?.moderationBreakdown?.blocked || 0
    }
  } catch (err) {
    console.error('[Admin] Failed to fetch flash lobby insights:', err)
  }
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
    
    await fetchLiveUsers()
  } catch (err) {
    console.error('Failed to fetch real stats:', err)
  }
}

const setupAttendance = async () => {
  await fetchLiveUsers()
  if (attendanceInterval) clearInterval(attendanceInterval)
  attendanceInterval = setInterval(() => {
    fetchLiveUsers()
  }, 15000)
}

const handleTask = async () => {
  if (!form.value.startTime) return
  
  const start = new Date(form.value.startTime)
  const end = new Date(start.getTime() + durationToMinutes() * 60000)
  
  const payload = {
    title: form.value.title,
    start_at: start.toISOString(),
    end_at: end.toISOString()
  }

  if (editingId.value) {
    const { data: updatedLobby, error } = await (supabase.schema('m2m').from('flash_lobbies') as any)
      .update(payload)
      .eq('id', editingId.value)
      .select('title, start_at, end_at')
      .single()
    
    if (error) alert('Update failed: ' + error.message)
    else {
      await $fetch('/api/admin/flash-lobby/notify', {
        method: 'POST',
        body: { action: 'updated', lobby: updatedLobby }
      }).catch(() => {})
      cancelEdit()
    }
  } else {
    const { data: createdLobby, error } = await (supabase.schema('m2m').from('flash_lobbies') as any)
      .insert(payload)
      .select('title, start_at, end_at')
      .single()
    if (error) alert('Scheduling failed: ' + error.message)
    else {
      await $fetch('/api/admin/flash-lobby/notify', {
        method: 'POST',
        body: { action: 'created', lobby: createdLobby }
      }).catch(() => {})
      resetForm()
      fetchLobbies()
    }
  }
}

const startEdit = (lobby: FlashLobby) => {
  const parsed = durationFromMinutes(getDurationMinutes(lobby))
  editingId.value = lobby.id
  form.value = {
    title: lobby.title,
    startTime: new Date(lobby.start_at).toISOString().slice(0, 16),
    duration: parsed.value,
    durationUnit: parsed.unit
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
    duration: 2,
    durationUnit: 'hours'
  }
}

const deleteLobby = async (id: string) => {
  if (!confirm('Are you sure you want to delete this lobby?')) return
  const lobby = lobbies.value.find((item: any) => item.id === id)
  await (supabase.schema('m2m').from('flash_lobbies') as any).delete().eq('id', id)
  if (lobby) {
    await $fetch('/api/admin/flash-lobby/notify', {
      method: 'POST',
      body: {
        action: 'deleted',
        lobby: {
          title: lobby.title,
          start_at: lobby.start_at,
          end_at: lobby.end_at
        }
      }
    }).catch(() => {})
  }
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

const addTime = async (lobby: FlashLobby, amount: number, unit: 'minutes' | 'hours' | 'days') => {
   await runControl('addTime', lobby.id, { amount, unit })
}

const moderateLiveUser = async (
  user: { id: string, display_name?: string, lobby_id?: string },
  action: 'remove_user' | 'hide_profile' | 'block_rejoin'
) => {
  const lobbyId = user?.lobby_id || liveLobbyIds.value[0]
  if (!lobbyId) {
    alert('No active lobby found for this user.')
    return
  }

  const label = user?.display_name || 'this user'
  const confirmation = action === 'remove_user'
    ? `Remove ${label} from the active lobby?`
    : action === 'hide_profile'
      ? `Hide ${label} from the current lobby feed?`
      : `Block ${label} from rejoining this lobby?`

  if (!confirm(confirmation)) return

  try {
    await $fetch('/api/admin/flash-lobby/moderation', {
      method: 'POST',
      body: {
        lobbyId,
        targetUserId: user.id,
        action
      }
    })
    await fetchLiveUsers()
    await fetchOperatorInsights()
  } catch (err: any) {
    console.error('[Admin] Moderation failed:', err)
    alert(err?.data?.statusMessage || err?.data?.message || err?.message || 'Moderation failed')
  }
}

const getRemainingFormatted = (lobby: FlashLobby) => {
   const now = currentTime.value
   if (lobby.is_paused && lobby.paused_at) {
      const end = new Date(lobby.end_at).getTime()
      const paused = new Date(lobby.paused_at).getTime()
      const diff = Math.max(0, Math.floor((end - paused) / 1000))
      return formatDurationSeconds(diff)
   }
   const end = new Date(lobby.end_at).getTime()
   const diff = Math.max(0, Math.floor((end - now.getTime()) / 1000))
   return formatDurationSeconds(diff)
}

const formatDurationSeconds = (totalSeconds: number) => {
   const days = Math.floor(totalSeconds / 86400)
   const hours = Math.floor((totalSeconds % 86400) / 3600)
   const mins = Math.floor((totalSeconds % 3600) / 60)
   if (days > 0) return `${days}d ${hours}h`
   if (hours > 0) return `${hours}h ${mins}m`
   const secs = totalSeconds % 60
   return `${mins}m ${secs.toString().padStart(2, '0')}s`
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

const getDurationMinutes = (lobby: FlashLobby) => {
  const start = new Date(lobby.start_at)
  const end = new Date(lobby.end_at)
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

const formatDurationMinutes = (minutes: number) => {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440)
    const hours = Math.round((minutes % 1440) / 60)
    return hours ? `${days} Day${days === 1 ? '' : 's'} ${hours}h` : `${days} Day${days === 1 ? '' : 's'}`
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const rem = minutes % 60
    return rem ? `${hours}h ${rem}m` : `${hours} Hour${hours === 1 ? '' : 's'}`
  }
  return `${minutes} Min${minutes === 1 ? '' : 's'}`
}

const durationToMinutes = () => {
  if (form.value.durationUnit === 'days') return form.value.duration * 1440
  if (form.value.durationUnit === 'hours') return form.value.duration * 60
  return form.value.duration
}

const durationFromMinutes = (minutes: number) => {
  if (minutes % 1440 === 0) return { value: minutes / 1440, unit: 'days' as const }
  if (minutes % 60 === 0) return { value: minutes / 60, unit: 'hours' as const }
  return { value: minutes, unit: 'minutes' as const }
}

const setDurationPreset = (value: number, unit: 'minutes' | 'hours' | 'days') => {
  form.value.duration = value
  form.value.durationUnit = unit
}

const getLobbyMetric = (lobbyId: string, field: 'sparksSent' | 'mutualSparks' | 'unlockRate' | 'superConnectRate') => {
  const metric = lobbyMetrics.value[lobbyId]
  if (!metric) return field.includes('Rate') ? '0.0%' : 0
  if (field.includes('Rate')) return `${metric[field].toFixed(1)}%`
  return metric[field]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

const userSessionLabel = (user: { joined_at?: string, last_seen_at?: string }) => {
  const joinedAt = user?.joined_at ? new Date(user.joined_at).getTime() : null
  if (!joinedAt || Number.isNaN(joinedAt)) return 'Active Now'
  const minutes = Math.max(0, Math.round((Date.now() - joinedAt) / 60000))
  if (minutes < 1) return 'Just Joined'
  if (minutes === 1) return '1 Min In Room'
  return `${minutes} Mins In Room`
}

onMounted(async () => {
  await fetchLobbies()
  await fetchReminders()
  setupAttendance()
  
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
  if (attendanceInterval) clearInterval(attendanceInterval)
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
