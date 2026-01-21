<template>
  <div>
    <!-- Compact Card -->
    <article 
      class="group relative bg-white rounded-xl border transition-all duration-300 hover:shadow-md overflow-hidden cursor-pointer"
      :class="cardClasses"
      @click="showModal = true"
    >
      <!-- Celebration Badge -->
      <div 
        v-if="unlocked && showCelebration" 
        class="absolute top-2 left-2 z-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg animate-pulse"
      >
        🎉 Match!
      </div>

      <div class="flex">
        <!-- Photo (Compact) -->
        <div class="relative w-24 h-28 flex-shrink-0 bg-stone-100 overflow-hidden">
          <!-- Gender Indicator -->
          <div 
            v-if="gender"
            class="absolute bottom-1 left-1 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow"
            :class="gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'"
          >
            {{ gender === 'female' ? '♀' : '♂' }}
          </div>
          
          <!-- Locked Overlay -->
          <div 
            v-if="!unlocked" 
            class="absolute inset-0 flex items-center justify-center z-10 bg-stone-100/80 backdrop-blur-sm"
          >
            <div class="p-2 rounded-full bg-white shadow">
              <svg v-if="currentUserPaid" class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>

          <!-- Photo -->
          <template v-if="unlocked">
            <img v-if="photoUrl" :src="photoUrl" :alt="displayName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
              <span class="text-2xl font-bold text-stone-300">{{ displayName?.charAt(0) || '?' }}</span>
            </div>
          </template>
          <div v-else class="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-bold text-xl">?</div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 p-3 min-w-0">
          <!-- Top Row: Name/Age + Compatibility -->
          <div class="flex items-start justify-between gap-2 mb-1">
            <div class="min-w-0">
              <h3 v-if="unlocked" class="font-bold text-stone-900 truncate text-sm flex items-center gap-1">
                {{ displayName }}
                <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                </svg>
              </h3>
              <div class="flex items-center gap-1.5 text-xs text-stone-400">
                <span>{{ age }}y</span>
                <span v-if="location" class="flex items-center gap-0.5">
                  <span>•</span>
                  <span class="truncate max-w-[80px]">📍{{ location }}</span>
                </span>
              </div>
            </div>
            <!-- Compatibility / Persona -->
            <div class="flex flex-col items-end gap-1">
              <span 
                class="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                :style="{ backgroundColor: personaColor }"
              >
                {{ personaEmoji }}
              </span>
              <span v-if="compatibilityScore" class="text-[10px] font-bold" :class="compatibilityColor">
                {{ compatibilityScore }}% match
              </span>
            </div>
          </div>
          
          <!-- Bio/Interests Preview -->
          <p v-if="(currentUserPaid || unlocked) && bio" class="text-xs text-stone-500 line-clamp-1 mb-1.5">
            "{{ bio }}"
          </p>
          <p v-else-if="!currentUserPaid && !unlocked" class="text-xs text-stone-400 italic mb-1.5 line-clamp-1">
            {{ vibePreview }}
          </p>
          
          <!-- Shared Interests Preview -->
          <div v-if="(currentUserPaid || unlocked) && sharedInterests && sharedInterests.length > 0" class="flex items-center gap-1 mb-2">
            <span class="text-[10px] text-emerald-600 font-medium">✨ {{ sharedInterests.length }} in common</span>
          </div>
          
          <!-- Footer: Status/Action -->
          <div class="flex items-center justify-between">
            <template v-if="unlocked">
              <span class="text-[10px] text-stone-400">{{ matchedTimeAgo }}</span>
              <button 
                @click.stop="openWhatsApp"
                class="flex items-center gap-1 px-2 py-1 bg-[#25D366] text-white rounded-md text-[10px] font-bold hover:bg-[#20bd5a]"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Message
              </button>
            </template>
            <template v-else-if="currentUserPaid">
              <span class="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Waiting...
              </span>
              <span v-if="expiresAt" class="text-[10px] text-stone-400">{{ formatTimeRemaining }}</span>
            </template>
            <template v-else>
              <span class="text-sm font-bold text-stone-900">{{ formattedPrice }}</span>
              <button 
                @click.stop="$emit('unlock')"
                class="px-3 py-1 bg-black text-white rounded-lg text-xs font-bold hover:bg-stone-800"
              >
                Unlock
              </button>
            </template>
          </div>
        </div>
      </div>
    </article>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- Header Image -->
          <div class="relative h-72 bg-stone-100">
            <button 
              @click="showModal = false"
              class="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-600 hover:bg-white"
            >
              ✕
            </button>
            
            <!-- Compatibility Badge -->
            <div 
              v-if="compatibilityScore"
              class="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full"
            >
              <span class="text-sm font-bold" :class="compatibilityColor">{{ compatibilityScore }}% Compatible</span>
            </div>
            
            <!-- Locked Overlay -->
            <div 
              v-if="!unlocked" 
              class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-stone-100/80 backdrop-blur-sm"
            >
              <div class="p-4 rounded-full bg-white shadow-lg mb-3">
                <svg v-if="currentUserPaid" class="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </svg>
                <svg v-else class="w-10 h-10 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <p v-if="currentUserPaid" class="text-sm font-bold text-amber-600">Waiting for them to unlock</p>
              <p v-else class="text-sm font-bold text-stone-500">Private Profile</p>
            </div>

            <template v-if="unlocked">
              <img v-if="photoUrl" :src="photoUrl" :alt="displayName" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                <span class="text-6xl font-bold text-stone-300">{{ displayName?.charAt(0) || '?' }}</span>
              </div>
            </template>
            <div v-else class="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 font-bold text-5xl">?</div>
          </div>
          
          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-18rem)]">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 v-if="unlocked" class="text-2xl font-bold text-stone-900 flex items-center gap-2">
                  {{ displayName }}
                  <svg class="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                  </svg>
                </h2>
                <h2 v-else class="text-2xl font-bold text-stone-400">Mystery Match</h2>
                <div class="flex items-center gap-2 text-stone-500 mt-1">
                  <span>{{ age }} years</span>
                  <span v-if="gender" class="flex items-center gap-1">
                    •
                    <span :class="gender === 'female' ? 'text-pink-500' : 'text-blue-500'">
                      {{ gender === 'female' ? '♀ Female' : '♂ Male' }}
                    </span>
                  </span>
                </div>
                <p v-if="location" class="text-sm text-stone-400 mt-1">📍 {{ location }}</p>
                <p v-if="matchedAt" class="text-xs text-stone-400 mt-1">Matched {{ matchedTimeAgo }}</p>
              </div>
              <span 
                class="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                :style="{ backgroundColor: personaColor }"
              >
                {{ personaEmoji }} {{ personaName }}
              </span>
            </div>
            
            <!-- Bio -->
            <div v-if="(currentUserPaid || unlocked)" class="mb-6">
              <h3 class="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">About</h3>
              <p v-if="bio" class="text-stone-600 leading-relaxed">"{{ bio }}"</p>
              <p v-else class="text-stone-400 italic text-sm">They haven't added a bio yet</p>
            </div>
            <div v-else class="mb-6">
              <h3 class="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Vibe Check</h3>
              <p class="text-stone-600 italic">"{{ vibePreview }}"</p>
              <p class="text-xs text-stone-400 mt-2">💡 Unlock to see their full profile</p>
            </div>
            
            <!-- Shared Interests -->
            <div v-if="(currentUserPaid || unlocked) && sharedInterests && sharedInterests.length > 0" class="mb-6">
              <h3 class="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>✨</span> {{ sharedInterests.length }} Things in Common
              </h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="interest in sharedInterests" 
                  :key="interest"
                  class="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100"
                >
                  {{ getInterestLabel(interest) }}
                </span>
              </div>
            </div>
            
            <!-- Their Interests -->
            <div v-if="(currentUserPaid || unlocked) && interests && interests.length > 0" class="mb-6">
              <h3 class="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">Their Interests</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="interest in interests" 
                  :key="interest"
                  class="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-full text-sm font-medium"
                >
                  {{ getInterestLabel(interest) }}
                </span>
              </div>
            </div>
            
            <!-- Icebreaker Suggestions -->
            <div v-if="unlocked && icebreakers.length > 0" class="mb-6">
              <h3 class="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                💬 Conversation Starters
              </h3>
              <div class="space-y-2">
                <button 
                  v-for="(icebreaker, idx) in icebreakers" 
                  :key="idx"
                  @click="copyIcebreaker(icebreaker)"
                  class="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition-colors border border-blue-100"
                >
                  "{{ icebreaker }}"
                  <span class="text-[10px] text-blue-500 block mt-1">Tap to copy</span>
                </button>
              </div>
            </div>
            
            <!-- Expiration (if waiting) -->
            <div v-if="currentUserPaid && !unlocked && expiresAt" class="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div class="flex items-center justify-between">
                <span class="text-sm text-amber-700">Match expires in:</span>
                <span class="font-bold text-amber-600">⏱️ {{ formatTimeRemaining }}</span>
              </div>
              <p class="text-xs text-amber-600 mt-2">They've been notified via SMS. Hang tight!</p>
            </div>
          </div>
          
          <!-- Footer Actions -->
          <div class="p-4 border-t border-stone-100 bg-stone-50">
            <template v-if="unlocked && phone">
              <!-- Phone Display -->
              <div class="flex items-center gap-2 text-stone-700 font-medium p-3 bg-white rounded-lg border border-stone-200 mb-3">
                <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span class="flex-1">{{ phone }}</span>
                <button @click="copyPhone" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold">
                  {{ copied ? '✓ Copied' : 'Copy' }}
                </button>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2">
                <a 
                  :href="whatsappLink" 
                  target="_blank"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-colors"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a 
                  :href="`tel:${phone}`"
                  class="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Call
                </a>
              </div>
            </template>
            
            <template v-else-if="!unlocked && !currentUserPaid">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-2xl font-bold text-stone-900">{{ formattedPrice }}</span>
                  <p class="text-xs text-stone-400">to unlock this connection</p>
                </div>
                <button 
                  @click="$emit('unlock'); showModal = false"
                  class="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
                >
                  🔓 Unlock Now
                </button>
              </div>
            </template>
            
            <template v-else>
              <p class="text-center text-stone-500 text-sm">
                Waiting for them to unlock...
              </p>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  age: number
  personaName: string
  personaEmoji: string
  personaColor: string
  vibePreview: string
  vibeSummary?: string
  unlockPrice: number
  unlocked?: boolean
  currentUserPaid?: boolean
  displayName?: string
  photoUrl?: string
  phone?: string
  bio?: string
  interests?: string[]
  sharedInterests?: string[]
  expiresAt?: string
  matchedAt?: string  // NEW: When the match was created
  location?: string   // NEW: Where they're from
  gender?: 'male' | 'female'  // NEW: Gender indicator
}

