<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 font-sans text-black dark:text-stone-200 selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden transition-colors duration-300">
    <Head>
      <Title>The M2M Spark Deck | Minutes 2 Match</Title>
      <Meta name="description" content="54 Cards, 3 Levels, 1 Connection. Ignite genuine chemistry with curated questions designed to bypass the surface." />
    </Head>

    <!-- Navigation (Standard M2M Nav) -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-20 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>

        <div class="hidden md:flex items-center gap-10 text-sm font-bold text-stone-900 dark:text-stone-200">
          <NuxtLink to="/#manifesto" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Manifesto</NuxtLink>
          <NuxtLink to="/#process" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Process</NuxtLink>
          <NuxtLink to="/vouch" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-rose-500 dark:hover:text-stone-300 dark:hover:text-rose-400 transition-colors">Pricing</NuxtLink>
        </div>

        <div class="flex items-center gap-4 md:gap-8">
          <NuxtLink to="/login" class="hidden md:block text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
             MEMBER LOGIN
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="hidden md:inline-flex bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-2.5 rounded-md border border-black dark:border-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow-[4px_4px_0px_0px_#E7E5E4] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            VIBE CHECK
          </NuxtLink>

          <NuxtLink to="/vibe-check" class="md:hidden bg-black dark:bg-stone-100 text-white dark:text-black px-4 py-2.5 rounded-lg text-[10px] font-bold border border-black dark:border-stone-600 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest">
            JOIN
          </NuxtLink>
          
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-2 border-black dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"></span>
          </button>
        </div>
      </div>
      
      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div v-show="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-[#FFFCF8] dark:bg-stone-900 border-b border-black dark:border-stone-800 shadow-lg">
          <div class="px-6 py-6 space-y-4">
            <NuxtLink to="/" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">Home</NuxtLink>
            <NuxtLink to="/vouch" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">Vouch</NuxtLink>
            <NuxtLink to="/shoot-your-shot" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">Shoot Your Shot</NuxtLink>
            <NuxtLink to="/pricing" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">Pricing</NuxtLink>
            <NuxtLink to="/vibe-check" @click="mobileMenuOpen = false" class="block w-full text-center bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm mt-4">START VIBE CHECK</NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Dot Pattern Background (matching pricing) -->
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <main class="pt-24 pb-12 px-3 md:px-6 max-w-[1440px] mx-auto relative z-10">
      <!-- HERO SECTION -->
      <div class="text-center mb-12 md:mb-16 pt-8">
        <h1 v-scroll-animate="{ animation: 'fade-up' }" class="text-5xl md:text-7xl font-serif mb-4 leading-tight dark:text-stone-50 tracking-tight">
          Ignite the <span class="italic text-rose-500">connection.</span>
        </h1>
        <p v-scroll-animate="{ animation: 'fade-up', delay: 100 }" class="text-lg md:text-xl text-stone-500 font-light max-w-2xl mx-auto">
          54 curated questions designed to bypass the surface and fuel genuine chemistry.
        </p>
      </div>

      <!-- Main Product Display: Expanded Card Stack with Parallax -->
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center mb-16 md:px-0">
        <!-- Dynamic Stack Column -->
        <div 
          v-scroll-animate="{ animation: 'fade-right' }" 
          class="relative h-[480px] sm:h-[500px] md:h-[600px] group cursor-default perspective-2000 overflow-visible"
          @mousemove="handleStackParallax"
          @mouseleave="resetStackParallax"
        >
          <!-- The Stack Foundation -->
          <div class="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out" :style="stackStyles">
            
            <!-- Bottom Card (Inferno) -->
            <div class="absolute w-48 sm:w-64 md:w-72 h-[300px] sm:h-[360px] md:h-[400px] bg-[#F43F5E] border-2 border-black rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl transition-all duration-700 origin-center z-10 -translate-x-12 sm:-translate-x-24 -translate-y-8 sm:-translate-y-16 -rotate-[20deg] sm:-rotate-[28deg] group-hover:-translate-x-16 sm:group-hover:-translate-x-32 group-hover:-rotate-[25deg] sm:group-hover:-rotate-[32deg]">
               <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/linen.png');"></div>
               <div class="absolute top-4 sm:top-8 left-4 sm:left-8 text-white/40 text-lg sm:text-xl font-serif italic">3</div>
               <div class="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 text-white/10 text-[10px] sm:text-sm font-bold uppercase tracking-widest hidden sm:block">Inferno</div>
            </div>

            <!-- Middle Card (Fire) -->
            <div class="absolute w-48 sm:w-64 md:w-72 h-[300px] sm:h-[360px] md:h-[400px] bg-[#44403C] border-2 border-black rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl transition-all duration-700 origin-center z-20 -translate-y-10 sm:-translate-y-20 rotate-[1deg] sm:rotate-[2deg] group-hover:-translate-y-14 sm:group-hover:-translate-y-28 group-hover:rotate-[3deg] sm:group-hover:rotate-[4deg]">
               <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/linen.png');"></div>
               <div class="absolute top-4 sm:top-8 left-4 sm:left-8 text-white/40 text-lg sm:text-xl font-serif italic">2</div>
               <div class="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 text-white/10 text-[10px] sm:text-sm font-bold uppercase tracking-widest hidden sm:block">Fire</div>
            </div>

            <!-- Top Card (Spark) -->
            <div class="absolute w-48 sm:w-64 md:w-72 h-[300px] sm:h-[360px] md:h-[400px] bg-[#F5F5F4] border-2 border-black rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl transition-all duration-700 origin-center z-30 translate-x-14 sm:translate-x-28 -translate-y-4 sm:-translate-y-10 rotate-[15deg] sm:rotate-[24deg] group-hover:translate-x-18 sm:group-hover:translate-x-36 group-hover:rotate-[18deg] sm:group-hover:rotate-[28deg]">
               <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/linen.png');"></div>
               <div class="absolute top-4 sm:top-8 left-4 sm:left-8 text-black/20 text-lg sm:text-xl font-serif italic">1</div>
               <div class="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 text-black/5 text-[10px] sm:text-sm font-bold uppercase tracking-widest hidden sm:block">Spark</div>
            </div>

            <!-- The Tuck Box -->
            <div class="absolute w-44 sm:w-56 md:w-64 h-[310px] sm:h-[370px] md:h-[410px] bg-black border-2 border-stone-800 rounded-xl sm:rounded-2xl shadow-[20px_20px_60px_rgba(0,0,0,0.5)] md:shadow-[30px_30px_80px_rgba(0,0,0,0.6)] z-40 transition-all duration-500 hover:scale-[1.02] flex flex-col items-center justify-center p-6 sm:p-10 text-center">
               <div class="absolute inset-x-0 top-0 h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
               <div class="text-[7px] sm:text-[9px] font-bold tracking-[0.4em] sm:tracking-[0.5em] uppercase text-rose-500 mb-4 sm:mb-8">Explore • Reflect • Spark</div>
               <div class="text-xl sm:text-3xl font-serif text-white leading-tight mb-1 sm:mb-2 tracking-tighter">THE<br/>M2M<br/>SPARK<br/>DECK</div>
               <div class="mt-6 sm:mt-10 border-t border-white/10 pt-4 sm:pt-6 w-full">
                  <div class="text-[7px] sm:text-[8px] font-bold text-stone-500 uppercase tracking-widest leading-relaxed">54 Cards to Ignite Connection</div>
               </div>
               <div class="absolute bottom-6 sm:bottom-8 flex justify-center gap-1 sm:gap-1.5">
                  <div v-for="i in 3" :key="i" class="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full" :class="i === 3 ? 'bg-rose-500' : 'bg-stone-800'"></div>
               </div>
            </div>

          </div>
        </div>

        <!-- Detail Column -->
        <div v-scroll-animate="{ animation: 'fade-left' }" class="space-y-6">
           <div class="bg-white dark:bg-stone-900 rounded-3xl border-2 border-black dark:border-stone-800 p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
              <div class="flex justify-between items-start mb-6">
                 <div>
                    <h3 class="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500 mb-2">Physical Product</h3>
                    <h2 class="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-none">The Spark Deck</h2>
                 </div>
              </div>

              <div class="mb-6 md:mb-8">
                 <div class="flex items-baseline gap-1">
                    <span class="text-xl font-serif opacity-40">GH₵</span>
                    <span class="text-5xl md:text-7xl font-serif font-bold text-rose-500">250</span>
                 </div>
                 <p class="text-sm md:text-base text-stone-500 mt-3 font-light max-w-sm leading-relaxed">Premium air-cushion finish, linen-textured cardstock. Designed for the bold.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                 <div class="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 flex items-center gap-4 sm:block">
                    <span class="text-2xl mb-0 sm:mb-2">🧧</span>
                    <div>
                       <p class="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Materials</p>
                       <p class="text-xs font-bold">310gsm Linen</p>
                    </div>
                 </div>
                 <div class="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 flex items-center gap-4 sm:block">
                    <span class="text-2xl mb-0 sm:mb-2">📦</span>
                    <div>
                       <p class="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Packaging</p>
                       <p class="text-xs font-bold">Tuck Box</p>
                    </div>
                 </div>
              </div>

              <button @click="scrollToSection('purchase')" class="w-full py-5 bg-black dark:bg-stone-100 text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all active:scale-[0.98] shadow-lg">
                SECURE YOUR DECK
              </button>
           </div>
        </div>
      </div>

      <!-- Levels Section: Orbital Path Design -->
      <div class="max-w-5xl mx-auto mb-32 pt-16 px-4">
         <div class="text-center mb-24">
            <h2 v-scroll-animate class="text-3xl md:text-5xl font-serif mb-4 dark:text-stone-50">The Journey to Intimacy</h2>
            <p v-scroll-animate="{ delay: 100 }" class="text-stone-500 max-w-md mx-auto leading-relaxed">A calculated descent from light curiosity to high-stakes truth.</p>
         </div>

         <div class="relative space-y-24 md:space-y-0 md:h-[900px]">
            <!-- Desktop Path Line (SVG) -->
            <div class="absolute inset-0 hidden md:block pointer-events-none opacity-20 dark:opacity-40">
               <svg class="w-full h-full" viewBox="0 0 1000 900" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M250 150 C 600 200, 700 400, 500 500 S 200 700, 450 850" stroke="currentColor" stroke-width="2" stroke-dasharray="8 8" class="text-stone-400"/>
               </svg>
            </div>

            <!-- Level 1: The Spark -->
            <div v-scroll-animate="{ animation: 'fade-right' }" 
               class="relative md:absolute md:top-0 md:left-[10%] flex flex-col md:flex-row items-center gap-8 group">
               <div class="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-emerald-500 bg-white dark:bg-stone-900 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110">
                  <div class="text-center">
                     <div class="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">Level</div>
                     <div class="text-6xl font-serif text-black dark:text-white">01</div>
                  </div>
                  <!-- Inner Texture -->
                  <div class="absolute inset-4 rounded-full border border-emerald-500/10 animate-spin-slow"></div>
               </div>
               <div class="text-center md:text-left max-w-xs">
                  <h3 class="text-2xl font-serif font-bold mb-2">The Spark</h3>
                  <p class="text-stone-400 text-xs leading-relaxed italic">"Light, fun, and immediate vibe-checking. Perfect for the first 5 minutes."</p>
               </div>
            </div>

            <!-- Level 2: The Fire -->
            <div v-scroll-animate="{ animation: 'fade-left' }" 
               class="relative md:absolute md:top-[35%] md:right-[10%] flex flex-col md:flex-row-reverse items-center gap-8 group">
               <div class="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-orange-500 bg-white dark:bg-stone-900 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110">
                  <div class="text-center">
                     <div class="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-2">Level</div>
                     <div class="text-6xl font-serif text-black dark:text-white">02</div>
                  </div>
                  <div class="absolute inset-4 rounded-full border border-orange-500/10 animate-reverse-spin"></div>
               </div>
               <div class="text-center md:text-right max-w-xs">
                  <h3 class="text-2xl font-serif font-bold mb-2">The Fire</h3>
                  <p class="text-stone-400 text-xs leading-relaxed italic">"Ambition, history, and values. This is where you see if your lives actually align."</p>
               </div>
            </div>

            <!-- Level 3: The Inferno -->
            <div v-scroll-animate="{ animation: 'fade-up' }" 
               class="relative md:absolute md:bottom-0 md:left-[35%] flex flex-col md:flex-row items-center gap-8 group">
               <div class="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-rose-500 bg-black shadow-[0_0_60px_rgba(244,63,94,0.3)] flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110">
                  <div class="text-center">
                     <div class="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-2">Level</div>
                     <div class="text-6xl font-serif text-white">03</div>
                  </div>
                  <div class="absolute inset-2 rounded-full border-2 border-dashed border-rose-500/20 animate-spin-slow"></div>
               </div>
               <div class="text-center md:text-left max-w-xs">
                  <h3 class="text-2xl font-serif font-bold mb-2">The Inferno</h3>
                  <p class="text-stone-400 text-xs leading-relaxed italic">"High stakes, dealbreakers, and spicy hypotheticals. Use with caution."</p>
               </div>
            </div>
         </div>
      </div>

      <!-- Digital Sync Section -->
      <section class="max-w-6xl mx-auto mb-24 md:px-6">
        <div class="grid md:grid-cols-2 gap-px bg-stone-200 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xl">
           <div v-scroll-animate="{ animation: 'fade-right' }" class="bg-white dark:bg-stone-900 p-8 md:p-16">
              <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-emerald-100 dark:border-emerald-800">
                 <span class="text-xl">📊</span>
              </div>
              <h3 class="text-xl font-bold uppercase tracking-widest mb-4">Live Vibe Poll</h3>
              <p class="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 md:mb-8">
                 Every level includes cards with QR codes. Scan them to unlock **Live Vibe Polls**—see how hundreds of other M2M members answered the same question in real-time.
              </p>
              <div class="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                 <span>Digital Feature</span>
                 <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              </div>
           </div>
           <div v-scroll-animate="{ animation: 'fade-left' }" class="bg-stone-50 dark:bg-stone-950 p-8 md:p-16">
              <div class="w-12 h-12 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-orange-100 dark:border-orange-800">
                 <span class="text-xl">🎵</span>
              </div>
              <h3 class="text-xl font-bold uppercase tracking-widest mb-4">Mood Radio</h3>
              <p class="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 md:mb-8">
                 Shift the energy of the room instantly. Level 2 cards trigger curated **Spotify Snippets** designed to match the specific "vibe" of your current stage of conversation.
              </p>
              <div class="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                 <span>Sync via M2M App</span>
              </div>
           </div>
        </div>
      </section>

      <!-- Preview Section (Tactile Flip Cards) -->
      <section id="preview" class="py-16 md:py-24 bg-white dark:bg-stone-900 w-full mb-16 md:px-6">
        <div class="max-w-[1440px] mx-auto">
          <div class="text-center mb-16 md:mb-20 px-4 md:px-6">
            <h2 v-scroll-animate class="text-3xl md:text-5xl font-serif mb-4 dark:text-stone-50 text-stone-900 tracking-tight">Peek inside the deck</h2>
            <p v-scroll-animate="{ delay: 100 }" class="text-stone-500 font-medium text-sm md:text-base">Flip any card to reveal its prompt.</p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-8 max-w-6xl mx-auto">
             <div v-for="(card, i) in previewCards" :key="i" 
                v-scroll-animate="{ animation: 'fade-up', delay: i * 150 }"
                class="relative group aspect-[2.5/3.5] perspective-1000 max-w-[280px] mx-auto w-full"
                :style="{ transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)` }">
               
               <div class="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180 cursor-help">
                 
                 <!-- BACK FACE -->
                 <div class="absolute inset-0 w-full h-full border-2 border-black dark:border-stone-700 rounded-[2rem] p-8 flex flex-col items-center justify-center backface-hidden shadow-[8px_8px_0px_0px]"
                    :class="card.bgBack"
                    :style="{ boxShadow: `8px 8px 0px 0px ${card.shadow}` }">
                    <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/linen.png');"></div>
                    
                    <div class="relative z-10 flex flex-col items-center">
                       <div class="w-16 h-16 bg-black/5 dark:bg-white/10 border-2 border-current rounded-full flex items-center justify-center mb-6 backdrop-blur-sm" :class="card.textBack">
                          <span class="text-2xl filter drop-shadow-md group-hover:scale-125 transition-all duration-700">{{ card.icon }}</span>
                       </div>
                       <div class="text-[10px] font-bold tracking-[0.4em] uppercase mb-1" :class="card.textBack">Level {{ card.level }}</div>
                       <div class="text-[8px] font-bold uppercase tracking-widest opacity-60" :class="card.textBack">{{ card.name }}</div>
                    </div>

                    <div class="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm opacity-30" :class="card.borderBack"></div>
                    <div class="absolute top-6 right-6 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm opacity-30" :class="card.borderBack"></div>
                    <div class="absolute bottom-6 left-6 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm opacity-30" :class="card.borderBack"></div>
                    <div class="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 rounded-br-sm opacity-30" :class="card.borderBack"></div>
                 </div>

                 <!-- FRONT FACE -->
                 <div class="absolute inset-0 w-full h-full bg-[#FFFCF8] dark:bg-stone-800 border-2 border-black dark:border-stone-700 rounded-[2rem] p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-[0px_20px_40px_rgba(0,0,0,0.1)]">
                   <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('https://www.transparenttextures.com/patterns/linen.png');"></div>
                   <div class="flex justify-between items-start">
                      <div class="text-[10px] font-bold tracking-tighter uppercase leading-none text-stone-400">M2M<br/>Spark</div>
                      <div class="text-lg font-serif italic" :class="card.text">{{ card.level }}</div>
                   </div>
                   <div class="flex-1 flex items-center justify-center py-4">
                      <p class="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight text-center">"{{ card.question }}"</p>
                   </div>
                   <div class="flex justify-between items-end rotate-180">
                      <div class="text-[10px] font-bold tracking-tighter uppercase leading-none text-stone-400">M2M<br/>Spark</div>
                      <div class="text-lg font-serif italic" :class="card.text">{{ card.level }}</div>
                   </div>
                   <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-stone-300 dark:text-stone-600 tracking-[0.3em] uppercase">{{ card.name }}</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      <!-- Lifestyle Section (Exactly like Lifestyle Cards) -->
      <section class="py-16 px-3 bg-[#FFFCF8] dark:bg-stone-950 mb-16">
        <div class="max-w-[1440px] mx-auto text-center mb-16">
          <h2 v-scroll-animate class="text-3xl md:text-5xl font-serif mb-4 dark:text-stone-50">Designed for the <span class="italic text-rose-500">unfiltered.</span></h2>
          <p class="text-stone-500">From the first date to the inner circle.</p>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div v-for="(scenario, i) in scenarios" :key="i" v-scroll-animate="{ animation: 'fade-up', delay: i * 100 }" 
            class="group bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-800 p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
            <div class="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/50 group-hover:bg-rose-500 group-hover:text-white transition-all text-rose-600 dark:text-rose-400 group-hover:scale-110" v-html="scenario.svg"></div>
            <h4 class="font-bold uppercase tracking-[0.2em] text-xs mb-3 text-stone-900 dark:text-stone-100">{{ scenario.title }}</h4>
            <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{{ scenario.desc }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ Section (Refined Accordion) -->
      <section class="max-w-3xl mx-auto mb-24 px-3">
        <h2 v-scroll-animate class="text-3xl md:text-5xl font-serif mb-12 text-center tracking-tight">Frequently Asked</h2>
        <div class="space-y-4">
          <div v-for="(faq, i) in faqs" :key="i" v-scroll-animate="{ animation: 'fade-up', delay: i * 50 }" class="border-2 border-black dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
            <button @click="toggleFaq(i)" class="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              <span class="font-bold text-xs uppercase tracking-[0.2em]">{{ faq.q }}</span>
              <span class="text-2xl transition-transform duration-300" :class="activeFaq === i ? 'rotate-45' : ''">+</span>
            </button>
            <div v-show="activeFaq === i" class="px-8 pb-8 text-stone-500 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </section>

      <!-- Final Purchase CTA -->
      <section id="purchase" class="max-w-4xl mx-auto mb-20 md:px-6">
        <div class="bg-black rounded-3xl p-8 md:p-24 text-center relative overflow-hidden shadow-[16px_16px_0px_0px_rgba(244,63,94,1)] border-2 border-black">
          <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px;"></div>
          <h2 class="text-3xl md:text-6xl font-serif mb-6 md:mb-8 leading-tight tracking-tight !text-white">Secure your spark.</h2>
          <p class="text-base md:text-lg text-white opacity-80 mb-10 md:mb-12 max-w-xl mx-auto font-light leading-relaxed">Stop wading in the shallow end. Defy the silence and pull the truth out of the room.</p>
          
          <div class="flex flex-col items-center gap-8">
             <div class="flex flex-col md:flex-row items-center justify-center gap-6 w-full md:w-auto">
                <button class="w-full md:w-auto px-12 py-5 bg-white dark:bg-stone-900 text-black dark:text-white rounded-lg font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 whitespace-nowrap">
                  Buy Now — GH₵ 250
                </button>
                <button @click="copyAnnouncement" class="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                   {{ copied ? 'COPIED!' : 'COPY CAPTION' }}
                </button>
             </div>

             <!-- Trust Badges -->
             <div class="flex flex-wrap items-center justify-center gap-4 md:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <div class="flex items-center gap-2">
                   <span class="text-[8px] font-bold uppercase tracking-widest">Secure via</span>
                   <span class="text-xs font-bold font-serif">Paystack</span>
                </div>
                <div class="hidden md:block w-px h-4 bg-white/20"></div>
                <div class="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter italic">VISA • mtn • mastercard</div>
             </div>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER (Standard Large Footer from Pricing) -->
    <footer class="bg-black dark:bg-stone-950 text-white pt-24 pb-12 px-6 overflow-hidden">
       <div class="max-w-[1440px] mx-auto">
          <div class="grid md:grid-cols-2 gap-16 mb-24 border-b border-white/20 pb-24">
             <div>
                <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-none !text-white" style="color: white !important;">
                   Ready to find <br/><span class="italic text-rose-500">your person?</span>
                </h2>
                <NuxtLink to="/vibe-check" class="inline-block bg-white text-black px-12 py-5 rounded-md text-lg font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]">
                   Start Vibe Check
                </NuxtLink>
             </div>
             
             <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs">Company</h4>
                   <ul class="space-y-4 text-sm text-gray-400">
                      <li><NuxtLink to="/#manifesto" class="hover:text-rose-500 transition-colors">Manifesto</NuxtLink></li>
                      <li><NuxtLink to="/#process" class="hover:text-rose-500 transition-colors">Process</NuxtLink></li>
                      <li><NuxtLink to="/vouch" class="hover:text-rose-500 transition-colors">Vouch</NuxtLink></li>
                      <li><NuxtLink to="/shoot-your-shot" class="hover:text-rose-500 transition-colors">Shoot Your Shot</NuxtLink></li>
                      <li><NuxtLink to="/pricing" class="hover:text-rose-500 transition-colors">Pricing</NuxtLink></li>
                      <li><NuxtLink to="/spark-deck" class="text-rose-500">Spark Deck</NuxtLink></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs">Social</h4>
                   <ul class="space-y-4 text-sm text-gray-400">
                      <li><a href="https://instagram.com/minutes2match" target="_blank" class="hover:text-rose-500 transition-colors">Instagram</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Twitter / X</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">TikTok</a></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs">Legal</h4>
                   <ul class="space-y-4 text-sm text-gray-400">
                      <li><NuxtLink to="/terms" class="hover:text-rose-500 transition-colors">Terms</NuxtLink></li>
                      <li><NuxtLink to="/privacy" class="hover:text-rose-500 transition-colors">Privacy</NuxtLink></li>
                   </ul>
                </div>
             </div>
          </div>
          <div class="flex flex-col md:flex-row justify-between items-end">
             <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-24 w-auto brightness-0 invert opacity-90" />
             <div class="text-[10px] font-mono text-gray-500 mt-8 md:mt-0 text-right">
                © 2024 Minutes2Match Inc. Accra, GH • All Rights Reserved. <span class="ml-2 opacity-50">v{{ config.public.appVersion }}</span>
             </div>
          </div>
       </div>
    </footer>

    <!-- Sticky Mobile CTA -->
    <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="translate-y-full" enter-to-class="translate-y-0" leave-active-class="transition duration-300 ease-in" leave-from-class="translate-y-0" leave-to-class="translate-y-full">
      <div v-show="showStickyCTA" class="fixed bottom-0 inset-x-0 z-40 p-4 md:hidden bg-white/80 dark:bg-stone-950/80 backdrop-blur-lg border-t border-black dark:border-stone-800 shadow-xl">
        <button @click="scrollToSection('purchase')" class="w-full bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
          GH₵ 250 — Get The Spark Deck
        </button>
      </div>
    </Transition>

    <LivePulse />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import LivePulse from '~/components/LivePulse.vue'

const config = useRuntimeConfig()
const mobileMenuOpen = ref(false)
const showStickyCTA = ref(false)
const copied = ref(false)
const activeFaq = ref<number | null>(null)

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

if (process.client) {
  window.addEventListener('scroll', () => {
    showStickyCTA.value = window.scrollY > 800
  })
}

const parallaxX = ref(0)
const parallaxY = ref(0)

const handleStackParallax = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  parallaxX.value = x * 15 // Increased degrees
  parallaxY.value = y * -15
}

