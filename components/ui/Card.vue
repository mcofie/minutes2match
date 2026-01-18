<template>
  <div class="bg-[var(--color-bg-card)] border border-gray-100 shadow-elegant p-10 transition-all duration-500 hover:border-[var(--color-brand-primary)]/30 group">
    <div v-if="$slots.header" class="mb-8">
      <slot name="header" />
    </div>
    
    <div class="space-y-6">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="mt-10 pt-8 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for now
</script>
