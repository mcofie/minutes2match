<template>
  <main class="min-h-screen bg-[#FFFCF8] flex items-center justify-center p-4 font-sans text-stone-900 relative overflow-hidden">
    <!-- Fonts -->
    <Head>
      <Title>Sign In | Minutes 2 Match</Title>
    </Head>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Logo/Brand -->
      <div class="text-center mb-10">
        <NuxtLink to="/" class="inline-block mb-6">
           <img src="/logo-full.png" alt="minutes2match" class="h-28 w-auto object-contain hover:opacity-80 transition-opacity" />
        </NuxtLink>
        <h1 class="text-3xl font-serif font-bold tracking-tight text-black mt-4">
          {{ welcomeGreeting }}
        </h1>
        <p class="text-stone-500 mt-2 font-light">
          {{ welcomeSubtitle }}
        </p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black p-8 md:p-10 relative">
        
        <!-- Phone Input Step -->
        <div v-if="!otpSent" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <!-- TOP: PHONE INPUT -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-900">Phone Number</label>
              <div class="flex items-center w-full px-4 py-4 border-2 border-stone-200 rounded-[16px] bg-white focus-within:ring-0 focus-within:border-black transition-all group hover:border-stone-400 relative">
                <span class="font-bold text-stone-900 select-none mr-3 border-r-2 border-stone-100 pr-3 font-mono text-lg">+233</span>
                <input
                  type="tel"
                  inputmode="numeric"
                  pattern="[0-9 ]*"
                  v-model="formattedPhone"
                  placeholder="20 123 4567"
                  autocomplete="username webauthn"
                  class="flex-1 text-[17px] font-bold outline-none bg-transparent placeholder-stone-300 text-stone-900 font-mono tracking-widest pr-8"
                  maxlength="12"
                  @keydown="(e) => { 
                    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
                    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
                    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                  }"
                  @keyup.enter="isValidPhone && sendOtp()"
                />
                <button v-if="contactPickerSupported" @click.prevent="pickLoginContact" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                  <span class="text-xl">📱</span>
                </button>
              </div>
            </div>

            <!-- BUTTON CLOSE TO INPUT -->
            <button 
              :disabled="!isValidPhone || sending || isLoggingIn"
              @click="() => sendOtp()"
              class="w-full py-4 rounded-[16px] font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-stone-500 text-white hover:bg-stone-600 disabled:bg-stone-400 disabled:hover:bg-stone-400 border-2 border-transparent"
            >
              {{ sending ? 'Sending...' : 'Continue with Phone' }}
            </button>
          </div>

          <!-- BOTTOM: PASSKEY AS SECONDARY OPTION -->
          <div v-if="isPasskeySupported" class="space-y-8">
            <div class="flex items-center gap-4 p-2">
              <div class="h-[1px] flex-1 bg-stone-200"></div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-stone-300 whitespace-nowrap">OR ONE-TAP LOGIN</span>
              <div class="h-[1px] flex-1 bg-stone-200"></div>
            </div>

            <button 
              @click="handlePasskeyLogin"
              :disabled="sending || isLoggingIn"
              type="button"
              class="w-full py-4 rounded-[16px] font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] border-2 border-black flex items-center justify-center gap-3"
            >
              <span class="text-lg">{{ authMethod === 'passkey' ? '🧬' : '👋' }}</span>
              <span>{{ authMethod === 'passkey' ? 'Verifying Passkey...' : 'Continue with Passkey' }}</span>
            </button>
          </div>

          <p v-if="error" class="text-rose-500 text-sm text-center font-bold bg-rose-50 py-2 rounded border border-rose-200">{{ error }}</p>

          <div class="pt-6 text-center">
            <p class="text-sm text-stone-600 mb-3 font-light">New to minutes2match?</p>
            <NuxtLink to="/vibe-check" class="text-black font-bold uppercase tracking-widest text-xs border-b-2 border-rose-500 hover:text-rose-500 hover:border-black transition-colors pb-1">
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

          <!-- Auto-Failover UI Hint -->
          <div v-if="otpSent" class="pt-2 text-center h-4 flex items-center justify-center">
            <p v-if="fallbackTimer > 0" class="text-stone-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              Auto-requesting backup in {{ fallbackTimer }}s...
            </p>
            <p v-else-if="fallbackTriggered" class="text-rose-500 text-[10px] font-mono font-bold uppercase tracking-widest">
              Backup code sent! 📨
            </p>
          </div>

          <div class="flex flex-col gap-2 pt-4">
            <button 
              class="w-full text-stone-400 text-xs font-bold uppercase tracking-widest transition-colors py-2" 
              :class="sending ? 'opacity-50 cursor-not-allowed' : 'hover:text-black cursor-pointer'"
              :disabled="sending"
              @click="sendOtp('zend')"
            >
              {{ sending ? 'Sending...' : 'Resend Code' }}
            </button>
            <button class="w-full text-stone-400 text-xs uppercase tracking-widest hover:text-black transition-colors py-2 font-bold" @click="resetForm">
              ← Use different number
            </button>
          </div>
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

