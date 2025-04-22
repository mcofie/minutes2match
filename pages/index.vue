<template xmlns="http://www.w3.org/1999/html">
  <main class="xl:w-4/5 lg:w-5/6 w-full mx-auto">
    <div class="w-full flex flex-col xl:flex-row lg:flex-row mt-10 items-center bg-red-500 p-5 xl:px-10">
      <div class="w-full xl:hidden lg:hidden">
        <img src="/assets/imgs/jumbo_img.png" alt="Jumbo"/>
      </div>
      <div class="w-full md:w-full md:text-center xl:text-start lg:text-start text-center lg:w-1/2">
        <h2 class="text-4xl lg:text-start xl:text-start xl:text-6xl lg:text-4xl md:text-6xl md:text-center text-center text-white">
          Welcome to
          Minutes2Match</h2>
        <small class="text-white text-xs xl:text-sm">Where Chemistry Meets Opportunity</small>
        <p class="mt-2 xl:text-md lg:text-sm text-sm md:text-lg text-white">
          Tired of endless swiping and awkward texting? At Minutes2Match, we bring back the magic of real-life
          connection. Our curated speed dating events are designed for modern singles who want meaningful interactions,
          minus the pressure.
        </p>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdc9sbS1XMCeaSWcl3MKQ0lNrvzx7sGmIHxafaKZwmnyglyOQ/viewform?usp=header">
          <button class="py-2  bg-white my-2 px-2 underline xl:px-2 xl:py-2 xl:text-md self-center"> Register Now!
          </button>
        </a>

      </div>
      <div class="md:w-1/2 lg:w-1/2 hidden lg:block">
        <img src="/assets/imgs/jumbo_img.png" alt="Jumbo"/>
      </div>
    </div>

    <div
        class="text-center pb-32 px-5 bg-white border-r-1 border-l-gray-200 border-l-1 border-r-gray-200 justify-center flex flex-col items-center">
      <div class="p-5 xl:mb-20 mb-10 bg-red-500 w-fit  text-white text-md self-start"><h4>How it works</h4></div>
      <div class="w-full flex flex-col md:flex-row space-y-3 space-x-5 xl:px-10">
        <div class="w-full md:w-1/3 py-3">
          <span class="px-6 py-4 rounded-full bg-red-100 font-bold">1</span>
          <h5 class="text-xl mt-5">Register Online</h5>
          <p class="text-start text-sm">
            Fill out our quick sign-up form — it only takes a minute. Share your basic info, a few preferences, and your
            availability. No fluff. Just facts that help us find the right event for you.
          </p>
        </div>

        <div class="w-full md:w-1/3 py-3">
          <span class="px-6 py-4 rounded-full bg-red-100 font-bold">2</span>
          <h5 class="text-xl mt-5">Screening & Shortlisting</h5>
          <p class="text-start text-sm">
            Once you register, our team does a quick screening to ensure everyone’s on the same page — age group,
            interests, and vibes. We believe in quality over quantity, so our events are carefully curated.
          </p>
        </div>

        <div class="w-full md:w-1/3 py-3">
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

    <div
        class="w-full lg:w-full p-10 md:w-4/5 mx-auto border-r-1 border-l-1 border-l-gray-200 border-r-gray-200 flex flex-col items-center justify-center text-center bg-white">
      <div class="w-full flex flex-col space-y-5 items-center justify-center ">
        <h2 class="text-2xl lg:text-3xl">Do you want to come to <br> our next event?</h2>
        <p>
          Join us for an evening of meaningful connections, great conversations, and a vibe you won’t forget. Whether
          you’re coming solo or with friends, there’s something special in store for you.
        </p>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdc9sbS1XMCeaSWcl3MKQ0lNrvzx7sGmIHxafaKZwmnyglyOQ/viewform?usp=header">
          <button class="hover:bg-gray-900 cursor-pointer bg-black text-white px-10 py-5 w-fit">Register Now!</button>
        </a>
      </div>
    </div>

    <div class="w-full p-10 flex flex-col bg-black items-center justify-center text-center ">
      <p class="text-gray-500 text-sm">&copy; 2025. All Rights Reserved.</p>
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