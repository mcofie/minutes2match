<template>
  <!-- Loading Overlay while auth hydrates -->
  <div v-if="!authReady" class="min-h-screen bg-stone-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-12 h-12 rounded-full border-3 border-stone-200 border-t-black animate-spin mx-auto mb-4"></div>
      <p class="text-stone-500 font-medium">Loading your profile...</p>
    </div>
  </div>
  
  <main v-else class="min-h-screen bg-stone-50 text-stone-900 pb-24">
    <!-- Navbar / Header -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
          <span class="font-bold tracking-tight">minutes2match</span>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-stone-900 leading-none">{{ profile?.display_name }}</p>
            <p class="text-xs text-stone-500 mt-1">
              {{ personaData ? `${personaData.emoji} ${personaData.name}` : 'New Member' }}
            </p>
          </div>
          <div 
             class="w-10 h-10 rounded-full border border-stone-200 bg-stone-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-black transition-all"
             @click="activeTab = 'profile'"
          >
            <img v-if="profile?.photo_url" :src="profile.photo_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-stone-400 font-bold">
              {{ profile?.display_name?.charAt(0) || '?' }}
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Tabs -->
      <div class="flex gap-8 border-b border-stone-200 mb-8 overflow-x-auto no-scrollbar">
        <button 
          @click="activeTab = 'events'"
          class="pb-3 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-2"
          :class="activeTab === 'events' ? 'text-black border-black' : 'text-stone-400 border-transparent hover:text-stone-600'"
        >
          Events
        </button>
        <button 
          @click="activeTab = 'matches'"
          class="pb-3 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-2 relative"
          :class="activeTab === 'matches' ? 'text-black border-black' : 'text-stone-400 border-transparent hover:text-stone-600'"
        >
          Matches
          <span v-if="pendingMatchCount > 0" class="ml-2 px-1.5 py-0.5 bg-orange-500 text-white rounded-full text-[10px]">{{ pendingMatchCount }}</span>
        </button>
        <button 
          @click="activeTab = 'profile'"
          class="pb-3 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-2"
          :class="activeTab === 'profile' ? 'text-black border-black' : 'text-stone-400 border-transparent hover:text-stone-600'"
        >
          Profile
        </button>
        <button 
          @click="activeTab = 'payments'"
          class="pb-3 text-sm font-bold tracking-wide uppercase transition-all whitespace-nowrap border-b-2"
          :class="activeTab === 'payments' ? 'text-black border-black' : 'text-stone-400 border-transparent hover:text-stone-600'"
        >
          Payments
        </button>
      </div>

      <!-- Content Area -->
      <div class="min-h-[400px]">
        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="flex items-center justify-between">
             <h2 class="text-2xl font-bold tracking-tight">Upcoming Sessions</h2>
             <span class="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">{{ events.length }} available</span>
          </div>

          <div v-if="loadingEvents" class="py-12 text-center">
            <div class="w-8 h-8 rounded-full border-2 border-stone-200 border-t-black animate-spin mx-auto mb-3"></div>
            <p class="text-stone-400 text-sm">Finding events...</p>
          </div>

          <div v-else-if="events.length === 0" class="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white">
            <span class="text-4xl block mb-4 grayscale opacity-50">🌱</span>
            <p class="font-bold text-stone-900 mb-1">No events scheduled yet</p>
            <p class="text-sm text-stone-500">Check back soon for new gatherings</p>
          </div>

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
        </div>

        <!-- Matches Tab -->
        <div v-if="activeTab === 'matches'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="flex items-center justify-between">
             <h2 class="text-2xl font-bold tracking-tight">Your Connections</h2>
             <span class="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">{{ matches.length }} matches</span>
          </div>

          <div v-if="loadingMatches" class="py-12 text-center">
             <div class="w-8 h-8 rounded-full border-2 border-stone-200 border-t-black animate-spin mx-auto mb-3"></div>
             <p class="text-stone-400 text-sm">Loading matches...</p>
          </div>

          <div v-else-if="matches.length === 0" class="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white">
            <span class="text-4xl block mb-4 grayscale opacity-50">✨</span>
            <p class="font-bold text-stone-900 mb-1">Your connections are brewing</p>
            <p class="text-sm text-stone-500">We'll SMS you when you get matched!</p>
          </div>

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlindProfileCard
              v-for="match in matches"
              :key="match.id"
              :age="getAge(match.matchedProfile?.birth_date)"
              :personaName="getPersonaData(match.matchedProfile?.dating_persona)?.name || 'Mystery'"
              :personaEmoji="getPersonaData(match.matchedProfile?.dating_persona)?.emoji || '✨'"
              :personaColor="getPersonaData(match.matchedProfile?.dating_persona)?.color || '#1a1a2e'"
              :vibePreview="getVibePreview(match.vibeAnswers)"
              :vibeSummary="getVibeSummary(match.vibeAnswers)"
              :unlockPrice="match.unlock_price"
              :unlocked="match.status === 'unlocked'"
              :currentUserPaid="match.currentUserPaid"
              :displayName="match.matchedProfile?.display_name"
              :photoUrl="match.matchedProfile?.photo_url"
              :phone="match.status === 'unlocked' ? match.matchedProfile?.phone : undefined"
              :bio="match.matchedProfile?.about_me"
              :interests="match.matchedProfile?.interests"
              :sharedInterests="getSharedInterests(match.matchedProfile?.interests)"
              :expiresAt="match.expires_at"
              @unlock="handleUnlockMatch(match)"
            />
          </div>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <!-- Sidebar / Photo -->
          <div class="md:col-span-1 space-y-6">
             <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
                <div class="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" @click="triggerPhotoUpload">
                  <div class="w-full h-full rounded-full overflow-hidden bg-stone-100 border-4 border-white shadow-md relative">
                     <img v-if="photoPreview || profile?.photo_url" :src="photoPreview || profile?.photo_url" class="w-full h-full object-cover" />
                     <div v-else class="w-full h-full flex items-center justify-center text-4xl text-stone-300">📷</div>
                     
                     <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white text-xs font-bold uppercase tracking-wider">{{ uploadingPhoto ? 'Uploading...' : 'Change' }}</span>
                     </div>
                  </div>
                  <input type="file" ref="photoInput" accept="image/*" @change="handlePhotoUpload" class="hidden" />
                </div>
                <p class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Pro Tip</p>
                <p class="text-sm text-stone-500">Profiles with photos get 80% more matches.</p>
             </div>
             
             <div class="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 class="font-bold text-stone-900 mb-4">Account</h3>
                <UiButton variant="outline" size="sm" @click="handleLogout" class="w-full">Sign Out</UiButton>
             </div>
          </div>

          <!-- Edit Form -->
          <div class="md:col-span-2 space-y-6">
             <!-- Basic Info -->
             <div class="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h3 class="text-xl font-bold text-stone-900 mb-6">Basic Info</h3>
                <div class="grid grid-cols-2 gap-6">
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Display Name</label>
                      <input type="text" v-model="editForm.display_name" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Phone (Locked)</label>
                       <input type="text" :value="profile?.phone" disabled class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 font-medium cursor-not-allowed" />
                   </div>
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Gender</label>
                      <select v-model="editForm.gender" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                         <option value="">Select gender</option>
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Birthday</label>
                      <UiDatePicker v-model="editForm.birth_date" placeholder="Select your birthday" />
                   </div>
                </div>
             </div>

             <!-- Preferences -->
             <div class="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h3 class="text-xl font-bold text-stone-900 mb-6">Preferences & Details</h3>
                <div class="grid grid-cols-2 gap-6">
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Considering</label>
                       <select v-model="editForm.intent" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                        <option value="marriage">Marriage</option>
                        <option value="serious">Serious Relationship</option>
                        <option value="casual">Casual Dating</option>
                        <option value="friendship">Friendship</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Interested In</label>
                      <select v-model="editForm.interested_in" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                        <option value="male">Men</option>
                        <option value="female">Women</option>
                        <option value="everyone">Everyone</option>
                      </select>
                   </div>
                    <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Location</label>
                      <select v-model="editForm.location" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                        <option value="accra">Accra</option>
                        <option value="kumasi">Kumasi</option>
                        <option value="tamale">Tamale</option>
                        <option value="takoradi">Takoradi</option>
                        <option value="cape_coast">Cape Coast</option>
                        <option value="other">Other</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Religion</label>
                       <select v-model="editForm.religion" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                         <option value="">Prefer not to say</option>
                         <option value="Christian">Christian</option>
                         <option value="Muslim">Muslim</option>
                         <option value="Traditional">Traditional</option>
                         <option value="Other">Other</option>
                       </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Genotype</label>
                       <select v-model="editForm.genotype" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium">
                         <option value="">Prefer not to say</option>
                         <option value="AA">AA</option>
                         <option value="AS">AS</option>
                         <option value="SS">SS</option>
                         <option value="AC">AC</option>
                       </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Height (cm)</label>
                       <input type="number" v-model.number="editForm.height_cm" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium" placeholder="e.g. 175" min="100" max="250" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Occupation</label>
                       <input type="text" v-model="editForm.occupation" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium" placeholder="e.g. Software Engineer" />
                   </div>
                </div>
             </div>

             <!-- Bio / About Me -->
             <div class="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-bold text-stone-900">About Me</h3>
                   <span class="text-xs font-medium" :class="editForm.about_me.length > 250 ? 'text-red-500' : 'text-stone-400'">
                      {{ editForm.about_me.length }}/300
                   </span>
                </div>
                <textarea 
                   v-model="editForm.about_me" 
                   rows="4"
                   maxlength="300"
                   class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all font-medium resize-none"
                   placeholder="Share a little about yourself... What makes you unique? What are you passionate about?"
                ></textarea>
                <p class="text-xs text-stone-400 mt-2">💡 Profiles with bios get 40% more matches</p>
             </div>

             <!-- Interests -->
             <div class="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-xl font-bold text-stone-900">Your Interests</h3>
                   <span class="text-xs font-medium text-stone-400">{{ editForm.interests.length }}/6 selected</span>
                </div>
                <div class="flex flex-wrap gap-2">
                   <button 
                      v-for="interest in availableInterests" 
                      :key="interest.id"
                      @click="toggleInterest(interest.id)"
                      class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                      :class="editForm.interests.includes(interest.id) 
                         ? 'bg-black text-white' 
                         : 'bg-stone-100 text-stone-600 hover:bg-stone-200'"
                   >
                      {{ interest.label }}
                   </button>
                </div>
                <p class="text-xs text-stone-400 mt-4">Choose up to 6 interests to help find common ground with matches</p>
             </div>

             <!-- Deal Breakers / Age Preferences -->
             <div class="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h3 class="text-xl font-bold text-stone-900 mb-2">Match Preferences</h3>
                <p class="text-sm text-stone-500 mb-6">Help us find people in your preferred age range</p>
                
                <div class="grid grid-cols-2 gap-6 mb-6">
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Minimum Age</label>
                      <div class="flex items-center gap-3">
                         <input 
                            type="range" 
                            v-model.number="editForm.min_age" 
                            min="18" 
                            max="60" 
                            class="flex-1 accent-black"
                         />
                         <span class="text-lg font-bold text-stone-900 w-10 text-center">{{ editForm.min_age }}</span>
                      </div>
                   </div>
                   <div class="space-y-2">
                      <label class="text-xs font-bold uppercase text-stone-500 tracking-wide">Maximum Age</label>
                      <div class="flex items-center gap-3">
                         <input 
                            type="range" 
                            v-model.number="editForm.max_age" 
                            min="18" 
                            max="70" 
                            class="flex-1 accent-black"
                         />
                         <span class="text-lg font-bold text-stone-900 w-10 text-center">{{ editForm.max_age }}</span>
                      </div>
                   </div>
                </div>
                
                <!-- Genotype Warning -->
                <div v-if="editForm.genotype === 'AS'" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                   <div class="flex items-start gap-3">
                      <span class="text-amber-500 text-xl">⚠️</span>
                      <div>
                         <p class="font-semibold text-amber-800">Genotype Awareness</p>
                         <p class="text-sm text-amber-700 mt-1">
                            You have AS genotype. We'll notify you if a potential match also has AS genotype so you can make informed decisions.
                         </p>
                      </div>
                   </div>
                </div>
             </div>
             
             <div class="flex items-center gap-4">
                <UiButton size="lg" :disabled="saving" @click="saveProfile" class="flex-1">
                   {{ saving ? 'Saving...' : 'Save Changes' }}
                </UiButton>
                <span v-if="saveSuccess" class="text-emerald-600 font-bold text-sm animate-in fade-in">✓ Saved!</span>
             </div>
          </div>
        </div>

        <!-- Payments Tab -->
        <div v-if="activeTab === 'payments'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold tracking-tight">Payment History</h2>
          </div>
          
          <div v-if="loadingPayments" class="py-12 text-center text-stone-400">Loading payments...</div>
          
          <div v-else-if="userPayments.length === 0" class="py-12 text-center">
            <p class="text-stone-400">No payments yet</p>
          </div>
          
          <div v-else class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div 
              v-for="payment in userPayments" 
              :key="payment.id" 
              class="p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="payment.purpose === 'event_ticket' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'">
                    {{ payment.purpose === 'event_ticket' ? '🎟️' : '💕' }}
                  </div>
                  <div>
                    <p class="font-semibold text-stone-900">{{ payment.purpose === 'event_ticket' ? 'Event Ticket' : 'Match Unlock' }}</p>
                    <p class="text-xs text-stone-400">{{ formatPaymentDate(payment.created_at) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-stone-900">{{ formatPaymentGHS(payment.amount) }}</p>
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    :class="payment.status === 'success' ? 'bg-emerald-100 text-emerald-700' : payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ payment.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">📅</div>
                <div>
                   <h3 class="font-bold text-stone-900">{{ selectedEvent?.title }}</h3>
                   <p class="text-sm text-stone-500">{{ formatEventDate(selectedEvent?.event_date) }}</p>
                </div>
             </div>
             
             <div class="flex justify-between items-center py-4 border-t border-b border-stone-100 mb-6">
                <span class="font-medium text-stone-500">Total</span>
                <span class="text-2xl font-bold text-stone-900">{{ getTicketPrice(selectedEvent) }}</span>
             </div>
             
             <UiButton size="lg" class="w-full" :disabled="processing" @click="processEventPayment">
                {{ processing ? 'Processing...' : 'Confirm Booking' }}
             </UiButton>
          </div>
       </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import EventCard from '~/components/EventCard.vue'
import BlindProfileCard from '~/components/BlindProfileCard.vue'
import UiButton from '~/components/ui/Button.vue'
import { personas, type Persona } from '~/composables/usePersona'
import type { Database } from '~/types/database'

useHead({
  title: 'My Dashboard',
  meta: [
    { name: 'description', content: 'View your matches, upcoming events, and manage your profile on Minutes 2 Match.' }
  ]
})

definePageMeta({
  middleware: ['auth']
})

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

// State
const authReady = ref(false)
const currentUserId = ref<string | null>(null)  // Store user ID to avoid undefined issues
const activeTab = ref<'events' | 'matches' | 'profile' | 'payments'>('events')
const profile = ref<any>(null)
const events = ref<any[]>([])
const matches = ref<any[]>([])
const userBookings = ref<Set<string>>(new Set()) // Track user's confirmed bookings
const userPayments = ref<any[]>([]) // Track user's payments
const loadingEvents = ref(true)
const loadingMatches = ref(true)
const loadingBookings = ref(true) // Track booking fetch status
const loadingPayments = ref(true) // Track payment fetch status
const showBookingModal = ref(false)
const selectedEvent = ref<any>(null)
const processing = ref(false)

// Profile editing
const editForm = reactive({
  display_name: '',
  gender: '',
  birth_date: '',
  location: '',
  intent: '',
  interested_in: '',
  genotype: '',
  religion: '',
  height_cm: null as number | null,
  occupation: '',
  // New fields
  about_me: '',
  min_age: 18 as number,
  max_age: 50 as number,
  interests: [] as string[]
})

// Available interests for selection
const availableInterests = [
  { id: 'travel', label: 'Travel ✈️' },
  { id: 'fitness', label: 'Fitness 💪' },
  { id: 'cooking', label: 'Cooking 🍳' },
  { id: 'movies', label: 'Movies 🎬' },
  { id: 'music', label: 'Music 🎵' },
  { id: 'gaming', label: 'Gaming 🎮' },
  { id: 'reading', label: 'Reading 📚' },
  { id: 'art', label: 'Art 🎨' },
  { id: 'sports', label: 'Sports ⚽' },
  { id: 'tech', label: 'Tech 💻' },
  { id: 'fashion', label: 'Fashion 👗' },
  { id: 'food', label: 'Foodie 🍕' },
  { id: 'nature', label: 'Nature 🌿' },
  { id: 'photography', label: 'Photography 📸' },
  { id: 'dancing', label: 'Dancing 💃' },
  { id: 'entrepreneurship', label: 'Business 💼' }
]

const toggleInterest = (interestId: string) => {
  const index = editForm.interests.indexOf(interestId)
  if (index === -1) {
    if (editForm.interests.length < 6) {
      editForm.interests.push(interestId)
    }
  } else {
    editForm.interests.splice(index, 1)
  }
}

const saving = ref(false)
const saveSuccess = ref(false)

// Photo
const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const uploadingPhoto = ref(false)

// Computed
const personaData = computed(() => {
  if (!profile.value?.dating_persona) return null
  return personas[profile.value.dating_persona]
})

const pendingMatchCount = computed(() => {
  return matches.value.filter(m => m.status === 'pending_payment').length
})

// Fetch events - only show public events OR events user is qualified for
const fetchEvents = async (userId?: string) => {
  loadingEvents.value = true
  
  try {
    // Get all upcoming open events
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .in('status', ['open', 'waitlist'])
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    
    if (!allEvents || allEvents.length === 0) {
      events.value = []
      return
    }

    // If no user, only show public events
    if (!userId) {
      events.value = allEvents.filter((e: any) => e.is_public === true)
      return
    }

    // Get user's event qualifications
    const { data: qualifications } = await supabase
      .from('event_qualifications')
      .select('event_id')
      .eq('user_id', userId)
      .in('status', ['qualified', 'invited'])
    
    const qualifiedEventIds = new Set((qualifications || []).map((q: any) => q.event_id))

    // Filter: show public events OR events user is qualified for
    events.value = allEvents.filter((event: any) => {
      // Public events are visible to everyone
      if (event.is_public === true) return true
      // Private events only visible if user is qualified
      return qualifiedEventIds.has(event.id)
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    events.value = []
  } finally {
    loadingEvents.value = false
  }
}

// Fetch user's event bookings (both confirmed AND pending)
const fetchUserBookings = async (userId: string) => {
  loadingBookings.value = true
  try {
    const { data } = await supabase
      .from('event_bookings')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending']) // Include pending to prevent re-purchase during payment
    
    userBookings.value = new Set((data || []).map((b: any) => b.event_id))
  } finally {
    loadingBookings.value = false
  }
}

// Fetch user's payment history
const fetchUserPayments = async (userId: string) => {
  loadingPayments.value = true
  try {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    userPayments.value = data || []
  } finally {
    loadingPayments.value = false
  }
}

// Check if user has booked an event
const hasBookedEvent = (eventId: string) => {
  return userBookings.value.has(eventId)
}

// Profile save
const saveProfile = async () => {
  if (!currentUserId.value) return
  
  saving.value = true
  saveSuccess.value = false
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        gender: editForm.gender,
        birth_date: editForm.birth_date,
        location: editForm.location,
        intent: editForm.intent,
        interested_in: editForm.interested_in,
        genotype: editForm.genotype || null,
        religion: editForm.religion || null,
        height_cm: editForm.height_cm,
        occupation: editForm.occupation || null,
        // New fields
        about_me: editForm.about_me || null,
        min_age: editForm.min_age,
        max_age: editForm.max_age,
        interests: editForm.interests
      } as any)
      .eq('id', currentUserId.value)
    
    if (error) throw error
    
    await fetchProfileById(currentUserId.value)
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save profile')
  } finally {
    saving.value = false
  }
}

// Photo upload
const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !currentUserId.value) return
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Photo must be less than 5MB')
    return
  }
  
  // Preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // Upload
  uploadingPhoto.value = true
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${currentUserId.value}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) throw uploadError
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ photo_url: urlData.publicUrl } as any)
      .eq('id', currentUserId.value)
    
    await fetchProfileById(currentUserId.value)
  } catch (err) {
    console.error('Upload error:', err)
    alert('Failed to upload photo')
    photoPreview.value = null
  } finally {
    uploadingPhoto.value = false
  }
}

// Logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/')
}

// Helpers
const getAge = (birthDate: string | null): number => {
  if (!birthDate) return 25
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const getPersonaData = (personaId: string | null): Persona | null => {
  if (!personaId) return null
  return personas[personaId] || null
}

const getVibePreview = (vibeAnswers: any[]): string => {
  const previews = ['Loves deep conversations', 'Weekend adventurer', 'Ambitious go-getter', 'Social butterfly']
  return previews[Math.floor(Math.random() * previews.length)]
}

const getVibeSummary = (vibeAnswers: any[]): string => {
  if (!vibeAnswers?.length) return 'Getting to know them...'
  const answers = vibeAnswers.map(a => a.answer_value).join(', ')
  return `Enjoys ${answers}`
}

const getSharedInterests = (matchInterests: string[] | null): string[] => {
  if (!matchInterests || !editForm.interests.length) return []
  return matchInterests.filter(interest => editForm.interests.includes(interest))
}

const formatEventDate = (dateStr: string | null): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatPaymentDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatPaymentGHS = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS',
    minimumFractionDigits: 2 
  }).format(amount || 0)
}

const getTicketPrice = (event: any): string => {
  if (!event || !profile.value) return 'GH₵ 0'
  const price = profile.value.gender === 'female' 
    ? event.ticket_price_female 
    : event.ticket_price_male
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(price)
}