const props = defineProps<Props>()

defineEmits<{
  unlock: []
  message: []
}>()

// Local state
const showModal = ref(false)
const copied = ref(false)
const showCelebration = ref(false)

onMounted(() => {
  if (props.unlocked) {
    showCelebration.value = true
    setTimeout(() => { showCelebration.value = false }, 5000)
  }
})

watch(() => props.unlocked, (newVal) => {
  if (newVal) {
    showCelebration.value = true
    setTimeout(() => { showCelebration.value = false }, 5000)
  }
})

// Compatibility Score (based on shared interests)
const compatibilityScore = computed(() => {
  if (!props.sharedInterests || !props.interests) return null
  if (props.interests.length === 0) return null
  const score = Math.round((props.sharedInterests.length / Math.max(props.interests.length, 1)) * 100)
  return Math.min(score + 40, 99) // Base of 40% + shared interests bonus, max 99%
})

const compatibilityColor = computed(() => {
  const score = compatibilityScore.value || 0
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-stone-500'
})

// Match time ago
const matchedTimeAgo = computed(() => {
  if (!props.matchedAt) return ''
  const diff = Date.now() - new Date(props.matchedAt).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
})

// Icebreaker suggestions based on shared interests
const icebreakers = computed(() => {
  if (!props.sharedInterests || props.sharedInterests.length === 0) {
    return [
      `Hi ${props.displayName || 'there'}! I noticed we matched. What's keeping you busy these days?`,
      `Hey! 👋 Excited to connect with you. What made you join Minutes2Match?`
    ]
  }
  
  const suggestions: string[] = []
  const name = props.displayName || 'there'
  
  props.sharedInterests.slice(0, 2).forEach(interest => {
    switch (interest) {
      case 'travel':
        suggestions.push(`Hi ${name}! I saw we both love traveling ✈️ What's the most memorable place you've visited?`)
        break
      case 'fitness':
        suggestions.push(`Hey ${name}! Fellow fitness enthusiast here 💪 What's your go-to workout?`)
        break
      case 'cooking':
        suggestions.push(`Hi ${name}! I noticed we're both into cooking 🍳 What's your signature dish?`)
        break
      case 'movies':
        suggestions.push(`Hey ${name}! Movie lover here too 🎬 Seen anything good lately?`)
        break
      case 'music':
        suggestions.push(`Hi ${name}! What kind of music gets you going? 🎵`)
        break
      case 'food':
        suggestions.push(`Hey ${name}! Fellow foodie here 🍕 What's your favorite spot in town?`)
        break
      case 'reading':
        suggestions.push(`Hi ${name}! I love that we both enjoy reading 📚 Any book recommendations?`)
        break
      default:
        suggestions.push(`Hi ${name}! Great that we have ${getInterestLabel(interest)} in common! Tell me more about it.`)
    }
  })
  
  return suggestions.slice(0, 2)
})

