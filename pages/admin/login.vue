<template>
  <div class="m2m-app m2m-admin admin-login">
    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.045] blur-3xl"></div>
    <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-48 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>
    <div class="admin-login__container">
      <!-- Logo / Header -->
      <div class="admin-login__header">
        <div class="admin-login__logo">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="admin-login__logo-img" />
        </div>
        <h1 class="admin-login__title">Admin portal</h1>
        <p class="admin-login__subtitle">Restricted access</p>
      </div>

      <!-- Email & Password Form -->
      <form @submit.prevent="handleLogin" class="admin-login__form">
        <div class="input-group">
          <label>Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="admin@example.com"
            class="admin-input"
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••"
            class="admin-input"
            autocomplete="current-password"
          />
        </div>

        <UiButton 
          variant="primary" 
          :disabled="loading || !email || !password"
          type="submit"
          class="admin-btn"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </UiButton>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="admin-login__error">
        {{ error }}
      </div>

      <!-- Dev Info -->
      <div v-if="isDev" class="admin-login__dev">
        <p><strong>Dev Mode:</strong> Use your admin email & password</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isDev = process.env.NODE_ENV === 'development' || import.meta.dev

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    console.log('[Admin Login] Attempting sign in for:', email.value)
    
    // Sign in with email and password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    if (signInError) {
      console.error('[Admin Login] Sign in error:', signInError)
      throw signInError
    }
    
    if (!data.user) {
      throw new Error('Login failed - no user returned')
    }
    
    console.log('[Admin Login] Signed in successfully, user ID:', data.user.id)
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('role')
      .eq('id', data.user.id)
      .single()
    
    console.log('[Admin Login] Admin check result:', { adminData, adminError })
    
    if (adminError || !adminData) {
      console.log('[Admin Login] User is not an admin, signing out')
      await supabase.auth.signOut()
      throw new Error('Access denied. You are not authorized to access the admin portal.')
    }
    
    const role = (adminData as any).role
    console.log('[Admin Login] Admin verified! Role:', role)
    
    // Wait for the @nuxtjs/supabase module to process the session
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Force a session refresh so the module fully syncs cookies
    await supabase.auth.getSession()
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('[Admin Login] Session synced, navigating to /admin')
    
    // Use SPA navigation to keep the in-memory session alive
    // window.location.replace() kills the session context and causes redirect loops on Safari
    return navigateTo('/admin', { replace: true })
    
  } catch (e: any) {
    console.error('[Admin Login] Error:', e)
    
    if (e.message?.includes('Invalid login credentials')) {
      error.value = 'Invalid email or password.'
    } else if (e.message?.includes('Access denied')) {
      error.value = e.message
    } else {
      error.value = e.message || 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Check if already admin on mount
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: adminData } = await supabase
        .from('admins')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (adminData) {
        navigateTo('/admin', { replace: true })
      }
    }
  } catch {
    // Not logged in, stay on login page
  }
})
</script>

<style scoped>
.admin-login {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(to bottom, #fff, #fff 40%, #f7f7f7);
  color: #393737;
}

.admin-login__container {
  position: relative;
  z-index: 1;
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 2.75rem 2rem;
  border-radius: 1.8rem;
  box-shadow: 0 18px 50px rgba(52, 38, 25, 0.10);
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.admin-login__header {
  margin-bottom: 2rem;
}

.admin-login__logo {
  position: relative;
  margin: 0 auto 1.5rem;
  height: 2rem;
  width: 140px;
  overflow: hidden;
}

.admin-login__logo-img {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 102px;
  width: auto;
  max-width: none;
  transform: translate(-50%, -50%);
}

.admin-login__title {
  font-size: 2rem;
  line-height: 1.1;
  margin: 0 0 0.5rem;
  color: #393737;
}

.admin-login__subtitle {
  color: #817a72;
  margin: 0;
  font-size: 0.875rem;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #524e4b;
}

.admin-input {
  width: 100%;
  padding: 0.85rem 1.1rem;
  border: 1px solid #ded9d2;
  border-radius: 9999px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #393737;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
}

.admin-input:focus {
  outline: none;
  border-color: #ed1c24;
  box-shadow: 0 0 0 4px rgba(237, 28, 36, 0.1);
}

.admin-input::placeholder {
  color: #9b9690;
}

.admin-btn {
  width: 100%;
  margin-top: 0.5rem;
  background-color: #ed1c24;
  color: white;
  border-radius: 9999px;
  padding: 0.9rem;
  font-weight: 500;
  font-size: 0.95rem;
  box-shadow: inset 0 2px 4px 0 rgba(255, 255, 255, 0.2), 0 8px 24px rgba(237, 28, 36, 0.18);
}

.admin-btn:not(:disabled):hover {
  background-color: #d71920;
}
.admin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-login__error {
  margin-top: 1.5rem;
  color: #EF4444;
  background: #FEF2F2;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #FEE2E2;
}

.admin-login__dev {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: #FEF3C7;
  border-radius: 1rem;
  font-size: 0.75rem;
  color: #B45309;
}

.admin-login__dev p {
  margin: 0;
}
</style>
