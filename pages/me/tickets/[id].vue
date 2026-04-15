<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>{{ event?.title || 'Ticket' }} | Minutes 2 Match</Title>
    </Head>

    <div class="flex items-center justify-between gap-4">
      <div>
        <NuxtLink to="/events" class="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700">Back to Events</NuxtLink>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900 mt-2">Your Event Ticket</h1>
      </div>
      <span v-if="booking" class="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest" :class="statusClass">
        {{ statusLabel }}
      </span>
    </div>

    <div v-if="loading" class="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400">
      Loading your ticket...
    </div>

    <template v-else-if="event && booking">
      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section class="bg-white rounded-3xl border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div class="flex items-start justify-between gap-4 border-b border-dashed border-stone-200 pb-5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Minutes 2 Match</p>
              <h2 class="text-2xl font-bold tracking-tight text-stone-900">{{ event.title }}</h2>
              <p class="text-sm text-stone-500 mt-2">{{ formattedDate }}</p>
              <p class="text-sm text-stone-500">{{ event.venue }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Booking Ref</p>
              <p class="text-sm font-mono font-bold text-stone-800">{{ shortBookingId }}</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 mt-5">
            <div class="rounded-2xl bg-stone-50 border border-stone-200 p-4">
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Guest</p>
              <p class="text-base font-semibold text-stone-900">{{ profile?.display_name || 'Guest' }}</p>
              <p class="text-xs text-stone-500 mt-1">{{ profile?.phone || 'Phone unavailable' }}</p>
            </div>
            <div class="rounded-2xl bg-stone-50 border border-stone-200 p-4">
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Ticket Status</p>
              <p class="text-base font-semibold text-stone-900">{{ statusLabel }}</p>
              <p class="text-xs text-stone-500 mt-1">{{ statusHelp }}</p>
            </div>
          </div>

          <div class="mt-6 rounded-3xl border-2 border-black bg-stone-950 text-white p-5">
            <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Entry code</p>
            <div class="grid grid-cols-12 gap-1 mb-4">
              <span v-for="bar in barcodeBars" :key="bar" class="h-14 rounded-sm" :class="bar % 3 === 0 ? 'bg-white' : 'bg-stone-700'"></span>
            </div>
            <p class="text-xs font-mono tracking-[0.3em] uppercase text-stone-200">{{ shortBookingId }}</p>
          </div>
        </section>

        <aside class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
          <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">Before you arrive</p>
          <div class="rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-stone-700 leading-relaxed">
            Arrive a few minutes early, keep this ticket ready, and show it at check-in. If your status is still pending, give payment a moment to settle or refresh this page.
          </div>

          <button @click="downloadICS" class="w-full py-3 bg-black text-white rounded-xl border-2 border-black text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            Add to Calendar
          </button>

          <NuxtLink :to="`/events/${event.id}`" class="block w-full py-3 bg-white text-black rounded-xl border-2 border-black text-center text-sm font-bold uppercase tracking-widest transition-all hover:bg-stone-50">
            View Event Details
          </NuxtLink>
        </aside>
      </div>
    </template>

    <div v-else class="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">
      We couldn’t find a ticket for this event yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { M2MDatabase } from '~/types/database.types'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const route = useRoute()
const supabase = useSupabaseClient<M2MDatabase>() as any
const { initDashboard, currentUserId, profile } = useDashboard()

const event = ref<any>(null)
const booking = ref<any>(null)
const loading = ref(true)

const eventId = computed(() => String(route.params.id || ''))
const shortBookingId = computed(() => String(booking.value?.id || '').split('-')[0]?.toUpperCase() || 'PENDING')
const barcodeBars = computed(() => Array.from({ length: 24 }, (_, index) => index + 1))
const formattedDate = computed(() => event.value
  ? new Date(event.value.event_date).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit'
    })
  : '')

const statusLabel = computed(() => {
  if (booking.value?.status === 'checked_in') return 'Checked In'
  if (booking.value?.status === 'confirmed') return 'Confirmed'
  if (booking.value?.status === 'pending') return 'Pending Payment'
  if (booking.value?.status === 'waitlisted') return 'Waitlisted'
  return 'Unknown'
})

const statusClass = computed(() => {
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

const statusHelp = computed(() => {
  if (booking.value?.status === 'checked_in') return 'You have already been marked present.'
  if (booking.value?.status === 'confirmed') return 'Your entry is secured.'
  if (booking.value?.status === 'pending') return 'Waiting for payment confirmation.'
  if (booking.value?.status === 'waitlisted') return 'We will update you if a spot opens.'
  return 'Check back again shortly.'
})

const fetchTicket = async () => {
  loading.value = true
  try {
    await initDashboard()
    if (!currentUserId.value) return

    const [{ data: bookingData }, { data: eventData }] = await Promise.all([
      supabase
        .schema('m2m')
        .from('event_bookings')
        .select('*')
        .eq('event_id', eventId.value)
        .eq('user_id', currentUserId.value)
        .maybeSingle(),
      supabase
        .schema('m2m')
        .from('events')
        .select('*')
        .eq('id', eventId.value)
        .maybeSingle()
    ])

    booking.value = bookingData
    event.value = eventData
  } finally {
    loading.value = false
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

onMounted(fetchTicket)
</script>
