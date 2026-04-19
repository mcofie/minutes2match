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
          
          <div v-if="isTMA" class="space-y-4">
            <button 
              @click="handleTelegramLogin"
              :disabled="sending || isLoggingIn"
              class="w-full py-4 rounded-[16px] font-bold uppercase tracking-widest text-sm transition-all bg-[#0088cc] text-white hover:bg-[#0077b5] border-2 border-[#0088cc] flex items-center justify-center gap-3"
            >
              <span class="text-xl">✈️</span>
              <span>{{ isLoggingIn ? 'Verifying...' : 'Continue with Telegram' }}</span>
            </button>
            <div class="flex items-center gap-4 p-2">
              <div class="h-[1px] flex-1 bg-stone-200"></div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-stone-300 whitespace-nowrap">OR USE PHONE</span>
              <div class="h-[1px] flex-1 bg-stone-200"></div>
            </div>
          </div>

          <!-- TOP: PHONE INPUT -->
          <div class="space-y-4">

            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-900">Phone Number</label>
              <div class="flex items-center w-full px-4 py-4 border-2 border-stone-200 rounded-[16px] bg-white focus-within:ring-0 focus-within:border-black transition-all group hover:border-stone-400 relative">
                <span class="flex items-center gap-1 font-bold text-stone-900 select-none mr-3 border-r-2 border-stone-100 pr-3 font-mono text-lg">
                  <span>🇬🇭</span>
                  <span>+233</span>
                </span>
                <input
                  type="tel"
                  inputmode="numeric"
                  v-model="formattedPhone"
                  placeholder="201234567"
                  autocomplete="username webauthn"
                  class="flex-1 text-[17px] font-bold outline-none bg-transparent placeholder-stone-300 text-stone-900 font-mono tracking-widest pr-8 no-spin"
                  maxlength="15"
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
              class="w-full py-4 rounded-[16px] font-bold uppercase tracking-widest text-sm transition-all border-2 active:scale-[0.98] disabled:cursor-not-allowed"
              :class="!isValidPhone || sending || isLoggingIn 
                ? 'bg-stone-100 text-stone-400 border-stone-200' 
                : 'bg-rose-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer'"
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
              class="w-full py-4 rounded-[16px] font-bold uppercase tracking-widest text-sm transition-all border-2 active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3"
              :class="sending || isLoggingIn
                ? 'bg-stone-100 text-stone-400 border-stone-200 shadow-none'
                : 'bg-rose-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer'"
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
             <div class="inline-flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-black bg-stone-100 text-stone-900 mb-6 font-mono">
                <span class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Check your {{ sentVia === 'telegram' ? 'Telegram ✉️' : 'SMS 📱' }}</span>
                <span class="text-xs font-bold">{{ fullPhone }}</span>
             </div>
          </div>

          <div class="space-y-4">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 text-center">Verification Code</label>
            <input
              type="tel"
              inputmode="numeric"
              v-model="otpCode"
              placeholder="000000"
              class="w-full py-4 text-4xl font-bold tracking-[0.5em] text-center outline-none bg-transparent border-b-4 border-stone-200 focus:border-black transition-colors placeholder-stone-200 font-mono no-spin"
              maxlength="6"
              @keyup.enter="otpCode.length === 6 && verifyOtp()"
              id="otp-input"
            />
          </div>

          <button 
            :disabled="otpCode.length !== 6 || verifying"
            @click="verifyOtp"
            class="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all border-2 active:scale-[0.98] disabled:cursor-not-allowed mt-8"
            :class="otpCode.length !== 6 || verifying
              ? 'bg-stone-100 text-stone-400 border-stone-200 shadow-none'
              : 'bg-rose-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer'"
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
const { isTMA: isTMARaw, initData, tgUser } = useTelegram()
const isMounted = ref(false)
const isTMA = computed(() => isMounted.value && isTMARaw.value)

// Track if we're in the middle of a login attempt
const isLoggingIn = ref(false)


const phone = ref('')

