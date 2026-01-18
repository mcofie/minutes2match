<template>
  <div class="admin-login">
    <div class="admin-login__container">
      <!-- Logo / Header -->
      <div class="admin-login__header">
        <div class="admin-login__icon flex justify-center text-black">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h1 class="admin-login__title">Admin Portal</h1>
        <p class="admin-login__subtitle">Restricted Access</p>
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
      // User is not an admin - sign them out
      console.log('[Admin Login] User is not an admin, signing out')
      await supabase.auth.signOut()
      throw new Error('Access denied. You are not authorized to access the admin portal.')
    }
    
    // Safe access
    const role = (adminData as any).role
    console.log('[Admin Login] Admin verified! Role:', role)
    console.log('[Admin Login] Redirecting to /admin in 1 second...')
    
    // Wait a bit longer to ensure session is fully saved
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verify session is still valid before redirect
    const { data: { session } } = await supabase.auth.getSession()
    console.log('[Admin Login] Session before redirect:', session ? 'EXISTS' : 'MISSING')
    
    if (!session) {
      throw new Error('Session was not persisted. Please try again.')
    }
    
    // Force full page reload to /admin
    window.location.replace('/admin')
    
  } catch (e: any) {
    console.error('[Admin Login] Error:', e)
    
    // Handle specific error messages
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
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Check if admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (adminData) {
      router.push('/admin')
    }
  }
})
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  font-family: 'Inter', sans-serif;
}

.admin-login__container {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  border: 1px solid #E5E7EB;
}

.admin-login__header {
  margin-bottom: 2rem;
}

.admin-login__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.admin-login__title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #000;
}

.admin-login__subtitle {
  color: #6B7280;
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
  color: #374151;
}

.admin-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #F9FAFB;
}

.admin-input:focus {
  outline: none;
  background: white;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
}

.admin-input::placeholder {
  color: #9CA3AF;
}

.admin-btn {
  width: 100%;
  margin-top: 0.5rem;
  background-color: #000;
  color: white;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.admin-btn:hover {
  background-color: #1a1a1a;
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
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: left;
  border: 1px solid #FEE2E2;
}

.admin-login__dev {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: #FEF3C7;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #B45309;
}

.admin-login__dev p {
  margin: 0;
}
</style>
