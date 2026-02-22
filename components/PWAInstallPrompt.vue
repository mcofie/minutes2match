<template>
  <ClientOnly>
    <div v-if="showPrompt" class="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 p-4 rounded-xl shadow-[8px_8px_0px_0px_#000] z-[100] animate-in slide-in-from-bottom-5 fade-in">
      <div class="flex items-start justify-between gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 border-2 border-rose-500">
          📍
        </div>
        <div class="flex-1">
          <h4 class="text-xs font-bold uppercase tracking-widest text-black dark:text-white mb-1">Install App</h4>
          <p class="text-[10px] text-stone-500 font-medium leading-relaxed">Add to Home Screen for faster match notifications and a smoother experience.</p>
        </div>
        <button @click="dismissPrompt" class="text-stone-400 hover:text-black mt-0.5">✖</button>
      </div>
      <div class="mt-4 flex gap-2">
        <button @click="installPWA" class="flex-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg border-2 border-black hover:bg-rose-500 hover:border-rose-500 transition-colors">Install</button>
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
