<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click="close"
      />
    </Transition>
    
    <!-- Sheet Panel -->
    <Transition :name="slideTransition">
      <div 
        v-if="isOpen"
        :class="[
          'fixed z-50 bg-white shadow-xl',
          sideClasses
        ]"
      >
        <!-- Close Button -->
        <button 
          @click="close"
          class="absolute right-4 top-4 p-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
        
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  side?: 'left' | 'right' | 'top' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const close = () => {
  isOpen.value = false
}

const sideClasses = computed(() => {
  switch (props.side) {
    case 'left':
      return 'inset-y-0 left-0 h-full w-80 max-w-[85vw] border-r border-stone-200'
    case 'right':
      return 'inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l border-stone-200'
    case 'top':
      return 'inset-x-0 top-0 w-full border-b border-stone-200'
    case 'bottom':
      return 'inset-x-0 bottom-0 w-full border-t border-stone-200'
    default:
      return 'inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l border-stone-200'
  }
})

const slideTransition = computed(() => {
  switch (props.side) {
    case 'left': return 'slide-left'
    case 'right': return 'slide-right'
    case 'top': return 'slide-top'
    case 'bottom': return 'slide-bottom'
    default: return 'slide-right'
  }
})
</script>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-top-enter-active,
.slide-top-leave-active,
.slide-bottom-enter-active,
.slide-bottom-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-top-enter-from,
.slide-top-leave-to {
  transform: translateY(-100%);
}

.slide-bottom-enter-from,
.slide-bottom-leave-to {
  transform: translateY(100%);
}
</style>