const resetStackParallax = () => {
  parallaxX.value = 0
  parallaxY.value = 0
}

const stackStyles = computed(() => ({
  transform: `perspective(2000px) rotateX(${parallaxY.value}deg) rotateY(${parallaxX.value}deg)`
}))

const previewCards = [
  { level: '1', name: 'The Spark', question: "What's the most 'mainstream' thing you secretly love?", icon: '✨', shadow: 'rgba(0,0,0,1)', bgBack: 'bg-[#F5F5F4] dark:bg-stone-800', text: 'text-stone-900 dark:text-stone-100', textBack: 'text-stone-900', borderBack: 'border-stone-950/20' },
  { level: '2', name: 'The Fire', question: "What is your 'Love Language' and do you think it's easy for others to speak it?", icon: '🔥', shadow: 'rgba(0,0,0,1)', bgBack: 'bg-[#44403C] dark:bg-stone-700', text: 'text-stone-800 dark:text-stone-100', textBack: 'text-stone-50', borderBack: 'border-white/20' },
  { level: '3', name: 'The Inferno', question: "Do you believe in 'Right Person, Wrong Time'?", icon: '💥', shadow: 'rgba(244,63,94,1)', bgBack: 'bg-[#F43F5E]', text: 'text-rose-500', textBack: 'text-white', borderBack: 'border-white/40' },
  { level: 'W', name: 'The Wildcard', question: "Ask the other person any question, and they must answer truthfully.", icon: '🃏', shadow: 'rgba(0,0,0,1)', bgBack: 'bg-black', text: 'text-stone-950 dark:text-stone-400', textBack: 'text-rose-500', borderBack: 'border-rose-500/30' }
]

