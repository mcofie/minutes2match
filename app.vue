<template>
  <div class="app-wrapper">
    <!-- Page Loading Overlay removed to prevent covering persistent navigation. -->
    <NuxtLayout>
      <NuxtPage :transition="{
        name: 'page',
        mode: 'out-in'
      }" />
    </NuxtLayout>
    
    <!-- Global Toast Container -->
    <UiToastContainer />
    
    <!-- Global Confetti Container -->
    <UiConfettiContainer />
  </div>
</template>

<script setup lang="ts">
// Using Nuxt's default page transitions.
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
