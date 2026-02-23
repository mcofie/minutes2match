<template>
  <div>
    <!-- Loading Overlay -->
    <div v-if="!authReady" class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-stone-200 border-t-rose-500 rounded-full animate-spin"></div>
        <p class="text-xs font-bold uppercase tracking-widest text-stone-400">Loading Experience...</p>
      </div>
    </div>

    <main 
      v-else 
      class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans relative flex flex-col transition-colors duration-300 pb-24 md:pb-0"
      :class="{ 'is-ghost-mode': profile?.is_active === false }"
    >
      <!-- Dot Pattern Background -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

      <!-- Navbar -->
      <nav class="sticky top-0 z-[60] bg-[#FFFCF8]/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
        <div class="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center -ml-2">
             <img src="/logo-full.png" alt="minutes2match" class="h-14 md:h-16 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
          </NuxtLink>
          
          <div class="flex items-center gap-2 md:gap-6">
            <NuxtLink to="/me/notifications" class="relative p-1.5 md:p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors active:scale-95 text-stone-600 dark:text-stone-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
               <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#FFFCF8] dark:border-stone-950 animate-pulse"></span>
            </NuxtLink>

            <div class="hidden sm:flex text-right flex-col items-end">
               <div class="flex items-center gap-1.5">
                  <span v-if="profile?.is_active === false" class="text-xs animate-ghost" title="Ghost Mode Active">👻</span>
                  <p class="text-xs md:text-sm font-bold text-black dark:text-stone-100 uppercase tracking-widest truncate max-w-[120px]">{{ profile?.display_name }}</p>
               </div>
               <div v-if="subscription" class="mt-0.5 flex items-center justify-end gap-1">
                  <span class="bg-black text-amber-300 px-1.5 py-[1px] rounded-[3px] border border-amber-400/50 shadow-[1px_1px_0px_0px_rgba(251,191,36,1)] text-[8px] font-bold uppercase tracking-widest leading-none">
                     👑 PREMIUM
                  </span>
               </div>
            </div>

            <NuxtLink 
               to="/me"
               class="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 bg-white dark:bg-stone-800 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] relative flex-shrink-0"
               :class="subscription ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-black dark:border-stone-500'"
            >
              <NuxtImg v-if="profile?.photo_url" :src="profile.photo_url" class="w-full h-full object-cover" width="48" height="48" />
              <div v-else class="w-full h-full flex items-center justify-center text-stone-400 font-bold text-lg md:text-xl font-serif italic">
                {{ profile?.display_name?.charAt(0) || '?' }}
              </div>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="flex-1 max-w-6xl mx-auto px-4 py-8 pb-16 relative z-10 w-full min-w-0">
        <!-- Global Ghost Mode Indicator -->
        <div v-if="profile?.is_active === false" class="ghost-banner mb-8 p-4 bg-stone-900 text-white rounded-xl border-2 border-dashed border-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl overflow-hidden relative group z-50 pointer-events-auto">
           <div class="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div class="flex items-center gap-4">
               <div class="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center text-2xl border border-stone-700 shadow-inner animate-ghost">👻</div>
               <div class="flex-1 text-center sm:text-left">
                  <h3 class="text-xs md:text-sm font-black uppercase tracking-widest text-rose-400 mb-0.5">Incognito Mode Active</h3>
                  <p class="text-[9px] md:text-[10px] text-stone-400 font-bold uppercase tracking-[0.15em] leading-relaxed">Your profile is currently hidden from the match pool. <span class="text-white">12 potential matches</span> missed your vibe today.</p>
               </div>
            </div>
            <button @click="toggleGhostMode" class="w-full sm:w-auto px-6 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-0.5 active:translate-y-0.5 flex-shrink-0">
               Go Live ✨
            </button>
        </div>

        <!-- Incomplete Profile Nudge -->
        <div v-if="isProfileIncomplete && route.path !== '/me'" class="mb-8 p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800 border-2 border-amber-200 dark:border-stone-700 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl border-2 border-amber-200 dark:border-amber-700/50 flex-shrink-0">⚡</div>
            <div>
               <h3 class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">Your profile needs some love!</h3>
               <p class="text-xs md:text-sm text-stone-600 dark:text-stone-400 font-medium">Complete your vibe check and add a photo to start matching.</p>
            </div>
          </div>
          <NuxtLink 
             to="/me"
             class="w-full md:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] text-center"
          >
             Complete Profile →
          </NuxtLink>
        </div>

        <!-- Tabs Navigation (Desktop) -->
        <div v-if="['/matches', '/events', '/me'].includes(route.path)" class="hidden md:flex md:flex-wrap md:gap-4 mb-8 md:mb-12">
          <NuxtLink 
            to="/matches"
            class="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border-2"
            :class="route.path === '/matches' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
          >
            Matches
            <span v-if="pendingMatchCount > 0" class="ml-2 px-1.5 py-0.5 bg-rose-500 text-white rounded text-[10px] border border-black">{{ pendingMatchCount }}</span>
          </NuxtLink>
          <NuxtLink 
            to="/events"
            class="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border-2"
            :class="route.path === '/events' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
          >
            Events
          </NuxtLink>
          <NuxtLink 
            to="/me"
            class="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border-2"
            :class="route.path === '/me' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
          >
            Profile
          </NuxtLink>
        </div>

        <slot />
      </div>

      <!-- Footer -->
      <footer class="border-t border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm mt-auto pb-24 md:pb-0 transition-colors">
        <div class="max-w-6xl mx-auto px-4 py-5">
          <div class="flex flex-col md:flex-row items-center justify-between gap-3">
            <p class="text-xs text-stone-400 font-medium">© {{ new Date().getFullYear() }} Minutes 2 Match. All rights reserved. <span class="ml-2 text-[10px] opacity-40">v{{ config.public.appVersion }}</span></p>
            <div class="flex items-center gap-6">
              <NuxtLink to="/release-notes" class="relative group text-xs text-stone-400 hover:text-black dark:hover:text-white transition-colors font-medium">
                Updates
                <span class="absolute -top-1 -right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
              </NuxtLink>
              <a href="https://www.instagram.com/minutes2match" target="_blank" rel="noopener noreferrer" class="text-xs text-stone-400 hover:text-black dark:hover:text-white transition-colors font-medium">Instagram</a>
              <NuxtLink to="/terms" class="text-xs text-stone-400 hover:text-black dark:hover:text-white transition-colors font-medium">Terms</NuxtLink>
              <NuxtLink to="/privacy" class="text-xs text-stone-400 hover:text-black dark:hover:text-white transition-colors font-medium">Privacy</NuxtLink>
              <span class="text-xs text-stone-300 dark:text-stone-700">Made with ❤️ in Accra</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- Mobile Bottom Navigation -->
      <nav v-if="['/matches', '/events', '/me'].includes(route.path)" class="md:hidden fixed bottom-6 left-4 right-4 z-[60] bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] pb-safe transition-transform duration-300">
        <div class="flex justify-around items-center h-16 px-2">
           <NuxtLink to="/matches" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="route.path === '/matches' ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500'">
              <div class="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                 <span v-if="pendingMatchCount > 0" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-stone-900 animate-pulse"></span>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-widest">Matches</span>
           </NuxtLink>
           <NuxtLink to="/events" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="route.path === '/events' ? 'text-black dark:text-white' : 'text-stone-400 dark:text-stone-500'">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-widest">Events</span>
           </NuxtLink>
           <NuxtLink to="/me" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="route.path === '/me' ? 'text-black dark:text-white' : 'text-stone-400 dark:text-stone-500'">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-widest">Profile</span>
           </NuxtLink>
        </div>
      </nav>
      <PWAInstallPrompt />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const { authReady, profile, subscription, pendingMatchCount, isProfileIncomplete, initDashboard, toggleGhostMode } = useDashboard()
const { unreadCount, fetchNotifications } = useNotifications()

onMounted(async () => {
    await initDashboard()
    fetchNotifications()
})
</script>

<style>
/* Gray out content when Ghost Mode is active but allow interaction */
.is-ghost-mode main > .flex-1 > div:not(.ghost-banner) {
  filter: grayscale(0.8) contrast(1.1) opacity(0.85);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  user-select: auto;
}

/* Allow the indicator itself to remain vibrant */
.is-ghost-mode .ghost-banner {
  filter: none !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  user-select: auto !important;
  z-index: 100 !important;
}

.is-ghost-mode nav,
.is-ghost-mode footer {
  filter: none !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  user-select: auto !important;
  backdrop-filter: none !important;
}

/* Specific overrides to allow navigation and status toggle */
.is-ghost-mode .ghost-banner button,
.is-ghost-mode .ghost-banner a {
  pointer-events: auto !important;
}

@keyframes ghost-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

.is-ghost-mode .animate-ghost {
  animation: ghost-float 3s ease-in-out infinite;
}
</style>
