<template>
  <div class="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1400px] mx-auto pb-28 md:pb-6">
    <Head>
      <Title>Lobby | Minutes 2 Match</Title>
    </Head>

    <div class="flex items-center justify-between flex-wrap gap-4 px-1">
      <div class="space-y-1">
        <h2 class="text-2xl font-bold tracking-tight text-stone-900">{{ activeLobby?.title || nextLobby?.title || sparkLobbyTitle }}</h2>
        <div v-if="isLive" class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <p class="text-[9px] font-bold tracking-widest text-indigo-600 uppercase">Live Pulse • {{ onlinePresenceIds.size }} Currently On Page</p>
        </div>
      </div>

      <button
        @click="openSidebar"
        class="hidden md:flex px-4 py-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[10px] font-bold uppercase tracking-widest items-center gap-2"
      >
        <span>⚡</span>
        <span>Your Sparks</span>
        <span class="min-w-5 h-5 px-1 bg-rose-500 text-white rounded-full border-2 border-black flex items-center justify-center text-[9px]">
          {{ sidebarCards.length }}
        </span>
      </button>

      <div v-if="isLive" class="hidden md:flex px-5 py-2.5 bg-stone-900 text-white rounded-xl shadow-lg items-center gap-4 transition-all hover:scale-[1.02]">
        <div class="flex flex-col items-end">
          <span class="text-[8px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">Session Closes In</span>
          <div class="flex items-center gap-1.5" :class="{ 'text-rose-400 animate-pulse': remainingSeconds < 60 && !activeLobby?.is_paused }">
            <span v-if="remainingSeconds < 60 && !activeLobby?.is_paused" class="text-xs">🚨</span>
            <span class="text-base md:text-lg font-bold tabular-nums tracking-tight leading-none">{{ formattedRemaining }}</span>
          </div>
        </div>
        <div class="animate-pulse opacity-50">⏳</div>
      </div>
    </div>

    <div
      v-if="isLive && !selectedProfile && sidebarCollapsed"
      class="md:hidden fixed left-1/2 bottom-[5.5rem] -translate-x-1/2 z-[142] w-[calc(100vw-1.25rem)] max-w-sm"
    >
      <div class="grid grid-cols-2 gap-2 rounded-[22px] border-3 border-black bg-white/95 p-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] backdrop-blur-sm">
        <div class="rounded-2xl bg-stone-900 text-white px-3 py-2.5 flex items-center justify-between gap-2 min-w-0">
          <div class="min-w-0">
            <p class="text-[7px] font-bold uppercase tracking-[0.18em] opacity-60 leading-none mb-1">Closes In</p>
            <div class="flex items-center gap-1.5" :class="{ 'text-rose-400 animate-pulse': remainingSeconds < 60 && !activeLobby?.is_paused }">
              <span v-if="remainingSeconds < 60 && !activeLobby?.is_paused" class="text-[10px]">🚨</span>
              <span class="text-[13px] font-bold tabular-nums tracking-tight leading-none">{{ formattedRemaining }}</span>
            </div>
          </div>
          <span class="text-xs opacity-60 shrink-0">⏳</span>
        </div>

        <button
          @click="openSidebar"
          class="rounded-2xl border-2 border-black bg-white px-3 py-2.5 flex items-center justify-between gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] min-w-0"
        >
          <div class="text-left min-w-0">
            <p class="text-[7px] font-bold uppercase tracking-[0.18em] text-stone-400 leading-none mb-1">Your Sparks</p>
            <p class="text-[10px] font-bold uppercase tracking-tight text-black truncate">
              {{ sidebarCards.length > 0 ? `${sidebarCards.length} queued` : 'Open drawer' }}
            </p>
          </div>
          <span class="min-w-5 h-5 px-1 bg-rose-500 text-white rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black shrink-0">
            {{ sidebarCards.length }}
          </span>
        </button>
      </div>
    </div>

    <transition name="slide-up">
      <div v-if="activeLobby?.announcement" class="p-5 bg-indigo-600 text-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-4 animate-in slide-in-from-left-4 duration-500">
        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-inner">📡</div>
        <div class="flex-1 overflow-hidden">
          <p class="text-[9px] uppercase font-bold tracking-[0.2em] text-indigo-200 leading-none mb-2">Live Admin Broadcast</p>
          <p class="text-sm md:text-base font-semibold leading-tight line-clamp-2">{{ activeLobby.announcement }}</p>
        </div>
      </div>
    </transition>

    <div v-if="isAdmin && isLive" class="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-8 animate-in slide-in-from-top-4 duration-500 mb-12 relative overflow-hidden">
      <div class="absolute top-0 right-0 p-4">
        <span class="px-2 py-1 bg-stone-100 text-[8px] font-bold rounded uppercase tracking-widest text-stone-400">Admin Override Active</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button @click="togglePause(activeLobby)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all group" :class="activeLobby?.is_paused ? 'bg-amber-50 border-amber-200 text-amber-700' : ''">
          <span class="text-3xl group-hover:scale-110 transition-transform">{{ activeLobby?.is_paused ? '▶️' : '⏸️' }}</span>
          <span class="text-[10px] font-black uppercase tracking-widest">{{ activeLobby?.is_paused ? 'Resume' : 'Pause' }}</span>
        </button>
        <button @click="addTime(activeLobby, 1, 'hours')" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-100 transition-all group">
          <span class="text-3xl group-hover:scale-110 transition-transform">➕1h</span>
          <span class="text-[10px] font-black uppercase tracking-widest text-stone-500">Add 1 Hour</span>
        </button>
        <button @click="addTime(activeLobby, 1, 'days')" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-stone-100 transition-all group">
          <span class="text-3xl group-hover:scale-110 transition-transform">➕1d</span>
          <span class="text-[10px] font-black uppercase tracking-widest text-stone-500">Add 1 Day</span>
        </button>
        <button @click="stopLobby(activeLobby)" class="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/50 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all group">
          <span class="text-3xl group-hover:scale-110 transition-transform">🛑</span>
          <span class="text-[10px] font-black uppercase tracking-widest">End Session</span>
        </button>
      </div>
    </div>

    <div class="w-full relative min-h-[600px]">
      <div v-if="!loading && !isLive && nextLobby && sparkState.scope !== 'recent'" class="space-y-6">
        <FlashLobbyBanner />
      </div>

      <div v-else-if="!loading && !isLive && sparkState.scope !== 'recent'" class="py-24 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white/50 px-6">
        <span class="text-4xl block mb-4">⏳</span>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">No live lobby right now. The next room opens soon.</p>
      </div>

      <div v-if="!loading && isLive && activeLobby?.is_paused" class="py-24 text-center border-2 border-dashed border-amber-200 rounded-3xl bg-amber-50/30 px-6">
        <span class="text-4xl block mb-4">⏸️</span>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">The live room is paused for a quick reset.</p>
      </div>

      <template v-if="isLive && !activeLobby?.is_paused">
        <div v-if="sidebarCards.length > 0" class="lg:hidden w-full overflow-hidden mb-6">
          <div class="flex items-center gap-3 mb-3 px-1">
            <span class="text-lg">⚡</span>
            <h3 class="text-[10px] font-bold uppercase tracking-widest text-black">Your Sparks</h3>
          </div>
          <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
            <div v-for="item in sidebarCards" :key="item.key" class="flex-shrink-0 flex flex-col items-center gap-2">
              <div class="w-14 h-14 rounded-full border-2 border-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div class="w-full h-full rounded-full overflow-hidden border border-stone-100 bg-stone-50">
                  <NuxtImg v-if="item.photoUrl" :src="item.photoUrl" class="w-full h-full object-cover" />
                </div>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-tight text-center w-14 truncate">{{ item.displayName?.split(' ')[0] }}</span>
            </div>
          </div>
        </div>

        <main class="flex-1 min-w-0 relative z-10 w-full">
          <div class="h-4"></div>
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <SkeletonFlashLobbyCard v-for="i in 6" :key="i" />
          </div>
          <div v-else-if="remainingSeconds > 0">
            <div v-if="visibleLobbyUsers.length > 0" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-0.5">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FlashLobbyCard
                  v-for="user in visibleLobbyUsers"
                  :key="user.id"
                  v-bind="user"
                  :is-online="onlinePresenceIds.has(user.id)"
                  @view-profile="openProfile"
                />
              </div>
              <div v-if="hasMore" class="flex justify-center pt-8 pb-12">
                <button @click="fetchParticipants(true)" :disabled="loadingMore" class="px-10 py-3 bg-white border-2 border-black rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  {{ loadingMore ? 'Loading...' : 'Show more' }}
                </button>
              </div>
            </div>
            <div v-else class="py-24 text-center border-2 border-dashed border-stone-100 rounded-3xl bg-white/50 px-6">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Scanning frequencies... Check back in a moment.</p>
            </div>
          </div>
        </main>
      </template>

      <section v-else-if="sparkState.scope === 'recent'" class="space-y-8">
        <div v-if="nextLobby" class="max-w-2xl mx-auto">
          <FlashLobbyBanner />
        </div>

        <div class="rounded-3xl border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">After The Room</p>
          <h3 class="text-2xl md:text-[28px] font-bold tracking-tight text-black mb-3">The lobby wrapped, but your sparks are still live.</h3>
          <p class="text-sm text-stone-500 max-w-2xl">Review the people who shot their shot, unlock the ones you want to meet, and upgrade one-sided sparks with Super Connect when you want to cover both reveals.</p>
          <p v-if="sparkState.expiredCount" class="mt-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {{ sparkState.expiredCount }} older spark{{ sparkState.expiredCount === 1 ? '' : 's' }} expired after the response window.
          </p>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📨</span>
              <h4 class="text-lg font-bold tracking-tight">Received Sparks</h4>
            </div>
            <div v-if="sparkState.received.length === 0" class="rounded-2xl border-2 border-dashed border-stone-200 bg-white/60 p-8 text-center text-sm text-stone-400">
              No incoming sparks from the last lobby.
            </div>
            <div v-for="spark in sparkState.received" :key="spark.id" class="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden bg-stone-50">
                  <NuxtImg v-if="spark.sender.photoUrl" :src="spark.sender.photoUrl" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 class="text-sm font-bold">{{ spark.sender.displayName }}</h5>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">{{ spark.sender.location || 'Accra' }}</p>
                </div>
              </div>
              <div class="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Why they sparked you</p>
                <p class="text-sm font-medium text-stone-700 leading-relaxed">"{{ spark.message }}"</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <button @click="handleSparkAction(spark.id, 'unlock')" :disabled="actionLoadingId === spark.id" class="w-full py-3 bg-black text-white rounded-xl border-2 border-black text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  {{ actionLoadingId === spark.id ? 'Preparing...' : 'Unlock Their Spark' }}
                </button>
                <button @click="handleSparkAction(spark.id, 'decline')" :disabled="actionLoadingId === spark.id" class="w-full py-3 bg-white text-stone-700 rounded-xl border-2 border-stone-300 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-stone-50 disabled:opacity-50">
                  Pass
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🚀</span>
              <h4 class="text-lg font-bold tracking-tight">Sent Sparks</h4>
            </div>
            <div v-if="sparkState.sent.length === 0 && sparkState.mutual.length === 0" class="rounded-2xl border-2 border-dashed border-stone-200 bg-white/60 p-8 text-center text-sm text-stone-400">
              No outgoing sparks from the last lobby.
            </div>
            <div v-for="spark in sparkState.sent" :key="spark.id" class="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden bg-stone-50">
                  <NuxtImg v-if="spark.target.photoUrl" :src="spark.target.photoUrl" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 class="text-sm font-bold">{{ spark.target.displayName }}</h5>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Waiting for their after-hours decision</p>
                </div>
              </div>
              <div class="rounded-2xl bg-stone-50 border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Your message</p>
                <p class="text-sm font-medium text-stone-700 leading-relaxed">"{{ spark.message }}"</p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <button v-if="!spark.isSuperConnect" @click="handleSparkAction(spark.id, 'super_connect')" :disabled="actionLoadingId === spark.id" class="w-full py-3 bg-indigo-600 text-white rounded-xl border-2 border-black text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  {{ actionLoadingId === spark.id ? 'Preparing...' : 'Super Connect' }}
                </button>
                <div v-else class="px-4 py-3 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-widest text-center flex items-center justify-center">
                  Super Connect ready
                </div>
                <button @click="handleSparkAction(spark.id, 'delete')" :disabled="actionLoadingId === spark.id" class="w-full py-3 bg-white text-stone-700 rounded-xl border-2 border-stone-300 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-stone-50 disabled:opacity-50">
                  Delete Spark
                </button>
              </div>
            </div>

            <div v-for="spark in sparkState.mutual" :key="spark.id" class="rounded-2xl border-2 border-black bg-emerald-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl border-2 border-black overflow-hidden bg-white">
                  <NuxtImg v-if="spark.photoUrl" :src="spark.photoUrl" class="w-full h-full object-cover" />
                </div>
                <div>
                  <h5 class="text-sm font-bold">{{ spark.displayName }}</h5>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Mutual spark • fully unlocked</p>
                </div>
              </div>
              <button @click="navigateTo(`/me/connection/${spark.matchId}`)" class="w-full py-3 bg-black text-white rounded-xl border-2 border-black text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                Open Unlocked Match
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <Transition name="fade-slide">
      <div
        v-if="!sidebarCollapsed"
        class="fixed inset-0 z-[145] bg-black/40 backdrop-blur-[2px] md:hidden"
        @click="sidebarCollapsed = true"
      />
    </Transition>

    <aside
      class="fixed bg-white border-black z-[150] transition-transform duration-500 shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.1)] md:top-0 md:right-0 md:h-full md:w-80 md:border-l-4"
      :class="[
        sidebarCollapsed
          ? 'inset-x-0 bottom-0 h-[78vh] translate-y-full rounded-t-[32px] border-t-4 md:inset-x-auto md:bottom-auto md:h-full md:translate-x-full md:translate-y-0 md:rounded-none md:border-t-0'
          : 'inset-x-0 bottom-0 h-[78vh] translate-y-0 rounded-t-[32px] border-t-4 md:inset-x-auto md:bottom-auto md:h-full md:translate-x-0 md:translate-y-0 md:rounded-none md:border-t-0'
      ]"
    >
      <div class="h-full flex flex-col p-6 pb-8 md:pb-6">
        <div class="md:hidden w-16 h-1.5 rounded-full bg-stone-300 mx-auto mb-5"></div>
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-lg font-bold tracking-tight">Your Sparks ⚡</h3>
          <button @click="sidebarCollapsed = true" class="p-2 hover:bg-stone-100 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto space-y-4 no-scrollbar">
          <div v-if="sidebarCards.length === 0" class="flex flex-col items-center justify-center h-full text-center px-4">
            <div class="text-4xl mb-4">🌪️</div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">No sparks yet. Your sent sparks will land here.</p>
            <p class="mt-3 text-xs text-stone-500 leading-relaxed max-w-[240px]">After you send a spark from someone’s profile, their card should appear in this drawer right away.</p>
            <button
              @click="fetchSparkState"
              class="mt-5 px-4 py-2 bg-stone-900 text-white rounded-xl border-2 border-black text-[10px] font-bold uppercase tracking-widest"
            >
              Refresh Sparks
            </button>
          </div>
          <div v-for="item in sidebarCards" :key="item.key" class="p-4 bg-stone-50 border-2 border-black rounded-2xl flex items-center gap-4 relative group">
            <div class="w-12 h-12 rounded-xl border-2 border-black overflow-hidden shrink-0">
              <NuxtImg v-if="item.photoUrl" :src="item.photoUrl" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <h4 class="text-sm font-bold truncate">{{ item.displayName }}</h4>
              <span class="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">{{ item.label }}</span>
            </div>
            <div v-if="item.isMutual" class="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-black animate-bounce">💥</div>
          </div>
        </div>
        <div class="mt-auto pt-6 border-t-2 border-dashed border-stone-200">
          <p class="text-[9px] font-medium text-stone-400 italic">Mutual sparks unlock on the spot. One-sided sparks move into after-hours review when the session closes.</p>
        </div>
      </div>
    </aside>

    <button
      @click="openSidebar"
      class="hidden md:flex fixed bottom-24 right-6 min-w-14 h-14 px-4 bg-white border-4 border-black rounded-2xl items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[140] hover:-translate-y-1 transition-all"
    >
      <div class="relative flex items-center gap-2">
        <span class="text-2xl">⚡</span>
        <span class="text-[10px] font-bold uppercase tracking-widest">Sparks</span>
        <span class="w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-black flex items-center justify-center">{{ sidebarCards.length }}</span>
      </div>
    </button>

    <Transition name="fade-slide">
      <div v-if="selectedProfile" class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" @click.self="closeProfile">
        <div class="bg-white w-full max-w-[460px] rounded-[36px] border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col p-6 relative animate-in zoom-in-95 duration-300">
          <button @click="closeProfile" class="absolute top-6 right-6 text-stone-300 hover:text-black transition-colors">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="flex items-start gap-4 mb-6">
            <div class="w-16 h-16 bg-white border-4 border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <NuxtImg :src="selectedProfile.photoUrl || ''" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold tracking-tight text-black leading-tight mt-1">
                {{ selectedProfile.displayName }}
              </h3>
              <p class="text-[10px] font-bold tracking-widest text-rose-500 uppercase mt-2">Shoot your shot with a reason they can feel</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-3xl bg-stone-50/80 p-5 border-2 border-stone-100">
              <p class="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Why this match has a spark</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="i in (selectedProfile.sharedInterests || selectedProfile.interests || []).slice(0, 3)" :key="i" class="text-sm font-semibold text-black lowercase">{{ i }}</span>
              </div>
            </div>

            <textarea v-model="sparkMessage" maxlength="180" rows="5" class="w-full rounded-3xl border-4 border-black p-5 text-sm font-medium outline-none resize-none" placeholder="Tell them what stood out, why you think you two would click, and why they should unlock your spark..."></textarea>
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <span>They’ll read this after the room closes unless they spark you back first.</span>
              <span>{{ sparkMessage.length }}/180</span>
            </div>

            <button @click="submitSpark" :disabled="submittingSpark || !sparkMessage.trim()" class="w-full py-4 bg-[#ff003c] text-white rounded-[24px] border-4 border-black text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
              {{ submittingSpark ? 'Sending Spark...' : 'Send My Spark' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import FlashLobbyCard from '~/components/FlashLobbyCard.vue'

definePageMeta({ layout: 'me', middleware: ['auth'] })

const { activeLobby, nextLobby, lobbyUsers, isLive, remainingSeconds, loading, loadingMore, hasMore, fetchParticipants, fetchLobbies } = useFlashLobby()
const { profile, initDashboard } = useDashboard()
const toast = useToast()
const supabase = useSupabaseClient()

const isAdmin = ref(false)
const onlinePresenceIds = ref<Set<string>>(new Set())
const sidebarCollapsed = ref(true)
const selectedProfile = ref<any>(null)
const sparkMessage = ref('')
const submittingSpark = ref(false)
const actionLoadingId = ref<string | null>(null)

const sparkState = ref<{
  scope: string
  lobby: any
  sent: any[]
  received: any[]
  mutual: any[]
  expiredCount: number
}>({
  scope: 'none',
  lobby: null,
  sent: [],
  received: [],
  mutual: [],
  expiredCount: 0
})

const sparkLobbyTitle = computed(() => sparkState.value.lobby?.title || 'The Flash Lobby')
const hiddenSparkedIds = computed(() => new Set(
  sparkState.value.sent
    .map((item: any) => item.target?.id)
    .filter(Boolean)
))
const visibleLobbyUsers = computed(() => lobbyUsers.value.filter((user: any) => !hiddenSparkedIds.value.has(user.id)))

const sidebarCards = computed(() => [
  ...sparkState.value.mutual.map((item: any) => ({
    key: `mutual-${item.id}`,
    displayName: item.displayName,
    photoUrl: item.photoUrl,
    label: 'Mutual Spark',
    isMutual: true
  })),
  ...sparkState.value.sent.map((item: any) => ({
    key: `sent-${item.id}`,
    displayName: item.target?.displayName,
    photoUrl: item.target?.photoUrl,
    label: item.isSuperConnect ? 'Super Connect Pending' : 'Spark Sent',
    isMutual: false
  }))
])

const openProfile = (id: string) => {
  const user = visibleLobbyUsers.value.find((entry: any) => entry.id === id)
  if (!user) return
  selectedProfile.value = user
  sparkMessage.value = `Hey ${user.displayName.split(' ')[0]}, I think we'd be a great match because `
}

const closeProfile = () => {
  selectedProfile.value = null
  sparkMessage.value = ''
}

const openSidebar = async () => {
  sidebarCollapsed.value = false
  await fetchSparkState()
}

const fetchSparkState = async () => {
  try {
    const response = await $fetch<any>('/api/lobby/state')
    sparkState.value = {
      scope: response?.scope || 'none',
      lobby: response?.lobby || null,
      sent: response?.sent || [],
      received: response?.received || [],
      mutual: response?.mutual || [],
      expiredCount: response?.expiredCount || 0
    }
  } catch (err) {
    console.error('[Lobby] Failed to fetch spark state:', err)
      toast.error('Could not load your lobby activity', 'Please refresh and try again.')
  }
}

const submitSpark = async () => {
  if (!selectedProfile.value?.id || !sparkMessage.value.trim() || submittingSpark.value) return

  submittingSpark.value = true
  try {
    const response = await $fetch<any>('/api/lobby/connect', {
      method: 'POST',
      body: {
        targetId: selectedProfile.value.id,
        message: sparkMessage.value.trim()
      }
    })

    await fetchSparkState()
    lobbyUsers.value = lobbyUsers.value.filter((user: any) => user.id !== selectedProfile.value.id)
    if (sidebarCollapsed.value) sidebarCollapsed.value = false
    closeProfile()

    if (response?.mutual && response.matchId) {
      toast.success('Mutual spark!', 'You both chose each other, so the match opened instantly.')
      navigateTo(`/me/connection/${response.matchId}`)
      return
    }
    toast.success('Spark sent', 'They’ll see your note after the room closes unless they spark you back first.')
  } catch (err) {
    console.error('[Lobby] Spark send failed:', err)
    toast.error('Spark not sent', (err as any)?.data?.statusMessage || 'Please try again.')
  } finally {
    submittingSpark.value = false
  }
}

const handleSparkAction = async (intentId: string, action: 'unlock' | 'super_connect' | 'decline' | 'delete') => {
  actionLoadingId.value = intentId
  try {
    const response = await $fetch<any>('/api/lobby/action', {
      method: 'POST',
      body: { intentId, action }
    })

    await fetchSparkState()

    if (response?.redirectTo) {
      toast.info(action === 'super_connect' ? 'Super Connect ready' : 'Unlock ready', 'We’re taking you to checkout now.')
      navigateTo(response.redirectTo)
      return
    }

    if (response?.matchId && response?.alreadyMutual) {
      toast.success('Already mutual', 'This spark already opened for both of you.')
      navigateTo(`/me/connection/${response.matchId}`)
      return
    }

    if (response?.declined) {
      toast.info('Spark passed', 'We cleared it from your review queue.')
    }

    if (response?.deleted) {
      toast.info('Spark deleted', 'We removed it from your sent sparks list.')
    }
  } catch (err) {
    console.error('[Lobby] Spark action failed:', err)
    toast.error('Action failed', (err as any)?.data?.statusMessage || 'Please try again.')
  } finally {
    actionLoadingId.value = null
  }
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

const runControl = async (action: string, lobbyId: string, payload: Record<string, any> = {}) => {
  try {
    await $fetch('/api/admin/flash-lobby/control', { method: 'POST', body: { action, lobbyId, ...payload } })
    await fetchLobbies()
    await fetchSparkState()
  } catch (err) {
    console.error('[Admin] Lobby override failed:', err)
  }
}

const togglePause = (lobby: any) => runControl(lobby.is_paused ? 'resume' : 'pause', lobby.id)
const addTime = (lobby: any, amount: number, unit: 'minutes' | 'hours' | 'days') => runControl('addTime', lobby.id, { amount, unit })
const stopLobby = (lobby: any) => { if (confirm('Stop this live lobby?')) runControl('stop', lobby.id) }

const formattedRemaining = computed(() => {
  if (!remainingSeconds?.value) return '0m 00s'
  const total = remainingSeconds.value
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
})

watch(isLive, () => {
  fetchSparkState()
})

onMounted(async () => {
  await initDashboard()
  await fetchSparkState()
  checkAdmin()
  setupPresence()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 20px); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