const formattedPhone = computed({
  get: () => phone.value.replace(/\D/g, ''),
  set: (val: string | number) => {
    phone.value = val.toString().replace(/\D/g, '')
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
const sentVia = ref('')

onUnmounted(() => {
  if (fallbackInterval) clearInterval(fallbackInterval)
})

const { isSupported: contactPickerSupported, pickContact } = useContactPicker()
const { isSupported: isPasskeySupported, isConditionalSupported, login: passkeyLogin } = usePasskeys()

const authMethod = ref<'otp' | 'passkey' | null>(null)
const storedName = ref('')

onMounted(async () => {
    isMounted.value = true
    storedName.value = localStorage.getItem('m2m_display_name') || ''
    
    // 1. Telegram Zero-Friction Auto-Login
    if (isTMARaw.value && initData.value && !user.value) {
        console.log('[Login] Telegram Mini App detected. Attempting Auto-Login...');
        await handleTelegramLogin();
        // If login succeeds, it redirects. Thus, we return early to avoid firing conditional UI.
        if (user.value) return; 
    }

    // 2. Auto-trigger Conditional UI (Quietly wait for browser autofill for Web Users)
    if (isConditionalSupported.value && !isTMARaw.value) {
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

const handleTelegramLogin = async () => {
    if (!initData.value) return

    error.value = ''
    isLoggingIn.value = true

    try {
        const result = await $fetch<any>('/api/auth/telegram', {
            method: 'POST',
            body: { initData: initData.value }
        })

        if (result.success && result.isRegistered) {
            await signUserIn(result)
        } else {
            // User not registered - prompt them to link their phone
            error.value = 'Telegram account not linked. Please sign in with your phone once to link your Telegram account.'
            toast.info('Linking Required', 'Sign in with your phone once to link your Telegram account.')
        }
    } catch (err: any) {
        error.value = err.data?.message || 'Telegram login failed'
    } finally {
        isLoggingIn.value = false
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

    // 1.5. Link Telegram ID if in TMA
    if (isTMA.value && tgUser.value && signInData.user) {
        try {
            // First check if they already have a photo
            const { data: profile } = await supabase
                .schema('m2m')
                .from('profiles')
                .select('photo_url')
                .eq('id', signInData.user.id)
                .single()

            const updateData: any = { telegram_id: tgUser.value.id.toString() }
            if (profile && !profile.photo_url && tgUser.value.photo_url) {
                updateData.photo_url = tgUser.value.photo_url
            }

            await supabase
                .schema('m2m')
                .from('profiles')
                .update(updateData)
                .eq('id', signInData.user.id)
            console.log('[Login] Linked Telegram Profile:', updateData)
        } catch (linkError) {
            console.error('[Login] Failed to link Telegram Info:', linkError)
        }
    }

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
  // Handles 201234567 (9), 0201234567 (10), or 233201234567 (12)
  return cleaned.length >= 9 && cleaned.length <= 15
})

const fullPhone = computed(() => {
  let cleaned = phone.value.replace(/\D/g, '')
  
  // If user typed +233 or 233, just use it
  if (cleaned.startsWith('233') && cleaned.length >= 12) {
    return '+' + cleaned
  }
  
  // Otherwise, handle leading zero and prepend 233
  return '+233' + cleaned.replace(/^0+/, '')
})

const sendOtp = async (provider?: 'hubtel' | 'zend') => {
  if (!isValidPhone.value) return
  
  sending.value = true
  error.value = ''
  
  try {
    const { sendOTP } = useZend() // NOTE: It's useZend but now acts as useSMS orchestrator
    const result = await sendOTP(fullPhone.value, provider)
    otpId.value = result.otpId
    sentVia.value = result.provider || 'sms'
    otpSent.value = true
    
    // Focus OTP input on next tick
    setTimeout(() => {
        document.getElementById('otp-input')?.focus()
    }, 100)

    // Autonomous UI Failover Strategy (45s visual countdown)
    if (!provider) { // Only start countdown on primary attempt
      fallbackTriggered.value = false
      fallbackTimer.value = 60
      if (fallbackInterval) clearInterval(fallbackInterval)
      
      fallbackInterval = setInterval(() => {
        if (fallbackTimer.value > 0) {
          fallbackTimer.value--
        } else {
          clearInterval(fallbackInterval!)
          if (otpSent.value && !verifying.value && !isLoggingIn.value) {
            fallbackTriggered.value = true
            toast.info('Network Warning', 'Network seems slow. Sending a backup verification code now...')
            console.log('[Login Auto-Failover] Firing Zend backup after 60s delay')
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
