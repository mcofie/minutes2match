<template>
  <div class="app-wrapper" :class="{ 'dark': isDark }">
    <!-- Page Loading Overlay -->
    <Transition name="loading">
      <div 
        v-if="isLoading" 
        class="fixed inset-0 z-[300] bg-[#FFFCF8] dark:bg-stone-950 flex items-center justify-center"
      >
        <div class="text-center">
          <div class="relative w-16 h-16 mx-auto mb-4">
            <div class="absolute inset-0 border-4 border-stone-200 dark:border-stone-800 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-transparent border-t-rose-500 rounded-full animate-spin"></div>
          </div>
          <p class="text-sm font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Loading...</p>
        </div>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in',
        onBeforeEnter: () => { isLoading = false },
        onBeforeLeave: () => { isLoading = true }
      }" />
    </NuxtLayout>
    
    <!-- Global Toast Container -->
    <UiToastContainer />
    
    <!-- Global Confetti Container -->
    <UiConfettiContainer />
    
    <!-- Dark Mode Toggle (Fixed Position) -->
    <button 
      @click="toggleDark"
      class="fixed left-6 z-[100] w-12 h-12 rounded-full bg-white dark:bg-stone-800 border-2 border-black dark:border-stone-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center hover:scale-110 transition-transform duration-300"
      :class="[ isOnDashboard ? 'bottom-28 md:bottom-6' : 'bottom-6' ]"
      :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      <span v-if="isDark" class="text-xl">☀️</span>
      <span v-else class="text-xl">🌙</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(false)
const route = useRoute()

// Check if we are on the dashboard (needs higher toggle button on mobile)
const isOnDashboard = computed(() => route.path === '/me')

// Dark mode
const isDark = ref(false)

onMounted(() => {
  // Check system preference or stored preference
  const stored = localStorage.getItem('dark-mode')
  if (stored !== null) {
    isDark.value = stored === 'true'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateDarkMode()
})

const toggleDark = () => {
  isDark.value = !isDark.value
  localStorage.setItem('dark-mode', String(isDark.value))
  updateDarkMode()
}

const updateDarkMode = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style>
/* Page Transition Animations */
.page-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  filter: blur(4px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
}

/* Loading overlay transition */
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

/* Dark mode base styles */
.dark {
  color-scheme: dark;
}

.dark body {
  background-color: #0c0a09;
  color: #fafaf9;
}
</style>
