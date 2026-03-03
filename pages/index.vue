<template>
  <div class="min-h-screen bg-white dark:bg-stone-950 text-black dark:text-stone-50 font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden transition-colors duration-300">
    <!-- Fonts -->
    <Head>
      <Title>Minutes 2 Match - Real Connections</Title>
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-20 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>

        <!-- Center Links (Desktop) -->
        <div class="hidden md:flex items-center gap-10 text-sm font-bold text-stone-900 dark:text-stone-200">
          <button @click="scrollToSection('manifesto')" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Manifesto</button>
          <button @click="scrollToSection('process')" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Process</button>
          <NuxtLink to="/vouch" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Pricing</NuxtLink>
        </div>

        <!-- CTA & Login (Desktop) + Hamburger (Mobile) -->
        <div class="flex items-center gap-4 md:gap-8">
          <NuxtLink to="/login" class="hidden md:block text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
             MEMBER LOGIN
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="hidden md:inline-flex bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-2.5 rounded-md border border-black dark:border-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow-[4px_4px_0px_0px_#E7E5E4] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            VIBE CHECK
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
            <button @click="scrollToSection('manifesto'); mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Manifesto
            </button>
            <button @click="scrollToSection('process'); mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Process
            </button>
            <NuxtLink to="/vouch" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              🤝 Vouch for Friends
            </NuxtLink>
            <NuxtLink to="/shoot-your-shot" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              🎯 Shoot Your Shot
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

    <main class="pt-20">
      <!-- HERO SECTION -->
      <section class="min-h-[90vh] flex flex-col justify-center relative border-b border-black dark:border-stone-800 bg-[#FFFCF8] dark:bg-stone-950 overflow-hidden transition-colors duration-300">
         <!-- Dot Pattern Background -->
         <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

         <div class="max-w-[1440px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full z-10 py-20">
            <!-- Left: Typography -->
            <div class="text-center lg:text-left">

               
               <h1 class="text-6xl md:text-8xl lg:text-[6.5rem] leading-[0.95] font-serif mb-8 text-black dark:text-stone-50 tracking-tight">
                  <span class="inline-block overflow-hidden pb-1 align-bottom">
                     <span class="inline-block" v-scroll-animate="{ animation: 'fade-up', delay: 0 }">We</span>
                  </span>
                  <span class="inline-block overflow-hidden pb-1 align-bottom ml-3 md:ml-4 lg:ml-5">
                     <span class="inline-block" v-scroll-animate="{ animation: 'fade-up', delay: 100 }">engineer</span>
                  </span>
                  <br/>
                  <span class="inline-block overflow-hidden pb-2 align-bottom mt-2">
                     <span class="inline-block italic text-rose-500" v-scroll-animate="{ animation: 'fade-up', delay: 200 }">the click.</span>
                  </span>
               </h1>

               <p 
                 v-scroll-animate="{ animation: 'fade-up', delay: 100 }"
                 class="text-xl text-stone-600 dark:text-stone-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light mb-10"
               >
                  Stop swiping. Start connecting. We use psychometrics and curated events to put you in a room with people you'll actually like.
               </p>

               <div 
                 v-scroll-animate="{ animation: 'fade-up', delay: 200 }"
                 class="flex flex-col gap-4"
               >
                  <div class="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-6">
                    <NuxtLink to="/vibe-check" class="bg-black dark:bg-stone-100 text-white dark:text-black px-12 py-5 rounded-md text-lg font-medium hover:bg-stone-800 dark:hover:bg-white transition-all w-full sm:w-auto min-w-[200px] text-center shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black dark:border-stone-100">
                       Start Vibe Check
                    </NuxtLink>
                    <button @click="scrollToSection('process')" class="text-black dark:text-stone-300 font-bold uppercase tracking-widest text-sm hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                       How does it work?
                    </button>
                  </div>
                  
                  <div class="text-center lg:text-left pl-1">
                    <NuxtLink to="/login" class="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-black dark:hover:text-white transition-colors">
                       Already a member? <span class="underline decoration-2 underline-offset-4 text-stone-600 dark:text-stone-300">Login here</span>
                    </NuxtLink>
                  </div>
               </div>
            </div>

            <!-- Right: Visual (Match Simulation) -->
            <div class="relative hidden lg:flex items-center justify-center h-full min-h-[500px] w-full" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave" style="perspective: 2000px;">
               <!-- Floating Elements -->
               <div ref="heroCard" class="relative w-[450px] h-[550px]" :style="{ transform: cardTransform, transition: 'transform 0.1s ease-out' }">
                  <!-- Back Card (Decorative) -->
                  <div class="absolute inset-0 bg-black translate-x-4 translate-y-4 rounded-3xl"></div>
                   
                  <!-- Main Card -->
                  <div class="absolute inset-0 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                     <!-- Header -->
                     <div class="flex justify-between items-center border-b border-black dark:border-stone-700 pb-4">
                        <div class="flex gap-2">
                           <div class="w-3 h-3 rounded-full bg-red-500 border border-black dark:border-stone-800"></div>
                           <div class="w-3 h-3 rounded-full bg-yellow-500 border border-black dark:border-stone-800"></div>
                           <div class="w-3 h-3 rounded-full bg-green-500 border border-black dark:border-stone-800"></div>
                        </div>
                        <div class="text-xs font-mono uppercase dark:text-stone-400">Match_Algorithm.exe</div>
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
                              <NuxtImg format="webp" src="/ama_profile.png" class="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all"/>
                           </div>
                           
                           <!-- Match Badge -->
                           <div class="z-20 -mx-4 bg-rose-500 text-white border-2 border-black px-4 py-2 rounded-full font-bold text-xl shadow-[4px_4px_0px_0px_#000] animate-bounce">
                              94%
                           </div>

                           <!-- Avatar 2 -->
                           <div class="w-28 h-28 rounded-full border-2 border-black p-1 bg-white z-10 relative">
                              <NuxtImg format="webp" src="/kwame_profile.png" class="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all"/>
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
                     <div class="border-t border-black dark:border-stone-700 pt-4">
                        <div class="w-full bg-black dark:bg-stone-100 text-white dark:text-black text-center py-3 rounded-xl font-bold uppercase tracking-widest text-sm cursor-pointer hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-colors">
                           Unlock Connection
                        </div>
                     </div>
                  </div>

                  <!-- Floating Notification -->
                  <div class="absolute -right-12 top-20 bg-white dark:bg-stone-800 border-2 border-black dark:border-stone-600 p-4 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] max-w-[200px] z-30 rotate-6">
                     <div class="text-xs font-bold uppercase text-stone-500 mb-1">New Notification</div>
                     <div class="font-serif font-bold text-lg leading-tight dark:text-stone-50">"You both love jazz & spicy food."</div>
                  </div>
               </div>
            </div>
         </div>

         <!-- Marquee -->
         <div class="absolute bottom-0 left-0 right-0 bg-[#F0FDF4] dark:bg-emerald-950/30 border-t border-black dark:border-stone-800 py-4 overflow-hidden flex whitespace-nowrap text-green-800 dark:text-emerald-400">
            <div class="animate-marquee flex gap-12 text-sm font-mono font-bold uppercase tracking-widest items-center">
               <span>Next Event: Accra</span>
               <span class="w-2 h-2 rounded-full bg-green-600 dark:bg-emerald-500"></span>
               <span>Feb 20</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Limited Spots</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Matchmaking Active</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Next Event: Accra</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Feb 20</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Limited Spots</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
               <span>Matchmaking Active</span>
               <span class="w-2 h-2 rounded-full bg-green-600"></span>
            </div>
         </div>
      </section>

      <!-- MANIFESTO / PROBLEM -->
      <section id="manifesto" class="grid md:grid-cols-2 min-h-[85vh] border-b border-black dark:border-stone-800">
         <div class="border-b md:border-b-0 md:border-r border-black dark:border-stone-800 p-12 lg:p-24 flex flex-col justify-center bg-[#FFF1F2] dark:bg-rose-950/20">
            <h2 
              v-scroll-animate="{ animation: 'fade-right', delay: 0 }"
              class="text-4xl md:text-6xl font-serif mb-8 leading-tight text-rose-950 dark:text-rose-100"
            >
               The internet broke dating. <br/>We're fixing it.
            </h2>
            <div v-scroll-animate="{ animation: 'fade-right', delay: 100 }" class="w-24 h-1 bg-black dark:bg-rose-500 mb-8"></div>
            <p 
              v-scroll-animate="{ animation: 'fade-right', delay: 200 }"
              class="text-lg text-rose-900 dark:text-rose-200 leading-relaxed font-light"
            >
               Dating apps monetize your loneliness. They want you swiping, not dating. 
               <br/><br/>
               At <span class="font-bold">minutes2match</span>, we believe chemistry happens in person. But going out blindly is inefficient. 
               We bridge the gap by doing the screening first, then facilitating the meeting.
            </p>
         </div>
         <div class="relative min-h-[400px]">
            <!-- Updated Image: Black couple / Connection -->
            <NuxtImg format="webp" src="/manifesto_connection.png" alt="Real Connection" class="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            <div class="absolute bottom-8 left-8 bg-white dark:bg-stone-900 text-black dark:text-white border border-black dark:border-stone-600 px-4 py-2 text-sm font-bold uppercase tracking-wider">
               Real Humans, Real Time
            </div>
         </div>
      </section>

      <!-- THE PROCESS SPLIT -->
      <section id="process" class="py-24 md:py-32 px-6 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800 overflow-hidden">
         <div class="max-w-6xl mx-auto relative">
            <div class="text-center mb-16 md:mb-24 relative z-10">
               <h2 class="text-4xl md:text-6xl font-serif mb-6 dark:text-stone-50 text-black tracking-tight">Two Ways to Connect</h2>
               <p class="text-stone-500 font-medium text-xl max-w-2xl mx-auto">Choose your path to finding love.</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 md:gap-16 relative z-10">
               <!-- Path 1: Matching System -->
               <div class="group relative">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 transition-transform group-hover:translate-x-5 group-hover:translate-y-5"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#F0FDF4] dark:bg-emerald-950/20 p-10 md:p-14 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-20 h-20 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-4xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🧠
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">Algorithm Matches</span>
                     <h3 class="text-4xl md:text-5xl font-serif font-bold mb-8 text-black dark:text-white leading-none">The Matching System</h3>
                     
                     <div class="space-y-8 flex-1 mb-12">
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">1</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Take the Vibe Check</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 Answer our psychometric test to map your personality values. No bios, just science.
                              </p>
                           </div>
                        </div>
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">2</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Get Notified</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 You'll get a notification when we find a 90%+ compatible match.
                              </p>
                           </div>
                        </div>
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">3</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Unlock & Connect</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 Make a small payment to unlock their profile and start chatting directly.
                              </p>
                           </div>
                        </div>
                     </div>
                     <NuxtLink to="/vibe-check" class="inline-flex justify-center items-center w-full py-5 bg-white dark:bg-black border-2 border-black dark:border-stone-600 font-bold uppercase tracking-widest text-sm hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                        Start Matching
                     </NuxtLink>
                  </div>
               </div>

               <!-- Path 2: Speed Dating -->
               <div class="group relative mt-8 md:mt-24">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 transition-transform group-hover:translate-x-5 group-hover:translate-y-5"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#EFF6FF] dark:bg-blue-950/20 p-10 md:p-14 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-20 h-20 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-4xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🥂
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">In Person</span>
                     <h3 class="text-4xl md:text-5xl font-serif font-bold mb-8 text-black dark:text-white leading-none">Speed Dating Events</h3>
                     
                     <div class="space-y-8 flex-1 mb-12">
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">1</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Get Invited</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 Special invites are sent to groups with similar interests and demographics.
                              </p>
                           </div>
                        </div>
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">2</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Secure Your Spot</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 Purchase a ticket to confirm your attendance. Spaces are strictly limited.
                              </p>
                           </div>
                        </div>
                        <div class="flex gap-6 items-start">
                           <span class="font-bold text-lg font-serif italic bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:text-stone-200">3</span>
                           <div>
                              <h4 class="font-bold text-xl mb-2 dark:text-stone-100">Show Up & Vibe</h4>
                              <p class="text-stone-700 dark:text-stone-400 leading-relaxed text-sm">
                                 Arrive at the curated venue. We facilitate the intros, you bring the charm.
                              </p>
                           </div>
                        </div>
                     </div>
                     <NuxtLink to="/vibe-check" class="inline-flex justify-center items-center w-full py-5 bg-white dark:bg-black border-2 border-black dark:border-stone-600 font-bold uppercase tracking-widest text-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                        Join Event Waitlist
                     </NuxtLink>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- SOCIAL PROOF / STATS -->
      <section ref="statsSection" class="bg-stone-50 dark:bg-stone-900 border-b border-black dark:border-stone-800 py-24 px-6 text-center">
         <div class="max-w-6xl mx-auto">
            <h2 
              v-scroll-animate="{ animation: 'fade-up', delay: 0 }"
              class="text-4xl md:text-5xl font-serif italic mb-20 text-black dark:text-stone-50 leading-tight"
            >
               "Finally, dating that feels<br class="hidden md:block"/> like real life."
            </h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0 md:divide-x divide-black/20 dark:divide-stone-700 md:divide-black dark:md:divide-stone-700 border-t border-b border-black dark:border-stone-700 py-12">
               <div v-scroll-animate="{ animation: 'fade-up', delay: 0 }" class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">{{ currentAccuracy }}%</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300">Match Accuracy</div>
               </div>
               <div v-scroll-animate="{ animation: 'fade-up', delay: 100 }" class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">{{ currentEvents }}+</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300">Events Hosted</div>
               </div>
               <div v-scroll-animate="{ animation: 'fade-up', delay: 200 }" class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">{{ currentConnections }}+</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300">Connections Made</div>
               </div>
               <div v-scroll-animate="{ animation: 'fade-up', delay: 300 }" class="px-4">
                  <div class="text-4xl md:text-6xl font-bold mb-3 text-rose-500 font-serif">0</div>
                  <div class="text-xs font-bold uppercase tracking-widest text-black dark:text-stone-300">Catfish Reports</div>
               </div>
            </div>
         </div>
      </section>

      <!-- VOUCH & SHOOT YOUR SHOT CTAs -->
      <!-- VOUCH & SHOOT YOUR SHOT CTAs -->
      <section class="py-24 md:py-32 px-6 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800 overflow-hidden">
         <div class="max-w-6xl mx-auto relative">
            <div class="text-center mb-16 md:mb-24 relative z-10">
               <h2 class="text-4xl md:text-6xl font-serif mb-6 dark:text-stone-50 text-black tracking-tight">Connections Without Profiles</h2>
               <p class="text-stone-500 font-medium text-xl max-w-2xl mx-auto">Skip the account setup. Make your move directly or set up your friends in seconds.</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 md:gap-16 relative z-10">
               <!-- Vouch Card -->
               <div class="group relative">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 transition-transform group-hover:translate-x-5 group-hover:translate-y-5"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#FFF9F2] dark:bg-orange-950/20 p-10 md:p-14 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-20 h-20 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-4xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🤝
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">Always Free</span>
                     <h3 class="text-4xl md:text-5xl font-serif font-bold mb-6 text-black dark:text-white leading-none">Vouch for Friends</h3>
                     <p class="text-stone-700 dark:text-stone-300 mb-12 flex-1 text-lg leading-relaxed">
                        Play matchmaker for two people who belong together. Enter their details, we'll send a mystery SMS. You get all the credit.
                     </p>
                     <NuxtLink to="/vouch" class="inline-flex justify-center items-center w-full py-5 bg-white dark:bg-black border-2 border-black dark:border-stone-600 font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                        Start a Vouch
                     </NuxtLink>
                  </div>
               </div>

               <!-- Shot Card -->
               <div class="group relative mt-8 md:mt-24">
                  <!-- Hard shadow layer -->
                  <div class="absolute inset-0 bg-black dark:bg-stone-700 rounded-3xl translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 transition-transform group-hover:translate-x-5 group-hover:translate-y-5"></div>
                  <!-- Card content -->
                  <div class="relative h-full bg-[#FFF1F4] dark:bg-rose-950/20 p-10 md:p-14 border-2 border-black dark:border-stone-700 rounded-3xl flex flex-col transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                     <div class="w-20 h-20 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-600 rounded-full flex items-center justify-center text-4xl mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] -ml-2">
                        🎯
                     </div>
                     <span class="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest rounded-full self-start mb-6">Bold Moves Only</span>
                     <h3 class="text-4xl md:text-5xl font-serif font-bold mb-6 text-black dark:text-white leading-none">Shoot Your Shot</h3>
                     <p class="text-stone-700 dark:text-stone-300 mb-12 flex-1 text-lg leading-relaxed">
                        Got a crush? Send a mystery SMS with 3 clues. They tap to reveal your identity. High reward, low pressure.
                     </p>
                     <NuxtLink to="/shoot-your-shot" class="inline-flex justify-center items-center w-full py-5 bg-white dark:bg-black border-2 border-black dark:border-stone-600 font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                        Send a Message
                     </NuxtLink>
                  </div>
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
               <span>Join 500+ others in Accra</span>
            </div>
         </div>
      </section>

      <!-- STORIES -->
      <section id="stories" class="border-b border-black dark:border-stone-800 grid md:grid-cols-2">
          <div class="p-12 lg:p-24 bg-stone-50 dark:bg-stone-900 md:border-r border-black dark:border-stone-800">
              <h3 class="text-3xl font-serif mb-6 dark:text-stone-50">"I met my husband at the October event."</h3>
              <p class="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                 "I was skeptical about speed dating, but the vibe check meant everyone there was actually my type. We skipped the small talk and just connected."
              </p>
              <div class="font-bold flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <NuxtImg format="webp" src="/ama_profile.png" class="w-full h-full object-cover" />
                 </div>
                 <span class="dark:text-stone-200">Ama, 29</span>
              </div>
          </div>
          <div class="p-12 lg:p-24 bg-white dark:bg-stone-950">
              <h3 class="text-3xl font-serif mb-6 dark:text-stone-50">"Efficient, safe, and surprisingly fun."</h3>
              <p class="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                 "The psychometric matching works. I talked to 5 people and clicked with 3 of them. The app made following up super easy without giving out my number to everyone."
              </p>
              <div class="font-bold flex items-center gap-3">
                 <div class="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <NuxtImg format="webp" src="/kwame_profile.png" class="w-full h-full object-cover" />
                 </div>
                 <span class="dark:text-stone-200">Kwame, 31</span>
              </div>
          </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="bg-black dark:bg-stone-950 text-white pt-24 pb-12 px-6 overflow-hidden">
       <div class="max-w-[1440px] mx-auto">
          <!-- Top Section -->
          <div class="grid md:grid-cols-2 gap-16 mb-24 border-b border-white/20 pb-24">
             <div>
                <h2 class="text-5xl md:text-7xl font-serif mb-8 leading-none !text-white" style="color: white !important;">
                   Ready to find <br/><span class="italic text-rose-500">your person?</span>
                </h2>
                <NuxtLink to="/vibe-check" class="inline-block bg-white dark:bg-stone-100 text-black px-12 py-5 rounded-md text-lg font-bold uppercase tracking-widest hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                   Start Vibe Check
                </NuxtLink>
             </div>
             
             <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs" style="color: white !important;">Company</h4>
                   <ul class="space-y-4 text-sm font-medium text-gray-300 dark:text-stone-400">
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Manifesto</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">How it Works</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Stories</a></li>
                      <li><NuxtLink to="/release-notes" class="hover:text-rose-500 transition-colors">Release Notes</NuxtLink></li>
                      <li><NuxtLink to="/pricing" class="hover:text-rose-500 transition-colors">Pricing</NuxtLink></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs" style="color: white !important;">Social</h4>
                   <ul class="space-y-4 text-sm font-medium text-gray-300 dark:text-stone-400">
                       <li><a href="https://www.instagram.com/minutes2match" target="_blank" rel="noopener noreferrer" class="hover:text-rose-500 transition-colors">Instagram</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">Twitter / X</a></li>
                      <li><a href="#" class="hover:text-rose-500 transition-colors">TikTok</a></li>
                   </ul>
                </div>
                <div>
                   <h4 class="font-bold uppercase tracking-widest !text-white mb-6 text-xs" style="color: white !important;">Legal</h4>
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
             <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-24 w-auto object-contain brightness-0 invert opacity-90" />
          </div>
             <div class="text-xs font-mono text-gray-400 dark:text-stone-500 mb-4 md:mb-8 text-right">
                © 2024 Minutes2Match Inc. • Accra, GH <br/>
                All Rights Reserved. <span class="ml-2 opacity-50">v{{ config.public.appVersion }}</span>
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
// ... existing script content ...
import { ref, onMounted, type Ref } from 'vue'

