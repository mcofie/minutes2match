<template>
  <main class="min-h-screen bg-[#FFFCF8] flex flex-col items-center p-6 relative overflow-hidden">
    <!-- Navbar -->
    <nav class="absolute top-0 inset-x-0 z-50 h-20 flex items-center justify-between px-6">
       <NuxtLink to="/me" class="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-rose-500 transition-colors">
          <span>← Back</span>
       </NuxtLink>
    </nav>
    
    <div class="flex-1 flex flex-col items-center justify-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Icon/Header -->
      <div class="mb-8 text-center">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 bg-stone-900 rounded-full animate-pulse opacity-10"></div>
          <div class="w-full h-full bg-white rounded-full border-2 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10">
            🔓
          </div>
        </div>
        <h1 class="text-3xl font-serif font-black text-black mb-2">Unlock Profile</h1>
        <p class="text-stone-500">Reveal their full details and start chatting</p>
      </div>
      
      <!-- Summary Card -->
      <div class="w-full bg-white rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 relative">
        <div class="flex justify-between items-center mb-6 pb-6 border-b border-stone-100">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Item</p>
            <p class="font-serif font-bold text-lg">Match Unlock</p>
          </div>
          <div class="text-right">
             <p class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Price</p>
             <p class="font-mono font-bold text-xl">{{ formatGHS(price) }}</p>
          </div>
        </div>
        
        <div class="bg-stone-50 rounded-lg p-4 mb-2">
           <ul class="space-y-2 text-sm text-stone-600">
             <li class="flex items-center gap-2">
               <span class="text-emerald-500">✓</span> View full photos
             </li>
             <li class="flex items-center gap-2">
               <span class="text-emerald-500">✓</span> See verified phone info
             </li>
             <li class="flex items-center gap-2">
                <span class="text-emerald-500">✓</span> Unlock messaging
             </li>
           </ul>
        </div>
      </div>
      
      <!-- Action -->
      <button 
        @click="processPayment"
        :disabled="processing"
        class="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:bg-rose-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black flex items-center justify-center gap-3"
      >
        <span v-if="processing" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        {{ processing ? 'Processing...' : `Pay ${formatGHS(price)}` }}
      </button>
      
      <!-- Secure Badge -->
      <div class="mt-6 flex items-center gap-2 text-xs text-stone-400 font-medium">
         <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
         Secured by Paystack
      </div>
      
      <div v-if="error" class="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold text-center w-full">
         {{ error }}
      </div>
      
    </div>
  </main>
</template>

<script setup lang="ts">
import { usePaystack } from '~/composables/usePaystack'
import type { M2MDatabase } from '~/types/database.types'

const route = useRoute()
const supabase = useSupabaseClient<M2MDatabase>() as any
const { initializePayment, formatGHS } = usePaystack()
const user = useSupabaseUser()

const matchId = computed(() => route.params.id as string)

const price = ref(10) // Default price
const processing = ref(false)
const error = ref<string | null>(null)
const userProfile = ref<any>(null)

// Load match data to get actual price and user profile
onMounted(async () => {
   if (!user.value) {
     navigateTo('/login')
     return
   }

   try {
     // Fetch user profile for phone
     const { data: profileData } = await supabase
       .from('profiles')
       .select('phone')
       .eq('id', user.value.id)
       .single()
     
     if (profileData) {
        userProfile.value = profileData
     }
   
     // Fetch match data for price
     const { data, error: fetchError } = await supabase
       .from('matches')
       .select('unlock_price, status')
       .eq('id', matchId.value)
       .single()
       
     if (fetchError) throw fetchError
     
     if (data) {
        if (data.status === 'unlocked') {
           // Already unlocked?
           navigateTo(`/me/connection/${matchId.value}`)
        }
        if (data.unlock_price) {
           price.value = data.unlock_price
        }
     }
   } catch (err) {
     console.error('Failed to load match info', err)
   }
})

const processPayment = async () => {
  if (processing.value || !user.value) return
  
  processing.value = true
  error.value = null
  
  try {
    // Generate email from phone (matching dashboard approach)
    const paymentEmail = userProfile.value?.phone 
       ? `${userProfile.value.phone.replace(/\+/g, '')}@m2match.com` 
       : (user.value.email || 'user@m2match.com')
    
    // We pass userId in metadata so callback knows who paid
    const response = await initializePayment(
       paymentEmail,
       price.value,
       'match_unlock',
       {
          matchId: matchId.value,
          userId: user.value.id
       }
    )
    
    if (response && response.authorization_url) {
       window.location.href = response.authorization_url
    } else {
       throw new Error('Failed to initialize payment')
    }
    
  } catch (err: any) {
    console.error('Payment error:', err)
    error.value = err.message || 'Payment initialization failed'
    processing.value = false
  }
}
</script>
