<template>
  <div class="min-h-screen bg-white text-black font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden">
    <!-- Fonts -->
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <Link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] border-b border-black">
      <div class="max-w-[1440px] mx-auto px-6 h-24 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="text-3xl font-serif italic font-bold tracking-tight z-50 hover:text-rose-500 transition-colors">
           minutes2match.
        </NuxtLink>

        <!-- Center Links -->
        <div class="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          <button @click="scrollToSection('manifesto')" class="hover:text-rose-500 transition-colors">Manifesto</button>
          <button @click="scrollToSection('process')" class="hover:text-rose-500 transition-colors">Process</button>
          <button @click="scrollToSection('stories')" class="hover:text-rose-500 transition-colors">Stories</button>
        </div>

        <!-- CTA & Login -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/login" class="hidden md:block text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
             Member Login
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="group relative inline-flex items-center overflow-hidden rounded-md border border-black bg-black text-white px-6 py-3 focus:outline-none hover:bg-rose-500 hover:border-rose-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            <span class="text-xs font-bold uppercase tracking-widest">Vibe Check</span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="pt-20">
      <!-- HERO SECTION -->
      <section class="min-h-[90vh] flex flex-col justify-center relative border-b border-black bg-[#FFFCF8] overflow-hidden">
         <!-- Dot Pattern Background -->
         <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

         <div class="max-w-[1440px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full z-10 py-20">
            <!-- Left: Typography -->
            <div class="text-center lg:text-left">

               
               <h1 class="text-6xl md:text-8xl lg:text-[6.5rem] leading-[0.95] font-serif mb-8 text-black tracking-tight">
                  We engineer <br/><span class="italic text-rose-500">the click.</span>
               </h1>

               <p class="text-xl text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light mb-10">
                  Stop swiping. Start connecting. We use psychometrics and curated events to put you in a room with people you'll actually like.
               </p>

               <div class="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6">
                  <NuxtLink to="/vibe-check" class="bg-black text-white px-12 py-5 rounded-md text-lg font-medium hover:bg-stone-800 transition-all w-full sm:w-auto min-w-[200px] text-center shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black">
                     Start Vibe Check
                  </NuxtLink>
                  <button @click="scrollToSection('process')" class="text-black font-bold uppercase tracking-widest text-sm hover:text-rose-500 transition-colors">
                     How does it work?
                  </button>
               </div>
            </div>

            <!-- Right: Visual (Match Simulation) -->
            <div class="relative hidden lg:flex items-center justify-center h-full min-h-[500px]">
               <!-- Floating Elements -->
               <div class="relative w-[450px] h-[550px]">
                  <!-- Back Card (Decorative) -->
                  <div class="absolute inset-0 bg-black translate-x-4 translate-y-4 rounded-3xl"></div>
                   
                  <!-- Main Card -->
                  <div class="absolute inset-0 bg-white border-2 border-black rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                     <!-- Header -->
                     <div class="flex justify-between items-center border-b border-black pb-4">
                        <div class="flex gap-2">
                           <div class="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
                           <div class="w-3 h-3 rounded-full bg-yellow-500 border border-black"></div>
                           <div class="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
                        </div>
                        <div class="text-xs font-mono uppercase">Match_Algorithm.exe</div>
                     </div>

                     <!-- Content -->
                     <div class="flex-1 flex flex-col items-center justify-center py-8">
                        <div class="relative flex items-center justify-center">
                           <!-- Connections Line -->
                           <svg class="absolute w-full top-1/2 -translate-y-1/2 text-rose-500" height="2" viewBox="0 0 200 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line x1="0" y1="1" x2="200" y2="1" stroke="currentColor" stroke-width="2" stroke-dasharray="8 8"/>
                           </svg>
                           
                           <!-- Avatar 1 -->
                           <div class="w-28 h-28 rounded-full border-2 border-black p-1 bg-white z-10 relative">
                              <img src="/ama_profile.png" class="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all"/>
                           </div>
                           
                           <!-- Match Badge -->
                           <div class="z-20 -mx-4 bg-rose-500 text-white border-2 border-black px-4 py-2 rounded-full font-bold text-xl shadow-[4px_4px_0px_0px_#000] animate-bounce">
                              94%
                           </div>

                           <!-- Avatar 2 -->
                           <div class="w-28 h-28 rounded-full border-2 border-black p-1 bg-white z-10 relative">
                              <img src="/kwame_profile.png" class="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all"/>
                           </div>
                        </div>

                        <div class="mt-8 text-center space-y-2">
                           <div class="bg-green-100 border border-black px-4 py-1 rounded-full text-xs font-bold text-green-800 inline-block">
                              ✓ VALUES ALIGNED
                           </div>
                           <div class="bg-blue-100 border border-black px-4 py-1 rounded-full text-xs font-bold text-blue-800 inline-block">
                              ✓ INTROVERT x EXTROVERT
                           </div>
                        </div>
                     </div>

                     <!-- Footer Action -->
                     <div class="border-t border-black pt-4">
                        <div class="w-full bg-black text-white text-center py-3 rounded-xl font-bold uppercase tracking-widest text-sm cursor-pointer hover:bg-rose-500 transition-colors">
                           Unlock Connection
                        </div>
                     </div>
                  </div>

                  <!-- Floating Notification -->
                  <div class="absolute -right-12 top-20 bg-white border-2 border-black p-4 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-[200px] z-30 rotate-6">
                     <div class="text-xs font-bold uppercase text-stone-500 mb-1">New Notification</div>
                     <div class="font-serif font-bold text-lg leading-tight">"You both love jazz & spicy food."</div>
                  </div>
               </div>
            </div>
         </div>

         <!-- Marquee -->
         <div class="absolute bottom-0 left-0 right-0 bg-[#F0FDF4] border-t border-black py-4 overflow-hidden flex whitespace-nowrap text-green-800">
            <div class="animate-marquee flex gap-12 text-sm font-mono font-bold uppercase tracking-widest items-center">
               <span>Next Event: Accra</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Dec 12</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Limited Spots</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Matchmaking Active</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Next Event: Accra</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Dec 12</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Limited Spots</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Matchmaking Active</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
            </div>
         </div>
      </section>

      <!-- MANIFESTO / PROBLEM -->
      <section id="manifesto" class="grid md:grid-cols-2 min-h-[85vh] border-b border-black">
         <div class="border-b md:border-b-0 md:border-r border-black p-12 lg:p-24 flex flex-col justify-center bg-[#FFF1F2]">
            <h2 class="text-4xl md:text-6xl font-serif mb-8 leading-tight text-rose-950">
               The internet broke dating. <br/>We're fixing it.
            </h2>
            <div class="w-24 h-1 bg-black mb-8"></div>
            <p class="text-lg text-rose-900 leading-relaxed font-light">
               Dating apps monetize your loneliness. They want you swiping, not dating. 
               <br/><br/>
               At <span class="font-bold">minutes2match</span>, we believe chemistry happens in person. But going out blindly is inefficient. 
               We bridge the gap by doing the screening first, then facilitating the meeting.
            </p>
         </div>
         <div class="relative min-h-[400px]">
            <!-- Updated Image: Black couple / Connection -->
            <img src="/manifesto_connection.png" alt="Real Connection" class="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            <div class="absolute bottom-8 left-8 bg-white text-black border border-black px-4 py-2 text-sm font-bold uppercase tracking-wider">
               Real Humans, Real Time
            </div>
         </div>
      </section>

      <!-- THE PROCESS SPLIT -->
      <section id="process" class="bg-white">
         <div class="border-b border-black p-12 lg:p-20 text-center bg-white">
            <h2 class="text-4xl md:text-5xl font-serif mb-4">Two Ways to Connect</h2>
            <p class="text-stone-500">Choose your path to finding love.</p>
         </div>

         <div class="grid md:grid-cols-2 border-b border-black">
            <!-- Path 1: Matching System -->
            <div class="p-12 lg:p-24 bg-[#F0FDF4] md:border-r border-black flex flex-col h-full">
               <div class="w-16 h-16 bg-green-100 rounded-full border border-black flex items-center justify-center text-3xl mb-8">
                  🧠
               </div>
               <h3 class="text-3xl font-serif font-bold mb-8">The Matching System</h3>
               
               <div class="space-y-8 flex-1">
                  <!-- Step 1 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Take the Vibe Check</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           Answer our psychometric test to map your personality values. No bios, just science.
                        </p>
                     </div>
                  </div>
                  
                  <!-- Step 2 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Get Notified</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           You'll get a notification when we find a 90%+ compatible match.
                        </p>
                     </div>
                  </div>
                  
                  <!-- Step 3 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Unlock & Connect</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           Make a small payment to unlock their profile and start chatting directly.
                        </p>
                     </div>
                  </div>
               </div>
               
               <div class="mt-12">
                  <NuxtLink to="/vibe-check" class="w-full block bg-white border border-black text-center py-4 font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                     Start Matching
                  </NuxtLink>
               </div>
            </div>

            <!-- Path 2: Speed Dating -->
            <div class="p-12 lg:p-24 bg-[#EFF6FF] flex flex-col h-full">
               <div class="w-16 h-16 bg-blue-100 rounded-full border border-black flex items-center justify-center text-3xl mb-8">
                  🥂
               </div>
               <h3 class="text-3xl font-serif font-bold mb-8">Speed Dating Events</h3>
               
               <div class="space-y-8 flex-1">
                  <!-- Step 1 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Get Invited</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           Special invites are sent to groups with similar interests and demographics.
                        </p>
                     </div>
                  </div>
                  
                  <!-- Step 2 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Secure Your Spot</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           Purchase a ticket to confirm your attendance. Spaces are strictly limited.
                        </p>
                     </div>
                  </div>
                  
                  <!-- Step 3 -->
                  <div class="flex gap-6 items-start">
                     <span class="font-bold text-lg font-serif italic bg-white border border-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                     <div>
                        <h4 class="font-bold text-lg mb-2">Show Up & Vibe</h4>
                        <p class="text-stone-600 leading-relaxed text-sm">
                           Arrive at the curated venue. We facilitate the intros, you bring the charm.
                        </p>
                     </div>
                  </div>
               </div>
               
               <div class="mt-12">
                  <NuxtLink to="/vibe-check" class="w-full block bg-white border border-black text-center py-4 font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                     Join Event Waitlist
                  </NuxtLink>
               </div>
            </div>
         </div>
      </section>

      <!-- SOCIAL PROOF / STATS -->
      <section class="bg-stone-50 border-b border-black py-24 px-6 text-center">
         <div class="max-w-6xl mx-auto">
            <h2 class="text-4xl md:text-5xl font-serif italic mb-20 text-black leading-tight">
               "Finally, dating that feels<br class="hidden md:block"/> like real life."
            </h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0 md:divide-x divide-black/20 md:divide-black border-t border-b border-black py-12">
               <div class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">94%</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black">Match Accuracy</div>
               </div>
               <div class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">12+</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black">Events Hosted</div>
               </div>
               <div class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">350+</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black">Connections Made</div>
               </div>
               <div class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">0</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black">Catfish Reports</div>
               </div>
            </div>
         </div>
      </section>

      <!-- FINAL CTA -->
      <section class="py-32 px-6 flex flex-col items-center justify-center text-center bg-[#FFFCF8] border-b border-black">
         <div class="max-w-3xl">
            <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-[0.9]">
               Don't leave love<br/>to chance.
            </h2>
            <p class="text-xl text-stone-600 mb-12 font-light">
               Join the curated community of intentional daters in Accra. It starts with knowing yourself.
            </p>
            
            <div class="flex justify-center">
               <NuxtLink to="/vibe-check" class="bg-rose-500 text-white px-12 py-6 rounded-md text-xl font-bold tracking-wide hover:bg-rose-600 transition-all shadow-[8px_8px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000] border-2 border-black inline-flex items-center gap-3">
                  Start Vibe Check
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
               </NuxtLink>
            </div>
            
            <div class="mt-8 flex items-center justify-center gap-2 text-sm text-stone-500">
               <div class="flex -space-x-2">
                  <div class="w-6 h-6 rounded-full bg-stone-200 border border-white"></div>
                  <div class="w-6 h-6 rounded-full bg-stone-300 border border-white"></div>
                  <div class="w-6 h-6 rounded-full bg-stone-400 border border-white"></div>
               </div>
               <span>Join 2,400+ others in Accra</span>
            </div>
         </div>
      </section>

      <!-- STORIES -->
      <section id="stories" class="border-b border-black grid md:grid-cols-2">
          <div class="p-12 lg:p-24 bg-stone-50 md:border-r border-black">
              <h3 class="text-3xl font-serif mb-6">"I met my husband at the October event."</h3>
              <p class="text-stone-600 leading-relaxed mb-6">
                 "I was skeptical about speed dating, but the vibe check meant everyone there was actually my type. We skipped the small talk and just connected."
              </p>
              <div class="font-bold flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                    <img src="/ama_profile.png" class="w-full h-full object-cover">
                 </div>
                 <span>Ama, 29</span>
              </div>
          </div>
          <div class="p-12 lg:p-24 bg-white">
              <h3 class="text-3xl font-serif mb-6">"Efficient, safe, and surprisingly fun."</h3>
              <p class="text-stone-600 leading-relaxed mb-6">
                 "The psychometric matching works. I talked to 5 people and clicked with 3 of them. The app made following up super easy without giving out my number to everyone."
              </p>
              <div class="font-bold flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                    <img src="/kwame_profile.png" class="w-full h-full object-cover">
                 </div>
                 <span>Kwame, 31</span>
              </div>
          </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="bg-black text-white pt-24 pb-12 px-6 overflow-hidden">
       <div class="max-w-[1440px] mx-auto">
          <!-- Top Section -->
          <div class="grid md:grid-cols-2 gap-16 mb-24 border-b border-white/20 pb-24">
             <div>
                <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-none">
                   Ready to find <br/><span class="italic text-rose-500">your person?</span>
                </h2>
                <NuxtLink to="/vibe-check" class="inline-block bg-white text-black px-12 py-5 rounded-md text-lg font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                   Start Vibe Check
                </NuxtLink>
             </div>
             
             <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-stone-500 mb-6 text-xs">Company</h4>
                   <ul class="space-y-4 text-sm font-medium">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Manifesto</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">How it Works</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Stories</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Events</a></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-stone-500 mb-6 text-xs">Social</h4>
                   <ul class="space-y-4 text-sm font-medium">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Instagram</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Twitter / X</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">TikTok</a></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest text-stone-500 mb-6 text-xs">Legal</h4>
                   <ul class="space-y-4 text-sm font-medium">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Terms</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Privacy</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Safety</a></li>
                   </ul>
                </div>
             </div>
          </div>

          <!-- Bottom Watermark -->
          <div class="flex flex-col md:flex-row justify-between items-end">
             <div class="text-[12vw] leading-none font-serif font-bold italic text-stone-900 select-none">
                minutes2match.
             </div>
             <div class="text-xs font-mono text-stone-600 mb-4 md:mb-8 text-right">
                © 2024 Minutes2Match Inc. • Accra, GH <br/>
                All Rights Reserved.
             </div>
          </div>
       </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Minutes 2 Match - Real Connections',
  meta: [
    { name: 'description', content: 'We engineer the click. Psychometric matching + real world events.' }
  ]
})

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style>
/* Utilities */
.font-serif {
  font-family: 'Playfair Display', serif;
}
.font-sans {
  font-family: 'Inter', sans-serif;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 20s linear infinite;
  display: flex;
  min-width: 200%;
}
</style>
