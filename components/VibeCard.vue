<template>
  <button
    :class="[
      'group relative flex items-center gap-4 w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left',
      selected 
        ? 'bg-stone-50 border-black ring-1 ring-black shadow-sm' 
        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 shadow-sm'
    ]"
    @click="$emit('select')"
  >
    <span v-if="icon" class="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">{{ icon }}</span>
    <span :class="['flex-1 font-semibold text-base', selected ? 'text-black' : 'text-stone-600 group-hover:text-stone-900']">{{ text }}</span>
    
    <div v-if="selected" class="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 animate-in zoom-in spin-in-12 duration-300">
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
