<template>
  <!-- /me skeleton: header, weekly opt-in, readiness, profile list, account -->
  <div class="animate-pulse space-y-5" aria-hidden="true">
    <!-- photo + greeting -->
    <div class="flex items-center gap-4 pb-1">
      <span class="h-16 w-16 shrink-0 rounded-full bg-[#ebe8e4] sm:h-20 sm:w-20"></span>
      <div class="min-w-0 flex-1 space-y-2.5">
        <span class="block h-7 w-44 rounded-xl bg-[#ebe8e4]"></span>
        <span class="block h-3.5 w-36 rounded-full bg-[#efece8]"></span>
      </div>
    </div>

    <!-- this week's matching -->
    <div class="rounded-[1.75rem] bg-gradient-to-br from-[#e9eff5] to-white p-5 ring-1 ring-black/5">
      <span class="block h-3.5 w-32 rounded-full bg-white/80"></span>
      <span class="mt-3 block h-7 w-60 max-w-full rounded-xl bg-white/80"></span>
      <span class="mt-3 block h-4 w-48 rounded-full bg-white/70"></span>
      <span class="mt-5 block h-12 w-full rounded-full bg-white/80 sm:w-52"></span>
    </div>

    <!-- readiness -->
    <div class="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 ring-1 ring-black/5">
      <span class="h-12 w-12 shrink-0 rounded-full border-[5px] border-[#efece8]"></span>
      <div class="flex-1 space-y-2">
        <span class="block h-3.5 w-40 rounded-full bg-[#efece8]"></span>
        <span class="block h-4 w-52 max-w-full rounded-full bg-[#ebe8e4]"></span>
      </div>
    </div>

    <!-- your profile -->
    <div class="rounded-[1.75rem] bg-white ring-1 ring-black/5">
      <span class="mx-5 mb-2 mt-5 block h-3.5 w-24 rounded-full bg-[#efece8] sm:mx-6 sm:mt-6"></span>
      <ul class="divide-y divide-black/[0.06]">
        <li v-for="(w, i) in ROWS" :key="i" class="flex min-h-[4.25rem] items-center gap-4 px-5 py-4 sm:px-6">
          <div class="flex-1 space-y-2">
            <span class="block h-4 rounded-full bg-[#ebe8e4]" :style="{ width: w[0] }"></span>
            <span class="block h-3.5 rounded-full bg-[#f1eeea]" :style="{ width: w[1] }"></span>
          </div>
          <span class="h-4 w-2.5 rounded-full bg-[#efece8]"></span>
        </li>
      </ul>
    </div>

    <!-- account -->
    <div class="rounded-[1.75rem] bg-white ring-1 ring-black/5">
      <span class="mx-5 mb-2 mt-5 block h-3.5 w-20 rounded-full bg-[#efece8] sm:mx-6 sm:mt-6"></span>
      <div v-for="n in 2" :key="n" class="flex items-center gap-4 border-t border-black/[0.06] px-5 py-4 first-of-type:border-t-0 sm:px-6">
        <span class="h-4 flex-1 rounded-full bg-[#ebe8e4]" :style="{ maxWidth: n === 1 ? '9rem' : '7.5rem' }"></span>
        <span class="h-4 w-2.5 rounded-full bg-[#efece8]"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// title / summary widths for the six profile rows, so they don't look stamped out
const ROWS = [
  ['6rem', '70%'], ['9rem', '55%'], ['5rem', '62%'], ['8rem', '45%'], ['7rem', '58%'], ['6.5rem', '40%'],
]
</script>
