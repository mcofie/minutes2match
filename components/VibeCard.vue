<template>
  <button
    type="button"
    :aria-pressed="!!selected"
    :class="[
      'group relative flex min-h-14 w-full min-w-0 cursor-pointer items-center gap-3 rounded-[1.25rem] border bg-white text-left transition-all duration-200 active:scale-[0.98]',
      size === 'sm' ? 'gap-2.5 px-4 py-3' : 'px-5 py-4',
      !icon ? 'justify-center text-center' : '',
      selected ? 'border-[#393737] ring-1 ring-[#393737]' : 'border-[#e5e2dd] hover:border-[#cfc9c1]'
    ]"
    @click="handleClick"
  >
    <span v-if="icon" class="shrink-0" :class="size === 'sm' ? 'text-xl' : 'text-2xl'" aria-hidden="true">{{ icon }}</span>
    <span class="min-w-0 truncate text-[#393737]" :class="[size === 'sm' ? 'text-base' : 'text-lg', icon ? 'flex-1' : '', selected ? 'font-medium' : '']">{{ text }}</span>
    <!-- Tick: inline on regular cards, a corner badge on small ones so labels keep their room -->
    <span
      v-if="size !== 'sm'"
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors"
      :class="selected ? 'bg-[#393737] text-white' : 'ring-1 ring-black/15'"
      aria-hidden="true"
    >
      <svg v-if="selected" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
    <span
      v-else-if="selected"
      class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#393737] text-white ring-2 ring-white"
      aria-hidden="true"
    >
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  </button>
</template>

<script setup lang="ts">
const { hapticFeedback } = useTelegram()

const props = defineProps<{
  text: string
  icon?: string
  selected?: boolean
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{
  select: []
}>()

const handleClick = () => {
  hapticFeedback('light')
  emit('select')
}
</script>
