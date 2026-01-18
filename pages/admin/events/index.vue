<template>
  <div>
    <!-- Actions -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold m-0">Events</h1>
      <button class="btn-primary" @click="showModal = true">+ New Event</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-loading">Loading events...</div>
    
    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="state-empty">
      <p>No events yet. Create your first event!</p>
    </div>
    
    <!-- Events Grid -->
    <div v-else class="card-grid">
      <div v-for="event in events" :key="event.id" class="admin-card">
        <div class="admin-card__header">
          <span class="badge" :class="getStatusClass(event.status)">
            {{ event.status.replace('_', ' ') }}
          </span>
          <span class="text-xs text-muted font-bold font-mono">{{ formatDate(event.event_date) }}</span>
        </div>
        
        <h3 class="admin-card__title">{{ event.title }}</h3>
        <p class="admin-card__subtitle mb-4">📍 {{ event.venue }}</p>
        
        <div class="bg-gray-50 rounded-lg p-3 my-4 flex justify-between border border-gray-100">
          <div class="text-center flex-1 border-r border-gray-200">
            <span class="block text-xs uppercase text-muted tracking-wider mb-1">Male</span>
            <span class="font-bold text-lg">{{ event.male_tickets_sold }}/{{ event.male_capacity }}</span>
          </div>
          <div class="text-center flex-1">
            <span class="block text-xs uppercase text-muted tracking-wide mb-1">Female</span>
            <span class="font-bold text-lg">{{ event.female_tickets_sold }}/{{ event.female_capacity }}</span>
          </div>
        </div>
        
        <div class="admin-card__actions">
          <button @click="editEvent(event)" class="btn-secondary flex-1">Edit</button>
          <button @click="viewBookings(event)" class="btn-secondary flex-1">Bookings</button>
          <button @click="openQualifyModal(event)" class="btn-primary flex-1">Qualify</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal--large">
          <div class="modal__header">
            <h2 class="modal__title">{{ editingEvent ? 'Edit Event' : 'Create Event' }}</h2>
            <button class="modal__close" @click="closeModal">×</button>
          </div>
          
          <div class="modal__content">
            <form @submit.prevent="saveEvent">
              <div class="form-group">
                <label class="form-label">Event Title</label>
                <input v-model="form.title" type="text" class="form-input" required placeholder="e.g. Singles Mixer in Accra" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" rows="3" class="form-input" placeholder="Event details..."></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Date & Time</label>
                  <input v-model="form.event_date" type="datetime-local" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Venue Name</label>
                  <input v-model="form.venue" type="text" class="form-input" required placeholder="e.g. Zen Garden" />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Venue Address</label>
                <input v-model="form.venue_address" type="text" class="form-input" placeholder="Full address for map..." />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Male Capacity</label>
                  <input v-model.number="form.male_capacity" type="number" min="1" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Female Capacity</label>
                  <input v-model.number="form.female_capacity" type="number" min="1" class="form-input" required />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Male Ticket (GH₵)</label>
                  <input v-model.number="form.ticket_price_male" type="number" min="0" step="0.01" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Female Ticket (GH₵)</label>
                  <input v-model.number="form.ticket_price_female" type="number" min="0" step="0.01" class="form-input" required />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="draft">Draft (Hidden)</option>
                  <option value="open">Open (Selling tickets)</option>
                  <option value="waitlist">Waitlist (Full)</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
          </div>
          
          <div class="modal__footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="button" @click="saveEvent" class="btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Event' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- User Qualification Modal -->
    <Teleport to="body">
      <div v-if="showQualifyModal" class="modal-overlay" @click.self="closeQualifyModal">
        <div class="modal modal--large">
          <div class="modal__header">
            <div>
              <h2 class="modal__title">Qualify Users</h2>
              <p class="text-xs text-muted mt-1">{{ qualifyingEvent?.title }}</p>
            </div>
            <button class="modal__close" @click="closeQualifyModal">×</button>
          </div>
          
          <div class="modal__content grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh]">
            <!-- Available Users -->
            <div class="flex flex-col h-full">
              <div class="form-group mb-4">
                <input
                  type="text"
                  v-model="userSearch"
                  placeholder="Search to add users..."
                  class="form-input"
                />
              </div>
              
              <h4 class="form-label mb-2">Available Users</h4>
              <div class="border border-gray-100 rounded-lg flex-1 overflow-y-auto bg-gray-50">
                <div v-if="loadingUsers" class="text-center py-8 text-muted text-xs">Loading...</div>
                <div v-else-if="filteredAvailableUsers.length === 0" class="text-center py-8 text-muted text-xs">
                  No users found
                </div>
                <div
                  v-else
                  v-for="user in filteredAvailableUsers"
                  :key="user.id"
                  class="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-white transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-xs font-bold">{{ user.display_name?.charAt(0) || '?' }}</span>
                    <div>
                      <strong class="block text-sm font-medium">{{ user.display_name }}</strong>
                      <small class="text-xs text-muted">{{ user.gender }}</small>
                    </div>
                  </div>
                  <button class="btn-secondary py-1 px-2 text-xs" @click="addQualification(user.id)">
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Qualified Users -->
            <div class="flex flex-col h-full">
              <div class="flex justify-between items-center mb-4 min-h-[42px]">
                 <h4 class="form-label mb-0">Qualified List ({{ qualifiedUsers.length }})</h4>
                 <button class="text-xs text-red-500 font-medium hover:underline" @click="clearQualifications" v-if="qualifiedUsers.length">Clear All</button>
              </div>
         
              <div class="border border-gray-100 rounded-lg flex-1 overflow-y-auto bg-white">
                <div v-if="qualifiedUsers.length === 0" class="flex flex-col items-center justify-center h-full text-muted text-xs p-8 text-center">
                  <span class="text-xl mb-2">👥</span>
                  No users qualified yet
                </div>
                <div
                  v-else
                  v-for="user in qualifiedUsers"
                  :key="user.id"
                  class="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-green-700">{{ user.display_name?.charAt(0) || '?' }}</span>
                    <div>
                      <strong class="block text-sm font-medium">{{ user.display_name }}</strong>
                      <small class="text-xs text-muted">{{ user.phone }}</small>
                    </div>
                  </div>
                  <button class="text-red-400 hover:text-red-600 px-2" @click="removeQualification(user.id)">
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal__footer">
            <button class="btn-primary w-full" @click="notifyQualifiedUsers" :disabled="notifying || qualifiedUsers.length === 0">
              {{ notifying ? 'Sending...' : `Send SMS Invites to ${qualifiedUsers.length} Users` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const loading = ref(true)
const saving = ref(false)
const events = ref<any[]>([])
const showModal = ref(false)
const editingEvent = ref<any>(null)

const form = reactive({
  title: '',
  description: '',
  event_date: '',
  venue: '',
  venue_address: '',
  male_capacity: 15,
  female_capacity: 15,
  ticket_price_male: 100,
  ticket_price_female: 80,
  status: 'draft'
})

// Methods
const fetchEvents = async () => {
  loading.value = true
  
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
  
  events.value = data || []
  loading.value = false
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

const getStatusClass = (status: string) => {
  switch(status) {
    case 'open': return 'badge--green'
    case 'waitlist': return 'badge--yellow'
    case 'sold_out': return 'badge--red'
    case 'completed': return 'badge--blue'
    default: return 'badge--gray'
  }
}

const editEvent = (event: any) => {
  editingEvent.value = event
  Object.assign(form, {
    ...event,
    event_date: new Date(event.event_date).toISOString().slice(0, 16)
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEvent.value = null
  Object.assign(form, {
    title: '',
    description: '',
    event_date: '',
    venue: '',
    venue_address: '',
    male_capacity: 15,
    female_capacity: 15,
    ticket_price_male: 100,
    ticket_price_female: 80,
    status: 'draft'
  })
}

const saveEvent = async () => {
  saving.value = true
  
  try {
    const eventData = {
      title: form.title,
      description: form.description,
      event_date: new Date(form.event_date).toISOString(),
      venue: form.venue,
      venue_address: form.venue_address,
      male_capacity: form.male_capacity,
      female_capacity: form.female_capacity,
      ticket_price_male: form.ticket_price_male,
      ticket_price_female: form.ticket_price_female,
      status: form.status
    }
    
    if (editingEvent.value) {
      await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.value.id)
    } else {
      await supabase
        .from('events')
        .insert(eventData)
    }
    
    closeModal()
    fetchEvents()
  } catch (error) {
    console.error('Error saving event:', error)
  } finally {
    saving.value = false
  }
}

const viewBookings = (event: any) => {
  navigateTo(`/admin/events/${event.id}`)
}

// ============================================
// EVENT QUALIFICATION MANAGEMENT
// ============================================

const showQualifyModal = ref(false)
const qualifyingEvent = ref<any>(null)
const allUsers = ref<any[]>([])
const qualifiedUserIds = ref<string[]>([])
const userSearch = ref('')
const loadingUsers = ref(false)
const notifying = ref(false)

// Computed: Users who are qualified for current event
const qualifiedUsers = computed(() => {
  return allUsers.value.filter(u => qualifiedUserIds.value.includes(u.id))
})

// Computed: Users who are NOT qualified (available to add)
const filteredAvailableUsers = computed(() => {
  const available = allUsers.value.filter(u => !qualifiedUserIds.value.includes(u.id))
  
  if (!userSearch.value.trim()) {
    return available.slice(0, 20) // Limit initial display
  }
  
  const search = userSearch.value.toLowerCase()
  return available.filter(u => {
    const name = (u.display_name || '').toLowerCase()
    const phone = (u.phone || '').toLowerCase()
    return name.includes(search) || phone.includes(search)
  }).slice(0, 20)
})

// Open qualification modal for an event
const openQualifyModal = async (event: any) => {
  qualifyingEvent.value = event
  showQualifyModal.value = true
  userSearch.value = ''
  
  await Promise.all([
    fetchAllUsers(),
    fetchQualifiedUsers(event.id)
  ])
}

// Close qualification modal
const closeQualifyModal = () => {
  showQualifyModal.value = false
  qualifyingEvent.value = null
  qualifiedUserIds.value = []
}

// Fetch all verified users
const fetchAllUsers = async () => {
  loadingUsers.value = true
  
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, phone, gender')
    .eq('is_verified', true)
    .order('display_name', { ascending: true })
  
  allUsers.value = data || []
  loadingUsers.value = false
}

// Fetch users already qualified for this event
const fetchQualifiedUsers = async (eventId: string) => {
  // @ts-ignore - Supabase types issue
  const { data } = await supabase
    .from('event_qualifications')
    .select('user_id')
    .eq('event_id', eventId)
  
  qualifiedUserIds.value = (data || []).map((d: any) => d.user_id)
}

// Add user qualification
const addQualification = async (userId: string) => {
  if (!qualifyingEvent.value) return
  
  // @ts-ignore - Supabase types issue
  const { error } = await supabase
    .from('event_qualifications')
    .insert({
      event_id: qualifyingEvent.value.id,
      user_id: userId,
      status: 'qualified'
    })
  
  if (!error) {
    qualifiedUserIds.value.push(userId)
  }
}

// Remove user qualification
const removeQualification = async (userId: string) => {
  if (!qualifyingEvent.value) return
  
  // @ts-ignore - Supabase types issue
  const { error } = await supabase
    .from('event_qualifications')
    .delete()
    .eq('event_id', qualifyingEvent.value.id)
    .eq('user_id', userId)
  
  if (!error) {
    qualifiedUserIds.value = qualifiedUserIds.value.filter(id => id !== userId)
  }
}

// Clear all qualifications for this event
const clearQualifications = async () => {
  if (!qualifyingEvent.value || !confirm('Are you sure you want to remove ALL qualified users?')) return
  
  // @ts-ignore
  const { error } = await supabase
    .from('event_qualifications')
    .delete()
    .eq('event_id', qualifyingEvent.value.id)
  
  if (!error) {
    qualifiedUserIds.value = []
  }
}

// Send SMS notification to all qualified users
const notifyQualifiedUsers = async () => {
  if (!qualifyingEvent.value || qualifiedUsers.value.length === 0) return
  
  notifying.value = true
  
  const { sendSMS } = useHubtel()
  const event = qualifyingEvent.value
  const message = `You're invited to "${event.title}" on ${formatDate(event.event_date)} at ${event.venue}. Log in to minutes2match.com to book your spot!`
  
  try {
    // Send SMS to each qualified user
    for (const user of qualifiedUsers.value) {
      if (user.phone) {
        try {
          await sendSMS(user.phone, message)
          
          // Mark as notified
          // @ts-ignore
          await supabase
            .from('event_qualifications')
            .update({ notified_at: new Date().toISOString() })
            .eq('event_id', event.id)
            .eq('user_id', user.id)
        } catch (e) {
          console.error('Failed to notify user:', user.phone, e)
        }
      }
    }
    
    alert(`Notifications sent to ${qualifiedUsers.value.length} users!`)
  } catch (error) {
    console.error('Notification error:', error)
    alert('Some notifications may have failed.')
  } finally {
    notifying.value = false
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
/* No custom styles needed */
</style>
