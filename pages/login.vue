<template>
  <main class="min-h-screen bg-[#FFFCF8] flex items-center justify-center p-4 font-sans text-stone-900 relative overflow-hidden">
    <!-- Fonts -->
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <Link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo/Brand -->
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-block text-3xl font-serif italic font-bold tracking-tight mb-2 hover:text-rose-500 transition-colors">
           minutes2match.
        </NuxtLink>
        <h1 class="text-3xl font-serif font-bold tracking-tight text-black mt-4">Welcome Back</h1>
        <p class="text-stone-500 mt-2 font-light">Sign in to your account</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black p-8 md:p-10 relative">
        
        <!-- Phone Input Step -->
        <div v-if="!otpSent" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900">Phone Number</label>
            <div class="flex items-center w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus-within:ring-0 focus-within:border-black transition-all group hover:border-stone-400">
              <span class="font-bold text-stone-900 select-none mr-3 border-r-2 border-stone-200 pr-3 font-mono">+233</span>
              <input
                type="tel"
                v-model="phone"
                placeholder="20 123 4567"
                class="flex-1 text-lg font-bold outline-none bg-transparent placeholder-stone-300 text-stone-900 font-mono tracking-wide"
                maxlength="10"
                @keyup.enter="isValidPhone && sendOtp()"
              />
            </div>
          </div>

          <button 
            :disabled="!isValidPhone || sending"
            @click="sendOtp"
            class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
          >
            {{ sending ? 'Sending Code...' : 'Continue' }}
          </button>

          <p v-if="error" class="text-rose-500 text-sm text-center font-bold bg-rose-50 py-2 rounded border border-rose-200">{{ error }}</p>

          <div class="border-t-2 border-stone-100 pt-6 mt-6 text-center">
            <p class="text-sm text-stone-500 mb-3">New to minutes2match?</p>
            <NuxtLink to="/vibe-check" class="text-black font-bold uppercase tracking-wider text-xs border-b-2 border-rose-500 hover:text-rose-500 transition-colors pb-0.5">
              Take the Vibe Check
            </NuxtLink>
          </div>
        </div>

        <!-- OTP Verification Step -->
        <div v-else class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="text-center">
             <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black bg-stone-100 text-xs font-bold text-stone-900 mb-6 font-mono">
                <span>Sent to +233 {{ phone }}</span>
             </div>
          </div>

          <div class="space-y-4">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 text-center">Verification Code</label>
            <input
              type="text"
              v-model="otpCode"
              placeholder="000000"
              class="w-full py-4 text-4xl font-bold tracking-[0.5em] text-center outline-none bg-transparent border-b-4 border-stone-200 focus:border-black transition-colors placeholder-stone-200 font-mono"
              maxlength="6"
              @keyup.enter="otpCode.length === 6 && verifyOtp()"
              id="otp-input"
            />
          </div>

          <button 
            :disabled="otpCode.length !== 6 || verifying"
            @click="verifyOtp"
            class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black mt-8"
          >
            {{ verifying ? 'Verifying...' : 'Sign In' }}
          </button>

          <p v-if="error" class="text-rose-500 text-sm text-center font-bold bg-rose-50 py-2 rounded border border-rose-200">{{ error }}</p>

          <button class="w-full text-stone-400 text-xs uppercase tracking-widest hover:text-black transition-colors py-2 font-bold" @click="resetForm">
            ← Use different number
          </button>
        </div>
      </div>
      
      <!-- Footer details -->
      <div class="text-center mt-12 text-xs font-mono text-stone-400">
        <p>&copy; {{ new Date().getFullYear() }} Minutes 2 Match. <br/>Made with ❤️ in Accra.</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
// UiButton is replaced by standard html button with tailwind for style consistency


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
      
      // Redirect based on vibe check completion status
      if (result.hasCompletedVibeCheck) {
        // User has completed vibe check, go to dashboard
        window.location.href = '/me'
      } else {
        // User hasn't completed vibe check, redirect to complete it
        console.log('[Login] User needs to complete vibe check')
        window.location.href = '/vibe-check?returnUser=true'
      }
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
