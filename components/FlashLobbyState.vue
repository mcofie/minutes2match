<template>
  <div class="relative w-full transition-all duration-1000 overflow-hidden" :class="[isClosing ? 'opacity-0 scale-105 blur-2xl grayscale saturate-0' : 'opacity-100 scale-100']">
    
    <!-- Entrance Reveal Animation -->
    <Transition 
      appear 
      enter-active-class="transition duration-1000 ease-out" 
      enter-from-class="opacity-0 translate-y-20 scale-90 blur-xl" 
      enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
    >
      <div v-if="isOpen">
        <slot />
      </div>
    </Transition>

    <!-- Mutual Connection Toast / Success Layer -->
    <Teleport to="body">
      <Transition name="success-pill">
        <div v-if="showSuccessToast" class="fixed top-32 left-1/2 -translate-x-1/2 z-[200]">
          <div class="px-6 py-3 bg-indigo-600 text-white rounded-full border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center gap-3">
             <span class="text-xl animate-bounce">⚡</span>
             <span class="text-[10px] font-black uppercase tracking-widest leading-none">Mutual Connection Made! <br/>Chat moved to Inbox.</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  isClosing: boolean
  showSuccessToast?: boolean
}>()
</script>

<style scoped>
.success-pill-enter-active, .success-pill-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.success-pill-enter-from, .success-pill-leave-to {
  transform: translate(-50%, -200%);
  opacity: 0;
}
</style>
