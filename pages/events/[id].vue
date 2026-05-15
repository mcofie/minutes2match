<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
    <Head>
      <Title>{{ event?.title || 'Event' }} | Minutes 2 Match</Title>
    </Head>

    <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div class="w-10 h-10 border-4 border-stone-200 border-t-black rounded-full animate-spin"></div>
      <p class="text-stone-400 font-medium tracking-wide uppercase text-sm">Loading Experience...</p>
    </div>

    <template v-else-if="event">
      <!-- Hero Section -->
      <div class="relative w-full h-[40vh] min-h-[300px] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-8 group">
        <!-- Background Blur Image -->
        <NuxtImg 
          v-if="event.cover_image_url" 
          :src="event.cover_image_url" 
          class="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105" 
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div class="absolute inset-0 bg-black/20"></div>

        <!-- Foreground Image -->
        <div class="absolute inset-0 flex items-center justify-center p-8">
           <NuxtImg 
             v-if="event.cover_image_url" 
             :src="event.cover_image_url" 
             class="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
           />
           <div v-else class="text-7xl">🎟️</div>
        </div>

        <!-- Back Button -->
        <NuxtLink to="/events" class="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 border border-white/10">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Events
        </NuxtLink>

        <!-- Status Pill -->
        <span v-if="bookingStatusLabel" class="absolute top-6 right-6 z-10 px-4 py-2 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest shadow-lg border border-white/20" :class="heroStatusPillClass">
          {{ bookingStatusLabel }}
        </span>

        <!-- Hero Content Overlay -->
        <div class="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-3">
            <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
              {{ event.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base font-medium">
              <div class="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <span class="text-lg">📅</span>
                <span>{{ formattedDate }}</span>
              </div>
              <div class="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <span class="text-lg">📍</span>
                <span>{{ event.venue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1fr_350px]">
        <!-- Main Content -->
        <section class="space-y-8">
          <!-- Details Grid -->
          <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div class="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Date & Time</p>
              <p class="text-sm font-bold text-stone-800">{{ formattedDate }}</p>
            </div>
            
            <div class="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Location</p>
              <p class="text-sm font-bold text-stone-800">{{ event.venue }}</p>
              <p v-if="event.venue_address" class="mt-1 text-xs text-stone-500">{{ event.venue_address }}</p>
            </div>

            <div v-if="ageLimits.hasLimits" class="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
              <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Age Requirement ({{ ageLimits.label }})</p>
              <p class="text-sm font-bold text-stone-800">{{ ageLimits.display }}</p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="event.description" class="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
            <h2 class="text-xl font-black text-stone-900 mb-6 flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-sm">✨</span>
              What to Expect
            </h2>
            <div class="prose prose-stone prose-sm sm:prose-base max-w-none text-stone-600 leading-loose">
              <p class="whitespace-pre-wrap">{{ event.description }}</p>
            </div>
          </div>
        </section>

        <!-- Sidebar / Booking Action -->
        <aside class="space-y-6">
          <div class="sticky top-6 bg-white rounded-3xl border border-stone-100 p-6 shadow-xl shadow-stone-200/40">
            <h3 class="text-xs font-black uppercase tracking-widest text-stone-400 mb-6 text-center">Ticket & Availability</h3>
            
            <div class="flex items-end justify-center gap-2 mb-8">
              <span class="text-4xl font-black text-stone-900 tracking-tighter">{{ formattedPrice }}</span>
              <span class="text-sm font-bold text-stone-400 pb-1 uppercase tracking-wider">/ {{ profile?.gender === 'female' ? 'Female' : 'Male' }}</span>
            </div>

            <div class="space-y-3 mb-8">
              <div class="flex items-center justify-between text-sm bg-stone-50 px-4 py-3 rounded-xl border border-stone-100">
                <span class="font-bold text-stone-500">Status</span>
                <span class="font-bold text-stone-900">{{ availabilityLabel }}</span>
              </div>
              <div class="flex items-center justify-between text-sm bg-stone-50 px-4 py-3 rounded-xl border border-stone-100">
                <span class="font-bold text-stone-500">Remaining</span>
                <span class="font-bold text-stone-900">{{ spotsLabel }}</span>
              </div>
            </div>

            <div v-if="claimCountdownLabel" class="mb-6 rounded-2xl border-2 border-sky-100 bg-sky-50/50 p-4 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-16 h-16 bg-sky-200 rounded-full -mr-8 -mt-8 opacity-50 blur-xl"></div>
              <p class="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1">Claim Window</p>
              <p class="text-sm font-bold text-sky-900">{{ claimCountdownLabel }}</p>
            </div>

            <div class="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100 text-center">
              <p class="text-sm font-semibold text-stone-700 leading-snug">{{ bookingMessage }}</p>
            </div>

            <div class="space-y-3">
              <button
                v-if="showBookingButton"
                @click="bookEvent"
                :disabled="processing"
                class="w-full py-4 bg-stone-900 text-white rounded-xl border-2 border-stone-900 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {{ processing ? 'Processing...' : bookingButtonLabel }}
              </button>

              <NuxtLink
                v-if="booking?.status === 'confirmed' || booking?.status === 'checked_in'"
                :to="`/me/tickets/${event.id}`"
                class="flex items-center justify-center gap-2 w-full py-4 bg-white text-stone-900 rounded-xl border-2 border-stone-200 text-sm font-black uppercase tracking-widest transition-all hover:bg-stone-50 hover:border-stone-300"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                View Ticket
              </NuxtLink>

              <NuxtLink
                v-if="showScorecardLink"
                :to="`/events/${event.id}/scorecard`"
                class="flex items-center justify-center gap-2 w-full py-4 bg-white text-stone-900 rounded-xl border-2 border-stone-200 text-sm font-black uppercase tracking-widest transition-all hover:bg-stone-50 hover:border-stone-300"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                {{ event?.scorecards_open ? 'Open Scorecard' : 'View Scorecard' }}
              </NuxtLink>

              <button
                v-if="booking?.status === 'confirmed' || booking?.status === 'checked_in'"
                @click="downloadICS"
                class="w-full py-3 text-stone-500 rounded-xl border border-stone-100 text-xs font-bold uppercase tracking-widest hover:bg-stone-50 hover:text-stone-800 transition-colors"
              >
                Add to Calendar
              </button>

              <button
                v-if="canReleaseBooking"
                @click="releaseBooking"
                :disabled="processing"
                class="w-full py-3 text-stone-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-stone-800 transition-colors disabled:opacity-60"
              >
                {{ booking?.status === 'waitlisted' ? 'Leave Waitlist' : 'Can’t Make It' }}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-32 space-y-4 text-center px-4">
      <div class="text-6xl mb-4">📭</div>
      <h2 class="text-xl font-bold text-stone-900 tracking-tight">Experience Not Found</h2>
      <p class="text-stone-500 text-sm mb-4">This event may have been removed or the link is invalid.</p>
      <NuxtLink to="/events" class="mt-4 px-6 py-3 bg-stone-900 text-white rounded-xl border-2 border-stone-900 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
        View All Events
      </NuxtLink>
    </div>

    <ReleaseBookingDialog
      :open="showReleaseDialog"
      :event-title="event?.title || 'this event'"
      :is-waitlist="booking?.status === 'waitlisted'"
      :processing="processing"
      @close="showReleaseDialog = false"
      @confirm="confirmReleaseBooking"
    />
  </div>
</template>

<script setup lang="ts">
import ReleaseBookingDialog from '~/components/events/ReleaseBookingDialog.vue'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const route = useRoute()
const toast = useToast()
const supabase = useSupabaseClient()
const { initDashboard, currentUserId, profile } = useDashboard()

const event = ref<any>(null)
const booking = ref<any>(null)
const qualification = ref<any>(null)
const waitlistMeta = ref<{ position: number; bucket: string | null } | null>(null)
const loading = ref(true)
const processing = ref(false)
const showReleaseDialog = ref(false)
const nowTs = ref(Date.now())
let countdownTimer: number | null = null

const eventId = computed(() => String(route.params.id || ''))

const getEventAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (currentUserId.value && currentUserId.value !== 'undefined') headers['x-user-id'] = currentUserId.value
  return Object.keys(headers).length ? headers : undefined
}

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

const isClaimablePending = computed(() => booking.value?.status === 'pending' && !booking.value?.payment_id)

const claimDeadlineTs = computed(() => {
  if (!isClaimablePending.value || !booking.value?.created_at) return null
  return new Date(booking.value.created_at).getTime() + (30 * 60 * 1000)
})

const claimCountdownLabel = computed(() => {
  if (!claimDeadlineTs.value) return ''
  const remainingMs = claimDeadlineTs.value - nowTs.value
  if (remainingMs <= 0) return 'This hold is about to roll to the next guest.'
  const totalMinutes = Math.floor(remainingMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `Claim your spot within ${hours}h ${minutes}m.`
  }
  if (totalMinutes > 0) {
    return `Claim your spot within ${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}.`
  }
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))
  return `Claim your spot within ${seconds} second${seconds === 1 ? '' : 's'}.`
})

