<template>
  <Transition
    enter-active-class="transition ease-out duration-500"
    enter-from-class="translate-y-full opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="translate-y-full opacity-0 scale-95"
  >
    <div v-if="visible" class="fixed bottom-4 left-4 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border border-stone-200 dark:border-stone-700 px-4 py-3 rounded-full flex items-center gap-3 w-max max-w-[90vw]">
      <div class="relative flex items-center justify-center w-2 h-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </div>
      <div class="text-xs font-medium text-stone-800 dark:text-stone-200 font-mono tracking-tight">
        {{ currentMessage }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const visible = ref(false)
const currentMessage = ref('')

const messages = [
  "Someone in East Legon just matched! 💕",
  "New profile created in Cantonments ✨",
  "Speed Dating (Feb 20) is 80% Full 🔥",
  "A user just unlocked a connection 🔓",
  "New Vibe Check completed in Osu 📝",
  "3 people are looking for dates now 👀",
  "Security: 14 inactive profiles purged for pool quality 🛡️",
  "Community: 100% of today's matches verified responsive ✅",
  "Trust: High-quality pool maintained. No bots detected 🤖"
]

const showNextMessage = () => {
  // Hide current
  visible.value = false
  
  // Wait for animation to finish then show next
  setTimeout(() => {
    currentMessage.value = messages[Math.floor(Math.random() * messages.length)]
    visible.value = true
    
    // Hide after reading time
    setTimeout(() => {
      visible.value = false
    }, 4000)
    
  }, 1000) // Delay between hiding and showing new one or just interval
}

onMounted(() => {
  // Start the cycle loop
  // Initial delay
  setTimeout(() => {
    cycle()
  }, 2000)
})

const cycle = () => {
  const randomDelay = Math.random() * 5000 + 5000 // 5-10s delay
  showNextMessage()
  setTimeout(cycle, randomDelay + 5000)
}
</script>