const cardClasses = computed(() => {
  if (props.unlocked) return 'border-emerald-400 ring-1 ring-emerald-400/20'
  if (props.currentUserPaid) return 'border-amber-400 ring-1 ring-amber-400/10'
  return 'border-stone-200 hover:border-stone-300'
})

const interestLabels: Record<string, string> = {
  travel: 'Travel ✈️', fitness: 'Fitness 💪', cooking: 'Cooking 🍳',
  movies: 'Movies 🎬', music: 'Music 🎵', gaming: 'Gaming 🎮',
  reading: 'Reading 📚', art: 'Art 🎨', sports: 'Sports ⚽',
  tech: 'Tech 💻', fashion: 'Fashion 👗', food: 'Foodie 🍕',
  nature: 'Nature 🌿', photography: 'Photography 📸', dancing: 'Dancing 💃',
  entrepreneurship: 'Business 💼'
}

const getInterestLabel = (interestId: string): string => interestLabels[interestId] || interestId

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(props.unlockPrice)
)

const whatsappLink = computed(() => {
  if (!props.phone) return '#'
  let cleanPhone = props.phone.replace(/[\s-]/g, '')
  if (cleanPhone.startsWith('0')) cleanPhone = '233' + cleanPhone.slice(1)
  else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('233')) cleanPhone = '233' + cleanPhone
  cleanPhone = cleanPhone.replace(/^\+/, '')
  const message = encodeURIComponent(icebreakers.value[0] || `Hi ${props.displayName || 'there'}! 👋 We matched on Minutes2Match.`)
  return `https://wa.me/${cleanPhone}?text=${message}`
})

const openWhatsApp = () => {
  if (props.phone) window.open(whatsappLink.value, '_blank')
}

const copyPhone = () => {
  if (props.phone) {
    navigator.clipboard.writeText(props.phone)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const copyIcebreaker = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard! 📋')
}

const hoursRemaining = computed(() => {
  if (!props.expiresAt) return 0
  const diffMs = new Date(props.expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
})

const formatTimeRemaining = computed(() => {
  const hours = hoursRemaining.value
  if (hours <= 0) return 'Expired'
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
