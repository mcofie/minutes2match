<template>
  <main class="auth-page relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-white via-white to-[#f7f7f7] text-[#393737] antialiased">
    <Head>
      <Title>Sign In | Minutes 2 Match</Title>
    </Head>

    <!-- Soft glow + clouds, same as the landing hero -->
    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.045] blur-3xl"></div>
    <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-48 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>
    <svg aria-hidden="true" viewBox="0 0 440 230" class="cloud-drift pointer-events-none absolute -left-28 bottom-24 w-[280px] opacity-90 sm:-left-16 sm:w-[420px]">
      <defs><filter id="login-cloud-a" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="5" /></filter></defs>
      <g fill="#fff" filter="url(#login-cloud-a)">
        <ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" />
        <circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /><circle cx="352" cy="144" r="47" />
      </g>
    </svg>
    <svg aria-hidden="true" viewBox="0 0 500 250" class="cloud-drift cloud-drift-reverse pointer-events-none absolute -right-32 top-40 w-[300px] opacity-90 sm:-right-20 sm:w-[460px]">
      <defs><filter id="login-cloud-b" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="6" /></filter></defs>
      <g fill="#fff" filter="url(#login-cloud-b)">
        <ellipse cx="258" cy="173" rx="206" ry="57" /><circle cx="137" cy="144" r="59" /><circle cx="203" cy="105" r="82" />
        <circle cx="291" cy="85" r="91" /><circle cx="378" cy="113" r="80" /><circle cx="432" cy="151" r="57" />
      </g>
    </svg>

    <!-- Header -->
    <header class="relative z-20 h-14 bg-white sm:h-16">
      <div class="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center px-5 sm:px-8">
        <NuxtLink to="/" aria-label="Minutes 2 Match home" class="relative block h-7 w-[124px] overflow-hidden sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>
        <NuxtLink to="/" class="absolute left-3 flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[#6c6862] transition-colors hover:text-[#393737] sm:left-6">
          <span aria-hidden="true">←</span><span class="hidden sm:inline">Home</span><span class="sr-only sm:hidden">Back to home</span>
        </NuxtLink>
      </div>
    </header>

    <div class="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 xs:px-5 sm:pb-10">
      <!-- Heading -->
      <div class="rise rise-1 mb-6 mt-auto text-center sm:mb-8">
        <h1 class="font-display text-[clamp(1.75rem,8vw,2.125rem)] leading-[1.1] tracking-tight text-balance text-[#393737] sm:text-[2.5rem]">
          <template v-if="!otpSent">{{ welcomeGreeting }}</template>
          <template v-else>Check your phone</template>
        </h1>
        <p class="mx-auto mt-2.5 max-w-sm text-base leading-relaxed text-balance text-[#6c6862]">
          <template v-if="!otpSent">{{ welcomeSubtitle }}</template>
          <template v-else>We sent a 6-digit code to <span class="whitespace-nowrap font-semibold text-[#393737]">{{ fullPhone }}</span>{{ sentVia === 'telegram' ? ' on Telegram' : '' }}.</template>
        </p>
      </div>

      <!-- Form -->
      <div class="rise rise-2">
        <!-- Phone step -->
        <div v-if="!otpSent" class="space-y-5">
          <div v-if="isTMA" class="space-y-5">
            <button
              type="button"
              :disabled="sending || isLoggingIn"
              class="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#229ED9] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#1c8cc2] disabled:opacity-60"
              @click="handleTelegramLogin"
            >
              <span aria-hidden="true">✈️</span>
              {{ isLoggingIn ? 'Verifying…' : 'Continue with Telegram' }}
            </button>
            <div class="flex items-center gap-3 text-xs text-[#9b9690]"><span class="h-px flex-1 bg-[#ece8e3]"></span>or use your phone<span class="h-px flex-1 bg-[#ece8e3]"></span></div>
          </div>

          <form class="space-y-3" @submit.prevent="isValidPhone && sendOtp()">
            <label for="login-phone" class="sr-only">Phone number</label>
            <div class="relative flex w-full items-center rounded-full border border-[#ded9d2] bg-white px-3 shadow-[0_8px_28px_rgba(52,38,25,0.06)] transition-[border-color,box-shadow] focus-within:border-[#ed1c24] focus-within:ring-4 focus-within:ring-[#ed1c24]/10 xs:px-4">
              <label class="flex shrink-0 items-center border-r border-[#e8e2da] pr-2">
                <span class="sr-only">Country code</span>
                <select v-model="phoneCountry" aria-label="Country code" class="h-14 cursor-pointer bg-transparent pr-1 text-sm font-semibold text-[#393737] outline-none sm:text-base">
                  <option v-for="c in PHONE_COUNTRIES" :key="c.code" :value="c.code">{{ c.flag }} {{ c.code }}</option>
                </select>
              </label>
              <input
                id="login-phone"
                v-model="formattedPhone"
                type="tel"
                inputmode="numeric"
                :placeholder="getPhoneCountry(phoneCountry).example"
                autocomplete="username webauthn"
                maxlength="20"
                :aria-invalid="showPhoneHint"
                aria-describedby="login-phone-hint"
                class="no-spin min-w-0 w-full bg-transparent px-2.5 py-4 text-base xs:px-3 text-[#393737] outline-none placeholder:text-[#9b9690] sm:text-lg"
                :class="contactPickerSupported ? 'pr-10' : ''"
              />
              <button v-if="contactPickerSupported" type="button" class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#9b9690] transition-colors hover:bg-[#f6f5f4] hover:text-[#ed1c24]" title="Choose from contacts" aria-label="Choose from contacts" @click.prevent="pickLoginContact">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M16 2v2M8 2v2" /><rect x="3" y="4" width="18" height="18" rx="2" /><circle cx="12" cy="11" r="3" /><path d="M7 19a5 5 0 0 1 10 0" /></svg>
              </button>
            </div>

            <p v-if="showPhoneHint" id="login-phone-hint" class="px-4 text-sm text-[#b4232a]">
              Enter a valid {{ getPhoneCountry(phoneCountry).name }} number, e.g. {{ getPhoneCountry(phoneCountry).example }}
            </p>

            <button
              type="submit"
              :disabled="!isValidPhone || sending || isLoggingIn"
              class="btn-solid grain grain-strong w-full px-6 py-4 xs:px-8 text-base shadow-[0_8px_24px_rgba(237,28,36,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:text-lg"
            >
              <template v-if="sending">Sending code…</template>
              <template v-else>Continue <span aria-hidden="true">→</span></template>
            </button>
          </form>

          <template v-if="isPasskeySupported">
            <div class="flex items-center gap-3 text-xs text-[#9b9690]"><span class="h-px flex-1 bg-[#ece8e3]"></span>or<span class="h-px flex-1 bg-[#ece8e3]"></span></div>
            <button
              type="button"
              :disabled="sending || isLoggingIn"
              class="btn-white w-full px-6 py-4 text-base xs:px-8 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handlePasskeyLogin"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0" aria-hidden="true"><circle cx="8" cy="8" r="5" /><path d="M12.5 10.5 21 19l-2 2-1.5-1.5L16 21l-2-2 1.5-1.5-3.5-3.5" /></svg>
              {{ authMethod === 'passkey' ? 'Verifying passkey…' : 'Sign in with a passkey' }}
            </button>
          </template>

          <p v-if="error" role="alert" class="rounded-2xl bg-[#fff1f1] px-4 py-3 text-center text-sm text-[#b4232a]">{{ error }}</p>
        </div>

        <!-- Code step -->
        <form v-else class="space-y-5" @submit.prevent="otpCode.length === 6 && verifyOtp()">
          <label for="otp-input" class="sr-only">6-digit verification code</label>
          <input
            id="otp-input"
            v-model="otpCode"
            type="tel"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="••••••"
            maxlength="6"
            class="no-spin w-full rounded-full border border-[#ded9d2] bg-white py-4 pl-[0.35em] text-center font-display text-2xl tracking-[0.35em] text-[#393737] xs:pl-[0.5em] xs:text-3xl xs:tracking-[0.5em] shadow-[0_8px_28px_rgba(52,38,25,0.06)] outline-none transition-[border-color,box-shadow] placeholder:text-[#d9d4ce] focus:border-[#ed1c24] focus:ring-4 focus:ring-[#ed1c24]/10"
          />

          <button
            type="submit"
            :disabled="otpCode.length !== 6 || verifying"
            class="btn-solid grain grain-strong w-full px-6 py-4 xs:px-8 text-base shadow-[0_8px_24px_rgba(237,28,36,0.2)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:text-lg"
          >
            {{ verifying ? 'Signing you in…' : 'Sign in' }}
          </button>

          <p v-if="error" role="alert" class="rounded-2xl bg-[#fff1f1] px-4 py-3 text-center text-sm text-[#b4232a]">{{ error }}</p>

          <p class="h-4 text-center text-xs text-[#9b9690]" aria-live="polite">
            <template v-if="fallbackTimer > 0">Sending a backup code in {{ fallbackTimer }}s</template>
            <template v-else-if="fallbackTriggered">Backup code sent 📨</template>
          </p>

          <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#f1eeea] pt-4 text-sm">
            <button type="button" class="rounded-full px-2 py-2 font-medium text-[#6c6862] transition-colors hover:text-[#393737]" @click="resetForm">← Different number</button>
            <button type="button" :disabled="sending" class="rounded-full px-2 py-2 font-medium text-[#ed1c24] transition-colors hover:text-[#b4232a] disabled:opacity-50" @click="sendOtp('zend')">
              {{ sending ? 'Sending…' : 'Resend code' }}
            </button>
          </div>
        </form>
      </div>

      <footer class="rise rise-3 mt-auto pt-12 text-center">
        <div class="flex items-center justify-center gap-2 text-xs font-medium text-[#66615d]">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-black/5"><span aria-hidden="true">🇬🇭</span> Accra</span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-black/5"><span aria-hidden="true">🇰🇪</span> Nairobi</span>
        </div>
        <nav aria-label="Help and legal" class="mt-5 flex items-center justify-center gap-5 text-sm text-[#6c6862]">
          <a href="mailto:hello@minutes2match.com" class="transition-colors hover:text-[#393737]">Help</a>
          <NuxtLink to="/terms" class="transition-colors hover:text-[#393737]">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="transition-colors hover:text-[#393737]">Privacy</NuxtLink>
        </nav>
        <p class="mt-3 text-xs text-[#9b9690]">© {{ new Date().getFullYear() }} Minutes 2 Match</p>
      </footer>
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
const phoneCountry = ref<PhoneCountryCode>('+233')

