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
    
    <!-- Pagination -->
    <Pagination 
      v-if="!loading && events.length > 0"
      class="mt-6"
      :current-page="currentPage" 
      :total-pages="Math.ceil(totalEvents / pageSize)" 
      :total-items="totalEvents"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />

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
                  <label class="form-label">Male Min Age</label>
                  <input v-model.number="form.male_min_age" type="number" min="18" class="form-input" placeholder="e.g. 25" />
                </div>
                <div class="form-group">
                  <label class="form-label">Male Max Age</label>
                  <input v-model.number="form.male_max_age" type="number" min="18" class="form-input" placeholder="e.g. 40" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Female Min Age</label>
                  <input v-model.number="form.female_min_age" type="number" min="18" class="form-input" placeholder="e.g. 21" />
                </div>
                <div class="form-group">
                  <label class="form-label">Female Max Age</label>
                  <input v-model.number="form.female_max_age" type="number" min="18" class="form-input" placeholder="e.g. 35" />
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

          <div class="px-6 py-4 border-b border-gray-100 bg-white">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p class="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Remaining Male</p>
                <p class="text-lg font-bold text-stone-900">{{ remainingMaleSlots }}</p>
              </div>
              <div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p class="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Remaining Female</p>
                <p class="text-lg font-bold text-stone-900">{{ remainingFemaleSlots }}</p>
              </div>
              <div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p class="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Invites Sent</p>
                <p class="text-lg font-bold text-stone-900">{{ notifiedQualifiedCount }}</p>
              </div>
              <div class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p class="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Selected</p>
                <p class="text-lg font-bold text-stone-900">{{ selectedAvailableUserIds.length }}</p>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button class="quick-chip" :class="{ 'quick-chip--active': availabilityMode === 'all' }" @click="availabilityMode = 'all'">All Available</button>
              <button class="quick-chip" :class="{ 'quick-chip--active': availabilityMode === 'male' }" @click="availabilityMode = 'male'">Fill Male Slots</button>
              <button class="quick-chip" :class="{ 'quick-chip--active': availabilityMode === 'female' }" @click="availabilityMode = 'female'">Fill Female Slots</button>
              <button class="quick-chip" :class="{ 'quick-chip--active': availabilityMode === 'balanced' }" @click="availabilityMode = 'balanced'">Balanced Picks</button>
              <button class="quick-chip" @click="prefillNeededGender" :disabled="!neededGenderFilter">Use Needed Gender</button>
            </div>
          </div>
          
          <div class="modal__content grid grid-cols-1 md:grid-cols-2 gap-6 h-[55vh]">
            <!-- Available Users -->
            <div class="flex flex-col h-full">
              <!-- Filters Row -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
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
                <select v-model="availableSort" class="form-select text-sm">
                  <option value="recommended">Recommended</option>
                  <option value="name">Name</option>
                  <option value="gender">Gender</option>
                  <option value="persona">Persona</option>
                </select>
              </div>
              
              <div class="flex justify-between items-center mb-2">
                <h4 class="form-label mb-0">Available ({{ visibleAvailableUsers.length }} of {{ filteredAvailableUsers.length }})</h4>
                <div class="flex items-center gap-3">
                  <button 
                    v-if="visibleAvailableUsers.length > 0"
                    class="text-xs text-stone-500 font-medium hover:underline"
                    @click="toggleSelectAllVisible"
                  >
                    {{ allVisibleSelected ? 'Clear Visible' : `Select Visible (${visibleAvailableUsers.length})` }}
                  </button>
                  <button 
                    v-if="visibleAvailableUsers.length > 0"
                    class="text-xs text-blue-600 font-medium hover:underline disabled:text-stone-300 disabled:no-underline"
                    @click="addSelectedUsers"
                    :disabled="selectedAvailableUserIds.length === 0"
                  >
                    + Add Selected ({{ selectedAvailableUserIds.length }})
                  </button>
                </div>
              </div>
              
              <div class="border border-gray-100 rounded-lg flex-1 overflow-y-auto bg-gray-50">
                <div v-if="loadingUsers" class="text-center py-8 text-muted text-xs">Loading...</div>
                <div v-else-if="visibleAvailableUsers.length === 0" class="text-center py-8 text-muted text-xs">
                  No users match filters
                </div>
                <div
                  v-else
                  v-for="user in visibleAvailableUsers"
                  :key="user.id"
                  class="user-row"
                  :class="{ 'user-row--selected': selectedAvailableUserIds.includes(user.id) }"
                >
                  <label class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      class="rounded border-stone-300"
                      :checked="selectedAvailableUserIds.includes(user.id)"
                      @change="toggleSelectedAvailableUser(user.id)"
                    />
                    <div class="user-avatar-sm" :class="user.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'">
                      {{ user.display_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <strong class="text-sm font-medium truncate">{{ user.display_name }}</strong>
                        <span v-if="user.dating_persona" class="persona-dot" :style="{ background: getPersona(user.dating_persona)?.color }"></span>
                        <span v-if="availabilityRecommendation(user)" class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" :class="availabilityRecommendation(user) === 'Best fit' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-sky-700 border-sky-200 bg-sky-50'">
                          {{ availabilityRecommendation(user) }}
                        </span>
                      </div>
                      <div class="text-xs text-muted flex items-center gap-2 flex-wrap">
                        <span>{{ user.gender }}</span>
                        <span v-if="user.dating_persona" class="text-stone-400">• {{ getPersona(user.dating_persona)?.name }}</span>
                        <span v-if="user.phone" class="text-stone-400">• {{ user.phone }}</span>
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
                  </label>
                  <button class="btn-add" @click="addQualification(user.id)">+</button>
                </div>

                <div v-if="visibleAvailableUsers.length < filteredAvailableUsers.length" class="p-4 border-t border-stone-200 bg-white">
                  <button class="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100 transition-colors" @click="loadMoreAvailableUsers">
                    Load More ({{ Math.min(availableVisibleCount + availablePageSize, filteredAvailableUsers.length) - visibleAvailableUsers.length }} more)
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Qualified Users -->
            <div class="flex flex-col h-full">
              <div class="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="text"
                  v-model="qualifiedSearch"
                  placeholder="Search qualified..."
                  class="form-input text-sm"
                />
                <select v-model="qualifiedFilter" class="form-select text-sm">
                  <option value="all">All qualified</option>
                  <option value="notified">Invites sent</option>
                  <option value="not_notified">Not yet invited</option>
                </select>
              </div>

              <div class="flex justify-between items-center mb-3 min-h-[32px]">
                 <h4 class="form-label mb-0">Qualified ({{ filteredQualifiedUsers.length }})</h4>
                 <div class="flex items-center gap-3">
                   <button class="text-xs text-stone-500 font-medium hover:underline" @click="removeSelectedQualifiedUsers" v-if="selectedQualifiedUserIds.length">
                     Remove Selected ({{ selectedQualifiedUserIds.length }})
                   </button>
                   <button class="text-xs text-red-500 font-medium hover:underline" @click="clearQualifications" v-if="qualifiedUsers.length">Clear All</button>
                 </div>
              </div>
         
              <div class="border border-gray-100 rounded-lg flex-1 overflow-y-auto bg-white">
                <div v-if="filteredQualifiedUsers.length === 0" class="flex flex-col items-center justify-center h-full text-muted text-xs p-8 text-center">
                  <span class="text-xl mb-2">👥</span>
                  No users qualified yet
                </div>
                <div
                  v-else
                  v-for="user in filteredQualifiedUsers"
                  :key="user.id"
                  class="user-row"
                  :class="{ 'user-row--selected': selectedQualifiedUserIds.includes(user.id) }"
                >
                  <label class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      class="rounded border-stone-300"
                      :checked="selectedQualifiedUserIds.includes(user.id)"
                      @change="toggleSelectedQualifiedUser(user.id)"
                    />
                    <div class="user-avatar-sm" :class="user.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                      {{ user.display_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <strong class="text-sm font-medium truncate">{{ user.display_name }}</strong>
                        <span v-if="user.dating_persona" class="persona-dot" :style="{ background: getPersona(user.dating_persona)?.color }"></span>
                        <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" :class="qualificationMetaByUserId[user.id]?.notified_at ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-stone-500 border-stone-200 bg-stone-50'">
                          {{ qualificationMetaByUserId[user.id]?.notified_at ? 'Invite Sent' : 'Not Invited' }}
                        </span>
                      </div>
                      <div class="text-xs text-muted flex items-center gap-2 flex-wrap">
                        <span>{{ user.phone }}</span>
                        <span v-if="qualificationMetaByUserId[user.id]?.notified_at" class="text-stone-400">• {{ formatShortDateTime(qualificationMetaByUserId[user.id]?.notified_at) }}</span>
                      </div>
                    </div>
                  </label>
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

    <!-- Change Alert Prompt Modal -->
    <Teleport to="body">
      <div v-if="showChangeAlertModal" class="modal-overlay" @click.self="closeChangeAlertModal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Event Details Changed</h2>
            <button class="modal__close" @click="closeChangeAlertModal">×</button>
          </div>
          <div class="modal__content">
            <p class="text-sm text-stone-500 mb-4">
              You changed key details of this event. Would you like to alert all booked guests via SMS?
            </p>

            <div class="mb-4">
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                SMS Message Text
              </label>
              <textarea 
                v-model="changeAlertMessage" 
                rows="6" 
                class="form-input w-full font-mono text-sm p-3 h-auto" 
                placeholder="Enter alert message..."
                required
              ></textarea>
            </div>
            
            <p class="text-xs text-stone-400">
              Note: <code>{name}</code> will be auto-replaced with each guest's name.
            </p>
          </div>
          <div class="modal__footer flex justify-end gap-2">
            <button 
              type="button" 
              @click="closeChangeAlertModal" 
              class="btn-secondary" 
              :disabled="sendingChangeAlert"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="executeSaveEvent(false)" 
              class="btn-secondary" 
              :disabled="sendingChangeAlert"
            >
              Save Without Alerts
            </button>
            <button 
              type="button" 
              @click="executeSaveEvent(true)" 
              class="btn-primary" 
              :disabled="sendingChangeAlert || !changeAlertMessage.trim()"
            >
              {{ sendingChangeAlert ? 'Sending...' : 'Send Alerts & Save' }}
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

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()

// Helper: Get persona by ID
const getPersona = (personaId: string) => personas[personaId] || null

// Pagination
const currentPage = ref(1)
const pageSize = ref(9) // 9 cards per page
const totalEvents = ref(0)
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const events = ref<any[]>([])
const showModal = ref(false)
const editingEvent = ref<any>(null)

const showChangeAlertModal = ref(false)
const changeAlertMessage = ref('')
const sendingChangeAlert = ref(false)

const closeChangeAlertModal = () => {
  showChangeAlertModal.value = false
  changeAlertMessage.value = ''
}

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
  is_public: true,
  female_min_age: null as number | null,
  female_max_age: null as number | null,
  male_min_age: null as number | null,
  male_max_age: null as number | null
})

