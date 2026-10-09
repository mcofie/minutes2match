<template>
  <!-- Match letter skeleton: mirrors the connection page (sticky bar, sky header, opening, stats, first section) -->
  <div class="relative z-10 mx-auto max-w-6xl animate-pulse px-4 pb-32 pt-4 sm:px-6 sm:pt-6" aria-hidden="true">
    <div class="mx-auto max-w-3xl">
      <!-- profile / print bar -->
      <div class="flex items-center justify-between gap-3 py-2.5 sm:px-2">
        <div class="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 ring-1 ring-black/5">
          <span class="h-8 w-8 rounded-full bg-[#ebe8e4]"></span>
          <span class="h-3.5 w-24 rounded-full bg-[#ebe8e4]"></span>
        </div>
        <span class="h-10 w-10 rounded-full bg-white ring-1 ring-black/5 sm:w-44"></span>
      </div>

      <!-- sky header -->
      <div class="relative mx-[calc(50%-50vw)] overflow-hidden bg-gradient-to-b from-[#f7f7f7] via-[#e9eff5] to-[#dde7f1] px-6 pb-24 pt-10 sm:pb-32 sm:pt-16">
        <div class="flex flex-col items-center">
          <span class="h-8 w-36 rounded-full bg-white/80"></span>
          <div class="mt-8 flex items-center">
            <span class="h-16 w-16 rounded-full bg-white/70 ring-4 ring-white sm:h-20 sm:w-20"></span>
            <span class="-ml-4 h-16 w-16 rounded-full bg-white/60 ring-4 ring-white sm:h-20 sm:w-20"></span>
          </div>
          <span class="mt-7 h-11 w-64 max-w-full rounded-2xl bg-white/70 sm:h-16 sm:w-[30rem]"></span>
          <span class="mt-5 h-4 w-72 max-w-full rounded-full bg-white/60"></span>
          <span class="mt-2.5 h-4 w-56 max-w-full rounded-full bg-white/60"></span>
          <span class="mt-4 h-3 w-40 rounded-full bg-white/50"></span>
        </div>
        <!-- clouds into the page colour, as on the real header -->
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" class="pointer-events-none absolute inset-x-0 -bottom-1 h-24 w-full sm:h-32">
          <g fill="#f7f7f7">
            <ellipse cx="720" cy="215" rx="820" ry="70" />
            <circle cx="120" cy="190" r="90" /><circle cx="330" cy="175" r="100" /><circle cx="560" cy="195" r="85" />
            <circle cx="880" cy="180" r="100" /><circle cx="1110" cy="190" r="90" /><circle cx="1330" cy="175" r="100" />
          </g>
        </svg>
      </div>

      <!-- letter -->
      <div class="mx-auto max-w-[42rem] pt-8 sm:pt-12">
        <span class="block h-8 w-48 rounded-xl bg-[#ebe8e4] sm:h-10 sm:w-60"></span>
        <div class="mt-6 space-y-3">
          <span class="block h-4 w-full rounded-full bg-[#ebe8e4]"></span>
          <span class="block h-4 w-[92%] rounded-full bg-[#ebe8e4]"></span>
          <span class="block h-4 w-[60%] rounded-full bg-[#ebe8e4]"></span>
        </div>
        <div class="mt-6 space-y-3">
          <span class="block h-4 w-full rounded-full bg-[#ebe8e4]"></span>
          <span class="block h-4 w-[96%] rounded-full bg-[#ebe8e4]"></span>
          <span class="block h-4 w-[88%] rounded-full bg-[#ebe8e4]"></span>
          <span class="block h-4 w-[40%] rounded-full bg-[#ebe8e4]"></span>
        </div>

        <!-- headline numbers -->
        <div class="mt-12 grid grid-cols-2 divide-x divide-[#e5e2de] border-y border-[#e5e2de]">
          <div v-for="n in 2" :key="n" class="flex flex-col items-center py-7 sm:py-9">
            <span class="h-10 w-20 rounded-xl bg-[#ebe8e4] sm:h-14 sm:w-28"></span>
            <span class="mt-3 h-3 w-24 rounded-full bg-[#ebe8e4]"></span>
          </div>
        </div>

        <!-- first section: illustration, kicker, title -->
        <div class="mt-20 flex flex-col items-center sm:mt-28">
          <span class="h-[17.5rem] w-56 rounded-[50%] bg-gradient-to-b from-[#e3e9f0] via-[#efede9] to-[#f3e6d7] opacity-70 blur-[2px] sm:h-96 sm:w-72"></span>
          <span class="mt-6 h-4 w-32 rounded-full bg-[#ebe8e4] sm:mt-8"></span>
          <span class="mt-3 h-10 w-72 max-w-full rounded-2xl bg-[#ebe8e4] sm:h-14 sm:w-[28rem]"></span>
        </div>
      </div>
    </div>
  </div>
</template>
