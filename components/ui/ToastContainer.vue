<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-8 scale-95"
      >
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="pointer-events-auto bg-white rounded-xl border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          :class="borderClass(toast.type)"
        >
          <div class="p-4 flex items-start gap-3">
            <!-- Icon -->
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
              :class="iconBgClass(toast.type)"
            >
              {{ iconEmoji(toast.type) }}
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-black">{{ toast.title }}</p>
              <p v-if="toast.message" class="text-xs text-stone-500 mt-0.5">{{ toast.message }}</p>
            </div>
            
            <!-- Close -->
            <button 
              @click="remove(toast.id)"
              class="text-stone-400 hover:text-black transition-colors flex-shrink-0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Progress bar -->
          <div class="h-1 bg-stone-100">
            <div 
              class="h-full animate-shrink origin-left"
              :class="progressClass(toast.type)"
              :style="{ animationDuration: `${toast.duration}ms` }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, remove } = useToast()

const borderClass = (type: string) => {
  switch (type) {
    case 'success': return 'border-emerald-500'
    case 'error': return 'border-rose-500'
    case 'warning': return 'border-amber-500'
    case 'info': return 'border-blue-500'
    default: return 'border-black'
  }
}

const iconBgClass = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-100'
    case 'error': return 'bg-rose-100'
    case 'warning': return 'bg-amber-100'
    case 'info': return 'bg-blue-100'
    default: return 'bg-stone-100'
  }
}

const progressClass = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500'
    case 'error': return 'bg-rose-500'
    case 'warning': return 'bg-amber-500'
    case 'info': return 'bg-blue-500'
    default: return 'bg-black'
  }
}

const iconEmoji = (type: string) => {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
    default: return '•'
  }
}
</script>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-shrink {
  animation: shrink linear forwards;
}
</style>