// Typing or pasting +233… / +254… switches the country automatically
const setPhoneInput = (raw: string) => {
  const { country, local } = parsePhoneInput(raw, phoneCountry.value)
  phoneCountry.value = country
  phone.value = local
}
const formattedPhone = computed({
  get: () => phone.value,
  set: (val: string | number) => setPhoneInput(val.toString())
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

    // 2. Coming from the landing page with a registered number: prefill and text the code straight away
    const route = useRoute()
    if (typeof route.query.phone === 'string' && !isTMARaw.value) {
        // A "+" in a query string can arrive decoded as a space
        setPhoneInput(route.query.phone.trim().replace(/^(233|254)/, '+$1'))
        // Drop the query so a refresh doesn't resend the code
        await navigateTo({ path: '/login', query: { ...route.query, phone: undefined } }, { replace: true })
        if (isValidPhone.value) {
            await sendOtp()
            return
        }
    }

    // 3. Auto-trigger Conditional UI (Quietly wait for browser autofill for Web Users)
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
    if (storedName.value) return `Welcome back, ${storedName.value.split(' ')[0]}.`
    return 'Welcome back.'
})

const welcomeSubtitle = computed(() => {
    if (storedName.value) return 'Ready for your next match?'
    return 'Sign in with your phone number to see your matches.'
})

