<template>
  <div class="animate-pulse">
    <!-- Profile/Dashboard Section Skeleton -->
    <div class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
       <div class="flex items-center gap-4 mb-8">
          <div class="h-8 bg-stone-200 dark:bg-stone-800 rounded-lg w-40"></div>
          <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
       </div>
       
       <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="i in 4" :key="i" class="space-y-3">
             <div class="h-3 bg-stone-100 dark:bg-stone-800/50 rounded w-20 uppercase tracking-widest"></div>
             <div class="h-12 bg-stone-50 dark:bg-stone-800/20 rounded-lg border-2 border-stone-100 dark:border-stone-800 w-full"></div>
          </div>
       </div>

       <div class="mt-10 pt-8 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <div class="h-12 w-36 bg-stone-200 dark:bg-stone-700 rounded-xl border-2 border-black dark:border-stone-600"></div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Neo-brutalist Profile/Form skeleton
</script>
