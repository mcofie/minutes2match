<template>
  <!-- Same shape as EventCard while events load -->
  <div class="animate-pulse overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_30px_rgba(57,77,100,0.07)] ring-1 ring-black/[0.04]" aria-hidden="true">
    <div class="aspect-[16/10] bg-gradient-to-b from-[#eef2f6] to-[#e4ebf2]"></div>
    <div class="space-y-3 p-5 sm:p-6">
      <div class="h-3.5 w-32 rounded-full bg-[#f1efec]"></div>
      <div class="h-6 w-3/4 rounded-full bg-[#ece8e3]"></div>
      <div class="h-3.5 w-1/2 rounded-full bg-[#f1efec]"></div>
      <div class="h-1.5 w-full rounded-full bg-[#f1efec]"></div>
      <div class="flex items-center justify-between border-t border-black/[0.06] pt-4">
        <div class="h-6 w-20 rounded-full bg-[#ece8e3]"></div>
        <div class="h-10 w-28 rounded-full bg-[#f1efec]"></div>
      </div>
    </div>
  </div>
</template>
