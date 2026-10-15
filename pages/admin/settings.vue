<template>
  <div class="ad-page !max-w-3xl">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Settings</h1>
        <p class="ad-sub">Prices and matching rules used across the app.</p>
      </div>
    </header>

    <div v-if="loading" class="ad-panel"><div class="ad-empty"><span class="ad-spinner"></span></div></div>

    <form v-else class="space-y-6" @submit.prevent="saveSettings">
      <section v-for="group in groups" :key="group.title" class="ad-panel !p-0">
        <div class="px-6 pb-2 pt-5">
          <h2 class="font-display text-xl">{{ group.title }}</h2>
          <p class="mt-0.5 text-sm ad-muted">{{ group.description }}</p>
        </div>
        <div
          v-for="field in group.fields"
          :key="field.key"
          class="flex flex-col gap-2 border-t border-[#f3f1ee] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <label :for="field.key" class="min-w-0">
            <span class="block text-sm font-medium">{{ field.label }}</span>
            <span v-if="field.hint" class="mt-0.5 block text-xs ad-faint">{{ field.hint }}</span>
          </label>
          <div class="relative w-full shrink-0 sm:w-44">
            <span v-if="field.prefix" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm ad-faint">{{ field.prefix }}</span>
            <input
              v-if="field.type === 'number'"
              :id="field.key"
              v-model.number="(settings as any)[field.key]"
              type="number"
              :min="field.min"
              :max="field.max"
              step="1"
              class="form-input ad-num text-right"
              :class="{ '!pl-12': field.prefix, '!pr-10': field.suffix }"
            />
            <input
              v-else
              :id="field.key"
              v-model="(settings as any)[field.key]"
              type="text"
              class="form-input"
            />
            <span v-if="field.suffix" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm ad-faint">{{ field.suffix }}</span>
          </div>
        </div>
      </section>

      <div class="sticky bottom-4 z-10 flex items-center justify-end gap-4 rounded-full bg-white/90 py-2 pl-6 pr-2 shadow-[0_8px_28px_rgba(52,38,25,0.10)] backdrop-blur">
        <p v-if="saveError" class="mr-auto text-sm font-medium text-[#b4232a]">{{ saveError }}</p>
        <Transition name="fade">
          <p v-if="saveSuccess" class="mr-auto text-sm font-medium text-[#1f7a4d]">Saved</p>
        </Transition>
        <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </div>
    </form>
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
   subscription_price_monthly: 50,
   default_male_ticket_price: 100,
   default_female_ticket_price: 80,
   auto_match_min_score: 75,
   match_expiry_days: 7,
   platform_name: 'Minutes to Match',
   shoot_your_shot_fee: 15,
   spark_deck_price_ghs: 250
})

// Fetch current settings
const { data } = await supabase.from('settings').select('*')

// Initialize
onMounted(() => {
  loading.value = true
  try {
    if (data) {
      data.forEach((item: any) => {
        const value = item.value
        switch (item.key) {
          case 'default_match_unlock_fee':
            settings.default_match_unlock_fee = value?.amount || 50
            break
          case 'subscription_price_monthly':
            settings.subscription_price_monthly = value?.amount || 50
            break
          case 'event_ticket_prices':
            settings.default_male_ticket_price = value?.male || 100
            settings.default_female_ticket_price = value?.female || 80
            break
          case 'match_expiry_days':
            settings.match_expiry_days = value?.days || 7
            break
          case 'auto_match_min_score':
            settings.auto_match_min_score = value?.score || 75
            break
          case 'platform_name':
            settings.platform_name = value?.name || 'Minutes to Match'
            break
          case 'shoot_your_shot_fee':
            settings.shoot_your_shot_fee = value?.amount || 15
            break
          case 'spark_deck_price':
            settings.spark_deck_price_ghs = value?.amount || 250
            break
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
  } finally {
    loading.value = false
  }
})

// Save settings
interface SettingField {
  key: string
  label: string
  hint?: string
  type: 'number' | 'text'
  prefix?: string
  suffix?: string
  min?: number
  max?: number
}

const groups: { title: string; description: string; fields: SettingField[] }[] = [
  {
    title: 'Pricing',
    description: 'What members pay for matches and events.',
    fields: [
      { key: 'default_match_unlock_fee', label: 'Match unlock', hint: 'Default price to unlock a match', type: 'number', prefix: 'GH₵', min: 0 },
      { key: 'default_male_ticket_price', label: 'Event ticket, men', hint: 'Default for new events', type: 'number', prefix: 'GH₵', min: 0 },
      { key: 'default_female_ticket_price', label: 'Event ticket, women', hint: 'Default for new events', type: 'number', prefix: 'GH₵', min: 0 }
    ]
  },
  {
    title: 'Matching',
    description: 'Rules for automatic matches.',
    fields: [
      { key: 'auto_match_min_score', label: 'Minimum score for auto matches', hint: 'Matches below this are not created automatically', type: 'number', suffix: '%', min: 0, max: 100 },
      { key: 'match_expiry_days', label: 'Match expiry', hint: 'How long an unpaid match stays open', type: 'number', suffix: 'days', min: 1, max: 30 }
    ]
  },
  {
    title: 'Other products',
    description: 'Prices for features that are currently out of the menu.',
    fields: [
      { key: 'shoot_your_shot_fee', label: 'Shoot your shot', type: 'number', prefix: 'GH₵', min: 0 },
      { key: 'spark_deck_price_ghs', label: 'Spark Deck', hint: 'Retail price of the physical deck', type: 'number', prefix: 'GH₵', min: 0 }
    ]
  },
  {
    title: 'Platform',
    description: 'How the app names itself.',
    fields: [
      { key: 'platform_name', label: 'Platform name', type: 'text' }
    ]
  }
]

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
        key: 'subscription_price_monthly',
        value: { amount: settings.subscription_price_monthly, currency: 'GHS' },
        updated_at: new Date().toISOString()
      },
      {
        key: 'event_ticket_prices',
        value: { male: settings.default_male_ticket_price, female: settings.default_female_ticket_price },
        updated_at: new Date().toISOString()
      },
      {
        key: 'auto_match_min_score',
        value: { score: settings.auto_match_min_score },
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
      },
      {
        key: 'shoot_your_shot_fee',
        value: { amount: settings.shoot_your_shot_fee, currency: 'GHS' },
        updated_at: new Date().toISOString()
      },
      {
        key: 'spark_deck_price',
        value: { amount: settings.spark_deck_price_ghs, currency: 'GHS' },
        updated_at: new Date().toISOString()
      }
    ] as any
    
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


</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
