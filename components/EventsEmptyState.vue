<template>
  <div class="mx-auto max-w-xl text-center">
    <LoveBirds scene="talk" class="section-art mx-auto w-56 sm:w-80" />
    <h2 class="font-display mt-4 text-[2rem] leading-tight tracking-tight text-[#393737] sm:text-[2.6rem]">Nothing on the calendar yet.</h2>
    <p class="mx-auto mt-3 max-w-md text-base leading-relaxed text-[#6c6862] sm:text-lg">
      We're planning the next one. In the meantime, take the Vibe Check and opt in for this week's match.
    </p>
    <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <NuxtLink to="/vibe-check" class="btn-solid grain grain-strong px-7 py-3.5 text-base">Take the Vibe Check</NuxtLink>
      <NuxtLink to="/about#how-it-works" class="rounded-full px-5 py-3 text-base font-semibold text-[#393737] underline-offset-4 hover:underline">How matching works</NuxtLink>
    </div>
  </div>
</template>