// Event booking
const handleBookEvent = (event: any) => {
  // Check if already booked
  if (hasBookedEvent(event.id)) {
    alert('You have already booked this event!')
    return
  }
  selectedEvent.value = event
  showBookingModal.value = true
}

const processEventPayment = async () => {
  if (!selectedEvent.value || !profile.value || !currentUserId.value) return
  
  processing.value = true
  
  try {
    // CRITICAL: Server-side check for existing booking
    const { data: existingBooking } = await supabase
      .from('event_bookings')
      .select('id, status')
      .eq('event_id', selectedEvent.value.id)
      .eq('user_id', currentUserId.value)
      .maybeSingle()
    
    const booking = existingBooking as { id: string; status: string } | null
    
    if (booking) {
      // User already has a booking for this event
      showBookingModal.value = false
      if (booking.status === 'confirmed') {
        alert('You have already booked this event! Check your confirmed bookings.')
      } else if (booking.status === 'pending') {
        alert('You already have a pending booking for this event. Please complete your previous payment or contact support.')
      }
      // Refresh bookings to update UI
      await fetchUserBookings(currentUserId.value)
      return
    }

    const { initializePayment, createPaymentRecord } = usePaystack()
    
    const price = profile.value.gender === 'female'
      ? selectedEvent.value.ticket_price_female
      : selectedEvent.value.ticket_price_male

    const paymentData = await initializePayment(
      profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
      price,
      'event_ticket',
      { userId: currentUserId.value, eventId: selectedEvent.value.id }
    )

    // Insert booking with pending status
    const { error: bookingError } = await supabase
      .from('event_bookings')
      .insert({
        event_id: selectedEvent.value.id,
        user_id: currentUserId.value,
        status: 'pending'
      } as any)

    if (bookingError) {
      // Handle unique constraint violation (race condition)
      if (bookingError.code === '23505') {
        alert('You have already booked this event!')
        await fetchUserBookings(currentUserId.value)
        showBookingModal.value = false
        return
      }
      throw bookingError
    }

    await createPaymentRecord(
      currentUserId.value,
      price,
      'event_ticket',
      paymentData.reference,
      { eventId: selectedEvent.value.id }
    )

    // Update local bookings immediately
    userBookings.value.add(selectedEvent.value.id)

    window.location.href = paymentData.authorization_url
  } catch (error) {
    console.error('Payment error:', error)
    alert('Failed to process payment. Please try again.')
  } finally {
    processing.value = false
  }
}

