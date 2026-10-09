<template>
  <div class="m2m-app">
    <main
      class="relative flex min-h-screen min-h-dvh flex-col overflow-x-clip bg-gradient-to-b from-white via-[#fbfbfb] to-[#f7f7f7] pb-28 text-[#393737] md:pb-0"
      :class="{ 'is-ghost-mode': profile?.is_active === false }"
    >
      <!-- Soft glow, like the landing hero -->
      <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.04] blur-3xl"></div>
      <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-40 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>

      <!-- Header -->
      <nav class="sticky top-0 z-[60] border-b border-black/[0.04] bg-white/85 backdrop-blur-md">
        <div class="relative mx-auto flex h-14 max-w-6xl items-center justify-end px-4 sm:h-16 sm:px-6">
          <!-- Logo, centred -->
          <NuxtLink to="/matches" aria-label="Minutes 2 Match" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity hover:opacity-80 sm:h-8 sm:w-[140px]">
            <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
          </NuxtLink>

          <!-- Desktop tabs, on the right (phones use the bottom bar) -->
          <div v-if="showTabs" class="hidden items-center gap-1 rounded-full bg-[#f1efec] p-1 md:flex">
            <NuxtLink
              v-for="t in appTabs"
              :key="t.to"
              :to="t.to"
              :aria-current="isActiveTab(t.to) ? 'page' : undefined"
              class="relative inline-flex h-9 items-center justify-center gap-2 rounded-full pl-3 pr-4 text-sm font-semibold transition-colors"
              :class="isActiveTab(t.to) ? 'bg-[#393737] text-white shadow-[0_4px_12px_rgba(57,55,55,0.18)]' : 'text-[#6c6862] hover:text-[#393737]'"
            >
              <span v-if="t.to === '/me'" class="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#e7e4e0] ring-2" :class="isActiveTab(t.to) ? 'ring-white/80' : 'ring-white'">
                <img v-if="profile?.photo_url" :src="profile.photo_url" alt="" class="h-full w-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#6c6862]">{{ profile?.display_name?.charAt(0) || '?' }}</span>
              </span>
              <svg v-else viewBox="0 0 24 24" :fill="isActiveTab(t.to) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              {{ t.label }}
              <span v-if="t.to === '/matches' && pendingMatchCount > 0" class="h-1.5 w-1.5 rounded-full bg-[#ed1c24]" aria-label="New match"></span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="relative z-10 mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <!-- Global Ghost Mode Indicator -->
        <div v-if="profile?.is_active === false" class="ghost-banner pointer-events-auto relative z-50 mb-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] bg-[#393737] p-5 text-white shadow-[0_18px_50px_rgba(52,38,25,0.15)] sm:flex-row">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7"/><path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/></svg></div>
            <div class="flex-1 text-center sm:text-left">
              <h3 class="mb-1 text-sm font-semibold text-white">Incognito mode is on</h3>
              <p class="text-sm leading-relaxed text-white/75">Your profile is hidden from the match pool. <span class="font-semibold text-[#ff8a8f]">12 potential matches</span> missed your vibe today.</p>
            </div>
          </div>
          <button class="btn-solid grain w-full shrink-0 px-6 py-3 text-sm sm:w-auto" @click="toggleAccountActive">Go live ⚡</button>
        </div>

        <!-- Incomplete Profile Nudge -->
        <div v-if="authReady && isProfileIncomplete && route.path !== '/me'" class="mb-8 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] bg-gradient-to-br from-[#fdf3e7] to-[#fbe9e4] p-5 sm:p-6 md:flex-row md:items-center">
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-[0_4px_14px_rgba(52,38,25,0.06)]">⚡</div>
            <div>
              <h3 class="font-display mb-1 text-xl text-[#393737]">Your profile needs some love</h3>
              <p class="text-sm text-[#6c6862]">Complete your Vibe Check and add a photo to start matching.</p>
            </div>
          </div>
          <NuxtLink to="/me" class="btn-solid grain grain-strong w-full px-6 py-3 text-sm md:w-auto">Complete profile →</NuxtLink>
        </div>

        <!-- While we sign you in, show the page's shape instead of a blank spinner -->
        <template v-if="!authReady">
          <div v-if="route.path === '/me'" class="mx-auto max-w-xl"><SkeletonMePage /></div>
          <div v-else-if="route.path === '/matches'" class="mx-auto max-w-3xl"><SkeletonMatchesPage /></div>
          <div v-else class="flex justify-center py-24" aria-hidden="true">
            <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-[#ece8e3] border-t-[#ed1c24]"></div>
          </div>
          <p class="sr-only" role="status">Loading your space…</p>
        </template>
        <slot v-else />
      </div>

      <!-- Footer: only on Profile, as one quiet centred line -->
      <footer v-if="route.path === '/me'" class="relative z-10 mt-auto pb-6 pt-2 md:pb-8">
        <p class="text-center text-xs text-[#b5b0aa]" :title="`Version ${config.public.appVersion}`">
          <a href="mailto:hello@minutes2match.com" class="transition-colors hover:text-[#393737]">Help</a>
          <span class="mx-2" aria-hidden="true">·</span>
          <NuxtLink to="/terms" class="transition-colors hover:text-[#393737]">Terms</NuxtLink>
          <span class="mx-2" aria-hidden="true">·</span>
          <NuxtLink to="/privacy" class="transition-colors hover:text-[#393737]">Privacy</NuxtLink>
          <span class="mx-2" aria-hidden="true">·</span>
          © {{ new Date().getFullYear() }} Minutes 2 Match
        </p>
      </footer>

      <!-- Phone bar: Matches and Profile, two equal halves -->
      <nav v-if="showTabs" aria-label="App" class="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div class="grid w-full max-w-[20rem] grid-cols-2 gap-1 rounded-full bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(52,38,25,0.16)] ring-1 ring-black/5 backdrop-blur">
          <NuxtLink
            v-for="t in appTabs"
            :key="'m-' + t.to"
            :to="t.to"
            :aria-current="isActiveTab(t.to) ? 'page' : undefined"
            class="relative flex h-12 items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold transition-colors active:scale-[0.97]"
            :class="isActiveTab(t.to) ? 'bg-[#393737] text-white' : 'text-[#6c6862]'"
          >
            <svg v-if="t.to === '/matches'" viewBox="0 0 24 24" :fill="isActiveTab(t.to) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <span v-else class="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#e7e4e0] ring-2" :class="isActiveTab(t.to) ? 'ring-white/80' : 'ring-white shadow-[0_1px_4px_rgba(52,38,25,0.15)]'">
              <img v-if="profile?.photo_url" :src="profile.photo_url" alt="" class="h-full w-full object-cover" />
              <span v-else class="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6c6862]">{{ profile?.display_name?.charAt(0) || '?' }}</span>
            </span>
            {{ t.label }}
            <span v-if="t.to === '/matches' && pendingMatchCount > 0" class="absolute right-4 top-3 h-2 w-2 rounded-full bg-[#ed1c24] ring-2" :class="isActiveTab(t.to) ? 'ring-[#393737]' : 'ring-white'"></span>
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
const { authReady, profile, pendingMatchCount, isProfileIncomplete, initDashboard, toggleIncognito } = useDashboard()
const toggleAccountActive = toggleIncognito

const appTabs = [
  { to: '/matches', label: 'Matches' },
  { to: '/me', label: 'Profile' },
]
// The two tabs show on the two main screens; a match brief counts as Matches
const showTabs = computed(() => ['/matches', '/me'].includes(route.path))
const isActiveTab = (to: string) => to === '/matches'
  ? route.path === '/matches' || route.path.startsWith('/me/connection')
  : route.path === '/me'


onMounted(async () => {
    await initDashboard()
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
