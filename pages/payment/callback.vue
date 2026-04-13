<template>
  <main class="min-h-screen flex items-center justify-center bg-[#FFFCF8] p-6 relative overflow-hidden transition-colors duration-500">
    <!-- Neo-Brutalist Background Elements -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
    <div class="absolute top-20 right-[10%] w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 left-[10%] w-64 h-64 bg-rose-100/30 rounded-full blur-3xl"></div>
    
    <!-- Unified Card Container -->
    <div 
      class="relative w-full max-w-md bg-white border-2 border-black p-8 sm:p-10 text-center transition-all duration-700 ease-out shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl"
      :class="loading ? 'scale-95 opacity-50' : 'scale-100 opacity-100'"
    >
      
      <!-- Loading State -->
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center min-h-[300px]">
        <div class="w-16 h-16 rounded-full border-4 border-stone-100 border-t-black animate-spin mb-6"></div>
        <p class="text-black font-black uppercase tracking-widest text-xs animate-pulse">Verifying Transaction</p>
      </div>
      
      <!-- Success State -->
      <div v-else-if="success" class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <!-- Decoration Line -->
        <div class="absolute top-0 inset-x-0 h-2 bg-emerald-400 border-b-2 border-black rounded-t-xl"></div>
        
        <!-- Animated Icon Container -->
        <div class="relative w-24 h-24 mb-6 group">
          <div class="absolute inset-0 bg-emerald-400 rounded-full translate-x-1.5 translate-y-1.5 border-2 border-black"></div>
          <div class="relative w-full h-full bg-white border-2 border-black rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" class="animate-check" />
            </svg>
          </div>
        </div>
        
        <h1 class="text-3xl font-serif font-black text-black mb-3 tracking-tight italic">Payment Successful</h1>
        <p class="text-stone-500 leading-relaxed mb-8 text-sm font-medium max-w-xs mx-auto">{{ message }}</p>
        
        <!-- Status Info Box -->
        <div class="w-full bg-stone-50 border-2 border-black rounded-xl p-5 mb-8 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
           <div class="flex flex-col items-start gap-1">
             <span class="text-[10px] font-black uppercase tracking-widest text-stone-400">Transaction Status</span>
             <span class="text-xs font-bold text-black">Order #{{ ($route.query.reference as string || '').slice(-6).toUpperCase() }}</span>
           </div>
           <span class="text-emerald-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border-2 border-emerald-500 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.1)]">
             <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Confirmed
           </span>
        </div>

        <button 
          class="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2" 
          @click="goToDashboard"
        >
          <span>{{ paymentPurpose === 'spark_deck' ? 'Return to Spark Deck' : 'Continue to Matches' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        
        <p v-if="success && paymentPurpose === 'spark_deck' && redirectCountdown > 0" class="mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
           Auto-redirecting in {{ redirectCountdown }}s...
        </p>
      </div>
      
      <!-- Error State -->
      <div v-else class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div class="absolute top-0 inset-x-0 h-2 bg-rose-500 border-b-2 border-black rounded-t-xl"></div>
        
        <div class="relative w-24 h-24 mb-6 group">
          <div class="absolute inset-0 bg-rose-500 rounded-full translate-x-1.5 translate-y-1.5 border-2 border-black"></div>
          <div class="relative w-full h-full bg-white border-2 border-black rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        
        <h1 class="text-3xl font-serif font-black text-black mb-3 italic">Payment Failed</h1>
        <p class="text-stone-500 font-medium leading-relaxed mb-8 max-w-xs mx-auto text-sm">{{ message }}</p>
        
        <button 
          @click="goToDashboard"
          class="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
      
    </div>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import { useConfetti } from '~/composables/useConfetti'

const { burst } = useConfetti()

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')
const paymentPurpose = ref<string | null>(null)
const redirectCountdown = ref(5)

onMounted(async () => {
  const reference = route.query.reference as string
  
  if (!reference) {
    success.value = false
    message.value = 'No payment reference found.'
    loading.value = false
    return
  }

  try {
    const { verifyPayment } = usePaystack()
    const result = await verifyPayment(reference) as any
    
      if (result.status === 'success') {
        success.value = true
        paymentPurpose.value = result.metadata?.purpose || null
        
        // Trigger confetti celebration
        setTimeout(() => {
          burst()
        }, 500)
        
        if (result.metadata?.purpose === 'event_ticket') {
          message.value = 'Your event booking has been confirmed! We\'ve sent the details to your inbox.'
        } else if (result.metadata?.purpose === 'match_unlock') {
           // Provide clearer feedback
          if (result.status === 'success' || result.metadata?.paystack_response?.status === 'success') {
             message.value = 'Match unlocked successfully! You can now view their full profile and start chatting.'
          } else {
             message.value = 'Payment received! Waiting for final confirmation.'
          }
        } else if (result.metadata?.purpose === 'subscription') {
           message.value = 'Welcome to the club! Your Premium Membership is now active.'
        } else if (result.metadata?.purpose === 'shoot_your_shot') {
           message.value = 'Shot fired! 🎯 They\'ll receive a mystery SMS shortly.'
        } else if (result.metadata?.purpose === 'spark_deck') {
           message.value = 'Success! Your M2M Spark Deck bundle is secured. We\'ve sent a receipt to your phone, and delivery starts now!'
           
           // Start redirect countdown
           const timer = setInterval(() => {
              redirectCountdown.value--
              if (redirectCountdown.value <= 0) {
                 clearInterval(timer)
                 navigateTo('/spark-deck?success=true')
              }
           }, 1000)
        } else if (result.metadata?.purpose === 'wallet_topup') {
            message.value = 'M2M Wallet topped up! Your new balance is live and ready for your next connection.'
        } else {
          message.value = 'Your payment was processed successfully.'
        }
      } else {
      success.value = false
      message.value = 'Your payment verification failed. If money was deducted, please contact support.'
    }
  } catch (error) {
    success.value = false
    message.value = 'An error occurred while verifying details. Please check your dashboard.'
  } finally {
    loading.value = false
  }
})

const goToDashboard = () => {
  // Redirect to matches for match unlock and subscription payments
  if (paymentPurpose.value === 'match_unlock' || paymentPurpose.value === 'subscription') {
    navigateTo('/matches')
  } else if (paymentPurpose.value === 'spark_deck') {
    navigateTo('/spark-deck')
  } else {
    navigateTo('/matches')
  }
}
</script>

<style>
.animate-check {
  animation: draw-check 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}

@keyframes draw-check {
  100% { stroke-dashoffset: 0; }
}
</style>
