<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-stone-900 dark:text-stone-50 font-sans selection:bg-rose-200 selection:text-rose-900 transition-colors duration-300">
    <Head>
      <Title>The M2M Protocol | How it Works</Title>
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8]/80 backdrop-blur-md dark:bg-stone-950/80 border-b border-black/5 dark:border-stone-800">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
          <NuxtImg src="/logo-full.png" alt="m2m" class="h-12 w-auto dark:invert" />
        </NuxtLink>
        <NuxtLink to="/vibe-check" class="bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rose-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          Join Now
        </NuxtLink>
      </div>
    </nav>

    <main class="pt-32 pb-24 px-6">
      <!-- Hero -->
      <div class="max-w-4xl mx-auto text-center mb-20 space-y-6">
        <h1 class="text-5xl md:text-7xl font-serif font-black tracking-tight leading-[0.9]">
          Dating apps are a <span class="italic text-stone-300 dark:text-stone-700">lottery.</span><br/>
          M2M is a <span class="text-rose-500">laboratory.</span>
        </h1>
        <p class="text-xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed">
          We replaced infinite swiping with psychometrics and intentionality. Here is how we build connections that actually last.
        </p>
      </div>

      <!-- Protocol Toggle -->
      <div class="max-w-xl mx-auto mb-16 p-1.5 bg-stone-100 dark:bg-stone-900 rounded-2xl border-2 border-black dark:border-stone-800 flex shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <button 
          @click="activeMode = 'digital'"
          class="flex-1 py-3 md:py-4 px-2 rounded-xl text-[10px] md:text-sm font-bold uppercase tracking-wider md:tracking-widest transition-all flex items-center justify-center gap-1 md:gap-2"
          :class="activeMode === 'digital' ? 'bg-black text-white' : 'text-stone-400 hover:text-stone-600'"
        >
          <span>📱</span> Digital Matching
        </button>
        <button 
          @click="activeMode = 'physical'"
          class="flex-1 py-3 md:py-4 px-2 rounded-xl text-[10px] md:text-sm font-bold uppercase tracking-wider md:tracking-widest transition-all flex items-center justify-center gap-1 md:gap-2"
          :class="activeMode === 'physical' ? 'bg-rose-500 text-white' : 'text-stone-400 hover:text-stone-600'"
        >
          <span>🥂</span> Physical Events
        </button>
      </div>

      <!-- Mode Content -->
      <div class="max-w-6xl mx-auto relative min-h-[300px]">
        <TransitionGroup 
          enter-active-class="transition-all duration-500"
          enter-from-class="opacity-0 translate-y-8"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="absolute transition-all duration-300"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <!-- DIGITAL PATH -->
          <div v-if="activeMode === 'digital'" key="digital" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="(step, i) in digitalSteps" :key="i" class="group relative">
              <div class="absolute inset-0 bg-black dark:bg-stone-800 rounded-2xl translate-x-1.5 translate-y-1.5 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
              <div class="relative h-full bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 p-8 rounded-2xl flex flex-col">
                <div class="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-xl flex items-center justify-center text-2xl border-2 border-black dark:border-stone-700 mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                  {{ step.icon }}
                </div>
                <h3 class="text-xl font-bold mb-4">{{ step.title }}</h3>
                <p class="text-sm text-stone-500 leading-relaxed flex-1">{{ step.description }}</p>
                <div class="mt-6 font-mono text-[10px] uppercase font-bold text-stone-300 tracking-widest">Step 0{{ i + 1 }}</div>
              </div>
            </div>
          </div>

          <!-- PHYSICAL PATH -->
          <div v-if="activeMode === 'physical'" key="physical" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="(step, i) in physicalSteps" :key="i" class="group relative">
              <div class="absolute inset-0 bg-rose-500/20 rounded-2xl translate-x-1.5 translate-y-1.5 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
              <div class="relative h-full bg-white dark:bg-stone-900 border-2 border-black dark:border-rose-900/50 p-8 rounded-2xl flex flex-col">
                <div class="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center justify-center text-2xl border-2 border-rose-500 mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                  {{ step.icon }}
                </div>
                <h3 class="text-xl font-bold mb-4">{{ step.title }}</h3>
                <p class="text-sm text-stone-500 leading-relaxed flex-1">{{ step.description }}</p>
                <div class="mt-6 font-mono text-[10px] uppercase font-bold text-rose-300 tracking-widest">Stage 0{{ i + 1 }}</div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- The Protocol Cards -->
       <div class="max-w-6xl mx-auto mt-16 space-y-12">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
            <h2 class="text-xs font-black uppercase tracking-[0.4em] text-stone-400">The M2M Protocol</h2>
            <div class="h-px flex-1 bg-stone-200 dark:bg-stone-800"></div>
          </div>

          <div class="grid md:grid-cols-3 gap-12">
            <!-- Card 1: Intentionality -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                 <span class="text-2xl">💰</span>
                 <h4 class="font-bold text-lg">The "Free" Fallacy</h4>
              </div>
              <p class="text-sm text-stone-500 leading-relaxed">
                Free apps create "ghosting" because there is zero cost to being rude. By charging a small fee for unlocks, we ensure every connection has skin in the game. You're not just a swipe; you're a commitment.
              </p>
            </div>

            <!-- Card 2: Scarcity -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                 <span class="text-2xl">⏳</span>
                 <h4 class="font-bold text-lg">The 48-Hour Burn</h4>
              </div>
              <p class="text-sm text-stone-500 leading-relaxed">
                Connections expire in 48 hours to force a real-world decision. No more endless texting phases that lead nowhere. Say hello, set a date, or let it go. We value your time above all else.
              </p>
            </div>

             <!-- Card 3: Safety -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                 <span class="text-2xl">🛡️</span>
                 <h4 class="font-bold text-lg">The Safety Net</h4>
              </div>
              <p class="text-sm text-stone-500 leading-relaxed">
                If a match expires and you never got to connect, we automatically refund your credits. Our goal is a successful date, not your money. We only "win" when you're sitting across from someone you like.
              </p>
            </div>
          </div>
       </div>

       <!-- FAQ CTA -->
       <div class="max-w-4xl mx-auto mt-20 p-12 bg-black text-white rounded-[40px] text-center space-y-8 relative overflow-hidden">
          <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/20 rounded-full blur-[100px]"></div>
          <h2 class="text-4xl font-serif font-bold italic leading-tight !text-white">Ready to find a connection<br/>that actually clicks?</h2>
          <div class="flex justify-center gap-4">
             <NuxtLink to="/vibe-check" class="px-10 py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:text-white transition-all">
                Take the Vibe Check
             </NuxtLink>
          </div>
          <p class="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Join 500+ Intentional Daters in Accra</p>
       </div>
    </main>

    <!-- Footer -->
    <footer class="py-12 border-t border-stone-200 dark:border-stone-800 text-center">
       <p class="text-xs font-mono text-stone-400">© {{ new Date().getFullYear() }} Minutes 2 Match • Accra, GH</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const activeMode = ref('digital')

