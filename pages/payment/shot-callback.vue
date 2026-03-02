<template>
  <main class="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6 relative overflow-hidden">
    <Head>
      <Title>Payment | Minutes 2 Match</Title>
    </Head>
    
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-[0.4] pointer-events-none" style="background-image: radial-gradient(#a8a29e 1px, transparent 1px); background-size: 24px 24px;"></div>
    
    <!-- Card Container -->
    <div 
      class="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800 p-8 sm:p-10 text-center overflow-hidden transition-all duration-700 ease-out"
      :class="loading ? 'scale-98 opacity-90' : 'scale-100 opacity-100'"
    >
      <!-- Loading -->
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center min-h-[300px]">
        <div class="w-12 h-12 rounded-full border-4 border-stone-100 dark:border-stone-800 border-t-rose-500 animate-spin mb-6"></div>
        <p class="text-stone-500 dark:text-stone-400 font-medium animate-pulse">Confirming your payment...</p>
      </div>
      
      <!-- Success -->
      <div v-else-if="success" class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400"></div>
        
        <div class="relative w-24 h-24 mb-6">
          <div class="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-20 duration-1000"></div>
          <div class="relative w-full h-full bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50 dark:ring-emerald-900/20">
            <span class="text-5xl">🎯</span>
          </div>
        </div>
        
        <h1 class="text-3xl font-serif font-black text-stone-900 dark:text-stone-100 mb-3 tracking-tight">Shot Fired!</h1>
        <p class="text-stone-500 dark:text-stone-400 leading-relaxed mb-8 text-[15px] max-w-xs mx-auto">
          Your payment is confirmed. They'll receive a mystery SMS any moment now. 💫
        </p>

        <div class="w-full bg-stone-50 dark:bg-stone-800 rounded-xl p-4 mb-8 border border-stone-100 dark:border-stone-700 space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-stone-500 dark:text-stone-400 font-medium">Status</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              SMS Sent
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-stone-500 dark:text-stone-400 font-medium">What's next?</span>
            <span class="text-stone-700 dark:text-stone-300 font-medium">They tap to unlock your identity</span>
          </div>
        </div>
        
        <NuxtLink to="/" class="w-full bg-black dark:bg-stone-100 text-white dark:text-black py-3.5 rounded-xl font-bold transition-all hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white block text-center">
          Back to Home
        </NuxtLink>
      </div>
      
      <!-- Error/Failed -->
      <div v-else class="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 via-rose-500 to-red-400"></div>
        
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-900/20">
          <svg class="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-serif font-black text-stone-900 dark:text-stone-100 mb-3">Payment Failed</h1>
        <p class="text-stone-500 dark:text-stone-400 leading-relaxed mb-8 max-w-xs mx-auto text-sm">{{ message }}</p>
        
        <NuxtLink to="/shoot-your-shot" class="w-full border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 py-3.5 rounded-xl font-bold transition-all hover:border-stone-400 dark:hover:border-stone-500 block text-center">
          Try Again
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(async () => {
  const reference = route.query.reference as string
  
  if (!reference) {
    success.value = false
    message.value = 'No payment reference found.'
    loading.value = false
    return
  }

  try {
    // Verify payment via our existing Paystack verify endpoint
    const { verifyPayment } = usePaystack()
    const result = await verifyPayment(reference) as any

    if (result.status === 'success') {
      success.value = true
    } else {
      success.value = false
      message.value = 'Payment verification failed. If money was deducted, please contact support.'
    }
  } catch (error) {
    success.value = false
    message.value = 'An error occurred while verifying your payment.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
