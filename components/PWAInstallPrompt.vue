<template>
  <ClientOnly>
    <div v-if="showPrompt" class="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white dark:bg-stone-900 ring-1 ring-black/5 p-4 rounded-[1.5rem] shadow-[0_18px_50px_rgba(52,38,25,0.15)] z-[100] animate-in slide-in-from-bottom-5 fade-in">
      <div class="flex items-start justify-between gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#fff1f1] flex items-center justify-center flex-shrink-0">
          📍
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-[#393737] mb-1">Install the app</h4>
          <p class="text-xs text-[#6c6862] leading-relaxed">Add to Home Screen for faster match notifications and a smoother experience.</p>
        </div>
        <button @click="dismissPrompt" class="text-stone-400 hover:text-black mt-0.5">✖</button>
      </div>
      <div class="mt-4 flex gap-2">
        <button @click="installPWA" class="flex-1 bg-[#ed1c24] text-white text-sm font-medium py-2.5 rounded-full hover:bg-[#d71920] transition-colors">Install</button>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
const { $pwa } = useNuxtApp()
const showPrompt = ref(false)

onMounted(() => {
  // Check if it's already installed or previously dismissed
  const dismissed = localStorage.getItem('m2m-pwa-dismissed')
  if (!dismissed) {
    // Determine condition (e.g., check if PWA module exposes a ready state)
    // Here we'll just show it via timeout to simulate natural timing for authenticated users
    setTimeout(() => {
        if ($pwa && $pwa.isNeedRefresh) {
            // Wait, we just want the install prompt
        }
        // Let's rely on standard events
        showPrompt.value = true
    }, 5000)
  }
})

const installPWA = () => {
  if ($pwa && $pwa.promptOfflineReady) {
    // Actually Vite-PWA uses a globally accessible event. If they have `getPrompt` installed.
    // Assuming user triggers the prompt:
    $pwa.updateServiceWorker(true)
  } else {
      alert("To install, tap the Share icon and select 'Add to Home Screen'.")
  }
  dismissPrompt()
}

const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('m2m-pwa-dismissed', 'true')
}
</script>
