<template>
  <div>
    <div v-if="loading" class="state-loading">Loading settings...</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Pricing Settings -->
      <section class="admin-card">
        <div class="admin-card__header mb-6 pb-4 border-b border-gray-100">
          <h2 class="admin-card__title m-0">Pricing Configuration</h2>
          <p class="admin-card__subtitle">Manage global pricing tiers</p>
        </div>
        
        <div class="flex flex-col gap-5">
          <div class="form-group">
            <label class="form-label">Match Unlock Fee (GH₵)</label>
            <input
              type="number"
              v-model.number="settings.default_match_unlock_fee"
              min="0"
              step="1"
              class="form-input"
            />
            <p class="text-xs text-muted mt-1">Default price to unlock a match profile</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Male Ticket (GH₵)</label>
              <input
                type="number"
                v-model.number="settings.default_male_ticket_price"
                min="0"
                step="1"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Female Ticket (GH₵)</label>
              <input
                type="number"
                v-model.number="settings.default_female_ticket_price"
                min="0"
                step="1"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Match Settings -->
      <section class="admin-card h-fit">
        <div class="admin-card__header mb-6 pb-4 border-b border-gray-100">
          <h2 class="admin-card__title m-0">Match Settings</h2>
          <p class="admin-card__subtitle">Algorithm thresholds</p>
        </div>
        
        <div class="flex flex-col gap-5">
          <div class="form-group">
            <label class="form-label">Match Expiry (Days)</label>
            <input
              type="number"
              v-model.number="settings.match_expiry_days"
              min="1"
              max="30"
              class="form-input"
            />
            <p class="text-xs text-muted mt-1">Days until pending match expires</p>
          </div>
        </div>
      </section>

      <!-- Platform Info -->
      <section class="admin-card h-fit">
        <div class="admin-card__header mb-6 pb-4 border-b border-gray-100">
          <h2 class="admin-card__title m-0">Platform Info</h2>
          <p class="admin-card__subtitle">System wide identifiers</p>
        </div>
        
        <div class="flex flex-col gap-5">
          <div class="form-group">
            <label class="form-label">Platform Name</label>
            <input
              type="text"
              v-model="settings.platform_name"
              class="form-input"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- Save Button -->
    <div class="flex flex-col items-center gap-4 py-8 border-t border-gray-100">
      <button
        class="btn-primary w-full max-w-xs py-3"
        :disabled="saving"
        @click="saveSettings"
      >
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
      <transition name="fade">
        <p v-if="saveSuccess" class="text-sm font-medium text-green-600">Settings saved successfully</p>
      </transition>
      <p v-if="saveError" class="text-sm font-medium text-red-500">{{ saveError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const settings = reactive({
  default_match_unlock_fee: 50,
  default_male_ticket_price: 100,
  default_female_ticket_price: 80,
  match_expiry_days: 7,
  platform_name: 'Minutes 2 Match'
})

// Fetch current settings
const fetchSettings = async () => {
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
    
    if (error) throw error
    
    // Parse settings from database
    if (data) {
      for (const row of data) {
        const value = row.value
        switch (row.key) {
          case 'default_match_unlock_fee':
            settings.default_match_unlock_fee = value?.amount || 50
            break
          case 'default_male_ticket_price':
            settings.default_male_ticket_price = value?.amount || 100
            break
          case 'default_female_ticket_price':
            settings.default_female_ticket_price = value?.amount || 80
            break
          case 'match_expiry_days':
            settings.match_expiry_days = value?.days || 7
            break
          case 'platform_name':
            settings.platform_name = value?.name || 'Minutes 2 Match'
            break
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
  } finally {
    loading.value = false
  }
}

// Save settings
const saveSettings = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  
  try {
    const updates = [
      {
        key: 'default_match_unlock_fee',
        value: { amount: settings.default_match_unlock_fee, currency: 'GHS' },
        updated_at: new Date().toISOString()
      },
      {
        key: 'default_male_ticket_price',
        value: { amount: settings.default_male_ticket_price, currency: 'GHS' },
        updated_at: new Date().toISOString()
      },
      {
        key: 'default_female_ticket_price',
        value: { amount: settings.default_female_ticket_price, currency: 'GHS' },
        updated_at: new Date().toISOString()
      },
      {
        key: 'match_expiry_days',
        value: { days: settings.match_expiry_days },
        updated_at: new Date().toISOString()
      },
      {
        key: 'platform_name',
        value: { name: settings.platform_name },
        updated_at: new Date().toISOString()
      }
    ]
    
    // @ts-ignore - Supabase types not generated
    const { error } = await supabase
      .from('settings')
      .upsert(updates, { onConflict: 'key' })
    
    if (error) throw error
    
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (error: any) {
    saveError.value = error.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}

// Initialize
onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
/* Minor utility overrides */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.md\:grid-cols-2 { 
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
  }
}
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.pb-4 { padding-bottom: 1rem; }
.m-0 { margin: 0; }
.text-2xl { font-size: 1.5rem; }
.text-xs { font-size: 0.75rem; }
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }
.text-green-600 { color: #059669; }
.text-red-500 { color: #EF4444; }
.text-muted { color: var(--color-text-muted); }
.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #F3F4F6; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.h-fit { height: fit-content; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.w-full { width: 100%; }
.max-w-sm { max-width: 24rem; }
</style>
