<template>
  <div class="admin-verify">
    <div class="verify-container">
      <div class="loader"></div>
      <h1>Verifying Admin Access...</h1>
      <p>Securely logging you in.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const user = useSupabaseUser()
const router = useRouter()

// Watch for user session to be established
watch(user, (newUser) => {
  if (newUser) {
    // Session established, redirect to dashboard
    router.replace('/admin')
  }
}, { immediate: true })

// Fallback if stuck
onMounted(() => {
  setTimeout(() => {
    if (!user.value) {
      console.warn('Session verification taking longer than expected...')
    } else {
        router.replace('/admin')
    }
  }, 2000)
})
</script>

<style scoped>
.admin-verify {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  font-family: 'Quicksand', sans-serif;
}

.verify-container {
  text-align: center;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 1rem 0 0.5rem;
}

p {
  color: #666;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e5e5;
  border-top-color: #000;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
