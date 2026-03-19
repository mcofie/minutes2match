<template>
  <div class="group relative h-[200px] min-h-[200px] max-h-[200px] bg-white rounded-2xl overflow-hidden border-2 border-stone-100 flex shimmer-container">
    <!-- Shimmer Overlay -->
    <div class="absolute inset-0 z-10 animate-shimmer pointer-events-none opacity-40"></div>

    <!-- Main Content Layout -->
    <div class="flex flex-1 items-stretch h-full overflow-hidden">
      <!-- Photo Section Placeholder (Left) -->
      <div class="w-32 sm:w-36 flex-shrink-0 bg-stone-50 border-r-2 border-stone-50 h-full flex items-center justify-center">
         <div class="w-12 h-12 rounded-full bg-stone-100 opacity-50"></div>
      </div>

      <!-- Content Section Placeholder (Right) -->
      <div class="flex flex-col flex-1 h-full p-4 min-w-0 bg-white relative">
        <div class="flex-1 space-y-4">
          <!-- Name & Badge Area -->
          <div class="space-y-2">
            <div class="h-5 w-3/4 bg-stone-100 rounded-md"></div>
            <div class="h-3 w-1/2 bg-stone-50 rounded-md"></div>
          </div>

          <!-- Interest Badge Placeholder -->
          <div class="h-6 w-24 bg-stone-50 rounded-lg"></div>

          <!-- Bio Placeholder -->
          <div class="space-y-2 pt-2">
            <div class="h-3 w-full bg-stone-50 rounded-md"></div>
            <div class="h-3 w-4/5 bg-stone-50 rounded-md"></div>
          </div>
        </div>

        <!-- Footer Placeholder -->
        <div class="flex items-end justify-between pt-2">
          <div class="space-y-1.5">
            <div class="h-2 w-8 bg-stone-100 rounded"></div>
            <div class="h-3 w-12 bg-stone-50 rounded"></div>
          </div>
          <div class="h-8 w-24 bg-stone-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Purely presentational skeleton
</script>