const bookingStatusLabel = computed(() => {
  if (booking.value?.status === 'checked_in') return 'Checked In'
  if (booking.value?.status === 'confirmed') return 'Booked'
  if (booking.value?.status === 'cancelled') return 'Released'
  if (isClaimablePending.value) return 'Spot Opened'
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
    case 'cancelled':
      return 'bg-stone-100 border-stone-200 text-stone-600'
    case 'pending':
      return isClaimablePending.value
        ? 'bg-sky-50 border-sky-200 text-sky-700'
        : 'bg-amber-50 border-amber-200 text-amber-700'
    case 'waitlisted':
      return 'bg-stone-100 border-stone-200 text-stone-600'
    default:
      return 'bg-stone-100 border-stone-200 text-stone-600'
  }
})

const heroStatusPillClass = computed(() => {
  switch (booking.value?.status) {
    case 'checked_in':
    case 'confirmed':
      return 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
    case 'cancelled':
      return 'bg-white/10 border-white/20 text-white/80'
    case 'pending':
      return isClaimablePending.value
        ? 'bg-sky-500/20 border-sky-400 text-sky-300'
        : 'bg-amber-500/20 border-amber-400 text-amber-300'
    case 'waitlisted':
      return 'bg-white/10 border-white/20 text-white/80'
    default:
      return 'bg-white/10 border-white/20 text-white/80'
  }
})

