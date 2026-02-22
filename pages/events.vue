<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>Events | Minutes 2 Match</Title>
    </Head>
    <div class="flex items-center justify-between">
       <h2 class="text-2xl font-bold tracking-tight dark:text-white">Upcoming Sessions</h2>
       <span class="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">{{ events.length }} available</span>
    </div>

    <!-- Skeleton Loaders -->
    <div v-if="loadingEvents" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonEventCard v-for="i in 3" :key="i" />
    </div>

    <EventsEmptyState v-else-if="events.length === 0" />

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <EventCard
        v-for="event in events"
        :key="event.id"
        v-bind="event"
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
        :userGender="profile?.gender || 'male'"
        :booked="hasBookedEvent(event.id)"
        :loading="loadingBookings"
        @book="handleBookEvent(event)"
      />
    </div>

    <!-- Modals -->
    <Teleport to="body">
       <div v-if="showBookingModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showBookingModal = false">
          <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <div class="flex justify-between items-start mb-6">
                <h2 class="text-2xl font-bold tracking-tight text-stone-900">Secure Your Spot</h2>
                <button @click="showBookingModal = false" class="text-stone-400 hover:text-black">✕</button>
             </div>
             
             <div class="bg-stone-50 p-4 rounded-xl flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-lg overflow-hidden border border-stone-200">
                   <img :src="selectedEvent?.cover_image_url" class="w-full h-full object-cover" />
                </div>
                <div>
                   <p class="font-bold text-stone-900">{{ selectedEvent?.title }}</p>
                   <p class="text-xs text-stone-500 font-medium">{{ getTicketPrice(selectedEvent) }} • Ticket</p>
                </div>
             </div>

             <div class="space-y-4 mb-8">
                <div class="flex items-center gap-3 text-sm text-stone-600">
                   <span class="text-lg">📍</span>
                   <span>{{ selectedEvent?.venue }}</span>
                </div>
                <div class="flex items-center gap-3 text-sm text-stone-600">
                   <span class="text-lg">⏰</span>
                   <span>{{ formatEventDate(selectedEvent?.event_date) }}</span>
                </div>
             </div>

             <button 
                @click="processEventPayment"
                :disabled="processing"
                class="w-full py-4 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
             >
                <span v-if="processing">Processing...</span>
                <template v-else>
                   <span>Pay & Confirm Spot</span>
                   <span>🚀</span>
                </template>
             </button>
             <p class="text-[10px] text-center text-stone-400 uppercase tracking-widest mt-6 font-bold">Secure checkout powered by Paystack</p>
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

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()
const { profile } = useDashboard()

const events = useState<any[]>('events_data', () => [])
const loadingEvents = useState<boolean>('events_loading', () => true)
const userBookings = useState<Set<string>>('user_bookings', () => new Set())
const loadingBookings = useState<boolean>('bookings_loading', () => true)
const showBookingModal = ref(false)
const selectedEvent = ref<any>(null)
const processing = ref(false)

const fetchEvents = async (userId?: string) => {
  loadingEvents.value = true
  try {
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .in('status', ['open', 'waitlist'])
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    
    if (!allEvents) {
      events.value = []
      return
    }

    if (!userId || userId === 'undefined') {
      events.value = allEvents.filter((e: any) => e.is_public === true)
      return
    }

    const { data: qualifications } = await supabase
      .from('event_qualifications')
      .select('event_id')
      .eq('user_id', userId)
      .in('status', ['qualified', 'invited'])
    
    const qualifiedEventIds = new Set((qualifications || []).map((q: any) => q.event_id))

    events.value = allEvents.filter((event: any) => {
      if (event.is_public === true) return true
      return qualifiedEventIds.has(event.id)
    })
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
    const { data } = await supabase
      .from('event_bookings')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending'])
    
    userBookings.value = new Set((data || []).map((b: any) => b.event_id))
  } finally {
    loadingBookings.value = false
  }
}

const hasBookedEvent = (eventId: string) => userBookings.value.has(eventId)

const handleBookEvent = (event: any) => {
  if (hasBookedEvent(event.id)) {
    toast.info('Already booked', 'You have already booked this event!')
    return
  }
  selectedEvent.value = event
  showBookingModal.value = true
}

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
        const { data: existingBooking } = await supabase.from('event_bookings').select('id, status').eq('event_id', selectedEvent.value.id).eq('user_id', userId).maybeSingle()
        if (existingBooking) {
            showBookingModal.value = false
            toast.info('Booking exists', 'You already have a booking status: ' + existingBooking.status)
            return
        }
        const { initializePayment } = usePaystack()
        const price = profile.value.gender === 'female' ? selectedEvent.value.ticket_price_female : selectedEvent.value.ticket_price_male
        const paymentData = await initializePayment(
            profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
            price, 'event_ticket', { userId, eventId: selectedEvent.value.id }
        )
        await supabase.from('event_bookings').insert({ event_id: selectedEvent.value.id, user_id: userId, status: 'pending' } as any)
        userBookings.value.add(selectedEvent.value.id)
        window.location.href = paymentData.authorization_url
    } catch (error) {
        console.error('Payment error:', error)
        toast.error('Payment failed', 'Please try again.')
    } finally {
        processing.value = false
    }
}

onMounted(async () => {
    const { initDashboard, currentUserId } = useDashboard()
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
</script>
