<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>{{ event?.title || 'Event' }} | Minutes 2 Match</Title>
    </Head>

    <div class="flex items-center justify-between gap-4">
      <div>
        <NuxtLink to="/events" class="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700">Back to Events</NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900 mt-2">{{ event?.title || 'Loading event...' }}</h1>
      </div>
      <span v-if="bookingStatusLabel" class="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest" :class="statusPillClass">
        {{ bookingStatusLabel }}
      </span>
    </div>

    <div v-if="loading" class="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400">
      Loading event details...
    </div>

    <template v-else-if="event">
      <div class="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div class="h-64 bg-stone-100">
            <NuxtImg v-if="event.cover_image_url" :src="event.cover_image_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-5xl text-stone-300">🎟️</div>
          </div>
          <div class="p-6 space-y-5">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-stone-50 border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">When</p>
                <p class="text-sm font-semibold text-stone-800">{{ formattedDate }}</p>
              </div>
              <div class="rounded-xl bg-stone-50 border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Where</p>
                <p class="text-sm font-semibold text-stone-800">{{ event.venue }}</p>
                <p v-if="event.venue_address" class="mt-1 text-xs text-stone-500">{{ event.venue_address }}</p>
              </div>
            </div>

            <div v-if="event.description" class="space-y-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">What to expect</p>
              <p class="text-sm leading-relaxed text-stone-700">{{ event.description }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Your ticket</p>
                <p class="text-lg font-bold text-stone-900">{{ formattedPrice }}</p>
                <p class="text-xs text-stone-500 mt-1">
                  {{ profile?.gender === 'female' ? 'Female' : 'Male' }} entry pricing
                </p>
              </div>
              <div class="rounded-xl border border-stone-200 p-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Availability</p>
                <p class="text-sm font-semibold text-stone-800">{{ availabilityLabel }}</p>
                <p class="text-xs text-stone-500 mt-1">{{ spotsLabel }}</p>
              </div>
            </div>
          </div>
        </section>

        <aside class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Your booking</p>
          <div class="rounded-xl bg-stone-50 border border-stone-200 p-4">
            <p class="text-sm font-semibold text-stone-800">{{ bookingMessage }}</p>
          </div>

          <button
            v-if="showBookingButton"
            @click="bookEvent"
            :disabled="processing"
            class="w-full py-4 bg-black text-white rounded-xl border-2 border-black text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60"
          >
            {{ processing ? 'Processing...' : bookingButtonLabel }}
          </button>

          <NuxtLink
            v-if="booking?.status === 'confirmed' || booking?.status === 'checked_in'"
            :to="`/me/tickets/${event.id}`"
            class="block w-full py-4 bg-white text-black rounded-xl border-2 border-black text-center text-sm font-bold uppercase tracking-widest transition-all hover:bg-stone-50"
          >
            View Ticket
          </NuxtLink>

          <button
            v-if="booking?.status === 'confirmed' || booking?.status === 'checked_in'"
            @click="downloadICS"
            class="w-full py-3 bg-stone-100 text-stone-800 rounded-xl border border-stone-200 text-sm font-semibold"
          >
            Add to Calendar
          </button>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { M2MDatabase } from '~/types/database.types'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const route = useRoute()
const toast = useToast()
const supabase = useSupabaseClient<M2MDatabase>() as any
const { initDashboard, currentUserId, profile } = useDashboard()

const event = ref<any>(null)
const booking = ref<any>(null)
const qualification = ref<any>(null)
const loading = ref(true)
const processing = ref(false)

const eventId = computed(() => String(route.params.id || ''))

const formattedDate = computed(() => event.value
  ? new Date(event.value.event_date).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit'
    })
  : '')

const formattedPrice = computed(() => {
  if (!event.value) return 'GHS 0'
  const amount = profile.value?.gender === 'female' ? event.value.ticket_price_female : event.value.ticket_price_male
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(amount)
})

const bookingStatusLabel = computed(() => {
  if (booking.value?.status === 'checked_in') return 'Checked In'
  if (booking.value?.status === 'confirmed') return 'Booked'
  if (booking.value?.status === 'pending') return 'Pending Payment'
  if (booking.value?.status === 'waitlisted') return 'Waitlisted'
  return ''
})

const statusPillClass = computed(() => {
  switch (booking.value?.status) {
    case 'checked_in':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    case 'confirmed':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700'
    case 'pending':
      return 'bg-amber-50 border-amber-200 text-amber-700'
    case 'waitlisted':
      return 'bg-stone-100 border-stone-200 text-stone-600'
    default:
      return 'bg-stone-100 border-stone-200 text-stone-600'
  }
})