const ageLimits = computed(() => {
  if (!event.value) return { hasLimits: false, label: '', display: '' }
  
  const isFemale = profile.value?.gender === 'female'
  const min = isFemale ? event.value.female_min_age : event.value.male_min_age
  const max = isFemale ? event.value.female_max_age : event.value.male_max_age
  
  const hasLimits = min !== null || max !== null
  const label = isFemale ? 'Ladies' : 'Gents'
  
  let display = ''
  if (min !== null && max !== null) display = `${min} - ${max} years`
  else if (min !== null) display = `${min}+ years`
  else if (max !== null) display = `Up to ${max} years`
  
  return { hasLimits, label, display }
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
  if (booking.value?.status === 'cancelled') return 'You released this spot. If plans change and availability remains, you can join again.'
  if (isClaimablePending.value) return 'A waitlist spot just opened for you. Complete your ticket payment soon before the hold is released.'
  if (booking.value?.status === 'waitlisted' && waitlistMeta.value?.position) return `You are #${waitlistMeta.value.position} in the ${waitlistMeta.value.bucket || 'current'} queue. We will notify you if a spot opens.`
  if (booking.value?.status === 'pending') return 'Your booking is waiting for payment confirmation.'
  if (booking.value?.status === 'waitlisted') return 'You are on the waitlist. We will notify you if a spot opens up.'
  if (!event.value?.is_public && !qualification.value) return 'This is an invite-only event and you are not currently on the guest list.'
  return 'Book now to secure your place in this session.'
})

const bookingButtonLabel = computed(() => {
  if (booking.value?.status === 'cancelled') return availabilityLabel.value === 'Waitlist only' ? 'Rejoin Waitlist' : 'Book Again'
  if (isClaimablePending.value) return 'Claim Spot Now'
  if (booking.value?.status === 'waitlisted') return 'Refresh Waitlist Status'
  return availabilityLabel.value === 'Waitlist only' ? 'Join Waitlist' : 'Pay & Confirm Spot'
})

const showBookingButton = computed(() =>
  !booking.value || booking.value.status === 'waitlisted' || isClaimablePending.value || booking.value.status === 'cancelled'
)

const canReleaseBooking = computed(() =>
  booking.value?.status === 'confirmed'
  || booking.value?.status === 'waitlisted'
  || (booking.value?.status === 'pending' && !booking.value?.payment_id)
)

const showScorecardLink = computed(() =>
  Boolean(event.value?.matching_enabled) && String(booking.value?.status || '') === 'checked_in'
)

const fetchEventPage = async () => {
  loading.value = true
  try {
    await initDashboard()
    const result = await $fetch<{ event: any; booking: any; qualification: any; waitlistMeta?: { position: number; bucket: string | null } | null }>(`/api/events/${eventId.value}`, {
      headers: await getEventAuthHeaders()
    })
    event.value = result.event
    booking.value = result.booking
    qualification.value = result.qualification
    waitlistMeta.value = result.waitlistMeta || null
  } catch (error: any) {
    if (error?.statusCode === 404) {
      event.value = null
      booking.value = null
      qualification.value = null
      waitlistMeta.value = null
      return
    }
    throw error
  } finally {
    loading.value = false
  }
}

const bookEvent = async () => {
  processing.value = true
  try {
    const result = await $fetch<any>('/api/events/book', {
      method: 'POST',
      headers: await getEventAuthHeaders(),
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

const releaseBooking = async () => {
  if (!event.value) return
  showReleaseDialog.value = true
}

const confirmReleaseBooking = async (payload: { reason: string | null, note: string | null }) => {
  showReleaseDialog.value = false
  processing.value = true
  try {
    const result = await $fetch<any>('/api/events/release', {
      method: 'POST',
      headers: await getEventAuthHeaders(),
      body: {
        eventId: eventId.value,
        userId: currentUserId.value,
        reason: payload.reason,
        note: payload.note
      }
    })

    toast.success(
      booking.value?.status === 'waitlisted' ? 'Waitlist updated' : 'Spot released',
      result.message || 'Your booking has been updated.'
    )
    await fetchEventPage()
  } catch (error: any) {
    toast.error('Unable to update booking', error?.data?.statusMessage || error?.message || 'Please try again.')
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

onMounted(() => {
  fetchEventPage()
  countdownTimer = window.setInterval(() => {
    nowTs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
})
</script>
