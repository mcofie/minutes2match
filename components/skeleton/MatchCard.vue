<template>
  <div class="animate-pulse">
    <!-- Match Card Skeleton -->
    <div class="bg-white rounded-xl border-2 border-stone-200 overflow-hidden">
      <!-- Image placeholder -->
      <div class="aspect-[4/5] bg-stone-200 relative">
        <div class="absolute bottom-4 left-4 right-4">
          <div class="h-6 bg-stone-300 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-stone-300 rounded w-1/2"></div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-4 space-y-3">
        <!-- Match percentage -->
        <div class="flex items-center gap-2">
          <div class="w-16 h-6 bg-stone-200 rounded-full"></div>
          <div class="flex-1 h-2 bg-stone-100 rounded-full"></div>
        </div>
        
        <!-- Traits -->
        <div class="flex gap-2">
          <div class="h-6 w-20 bg-stone-100 rounded-full"></div>
          <div class="h-6 w-24 bg-stone-100 rounded-full"></div>
        </div>
        
        <!-- Button -->
        <div class="h-12 bg-stone-200 rounded-lg w-full mt-4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Match card skeleton - no props needed
</script>
