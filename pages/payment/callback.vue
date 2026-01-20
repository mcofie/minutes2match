<template>
  <main class="callback">
    <div class="callback__container">
      <div v-if="loading" class="callback__loading">
        <div class="callback__spinner"></div>
        <p>Verifying your payment...</p>
      </div>
      
      <div v-else-if="success" class="callback__success">
        <span class="callback__icon">✓</span>
        <h1>Payment Successful!</h1>
        <p>{{ message }}</p>
        <UiButton variant="primary" size="lg" :rounded="false" @click="goToDashboard">
          Go to Dashboard
        </UiButton>
      </div>
      
      <div v-else class="callback__error">
        <span class="callback__icon callback__icon--error">✕</span>
        <h1>Payment Failed</h1>
        <p>{{ message }}</p>
        <UiButton variant="outline" size="lg" :rounded="false" @click="goToDashboard">
          Return to Dashboard
        </UiButton>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

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
    const { verifyPayment } = usePaystack()
    const result = await verifyPayment(reference)
    
      if (result.status === 'success') {
        success.value = true
        
        if (result.metadata?.purpose === 'event_ticket') {
          message.value = 'Your event booking has been confirmed! Check your messages for details.'
        } else if (result.metadata?.purpose === 'match_unlock') {
          // Check if match is fully unlocked or waiting for other user
          message.value = 'You\'ve unlocked this match! They\'ve been notified via SMS. Once they unlock you back, you\'ll both see each other\'s full profiles.'
        } else {
          message.value = 'Your payment was processed successfully.'
        }
      } else {
      success.value = false
      message.value = 'Your payment could not be verified. Please contact support if the payment was deducted.'
    }
  } catch (error) {
    success.value = false
    message.value = 'An error occurred while verifying your payment.'
  } finally {
    loading.value = false
  }
})

const goToDashboard = () => {
  navigateTo('/me')
}
</script>

<style scoped>
.callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-main);
  padding: 2rem;
}

.callback__container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.callback__loading {
  padding: 3rem;
}

.callback__spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--color-bg-main);
  border-top-color: var(--color-brand-primary);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.callback__success,
.callback__error {
  background: var(--color-bg-card);
  padding: 3rem 2rem;
  border: 1px solid var(--color-bg-main);
}

.callback__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #10B981;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.callback__icon--error {
  background: #EF4444;
}

.callback__success h1,
.callback__error h1 {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  margin: 0 0 1rem;
}

.callback__success p,
.callback__error p {
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  line-height: 1.5;
}
</style>