const availabilityLabel = computed(() => {
  if (!event.value || !profile.value?.gender) return 'Open'
  const isFemale = profile.value.gender === 'female'
  const sold = isFemale ? event.value.female_tickets_sold : event.value.male_tickets_sold
  const capacity = isFemale ? event.value.female_capacity : event.value.male_capacity
  if (sold >= capacity || event.value.status === 'sold_out' || event.value.status === 'waitlist') return 'Waitlist only'
  if (sold >= capacity * 0.9) return 'Almost full'
  return 'Open for booking'
})

const spotsLabel = computed(() => {
  if (!event.value || !profile.value?.gender) return 'Check back for availability'
  const isFemale = profile.value.gender === 'female'
  const sold = isFemale ? event.value.female_tickets_sold : event.value.male_tickets_sold
  const capacity = isFemale ? event.value.female_capacity : event.value.male_capacity
  const remaining = Math.max(capacity - sold, 0)
  if (remaining === 0) return 'This bucket is full right now'
  return `${remaining} spot${remaining === 1 ? '' : 's'} left in your ticket bucket`
})

const bookingMessage = computed(() => {
  if (booking.value?.status === 'checked_in') return 'You are checked in. Enjoy the room and keep your ticket handy.'
  if (booking.value?.status === 'confirmed') return 'Your seat is secured. Bring this ticket with you on event day.'
  if (booking.value?.status === 'pending') return 'Your booking is waiting for payment confirmation.'
  if (booking.value?.status === 'waitlisted') return 'You are on the waitlist. We will notify you if a spot opens up.'
  if (!event.value?.is_public && !qualification.value) return 'This is an invite-only event and you are not currently on the guest list.'
  return 'Book now to secure your place in this session.'
})

const bookingButtonLabel = computed(() => {
  if (booking.value?.status === 'waitlisted') return 'Refresh Waitlist Status'
  return availabilityLabel.value === 'Waitlist only' ? 'Join Waitlist' : 'Pay & Confirm Spot'
})

const showBookingButton = computed(() => !booking.value || booking.value.status === 'waitlisted')

const fetchEventPage = async () => {
  loading.value = true
  try {
    await initDashboard()
    const userId = currentUserId.value

    const [{ data: eventData }, { data: bookingData }, { data: qualificationData }] = await Promise.all([
      supabase.schema('m2m').from('events').select('*').eq('id', eventId.value).maybeSingle(),
      userId
        ? supabase.schema('m2m').from('event_bookings').select('*').eq('event_id', eventId.value).eq('user_id', userId).maybeSingle()
        : Promise.resolve({ data: null }),
      userId
        ? supabase.schema('m2m').from('event_qualifications').select('*').eq('event_id', eventId.value).eq('user_id', userId).maybeSingle()
        : Promise.resolve({ data: null })
    ])

    if (eventData && !eventData.is_public && (!qualificationData || !['qualified', 'invited'].includes(String(qualificationData.status || ''))) && !bookingData) {
      event.value = null
      booking.value = null
      qualification.value = null
      return
    }

    event.value = eventData
    booking.value = bookingData
    qualification.value = qualificationData
  } finally {
    loading.value = false
  }
}

const bookEvent = async () => {
  processing.value = true
  try {
    const result = await $fetch<any>('/api/events/book', {
      method: 'POST',
      body: { eventId: eventId.value, userId: currentUserId.value }
    })

    if (result.waitlisted) {
      toast.success('Waitlist joined', result.message || 'You have been added to the waitlist.')
      await fetchEventPage()
      return
    }

    if (result.alreadyBooked) {
      navigateTo(result.redirectTo || `/me/tickets/${eventId.value}`)
      return
    }

    window.location.href = result.authorization_url
  } catch (error: any) {
    toast.error('Booking failed', error?.data?.statusMessage || error?.message || 'Please try again.')
  } finally {
    processing.value = false
  }
}

const downloadICS = () => {
  if (!event.value) return
  const eventStart = new Date(event.value.event_date)
  const eventEnd = new Date(eventStart.getTime() + (3 * 60 * 60 * 1000))
  const formatDateForICS = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Minutes 2 Match//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@minutes2match.com`,
    `DTSTAMP:${formatDateForICS(new Date())}`,
    `DTSTART:${formatDateForICS(eventStart)}`,
    `DTEND:${formatDateForICS(eventEnd)}`,
    `SUMMARY:${event.value.title} (Minutes 2 Match)`,
    `LOCATION:${event.value.venue}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.value.title.replace(/ /g, '_')}_M2M_Event.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchEventPage)
</script>
