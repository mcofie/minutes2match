<template>
  <div>
    <!-- Filters -->
    <div class="users__filters">
      <select v-model="filters.gender" class="form-select user-filter">
        <option value="">All Genders</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      
      <select v-model="filters.persona" class="form-select user-filter">
        <option value="">All Personas</option>
        <option v-for="(persona, key) in personas" :key="key" :value="key">
          {{ persona.name }}
        </option>
      </select>
      
      <select v-model="filters.verified" class="form-select user-filter">
        <option value="">All Status</option>
        <option value="true">Verified</option>
        <option value="false">Unverified</option>
      </select>
      
      <input
        type="text"
        v-model="filters.search"
        placeholder="Search by name or phone..."
        class="form-input user-search"
      />
      <button class="btn-secondary" @click="exportUsers">
        Export CSV
      </button>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedIds.length > 0" class="bulk-actions">
      <span>{{ selectedIds.length }} users selected</span>
      <div class="flex gap-2">
        <button class="btn-sm btn-primary" @click="bulkVerify">Verify Selected</button>
        <button class="btn-sm btn-danger" @click="bulkDelete">Delete Selected</button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
            </th>
            <th>User</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Persona</th>
            <th>Location</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-8 text-muted">Loading users...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="8" class="text-center py-8 text-muted">No users found</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td>
              <input type="checkbox" :value="user.id" v-model="selectedIds" />
            </td>
            <td>
              <div class="user-cell cursor-pointer" @click="viewUser(user)">
                <div class="user-avatar">
                  <img 
                    v-if="user.photo_url" 
                    :src="user.photo_url" 
                    :alt="user.display_name" 
                    class="user-avatar-img"
                  />
                  <span v-else>{{ user.display_name?.charAt(0) || '?' }}</span>
                </div>
                <div>
                  <div class="user-name">{{ user.display_name || 'Anonymous' }}</div>
                  <div class="user-phone">{{ user.phone }}</div>
                </div>
              </div>
            </td>
            <td>{{ user.gender ? capitalize(user.gender) : '-' }}</td>
            <td>{{ getAge(user.birth_date) }}</td>
            <td>
              <span v-if="user.dating_persona" class="persona-badge" :style="{ backgroundColor: getPersona(user.dating_persona)?.color }">
                <span v-html="getPersonaIcon(user.dating_persona)"></span>
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ user.location || '-' }}</td>
            <td>
              <span class="badge" :class="user.is_verified ? 'badge--green' : 'badge--yellow'">
                {{ user.is_verified ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="flex items-center gap-2">
                <button class="btn-secondary btn-sm" @click="viewUser(user)">View Details</button>
                <button class="btn-primary btn-sm" @click="selectForMatch(user)" title="Add to match">Match</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <Pagination 
      :current-page="currentPage" 
      :total-pages="Math.ceil(totalUsers / pageSize)" 
      :total-items="totalUsers"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />

    <!-- User Details Modal -->
    <Teleport to="body">
      <div v-if="showModal && selectedUser" class="modal-overlay" @click.self="closeModal">
        <div class="modal user-detail-modal">
          <!-- Modal Header with Photo -->
          <div class="modal__header user-header">
            <div class="user-header__left">
              <!-- Profile Photo or Avatar -->
              <div class="user-header__photo">
                <img 
                  v-if="selectedUser.photo_url" 
                  :src="selectedUser.photo_url" 
                  :alt="selectedUser.display_name"
                  class="user-photo cursor-pointer"
                  @click="openImagePreview(selectedUser.photo_url)"
                />
                <div v-else class="user-avatar-large">
                  {{ selectedUser.display_name?.charAt(0) || '?' }}
                </div>
                <span 
                  class="verification-dot" 
                  :class="selectedUser.is_verified ? 'verified' : 'pending'"
                  :title="selectedUser.is_verified ? 'Verified' : 'Pending'"
                ></span>
              </div>
              
              <!-- Name & Quick Info -->
              <div class="user-header__info">
                <h2 class="user-header__name">{{ selectedUser.display_name || 'Anonymous' }}</h2>
                <div class="user-header__meta">
                  <span class="meta-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {{ capitalize(selectedUser.gender) || 'Unknown' }}, {{ getAge(selectedUser.birth_date) }}y
                  </span>
                  <span class="meta-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ selectedUser.location || 'Unknown' }}
                  </span>
                  <span v-if="selectedUser.occupation" class="meta-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    {{ selectedUser.occupation }}
                  </span>
                </div>
                
                <!-- Persona Badge -->
                <div v-if="selectedUser.dating_persona" class="persona-chip">
                  <span class="persona-chip__emoji" v-html="getPersonaIcon(selectedUser.dating_persona)"></span>
                  <span class="persona-chip__name">{{ getPersona(selectedUser.dating_persona)?.name }}</span>
                </div>
              </div>
            </div>
            <button class="modal__close" @click="closeModal">×</button>
          </div>

          <!-- Tab Navigation -->
          <div class="user-tabs">
            <button 
              class="user-tab" 
              :class="{ active: activeTab === 'profile' }"
              @click="activeTab = 'profile'"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
            <button 
              class="user-tab" 
              :class="{ active: activeTab === 'activity' }"
              @click="activeTab = 'activity'"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Activity
            </button>
            <button 
              class="user-tab" 
              :class="{ active: activeTab === 'vibes' }"
              @click="activeTab = 'vibes'"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Vibe Check
            </button>
          </div>
          
          <div class="modal__content user-content">
            <!-- Profile Tab -->
            <div v-if="activeTab === 'profile'" class="tab-content">
              <div class="info-grid">
                <!-- Basic Info Card -->
                <div class="info-card">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Basic Information
                  </h4>
                  <div class="info-rows">
                    <div class="info-row">
                      <span class="info-label">Full Name</span>
                      <span class="info-value">{{ selectedUser.display_name || 'Not set' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Gender</span>
                      <span class="info-value">{{ capitalize(selectedUser.gender) || 'Not set' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Age</span>
                      <span class="info-value">{{ getAge(selectedUser.birth_date) }} years old</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Birthday</span>
                      <span class="info-value">{{ selectedUser.birth_date ? formatDate(selectedUser.birth_date) : 'Not set' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Location</span>
                      <span class="info-value">{{ capitalize(selectedUser.location) || 'Not set' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Preferences Card -->
                <div class="info-card">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Dating Preferences
                  </h4>
                  <div class="info-rows">
                    <div class="info-row">
                      <span class="info-label">Interested In</span>
                      <span class="info-value info-value--highlight">
                        {{ formatInterestedIn(selectedUser.interested_in) }}
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Looking For</span>
                      <span class="info-value">
                        <span class="intent-badge" :class="'intent-' + selectedUser.intent">
                          {{ formatIntent(selectedUser.intent) }}
                        </span>
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Persona</span>
                      <span class="info-value" v-if="selectedUser.dating_persona">
                        <span class="inline-block w-4 h-4 mr-1 align-text-bottom text-muted" v-html="getPersonaIcon(selectedUser.dating_persona)"></span>
                        {{ getPersona(selectedUser.dating_persona)?.name }}
                      </span>
                      <span class="info-value info-value--muted" v-else>Not assigned</span>
                    </div>
                  </div>
                </div>

                <!-- Extended Details Card -->
                <div class="info-card">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    Extended Details
                  </h4>
                  <div class="info-rows">
                    <div class="info-row">
                      <span class="info-label">Height</span>
                      <span class="info-value">
                        {{ selectedUser.height_cm ? `${selectedUser.height_cm}cm (${cmToFeet(selectedUser.height_cm)})` : 'Not set' }}
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Occupation</span>
                      <span class="info-value">{{ selectedUser.occupation || 'Not set' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Religion</span>
                      <span class="info-value">{{ capitalize(selectedUser.religion) || 'Not set' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Genotype</span>
                      <span class="info-value">
                        <span v-if="selectedUser.genotype" class="genotype-badge" :class="'genotype-' + selectedUser.genotype">
                          {{ selectedUser.genotype }}
                        </span>
                        <span v-else class="info-value--muted">Not set</span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Contact & Status Card -->
                <div class="info-card">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                    </svg>
                    Contact & Account
                  </h4>
                  <div class="info-rows">
                    <div class="info-row">
                      <span class="info-label">Phone</span>
                      <span class="info-value info-value--mono">{{ selectedUser.phone }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Status</span>
                      <span class="info-value">
                        <span class="status-badge" :class="selectedUser.is_verified ? 'status-verified' : 'status-pending'">
                          {{ selectedUser.is_verified ? '✓ Verified' : '⏳ Pending' }}
                        </span>
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Joined</span>
                      <span class="info-value">{{ formatDate(selectedUser.created_at) }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Last Updated</span>
                      <span class="info-value">{{ selectedUser.updated_at ? formatDate(selectedUser.updated_at) : 'Never' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Bio / About Me Card -->
                <div class="info-card info-card--full">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    About Me
                  </h4>
                  <p v-if="selectedUser.about_me" class="bio-text">
                    "{{ selectedUser.about_me }}"
                  </p>
                  <p v-else class="bio-text bio-text--empty">
                    No bio added yet
                  </p>
                </div>

                <!-- Interests Card -->
                <div class="info-card info-card--full">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Interests
                  </h4>
                  <div v-if="selectedUser.interests && selectedUser.interests.length > 0" class="interests-list">
                    <span 
                      v-for="interest in selectedUser.interests" 
                      :key="interest" 
                      class="interest-tag"
                    >
                      {{ getInterestLabel(interest) }}
                    </span>
                  </div>
                  <p v-else class="bio-text--empty">No interests selected</p>
                </div>

                <!-- Age Preferences Card -->
                <div class="info-card">
                  <h4 class="info-card__title">
                    <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Age Preferences
                  </h4>
                  <div class="info-rows">
                    <div class="info-row">
                      <span class="info-label">Age Range</span>
                      <span class="info-value">
                        <span v-if="selectedUser.min_age || selectedUser.max_age" class="age-range-badge">
                          {{ selectedUser.min_age || 18 }} - {{ selectedUser.max_age || 50 }} years
                        </span>
                        <span v-else class="info-value--muted">Not set</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Persona Description -->
              <div v-if="selectedUser.dating_persona" class="persona-description">
                <div class="persona-description__header">
                  <span class="persona-description__emoji" v-html="getPersonaIcon(selectedUser.dating_persona)"></span>
                  <div>
                    <h4 class="persona-description__title">{{ getPersona(selectedUser.dating_persona)?.name }}</h4>
                    <p class="persona-description__subtitle">Dating Persona</p>
                  </div>
                </div>
                <p class="persona-description__text">
                  {{ getPersona(selectedUser.dating_persona)?.description }}
                </p>
              </div>
            </div>

            <!-- Activity Tab -->
            <div v-if="activeTab === 'activity'" class="tab-content">
              <UserActivityTimeline 
                :userId="selectedUser.id" 
                :user="selectedUser" 
              />
            </div>
            
            <!-- Suggested Matches (New Section in Profile) -->
            <div v-if="activeTab === 'profile'" class="mt-6 border-t pt-6">
               <h4 class="info-card__title mb-4">
                  <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  Smart Suggestions
               </h4>
               <div v-if="loadingSuggestions" class="text-sm text-gray-500">Finding suggestions...</div>
               <div v-else-if="suggestedMatches.length === 0" class="text-sm text-gray-500">No suggestions found.</div>
               <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="match in suggestedMatches" :key="match.id" class="flex items-center justify-between p-3 border rounded-lg bg-white">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 overflow-hidden">
                           <img v-if="match.photo_url" :src="match.photo_url" class="w-full h-full object-cover" />
                           <span v-else>{{ match.display_name?.charAt(0) || '?' }}</span>
                        </div>
                        <div>
                           <div class="font-semibold text-sm">{{ match.display_name }}</div>
                           <div class="text-xs text-brand-500 font-bold">{{ match.match_score }}% Match</div>
                        </div>
                     </div>
                     <button class="btn-xs btn-primary" @click="selectForMatch(match)">Match</button>
                  </div>
               </div>
            </div>

            <!-- Admin Notes (New Section in Profile) -->
            <div v-if="activeTab === 'profile'" class="mt-6 border-t pt-6">
              <h4 class="info-card__title mb-4">
                <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Admin Notes
              </h4>
              <textarea 
                v-model="adminNotes" 
                class="w-full p-3 border rounded-lg text-sm bg-yellow-50 focus:bg-white transition-colors min-h-[100px]"
                placeholder="Add private notes about this user..."
                @blur="saveAdminNotes"
              ></textarea>
              <div v-if="notesSaved" class="text-xs text-green-600 mt-1 font-semibold">Notes saved!</div>
            </div>

            <!-- Vibe Check Tab -->
            <div v-if="activeTab === 'vibes'" class="tab-content">
              <div v-if="loadingAnswers" class="loading-state">
                <div class="spinner"></div>
                <p>Loading vibe answers...</p>
              </div>
              
              <div v-else-if="userAnswers.length === 0" class="empty-vibes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <h4>No Vibe Check Yet</h4>
                <p>This user hasn't completed the vibe check questions.</p>
              </div>
              
              <div v-else class="vibes-grid">
                <div v-for="(item, idx) in userAnswers" :key="idx" class="vibe-card">
                  <div class="vibe-card__question">
                    <span class="vibe-number">{{ idx + 1 }}</span>
                    {{ item.question }}
                  </div>
                  <div class="vibe-card__answer">
                    {{ item.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal__footer">
            <button class="btn-secondary" @click="closeModal">Close</button>
            <button class="btn-primary" @click="selectForMatch(selectedUser)">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Select for Match
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="showImagePreview" class="modal-overlay image-preview-overlay" @click="closeImagePreview">
        <div class="image-preview-container">
          <img :src="previewImageUrl" class="preview-image" @click.stop />
          <button class="preview-close" @click="closeImagePreview">×</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'

useHead({ title: 'Users' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const loading = ref(true)
const users = ref<any[]>([])
const selectedIds = ref<string[]>([])
const filters = reactive({
  gender: '',
  persona: '',
  verified: '',
  search: ''
})

// Pagination State
const currentPage = ref(1)
const pageSize = ref(15)
const totalUsers = ref(0) // Will be set by fetch

// Modal State
const showModal = ref(false)
const selectedUser = ref<any>(null)
// Image Preview State
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const adminNotes = ref('')
const notesSaved = ref(false)
const suggestedMatches = ref<any[]>([])
const loadingSuggestions = ref(false)

const userAnswers = ref<any[]>([])
const loadingAnswers = ref(false)
const questionsMap = ref<Record<string, string>>({})
const activeTab = ref<'profile' | 'activity' | 'vibes'>('profile')
const loadingActivity = ref(false)
const userActivity = reactive({
  totalMatches: 0,
  unlockedMatches: 0,
  eventsAttended: 0,
  totalSpent: 0,
  matches: [] as any[],
  events: [] as any[],
  payments: [] as any[]
})

// Fetch users with Server-Side Filtering & Pagination
const fetchUsers = async () => {
  loading.value = true
  
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
  
  // Apply Filters
  if (filters.gender) {
    query = query.eq('gender', filters.gender)
  }
  
  if (filters.persona) {
    query = query.eq('dating_persona', filters.persona)
  }
  
  if (filters.verified) {
    query = query.eq('is_verified', filters.verified === 'true')
  }
  
  if (filters.search) {
    // Simple search on display_name or phone
    const searchTerm = `%${filters.search}%`
    query = query.or(`display_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
  }
  
  // Apply Pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
  }

  users.value = data || []
  totalUsers.value = count || 0
  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

// Watch filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
  fetchUsers()
}, { deep: true })

// Bulk Actions
const isAllSelected = computed(() => {
  return users.value.length > 0 && selectedIds.value.length === users.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = users.value.map(u => u.id)
  }
}

const bulkVerify = async () => {
  if (!confirm(`Verify ${selectedIds.value.length} users?`)) return
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: true })
    .in('id', selectedIds.value)

  if (!error) {
    fetchUsers()
    selectedIds.value = []
  }
}

const bulkDelete = async () => {
  if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedIds.value.length} users?`)) return
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .in('id', selectedIds.value)

  if (!error) {
    fetchUsers()
    selectedIds.value = []
  }
}

const exportUsers = () => {
  const data = users.value.map(u => ({
    name: u.display_name,
    phone: u.phone,
    gender: u.gender,
    age: getAge(u.birth_date),
    location: u.location,
    is_verified: u.is_verified ? 'Yes' : 'No',
    joined: new Date(u.created_at).toLocaleDateString()
  }))
  
  downloadCSV(data, `users_export_${new Date().toISOString().split('T')[0]}.csv`)
}

// Fetch helper: Questions map
const fetchQuestionsMap = async () => {
  const { data } = await supabase
    .from('questions')
    .select('key, question')
  
  if (data) {
    data.forEach((q: any) => {
      questionsMap.value[q.key] = q.question
    })
  }
}

// Fetch user activity data
const fetchUserActivity = async (userId: string) => {
  loadingActivity.value = true
  
  // Reset activity data
  userActivity.totalMatches = 0
  userActivity.unlockedMatches = 0
  userActivity.eventsAttended = 0
  userActivity.totalSpent = 0
  userActivity.matches = []
  userActivity.events = []
  userActivity.payments = []

  try {
    // Fetch matches where user is either user_1 or user_2
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id, status, created_at, unlock_price,
        user_1:profiles!matches_user_1_id_fkey(id, display_name, photo_url),
        user_2:profiles!matches_user_2_id_fkey(id, display_name, photo_url)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawMatches = matches as any[] || []
    if (rawMatches.length) {
      userActivity.totalMatches = rawMatches.length
      userActivity.unlockedMatches = rawMatches.filter(m => m.status === 'unlocked').length
      userActivity.matches = rawMatches.map(m => ({
        ...m,
        matchedWith: m.user_1?.id === userId ? m.user_2 : m.user_1
      }))
    }

    // Fetch event bookings
    const { data: bookings } = await supabase
      .from('event_bookings')
      .select(`
        id, status, created_at,
        event:events(id, title, venue, event_date)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawBookings = bookings as any[] || []
    if (rawBookings.length) {
      userActivity.events = rawBookings
      userActivity.eventsAttended = rawBookings.filter(b => b.status === 'confirmed').length
    }

    // Fetch payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawPayments = payments as any[] || []
    if (rawPayments.length) {
      userActivity.payments = rawPayments
      userActivity.totalSpent = rawPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    }
  } catch (e) {
    console.error('Error fetching user activity:', e)
  } finally {
    loadingActivity.value = false
  }
}

// Actions
const viewUser = async (user: any) => {
  selectedUser.value = user
  showModal.value = true
  activeTab.value = 'profile'
  loadingAnswers.value = true
  userAnswers.value = []
  
  // Set Notes
  adminNotes.value = user.admin_notes || ''
  notesSaved.value = false
  
  // Fetch Suggestions
  fetchSuggestions(user)

  // Fetch answers and activity in parallel
  try {
    const [answersResult] = await Promise.all([
      supabase
        .from('vibe_answers')
        .select('question_key, answer_value')
        .eq('user_id', user.id),
      fetchUserActivity(user.id)
    ])

    if (answersResult.data) {
      userAnswers.value = answersResult.data.map((a: any) => ({
        question: questionsMap.value[a.question_key] || formatKey(a.question_key),
        answer: a.answer_value
      }))
    }
  } catch (e) {
    console.error('Error fetching user data:', e)
  } finally {
    loadingAnswers.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  activeTab.value = 'profile'
}

const selectForMatch = (user: any) => {
  sessionStorage.setItem('matchUser1', JSON.stringify(user))
  navigateTo('/admin/matches')
}

// Image Preview Actions
const openImagePreview = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
  previewImageUrl.value = ''
}



// Admin Notes
const saveAdminNotes = async () => {
  if (!selectedUser.value) return
  
  // Optimistic update
  selectedUser.value.admin_notes = adminNotes.value
  
  const { error } = await supabase
    .from('profiles')
    .update({ admin_notes: adminNotes.value })
    .eq('id', selectedUser.value.id)
    
  if (!error) {
    notesSaved.value = true
    setTimeout(() => { notesSaved.value = false }, 2000)
  }
}

// Smart Suggestions (Mock logic for now, or simple gender swap)
const fetchSuggestions = async (user: any) => {
  loadingSuggestions.value = true
  suggestedMatches.value = []
  
  // Simple heuristic: Opposite gender, verified, not matched yet
  // In a real app, this would be a weighted algorithm
  const targetGender = user.gender === 'male' ? 'female' : 'male'
  
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, photo_url, gender, birth_date, location')
    .eq('gender', targetGender)
    .eq('is_verified', true)
    .neq('id', user.id)
    .limit(4)
    
  if (data) {
    // Add fake match score for demo/ MVP
    suggestedMatches.value = data.map(m => ({
      ...m,
      match_score: Math.floor(Math.random() * (98 - 75) + 75) // Random 75-98%
    }))
  }
  
  loadingSuggestions.value = false
}

// Helpers
const formatKey = (key: string) => {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const getAge = (birthDate: string | null): string => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return String(age)
}

const getPersona = (personaId: string) => personas[personaId] || null

const getPersonaIcon = (id: string) => {
  const icons: Record<string, string> = {
    'power_player': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-briefcase"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    'romantic': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    'adventurer': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-compass"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    'intellectual': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    'social_butterfly': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-5.341"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'homebody': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  }
  return icons[id] || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

// Height converter
const cmToFeet = (cm: number): string => {
  if (!cm) return ''
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

// Format interested_in field
const formatInterestedIn = (value: string) => {
  const map: Record<string, string> = {
    'male': 'Men',
    'female': 'Women',
    'everyone': 'Everyone'
  }
  return map[value] || 'Not specified'
}

// Format intent field
const formatIntent = (value: string) => {
  const map: Record<string, string> = {
    'marriage': 'Marriage',
    'serious': 'Serious Relationship',
    'casual': 'Casual Dating',
    'friendship': 'Friendship'
  }
  return map[value] || 'Not specified'
}

// Format match status
const formatMatchStatus = (status: string) => {
  const map: Record<string, string> = {
    'pending_payment': 'Pending',
    'unlocked': 'Unlocked',
    'rejected': 'Rejected',
    'expired': 'Expired'
  }
  return map[status] || status
}

// Format payment purpose
const formatPurpose = (purpose: string) => {
  const map: Record<string, string> = {
    'match_unlock': 'Match Unlock',
    'event_ticket': 'Event Ticket'
  }
  return map[purpose] || purpose
}

// Get event day for display
const getEventDay = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).getDate()
}

// Get event month for display
const getEventMonth = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short' })
}

// Interest labels map
const interestLabels: Record<string, string> = {
  travel: 'Travel ✈️',
  fitness: 'Fitness 💪',
  cooking: 'Cooking 🍳',
  movies: 'Movies 🎬',
  music: 'Music 🎵',
  gaming: 'Gaming 🎮',
  reading: 'Reading 📚',
  art: 'Art 🎨',
  sports: 'Sports ⚽',
  tech: 'Tech 💻',
  fashion: 'Fashion 👗',
  food: 'Foodie 🍕',
  nature: 'Nature 🌿',
  photography: 'Photography 📸',
  dancing: 'Dancing 💃',
  entrepreneurship: 'Business 💼'
}

const getInterestLabel = (interestId: string): string => {
  return interestLabels[interestId] || interestId
}

// Initialize
onMounted(() => {
  fetchUsers()
  fetchQuestionsMap()
})
</script>

<style scoped>
/* Page specific styles matching theme */
.users__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.user-filter {
  width: auto;
  min-width: 150px;
}

.user-search {
  flex: 1;
  min-width: 250px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  color: #111827;
  font-weight: 600;
  border-radius: 50%;
  font-size: 0.875rem;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.user-phone {
  font-size: 0.75rem;
  color: #6B7280;
}

.persona-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: 1rem;
  border: 1px solid rgba(0,0,0,0.05);
}

/* Enhanced User Detail Modal */
.user-detail-modal {
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  background: white;
}

.user-header__left {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.user-header__photo {
  position: relative;
  flex-shrink: 0;
}

.user-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #E5E7EB;
}

.user-photo.cursor-pointer {
  cursor: zoom-in;
  transition: opacity 0.2s;
}

.user-photo.cursor-pointer:hover {
  opacity: 0.9;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  color: #111827;
  font-weight: 600;
  border-radius: 50%;
  font-size: 2rem;
  border: 1px solid #E5E7EB;
}

.verification-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid white;
}

.verification-dot.verified {
  background: #10B981;
}

.verification-dot.pending {
  background: #F59E0B;
}

.user-header__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-header__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.user-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.meta-item .icon {
  width: 14px;
  height: 14px;
  stroke: #9CA3AF;
}

.persona-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #F3F4F6;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  margin-top: 0.5rem;
}

.persona-chip__emoji {
  font-size: 1rem;
}

/* Tabs */
.user-tabs {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  background: white;
  padding: 0 1.5rem;
}

.user-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  margin-right: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.user-tab:hover {
  color: #111827;
}

.user-tab.active {
  color: #000000;
  border-bottom-color: #000000;
  font-weight: 600;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* Modal Content */
.user-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #F9FAFB;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.info-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #F3F4F6;
}

.card-icon {
  width: 16px;
  height: 16px;
  stroke: #6B7280;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: #6B7280;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  text-align: right;
}

.info-value--highlight {
  color: #000000;
  font-weight: 600;
}

.info-value--muted {
  color: #9CA3AF;
  font-weight: 400;
}

.info-value--mono {
  font-family: 'Space Mono', monospace;
  font-size: 0.8125rem;
}

/* Intent badges */
.intent-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #F3F4F6;
  color: #374151;
}

/* Genotype badges */
.genotype-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

.genotype-AA { background: #ECFDF5; color: #047857; }
.genotype-AS, .genotype-SS, .genotype-AC, .genotype-SC { background: #F3F4F6; color: #374151; }

/* Status badges */
.status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-verified {
  background: #ECFDF5;
  color: #047857;
}

.status-pending {
  background: #FFFBEB;
  color: #B45309;
}

/* Persona Description */
.persona-description {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.persona-description__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.persona-description__emoji {
  font-size: 2rem;
}

.persona-description__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.persona-description__subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.persona-description__text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* Activity Tab */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6B7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #F3F4F6;
  color: #111827;
}

.stat-card__icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.stat-icon--matches,
.stat-icon--unlocked,
.stat-icon--events {
  background: #F3F4F6;
  color: #111827;
}

.stat-icon--revenue {
  background: #ECFDF5;
  color: #047857;
}

.stat-card__content {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.stat-card__label {
  font-size: 0.75rem;
  color: #6B7280;
}

/* Activity Sections */
.activity-section {
  margin-bottom: 2rem;
}

.activity-section__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

/* Matches List */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.match-item__avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  color: #111827;
  font-weight: 600;
  border-radius: 50%;
  font-size: 0.875rem;
}

.match-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.match-item__name {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.match-item__date {
  font-size: 0.75rem;
  color: #6B7280;
}

.match-item__status {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
}

.match-item__status.status-unlocked {
  background: #ECFDF5;
  color: #047857;
}

.match-item__status.status-pending_payment {
  background: #FFFBEB;
  color: #B45309;
}

.match-item__status.status-rejected {
  background: #F3F4F6;
  color: #6B7280;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.event-item__date {
  width: 50px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000000;
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
}

.event-day {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1;
}

.event-month {
  font-size: 0.625rem;
  text-transform: uppercase;
  font-weight: 600;
}

.event-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-item__title {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.event-item__venue {
  font-size: 0.75rem;
  color: #6B7280;
}

.event-item__status {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 500;
}

.event-item__status.status-confirmed {
  background: #ECFDF5;
  color: #047857;
}

.event-item__status.status-pending {
  background: #FFFBEB;
  color: #B45309;
}

.event-item__status.status-cancelled {
  background: #FEF2F2;
  color: #DC2626;
}

/* Payments List */
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.payment-item__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #F3F4F6;
}

.payment-item__icon svg {
  width: 20px;
  height: 20px;
  stroke: #374151;
}

.payment-item__icon.purpose-match_unlock {
  background: #F3F4F6;
}
.payment-item__icon.purpose-match_unlock svg { stroke: #374151; }

.payment-item__icon.purpose-event_ticket {
  background: #F3F4F6;
}
.payment-item__icon.purpose-event_ticket svg { stroke: #374151; }

.payment-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.payment-item__purpose {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.payment-item__date {
  font-size: 0.75rem;
  color: #6B7280;
}

.payment-item__amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-value {
  font-weight: 700;
  color: #111827;
  font-size: 0.875rem;
}

.payment-status {
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.payment-status.status-success {
  background: #ECFDF5;
  color: #047857;
}

.payment-status.status-pending {
  background: #FFFBEB;
  color: #B45309;
}

.payment-status.status-failed {
  background: #FEF2F2;
  color: #DC2626;
}

/* Empty States */
.empty-activity, .empty-vibes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6B7280;
  text-align: center;
}

.empty-activity svg, .empty-vibes svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  stroke: #E5E7EB;
}

.empty-vibes h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
}

/* Image Preview Modal */
.image-preview-overlay {
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.preview-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
}

.preview-close:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .preview-close {
    top: -40px;
    right: 0;
  }
}

.empty-vibes p {
  margin: 0;
  font-size: 0.875rem;
}

/* Vibes Grid */
.vibes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.vibe-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #E5E7EB;
}

.vibe-card__question {
  display: flex;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #888;
  margin-bottom: 0.5rem;
}

.vibe-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 50%;
  flex-shrink: 0;
}

.vibe-card__answer {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
}

/* Button with icon */
.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  stroke: currentColor;
}

/* Utility classes */
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.text-muted { color: var(--color-text-muted); }
.cursor-pointer { cursor: pointer; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.w-10 { width: 2.5rem; }
.h-10 { height: 2.5rem; }
.rounded-full { border-radius: 9999px; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.md\:grid-cols-2 { 
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr)); 
  }
}
.gap-8 { gap: 2rem; }
.space-y-4 > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(1rem * var(--tw-space-y-reverse)); }
.justify-between { justify-content: space-between; }
.bg-gray-50 { background-color: #F9FAFB; }
.p-3 { padding: 0.75rem; }
.rounded-lg { border-radius: 0.5rem; }
.font-mono { font-family: monospace; }
.bg-blue-50 { background-color: #EFF6FF; }
.p-4 { padding: 1rem; }
.border-blue-100 { border-color: #DBEAFE; }
.text-blue-900 { color: #1E3A8A; }
.text-blue-800 { color: #1E40AF; }
.max-h-\[400px\] { max-height: 400px; }
.overflow-y-auto { overflow-y: auto; }
.pr-2 { padding-right: 0.5rem; }
.text-gray-800 { color: #1F2937; }
.font-medium { font-weight: 500; }
.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #F3F4F6; }
.pb-2 { padding-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }

/* Bio and Interests Styles */
.info-card--full {
  grid-column: 1 / -1;
}

.bio-text {
  font-style: italic;
  color: #4B5563;
  line-height: 1.6;
  padding: 0.75rem 1rem;
  background: #F9FAFB;
  border-radius: 8px;
  border-left: 3px solid #E5E7EB;
}

.bio-text--empty {
  color: #9CA3AF;
  font-size: 0.875rem;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #F3F4F6;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid #E5E7EB;
}

.age-range-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #EFF6FF;
  color: #1E40AF;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
}
</style>