useHead({
  title: 'Minutes 2 Match - Real Connections',
  meta: [
    { name: 'description', content: 'We engineer the click. Psychometric matching + real world events.' }
  ]
})

const config = useRuntimeConfig()
const mobileMenuOpen = ref(false)

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// ----------------------------------------------------
// 1. Stats Animation Logic
// ----------------------------------------------------
const statsSection = ref<HTMLElement | null>(null)
const statsAnimated = ref(false)

const targetAccuracy = 94
const targetEvents = 12
const targetConnections = 350

const currentAccuracy = ref(0)
const currentEvents = ref(0)
const currentConnections = ref(0)

const animateValue = (target: number, current: Ref<number>, duration: number) => {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    current.value = Math.floor(easing * target);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ----------------------------------------------------
// 2. 3D Tilt Logic for Hero Card
// ----------------------------------------------------
const heroCard = ref<HTMLElement | null>(null)
const cardTransform = ref('perspective(1000px) rotateX(0deg) rotateY(0deg)')

const handleMouseMove = (e: MouseEvent) => {
  if (!heroCard.value) return
  
  const rect = heroCard.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // Max rotation of 10 degrees
  const rotateX = ((y - centerY) / centerY) * -10
  const rotateY = ((x - centerX) / centerX) * 10
  
  cardTransform.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
}

const handleMouseLeave = () => {
  cardTransform.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
}

onMounted(() => {
  if (statsSection.value) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsAnimated.value) {
        statsAnimated.value = true;
        animateValue(targetAccuracy, currentAccuracy, 2000)
        animateValue(targetEvents, currentEvents, 2000)
        animateValue(targetConnections, currentConnections, 2000)
      }
    }, { threshold: 0.5 });
    observer.observe(statsSection.value);
  }
})
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
