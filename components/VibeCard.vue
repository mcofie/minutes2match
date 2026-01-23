<template>
  <button
    :class="[
      'group relative flex items-center gap-4 w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left',
      selected 
        ? 'bg-stone-50 dark:bg-stone-800 border-black dark:border-stone-100 ring-1 ring-black dark:ring-stone-100 shadow-sm' 
        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm'
    ]"
    @click="$emit('select')"
  >
    <span v-if="icon" class="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">{{ icon }}</span>
    <span :class="['flex-1 font-semibold text-base', selected ? 'text-black dark:text-white' : 'text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-200']">{{ text }}</span>
    
    <div v-if="selected" class="w-6 h-6 rounded-full bg-black dark:bg-stone-100 text-white dark:text-black flex items-center justify-center flex-shrink-0 animate-in zoom-in spin-in-12 duration-300">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  icon?: string
  selected?: boolean
  size?: 'sm' | 'md' // Added size prop support conceptually if needed later
}>()

defineEmits<{
  select: []
}>()
</script>