const fetchEvents = async () => {
  loading.value = true
  
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
  
  // Apply Pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  
  const { data, count, error } = await query
    .order('event_date', { ascending: false })
    .range(from, to)

  if (error) console.error('Error fetching events:', error)
  
  events.value = data || []
  totalEvents.value = count || 0
  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchEvents()
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
    is_public: true,
    female_min_age: null,
    female_max_age: null,
    male_min_age: null,
    male_max_age: null
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

const executeSaveEvent = async (sendAlerts: boolean) => {
  saving.value = true
  if (sendAlerts) {
    sendingChangeAlert.value = true
  }
  
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
      is_public: form.is_public,
      female_min_age: form.female_min_age,
      female_max_age: form.female_max_age,
      male_min_age: form.male_min_age,
      male_max_age: form.male_max_age
    }
    
    if (editingEvent.value) {
      const { error: updateError } = await supabase
        .schema('m2m')
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.value.id)
      
      if (updateError) throw updateError

      if (sendAlerts) {
        await $fetch('/api/admin/events/alert-changes', {
          method: 'POST',
          body: {
            eventId: editingEvent.value.id,
            message: changeAlertMessage.value
          }
        })
      }
    } else {
      const { error: insertError } = await supabase
        .schema('m2m')
        .from('events')
        .insert(eventData)
      if (insertError) throw insertError
    }
    
    closeChangeAlertModal()
    closeModal()
    fetchEvents()
  } catch (error: any) {
    console.error('Error saving event:', error)
    alert(error?.data?.statusMessage || error?.message || 'Error saving event')
  } finally {
    saving.value = false
    sendingChangeAlert.value = false
  }
}

