<template>
  <div class="relative rounded-[2rem] bg-white p-5 shadow-[0_18px_50px_rgba(52,38,25,0.08)] ring-1 ring-black/5 sm:p-8 md:p-10">
    <!-- Active badge -->
    <span v-if="subscription" class="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-semibold text-[#2f7a4d] sm:right-8 sm:top-8">
      <span class="h-1.5 w-1.5 rounded-full bg-[#3f8f5b]"></span> Active
    </span>

    <!-- Pay as you go -->
    <template v-if="!subscription">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-[#f6f6f7] px-3 py-5 text-center">
          <p class="text-sm text-[#6c6b6b]">First match</p>
          <p class="font-display mt-1 text-3xl text-[#393737]">Free</p>
        </div>
        <div class="rounded-2xl bg-[#f6f6f7] px-3 py-5 text-center">
          <p class="text-sm text-[#6c6b6b]">Pay as you go</p>
          <p class="font-display mt-1 text-3xl text-[#393737]">GH₵15</p>
          <p class="text-xs text-[#9b9690]">per unlock</p>
        </div>
      </div>
      <div class="my-6 h-px bg-black/[0.06] sm:my-8"></div>
    </template>

    <!-- Premium -->
    <div class="flex items-start gap-4" :class="subscription ? 'pr-16 sm:pr-0' : ''">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14"
        :class="subscription ? 'bg-[#eef7f1]' : 'bg-[#fff1f1]'"
        aria-hidden="true"
      >👑</div>
      <div class="min-w-0">
        <p class="text-sm text-[#9b9690]">{{ subscription ? 'Your plan' : 'Membership' }}</p>
        <h3 class="font-display text-[1.75rem] leading-tight tracking-tight text-[#393737] sm:text-4xl">
          {{ subscription ? 'Premium member' : 'Unlock Premium' }}
        </h3>
        <p class="mt-2 text-base leading-relaxed text-[#6c6b6b]">
          {{ subscription
            ? 'You have unlimited access to all features and matches.'
            : 'Unlimited match unlocks, priority visibility and exclusive event access.' }}
        </p>
      </div>
    </div>

    <ul class="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
      <li v-for="b in benefits" :key="b" class="flex items-center gap-3 text-base text-[#393737]">
        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#393737] text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        {{ b }}
      </li>
    </ul>

    <!-- Renewal / Upgrade -->
    <div v-if="subscription" class="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-[#f6f6f7] p-4">
      <div>
        <p class="text-sm text-[#9b9690]">Renews on</p>
        <p class="font-medium text-[#393737]">{{ new Date(subscription.end_date).toLocaleDateString(undefined, { dateStyle: 'long' }) }}</p>
      </div>
      <button type="button" class="rounded-full px-3 py-2 text-sm font-medium text-[#393737] underline-offset-4 hover:underline">Manage</button>
    </div>

    <div v-else class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
      <button type="button" class="btn-solid grain grain-strong w-full px-8 py-4 text-base sm:w-auto" @click="$emit('subscribe')">
        Upgrade · GH₵75/month
      </button>
      <p class="text-sm text-[#9b9690]">Cancel anytime.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  subscription: any | null
}>()

const emit = defineEmits<{
  (e: 'subscribe'): void
}>()

const benefits = ['Unlimited match unlocks', 'Priority matching', 'Verified badge', 'Exclusive event access']
</script>
