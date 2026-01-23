<template>
  <div class="animate-pulse">
    <!-- Event Card Skeleton -->
    <div class="bg-white rounded-xl border-2 border-stone-200 overflow-hidden">
      <!-- Image placeholder -->
      <div class="aspect-video bg-stone-200 relative">
        <div class="absolute top-4 left-4">
          <div class="h-6 w-24 bg-stone-300 rounded-full"></div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-5 space-y-4">
        <!-- Title -->
        <div class="h-6 bg-stone-200 rounded w-3/4"></div>
        
        <!-- Date & Location -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-stone-200 rounded"></div>
            <div class="h-4 bg-stone-100 rounded w-32"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-stone-200 rounded"></div>
            <div class="h-4 bg-stone-100 rounded w-40"></div>
          </div>
        </div>
        
        <!-- Price & Button -->
        <div class="flex items-center justify-between pt-2">
          <div class="h-8 w-20 bg-stone-200 rounded"></div>
          <div class="h-10 w-28 bg-stone-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Event card skeleton - no props needed
</script>
