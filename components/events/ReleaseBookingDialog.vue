<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-md rounded-3xl border border-stone-200 bg-white shadow-2xl p-6 space-y-5">
        <div class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {{ isWaitlist ? 'Leave Waitlist' : 'Release Spot' }}
          </p>
          <h3 class="text-xl font-bold text-stone-900">
            {{ isWaitlist ? 'Let us know you’re stepping out of the queue' : 'Let us know you can’t make it' }}
          </h3>
          <p class="text-sm text-stone-600 leading-relaxed">
            {{ isWaitlist
              ? `You’ll be removed from the waitlist for ${eventTitle}.`
              : `Your seat for ${eventTitle} will be released so another qualified guest can attend. Tickets remain non-refundable.` }}
          </p>
        </div>

        <div class="space-y-3">
          <label class="block">
            <span class="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Reason</span>
            <select
              v-model="reasonValue"
              class="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:border-black"
            >
              <option value="">Prefer not to say</option>
              <option v-for="option in reasonOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Optional note</span>
            <textarea
              v-model="noteValue"
              rows="3"
              maxlength="240"
              placeholder="Anything you want the team to know?"
              class="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none focus:border-black resize-none"
            />
          </label>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            @click="$emit('close')"
            :disabled="processing"
          >
            Keep Booking
          </button>
          <button
            type="button"
            class="flex-1 rounded-2xl border-2 border-black bg-black px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60"
            @click="$emit('confirm', { reason: reasonValue || null, note: noteValue.trim() || null })"
            :disabled="processing"
          >
            {{ processing ? 'Updating...' : isWaitlist ? 'Leave Waitlist' : 'Release Spot' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  eventTitle: string
  isWaitlist?: boolean
  processing?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [{ reason: string | null, note: string | null }]
}>()

const reasonOptions = [
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'travel_or_work', label: 'Travel or work change' },
  { value: 'health_or_family', label: 'Health or family matter' },
  { value: 'no_longer_interested', label: 'No longer interested' },
  { value: 'transport_or_distance', label: 'Transport or distance issue' },
  { value: 'other', label: 'Other' }
]

const reasonValue = ref('')
const noteValue = ref('')

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reasonValue.value = ''
    noteValue.value = ''
  }
})
</script>