const saveEvent = async () => {
  const hasDetailsChanged = editingEvent.value && (
    form.title !== editingEvent.value.title ||
    new Date(form.event_date).getTime() !== new Date(editingEvent.value.event_date).getTime() ||
    form.venue !== editingEvent.value.venue ||
    form.venue_address !== editingEvent.value.venue_address
  )

  if (hasDetailsChanged) {
    changeAlertMessage.value = `Hi {name}, please note that the details for "${form.title}" have changed:
Date: ${formatDate(form.event_date)}
Venue: ${form.venue}
Verify your ticket details at minutes2match.com.`
    showChangeAlertModal.value = true
  } else {
    await executeSaveEvent(false)
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
const qualificationMetaByUserId = ref<Record<string, { status?: string; notified_at?: string | null }>>({})
const userSearch = ref('')
const qualifiedSearch = ref('')
const loadingUsers = ref(false)
const notifying = ref(false)

// New filter state
const filterGender = ref('')
const filterPersona = ref('')
const qualifiedFilter = ref<'all' | 'notified' | 'not_notified'>('all')
const availableSort = ref<'recommended' | 'name' | 'gender' | 'persona'>('recommended')
const availabilityMode = ref<'all' | 'male' | 'female' | 'balanced'>('all')
const selectedAvailableUserIds = ref<string[]>([])
const selectedQualifiedUserIds = ref<string[]>([])
const availablePageSize = 50
const availableVisibleCount = ref(availablePageSize)

// Computed: Users who are qualified for current event
const qualifiedUsers = computed(() => {
  return allUsers.value.filter((u: any) => qualifiedUserIds.value.includes(u.id))
})

const filteredQualifiedUsers = computed(() => {
  let items = [...qualifiedUsers.value]

  if (qualifiedFilter.value === 'notified') {
    items = items.filter((user: any) => Boolean(qualificationMetaByUserId.value[user.id]?.notified_at))
  } else if (qualifiedFilter.value === 'not_notified') {
    items = items.filter((user: any) => !qualificationMetaByUserId.value[user.id]?.notified_at)
  }

  if (qualifiedSearch.value.trim()) {
    const search = qualifiedSearch.value.toLowerCase()
    items = items.filter((user: any) => {
      const name = String(user.display_name || '').toLowerCase()
      const phone = String(user.phone || '').toLowerCase()
      return name.includes(search) || phone.includes(search)
    })
  }

  return items.sort((a: any, b: any) => String(a.display_name || '').localeCompare(String(b.display_name || '')))
})

// Computed: Capacity counts
const qualifiedMaleCount = computed(() => {
  return qualifiedUsers.value.filter((u: any) => u.gender === 'male').length
})

const qualifiedFemaleCount = computed(() => {
  return qualifiedUsers.value.filter((u: any) => u.gender === 'female').length
})

const maleCapacityPercent = computed(() => {
  if (!qualifyingEvent.value?.male_capacity) return 0
  return Math.min(100, (qualifiedMaleCount.value / qualifyingEvent.value.male_capacity) * 100)
})

const femaleCapacityPercent = computed(() => {
  if (!qualifyingEvent.value?.female_capacity) return 0
  return Math.min(100, (qualifiedFemaleCount.value / qualifyingEvent.value.female_capacity) * 100)
})

const remainingMaleSlots = computed(() => Math.max((qualifyingEvent.value?.male_capacity || 0) - qualifiedMaleCount.value, 0))
const remainingFemaleSlots = computed(() => Math.max((qualifyingEvent.value?.female_capacity || 0) - qualifiedFemaleCount.value, 0))
const notifiedQualifiedCount = computed(() =>
  qualifiedUsers.value.filter((user: any) => Boolean(qualificationMetaByUserId.value[user.id]?.notified_at)).length
)
const neededGenderFilter = computed(() => {
  if (remainingMaleSlots.value > remainingFemaleSlots.value && remainingMaleSlots.value > 0) return 'male'
  if (remainingFemaleSlots.value > remainingMaleSlots.value && remainingFemaleSlots.value > 0) return 'female'
  return ''
})

// Computed: Users who are NOT qualified (available to add) with filters
const filteredAvailableUsers = computed(() => {
  let available = allUsers.value.filter((u: any) => !qualifiedUserIds.value.includes(u.id))

  if (availabilityMode.value === 'male') {
    available = available.filter((u: any) => u.gender === 'male')
  } else if (availabilityMode.value === 'female') {
    available = available.filter((u: any) => u.gender === 'female')
  } else if (availabilityMode.value === 'balanced') {
    const targetGender = neededGenderFilter.value
    if (targetGender) {
      available = [
        ...available.filter((u: any) => u.gender === targetGender),
        ...available.filter((u: any) => u.gender !== targetGender)
      ]
    }
  }
  
  // Apply gender filter
  if (filterGender.value) {
    available = available.filter((u: any) => u.gender === filterGender.value)
  }
  
  // Apply persona filter
  if (filterPersona.value) {
    available = available.filter((u: any) => u.dating_persona === filterPersona.value)
  }
  
  // Apply search filter
  if (userSearch.value.trim()) {
    const search = userSearch.value.toLowerCase()
    available = available.filter((u: any) => {
      const name = (u.display_name || '').toLowerCase()
      const phone = (u.phone || '').toLowerCase()
      return name.includes(search) || phone.includes(search)
    })
  }

  const ranked = available.sort((a: any, b: any) => {
    if (availableSort.value === 'name') {
      return String(a.display_name || '').localeCompare(String(b.display_name || ''))
    }

    if (availableSort.value === 'gender') {
      return String(a.gender || '').localeCompare(String(b.gender || '')) || String(a.display_name || '').localeCompare(String(b.display_name || ''))
    }

    if (availableSort.value === 'persona') {
      return String(getPersona(a.dating_persona)?.name || '').localeCompare(String(getPersona(b.dating_persona)?.name || '')) || String(a.display_name || '').localeCompare(String(b.display_name || ''))
    }

    const score = (user: any) => {
      let value = 0
      if (neededGenderFilter.value && user.gender === neededGenderFilter.value) value += 4
      if (availabilityMode.value === 'balanced' && neededGenderFilter.value && user.gender === neededGenderFilter.value) value += 2
      if (user.dating_persona) value += 1
      if (Array.isArray(user.interests) && user.interests.length) value += 1
      return value
    }

    return score(b) - score(a) || String(a.display_name || '').localeCompare(String(b.display_name || ''))
  })

  return ranked
})

const visibleAvailableUsers = computed(() => filteredAvailableUsers.value.slice(0, availableVisibleCount.value))

const allVisibleSelected = computed(() =>
  visibleAvailableUsers.value.length > 0 && visibleAvailableUsers.value.every((user: any) => selectedAvailableUserIds.value.includes(user.id))
)

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

const availabilityRecommendation = (user: any) => {
  if (neededGenderFilter.value && user.gender === neededGenderFilter.value) return 'Best fit'
  if (availabilityMode.value === 'balanced' && neededGenderFilter.value && user.gender !== neededGenderFilter.value) return 'Backup'
  return ''
}

const prefillNeededGender = () => {
  if (neededGenderFilter.value) {
    filterGender.value = neededGenderFilter.value
  }
}

const toggleSelectedAvailableUser = (userId: string) => {
  selectedAvailableUserIds.value = selectedAvailableUserIds.value.includes(userId)
    ? selectedAvailableUserIds.value.filter((id) => id !== userId)
    : [...selectedAvailableUserIds.value, userId]
}

const toggleSelectedQualifiedUser = (userId: string) => {
  selectedQualifiedUserIds.value = selectedQualifiedUserIds.value.includes(userId)
    ? selectedQualifiedUserIds.value.filter((id) => id !== userId)
    : [...selectedQualifiedUserIds.value, userId]
}

const toggleSelectAllVisible = () => {
  if (allVisibleSelected.value) {
    const visibleIds = new Set(visibleAvailableUsers.value.map((user: any) => user.id))
    selectedAvailableUserIds.value = selectedAvailableUserIds.value.filter((id) => !visibleIds.has(id))
    return
  }

  const merged = new Set([...selectedAvailableUserIds.value, ...visibleAvailableUsers.value.map((user: any) => user.id)])
  selectedAvailableUserIds.value = [...merged]
}

const loadMoreAvailableUsers = () => {
  availableVisibleCount.value = Math.min(
    availableVisibleCount.value + availablePageSize,
    filteredAvailableUsers.value.length
  )
}

const addSelectedUsers = async () => {
  const ids = [...selectedAvailableUserIds.value]
  if (!ids.length) return
  if (!confirm(`Add ${ids.length} selected users to qualified list?`)) return

  for (const userId of ids) {
    await addQualification(userId)
  }
  selectedAvailableUserIds.value = []
}

const removeSelectedQualifiedUsers = async () => {
  const ids = [...selectedQualifiedUserIds.value]
  if (!ids.length) return
  if (!confirm(`Remove ${ids.length} selected users from the qualified list?`)) return

  for (const userId of ids) {
    await removeQualification(userId)
  }
  selectedQualifiedUserIds.value = []
}

// Open qualification modal for an event
const openQualifyModal = async (event: any) => {
  if (new Date(event.event_date).getTime() <= Date.now()) {
    alert('This event date has already passed. Update the event date before sending invites or qualifying users.')
    return
  }

  qualifyingEvent.value = event
  showQualifyModal.value = true
  userSearch.value = ''
  qualifiedSearch.value = ''
  filterGender.value = ''
  filterPersona.value = ''
  qualifiedFilter.value = 'all'
  availableSort.value = 'recommended'
  availabilityMode.value = 'all'
  availableVisibleCount.value = availablePageSize
  selectedAvailableUserIds.value = []
  selectedQualifiedUserIds.value = []
  
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
  qualificationMetaByUserId.value = {}
  availableVisibleCount.value = availablePageSize
  selectedAvailableUserIds.value = []
  selectedQualifiedUserIds.value = []
}

// Fetch all verified users
const fetchAllUsers = async () => {
  loadingUsers.value = true
  
  const { data } = await supabase
    .schema('m2m')
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
    .schema('m2m')
    .from('event_qualifications')
    .select('user_id, status, notified_at')
    .eq('event_id', eventId)
  
  qualifiedUserIds.value = (data || []).map((d: any) => d.user_id)
  qualificationMetaByUserId.value = Object.fromEntries((data || []).map((d: any) => [d.user_id, {
    status: d.status,
    notified_at: d.notified_at
  }]))
}

// Add user qualification
const addQualification = async (userId: string) => {
  if (!qualifyingEvent.value) return
  
  // @ts-ignore - Supabase types issue
  const { error } = await supabase
    .schema('m2m')
    .from('event_qualifications')
    .insert({
      event_id: qualifyingEvent.value.id,
      user_id: userId,
      status: 'qualified'
    })
  
  if (!error) {
    qualifiedUserIds.value.push(userId)
    qualificationMetaByUserId.value = {
      ...qualificationMetaByUserId.value,
      [userId]: { status: 'qualified', notified_at: null }
    }
    selectedAvailableUserIds.value = selectedAvailableUserIds.value.filter((id) => id !== userId)
  }
}

// Remove user qualification
const removeQualification = async (userId: string) => {
  if (!qualifyingEvent.value) return
  
  // @ts-ignore - Supabase types issue
  const { error } = await supabase
    .schema('m2m')
    .from('event_qualifications')
    .delete()
    .eq('event_id', qualifyingEvent.value.id)
    .eq('user_id', userId)
  
  if (!error) {
    qualifiedUserIds.value = qualifiedUserIds.value.filter((id: any) => id !== userId)
    const nextMeta = { ...qualificationMetaByUserId.value }
    delete nextMeta[userId]
    qualificationMetaByUserId.value = nextMeta
    selectedQualifiedUserIds.value = selectedQualifiedUserIds.value.filter((id) => id !== userId)
  }
}

// Clear all qualifications for this event
const clearQualifications = async () => {
  if (!qualifyingEvent.value || !confirm('Are you sure you want to remove ALL qualified users?')) return
  
  // @ts-ignore
  const { error } = await supabase
    .schema('m2m')
    .from('event_qualifications')
    .delete()
    .eq('event_id', qualifyingEvent.value.id)
  
  if (!error) {
    qualifiedUserIds.value = []
    qualificationMetaByUserId.value = {}
    selectedQualifiedUserIds.value = []
  }
}

// Send SMS notification to all qualified users
const notifyQualifiedUsers = async () => {
  if (!qualifyingEvent.value || qualifiedUsers.value.length === 0) return

  if (new Date(qualifyingEvent.value.event_date).getTime() <= Date.now()) {
    alert('This event has already passed. Update the event date before sending invites.')
    return
  }
  
  notifying.value = true
  
  const { sendSMS } = useZend()
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
            .schema('m2m')
            .from('event_qualifications')
            .update({ notified_at: new Date().toISOString() })
            .eq('event_id', event.id)
            .eq('user_id', user.id)

          qualificationMetaByUserId.value = {
            ...qualificationMetaByUserId.value,
            [user.id]: {
              ...(qualificationMetaByUserId.value[user.id] || {}),
              status: qualificationMetaByUserId.value[user.id]?.status || 'qualified',
              notified_at: new Date().toISOString()
            }
          }
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

const formatShortDateTime = (value?: string | null) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })
}

watch([userSearch, filterGender, filterPersona, availableSort, availabilityMode], () => {
  availableVisibleCount.value = availablePageSize
})

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

.quick-chip {
  border: 1px solid #E7E5E4;
  background: #F8F7F5;
  color: #57534E;
  border-radius: 9999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.quick-chip--active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.user-row--selected {
  background: #F5F3FF;
  border-left: 3px solid #7C3AED;
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
