<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
     
     <!-- Empty State Message -->
     <div class="py-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl bg-white dark:bg-stone-900">
       <span class="text-4xl block mb-4 grayscale opacity-50">🗓️</span>
       <p class="font-bold text-stone-900 dark:text-stone-100 mb-1">No events scheduled right now</p>
       <p class="text-sm text-stone-500 dark:text-stone-400">But here is what to expect soon...</p>
     </div>

     <!-- Speed Dating Info Card -->
     <div class="bg-white dark:bg-stone-900 rounded-3xl border-2 border-black dark:border-stone-400 p-5 md:p-8 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-transform hover:-translate-y-1">
        
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-2xl border-2 border-black dark:border-rose-500/50">
               🥂
            </div>
            <div>
               <h3 class="text-xl font-serif font-bold text-black dark:text-white">Speed Dating Socials</h3>
               <p class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Coming Soon</p>
            </div>
        </div>

        <!-- Description -->
        <p class="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed max-w-2xl">
           Skip the small talk. Meet 10-15 compatible singles in one fun, facilitated evening. 
           Real conversations, zero pressure, and results delivered same-night.
        </p>

        <!-- Divider -->
        <div class="w-full h-px bg-stone-100 dark:bg-stone-800 mb-8"></div>

        <!-- Grid Info -->
        <div class="grid md:grid-cols-2 gap-8">
            
            <!-- Qualification -->
            <div>
               <h4 class="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 flex items-center gap-2">
                  <span>✅</span> Qualification
               </h4>
               <ul class="space-y-3">
                  <li class="text-sm font-bold text-black dark:text-stone-200 flex items-start gap-3">
                     <span class="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-emerald-200 dark:border-emerald-800">✓</span> 
                     Must pass Vibe Check
                  </li>
                  <li class="text-sm font-bold text-black dark:text-stone-200 flex items-start gap-3">
                     <span class="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-emerald-200 dark:border-emerald-800">✓</span>
                     Age Group Specific
                  </li>
                  <li class="text-sm font-bold text-black dark:text-stone-200 flex items-start gap-3">
                     <span class="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-emerald-200 dark:border-emerald-800">✓</span>
                     Verified Profile
                  </li>
               </ul>
            </div>

            <!-- Price -->
            <div>
               <h4 class="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4 flex items-center gap-2">
                  <span>🎟️</span> Ticket Price
               </h4>
               <div class="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700 text-center relative group hover:border-black dark:hover:border-stone-500 transition-colors">
                  <div class="absolute top-2 right-2 text-xs opacity-50">🇬🇭</div>
                  <p class="text-[10px] uppercase font-bold text-stone-500 mb-1">Standard Entry</p>
                  <p class="text-4xl font-serif font-bold text-black dark:text-white mb-2">GH₵ 150</p>
                  <p class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 inline-block px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">Includes 1 Free Drink</p>
               </div>
            </div>

        </div>

     </div>

  </div>
</template>

<script setup lang="ts">
// No logic needed for now, purely presentational
</script>
