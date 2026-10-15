<template>
  <article class="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_30px_rgba(57,77,100,0.07)] ring-1 ring-black/[0.04] transition-shadow duration-300 hover:shadow-[0_18px_44px_rgba(57,77,100,0.12)]">
    <!-- Cover -->
    <NuxtLink :to="detailsLink" class="relative block aspect-[16/10] overflow-hidden bg-gradient-to-b from-[#e9eff5] to-[#dde7f1]" :aria-label="`${title}, details`">
      <NuxtImg
        v-if="coverImage"
        :src="coverImage"
        :alt="''"
        class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <img v-else src="/lovebirds.webp" alt="" class="mx-auto h-full w-auto object-contain p-6 opacity-90" loading="lazy" />

      <!-- Date chip -->
      <span class="absolute left-3 top-3 rounded-2xl bg-white/90 px-3 py-1.5 text-center shadow-[0_4px_14px_rgba(57,77,100,0.10)] backdrop-blur">
        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c4121a]">{{ formattedMonth }}</span>
        <span class="font-display block text-2xl leading-none text-[#393737]">{{ formattedDay }}</span>
      </span>

      <!-- Availability -->
      <span v-if="availability" class="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm" :class="availability.class">
        {{ availability.label }}
      </span>
    </NuxtLink>

    <!-- Details -->
    <div class="flex flex-1 flex-col p-5 sm:p-6">
      <p class="text-sm font-medium text-[#817a72]">{{ formattedWhen }}</p>
      <NuxtLink :to="detailsLink" class="mt-1 block">
        <h3 class="font-display text-[1.5rem] leading-tight text-[#393737] decoration-[#393737]/25 underline-offset-4 group-hover:underline">{{ title }}</h3>
      </NuxtLink>

      <ul class="mt-3 space-y-1.5 text-sm text-[#6c6862]">
        <li class="flex items-start gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0 text-[#9b9690]" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          <span>{{ venue }}</span>
        </li>
        <li v-if="ageLabel" class="flex items-start gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0 text-[#9b9690]" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
          <span>{{ ageLabel }}</span>
        </li>
      </ul>

      <!-- Places left -->
      <div v-if="capacity > 0" class="mt-4">
        <div class="flex h-1.5 overflow-hidden rounded-full bg-[#f1efec]" :title="`${sold} of ${capacity} places taken`">
          <span class="h-full rounded-full transition-[width] duration-700" :class="buttonState === 'waitlist' ? 'bg-[#9b9690]' : buttonState === 'almost_full' ? 'bg-[#ed1c24]' : 'bg-[#393737]'" :style="{ width: capacityPercentage + '%' }"></span>
        </div>
        <p class="mt-1.5 text-xs text-[#817a72]">{{ capacityText }}</p>
      </div>

      <div class="min-h-4 flex-1" aria-hidden="true"></div>

      <!-- Price and action -->
      <div class="mt-5 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
        <p class="text-[#393737]">
          <span v-if="!signedIn" class="text-sm text-[#817a72]">From </span>
          <span class="font-display text-2xl">{{ formattedPrice }}</span>
        </p>

        <div v-if="loading" class="h-5 w-5 animate-spin rounded-full border-2 border-[#ece8e3] border-t-[#ed1c24]" aria-label="Loading"></div>

        <NuxtLink
          v-else-if="booked"
          :to="bookingStatus === 'confirmed' || bookingStatus === 'checked_in' ? `/me/tickets/${eventId}` : detailsLink"
          class="inline-flex items-center gap-2 rounded-full bg-[#e9f6ef] px-4 py-2 text-sm font-semibold text-[#1f7a4d]"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
          {{ bookingBadgeLabel }}
        </NuxtLink>

        <button
          v-else
          type="button"
          class="rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
          :class="buttonState === 'waitlist' ? 'border border-[#ded9d2] bg-white text-[#393737] hover:border-[#393737]' : 'btn-solid grain'"
          @click="$emit('book')"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  eventId?: string
  title: string
  eventDate: string
  venue: string
  coverImage?: string
  maleCapacity: number
  femaleCapacity: number
  maleTicketsSold: number
  femaleTicketsSold: number
  ticketPriceMale: number
  ticketPriceFemale: number
  userGender: 'male' | 'female'
  /** false for visitors: we don't know which ticket (men's or women's) applies, so show both sides */
  signedIn?: boolean
  booked?: boolean
  bookingStatus?: 'confirmed' | 'checked_in' | 'waitlisted' | 'pending' | 'cancelled' | null
  loading?: boolean
  minAge?: number | null
  maxAge?: number | null
  maleMinAge?: number | null
  maleMaxAge?: number | null
  femaleMinAge?: number | null
  femaleMaxAge?: number | null
}

