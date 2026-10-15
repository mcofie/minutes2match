<template>
  <div class="m2m-app letter-page min-h-screen overflow-x-clip bg-[#f7f7f7] text-[#393737] antialiased">
    <Head>
      <Title>Events | Minutes 2 Match</Title>
    </Head>

    <!-- ===== Sky header ===== -->
    <header class="relative isolate overflow-hidden bg-gradient-to-b from-[#f7f7f7] via-[#e9eff5] to-[#dde7f1] px-5 pb-20 pt-5 sm:px-6 sm:pb-32">
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-0">
        <svg viewBox="0 0 440 230" class="events-cloud absolute -left-24 top-12 w-[260px] opacity-75 sm:-left-16 sm:top-16 sm:w-[380px]">
          <defs><filter id="events-cloud-left" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="8" /></filter></defs>
          <g fill="#fff" filter="url(#events-cloud-left)">
            <ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" />
            <circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /><circle cx="352" cy="144" r="47" />
          </g>
        </svg>
        <svg viewBox="0 0 500 250" class="events-cloud events-cloud-reverse absolute -right-28 top-24 w-[290px] opacity-70 sm:-right-20 sm:top-24 sm:w-[420px]">
          <defs><filter id="events-cloud-right" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="9" /></filter></defs>
          <g fill="#fff" filter="url(#events-cloud-right)">
            <ellipse cx="258" cy="173" rx="206" ry="57" /><circle cx="137" cy="144" r="59" /><circle cx="203" cy="105" r="82" />
            <circle cx="291" cy="85" r="91" /><circle cx="378" cy="113" r="80" /><circle cx="432" cy="151" r="57" />
          </g>
        </svg>
      </div>

      <nav class="relative z-10 mx-auto flex h-10 max-w-6xl items-center justify-between" aria-label="Main">
        <NuxtLink to="/" class="text-sm font-medium text-[#6c6862] hover:text-[#393737]">← Home</NuxtLink>
        <NuxtLink to="/" aria-label="Minutes 2 Match home" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>
        <div class="flex items-center gap-1 text-sm font-semibold">
          <template v-if="signedIn">
            <NuxtLink to="/matches" class="hidden rounded-full px-3 py-1.5 text-[#6c6862] hover:text-[#393737] sm:inline">Matches</NuxtLink>
            <NuxtLink to="/me" class="rounded-full bg-white/80 px-3.5 py-1.5 text-[#393737] shadow-sm">Profile</NuxtLink>
          </template>
          <NuxtLink v-else :to="`/login?redirect=/events`" class="rounded-full bg-white/80 px-3.5 py-1.5 text-[#393737] shadow-sm">Log in</NuxtLink>
        </div>
      </nav>

      <div class="relative z-10 mt-14 text-center sm:mt-20">
        <span class="inline-flex rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium shadow-[0_4px_14px_rgba(57,77,100,0.08)] backdrop-blur">Events</span>
        <h1 class="font-display mx-auto mt-6 max-w-3xl text-balance text-[2.6rem] leading-[1.02] tracking-tight sm:text-7xl">Meet in person.</h1>
        <p class="mx-auto mt-5 max-w-xl text-pretty text-lg leading-snug text-[#6c6862] sm:text-xl">
          Small, hosted evenings in Accra and Nairobi for Minutes 2 Match members. A relaxed way to meet people face to face.
        </p>
      </div>

      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" class="pointer-events-none absolute inset-x-0 -bottom-1 -z-10 h-14 w-full sm:h-28" aria-hidden="true">
        <defs><filter id="events-cloud-edge" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <g fill="#f7f7f7" filter="url(#events-cloud-edge)">
          <ellipse cx="720" cy="215" rx="820" ry="70" />
          <circle cx="120" cy="190" r="90" /><circle cx="330" cy="175" r="100" /><circle cx="560" cy="195" r="85" />
          <circle cx="880" cy="180" r="100" /><circle cx="1110" cy="190" r="90" /><circle cx="1330" cy="175" r="100" />
        </g>
      </svg>
    </header>

    <main class="px-5 pb-16 sm:px-6">
      <div class="mx-auto max-w-6xl">
        <!-- ===== Upcoming ===== -->
        <section aria-labelledby="upcoming">
          <div v-if="loadingEvents || events.length" class="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="upcoming" class="font-display text-[1.75rem] leading-tight sm:text-4xl">Coming up</h2>
            <span v-if="!loadingEvents" class="text-sm text-[#817a72]">{{ events.length }} event{{ events.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="loadingEvents" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonEventCard v-for="i in 3" :key="i" />
          </div>

          <EventsEmptyState v-else-if="events.length === 0" class="pt-4" />

          <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <EventCard
              v-for="event in events"
              :key="event.id"
              :eventId="event.id"
              :title="event.title"
              :eventDate="event.event_date"
              :venue="event.venue"
              :coverImage="event.cover_image_url"
              :maleCapacity="event.male_capacity"
              :femaleCapacity="event.female_capacity"
              :maleTicketsSold="event.male_tickets_sold"
              :femaleTicketsSold="event.female_tickets_sold"
              :ticketPriceMale="event.ticket_price_male"
              :ticketPriceFemale="event.ticket_price_female"
              :userGender="profile?.gender === 'female' ? 'female' : 'male'"
              :signedIn="signedIn && !!profile?.gender"
              :booked="hasBookedEvent(event.id)"
              :bookingStatus="getBookingStatus(event.id)"
              :loading="signedIn && loadingBookings"
              :minAge="profile?.gender === 'female' ? event.female_min_age : event.male_min_age"
              :maxAge="profile?.gender === 'female' ? event.female_max_age : event.male_max_age"
              :maleMinAge="event.male_min_age"
              :maleMaxAge="event.male_max_age"
              :femaleMinAge="event.female_min_age"
              :femaleMaxAge="event.female_max_age"
              @book="handleBookEvent(event)"
            />
          </div>
        </section>

        <!-- ===== How events work ===== -->
        <section class="mx-auto mt-20 max-w-[42rem] sm:mt-28" aria-labelledby="how-events-work">
          <div class="text-center">
            <LoveBirds v-if="loadingEvents || events.length" scene="lineup" class="section-art mx-auto mb-2 w-52 sm:mb-4 sm:w-80" />
            <h2 id="how-events-work" class="font-display text-[2rem] leading-[1.05] tracking-tight sm:text-[3.25rem]">How events work</h2>
          </div>
          <ol class="mt-9 space-y-7 sm:mt-12">
            <li v-for="(step, i) in EVENT_STEPS" :key="step.title" class="grid grid-cols-[2.75rem_1fr] gap-4 sm:grid-cols-[3.25rem_1fr] sm:gap-5">
              <span class="font-display flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-[0_6px_18px_rgba(57,77,100,0.08)] ring-1 ring-black/[0.04] sm:h-12 sm:w-12">{{ i + 1 }}</span>
              <div>
                <h3 class="font-display text-[1.4rem] leading-tight sm:text-[1.75rem]">{{ step.title }}</h3>
                <p class="mt-1.5 text-base leading-[1.7] text-[#6c6862] sm:text-lg">{{ step.text }}</p>
              </div>
            </li>
          </ol>
          <p v-if="!signedIn" class="mt-10 text-center text-base text-[#6c6862] sm:text-lg">
            Not a member yet? <NuxtLink to="/vibe-check" class="font-semibold text-[#393737] underline decoration-[#393737]/30 underline-offset-4 hover:text-[#ed1c24]">Take the free Vibe Check</NuxtLink> to join.
          </p>
        </section>
      </div>
    </main>

    <footer class="px-5 pb-10 sm:px-6">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-4 border-t border-black/[0.06] pt-8 text-sm text-[#817a72] sm:flex-row sm:justify-between">
        <span>© {{ new Date().getFullYear() }} Minutes 2 Match</span>
        <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
          <NuxtLink to="/" class="hover:text-[#393737]">Home</NuxtLink>
          <NuxtLink to="/about" class="hover:text-[#393737]">About</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-[#393737]">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-[#393737]">Privacy</NuxtLink>
          <a href="mailto:hello@minutes2match.com" class="hover:text-[#393737]">Contact</a>
        </nav>
      </div>
    </footer>

    <!-- ===== Booking ===== -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="m2m-app fixed inset-0 z-[100] flex items-end justify-center bg-[#393737]/30 p-0 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showBookingModal = false">
        <div class="w-full max-w-md rounded-t-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(52,38,25,0.18)] sm:rounded-[2rem] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-[#817a72]">Book a place</p>
              <h2 id="booking-title" class="font-display mt-1 text-[1.75rem] leading-tight">{{ selectedEvent?.title }}</h2>
            </div>
            <button class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-[#9b9690] hover:bg-[#f1efec] hover:text-[#393737]" aria-label="Close" @click="showBookingModal = false">×</button>
          </div>

          <ul class="mt-5 space-y-2.5 text-[15px] text-[#6c6862]">
            <li class="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="mt-0.5 h-4 w-4 shrink-0 text-[#9b9690]" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              {{ formatEventDate(selectedEvent?.event_date) }}
            </li>
            <li class="flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0 text-[#9b9690]" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              {{ selectedEvent?.venue }}
            </li>
          </ul>

          <div class="mt-5 flex items-center justify-between rounded-2xl bg-[#f6f4f1] px-4 py-3">
            <span class="text-sm text-[#6c6862]">Your ticket</span>
            <span class="font-display text-2xl">{{ getTicketPrice(selectedEvent) }}</span>
          </div>

          <button class="btn-solid grain grain-strong mt-6 w-full px-6 py-4 text-base disabled:opacity-60" :disabled="processing" @click="processEventPayment">
            {{ processing ? 'Opening payment…' : 'Continue to payment' }}
          </button>
          <p class="mt-3 text-center text-xs text-[#9b9690]">Secure checkout with Paystack. If it's full, you'll join the waitlist instead.</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import EventCard from '~/components/EventCard.vue'
import SkeletonEventCard from '~/components/skeleton/EventCard.vue'
import EventsEmptyState from '~/components/EventsEmptyState.vue'
import { useToast } from '~/composables/useToast'
import type { M2MDatabase } from '~/types/database.types'

// Public: anyone can browse events; booking asks visitors to log in first
definePageMeta({
  layout: false
})

const supabaseUser = useSupabaseUser()
const signedIn = computed(() => !!supabaseUser.value)

const EVENT_STEPS = [
  { title: 'Book a place', text: "Pick an evening and pay securely with Paystack. If it's full, join the waitlist and we'll move you up if a place opens." },
  { title: 'Show your ticket', text: 'Your ticket lives in your profile. Show it at the door and you\'re in.' },
  { title: 'Plans change?', text: 'Release your ticket from the event page so someone on the waitlist can take your place.' }
]

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()
const { profile, currentUserId } = useDashboard()
const { isTMA, setMainButton, hideMainButton, hapticFeedback } = useTelegram()

const events = useState<any[]>('events_data', () => [])
const loadingEvents = useState<boolean>('events_loading', () => true)
const userBookings = useState<Record<string, string>>('user_bookings', () => ({}))
const loadingBookings = useState<boolean>('bookings_loading', () => true)
const showBookingModal = ref(false)
const selectedEvent = ref<any>(null)
const processing = ref(false)

const getEventAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (currentUserId.value && currentUserId.value !== 'undefined') headers['x-user-id'] = currentUserId.value
  return Object.keys(headers).length ? headers : undefined
}

const fetchEvents = async (userId?: string) => {
  loadingEvents.value = true
  try {
    const result = await $fetch<{ events: any[]; bookings?: Record<string, string> }>('/api/events/list', {
      headers: await getEventAuthHeaders()
    })
    events.value = result.events || []
    if (userId && userId !== 'undefined' && result.bookings) {
      userBookings.value = result.bookings
    }
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loadingEvents.value = false
  }
}

const fetchUserBookings = async (userId: string) => {
  if (!userId || userId === 'undefined') return
  loadingBookings.value = true
  try {
    const result = await $fetch<{ events: any[]; bookings?: Record<string, string> }>('/api/events/list', {
      headers: await getEventAuthHeaders()
    })
    userBookings.value = result.bookings || {}
  } finally {
    loadingBookings.value = false
  }
}

const hasBookedEvent = (eventId: string) => !!userBookings.value[eventId]
const getBookingStatus = (eventId: string) => (userBookings.value[eventId] || null) as 'confirmed' | 'checked_in' | 'waitlisted' | 'pending' | 'cancelled' | null

const handleBookEvent = (event: any) => {
  // Visitors log in first, then come straight back here
  if (!signedIn.value) {
    navigateTo(`/login?redirect=/events`)
    return
  }
  const status = getBookingStatus(event.id)
  if (status === 'confirmed' || status === 'checked_in') {
    toast.info('Already booked', 'Your ticket is already secured for this event.')
    hapticFeedback('light')
    navigateTo(`/me/tickets/${event.id}`)
    return
  }
  if (status === 'waitlisted') {
    toast.info('On the waitlist', 'You are already on the waitlist for this session.')
    hapticFeedback('light')
    return
  }
  if (status === 'pending') {
    toast.info('Booking in progress', 'Your event booking is already pending payment confirmation.')
    hapticFeedback('light')
    return
  }
  selectedEvent.value = event
  showBookingModal.value = true
  hapticFeedback('medium')

  if (isTMA.value) {
    setMainButton('Continue to payment', processEventPayment)
  }
}

watch(showBookingModal, (val) => {
  if (!val && isTMA.value) {
    hideMainButton()
  }
})

const getTicketPrice = (event: any): string => {
  if (!event || !profile.value) return 'GH₵ 0'
  const price = profile.value.gender === 'female' ? event.ticket_price_female : event.ticket_price_male
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(price)
}

const formatEventDate = (dateStr: string | null): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit'
  })
}

const processEventPayment = async () => {
    const { currentUserId } = useDashboard()
    const userId = currentUserId.value
    if (!selectedEvent.value || !profile.value || !userId || userId === 'undefined') return
    processing.value = true
    try {
        const result = await $fetch<any>('/api/events/book', {
          method: 'POST',
          body: { eventId: selectedEvent.value.id, userId }
        })

        if (result.waitlisted) {
          userBookings.value = {
            ...userBookings.value,
            [selectedEvent.value.id]: 'waitlisted'
          }
          showBookingModal.value = false
          toast.success('Waitlist joined', result.message || 'You have been added to the waitlist.')
          await fetchEvents(userId)
          navigateTo(`/events/${selectedEvent.value.id}`)
          return
        }

        if (result.alreadyBooked) {
          showBookingModal.value = false
          navigateTo(result.redirectTo || `/me/tickets/${selectedEvent.value.id}`)
          return
        }

        userBookings.value = {
          ...userBookings.value,
          [selectedEvent.value.id]: 'pending'
        }
        window.location.href = result.authorization_url
    } catch (error) {
        console.error('Payment error:', error)
        toast.error('Payment failed', 'Please try again.')
        hapticFeedback('heavy')
    } finally {
        processing.value = false
    }
}

onMounted(async () => {
    const { initDashboard } = useDashboard()
    let success = await initDashboard()
    
    if (success && currentUserId.value) {
        fetchEvents(currentUserId.value)
        fetchUserBookings(currentUserId.value)
    } else {
        // Fallback: try to get userId directly
        try {
            const supabaseClient = useSupabaseClient()
            const { data: { session } } = await supabaseClient.auth.getSession()
            const fallbackId = session?.user?.id
            if (fallbackId) {
                console.log('[Events] Using fallback userId:', fallbackId)
                await initDashboard(true)
                fetchEvents(fallbackId)
                fetchUserBookings(fallbackId)
            } else {
                // No user at all — still load public events
                fetchEvents()
                loadingBookings.value = false
            }
        } catch {
            fetchEvents()
            loadingBookings.value = false
        }
    }
})

watch(currentUserId, (userId) => {
    if (userId && userId !== 'undefined') {
        fetchEvents(userId)
        fetchUserBookings(userId)
    }
})
</script>

<style scoped>
.events-cloud {
  animation: events-cloud-drift 32s ease-in-out infinite alternate;
  will-change: transform;
}
.events-cloud-reverse {
  animation-duration: 40s;
  animation-direction: alternate-reverse;
}
@keyframes events-cloud-drift {
  from { transform: translate3d(-1.25rem, 0, 0) scale(0.96); }
  to { transform: translate3d(2rem, 0.75rem, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .events-cloud { animation: none; }
}
</style>