const pickLoginContact = async () => {
  const result = await pickContact()
  if (result) {
    setPhoneInput(result.phone)
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

const isValidPhone = computed(() => isValidLocalPhone(phone.value, phoneCountry.value))
// Only nag once the number looks complete
const showPhoneHint = computed(() => stripTrunkZero(phone.value).length >= 9 && !isValidPhone.value)

const fullPhone = computed(() => toE164(phone.value, phoneCountry.value))

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

<style scoped>
.auth-page {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.font-display {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.03em;
}

.rise { animation: rise-in 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
.rise-1 { animation-delay: 60ms; }
.rise-2 { animation-delay: 160ms; }
.rise-3 { animation-delay: 260ms; }
@keyframes rise-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.cloud-drift {
  animation: cloud-drift 32s ease-in-out infinite alternate;
  will-change: transform;
}
.cloud-drift-reverse {
  animation-duration: 40s;
  animation-direction: alternate-reverse;
}
@keyframes cloud-drift {
  from { transform: translate3d(-1.25rem, 0, 0) scale(0.96); }
  to { transform: translate3d(2rem, 0.75rem, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .rise, .cloud-drift { animation: none; }
}

/* Buttons (match the landing page) */
.btn-solid,
.btn-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border-width: 1px;
  font-weight: 500;
  white-space: nowrap;
  transition: color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms;
}
.btn-solid {
  background-color: #ed1c24;
  color: #fff;
  border-color: transparent;
  box-shadow: inset 0 2px 4px 0 rgba(255, 255, 255, 0.2);
}
.btn-solid:not(:disabled):hover { background-color: #d71920; }
.btn-white {
  background-color: #fff;
  color: #393737;
  border-color: #ded9d2;
}
.btn-white:not(:disabled):hover { background-color: #f6f5f4; }
.grain {
  position: relative;
  overflow: hidden;
}
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: var(--grain-opacity, 0.3);
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}
.grain-strong { --grain-opacity: 0.55; }
</style>
