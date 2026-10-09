<template>
  <!-- A pill track with a white thumb that slides to the chosen option (2–4 short options) -->
  <div>
    <p v-if="label" :id="`${uid}-label`" class="mb-2 text-sm text-[#6c6862]">{{ label }}</p>
    <div
      role="radiogroup"
      :aria-labelledby="label ? `${uid}-label` : undefined"
      :aria-label="label ? undefined : ariaLabel"
      class="relative grid rounded-full bg-[#f1efec] p-1"
      :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }"
    >
      <span
        v-if="index >= 0"
        class="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-white shadow-[0_2px_8px_rgba(57,55,55,0.12)] ring-1 ring-black/5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }"
        aria-hidden="true"
      ></span>
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="modelValue === o.value"
        class="relative z-10 flex min-w-0 items-center justify-center gap-2 rounded-full px-2 transition-colors"
        :class="[size === 'sm' ? 'h-10 text-sm' : 'h-12 text-base', modelValue === o.value ? 'font-semibold text-[#393737]' : 'text-[#6c6862] hover:text-[#393737]']"
        @click="choose(o.value)"
      >
        <CountryFlag v-if="o.flag" :code="o.flag" shape="circle" class="h-5 w-5" />
        <span class="truncate">{{ o.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string | null | undefined
  options: { value: string; label: string; flag?: 'gh' | 'ke' }[]
  label?: string
  ariaLabel?: string
  size?: 'sm' | 'md'
}>(), { size: 'md' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { hapticFeedback } = useTelegram()
const uid = `seg-${useId()}`
const index = computed(() => props.options.findIndex(o => o.value === props.modelValue))
const choose = (v: string) => {
  if (v === props.modelValue) return
  hapticFeedback('light')
  emit('update:modelValue', v)
}
</script>
