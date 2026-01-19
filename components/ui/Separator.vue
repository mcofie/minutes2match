<template>
  <div 
    :class="[
      'bg-stone-200 shrink-0',
      orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
    ]"
  />
</template>

<script setup lang="ts">
interface Props {
  orientation?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  orientation: 'horizontal'
})
</script>