// Match unlock
const handleUnlockMatch = async (match: any) => {
  if (!currentUserId.value || !profile.value) return
  
  try {
    const { initializePayment, createPaymentRecord } = usePaystack()

    const paymentData = await initializePayment(
      profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
      match.unlock_price,
      'match_unlock',
      { userId: currentUserId.value, matchId: match.id }
    )

    await createPaymentRecord(
      currentUserId.value,
      match.unlock_price,
      'match_unlock',
      paymentData.reference,
      { matchId: match.id }
    )

    window.location.href = paymentData.authorization_url
  } catch (error) {
    console.error('Payment error:', error)
    alert('Failed to process payment. Please try again.')
  }
}

// Initialize data - handle auth hydration properly
onMounted(async () => {
  console.log('[Profile] Page mounted, checking auth...')
  
  // Try to get the session directly from Supabase
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('[Profile] Session check:', sessionData?.session?.user?.id, 'Error:', sessionError?.message)
  
  // Get user ID from either useSupabaseUser or direct session
  let userId = user.value?.id
  
  if (!userId && sessionData?.session?.user?.id) {
    console.log('[Profile] Using session user ID:', sessionData.session.user.id)
    userId = sessionData.session.user.id
  }
  
  if (!userId) {
    // Wait a bit for hydration
    console.log('[Profile] No user yet, waiting for hydration...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check again
    const { data: retrySession } = await supabase.auth.getSession()
    userId = user.value?.id || retrySession?.session?.user?.id
    console.log('[Profile] After wait, userId:', userId)
  }
  
  if (userId) {
    console.log('[Profile] User authenticated:', userId)
    currentUserId.value = userId  // Store for use in other functions
    try {
      // Manually set user if it came from session
      await fetchProfileById(userId)
      await Promise.all([fetchEvents(userId), fetchMatchesById(userId), fetchUserBookings(userId), fetchUserPayments(userId)])
    } catch (err) {
      console.error('[Profile] Error loading data:', err)
    }
  } else {
    console.warn('[Profile] No authenticated user found. Redirecting to login...')
    navigateTo('/login')
    return
  }
  
  // Always set authReady to show the UI
  authReady.value = true
})

// Fetch profile by ID (for when useSupabaseUser isn't available)
const fetchProfileById = async (userId: string) => {
  console.log('[Profile] Fetching profile for:', userId)
  
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('[Profile] Response:', status, 'Data:', data ? 'found' : 'null', 'Error:', error?.message)
  
    if (error) {
      console.error('[Profile] Error fetching profile:', error.message)
    }

    profile.value = data
    
    if (data) {
      editForm.display_name = data.display_name || ''
      editForm.gender = data.gender || ''
      editForm.birth_date = data.birth_date || ''
      editForm.location = data.location || ''
      editForm.intent = data.intent || ''
      editForm.interested_in = data.interested_in || ''
      editForm.genotype = data.genotype || ''
      editForm.religion = data.religion || ''
      editForm.height_cm = data.height_cm || null
      editForm.occupation = data.occupation || ''
      // New fields
      editForm.about_me = data.about_me || ''
      editForm.min_age = data.min_age || 18
      editForm.max_age = data.max_age || 50
      editForm.interests = data.interests || []
    }
  } catch (err) {
    console.error('[Profile] Exception:', err)
  }
}

// Fetch matches by ID
const fetchMatchesById = async (userId: string) => {
  loadingMatches.value = true
  
  const { data } = await supabase
    .from('matches')
    .select(`
      *,
      user_1:profiles!matches_user_1_id_fkey(*),
      user_2:profiles!matches_user_2_id_fkey(*)
    `)
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .in('status', ['pending_payment', 'partial_payment', 'unlocked'])
    .order('created_at', { ascending: false })

  const processedMatches = await Promise.all((data || []).map(async (match: any) => {
    const matchedProfile = match.user_1_id === userId ? match.user_2 : match.user_1
    
    const { data: vibeAnswers } = await supabase
      .from('vibe_answers')
      .select('question_key, answer_value')
      .eq('user_id', matchedProfile?.id)

    return {
      ...match,
      matchedProfile,
      vibeAnswers: vibeAnswers || [],
      currentUserPaid: match.user_1_id === userId ? match.user_1_paid : match.user_2_paid
    }
  }))

  matches.value = processedMatches
  loadingMatches.value = false
}
</script>

<style scoped>
/* Remove all scoped styles as we now use Tailwind utilities */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