definePageMeta({
  middleware: 'guest'
})


const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Track if we're in the middle of a login attempt
const isLoggingIn = ref(false)


const phone = ref('')

const formattedPhone = computed({
  get: () => {
    const p = phone.value.replace(/\D/g, '')
    if (p.length === 0) return ''
    if (p.startsWith('0')) { // e.g. 020 123 4567
      if (p.length <= 3) return p
      if (p.length <= 6) return `${p.slice(0,3)} ${p.slice(3)}`
      return `${p.slice(0,3)} ${p.slice(3,6)} ${p.slice(6,10)}`
    } else { // e.g. 20 123 4567
      if (p.length <= 2) return p
      if (p.length <= 5) return `${p.slice(0,2)} ${p.slice(2)}`
      return `${p.slice(0,2)} ${p.slice(2,5)} ${p.slice(5,9)}`
    }
  },
  set: (val: string) => {
    phone.value = val.replace(/\D/g, '')
  }
})

const otpCode = ref('')
const otpSent = ref(false)
const sending = ref(false)
const verifying = ref(false)
const error = ref('')
const otpId = ref('')

const fallbackTimer = ref(0)
let fallbackInterval: ReturnType<typeof setInterval> | null = null
const fallbackTriggered = ref(false)

onUnmounted(() => {
  if (fallbackInterval) clearInterval(fallbackInterval)
})

const { isSupported: contactPickerSupported, pickContact } = useContactPicker()
const { isSupported: isPasskeySupported, isConditionalSupported, login: passkeyLogin } = usePasskeys()

const authMethod = ref<'otp' | 'passkey' | null>(null)
const storedName = ref('')

onMounted(async () => {
    storedName.value = localStorage.getItem('m2m_display_name') || ''
    
    // Auto-trigger Conditional UI (Quietly wait for browser autofill)
    if (isConditionalSupported.value) {
        try {
            const result = await passkeyLogin(true) // true = use mediation: 'conditional'
            if (result && result.success) {
                await signUserIn(result)
            }
        } catch (err) {
            // Background flow errors are expected if user cancels or just types manually
            console.log('[Auth] Conditional UI closed')
        }
    }
})

const welcomeGreeting = computed(() => {
    if (storedName.value) return `Welcome Back, ${storedName.value.split(' ')[0]}`
    return 'Welcome Back'
})

const welcomeSubtitle = computed(() => {
    if (storedName.value) return 'Ready for your next match?'
    return 'Sign in to your account'
})

const pickLoginContact = async () => {
  const result = await pickContact()
  if (result) {
    // Strip +233 if it was picked up from the contact book as our input adds it
    let cleanPhone = result.phone.replace(/^\+233/, '').replace(/^233/, '').replace(/^0+/, '')
    phone.value = cleanPhone
  }
}

const handlePasskeyLogin = async () => {
    error.value = ''
    authMethod.value = 'passkey'
    isLoggingIn.value = true

    try {
        const result = await passkeyLogin()
        if (result.success && result.email && result.password) {
            // Re-use logic for signing in and redirecting
            await signUserIn(result)
        }
    } catch (err: any) {
        const msg = err?.data?.message || err.message || 'Passkey login failed'
        error.value = msg
        toast.error('Passkey Login Failed', msg)
        authMethod.value = null
        isLoggingIn.value = false
    }
}

