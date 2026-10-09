<template>
  <!-- Tap-to-pick options. Single choice taps again to clear (when clearable); multiple toggles each -->
  <div :class="layout === 'wrap' ? 'flex flex-wrap gap-2' : `grid gap-2 ${GRID[layout]}`">
    <button
      v-for="o in items"
      :key="o.value"
      type="button"
      :aria-pressed="isOn(o.value)"
      :disabled="isFull && !isOn(o.value)"
      class="transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100"
      :class="[
        layout === 'wrap' ? 'rounded-full px-4 py-2 text-sm' : 'min-h-11 rounded-2xl px-3 py-2.5 text-sm',
        isOn(o.value) ? 'bg-[#393737] font-medium text-white' : 'bg-white text-[#393737] ring-1 ring-[#e5e2dd] hover:ring-[#cfc9c1]',
      ]"
      @click="pick(o.value)"
    >{{ o.label }}</button>
  </div>
</template>

<script setup lang="ts">
type Option = string | { value: string; label: string }
const props = withDefaults(defineProps<{
  options: Option[]
  modelValue: string | string[] | null | undefined
  multiple?: boolean
  max?: number
  clearable?: boolean
  layout?: 'wrap' | 'grid-2' | 'grid-3' | 'grid-4'
}>(), { clearable: true, layout: 'wrap' })
const emit = defineEmits<{ 'update:modelValue': [value: any] }>()

const GRID = { 'grid-2': 'grid-cols-2', 'grid-3': 'grid-cols-3', 'grid-4': 'grid-cols-4' } as const
const items = computed(() => props.options.map(o => (typeof o === 'string' ? { value: o, label: o } : o)))
const list = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const isOn = (v: string) => (props.multiple ? list.value.includes(v) : props.modelValue === v)
const isFull = computed(() => !!props.multiple && !!props.max && list.value.length >= props.max)

const pick = (v: string) => {
  if (props.multiple) {
    emit('update:modelValue', isOn(v) ? list.value.filter(x => x !== v) : [...list.value, v])
  } else if (isOn(v)) {
    if (props.clearable) emit('update:modelValue', '')
  } else {
    emit('update:modelValue', v)
  }
}
</script>
