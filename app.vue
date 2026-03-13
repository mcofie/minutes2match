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

// Handle Telegram Back Button
onMounted(() => {
  isMounted.value = true
  if (isTMA.value && webApp?.BackButton) {
    console.log('[App] Telegram BackButton initialization');
    // Show back button if not on primary landing/dashboard pages
    const updateBackButton = () => {
      const primaryRoutes = ['/', '/me', '/matches', '/events']
      if (!primaryRoutes.includes(route.path)) {
        webApp.BackButton.show()
      } else {
        webApp.BackButton.hide()
      }
    }

    // Initial check
    updateBackButton()

    // Watch for route changes
    watch(() => route.path, () => {
      updateBackButton()
    })

    // Handle back button click
    webApp.BackButton.onClick(() => {
      hapticFeedback('light')
      router.back()
    })
  }
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