const digitalSteps = [
  {
    icon: '🧬',
    title: 'The Vibe Check',
    description: 'Answer 20 psychometric questions. We don’t ask for bios; we map your values, love languages, and lifestyle pace.'
  },
  {
    icon: '🔮',
    title: 'Value Pairing',
    description: 'Our algorithm searches for users with 90%+ compatibility. We mask photos and names to eliminate visual bias.'
  },
  {
    icon: '🔓',
    title: 'Intentional Unlock',
    description: 'Found someone interesting? Use a credit to unlock their profile. This notifies them that you’re serious about meeting.'
  },
  {
    icon: '💬',
    title: 'Secure the Date',
    description: 'Once unlocked, you get direct access (WhatsApp/IG). You have 48 hours to start the conversation before it expires.'
  }
]

const physicalSteps = [
  {
    icon: '✉️',
    title: 'Private Invite',
    description: 'Our members-only events are curated. We send invites to balanced groups based on age, orientation, and "vibe" parity.'
  },
  {
    icon: '📍',
    title: 'Secret Venues',
    description: 'From speakeasies to rooftop gardens in Accra, we pick settings that encourage conversation over loud music.'
  },
  {
    icon: '🎭',
    title: 'Guided Intros',
    description: 'No awkward standing around. We use prompt cards and rotating seating to ensure you meet everyone in the room.'
  },
  {
    icon: '✨',
    title: 'The Spark Check',
    description: 'After the event, tell us who you clicked with. If it’s mutual, we share contact info. No rejection, just matches.'
  }
]
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
