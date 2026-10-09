<template>
  <div class="animate-pulse" aria-hidden="true">
    <!-- Match card skeleton: mirrors the minimal BlindProfileCard -->
    <div class="flex flex-col rounded-[2rem] bg-gradient-to-b from-[#eceff3] to-[#f5f6f8] p-2.5">
      <div class="aspect-square rounded-[1.6rem] bg-[#e2e6eb] sm:aspect-[4/5]"></div>
      <div class="flex flex-col items-center gap-2.5 px-3 pb-4 pt-6">
        <div class="h-6 w-32 rounded-full bg-[#e2e6eb]"></div>
        <div class="h-4 w-24 rounded-full bg-[#e9ecf0]"></div>
        <div class="mt-4 h-11 w-36 rounded-full bg-[#e2e6eb]"></div>
      </div>
    </div>
  </div>
</template>
