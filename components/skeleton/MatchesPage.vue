<template>
  <!-- Matches skeleton: centred header, the fan of cards, the detail card and the past-matches row -->
  <div class="animate-pulse" aria-hidden="true">
    <div class="flex flex-col items-center pt-2 sm:pt-8">
      <span class="h-7 w-32 rounded-full bg-white ring-1 ring-black/[0.06]"></span>
      <span class="mt-5 h-12 w-60 rounded-2xl bg-[#ebe8e4] sm:h-20 sm:w-[26rem]"></span>
      <span class="mt-4 h-4 w-56 rounded-full bg-[#efece8]"></span>
    </div>
    <div class="mt-8 flex items-start justify-center sm:mt-12">
      <span class="-mr-14 mt-8 h-[12rem] w-[8rem] -rotate-[8deg] rounded-[1.1rem] bg-[#ebe8e4] sm:-mr-14 sm:h-[18rem] sm:w-48"></span>
      <span class="relative z-10 h-[17rem] w-[11.5rem] rounded-[1.25rem] bg-gradient-to-b from-[#e9eff5] to-[#e2e7ee] sm:h-[23rem] sm:w-[15.5rem]"></span>
      <span class="-ml-14 mt-8 h-[12rem] w-[8rem] rotate-[8deg] rounded-[1.1rem] bg-gradient-to-b from-[#e9eef4] to-[#f4ece2] sm:-ml-14 sm:h-[18rem] sm:w-48"></span>
    </div>
    <div class="relative mx-auto -mt-10 max-w-md rounded-[1.75rem] bg-white px-5 pb-6 pt-14 ring-1 ring-black/[0.05] sm:-mt-12 sm:px-6 sm:pt-16">
      <div v-for="n in 3" :key="n" class="flex items-center gap-3.5 border-b border-black/[0.06] py-4 last:border-0">
        <span class="h-5 w-5 rounded-md bg-[#efece8]"></span>
        <span class="h-4 rounded-full bg-[#ebe8e4]" :style="{ width: ['55%', '40%', '65%'][n - 1] }"></span>
      </div>
      <span class="mx-auto mt-5 block h-12 w-full rounded-full bg-[#ebe8e4] sm:w-52"></span>
    </div>
    <span class="mx-auto mt-10 block h-14 max-w-md rounded-2xl bg-white ring-1 ring-black/[0.05] sm:mt-14"></span>
  </div>
</template>