const scenarios = [
  { title: "The First Date", desc: "Kill the small talk in the first 10 minutes. Go from 'What do you do?' to 'What drives you?'", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M7 22h10"/><path d="M12 17a5 5 0 0 1-5-5V2h10v10a5 5 0 0 1-5 5z"/></svg>' },
  { title: "Dinner Parties", desc: "Turn a standard dinner into an evening people actually remember. Perfect for 4-8 people.", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h12M6 22h12M9 14l-2 4h10l-2-4zM12 2v12"/></svg>' },
  { title: "Late Night Vibes", desc: "When the music stops and the truth comes out. Level 3 was made for these hours.", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>' },
  { title: "The Ultimate Gift", desc: "For the friend who has everything but still values deep connection.", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>' }
]

const faqs = [
  { q: "How do I get my deck in Accra?", a: "We offer same-day or next-day delivery via motorbike courier across Accra and Tema. You can also pick up from our HQ in Cantonments." },
  { q: "Is Level 3 safe for a first date?", a: "Only if you're feeling extremely bold. We recommend starting with Level 1 (The Spark) to test the vibe before jumping into the Inferno." },
  { q: "Is it a standard deck of cards?", a: "Yes. It functions as a standard 54-card deck (including 2 jokers/wildcards) with a premium finish." },
  { q: "What is your refund policy?", a: "If your deck arrives with manufacturing defects, we'll replace it instantly, no questions asked." }
]

const announcementText = `Stop wading in the shallow end. 🌊\n\nThe greatest connections don’t happen by accident; they happen when you ask the right questions. We’re taking the Minutes 2 Match philosophy into the physical world with The M2M Spark Deck—54 cards crafted to kill small talk and spark genuine friction.\n\n#M2MSparkDeck #Minutes2Match #DeepTalk`

const copyAnnouncement = () => {
  navigator.clipboard.writeText(announcementText)
  copied.value = true
  setTimeout(() => copied.value = false, 3000)
}
</script>

<style scoped>
.font-serif { font-family: 'Playfair Display', serif; }
.font-sans { font-family: 'Inter', sans-serif; }
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0) rotate(2deg); }
  50% { transform: translateY(-15px) rotate(-1deg); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes reverse-spin {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}

.animate-reverse-spin {
  animation: reverse-spin 15s linear infinite;
}
</style>
