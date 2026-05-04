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

    <div class="grid gap-6 lg:grid-cols-2 mb-6">
      <div class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title m-0">Pending Claims</h2>
        </div>

        <div v-if="pendingClaims.length === 0" class="state-empty py-6">
          No pending claim holds right now.
        </div>

        <div v-else class="space-y-3">
          <div v-for="booking in pendingClaims" :key="booking.id" class="rounded-xl border border-stone-200 bg-stone-50 p-4 flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-sm text-stone-900">{{ booking.profile?.display_name || 'Anonymous' }}</p>
              <p class="text-xs text-stone-500 mt-1">{{ capitalize(booking.profile?.gender || '—') }} • {{ booking.profile?.phone || 'No phone' }}</p>
              <p class="text-xs text-stone-500 mt-2">
                {{ booking.payment_id ? 'Waiting for payment confirmation' : 'Promoted from waitlist and waiting for payment claim' }}
              </p>
              <p v-if="getClaimCountdownLabel(booking)" class="text-xs font-semibold text-sky-700 mt-2">
                {{ getClaimCountdownLabel(booking) }}
              </p>
            </div>
            <div class="text-right">
              <span class="badge" :class="booking.payment_id ? 'badge--yellow' : 'badge--blue'">
                {{ booking.payment_id ? 'Pending' : 'Claim Hold' }}
              </span>
              <p class="text-xs text-stone-400 mt-2">{{ formatTime(booking.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title m-0">Waitlist Queue</h2>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-stone-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Male Queue</h3>
              <span class="badge badge--gray">{{ waitlistedMale.length }}</span>
            </div>
            <div v-if="waitlistedMale.length === 0" class="text-sm text-stone-400">Nobody is waiting in this bucket.</div>
            <div v-else class="space-y-2">
              <div v-for="(booking, index) in waitlistedMale" :key="booking.id" class="rounded-lg bg-stone-50 border border-stone-200 px-3 py-2 flex items-center justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-stone-900">{{ index + 1 }}. {{ booking.profile?.display_name || 'Anonymous' }}</p>
                  <p class="text-xs text-stone-500">{{ booking.profile?.phone || 'No phone' }}</p>
                </div>
                <span class="text-xs text-stone-400">{{ formatTime(booking.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-stone-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Female Queue</h3>
              <span class="badge badge--gray">{{ waitlistedFemale.length }}</span>
            </div>
            <div v-if="waitlistedFemale.length === 0" class="text-sm text-stone-400">Nobody is waiting in this bucket.</div>
            <div v-else class="space-y-2">
              <div v-for="(booking, index) in waitlistedFemale" :key="booking.id" class="rounded-lg bg-stone-50 border border-stone-200 px-3 py-2 flex items-center justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-stone-900">{{ index + 1 }}. {{ booking.profile?.display_name || 'Anonymous' }}</p>
                  <p class="text-xs text-stone-500">{{ booking.profile?.phone || 'No phone' }}</p>
                </div>
                <span class="text-xs text-stone-400">{{ formatTime(booking.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-card mb-6">
      <div class="admin-card__header">
        <h2 class="admin-card__title m-0">Released Seats</h2>
      </div>

      <div v-if="releasedBookings.length === 0" class="state-empty py-6">
        No one has released a spot yet.
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <div v-for="booking in releasedBookings" :key="booking.id" class="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-sm text-stone-900">{{ booking.profile?.display_name || 'Anonymous' }}</p>
              <p class="text-xs text-stone-500 mt-1">{{ capitalize(booking.profile?.gender || '—') }} • {{ booking.profile?.phone || 'No phone' }}</p>
            </div>
            <span class="badge badge--red">Released</span>
          </div>

          <div class="mt-3 space-y-2 text-xs text-stone-600">
            <p><span class="font-semibold text-stone-700">Released:</span> {{ formatTime(booking.released_at || booking.updated_at || booking.created_at) }}</p>
            <p><span class="font-semibold text-stone-700">Reason:</span> {{ formatReleaseReason(booking.release_reason) }}</p>
            <p v-if="booking.release_note"><span class="font-semibold text-stone-700">Note:</span> {{ booking.release_note }}</p>
          </div>
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
              <th>Release Reason</th>
              <th>Booked At</th>
              <th>Checked In</th>
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
                <span class="badge" :class="getBookingStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </td>
              <td class="text-sm text-stone-500">{{ booking.status === 'cancelled' ? formatReleaseReason(booking.release_reason) : '—' }}</td>
              <td class="text-sm">{{ formatTime(booking.created_at) }}</td>
              <td class="text-sm">{{ booking.checked_in_at ? formatTime(booking.checked_in_at) : '—' }}</td>
              <td class="text-right">
                <button 
                  v-if="booking.status === 'confirmed'" 
                  class="btn-secondary py-1 px-3 text-xs"
                  @click="checkIn(booking)"
                >
                  Check In
                </button>
                <span v-else-if="booking.status === 'checked_in'" class="text-xs font-bold uppercase tracking-widest text-emerald-600">Done</span>
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
const nowTs = ref(Date.now())
let countdownTimer: number | null = null

const eventId = route.params.id as string
const event = ref<any>(null)
const bookings = ref<any[]>([])
const loading = ref(true)

const pendingClaims = computed(() =>
  bookings.value
    .filter((booking: any) => booking.status === 'pending')
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
)

const waitlistedMale = computed(() =>
  bookings.value
    .filter((booking: any) => booking.status === 'waitlisted' && String(booking.profile?.gender || '').toLowerCase() === 'male')
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
)

const waitlistedFemale = computed(() =>
  bookings.value
    .filter((booking: any) => booking.status === 'waitlisted' && String(booking.profile?.gender || '').toLowerCase() === 'female')
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
)

const releasedBookings = computed(() =>
  bookings.value
    .filter((booking: any) => booking.status === 'cancelled')
    .sort((a: any, b: any) => new Date(b.released_at || b.updated_at || b.created_at).getTime() - new Date(a.released_at || a.updated_at || a.created_at).getTime())
)

const fetchEventDetails = async () => {
  loading.value = true
  
  // Fetch event info
  // @ts-ignore
  const { data: eventData } = await supabase
    .schema('m2m')
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()
  
  event.value = eventData

  // Fetch bookings with profiles
  // @ts-ignore
  const { data: bookingData } = await supabase
    .schema('m2m')
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

const checkIn = async (booking: any) => {
  if (!confirm(`Check in ${booking.profile?.display_name}?`)) return

  try {
    await $fetch('/api/admin/events/check-in', {
      method: 'POST',
      body: { bookingId: booking.id }
    })
    await fetchEventDetails()
  } catch (error: any) {
    alert(error?.data?.statusMessage || error?.message || 'Check-in failed')
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

const getClaimCountdownLabel = (booking: any) => {
  if (!booking || booking.status !== 'pending' || booking.payment_id || !booking.created_at) return ''
  const remainingMs = new Date(booking.created_at).getTime() + (30 * 60 * 1000) - nowTs.value
  if (remainingMs <= 0) return 'Hold expiring now'
  const totalMinutes = Math.floor(remainingMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m left to claim`
  if (totalMinutes > 0) return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'} left to claim`
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))
  return `${seconds}s left to claim`
}

const getStatusClass = (status: string) => {
   switch(status) {
    case 'open': return 'badge--green'
    case 'sold_out': return 'badge--red'
    case 'completed': return 'badge--blue'
    default: return 'badge--gray'
  }
}

const getBookingStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed': return 'badge--green'
    case 'checked_in': return 'badge--blue'
    case 'waitlisted': return 'badge--gray'
    case 'cancelled': return 'badge--red'
    default: return 'badge--yellow'
  }
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const formatReleaseReason = (value: string | null | undefined) => {
  if (!value) return 'Not provided'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

onMounted(() => {
  fetchEventDetails()
  countdownTimer = window.setInterval(() => {
    nowTs.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
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
