<template>
  <div class="app-wrapper">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { isTMA, webApp, hapticFeedback } = useTelegram()
const isMounted = ref(false)

// Brand every tab title once: pages that already say "Minutes 2 Match" are left as they are
useHead({
  titleTemplate: (title?: string) => !title ? 'Minutes 2 Match' : title.includes('Minutes 2 Match') ? title : `${title} | Minutes 2 Match`,
})

// Handle Telegram Back Button and Initialization
onMounted(() => {
  isMounted.value = true

  // Ensure Telegram WebApp is ready even if plugin missed it due to script timing
  let tgCheckAttempts = 0;
  const initTelegram = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const wa = window.Telegram.WebApp;
      console.log('[App] Telegram WebApp Ready called from App');
      wa.ready();
      wa.expand();
      
      if (isTMA.value && webApp?.BackButton) {
        // Show back button if not on primary landing/dashboard pages
        const updateBackButton = () => {
          const primaryRoutes = ['/', '/me', '/matches', '/events']
          if (!primaryRoutes.includes(route.path)) {
            webApp.BackButton.show()
          } else {
            webApp.BackButton.hide()
          }
        }
    
        updateBackButton()
        watch(() => route.path, () => updateBackButton())
    
        webApp.BackButton.onClick(() => {
          hapticFeedback('light')
          router.back()
        })
      }
    } else if (tgCheckAttempts < 10) {
      tgCheckAttempts++;
      setTimeout(initTelegram, 100);
    }
  }

  initTelegram();
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
