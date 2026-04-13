<template>
  <div class="bg-white dark:bg-stone-900 rounded-[32px] border-2 border-stone-800 dark:border-stone-400 p-6 md:p-10 relative overflow-visible">
     
     <!-- Floating Badge for Premium -->
     <div v-if="subscription" class="absolute -top-4 -right-2 md:right-8 bg-emerald-500 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1.5 rounded-full rotate-3 z-10">
        <span class="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
           <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span> Active
        </span>
     </div>

     <div v-if="!subscription">
        <h4 class="text-xs font-black uppercase tracking-widest text-black dark:text-stone-500 mb-6">1. Basic Access</h4>
        <div class="mb-4 p-4 md:p-6 bg-[#fafaf9] dark:bg-stone-800/50 rounded-2xl border-none relative group transition-colors">
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
                   <p class="font-black text-xl text-black dark:text-white">GH₵ 15<span class="text-[10px] font-medium text-stone-400 ml-1 font-sans">per Match Unlock</span></p>
               </div>
            </div>
        </div>
     </div>

     <div class="w-full border-b border-dashed border-stone-200 dark:border-stone-800 my-10 relative"></div>

     <h4 v-if="!subscription" class="text-xs font-black uppercase tracking-widest text-black dark:text-stone-500 mb-6">2. Premium Membership</h4>

     <div class="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8 relative">
        <div class="flex items-start gap-6">
            <!-- Icon Box -->
           <div class="w-20 h-20 rounded-2xl border-2 border-black dark:border-stone-400 flex items-center justify-center text-[40px] shadow-none"
              :class="subscription ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-[#ffd6db] dark:bg-rose-900/30'"
           >
              👑
           </div>
           
           <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 mb-2">
                 {{ subscription ? 'Your Plan' : 'Membership' }}
              </p>
              <h3 class="text-3xl md:text-[40px] font-bold font-serif text-black dark:text-white mb-2 leading-none tracking-tight">
                 {{ subscription ? 'Premium Member' : 'Unlock Premium' }}
              </h3>
              <p class="text-[#57534e] dark:text-stone-300 max-w-sm leading-relaxed text-[15px] pt-1 font-medium">
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
     <div class="grid md:grid-cols-2 gap-x-8 gap-y-5 mb-12">
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white text-[15px]">Unlimited Match Unlocks</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white text-[15px]">Priority Matching</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white text-[15px]">Verified Badge</span>
        </div>
        <div class="flex items-center gap-4 group">
           <div class="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">✓</div>
           <span class="font-bold text-black dark:text-white text-[15px]">Exclusive Event Access</span>
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
           class="flex-1 w-full bg-[#ff0a43] text-white font-bold uppercase tracking-[0.1em] text-[13px] py-[18px] px-8 rounded-xl border-2 border-black dark:border-stone-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
        >
           <span>Upgrade Now</span>
           <span class="bg-[#ba0029] px-2.5 py-1 rounded-[4px] text-[10px] font-mono tracking-widest">GH₵ 75/MO</span>
        </button>
        <p class="text-[13px] font-bold text-stone-400 text-center flex-shrink-0">
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
