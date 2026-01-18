<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed',
      // Sizes
      size === 'sm' ? 'px-4 py-2 text-sm leading-4 rounded-md' : '',
      size === 'md' ? 'px-5 py-2.5 text-sm leading-5 rounded-lg' : '',
      size === 'lg' ? 'px-6 py-3 text-base leading-6 rounded-lg' : '',
      
      // Variants - Loops Style
      variant === 'primary' ? 'bg-black text-white hover:bg-stone-800 shadow-sm' : '',
      variant === 'secondary' ? 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-transparent' : '',
      variant === 'outline' ? 'bg-white border border-stone-200 text-stone-700 hover:border-stone-900 hover:text-black' : '',
      variant === 'ghost' ? 'bg-transparent text-stone-600 hover:text-black hover:bg-stone-50' : '',
      
      // Optional props overrides
      rounded ? 'rounded-full' : ''
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false
})
</script>
