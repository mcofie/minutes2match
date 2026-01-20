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
        <div class="relative h-32 bg-stone-100 -mx-6 -mt-6 mb-4 overflow-hidden">
          <img v-if="event.cover_image_url" :src="event.cover_image_url" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-stone-300 text-4xl">🎫</div>
          <div class="absolute top-2 right-2 flex gap-1">
            <span v-if="!event.is_public" class="badge badge--purple" title="Invite Only">
              🔒 Invite
            </span>
            <span class="badge" :class="getStatusClass(event.status)">
              {{ event.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
        
        <div class="text-xs text-muted font-bold font-mono mb-2">{{ formatDate(event.event_date) }}</div>
        
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
              
              <!-- Image Upload -->
              <div class="form-group">
                <label class="form-label">Event Cover Image</label>
                <div class="flex items-center gap-4">
                  <div class="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center relative">
                    <img v-if="form.cover_image_url" :src="form.cover_image_url" class="w-full h-full object-cover" />
                    <span v-else class="text-2xl">📷</span>
                    <div v-if="uploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      @change="handleImageUpload" 
                      class="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-stone-800"
                    />
                    <p class="text-xs text-stone-400 mt-1">Recommended: 1200x600px JPG or PNG</p>
                  </div>
                </div>
              </div>

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
              
              <div class="grid grid-cols-2 gap-4">
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
                
                <div class="form-group">
                  <label class="form-label">Visibility</label>
                  <select v-model="form.is_public" class="form-select">
                    <option :value="true">🌍 Public (Everyone)</option>
                    <option :value="false">🔒 Invite Only (Qualified users)</option>
                  </select>
                  <p class="text-xs text-stone-400 mt-1">{{ form.is_public ? 'All users can see this event' : 'Only qualified users can see this event' }}</p>
                </div>
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
          
          <!-- Capacity Indicator -->
          <div class="capacity-bar">
            <div class="capacity-item">
              <span class="capacity-label">👨 Male</span>
              <div class="capacity-progress">
                <div 
                  class="capacity-fill capacity-fill--male" 
                  :style="{ width: maleCapacityPercent + '%' }"
                ></div>
              </div>
              <span class="capacity-count" :class="{ 'text-red-500': qualifiedMaleCount > qualifyingEvent?.male_capacity }">
                {{ qualifiedMaleCount }}/{{ qualifyingEvent?.male_capacity }}
              </span>
            </div>
            <div class="capacity-item">
              <span class="capacity-label">👩 Female</span>
              <div class="capacity-progress">
                <div 
                  class="capacity-fill capacity-fill--female" 
                  :style="{ width: femaleCapacityPercent + '%' }"
                ></div>
              </div>
              <span class="capacity-count" :class="{ 'text-red-500': qualifiedFemaleCount > qualifyingEvent?.female_capacity }">
                {{ qualifiedFemaleCount }}/{{ qualifyingEvent?.female_capacity }}
              </span>
            </div>
          </div>
          
          <div class="modal__content grid grid-cols-1 md:grid-cols-2 gap-6 h-[55vh]">
            <!-- Available Users -->
            <div class="flex flex-col h-full">
              <!-- Filters Row -->
              <div class="grid grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  v-model="userSearch"
                  placeholder="Search..."
                  class="form-input text-sm"
                />
                <select v-model="filterGender" class="form-select text-sm">
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select v-model="filterPersona" class="form-select text-sm">
                  <option value="">All Personas</option>
                  <option v-for="(p, key) in personas" :key="key" :value="key">{{ p.emoji }} {{ p.name }}</option>
                </select>
              </div>
              
              <div class="flex justify-between items-center mb-2">
                <h4 class="form-label mb-0">Available ({{ filteredAvailableUsers.length }})</h4>
                <button 
                  v-if="filteredAvailableUsers.length > 0"
                  class="text-xs text-blue-600 font-medium hover:underline"
                  @click="addAllFiltered"
                >
                  + Add All ({{ Math.min(filteredAvailableUsers.length, 50) }})
                </button>
              </div>
              
              <div class="border border-gray-100 rounded-lg flex-1 overflow-y-auto bg-gray-50">
                <div v-if="loadingUsers" class="text-center py-8 text-muted text-xs">Loading...</div>
                <div v-else-if="filteredAvailableUsers.length === 0" class="text-center py-8 text-muted text-xs">
                  No users match filters
                </div>
                <div
                  v-else
                  v-for="user in filteredAvailableUsers"
                  :key="user.id"
                  class="user-row"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="user-avatar-sm" :class="user.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'">
                      {{ user.display_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <strong class="text-sm font-medium truncate">{{ user.display_name }}</strong>
                        <span v-if="user.dating_persona" class="persona-dot" :style="{ background: getPersona(user.dating_persona)?.color }"></span>
                      </div>
                      <div class="text-xs text-muted flex items-center gap-2 flex-wrap">
                        <span>{{ user.gender }}</span>
                        <span v-if="user.dating_persona" class="text-stone-400">• {{ getPersona(user.dating_persona)?.name }}</span>
                      </div>
                      <div v-if="user.interests?.length" class="flex gap-1 mt-1 flex-wrap">
                        <span 
                          v-for="interest in user.interests.slice(0, 2)" 
                          :key="interest" 
                          class="interest-chip"
                        >{{ getInterestEmoji(interest) }}</span>
                        <span v-if="user.interests.length > 2" class="interest-chip">+{{ user.interests.length - 2 }}</span>
                      </div>
                    </div>
                  </div>
                  <button class="btn-add" @click="addQualification(user.id)">+</button>
                </div>
              </div>
            </div>
            
            <!-- Qualified Users -->
            <div class="flex flex-col h-full">
              <div class="flex justify-between items-center mb-3 min-h-[32px]">
                 <h4 class="form-label mb-0">Qualified ({{ qualifiedUsers.length }})</h4>
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
                  class="user-row"
                >
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="user-avatar-sm" :class="user.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                      {{ user.display_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <strong class="text-sm font-medium truncate">{{ user.display_name }}</strong>
                        <span v-if="user.dating_persona" class="persona-dot" :style="{ background: getPersona(user.dating_persona)?.color }"></span>
                      </div>
                      <div class="text-xs text-muted">{{ user.phone }}</div>
                    </div>
                  </div>
                  <button class="btn-remove" @click="removeQualification(user.id)">×</button>
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
import { personas } from '~/composables/usePersona'

useHead({ title: 'Events' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// Helper: Get persona by ID
const getPersona = (personaId: string) => personas[personaId] || null

// State
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const events = ref<any[]>([])
const showModal = ref(false)
const editingEvent = ref<any>(null)

const form = reactive({
  title: '',
  description: '',
  event_date: '',
  venue: '',
  venue_address: '',
  cover_image_url: '',
  male_capacity: 15,
  female_capacity: 15,
  ticket_price_male: 100,
  ticket_price_female: 80,
  status: 'draft',
  is_public: true
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
    cover_image_url: '',
    male_capacity: 15,
    female_capacity: 15,
    ticket_price_male: 100,
    ticket_price_female: 80,
    status: 'draft',
    is_public: true
  })
}

const handleImageUpload = async (e: Event) => {
  try {
    const input = e.target as HTMLInputElement
    if (!input.files?.length) return
    
    uploading.value = true
    const file = input.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `event-cover-${Date.now()}.${fileExt}`
    const filePath = `covers/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('events') // Updated to events bucket
      .upload(filePath, file)
      
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath)
      
    form.cover_image_url = publicUrl
  } catch (err) {
    console.error('Upload failed:', err)
    alert('Failed to upload image')
  } finally {
    uploading.value = false
  }
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
      cover_image_url: form.cover_image_url,
      male_capacity: form.male_capacity,
      female_capacity: form.female_capacity,
      ticket_price_male: form.ticket_price_male,
      ticket_price_female: form.ticket_price_female,
      status: form.status,
      is_public: form.is_public
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

// New filter state
const filterGender = ref('')
const filterPersona = ref('')

// Computed: Users who are qualified for current event
const qualifiedUsers = computed(() => {
  return allUsers.value.filter(u => qualifiedUserIds.value.includes(u.id))
})

// Computed: Capacity counts
const qualifiedMaleCount = computed(() => {
  return qualifiedUsers.value.filter(u => u.gender === 'male').length
})

const qualifiedFemaleCount = computed(() => {
  return qualifiedUsers.value.filter(u => u.gender === 'female').length
})

const maleCapacityPercent = computed(() => {
  if (!qualifyingEvent.value?.male_capacity) return 0
  return Math.min(100, (qualifiedMaleCount.value / qualifyingEvent.value.male_capacity) * 100)
})

const femaleCapacityPercent = computed(() => {
  if (!qualifyingEvent.value?.female_capacity) return 0
  return Math.min(100, (qualifiedFemaleCount.value / qualifyingEvent.value.female_capacity) * 100)
})

// Computed: Users who are NOT qualified (available to add) with filters
const filteredAvailableUsers = computed(() => {
  let available = allUsers.value.filter(u => !qualifiedUserIds.value.includes(u.id))
  
  // Apply gender filter
  if (filterGender.value) {
    available = available.filter(u => u.gender === filterGender.value)
  }
  
  // Apply persona filter
  if (filterPersona.value) {
    available = available.filter(u => u.dating_persona === filterPersona.value)
  }
  
  // Apply search filter
  if (userSearch.value.trim()) {
    const search = userSearch.value.toLowerCase()
    available = available.filter(u => {
      const name = (u.display_name || '').toLowerCase()
      const phone = (u.phone || '').toLowerCase()
      return name.includes(search) || phone.includes(search)
    })
  }
  
  return available.slice(0, 50) // Limit display
})

// Interest emoji map
const interestEmojis: Record<string, string> = {
  travel: '✈️', fitness: '💪', cooking: '🍳', movies: '🎬',
  music: '🎵', gaming: '🎮', reading: '📚', art: '🎨',
  sports: '⚽', tech: '💻', fashion: '👗', food: '🍕',
  nature: '🌿', photography: '📸', dancing: '💃', entrepreneurship: '💼'
}

const getInterestEmoji = (interestId: string): string => {
  return interestEmojis[interestId] || '🏷️'
}

// Bulk add all filtered users
const addAllFiltered = async () => {
  const usersToAdd = filteredAvailableUsers.value.slice(0, 50)
  if (!confirm(`Add ${usersToAdd.length} users to qualified list?`)) return
  
  for (const user of usersToAdd) {
    await addQualification(user.id)
  }
}

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
    .select('id, display_name, phone, gender, dating_persona, interests')
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
.badge--purple {
  background-color: #7C3AED;
  color: white;
}

/* Capacity Bar */
.capacity-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.capacity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.capacity-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  min-width: 60px;
}

.capacity-progress {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.capacity-fill--male {
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
}

.capacity-fill--female {
  background: linear-gradient(90deg, #EC4899, #F472B6);
}

.capacity-count {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #111827;
  min-width: 50px;
  text-align: right;
}

/* User Row */
.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #F3F4F6;
  transition: background 0.15s;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background: white;
}

/* User Avatar Small */
.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Persona Dot */
.persona-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Interest Chip */
.interest-chip {
  display: inline-block;
  font-size: 0.6875rem;
  background: #F3F4F6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

/* Action Buttons */
.btn-add {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: white;
  color: #10B981;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-add:hover {
  background: #10B981;
  color: white;
  border-color: #10B981;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #FEE2E2;
  background: #FEF2F2;
  color: #EF4444;
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #EF4444;
  color: white;
}

.text-red-500 {
  color: #EF4444;
}
</style>
