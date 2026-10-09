<template>
  <!-- Two thumbs on one track: youngest and oldest age you'd like to meet -->
  <div>
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <span :id="`${uid}-label`" class="text-sm text-[#6c6862]">{{ label }}</span>
      <span class="text-sm font-semibold tabular-nums text-[#393737]">{{ min }} – {{ Math.min(max, MAX) }}{{ max >= MAX ? '+' : '' }}</span>
    </div>
    <div class="relative h-7">
      <div class="m2m-range pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2" :style="{ '--from': pct(min), '--to': pct(max) }" aria-hidden="true"></div>
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="1"
        :value="min"
        class="m2m-range m2m-range-dual absolute inset-0 h-7 w-full"
        aria-label="Youngest age"
        :aria-valuetext="`From ${min}`"
        @input="onMin"
      />
      <input
        type="range"
        :min="MIN"
        :max="MAX"
        step="1"
        :value="max"
        class="m2m-range m2m-range-dual absolute inset-0 h-7 w-full"
        aria-label="Oldest age"
        :aria-valuetext="`Up to ${max}`"
        @input="onMax"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ min: number; max: number; label?: string }>(), { label: 'Age range' })
const emit = defineEmits<{ 'update:min': [value: number]; 'update:max': [value: number] }>()
const MIN = 18
const MAX = 65
const GAP = 1
const uid = `age-${useId()}`
const pct = (v: number) => `${((Math.min(Math.max(v, MIN), MAX) - MIN) / (MAX - MIN)) * 100}%`

// Thumbs can't cross; push the input back if it tries to
const onMin = (e: Event) => {
  const el = e.target as HTMLInputElement
  const v = Math.min(Number(el.value), props.max - GAP)
  el.value = String(v)
  emit('update:min', v)
}
const onMax = (e: Event) => {
  const el = e.target as HTMLInputElement
  const v = Math.max(Number(el.value), props.min + GAP)
  el.value = String(v)
  emit('update:max', v)
}
</script>
