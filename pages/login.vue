<template>
  <main class="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans text-stone-900">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 tracking-tight shadow-md">m</div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Welcome Back</h1>
        <p class="text-stone-500 mt-2">Sign in to your account</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        
        <!-- Phone Input Step -->
        <div v-if="!otpSent" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Phone Number</label>
            <div class="flex items-center w-full px-4 py-2 rounded-xl border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all group hover:border-stone-300">
              <span class="font-bold text-stone-500 select-none mr-3 border-r border-stone-100 pr-3">+233</span>
              <input
                type="tel"
                v-model="phone"
                placeholder="XX XXX XXXX"
                class="flex-1 py-2 text-lg font-medium outline-none bg-transparent placeholder-stone-300 text-stone-900"
                maxlength="10"
                @keyup.enter="isValidPhone && sendOtp()"
              />
            </div>
          </div>

          <UiButton 
            variant="primary"
            size="lg"
            :disabled="!isValidPhone || sending"
            @click="sendOtp"
            class="w-full"
          >
            {{ sending ? 'Sending Code...' : 'Continue with Phone' }}
          </UiButton>

          <p v-if="error" class="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{{ error }}</p>

          <div class="border-t border-stone-100 pt-6 mt-6 text-center">
            <p class="text-sm text-stone-400 mb-3">New to minutes2match?</p>
            <NuxtLink to="/vibe-check" class="text-black font-semibold hover:underline text-sm">
              Take the Vibe Check →
            </NuxtLink>
          </div>
        </div>

        <!-- OTP Verification Step -->
        <div v-else class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="text-center">
             <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-600 mb-4">
                <span>Sent to +233 {{ phone }}</span>
             </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500 text-center">Verification Code</label>
            <input
              type="text"
              v-model="otpCode"
              placeholder="000000"
              class="w-full py-4 text-3xl font-bold tracking-[0.5em] text-center outline-none bg-transparent border-b-2 border-stone-200 focus:border-black transition-colors placeholder-stone-200"
              maxlength="6"
              @keyup.enter="otpCode.length === 6 && verifyOtp()"
              id="otp-input"
            />
          </div>

          <UiButton 
            variant="primary"
            size="lg"
            :disabled="otpCode.length !== 6 || verifying"
            @click="verifyOtp"
            class="w-full"
          >
            {{ verifying ? 'Verifying...' : 'Sign In' }}
          </UiButton>

          <p v-if="error" class="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{{ error }}</p>

          <button class="w-full text-stone-400 text-sm hover:text-black transition-colors py-2 font-medium" @click="resetForm">
            ← Use different number
          </button>
        </div>
      </div>
      
      <!-- Footer details -->
      <div class="text-center mt-8 text-xs text-stone-400">
        <p>&copy; {{ new Date().getFullYear() }} Minutes 2 Match. All rights reserved.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

useHead({
  title: 'Sign In',
  meta: [
    { name: 'description', content: 'Sign in to your Minutes 2 Match account to view your matches and upcoming events.' }
  ]
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Track if we're in the middle of a login attempt
const isLoggingIn = ref(false)

// If user is already logged in on page load, redirect to /me
// But don't redirect during the login process (we handle that after verifyOtp)
onMounted(() => {
  if (user.value?.id && !isLoggingIn.value) {
    console.log('[Login] User already authenticated on mount, redirecting to /me')
    navigateTo('/me')
  }
})

const phone = ref('')
const otpCode = ref('')
const otpSent = ref(false)
const sending = ref(false)
const verifying = ref(false)
const error = ref('')

const isValidPhone = computed(() => {
  const cleaned = phone.value.replace(/\D/g, '')
  return cleaned.length >= 9
})

const fullPhone = computed(() => {
  return '+233' + phone.value.replace(/\D/g, '').replace(/^0+/, '')
})

const sendOtp = async () => {
  if (!isValidPhone.value) return
  
  sending.value = true
  error.value = ''
  
  try {
    const { sendOTP } = useHubtel()
    await sendOTP(fullPhone.value)
    otpSent.value = true
    // Focus OTP input on next tick
    setTimeout(() => {
        document.getElementById('otp-input')?.focus()
    }, 100)
  } catch (err: any) {
    error.value = err.message || 'Failed to send code'
  } finally {
    sending.value = false
  }
}

const verifyOtp = async () => {
  if (otpCode.value.length !== 6) return
  
  verifying.value = true
  isLoggingIn.value = true // Prevent redirect loop
  error.value = ''
  
  try {
    // Call server-side login API - verifies OTP and returns credentials
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        phone: fullPhone.value,
        code: otpCode.value
      }
    })

    if (result.success && result.email && result.password) {
      // Sign in with the temporary password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        throw new Error('Sign in failed. Please try again.')
      }

      console.log('[Login] Sign in successful, session:', signInData.session?.user?.id)
      
      // Wait for the session to be properly established
      // The @nuxtjs/supabase module needs time to detect the session change
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify the user is now available
      const currentUser = useSupabaseUser()
      console.log('[Login] User after wait:', currentUser.value?.id)
      
      // Use window.location for a full page reload to ensure session is detected
      window.location.href = '/me'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.message || err.message || 'Invalid code or account not found'
  } finally {
    verifying.value = false
  }
}

const resetForm = () => {
  otpSent.value = false
  otpCode.value = ''
  error.value = ''
}
</script>
