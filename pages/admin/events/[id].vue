<template>
  <div>
    <!-- Breadcrumb / Header -->
    <div class="mb-6 flex items-center gap-2 text-sm text-muted">
      <NuxtLink to="/admin/events" class="hover:text-black transition-colors">Events</NuxtLink>
      <span>/</span>
      <span>{{ event?.title || 'Loading...' }}</span>
    </div>

    <!-- Event Summary -->
    <div v-if="event" class="admin-card mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold mb-2">{{ event.title }}</h1>
          <p class="text-muted">
            📅 {{ formatDate(event.event_date) }} • 📍 {{ event.venue }}
          </p>
        </div>
        <div class="text-right">
          <span class="badge" :class="getStatusClass(event.status)">{{ event.status }}</span>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div>
          <span class="block text-xs uppercase text-muted font-bold tracking-wider mb-1">Male Tickets</span>
          <span class="text-xl font-bold">{{ event.male_tickets_sold }} / {{ event.male_capacity }}</span>
        </div>
        <div>
          <span class="block text-xs uppercase text-muted font-bold tracking-wider mb-1">Female Tickets</span>
          <span class="text-xl font-bold">{{ event.female_tickets_sold }} / {{ event.female_capacity }}</span>
        </div>
      </div>
    </div>

    <!-- Bookings List -->
    <div class="admin-card">
      <div class="admin-card__header flex justify-between items-center">
        <h2 class="admin-card__title m-0">Guest List ({{ bookings.length }})</h2>
        <button class="btn-secondary text-sm" @click="fetchEventDetails">Refresh</button>
      </div>

      <div v-if="loading" class="state-loading">Loading guest list...</div>
      
      <div v-else-if="bookings.length === 0" class="state-empty py-8">
        No bookings yet.
      </div>
      
      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Booked At</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>
                <div class="flex items-center gap-3">
                   <span class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">
                     {{ booking.profile?.display_name?.charAt(0) || '?' }}
                   </span>
                   <span class="font-bold text-sm">{{ booking.profile?.display_name || 'Anonymous' }}</span>
                </div>
              </td>
              <td>{{ capitalize(booking.profile?.gender || '-') }}</td>
              <td class="font-mono text-xs">{{ booking.profile?.phone || '-' }}</td>
              <td>
                <span class="badge" :class="booking.status === 'paid' ? 'badge--green' : 'badge--yellow'">
                  {{ booking.status }}
                </span>
              </td>
              <td class="text-sm">{{ formatTime(booking.created_at) }}</td>
              <td class="text-right">
                <button 
                  v-if="booking.status === 'paid'" 
                  class="btn-secondary py-1 px-3 text-xs"
                  @click="checkIn(booking)"
                >
                  Check In
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const route = useRoute()
const supabase = useSupabaseClient()

const eventId = route.params.id as string
const event = ref<any>(null)
const bookings = ref<any[]>([])
const loading = ref(true)

const fetchEventDetails = async () => {
  loading.value = true
  
  // Fetch event info
  // @ts-ignore
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  
  event.value = eventData

  // Fetch bookings with profiles
  // @ts-ignore
  const { data: bookingData } = await supabase
    .from('event_bookings')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  
  bookings.value = bookingData || []
  loading.value = false
}

const checkIn = (booking: any) => {
  // Placeholder for check-in logic
  if (confirm(`Check in ${booking.profile?.display_name}?`)) {
     alert(`Checked in ${booking.profile?.display_name}`)
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    hour: 'numeric', 
    minute: '2-digit'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const getStatusClass = (status: string) => {
   switch(status) {
    case 'open': return 'badge--green'
    case 'sold_out': return 'badge--red'
    case 'completed': return 'badge--blue'
    default: return 'badge--gray'
  }
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

onMounted(() => {
  fetchEventDetails()
})
</script>

<style scoped>
/* Only minimal utilities needed */
.text-muted { color: var(--color-text-muted); }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; }
.text-right { text-align: right; }
.flex { display: flex; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-6 { margin-top: 1.5rem; }
.pt-6 { padding-top: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.border-t { border-top-width: 1px; }
.border-gray-100 { border-color: #F3F4F6; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.rounded-full { border-radius: 9999px; }
.bg-gray-100 { background-color: #F3F4F6; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: 1fr 1fr; }
.block { display: block; }
.uppercase { text-transform: uppercase; }
.hover\:text-black:hover { color: black; }
.transition-colors { transition: color 0.2s; }
.btn-secondary { /* Inherited from admin.css but forcing scoped override if needed? No, standard usage */ }
</style>
