<template>
  <div class="app-wrapper">
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
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(false)
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


</style>