const props = withDefaults(defineProps<Props>(), { signedIn: true })

defineEmits<{ book: [] }>()

const eventDateObj = computed(() => new Date(props.eventDate))
const formattedMonth = computed(() => eventDateObj.value.toLocaleDateString('en-GB', { month: 'short' }))
const formattedDay = computed(() => eventDateObj.value.getDate())
const formattedWhen = computed(() =>
  eventDateObj.value.toLocaleString('en-GB', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' at ', ', ')
)

const detailsLink = computed(() => (props.eventId ? `/events/${props.eventId}` : '/events'))

// Members see their own side (men's or women's tickets); visitors see both together
const capacity = computed(() => (props.signedIn ? (props.userGender === 'female' ? props.femaleCapacity : props.maleCapacity) : (props.maleCapacity || 0) + (props.femaleCapacity || 0)))
const sold = computed(() => (props.signedIn ? (props.userGender === 'female' ? props.femaleTicketsSold : props.maleTicketsSold) : (props.maleTicketsSold || 0) + (props.femaleTicketsSold || 0)))
const capacityPercentage = computed(() => (capacity.value ? Math.min((sold.value / capacity.value) * 100, 100) : 0))

const buttonState = computed(() => {
  if (capacity.value && sold.value >= capacity.value) return 'waitlist'
  if (capacity.value && sold.value >= capacity.value * 0.85) return 'almost_full'
  return 'available'
})

const capacityText = computed(() => {
  const remaining = Math.max(0, capacity.value - sold.value)
  const who = props.signedIn ? (props.userGender === 'female' ? ' for women' : ' for men') : ''
  if (buttonState.value === 'waitlist') return `Full${who}: join the waitlist and we'll let you know if a place opens`
  return `${remaining} place${remaining === 1 ? '' : 's'} left${who}`
})

const availability = computed(() => {
  if (buttonState.value === 'waitlist') return { label: 'Waitlist', class: 'bg-white/90 text-[#6c6862]' }
  if (buttonState.value === 'almost_full') return { label: 'Almost full', class: 'bg-[#ed1c24] text-white' }
  return null
})

const buttonText = computed(() => (buttonState.value === 'waitlist' ? 'Join waitlist' : 'Book a place'))

const formatGHS = (n: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(n || 0)
const formattedPrice = computed(() => {
  if (props.signedIn) return formatGHS(props.userGender === 'female' ? props.ticketPriceFemale : props.ticketPriceMale)
  return formatGHS(Math.min(props.ticketPriceMale ?? 0, props.ticketPriceFemale ?? 0))
})

const ageRange = (min?: number | null, max?: number | null) => (min && max ? `${min}–${max}` : min ? `${min}+` : max ? `up to ${max}` : '')
const ageLabel = computed(() => {
  if (props.signedIn) {
    const range = ageRange(props.minAge, props.maxAge)
    return range ? `Ages ${range}` : ''
  }
  const men = ageRange(props.maleMinAge, props.maleMaxAge)
  const women = ageRange(props.femaleMinAge, props.femaleMaxAge)
  if (!men && !women) return ''
  if (men === women) return `Ages ${men}`
  return [men && `Men ${men}`, women && `women ${women}`].filter(Boolean).join(', ')
})

const bookingBadgeLabel = computed(() => {
  if (props.bookingStatus === 'waitlisted') return 'On the waitlist'
  if (props.bookingStatus === 'pending') return 'Payment pending'
  if (props.bookingStatus === 'checked_in') return 'Checked in'
  return 'Your ticket'
})
</script>
