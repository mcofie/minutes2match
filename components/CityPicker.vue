<template>
  <!-- Where you are: Accra or Nairobi, then (optionally) which part. Saved as "Accra" or "Accra, East Legon",
       which normalizeCity reads back as the city -->
  <div tabindex="-1" class="outline-none">
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="c in CITY_CHOICES"
        :key="c.id"
        type="button"
        :aria-pressed="selectedCity === c.id"
        class="relative flex min-h-[4.25rem] items-center gap-3 rounded-[1.25rem] border bg-white px-4 py-3 text-left transition-all duration-200 active:scale-[0.98]"
        :class="selectedCity === c.id ? 'border-[#393737] ring-1 ring-[#393737]' : 'border-[#e5e2dd] hover:border-[#cfc9c1]'"
        @click="pickCity(c.id)"
      >
        <CountryFlag :code="c.flag" shape="circle" class="h-9 w-9" />
        <span class="min-w-0">
          <span class="block text-base leading-tight text-[#393737]" :class="selectedCity === c.id ? 'font-semibold' : 'font-medium'">{{ c.label }}</span>
          <span class="block text-sm leading-tight text-[#9b9690]">{{ c.country }}</span>
        </span>
        <span v-if="selectedCity === c.id" class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#393737] text-white ring-2 ring-white" aria-hidden="true">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
      </button>
    </div>

    <!-- Neighbourhood chips for the chosen city -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="cityChoice" class="mt-4">
        <p class="mb-2 px-1 text-sm text-[#6c6862]">Which part of {{ cityChoice.label }}? <span class="text-[#9b9690]">Optional</span></p>
        <ChoiceChips :options="cityChoice.areas" :model-value="selectedArea" @update:model-value="pickArea" />
      </div>
    </Transition>

    <!-- Anywhere else: we note it so we know where to open next -->
    <div class="mt-4 text-center">
      <button v-if="!showElsewhere" type="button" class="text-sm text-[#9b9690] underline-offset-4 hover:text-[#393737] hover:underline" @click="pickElsewhere">I live somewhere else</button>
      <div v-else class="text-left">
        <label :for="`${uid}-elsewhere`" class="mb-2 block px-1 text-sm text-[#6c6862]">Which city?</label>
        <input :id="`${uid}-elsewhere`" v-model="elsewhereCity" type="text" autocomplete="address-level2" placeholder="e.g. Kumasi or Mombasa" class="h-14 w-full rounded-[1.25rem] border border-[#e5e2dd] bg-white px-5 text-lg text-[#393737] outline-none transition-[border-color,box-shadow] placeholder:text-[#8a857f] hover:border-[#cfc9c1] focus:border-[#393737] focus:ring-4 focus:ring-black/5" />
        <p class="mt-2 px-1 text-sm text-[#9b9690]">We only match in Accra and Nairobi for now. We'll let you know when we're in your city.</p>
        <button type="button" class="mt-2 px-1 text-sm text-[#9b9690] underline-offset-4 hover:text-[#393737] hover:underline" @click="backToCities">Back to Accra or Nairobi</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string | null | undefined }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const uid = `city-${useId()}`

const CITY_CHOICES = [
  { id: 'accra', label: 'Accra', country: 'Ghana', flag: 'gh' as const, areas: ['East Legon', 'Osu', 'Cantonments', 'Airport Residential', 'Labone', 'Spintex', 'Dzorwulu', 'Achimota', 'Madina', 'Adenta', 'Dansoman', 'Tema'] },
  { id: 'nairobi', label: 'Nairobi', country: 'Kenya', flag: 'ke' as const, areas: ['Westlands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Parklands', 'Karen', 'Runda', 'Langata', 'South B', 'Kasarani', 'Ruaka', 'Syokimau'] },
]

const isServed = (raw?: string | null) => CITY_CHOICES.some(c => c.id === normalizeCity(raw))
const showElsewhere = ref(false)
const elsewhereCity = ref('')

// A saved place outside Accra and Nairobi opens in the "somewhere else" box
const syncFromValue = (v?: string | null) => {
  if (v && !isServed(v)) {
    showElsewhere.value = true
    if (v.trim() !== elsewhereCity.value.trim()) elsewhereCity.value = v === 'other' || v === 'Other' ? '' : v
  } else if (v) {
    showElsewhere.value = false
  }
}
syncFromValue(props.modelValue)
watch(() => props.modelValue, v => syncFromValue(v))

const selectedCity = computed(() => {
  if (showElsewhere.value) return ''
  const c = normalizeCity(props.modelValue)
  return CITY_CHOICES.some(x => x.id === c) ? c : ''
})
const cityChoice = computed(() => CITY_CHOICES.find(c => c.id === selectedCity.value))
const selectedArea = computed(() => {
  const parts = (props.modelValue || '').split(',').map(x => x.trim().toLowerCase())
  return cityChoice.value?.areas.find(a => parts.includes(a.toLowerCase())) || ''
})

const pickCity = (id: string) => {
  const c = CITY_CHOICES.find(x => x.id === id)!
  showElsewhere.value = false
  if (selectedCity.value !== id) emit('update:modelValue', c.label)
}
const pickArea = (area: string) => {
  const c = cityChoice.value
  if (c) emit('update:modelValue', area ? `${c.label}, ${area}` : c.label)
}
const pickElsewhere = () => {
  showElsewhere.value = true
  emit('update:modelValue', elsewhereCity.value.trim())
}
const backToCities = () => {
  showElsewhere.value = false
  emit('update:modelValue', '')
}
watch(elsewhereCity, v => { if (showElsewhere.value) emit('update:modelValue', v.trim()) })
</script>
