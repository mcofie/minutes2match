<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 font-sans text-black dark:text-stone-200">
    <Head>
      <Title>Pricing - Minutes 2 Match</Title>
      <Meta name="description" content="Simple, transparent pricing. No hidden fees. Just real connections." />
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <img src="/logo-full.png" alt="minutes2match" class="h-20 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>

        <!-- Center Links (Desktop) -->
        <div class="hidden md:flex items-center gap-8 text-sm font-bold">
          <NuxtLink to="/#manifesto" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Manifesto</NuxtLink>
          <NuxtLink to="/#process" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Process</NuxtLink>
          <NuxtLink to="/#stories" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Stories</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Pricing</NuxtLink>
        </div>

        <!-- CTA & Login (Desktop) + Hamburger (Mobile) -->
        <div class="flex items-center gap-3 md:gap-6">
          <NuxtLink to="/login" class="hidden md:block text-sm font-bold hover:underline decoration-2 underline-offset-4 dark:text-stone-200">
             MEMBER LOGIN
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="hidden md:inline-flex group relative items-center overflow-hidden rounded-md border border-black dark:border-stone-600 bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-3 focus:outline-none hover:bg-rose-500 dark:hover:bg-rose-500 hover:border-rose-500 dark:hover:border-rose-500 dark:hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            <span class="text-xs font-bold uppercase tracking-widest">VIBE CHECK</span>
          </NuxtLink>

          <!-- Mobile CTA -->
          <NuxtLink to="/vibe-check" class="md:hidden bg-black dark:bg-stone-100 text-white dark:text-black px-4 py-2.5 rounded-lg text-[10px] font-bold border border-black dark:border-stone-600 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest">
            JOIN
          </NuxtLink>
          
          <!-- Mobile Hamburger -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-2 border-black dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"></span>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu Dropdown -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-show="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-[#FFFCF8] dark:bg-stone-900 border-b border-black dark:border-stone-800 shadow-lg">
          <div class="px-6 py-6 space-y-4">
            <NuxtLink to="/#manifesto" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Manifesto
            </NuxtLink>
            <NuxtLink to="/#process" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Process
            </NuxtLink>
            <NuxtLink to="/#stories" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Stories
            </NuxtLink>
            <NuxtLink to="/pricing" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
               Pricing
            </NuxtLink>
            <NuxtLink to="/login" @click="mobileMenuOpen = false" class="block w-full py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              MEMBER LOGIN
            </NuxtLink>
            <NuxtLink to="/vibe-check" @click="mobileMenuOpen = false" class="block w-full text-center bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-colors mt-4">
              START VIBE CHECK
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <main class="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      <!-- Hero -->
      <div class="text-center mb-16 md:mb-24">
        <h1 class="text-5xl md:text-7xl font-serif mb-6 leading-tight dark:text-stone-50">
          Invest in <span class="italic text-rose-500">connection.</span>
        </h1>
        <p class="text-xl md:text-2xl text-stone-500 font-light max-w-2xl mx-auto">
          We charge for results, not swipes. Simple, transparent pricing designed to get you offline.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
        
        <!-- Free Tier -->
        <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-400 p-8 flex flex-col relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300 mb-2">The Basics</h3>
            <div class="text-5xl font-serif font-bold dark:text-stone-50">Free</div>
            <p class="text-sm text-stone-500 dark:text-stone-400 mt-2">Forever free to join.</p>
          </div>
          
          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3 text-sm">
              <span class="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Take the Vibe Check & Assessment</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <span class="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Receive compatibility matches</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
               <span class="text-green-600 dark:text-green-400 font-bold">✓</span>
               <span class="font-bold text-black dark:text-stone-200">First match unlock is FREE</span>
            </li>
             <li class="flex items-start gap-3 text-sm text-stone-400">
               <span class="text-stone-300">×</span>
               <span>Connect with subsequent matches</span>
            </li>
          </ul>

          <NuxtLink to="/vibe-check" class="w-full py-4 rounded-lg border-2 border-black dark:border-stone-400 font-bold uppercase tracking-widest text-xs text-center hover:bg-black hover:text-white dark:hover:bg-stone-200 dark:hover:text-black transition-all">
            Get Started
          </NuxtLink>
        </div>

        <!-- Subscription (Featured) -->
        <div class="bg-black dark:bg-stone-200 text-white dark:text-black rounded-xl border-2 border-black dark:border-stone-400 p-8 flex flex-col relative overflow-visible transform md:-translate-y-4 z-10 shadow-[12px_12px_0px_0px_rgba(244,63,94,1)]">
          <div class="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-black dark:border-stone-400">
             Best Value
          </div>
          
          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-600 mb-2">Premium Member</h3>
            <div class="flex items-baseline gap-1">
               <span class="text-2xl font-serif opacity-50">GH₵</span>
               <span class="text-6xl font-serif font-bold">{{ prices.subscription }}</span>
               <span class="text-sm opacity-50">/mo</span>
            </div>
            <p class="text-sm text-stone-400 dark:text-stone-600 mt-2">Cancel anytime.</p>
          </div>
          
          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3 text-sm">
              <span class="text-rose-500 font-bold">✓</span>
              <span>Everything in Free</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <span class="text-rose-500 font-bold">✓</span>
              <span class="font-bold">Unlimited Match Unlocks</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
               <span class="text-rose-500 font-bold">✓</span>
               <span>Priority Event Invites</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
               <span class="text-rose-500 font-bold">✓</span>
               <span>Verified Profile Badge</span>
            </li>
          </ul>

          <NuxtLink to="/me" class="w-full py-4 rounded-lg bg-white dark:bg-black text-black dark:text-white font-bold uppercase tracking-widest text-xs text-center border-2 border-transparent hover:border-black dark:hover:border-stone-400 hover:bg-rose-500 hover:text-white transition-all shadow-none">
            Become a Member
          </NuxtLink>
        </div>

        <!-- Pay Per Match -->
        <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-400 p-8 flex flex-col relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <div class="mb-6">
            <h3 class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300 mb-2">Pay As You Go</h3>
             <div class="flex items-baseline gap-1">
               <span class="text-2xl font-serif opacity-50 dark:text-stone-400">GH₵</span>
               <span class="text-5xl font-serif font-bold dark:text-stone-50">{{ prices.match }}</span>
               <span class="text-sm opacity-50 dark:text-stone-400">/match</span>
            </div>
            <p class="text-sm text-stone-500 dark:text-stone-400 mt-2">Only pay for who you like.</p>
          </div>
          
          <ul class="space-y-4 mb-8 flex-1">
            <li class="flex items-start gap-3 text-sm">
              <span class="text-black dark:text-stone-300 font-bold">✓</span>
              <span>Everything in Free</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
              <span class="text-black dark:text-stone-300 font-bold">✓</span>
              <span>Unlock single profile connection</span>
            </li>
            <li class="flex items-start gap-3 text-sm">
               <span class="text-black dark:text-stone-300 font-bold">✓</span>
               <span>No monthly commitment</span>
            </li>
          </ul>

          <NuxtLink to="/me" class="w-full py-4 rounded-lg border-2 border-black dark:border-stone-400 font-bold uppercase tracking-widest text-xs text-center hover:bg-black hover:text-white dark:hover:bg-stone-200 dark:hover:text-black transition-all">
            View Matches
          </NuxtLink>
        </div>

      </div>

      <!-- Event Pricing Section -->
      <div class="max-w-4xl mx-auto mt-24 pt-16 border-t border-stone-200 dark:border-stone-800">
         <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-serif mb-4 dark:text-stone-50">Event Tickets</h2>
            <p class="text-stone-500">Curated experiences for intentional meetings.</p>
         </div>

         <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-[#F0FDF4] dark:bg-emerald-950/20 p-8 rounded-xl border-2 border-black dark:border-emerald-700 flex justify-between items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
               <div>
                  <h3 class="text-xl font-bold font-serif mb-1 dark:text-emerald-100">Gentlemen</h3>
                  <p class="text-xs uppercase tracking-widest text-green-700 dark:text-emerald-400 font-bold">Standard Ticket</p>
               </div>
               <div class="text-3xl font-serif font-bold dark:text-emerald-100">GH₵ {{ prices.event_male }}</div>
            </div>
            <div class="bg-[#FFF1F2] dark:bg-rose-950/20 p-8 rounded-xl border-2 border-black dark:border-rose-700 flex justify-between items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
               <div>
                  <h3 class="text-xl font-bold font-serif mb-1 dark:text-rose-100">Ladies</h3>
                  <p class="text-xs uppercase tracking-widest text-rose-700 dark:text-rose-400 font-bold">Standard Ticket</p>
               </div>
               <div class="text-3xl font-serif font-bold dark:text-rose-100">GH₵ {{ prices.event_female }}</div>
            </div>
         </div>
      </div>
    </main>
    
    <!-- FOOTER -->
    <footer class="bg-black dark:bg-stone-950 text-white pt-24 pb-12 px-6 overflow-hidden">
       <div class="max-w-[1440px] mx-auto">
          <!-- Top Section -->
          <div class="grid md:grid-cols-2 gap-16 mb-24 border-b border-white/20 pb-24">
             <div>
                <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-none text-white">
                   Ready to find <br/><span class="italic text-rose-500">your person?</span>
                </h2>
                <NuxtLink to="/vibe-check" class="inline-block bg-white dark:bg-stone-100 text-black px-12 py-5 rounded-md text-lg font-bold uppercase tracking-widest hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                   Start Vibe Check
                </NuxtLink>
             </div>
             
             <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-white mb-6 text-xs">Company</h4>
                   <ul class="space-y-4 text-sm font-medium text-gray-300 dark:text-stone-400">
                      <li><NuxtLink to="/#manifesto" class="hover:text-rose-500 transition-colors">Manifesto</NuxtLink></li>
                      <li><NuxtLink to="/#process" class="hover:text-rose-500 transition-colors">How it Works</NuxtLink></li>
                      <li><NuxtLink to="/#stories" class="hover:text-rose-500 transition-colors">Stories</NuxtLink></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Events</a></li>
                      <li><NuxtLink to="/pricing" class="hover:text-rose-500 transition-colors">Pricing</NuxtLink></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-white mb-6 text-xs">Social</h4>
                   <ul class="space-y-4 text-sm font-medium text-gray-300 dark:text-stone-400">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Instagram</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Twitter / X</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">TikTok</a></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-white mb-6 text-xs">Legal</h4>
                   <ul class="space-y-4 text-sm font-medium text-gray-300 dark:text-stone-400">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Terms</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Privacy</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Safety</a></li>
                   </ul>
                </div>
             </div>
          </div>

          <!-- Bottom Watermark -->
          <div class="flex flex-col md:flex-row justify-between items-end">
          <div class="flex items-end">
             <img src="/logo-full.png" alt="minutes2match" class="h-24 w-auto object-contain brightness-0 invert opacity-90" />
          </div>
             <div class="text-xs font-mono text-gray-400 dark:text-stone-500 mb-4 md:mb-8 text-right">
                © 2024 Minutes2Match Inc. • Accra, GH <br/>
                All Rights Reserved.
             </div>
          </div>
       </div>
    </footer>
    <!-- Social Proof Pulse -->
    <LivePulse />

  </div>
</template>

<script setup lang="ts">
import LivePulse from '~/components/LivePulse.vue'
const supabase = useSupabaseClient()

const mobileMenuOpen = ref(false)

const prices = reactive({
   match: 15, // Updated default
   subscription: 75, // Default updated to 75
   event_male: 100,
   event_female: 100
})

// Fetch current pricing from database
onMounted(async () => {
   try {
      const { data, error } = await supabase
         .from('settings')
         .select('*')
      
      if (data) {
         data.forEach((item: any) => {
            const value = item.value
            switch (item.key) {
               case 'default_match_unlock_fee':
                  prices.match = value?.amount || 50
                  break
               case 'subscription_price_monthly':
                  prices.subscription = value?.amount || 50
                  break
               case 'event_ticket_prices':
                  prices.event_male = value?.male || 100
                  prices.event_female = value?.female || 100
                  break
            }
         })
      }
   } catch (e) {
      console.error('Failed to load pricing:', e)
      // Fallback to defaults is handled by initial state
   }
})
</script>
