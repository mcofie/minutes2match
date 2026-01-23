<template>
  <div class="animate-pulse">
    <!-- Profile Sidebar Skeleton -->
    <div class="bg-white rounded-xl border-2 border-stone-200 p-6 space-y-6">
      <!-- Photo -->
      <div class="w-32 h-32 bg-stone-200 rounded-full mx-auto"></div>
      
      <!-- Name -->
      <div class="text-center space-y-2">
        <div class="h-6 bg-stone-200 rounded w-3/4 mx-auto"></div>
        <div class="h-4 bg-stone-100 rounded w-1/2 mx-auto"></div>
      </div>
      
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2">
        <div class="text-center p-3 bg-stone-50 rounded-lg">
          <div class="h-6 bg-stone-200 rounded w-8 mx-auto mb-1"></div>
          <div class="h-3 bg-stone-100 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-center p-3 bg-stone-50 rounded-lg">
          <div class="h-6 bg-stone-200 rounded w-8 mx-auto mb-1"></div>
          <div class="h-3 bg-stone-100 rounded w-12 mx-auto"></div>
        </div>
        <div class="text-center p-3 bg-stone-50 rounded-lg">
          <div class="h-6 bg-stone-200 rounded w-8 mx-auto mb-1"></div>
          <div class="h-3 bg-stone-100 rounded w-12 mx-auto"></div>
        </div>
      </div>
      
      <!-- Button -->
      <div class="h-12 bg-stone-200 rounded-lg w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Profile skeleton - no props needed
</script>
