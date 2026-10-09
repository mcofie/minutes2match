<template>
  <!-- Height: an "add" button first, then a slider that shows cm and feet -->
  <div>
    <div class="mb-2 flex items-baseline justify-between gap-3">
      <label :for="inputId" class="text-sm text-[#6c6862]">{{ label }}</label>
      <span v-if="modelValue" class="text-sm font-semibold text-[#393737]">{{ modelValue }} cm <span class="font-normal text-[#9b9690]">· {{ toFeet(modelValue) }}</span></span>
    </div>
    <div v-if="modelValue" class="flex items-center gap-3">
      <input
        :id="inputId"
        :value="modelValue"
        type="range"
        :min="MIN"
        :max="MAX"
        step="1"
        class="m2m-range h-2 flex-1 cursor-pointer"
        :style="{ '--from': '0%', '--to': `${((modelValue - MIN) / (MAX - MIN)) * 100}%` }"
        :aria-valuetext="`${modelValue} centimetres, ${toFeet(modelValue)}`"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />
      <button type="button" class="shrink-0 text-sm text-[#9b9690] underline-offset-4 hover:text-[#393737] hover:underline" @click="emit('update:modelValue', null)">Clear</button>
    </div>
    <button
      v-else
      :id="inputId"
      type="button"
      class="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d9d4ce] text-sm font-medium text-[#6c6862] transition-colors hover:border-[#393737] hover:text-[#393737]"
      @click="emit('update:modelValue', 170)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" class="h-4 w-4" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      Add your height
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: number | null | undefined; label?: string }>(), { label: 'Height' })
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()
const MIN = 140
const MAX = 210
const inputId = `height-${useId()}`
const toFeet = (cm: number) => { const inches = Math.round(cm / 2.54); return `${Math.floor(inches / 12)}'${inches % 12}"` }
</script>
