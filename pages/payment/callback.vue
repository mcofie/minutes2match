<template>
  <main class="min-h-screen flex items-center justify-center bg-stone-50 p-6 relative overflow-hidden">
    <!-- Subtle Background Pattern -->
    <div class="absolute inset-0 opacity-[0.4] pointer-events-none" style="background-image: radial-gradient(#a8a29e 1px, transparent 1px); background-size: 24px 24px;"></div>
    
    <!-- Card Container -->
    <div 
      class="relative w-full max-w-md bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8 sm:p-10 text-center overflow-hidden transition-all duration-700 ease-out transform"
      :class="loading ? 'scale-98 opacity-90' : 'scale-100 opacity-100 translate-y-0'"
    >
      
      <!-- Loading State -->
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center min-h-[300px]">
        <div class="w-12 h-12 rounded-full border-4 border-stone-100 border-t-stone-900 animate-spin mb-6"></div>
        <p class="text-stone-500 font-medium animate-pulse">Verifying payment...</p>
      </div>
      
      <!-- Success State -->
      <div v-else-if="success" class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <!-- Decoration Line -->
        <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>
        
        <!-- Animated Icon -->
        <div class="relative w-24 h-24 mb-6 group">
          <div class="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20 duration-1000"></div>
          <div class="relative w-full h-full bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
            <svg class="w-10 h-10 text-emerald-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" class="animate-check" />
            </svg>
          </div>
        </div>
        
        <h1 class="text-3xl font-serif font-black text-stone-900 mb-3 tracking-tight">Payment Successful</h1>
        <p class="text-stone-500 leading-relaxed mb-8 text-[15px] max-w-xs mx-auto">{{ message }}</p>
        
        <!-- Receipt/Info Box -->
        <div class="w-full bg-stone-50 rounded-xl p-4 mb-8 border border-stone-100 flex items-center justify-between text-sm shadow-inner shadow-stone-100/50">
           <span class="text-stone-500 font-medium">Status</span>
           <span class="text-emerald-600 font-bold flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm border border-emerald-100">
             <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             Confirmed
           </span>
        </div>

        <UiButton 
          variant="primary" 
          size="lg" 
          class="w-full justify-center !text-base !py-3.5 !rounded-xl shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 hover:-translate-y-0.5 transition-all duration-300" 
          @click="goToDashboard"
        >
          Continue to Dashboard
        </UiButton>
      </div>
      
      <!-- Error State -->
      <div v-else class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-400"></div>
        
        <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
          <svg class="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-serif font-black text-stone-900 mb-3">Payment Failed</h1>
        <p class="text-stone-500 leading-relaxed mb-8 max-w-xs mx-auto text-sm">{{ message }}</p>
        
        <UiButton variant="outline" size="lg" class="w-full justify-center !rounded-xl" @click="goToDashboard">
          Return to Dashboard
        </UiButton>
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
    const result = await verifyPayment(reference)
    
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
  // Redirect to matches tab for match unlock payments
  if (paymentPurpose.value === 'match_unlock') {
    navigateTo('/me?tab=matches')
  } else {
    navigateTo('/me')
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