const signUserIn = async (result: any) => {
    // Sign in with the temporary password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password
    })

    if (signInError) {
        console.error('Sign in error:', signInError)
        throw new Error('Sign in failed. Please try again.')
    }

    console.log('[Login] signInWithPassword succeeded, user:', signInData.user?.id)

    // Wait for the @nuxtjs/supabase module to process onAuthStateChange
    // and populate the useSupabaseUser() composable + set cookies
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verify the composable has been updated
    for (let i = 0; i < 5; i++) {
        if (user.value) {
            console.log('[Login] useSupabaseUser() populated on attempt:', i + 1)
            break
        }
        // Force a session refresh to trigger the module to update
        await supabase.auth.getSession()
        await new Promise(r => setTimeout(r, 300))
    }

    const redirectPath = result.hasCompletedVibeCheck ? '/matches' : '/vibe-check?returnUser=true'
    
    // Use SPA navigation
    return navigateTo(redirectPath, { replace: true })
}

const isValidPhone = computed(() => {
  const cleaned = phone.value.replace(/\D/g, '')
  return cleaned.length >= 9
})

const fullPhone = computed(() => {
  return '+233' + phone.value.replace(/\D/g, '').replace(/^0+/, '')
})

const sendOtp = async (provider?: 'hubtel' | 'zend') => {
  if (!isValidPhone.value) return
  
  sending.value = true
  error.value = ''
  
  try {
    const { sendOTP } = useZend() // NOTE: It's useZend but now acts as useSMS orchestrator
    const result = await sendOTP(fullPhone.value, provider)
    otpId.value = result.otpId
    otpSent.value = true
    
    // Focus OTP input on next tick
    setTimeout(() => {
        document.getElementById('otp-input')?.focus()
    }, 100)

    // Autonomous UI Failover Strategy (45s visual countdown)
    if (!provider) { // Only start countdown on primary attempt
      fallbackTriggered.value = false
      fallbackTimer.value = 45
      if (fallbackInterval) clearInterval(fallbackInterval)
      
      fallbackInterval = setInterval(() => {
        if (fallbackTimer.value > 0) {
          fallbackTimer.value--
        } else {
          clearInterval(fallbackInterval!)
          if (otpSent.value && !verifying.value && !isLoggingIn.value) {
            fallbackTriggered.value = true
            toast.info('Network Warning', 'Network seems slow. Sending a backup verification code now...')
            console.log('[Login Auto-Failover] Firing Zend backup after 45s delay')
            // Silently trigger the backup SMS
            sendOtp('zend')
          }
        }
      }, 1000)
    } else if (provider === 'zend') {
      // If manually sending zend or auto-failover triggered, stop clock
      if (fallbackInterval) clearInterval(fallbackInterval)
      fallbackTimer.value = 0
    }

  } catch (err: any) {
    error.value = err.message || 'Failed to send code'
  } finally {
    sending.value = false
  }
}

const verifyOtp = async () => {
  if (otpCode.value.length !== 6) return
  
  verifying.value = true
  isLoggingIn.value = true
  error.value = ''
  
  try {
    if (fallbackInterval) clearInterval(fallbackInterval)

    // Call server-side login API - verifies OTP and returns credentials
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        phone: fullPhone.value,
        code: otpCode.value,
        otpId: otpId.value
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

      console.log('[Login] signInWithPassword succeeded, user:', signInData.user?.id)

      // Wait for the @nuxtjs/supabase module to process onAuthStateChange
      // and populate the useSupabaseUser() composable + set cookies
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify the composable has been updated
      for (let i = 0; i < 5; i++) {
        if (user.value) {
          console.log('[Login] useSupabaseUser() populated on attempt:', i + 1)
          break
        }
        // Force a session refresh to trigger the module to update
        await supabase.auth.getSession()
        await new Promise(r => setTimeout(r, 300))
      }

      const redirectPath = result.hasCompletedVibeCheck ? '/matches' : '/vibe-check?returnUser=true'
      
      // Store name for the greeting next time
      const res = result as any
      if (res.displayName) {
        localStorage.setItem('m2m_display_name', res.displayName)
      }

      // Use SPA navigation — keeps the in-memory session alive  
      return navigateTo(redirectPath, { replace: true })
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.message || err.message || 'Invalid code or account not found'
    verifying.value = false
    isLoggingIn.value = false
  }
}

const resetForm = () => {
  otpSent.value = false
  otpCode.value = ''
  otpId.value = ''
  error.value = ''
  fallbackTriggered.value = false
  if (fallbackInterval) clearInterval(fallbackInterval)
  fallbackTimer.value = 0
}
</script>
