<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Events</h1>
        <p class="ad-sub">Create events, track ticket sales and invite the right people.</p>
      </div>
      <button class="btn-primary" @click="showModal = true">New event</button>
    </header>

    <div v-if="loading" class="ad-panel"><div class="ad-empty"><span class="ad-spinner"></span></div></div>

    <div v-else-if="events.length === 0" class="ad-panel">
      <div class="ad-empty">
        <p class="ad-empty__title">No events yet</p>
        <p>Create your first one to start selling tickets.</p>
        <button class="btn-primary mt-5" @click="showModal = true">New event</button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="event in events" :key="event.id" class="ad-panel flex flex-col !p-0 overflow-hidden">
        <button class="relative block aspect-[2/1] w-full overflow-hidden bg-[#f1efec]" :aria-label="`Open ${event.title}`" @click="viewBookings(event)">
          <img v-if="event.cover_image_url" :src="event.cover_image_url" alt="" class="h-full w-full object-cover" />
          <svg v-else class="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-[#c9c3bb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span class="absolute left-3 top-3 flex gap-1">
            <span class="ad-pill shadow-sm" :class="getStatusClass(event.status) || '!bg-white'">{{ statusLabel(event.status) }}</span>
            <span v-if="!event.is_public" class="ad-pill ad-pill--plain !bg-white shadow-sm">Invite only</span>
          </span>
        </button>

        <div class="flex flex-1 flex-col p-5">
          <p class="text-xs font-medium ad-muted">{{ formatDate(event.event_date) }}</p>
          <h3 class="font-display mt-1 text-[1.35rem] leading-tight">{{ event.title }}</h3>
          <p class="mt-1 text-sm ad-muted">{{ event.venue }}</p>

          <div class="mt-4 space-y-2">
            <div v-for="side in [
              { label: 'Men', sold: event.male_tickets_sold || 0, cap: event.male_capacity || 0 },
              { label: 'Women', sold: event.female_tickets_sold || 0, cap: event.female_capacity || 0 }
            ]" :key="side.label" class="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-xs" :title="`${side.label}: ${side.sold} of ${side.cap} sold`">
              <span class="ad-muted">{{ side.label }}</span>
              <span class="h-1.5 overflow-hidden rounded-full bg-[#f1efec]">
                <span class="block h-full rounded-full" :class="side.cap && side.sold >= side.cap ? 'bg-[#ed1c24]' : 'bg-[#393737]'" :style="{ width: (side.cap ? Math.min(100, (side.sold / side.cap) * 100) : 0) + '%' }"></span>
              </span>
              <span class="ad-num font-medium">{{ side.sold }}/{{ side.cap }}</span>
            </div>
          </div>

          <div class="mt-auto flex gap-2 pt-5">
            <button class="btn-ink btn-sm flex-1" @click="viewBookings(event)">Bookings</button>
            <button class="btn-secondary btn-sm flex-1" @click="openQualifyModal(event)">Invite</button>
            <button class="ad-icon-btn !h-8 !w-8" title="Edit event" aria-label="Edit event" @click="editEvent(event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-if="!loading && totalEvents > pageSize" class="ad-pager">
      <span>{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalEvents) }} of {{ totalEvents }}</span>
      <div class="ad-pager__buttons">
        <button class="btn-secondary btn-sm" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">Previous</button>
        <button class="btn-secondary btn-sm" :disabled="currentPage * pageSize >= totalEvents" @click="handlePageChange(currentPage + 1)">Next</button>
      </div>
    </div>

    <!-- Create / edit -->
    <Teleport to="body">
      <div v-if="showModal" class="m2m-app m2m-admin modal-overlay" @click.self="closeModal">
        <div class="modal modal--large" role="dialog" aria-modal="true" aria-labelledby="event-form-title">
          <div class="modal__header">
            <h2 id="event-form-title" class="modal__title">{{ editingEvent ? 'Edit event' : 'New event' }}</h2>
            <button class="modal__close" aria-label="Close" @click="closeModal">×</button>
          </div>

          <div class="modal__content">
            <form class="space-y-6" @submit.prevent="saveEvent">
              <div class="flex items-center gap-4">
                <div class="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#f1efec]">
                  <img v-if="form.cover_image_url" :src="form.cover_image_url" alt="" class="h-full w-full object-cover" />
                  <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-white/70"><span class="ad-spinner"></span></div>
                </div>
                <div class="min-w-0">
                  <label class="btn-secondary btn-sm cursor-pointer">
                    {{ form.cover_image_url ? 'Change cover' : 'Upload cover' }}
                    <input type="file" accept="image/*" class="sr-only" @change="handleImageUpload" />
                  </label>
                  <p class="mt-1.5 text-xs ad-faint">1200×600 JPG or PNG works best.</p>
                </div>
              </div>

              <fieldset class="space-y-4">
                <legend class="ad-label">Details</legend>
                <div>
                  <label class="form-label" for="ev-title">Title</label>
                  <input id="ev-title" v-model="form.title" type="text" class="form-input" required placeholder="e.g. Singles Mixer in Accra" />
                </div>
                <div>
                  <label class="form-label" for="ev-desc">Description</label>
                  <textarea id="ev-desc" v-model="form.description" rows="3" class="form-input" placeholder="What should guests know?"></textarea>
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="form-label" for="ev-date">Date and time</label>
                    <input id="ev-date" v-model="form.event_date" type="datetime-local" class="form-input" required />
                  </div>
                  <div>
                    <label class="form-label" for="ev-venue">Venue</label>
                    <input id="ev-venue" v-model="form.venue" type="text" class="form-input" required placeholder="e.g. Zen Garden" />
                  </div>
                </div>
                <div>
                  <label class="form-label" for="ev-address">Address</label>
                  <input id="ev-address" v-model="form.venue_address" type="text" class="form-input" placeholder="Full address, for the map" />
                </div>
              </fieldset>

              <fieldset>
                <legend class="ad-label">Tickets and guests</legend>
                <div class="overflow-hidden rounded-2xl border border-[#ece8e3]">
                  <div class="grid grid-cols-[5rem_1fr_1fr] gap-3 border-b border-[#ece8e3] bg-[#faf8f5] px-4 py-2 text-xs ad-muted sm:grid-cols-[5rem_1fr_1fr_1fr_1fr]">
                    <span></span><span>Capacity</span><span>Price (GH₵)</span><span class="hidden sm:block">Min age</span><span class="hidden sm:block">Max age</span>
                  </div>
                  <div class="grid grid-cols-[5rem_1fr_1fr] items-center gap-3 border-b border-[#f3f1ee] px-4 py-3 sm:grid-cols-[5rem_1fr_1fr_1fr_1fr]">
                    <span class="text-sm font-medium">Men</span>
                    <input v-model.number="form.male_capacity" type="number" min="1" class="form-input" required aria-label="Men capacity" />
                    <input v-model.number="form.ticket_price_male" type="number" min="0" step="0.01" class="form-input" required aria-label="Men ticket price" />
                    <input v-model.number="form.male_min_age" type="number" min="18" class="form-input max-sm:col-start-2" placeholder="25" aria-label="Men minimum age" />
                    <input v-model.number="form.male_max_age" type="number" min="18" class="form-input" placeholder="40" aria-label="Men maximum age" />
                  </div>
                  <div class="grid grid-cols-[5rem_1fr_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[5rem_1fr_1fr_1fr_1fr]">
                    <span class="text-sm font-medium">Women</span>
                    <input v-model.number="form.female_capacity" type="number" min="1" class="form-input" required aria-label="Women capacity" />
                    <input v-model.number="form.ticket_price_female" type="number" min="0" step="0.01" class="form-input" required aria-label="Women ticket price" />
                    <input v-model.number="form.female_min_age" type="number" min="18" class="form-input max-sm:col-start-2" placeholder="21" aria-label="Women minimum age" />
                    <input v-model.number="form.female_max_age" type="number" min="18" class="form-input" placeholder="35" aria-label="Women maximum age" />
                  </div>
                </div>
              </fieldset>

              <fieldset class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <legend class="ad-label">Publishing</legend>
                <div>
                  <label class="form-label" for="ev-status">Status</label>
                  <select id="ev-status" v-model="form.status" class="ad-select w-full !h-[44px]">
                    <option value="draft">Draft (hidden)</option>
                    <option value="open">Open (selling tickets)</option>
                    <option value="waitlist">Waitlist (full)</option>
                    <option value="sold_out">Sold out</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" for="ev-visibility">Who can see it</label>
                  <select id="ev-visibility" v-model="form.is_public" class="ad-select w-full !h-[44px]">
                    <option :value="true">Everyone</option>
                    <option :value="false">Invited members only</option>
                  </select>
                </div>
              </fieldset>
            </form>
          </div>

          <div class="modal__footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="button" class="btn-primary" :disabled="saving" @click="saveEvent">{{ saving ? 'Saving…' : editingEvent ? 'Save changes' : 'Create event' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Invite (qualify) members -->
    <Teleport to="body">
      <div v-if="showQualifyModal" class="m2m-app m2m-admin modal-overlay" @click.self="closeQualifyModal">
        <div class="modal modal--large !max-w-[980px]" role="dialog" aria-modal="true" aria-labelledby="qualify-title">
          <div class="modal__header">
            <div>
              <h2 id="qualify-title" class="modal__title">Invite members</h2>
              <p class="modal__sub">{{ qualifyingEvent?.title }}</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="closeQualifyModal">×</button>
          </div>

          <div class="space-y-4 border-b border-[#ece8e3] px-6 py-4">
            <div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <div v-for="side in [
                { label: 'Men', count: qualifiedMaleCount, cap: qualifyingEvent?.male_capacity || 0, pct: maleCapacityPercent, left: remainingMaleSlots },
                { label: 'Women', count: qualifiedFemaleCount, cap: qualifyingEvent?.female_capacity || 0, pct: femaleCapacityPercent, left: remainingFemaleSlots }
              ]" :key="side.label" class="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-sm">
                <span class="ad-muted">{{ side.label }}</span>
                <span class="h-1.5 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: side.pct + '%' }"></span></span>
                <span class="ad-num" :class="side.count > side.cap ? 'font-semibold text-[#b4232a]' : ''">{{ side.count }}/{{ side.cap }} <span class="text-xs ad-faint">· {{ side.left }} left</span></span>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="ad-tabs">
                <button v-for="mode in [
                  { key: 'all', label: 'Everyone' },
                  { key: 'male', label: 'Fill men' },
                  { key: 'female', label: 'Fill women' },
                  { key: 'balanced', label: 'Balanced' }
                ]" :key="mode.key" class="ad-tab !h-8" :class="{ 'is-active': availabilityMode === mode.key }" @click="availabilityMode = mode.key as any">{{ mode.label }}</button>
              </div>
              <div class="flex items-center gap-3 text-xs ad-muted">
                <button v-if="neededGenderFilter" class="btn-ghost btn-sm" @click="prefillNeededGender">Show only {{ neededGenderFilter === 'male' ? 'men' : 'women' }}</button>
                <span>{{ notifiedQualifiedCount }} invited · {{ selectedAvailableUserIds.length }} selected</span>
              </div>
            </div>
          </div>

          <div class="modal__content grid h-[55vh] grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Available -->
            <div class="flex min-h-0 flex-col">
              <div class="mb-3 grid grid-cols-2 gap-2">
                <label class="ad-search col-span-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
                  <input v-model="userSearch" type="search" placeholder="Search members" aria-label="Search members" />
                </label>
                <select v-model="filterGender" class="ad-select" aria-label="Gender">
                  <option value="">Any gender</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
                <select v-model="availableSort" class="ad-select" aria-label="Sort">
                  <option value="recommended">Recommended</option>
                  <option value="name">Name</option>
                  <option value="gender">Gender</option>
                  <option value="persona">Persona</option>
                </select>
                <select v-model="filterPersona" class="ad-select col-span-2" aria-label="Persona">
                  <option value="">Any persona</option>
                  <option v-for="(p, key) in personas" :key="key" :value="key">{{ p.name }}</option>
                </select>
              </div>

              <div class="mb-2 flex items-center justify-between gap-2">
                <h3 class="ad-label !mb-0">Available · {{ filteredAvailableUsers.length }}</h3>
                <div v-if="visibleAvailableUsers.length > 0" class="flex gap-1">
                  <button class="btn-ghost btn-sm" @click="toggleSelectAllVisible">{{ allVisibleSelected ? 'Clear' : 'Select shown' }}</button>
                  <button class="btn-ink btn-sm" :disabled="selectedAvailableUserIds.length === 0" @click="addSelectedUsers">Add {{ selectedAvailableUserIds.length || '' }}</button>
                </div>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#ece8e3]">
                <div v-if="loadingUsers" class="ad-empty !py-10"><span class="ad-spinner"></span></div>
                <p v-else-if="visibleAvailableUsers.length === 0" class="ad-empty !py-10">No members match.</p>
                <template v-else>
                  <div v-for="user in visibleAvailableUsers" :key="user.id" class="flex items-center gap-3 border-b border-[#f3f1ee] px-3 py-2.5 last:border-0" :class="{ 'bg-[#faf8f5]': selectedAvailableUserIds.includes(user.id) }">
                    <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input type="checkbox" class="h-4 w-4" :checked="selectedAvailableUserIds.includes(user.id)" @change="toggleSelectedAvailableUser(user.id)" />
                      <span class="ad-avatar ad-avatar--sm">{{ user.display_name?.charAt(0) || '?' }}</span>
                      <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-2">
                          <span class="ad-person__name !font-medium text-sm">{{ user.display_name }}</span>
                          <span v-if="availabilityRecommendation(user)" class="ad-pill ad-pill--plain !h-5 !text-[11px]" :class="availabilityRecommendation(user) === 'Best fit' ? 'ad-pill--green' : 'ad-pill--blue'">{{ availabilityRecommendation(user) }}</span>
                        </span>
                        <span class="ad-person__meta capitalize">{{ [user.gender, getPersona(user.dating_persona)?.name].filter(Boolean).join(' · ') }}</span>
                      </span>
                    </label>
                    <button class="ad-icon-btn !h-8 !w-8" title="Add" aria-label="Add" @click="addQualification(user.id)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                  <button v-if="visibleAvailableUsers.length < filteredAvailableUsers.length" class="w-full py-3 text-sm font-medium ad-muted hover:text-[#393737]" @click="loadMoreAvailableUsers">
                    Show {{ Math.min(availableVisibleCount + availablePageSize, filteredAvailableUsers.length) - visibleAvailableUsers.length }} more
                  </button>
                </template>
              </div>
            </div>

            <!-- Qualified -->
            <div class="flex min-h-0 flex-col">
              <div class="mb-3 grid grid-cols-2 gap-2">
                <label class="ad-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
                  <input v-model="qualifiedSearch" type="search" placeholder="Search invited" aria-label="Search invited" />
                </label>
                <select v-model="qualifiedFilter" class="ad-select" aria-label="Invite status">
                  <option value="all">All</option>
                  <option value="notified">SMS sent</option>
                  <option value="not_notified">Not sent yet</option>
                </select>
              </div>

              <div class="mb-2 flex min-h-8 items-center justify-between gap-2">
                <h3 class="ad-label !mb-0">On the list · {{ filteredQualifiedUsers.length }}</h3>
                <div class="flex gap-1">
                  <button v-if="selectedQualifiedUserIds.length" class="btn-ghost btn-sm" @click="removeSelectedQualifiedUsers">Remove {{ selectedQualifiedUserIds.length }}</button>
                  <button v-if="qualifiedUsers.length" class="btn-ghost btn-sm !text-[#b4232a]" @click="clearQualifications">Clear all</button>
                </div>
              </div>

              <div class="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#ece8e3]">
                <p v-if="filteredQualifiedUsers.length === 0" class="ad-empty !py-10">Nobody on the list yet.</p>
                <div v-for="user in filteredQualifiedUsers" v-else :key="user.id" class="flex items-center gap-3 border-b border-[#f3f1ee] px-3 py-2.5 last:border-0" :class="{ 'bg-[#faf8f5]': selectedQualifiedUserIds.includes(user.id) }">
                  <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input type="checkbox" class="h-4 w-4" :checked="selectedQualifiedUserIds.includes(user.id)" @change="toggleSelectedQualifiedUser(user.id)" />
                    <span class="ad-avatar ad-avatar--sm">{{ user.display_name?.charAt(0) || '?' }}</span>
                    <span class="min-w-0 flex-1">
                      <span class="ad-person__name !font-medium text-sm">{{ user.display_name }}</span>
                      <span class="ad-person__meta">
                        {{ qualificationMetaByUserId[user.id]?.notified_at ? `SMS sent ${formatShortDateTime(qualificationMetaByUserId[user.id]?.notified_at)}` : 'SMS not sent' }}
                      </span>
                    </span>
                  </label>
                  <button class="ad-icon-btn !h-8 !w-8 hover:!text-[#b4232a]" title="Remove" aria-label="Remove" @click="removeQualification(user.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal__footer">
            <button class="btn-secondary" @click="closeQualifyModal">Done</button>
            <button class="btn-primary" :disabled="notifying || qualifiedUsers.length === 0" @click="notifyQualifiedUsers">
              {{ notifying ? 'Sending…' : `Text invites to ${qualifiedUsers.length}` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Alert booked guests about changes -->
    <Teleport to="body">
      <div v-if="showChangeAlertModal" class="m2m-app m2m-admin modal-overlay" @click.self="closeChangeAlertModal">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="change-title">
          <div class="modal__header">
            <div>
              <h2 id="change-title" class="modal__title">Tell booked guests?</h2>
              <p class="modal__sub">You changed key details of this event.</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="closeChangeAlertModal">×</button>
          </div>
          <div class="modal__content">
            <label class="ad-label" for="change-message">SMS</label>
            <textarea id="change-message" v-model="changeAlertMessage" rows="6" class="form-input text-sm" placeholder="What changed?" required></textarea>
            <p class="mt-1.5 text-xs ad-faint">{name} becomes each guest's name.</p>
          </div>
          <div class="modal__footer flex-wrap">
            <button type="button" class="btn-ghost mr-auto" :disabled="sendingChangeAlert" @click="closeChangeAlertModal">Cancel</button>
            <button type="button" class="btn-secondary" :disabled="sendingChangeAlert" @click="executeSaveEvent(false)">Save only</button>
            <button type="button" class="btn-primary" :disabled="sendingChangeAlert || !changeAlertMessage.trim()" @click="executeSaveEvent(true)">
              {{ sendingChangeAlert ? 'Sending…' : 'Save and text guests' }}
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
    case 'open': return 'ad-pill--green'
    case 'waitlist': return 'ad-pill--amber'
    case 'sold_out': return 'ad-pill--red'
    case 'completed': return 'ad-pill--blue'
    default: return ''
  }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    waitlist: 'Waitlist',
    sold_out: 'Sold out',
    completed: 'Completed'
  }
  return labels[status] || status.replace(/_/g, ' ')
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
