<template>
  <div class="min-h-screen bg-white text-stone-900 font-sans selection:bg-orange-100 selection:text-orange-600">
    
    <!-- Navbar -->
    <nav class="fixed top-0 inset-x-0 z-50 h-16 border-b border-stone-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
            <span class="font-bold text-lg tracking-tight">minutes2match</span>
        </div>
        
        <div class="hidden md:flex items-center gap-8">
          <button @click="scrollToSection('how')" class="text-sm font-medium text-stone-500 hover:text-black transition-colors">How It Works</button>
          <NuxtLink to="/login" class="text-sm font-medium text-stone-500 hover:text-black transition-colors">Login</NuxtLink>
          <NuxtLink to="/vibe-check" class="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
            Take the Vibe Check
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <!-- Vignette/Glow Background -->
        <div class="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-50 border border-stone-200 mb-8 animate-fade-in-up">
                <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span class="text-xs font-semibold uppercase tracking-wider text-stone-500">Not another dating app</span>
            </div>

            <h1 class="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
                We don't help you find people.
                <span class="text-stone-400 block sm:inline">We help you click.</span>
            </h1>

            <p class="text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                An environment intentionally designed to connect you with people you're likely to genuinely click with. Our job is to put the odds in your favour.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <NuxtLink to="/vibe-check" class="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 hover:-translate-y-1 flex items-center gap-2 group">
                    Take the Vibe Check
                    <span class="group-hover:translate-x-1 transition-transform">→</span>
                </NuxtLink>
                <div class="text-sm text-stone-500 font-medium">
                    90 seconds • Free • No app download
                </div>
            </div>

            <!-- Social Proof -->
            <div class="border-t border-stone-100 pt-12">
                <p class="text-sm text-stone-400 font-medium mb-6 uppercase tracking-widest">Join 200+ Members vibing this week</p>
                <div class="flex items-center justify-center -space-x-3">
                    <div v-for="i in 5" :key="i" class="w-10 h-10 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600 shadow-sm relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-default">
                        {{ ['A','K','M','S','J'][i-1] }}
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Marquee -->
    <div class="bg-white border-y border-stone-100 py-6 overflow-hidden">
        <div class="marquee-content flex gap-12 items-center opacity-50">
            <span class="text-lg font-bold text-stone-900 uppercase tracking-widest" v-for="i in 10" :key="i">Genuine Connection ✦</span>
        </div>
    </div>

    <!-- The Problem Section (Card Grid) -->
    <section class="py-24 bg-stone-50/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">The Problem</h2>
                <p class="text-xl text-stone-500">Dating apps keep you swiping, not connecting.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div v-for="(card, idx) in problemCards" :key="idx" class="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                    <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-6">
                        {{ card.icon }}
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">{{ card.title }}</h3>
                    <p class="text-stone-500 leading-relaxed">{{ card.desc }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works (Steps) -->
    <section id="how" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 class="text-4xl font-bold text-slate-900 mb-6">Connection by design, not accident.</h2>
                    <p class="text-xl text-stone-500 mb-8">We utilize psychometrics and curated events to ensure you meet people wörth meeting.</p>
                    
                    <div class="space-y-8">
                        <div v-for="(step, i) in steps" :key="i" class="flex gap-6">
                            <div class="flex-shrink-0 w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center font-bold text-stone-400 bg-stone-50">0{{ i + 1}}</div>
                            <div>
                                <h4 class="text-xl font-bold text-slate-900 mb-2">{{ step.title }}</h4>
                                <p class="text-stone-500">{{ step.desc }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Visual Decoration (Abstract Card Stack) -->
                <div class="relative">
                    <div class="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent opacity-50 rounded-full blur-3xl"></div>
                    <div class="relative bg-white border border-stone-200 rounded-2xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div class="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                            <span class="font-bold text-slate-900">Psychometric Match</span>
                            <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">98% Compatible</span>
                        </div>
                        <div class="space-y-4">
                            <div class="h-4 bg-stone-100 rounded w-3/4"></div>
                            <div class="h-4 bg-stone-100 rounded w-1/2"></div>
                             <div class="h-4 bg-stone-100 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div class="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 class="text-4xl md:text-5xl font-bold mb-8">Ready to meet people you'll actually click with?</h2>
            <p class="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">Take the Vibe Check. It's 90 seconds, free, and might just change how you meet your person.</p>
            <NuxtLink to="/vibe-check" class="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-stone-100 transition-colors">
                Start the Vibe Check
            </NuxtLink>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-stone-100 py-12">
        <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 bg-black rounded text-white flex items-center justify-center text-xs font-bold">m</div>
                <span class="font-bold text-stone-900">minutes2match</span>
            </div>
            <div class="text-sm text-stone-500">
                &copy; {{ new Date().getFullYear() }} Minutes 2 Match. Made with intention in Accra.
            </div>
        </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
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
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Custom animations if needed */
.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
