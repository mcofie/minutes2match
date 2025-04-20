<template xmlns="http://www.w3.org/1999/html">
  <main class="w-4/5 mx-auto">
    <div class="w-full flex flex-col xl:flex-row mt-10 items-center bg-red-500 p-10">
      <div class="w-1/2">
        <h2 class="text-6xl text-white">Welcome to Minutes2Match</h2>
        <small class="text-white">Where Chemistry Meets Opportunity</small>
        <p class="mt-2 text-white">
          Tired of endless swiping and awkward texting? At Minutes2Match, we bring back the magic of real-life
          connection. Our curated speed dating events are designed for modern singles who want meaningful interactions,
          minus the pressure.
        </p>
        <button class="py-2 bg-white my-2 px-2 underline"> Register Now!</button>
      </div>
      <div class="w-1/2">
        <img src="/assets/imgs/jumbo_img.png" alt="Jumbo"/>
      </div>
    </div>

    <div
        class="text-center pb-32 px-10 bg-white border-r-1 border-l-gray-200 border-l-1 border-r-gray-200 justify-center flex flex-col items-center">
      <div class="p-5 mb-20 bg-red-500 w-fit  text-white text-md self-start"><h4>How it works</h4></div>
      <div class="w-full flex flex-row space-x-5">
        <div class="w-1/3 p-3">
          <span class="px-6 py-4 rounded-full bg-red-100 font-bold">1</span>
          <h5 class="text-xl mt-5">Register Online</h5>
          <p class="text-start text-sm">
            Fill out our quick sign-up form — it only takes a minute. Share your basic info, a few preferences, and your
            availability. No fluff. Just facts that help us find the right event for you.
          </p>
        </div>

        <div class="w-1/3 p-3">
          <span class="px-6 py-4 rounded-full bg-red-100 font-bold">2</span>
          <h5 class="text-xl mt-5">Screening & Shortlisting</h5>
          <p class="text-start text-sm">
            Once you register, our team does a quick screening to ensure everyone’s on the same page — age group,
            interests, and vibes. We believe in quality over quantity, so our events are carefully curated.
          </p>
        </div>

        <div class="w-1/3 p-3">
          <span class="px-6 py-4 rounded-full bg-red-100 font-bold">3</span>
          <h5 class="text-xl mt-5">Confirmation & Invite</h5>
          <p class="text-start text-sm">
            If you’re shortlisted, you’ll receive a confirmation email or WhatsApp message with your event invite,
            payment link, and all the details. Lock in your spot quickly — seats fill up fast!
          </p>
        </div>
      </div>
    </div>

    <div class="bg-black pb-20 px-10 text-center justify-center flex flex-col items-center">
      <div class="p-5 mb-10 bg-white w-fit text-md self-start"><h4>What Happens at the
        Event?</h4></div>
      <iframe width="100%" height="520" src="https://www.youtube.com/embed/tgbNymZ7vqY">
      </iframe>
      <div class="flex flex-col text-start text-white">
        <ol class="hidden">
          <li> You meet up to 10 like-minded singles in one evening</li>
          <li> Each conversation lasts around 5–7 minutes</li>
          <li> You mark who you’d like to see again</li>
          <li>If there’s a match, we will connect you after the event!</li>
        </ol>
      </div>
    </div>

    <div class="w-full p-10  border-r-1 border-l-1 border-l-gray-200 border-r-gray-200 flex flex-col items-center justify-center text-center bg-white">
      <div class="w-2/3 flex flex-col space-y-5 items-center justify-center ">
        <h2 class="text-3xl">Do you want to come to <br> our next event?</h2>
        <p>
          Join us for an evening of meaningful connections, great conversations, and a vibe you won’t forget. Whether
          you’re coming solo or with friends, there’s something special in store for you.
        </p>
        <button class="bg-black text-white px-10 py-5 w-fit">Register Now!</button>
      </div>
    </div>

    <div class="w-full p-10 flex flex-col items-center justify-center text-center bg-white">

    </div>

  </main>
</template>

<script setup lang="ts">
const isLoaded = ref(false)
const isPlaying = ref(false)
const video = ref()


async function play() {
  await video.value.player.playVideo()
}

function stateChange(event) {
  isPlaying.value = event.data === 1
}
</script>

<style scoped>

</style>