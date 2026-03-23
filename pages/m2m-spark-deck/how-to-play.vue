<template>
  <div class="min-h-screen bg-white dark:bg-stone-950 text-black dark:text-stone-50 font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden transition-colors duration-300">
    <!-- Meta/Head -->
    <Head>
      <Title>How to Play | Minutes 2 Match</Title>
      <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    </Head>

    <!-- Navigation (Mirrors main site nav but simplified for scanning) -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-16 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        <NuxtLink to="/" class="text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
          ← BACK TO LABS
        </NuxtLink>
      </div>
    </nav>

    <main class="pt-20 md:pt-28">
      
      <!-- HERO -->
      <section class="border-b border-black dark:border-stone-800 bg-[#FFFCF8] dark:bg-stone-950 py-16 md:py-32 px-6 relative overflow-hidden transition-colors duration-300">
         <!-- Dot Pattern Background -->
         <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
         
         <div class="max-w-4xl mx-auto text-center relative z-10 w-full py-10">
            <div class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full self-start mb-6 md:mb-8 shadow-[2px_2px_0px_#e11d48]">
               Official Instruction Guide
            </div>
            
            <h1 class="text-5xl md:text-7xl lg:text-[7.5rem] leading-[0.95] font-serif mb-8 text-black dark:text-stone-50 tracking-tight">
               How to play <br/><span class="italic text-rose-500">the deck.</span>
            </h1>
            
            <p class="text-xl md:text-2xl text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed font-light mb-10">
               Bypass the small talk. Build the fire. Don't get burned. Follow the rules for a high-fidelity connection experience.
            </p>
         </div>
      </section>

      <!-- THE THREE LEVELS (Uses Process Card Pattern) -->
      <section class="py-24 md:py-32 px-6 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800 overflow-hidden">
         <div class="max-w-6xl mx-auto relative">
            <div class="text-center mb-16 md:mb-24 relative z-10">
               <h2 class="text-4xl md:text-6xl font-serif mb-6 dark:text-stone-50 text-black tracking-tight">The Three Levels</h2>
               <p class="text-stone-500 font-medium text-xl max-w-2xl mx-auto">Vibe, align, and test boundaries.</p>
            </div>
            
            <div class="grid lg:grid-cols-3 gap-8 relative z-10">
               <!-- Level 1 -->
               <div class="group relative">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#FFF9F2] dark:bg-[#FFF9F2]/5 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col p-10 md:p-14 transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-16 h-16 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-3xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        ⚡
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">Immediate</span>
                     <h3 class="text-3xl md:text-4xl font-serif font-bold mb-6 text-black dark:text-white leading-none">The Spark</h3>
                     <p class="text-stone-700 dark:text-stone-300 flex-1 text-lg leading-relaxed">
                        Light, fun, and fast. Spend about 15–20 minutes here mapping out basic compatibilities and getting comfortable.
                     </p>
                  </div>
               </div>
               
               <!-- Level 2 -->
               <div class="group relative">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#FFF1F2] dark:bg-[#FFF1F2]/5 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col p-10 md:p-14 transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-16 h-16 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-3xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🔥
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">Ambition</span>
                     <h3 class="text-3xl md:text-4xl font-serif font-bold mb-6 text-black dark:text-white leading-none">The Fire</h3>
                     <p class="text-stone-700 dark:text-stone-300 flex-1 text-lg leading-relaxed">
                        See if your lives actually align. Dive into past experiences, future goals, and non-negotiables. This is the "meat" of the date.
                     </p>
                  </div>
               </div>

               <!-- Level 3 -->
               <div class="group relative">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#FFF1F4] dark:bg-[#FFF1F4]/5 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col p-10 md:p-14 transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-16 h-16 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-3xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🌋
                     </div>
                     <span class="inline-block px-3 py-1 bg-rose-500 text-white dark:bg-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">High Stakes</span>
                     <h3 class="text-3xl md:text-4xl font-serif font-bold mb-6 text-black dark:text-white leading-none">The Inferno</h3>
                     <p class="text-stone-700 dark:text-stone-300 flex-1 text-lg leading-relaxed">
                        Unfiltered honesty and spicy hypotheticals. Ensure consent before drawing. Use with caution (and a full drink).
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- DIGITAL SYNC (Uses Manifesto Layout Pattern) -->
      <section class="grid md:grid-cols-2 min-h-[70vh] border-b border-black dark:border-stone-800">
         <div class="border-b md:border-b-0 md:border-r border-black dark:border-stone-800 p-12 lg:p-24 flex flex-col justify-center bg-[#F0FDF4] dark:bg-emerald-950/20">
            <h2 class="text-4xl md:text-6xl font-serif mb-8 leading-tight text-black dark:text-stone-50">
               Sync to reality.
            </h2>
            <div class="w-24 h-1 bg-black dark:bg-white mb-8"></div>
            <p class="text-lg text-stone-800 dark:text-stone-200 leading-relaxed font-light mb-12">
               Your table session directly connects to the broader universe of Minutes 2 Match. <span class="font-bold">Scan the physical divider cards</span> to trigger your digital enhancements.
            </p>
            <div class="space-y-6">
                <!-- Sync Items leveraging the standard step numbers -->
                <div class="flex gap-6 items-start">
                  <span class="font-bold text-lg border-2 border-black dark:border-stone-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">📻</span>
                  <div>
                     <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Mood Radio</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-md">
                        Trigger curated Spotify playlists engineered specifically to match each level's psychological vibe.
                     </p>
                  </div>
               </div>
               <div class="flex gap-6 items-start">
                  <span class="font-bold text-lg border-2 border-black dark:border-stone-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">📊</span>
                  <div>
                     <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Live Vibe Polls</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-md">
                        Vote on the exact same "Gatekeeper" questions other couples in Accra are answering right now.
                     </p>
                  </div>
               </div>
               <div class="flex gap-6 items-start">
                  <span class="font-bold text-lg border-2 border-black dark:border-stone-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-stone-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">🎟️</span>
                  <div>
                     <h4 class="font-bold text-xl mb-2 dark:text-stone-100">The Exit Scanner</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-md">
                        Scan the final card to instantly unlock an exclusive Round 2 discount at our partnered venues.
                     </p>
                  </div>
               </div>
            </div>
         </div>
         <div class="relative min-h-[400px] bg-stone-100 dark:bg-stone-900 overflow-hidden flex items-center justify-center">
            <!-- Simulated Sync Image -->
            <NuxtImg format="webp" src="/manifesto_connection.png" alt="Real Connection" class="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            <div class="absolute bottom-8 left-8 bg-white dark:bg-stone-900 text-black dark:text-white border border-black dark:border-stone-600 px-4 py-2 text-sm font-bold uppercase tracking-wider">
               Digital Enhancements
            </div>
         </div>
      </section>

      <!-- RULES OF ENGAGEMENT -->
      <section class="py-24 md:py-32 px-6 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800">
         <div class="max-w-4xl mx-auto">
            <h2 class="text-4xl md:text-6xl font-serif mb-16 dark:text-stone-50 text-black tracking-tight text-center md:text-left">Rules of Engagement</h2>
            
            <div class="space-y-12">
               <div class="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <span class="font-bold text-2xl font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">1</span>
                  <div>
                     <h4 class="font-bold text-2xl mb-3 dark:text-stone-100">Alternating Draws</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-lg">
                        Person A draws a card and asks Person B. Person B answers fully, then Person A shares their own take on the exact same question. Switch roles for the next card.
                     </p>
                  </div>
               </div>

               <div class="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <span class="font-bold text-2xl font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">2</span>
                  <div>
                     <h4 class="font-bold text-2xl mb-3 dark:text-stone-100">The "Nudge"</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-lg">
                        If an answer feels too safe, use the Nudge: just ask <span class="font-serif italic font-medium">"Why?"</span> to politely force them to dig deeper.
                     </p>
                  </div>
               </div>

               <div class="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <span class="font-bold text-2xl font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">3</span>
                  <div>
                     <h4 class="font-bold text-2xl mb-3 dark:text-stone-100">The Wildcard</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-lg">
                        You have one Wildcard per level. Use it to ask the other person absolutely <span class="italic font-bold">anything</span>, and they must answer truthfully.
                     </p>
                  </div>
               </div>

               <div class="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <span class="font-bold text-2xl font-serif italic bg-rose-500 text-white border-2 border-black dark:border-stone-600 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">4</span>
                  <div>
                     <h4 class="font-bold text-2xl mb-3 text-rose-500">Phones Down</h4>
                     <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-lg">
                        Once the Spotify playlist is active and the poll is answered, put your phones face-down. The absolute best connections happen intimately offline.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- FINAL CTA -->
      <section class="py-24 md:py-32 px-6 flex flex-col items-center justify-center text-center bg-[#F0FDF4] dark:bg-emerald-950/20">
         <div class="max-w-3xl">
            <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-[0.9]">
               Want the<br/>deck?
            </h2>
            <p class="text-xl text-stone-600 dark:text-stone-400 mb-12 font-light">
               Get your own Spark Deck shipped locally in Accra. Skip the small talk at your next event.
            </p>
            
            <div class="flex justify-center">
               <a href="https://minutes2match.com/spark-deck" target="_blank" rel="noopener noreferrer" class="bg-black text-white dark:bg-white dark:text-black px-12 py-6 rounded-md text-xl font-bold tracking-wide hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_#000000] border-2 border-black inline-flex items-center gap-3">
                  Shop Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
               </a>
            </div>
         </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

useHead({ title: 'How to Play | Minutes 2 Match' })

onMounted(() => {
  if (typeof window !== 'undefined') {
    const viewKey = 'm2m_viewed_how_to_play'
    if (!localStorage.getItem(viewKey)) {
      localStorage.setItem(viewKey, 'true')
      
      // Fire and forget Discord webhook
      $fetch('/api/sync/notify-player', {
        method: 'POST',
        body: { action: 'instructions_viewed' }
      }).catch(() => {})
    }
  }
})
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
