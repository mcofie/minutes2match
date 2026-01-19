<template>
  <div class="min-h-screen bg-white text-stone-900 font-sans selection:bg-orange-100 selection:text-orange-600">
    
    <!-- Hero Section with Commerce-style Header -->
    <div class="w-full relative container px-2 mx-auto max-w-7xl">
      <div class="mt-6 bg-stone-50 rounded-2xl relative overflow-hidden">
        
        <!-- Header -->
        <header class="flex items-center">
          <div class="w-full md:w-2/3 lg:w-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-2">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
              <span class="font-bold text-lg tracking-tight">minutes2match</span>
            </NuxtLink>

            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center justify-between w-full ml-8">
              <button @click="scrollToSection('how')" class="px-3 py-2 text-sm font-medium text-stone-600 hover:text-black transition-colors">
                How It Works
              </button>
              <button @click="scrollToSection('problem')" class="px-3 py-2 text-sm font-medium text-stone-600 hover:text-black transition-colors">
                The Problem
              </button>
              <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium text-stone-600 hover:text-black transition-colors">
                Login
              </NuxtLink>
            </nav>

            <!-- Mobile Menu Button -->
            <button 
              @click="mobileMenuOpen = true"
              class="lg:hidden ml-auto p-2 text-stone-500 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Desktop CTA -->
          <div class="hidden md:flex w-1/2 justify-end items-center pr-4 gap-4 ml-auto">
            <NuxtLink 
              to="/vibe-check"
              class="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span class="pl-4 py-2 text-sm font-medium">Take the Vibe Check</span>
              <div class="rounded-full flex items-center justify-center bg-black text-white w-10 h-10 ml-2 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
                </svg>
              </div>
            </NuxtLink>
          </div>
        </header>

        <!-- Hero Content -->
        <section class="w-full px-4 py-20 md:py-32 animate-fade-in-up">
          <div class="mx-auto text-center max-w-4xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 mb-8 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span class="text-xs font-semibold uppercase tracking-wider text-stone-500">Not another dating app</span>
            </div>

            <h1 class="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span class="text-stone-900">We don't help you find people.</span>
              <br />
              <span class="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                We help you click.
              </span>
            </h1>
            
            <p class="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10">
              An environment intentionally designed to connect you with people you're likely to genuinely click with. Our job is to put the odds in your favour.
            </p>

            <!-- CTA for mobile -->
            <div class="md:hidden">
              <NuxtLink to="/vibe-check" class="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 group">
                Take the Vibe Check
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </NuxtLink>
              <p class="text-sm text-stone-500 font-medium mt-4">
                90 seconds • Free • No app download
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Feature Cards (Commerce-style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto mt-8">
        <div
          v-for="(step, index) in steps"
          :key="step.title"
          class="group relative bg-stone-100 rounded-3xl p-6 sm:p-8 min-h-[280px] overflow-hidden transition-all duration-500 hover:shadow-xl animate-fade-in-up"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- Step Number -->
          <div class="absolute top-4 left-4 w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-400 text-sm">
            0{{ index + 1 }}
          </div>
          
          <!-- Content -->
          <div class="pt-12">
            <h3 class="text-xl sm:text-2xl font-bold text-stone-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
              {{ step.title }}
            </h3>
            <p class="text-stone-500 leading-relaxed">
              {{ step.desc }}
            </p>
          </div>

          <!-- Arrow -->
          <div class="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Marquee -->
    <div class="bg-white border-y border-stone-100 py-6 overflow-hidden mt-16">
      <div class="marquee-content flex gap-12 items-center opacity-50">
        <span class="text-lg font-bold text-stone-900 uppercase tracking-widest whitespace-nowrap" v-for="i in 10" :key="i">Genuine Connection ✦</span>
      </div>
    </div>

    <!-- The Problem Section -->
    <section id="problem" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Problem</h2>
          <p class="text-xl text-stone-500">Dating apps keep you swiping, not connecting.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="(card, idx) in problemCards" 
            :key="idx" 
            class="bg-stone-50 p-8 rounded-3xl border border-stone-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-6">
              {{ card.icon }}
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">{{ card.title }}</h3>
            <p class="text-stone-500 leading-relaxed">{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how" class="py-24 bg-stone-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Connection by design,
              <span class="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">not accident.</span>
            </h2>
            <p class="text-xl text-stone-500 mb-8">We utilize psychometrics and curated events to ensure you meet people worth meeting.</p>
            
            <div class="space-y-6">
              <div v-for="(step, i) in steps" :key="i" class="flex gap-6 p-4 bg-white rounded-2xl border border-stone-100 hover:shadow-lg transition-all">
                <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold">
                  0{{ i + 1 }}
                </div>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 mb-1">{{ step.title }}</h4>
                  <p class="text-stone-500">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Visual Card -->
          <div class="relative hidden lg:block">
            <div class="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent opacity-50 rounded-full blur-3xl"></div>
            <div class="relative bg-white border border-stone-200 rounded-3xl p-8 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div class="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                <span class="font-bold text-slate-900">Psychometric Match</span>
                <span class="bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-bold">98% Compatible</span>
              </div>
              <div class="space-y-4">
                <div class="h-4 bg-stone-100 rounded-full w-3/4"></div>
                <div class="h-4 bg-stone-100 rounded-full w-1/2"></div>
                <div class="h-4 bg-stone-100 rounded-full w-5/6"></div>
              </div>
              <div class="mt-6 pt-4 border-t border-stone-100 flex items-center gap-4">
                <div class="flex -space-x-2">
                  <div v-for="i in 3" :key="i" class="w-8 h-8 rounded-full bg-stone-200 border-2 border-white"></div>
                </div>
                <span class="text-sm text-stone-500">3 shared values</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div class="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
          Ready to meet people you'll actually
          <span class="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">click</span> with?
        </h2>
        <p class="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
          Take the Vibe Check. It's 90 seconds, free, and might just change how you meet your person.
        </p>
        <NuxtLink 
          to="/vibe-check" 
          class="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-stone-100 transition-all shadow-2xl group"
        >
          Start the Vibe Check
          <div class="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
            </svg>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-stone-100 py-12">
      <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-black rounded-lg text-white flex items-center justify-center text-sm font-bold">m</div>
          <span class="font-bold text-stone-900">minutes2match</span>
        </div>
        <div class="text-sm text-stone-500">
          © {{ new Date().getFullYear() }} Minutes 2 Match. Made with intention in Accra.
        </div>
      </div>
    </footer>

    <!-- Mobile Menu Sheet -->
    <UiSheet v-model="mobileMenuOpen" side="left">
      <div class="p-6">
        <!-- Logo in Sheet -->
        <div class="flex items-center gap-2 mb-8">
          <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
          <span class="font-bold text-lg tracking-tight">minutes2match</span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col space-y-1 mb-6">
          <button 
            @click="scrollToSection('how'); mobileMenuOpen = false"
            class="text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-100 hover:text-black rounded-lg transition-colors"
          >
            How It Works
          </button>
          <button 
            @click="scrollToSection('problem'); mobileMenuOpen = false"
            class="text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-100 hover:text-black rounded-lg transition-colors"
          >
            The Problem
          </button>
          <NuxtLink 
            to="/login"
            class="text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-100 hover:text-black rounded-lg transition-colors"
          >
            Login
          </NuxtLink>
        </nav>

        <UiSeparator class="my-6" />

        <!-- CTA -->
        <NuxtLink 
          to="/vibe-check"
          class="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          Take the Vibe Check
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
          </svg>
        </NuxtLink>
      </div>
    </UiSheet>

  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Find Your Perfect Match',
  meta: [
    { name: 'description', content: 'Science-backed compatibility matching through curated speed dating events. Find meaningful connections with people you\'re likely to click with.' }
  ]
})

const mobileMenuOpen = ref(false)

const steps = [
  { title: "The Vibe Check", desc: "A 90-second psychometric assessment that maps your values and communication style." },
  { title: "Curated Events", desc: "Real-time algorithms balance gender ratios and compatibility scores." },
  { title: "Mindful Matches", desc: "Receive curated introductions to people you genuinely connected with." }
]

const problemCards = [
  { icon: "🎰", title: "Slot-machine mechanics", desc: "Endless swiping triggers dopamine hits but rarely leads to real connections." },
  { icon: "📸", title: "Photo-first filtering", desc: "Judging compatibility in 0.5 seconds based on looks alone." },
  { icon: "👻", title: "No accountability", desc: "Ghosting is normalized. Genuine intent is rare." }
]

const scrollToSection = (id: string) => {
  mobileMenuOpen.value = false
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Marquee animation */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-content {
  animation: marquee 30s linear infinite;
  width: max-content;
}
</style>
