<template>
  <div class="mt-10 bg-white dark:bg-stone-900 rounded-3xl border-2 border-black dark:border-stone-400 p-5 md:p-10 relative overflow-visible shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-transform hover:-translate-y-1">
     
     <!-- Floating Badge for Premium -->
     <div v-if="subscription" class="absolute -top-4 -right-2 md:right-8 bg-emerald-500 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1.5 rounded-full rotate-3 z-10">
        <span class="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
           <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span> Active
        </span>
     </div>

     <div v-if="!subscription">
        <h4 class="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">1. Basic Access</h4>
        <div class="mb-4 p-4 md:p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-700 relative group hover:border-stone-300 transition-colors">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4 text-center items-center">
               <div class="space-y-1">
                   <span class="text-2xl block mb-2 grayscale group-hover:grayscale-0 transition-all">🎁</span>
                   <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">First Match</p>
                   <p class="font-black text-xl text-black dark:text-white">Free</p>
               </div>
               
               <!-- Vertical Divider (Desktop) -->
               <div class="hidden sm:block absolute left-1/2 top-4 bottom-4 w-px bg-stone-200 dark:bg-stone-700"></div>
               
               <!-- Horizontal Divider (Mobile) -->
               <div class="block sm:hidden w-full h-px bg-stone-200 dark:bg-stone-700"></div>
               
                <div class="space-y-1">
                   <span class="text-2xl block mb-2 grayscale group-hover:grayscale-0 transition-all">🔓</span>
                   <p class="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">Pay As You Go</p>
                   <p class="font-black text-xl text-black dark:text-white">GH₵ 15<span class="text-[10px] font-medium text-stone-400 ml-1 font-sans">/match</span></p>
               </div>
            </div>
        </div>
     </div>

     <h4 v-if="!subscription" class="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-6 mt-8 pt-8 border-t-2 border-dashed border-stone-100 dark:border-stone-800">2. Premium Membership</h4>

     <div class="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8 relative">
        <div class="flex items-start gap-6">
            <!-- Icon Box -->
           <div class="w-20 h-20 rounded-2xl border-2 border-black dark:border-stone-400 flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              :class="subscription ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'"
           >
              👑
           </div>
           
           <div>
              <p class="text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">
                 {{ subscription ? 'Your Plan' : 'Membership' }}
              </p>
              <h3 class="text-3xl md:text-4xl font-black font-serif text-black dark:text-white mb-2 leading-none">
                 {{ subscription ? 'Premium Member' : 'Unlock Premium' }}
              </h3>
              <p class="text-stone-600 dark:text-stone-300 max-w-sm leading-relaxed text-sm">
                 {{ subscription 
                    ? 'You currently have unlimited access to all features and matches.' 
                    : 'Get unlimited match unlocks, priority visibility, and exclusive event access.' 
                 }}
              </p>
           </div>
        </div>
     </div>

     <!-- Divider -->
     <div class="w-full h-0.5 bg-stone-100 dark:bg-stone-800 mb-8"></div>

     <!-- Benefits Grid -->
     <div class="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs border border-transparent group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white">Unlimited Match Unlocks</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs border border-transparent group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white">Priority Matching</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs border border-transparent group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white">Verified Badge</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs border border-transparent group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white">Exclusive Event Access</span>
        </div>
     </div>

     <!-- Active/Action Section -->
     <div v-if="subscription" class="bg-stone-50 dark:bg-stone-800/50 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
           <span class="text-2xl">🗓️</span>
           <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-500">Renews On</p>
              <p class="font-bold font-mono text-lg text-black dark:text-white">{{ new Date(subscription.end_date).toLocaleDateString(undefined, { dateStyle: 'long' }) }}</p>
           </div>
        </div>
        <!-- Optional Management Link -->
        <button class="text-xs font-bold underline hover:text-emerald-500 transition-colors">Manage</button>
     </div>

     <div v-else class="flex flex-col md:flex-row items-center gap-5">
        <button 
           @click="$emit('subscribe')"
           class="flex-1 w-full bg-rose-500 text-white font-black uppercase tracking-widest text-sm py-4 px-8 rounded-lg border-2 border-black dark:border-stone-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
        >
           <span>Upgrade Now</span>
           <span class="bg-black/20 px-2 py-0.5 rounded text-xs font-mono">GH₵ 75/mo</span>
        </button>
        <p class="text-xs font-bold text-stone-400 text-center">
           Cancel anytime.
        </p>
     </div>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  subscription: any | null
}>()

const emit = defineEmits<{
  (e: 'subscribe'): void
}>()
</script>
