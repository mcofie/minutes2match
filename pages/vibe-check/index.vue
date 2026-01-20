<template>
  <main class="min-h-screen bg-white flex flex-col font-sans text-stone-900 relative overflow-hidden">
    <!-- Retake Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showRetakeModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
          <div class="text-center space-y-4">
            <span class="text-5xl block">🔄</span>
            <h2 class="text-2xl font-bold text-stone-900">Retake Vibe Test?</h2>
            <p class="text-stone-500 leading-relaxed">
              You've already completed the vibe test. Retaking it will <strong class="text-stone-700">replace your current answers</strong> and may affect your matches.
            </p>
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <div class="flex items-start gap-3">
                <span class="text-amber-500 text-xl">⚠️</span>
                <div class="text-sm text-amber-800">
                  <p class="font-semibold">This action cannot be undone</p>
                  <p class="text-amber-700 mt-1">Your persona and compatibility scores will be recalculated.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 flex flex-col gap-3">
            <UiButton
              variant="primary"
              size="lg"
              @click="confirmRetake"
              class="w-full"
            >
              Yes, Retake Test 🎯
            </UiButton>
            <button
              @click="cancelRetake"
              class="w-full py-3 text-stone-500 font-medium hover:text-stone-700 transition-colors"
            >
              No, Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-stone-100 z-50">
      <div class="h-full bg-black transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Encouragement Toast -->
    <Transition name="toast">
      <div v-if="showEncouragement" class="fixed top-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full font-medium text-sm shadow-xl z-50 flex items-center gap-2">
        <span>{{ encouragementMessage }}</span>
      </div>
    </Transition>

    <!-- Content Container -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto min-h-[600px]">
      
      <!-- Step 1: Quick Intro -->
      <div v-if="currentStep === 1" class="w-full animate-fade-in space-y-8">
        <div class="text-center space-y-2">
          <span class="text-4xl block mb-4 animate-bounce-slow">👋</span>
          <h1 class="text-3xl font-bold tracking-tight">Let's meet you!</h1>
          <p class="text-stone-500">This takes about 90 seconds</p>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">What should we call you?</label>
            <input
              type="text"
              v-model="form.displayName"
              placeholder="Your first name"
              class="w-full px-4 py-4 rounded-xl border border-stone-200 bg-white text-xl font-semibold text-center placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              maxlength="20"
              @keyup.enter="form.displayName.length >= 2 && nextStep()"
            />
          </div>

          <div class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500" v-if="form.displayName.length >= 2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">I am</label>
            <div class="grid grid-cols-2 gap-4">
              <VibeCard text="A Guy" icon="🙋‍♂️" :selected="form.gender === 'male'" @select="selectGender('male')" />
              <VibeCard text="A Lady" icon="🙋‍♀️" :selected="form.gender === 'female'" @select="selectGender('female')" />
            </div>
          </div>

          <div class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" v-if="form.gender">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Looking for</label>
            <div class="grid grid-cols-2 gap-4">
              <VibeCard text="Men" icon="🧔" :selected="form.interestedIn === 'male'" @select="selectInterest('male')" />
              <VibeCard text="Women" icon="👩" :selected="form.interestedIn === 'female'" @select="selectInterest('female')" />
            </div>
            <button 
              class="w-full text-stone-400 text-sm font-medium hover:text-black transition-colors py-2"
              @click="selectInterest('everyone')"
            >
              I'm open to everyone ✨
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Quick Details -->
      <div v-else-if="currentStep === 2" class="w-full animate-fade-in space-y-8">
        <div class="text-center space-y-2">
          <span class="text-4xl block mb-4">📋</span>
          <h1 class="text-3xl font-bold tracking-tight">Almost there, {{ form.displayName }}!</h1>
          <p class="text-stone-500">Just a few quick details</p>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">What are you looking for?</label>
            <div class="grid grid-cols-2 gap-3">
              <VibeCard text="Marriage" icon="💍" size="sm" :selected="form.intent === 'marriage'" @select="form.intent = 'marriage'" />
              <VibeCard text="Relationship" icon="❤️" size="sm" :selected="form.intent === 'serious'" @select="form.intent = 'serious'" />
              <VibeCard text="Casual" icon="🥂" size="sm" :selected="form.intent === 'casual'" @select="form.intent = 'casual'" />
              <VibeCard text="Friendship" icon="👋" size="sm" :selected="form.intent === 'friendship'" @select="form.intent = 'friendship'" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Birthday</label>
              <UiDatePicker 
                v-model="form.birthDate" 
                placeholder="Select your birthday"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">City</label>
              <select v-model="form.location" class="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all">
                <option value="">Select...</option>
                <option value="accra">Accra</option>
                <option value="kumasi">Kumasi</option>
                <option value="tamale">Tamale</option>
                <option value="takoradi">Takoradi</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Collapsible Extras -->
          <button class="w-full text-stone-500 text-sm font-medium hover:text-black transition-colors flex items-center justify-center gap-2 py-2" @click="showExtras = !showExtras">
            <span>{{ showExtras ? 'Less details' : 'Add more details (optional)' }}</span>
            <span class="text-xs transform transition-transform" :class="{ 'rotate-180': showExtras }">▼</span>
          </button>
          
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div v-if="showExtras" class="bg-stone-50 p-6 rounded-2xl border border-stone-100">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Genotype</label>
                  <select v-model="form.genotype" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:ring-black focus:ring-2 outline-none">
                    <option value="">Skip</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Religion</label>
                  <select v-model="form.religion" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:ring-black focus:ring-2 outline-none">
                    <option value="">Skip</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Height (cm)</label>
                  <input type="number" v-model.number="form.height" placeholder="175" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:ring-black focus:ring-2 outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Occupation</label>
                  <input type="text" v-model="form.occupation" placeholder="e.g. Engineer" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:ring-black focus:ring-2 outline-none" />
                </div>
              </div>
            </div>
          </Transition>

          <UiButton
            variant="primary"
            size="lg"
            :disabled="!canProceedStep2"
            @click="nextStep"
            class="w-full"
          >
            Let's vibe check! 🎯
          </UiButton>
        </div>
      </div>

      <!-- Steps 3-9: Vibe Questions (5 core + 2 bonus = 7 total) -->
      <div v-else-if="currentStep >= 3 && currentStep <= 9" class="w-full animate-fade-in space-y-8">
        <div class="text-center space-y-2">
          <span class="text-4xl block mb-4">{{ getVibeEmoji() }}</span>
          <div class="flex items-center justify-center gap-2 mb-2">
            <span v-if="currentStep <= 7" class="text-[10px] font-bold uppercase tracking-wide text-orange-500 bg-orange-50 px-2 py-1 rounded-full">Core</span>
            <span v-else class="text-[10px] font-bold uppercase tracking-wide text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Bonus</span>
          </div>
          <p class="text-xs font-bold uppercase tracking-wide text-stone-400">Question {{ currentStep - 2 }} of {{ totalQuestions }}</p>
        </div>

        <div v-if="loadingQuestions" class="text-center py-12">
          <div class="w-10 h-10 rounded-full border-4 border-stone-200 border-t-black animate-spin mx-auto mb-4"></div>
          <p class="text-stone-500">Loading vibes...</p>
        </div>

        <template v-else-if="currentQuestion">
          <h1 class="text-2xl font-bold text-center leading-tight mb-8">{{ currentQuestion.question }}</h1>

          <div class="space-y-3">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              class="group w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02]"
              :class="vibeAnswers[currentQuestion.key] === option ? 'bg-stone-50 border-black ring-1 ring-black' : 'bg-white border-stone-200 hover:border-black'"
              @click="handleVibeSelect(currentQuestion.key, option)"
            >
              <span class="text-2xl group-hover:scale-110 transition-transform">{{ getCategoryIcon(currentQuestion.category, idx) }}</span>
              <span class="font-medium text-lg" :class="vibeAnswers[currentQuestion.key] === option ? 'text-black' : 'text-stone-700'">{{ option }}</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Step 10: Phone Verification -->
      <div v-else-if="currentStep === 10" class="w-full animate-fade-in space-y-8">
        <div class="text-center space-y-2">
          <span class="text-4xl block mb-4">📱</span>
          <h1 class="text-3xl font-bold tracking-tight">Last step!</h1>
          <p class="text-stone-500">Verify your number to save your profile</p>
        </div>

        <div class="space-y-6" v-if="!otpSent">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500">Phone Number</label>
            <div class="flex items-center w-full px-4 py-1 rounded-xl border border-stone-200 bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
              <span class="font-bold text-stone-500 select-none mr-3">+233</span>
              <input
                type="tel"
                v-model="form.phone"
                placeholder="XX XXX XXXX"
                class="flex-1 py-3 text-lg font-medium outline-none bg-transparent placeholder-stone-300"
                maxlength="10"
              />
            </div>
          </div>
          
          <UiButton
            variant="primary"
            size="lg"
            :disabled="!isValidPhone || sendingOtp"
            @click="handleSendOtp"
            class="w-full"
          >
            {{ sendingOtp ? 'Sending...' : 'Send Code 📨' }}
          </UiButton>
        </div>

        <div class="space-y-6" v-else>
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wide text-stone-500 w-full text-center">Enter the 6-digit code</label>
            <input
              type="text"
              v-model="otpCode"
              placeholder="000000"
              class="w-full py-4 text-4xl font-bold tracking-[0.5em] text-center outline-none bg-transparent border-b-2 border-stone-200 focus:border-black transition-colors placeholder-stone-200"
              maxlength="6"
              @keyup.enter="otpCode.length === 6 && handleVerifyOtp()"
            />
          </div>

          <p v-if="otpError" class="text-red-500 text-sm text-center font-medium">{{ otpError }}</p>

          <UiButton
            variant="primary"
            size="lg"
            :disabled="otpCode.length !== 6 || verifyingOtp"
            @click="handleVerifyOtp"
            class="w-full"
          >
            {{ verifyingOtp ? 'Verifying...' : 'Verify & Continue ✨' }}
          </UiButton>

          <button @click="otpSent = false" class="w-full text-stone-400 text-sm hover:text-black transition-colors py-2">
            ← Change number
          </button>
        </div>
      </div>

      <!-- Step 11: Persona Reveal -->
      <div v-else-if="currentStep === 11" class="w-full animate-fade-in text-center">
        <div class="relative py-12">
          <div class="confetti-container">
            <span v-for="i in 20" :key="i" class="confetti" :style="{ '--delay': i * 0.1 + 's', '--x': (Math.random() * 200 - 100) + 'px' }">🎉</span>
          </div>
          
          <div class="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            <div class="absolute inset-0 bg-stone-100 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 bg-gradient-to-tr from-orange-100 to-transparent rounded-full opacity-50 blur-xl"></div>
            <span class="text-6xl relative z-10">{{ assignedPersona?.emoji }}</span>
          </div>
          
          <h1 class="text-4xl font-bold text-stone-900 mb-4">You're {{ assignedPersona?.name }}!</h1>
          <p class="text-lg text-stone-500 max-w-sm mx-auto mb-10 leading-relaxed">{{ assignedPersona?.description }}</p>
          
          <div class="bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-100">
            <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-4">What happens next?</p>
            <div class="flex gap-4 justify-center">
              <div class="flex-1 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                <span class="text-2xl block mb-2">💕</span>
                <p class="text-xs text-stone-500 font-medium">We find your matches</p>
              </div>
              <div class="flex-1 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                <span class="text-2xl block mb-2">📱</span>
                <p class="text-xs text-stone-500 font-medium">SMS when matched</p>
              </div>
            </div>
          </div>
          
          <UiButton
            variant="primary"
            size="lg"
            @click="finishOnboarding"
            class="w-full"
          >
            Go to Account ✨
          </UiButton>
        </div>
      </div>

      <!-- Footer Navigation (only for manual steps) -->
      <div v-if="currentStep === 1 && form.interestedIn" class="w-full mt-8 animate-fade-in">
        <UiButton
          variant="primary"
          size="lg"
          @click="nextStep"
          class="w-full"
        >
          Continue
        </UiButton>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import VibeCard from '~/components/VibeCard.vue'
import { usePersona, type Persona } from '~/composables/usePersona'
import type { Database } from '~/types/database'

const route = useRoute()
const user = useSupabaseUser()

useHead({
  title: 'Vibe Check',
  meta: [
    { name: 'description', content: 'Take our 90-second personality assessment to discover your dating persona and find compatible matches.' }
  ]
})

// Retake modal state
const showRetakeModal = ref(false)
const isRetakeMode = ref(false)
const isCheckingAuth = ref(true)

// Check if user is already logged in
onMounted(async () => {
  const isRetakeRequest = route.query.retake === 'true'
  
  if (user.value) {
    if (isRetakeRequest) {
      // User wants to retake - show confirmation modal
      showRetakeModal.value = true
      isCheckingAuth.value = false
    } else {
      // Logged in user without retake flag - redirect to dashboard
      await navigateTo('/me')
      return
    }
  } else {
    isCheckingAuth.value = false
  }
  
  fetchVibeQuestions()
})

const confirmRetake = () => {
  showRetakeModal.value = false
  isRetakeMode.value = true
}

const cancelRetake = async () => {
  showRetakeModal.value = false
  await navigateTo('/me')
}

// Form state
const form = reactive({
  displayName: '',
  gender: '' as 'male' | 'female' | '',
  interestedIn: '' as 'male' | 'female' | 'everyone' | '',
  birthDate: '',
  location: '',
  intent: '',
  genotype: '',
  religion: '',
  height: null as number | null,
  occupation: '',
  phone: ''
})

const vibeAnswers = reactive<Record<string, string>>({})
const currentStep = ref(1)
const totalSteps = 11
const totalQuestions = 7 // 5 core + 2 bonus
const showExtras = ref(false)

// Encouragement
const showEncouragement = ref(false)
const encouragementMessage = ref('')

const encouragements = [
  "You're doing great! 🔥",
  "Almost there! 💪",
  "Looking good! ✨",
  "Keep it up! 🚀",
  "Nice choice! 👌"
]

const showEncouragementToast = () => {
  encouragementMessage.value = encouragements[Math.floor(Math.random() * encouragements.length)]
  showEncouragement.value = true
  setTimeout(() => {
    showEncouragement.value = false
  }, 1500)
}

// Questions from database
interface VibeQuestion {
  key: string
  question: string
  category: string
  options: string[]
  display_order: number
  is_active: boolean
  is_core?: boolean
  dimension?: string
}

const activeQuestions = ref<VibeQuestion[]>([])
const loadingQuestions = ref(true)

const fetchVibeQuestions = async () => {
  loadingQuestions.value = true
  const supabase = useSupabaseClient<Database>()
  
  try {
    // Fetch all active questions
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    if (data && data.length > 0) {
      // Separate core and bonus questions
      const coreQuestions = data.filter((q: any) => q.is_core === true)
      const bonusQuestions = data.filter((q: any) => q.is_core !== true)
      
      // Take all core questions (5) and 2 random bonus questions
      const shuffledBonus = [...bonusQuestions].sort(() => 0.5 - Math.random())
      const selectedBonus = shuffledBonus.slice(0, 2)
      
      // Combine: all cores first, then bonus
      activeQuestions.value = [...coreQuestions, ...selectedBonus] as any
    }
  } catch (err) {
    console.error('Failed to fetch questions:', err)
    // Enhanced fallback questions covering key dimensions
    activeQuestions.value = [
      // Core questions fallback
      { key: 'love_language', question: 'How do you most feel loved?', category: 'romance', options: ['Words of Affirmation 💬', 'Acts of Service 🛠️', 'Gifts 🎁', 'Quality Time ⏰', 'Physical Touch 🫂'], display_order: 1, is_active: true, is_core: true },
      { key: 'conflict_style', question: 'When we disagree, I prefer to...', category: 'values', options: ['Talk it out immediately 🗣️', 'Take space first 🧘', 'Find a quick compromise 🤝'], display_order: 2, is_active: true, is_core: true },
      { key: 'social_energy', question: 'On a scale of homebody to social butterfly, I am...', category: 'lifestyle', options: ['Full homebody 🛋️', 'Balanced ⚖️', 'Life of the party 🦋'], display_order: 3, is_active: true, is_core: true },
      { key: 'life_priority', question: 'In 5 years, my biggest priority is...', category: 'values', options: ['Career & wealth 💼', 'Family 👨‍👩‍👧', 'Travel & experiences 🌍'], display_order: 4, is_active: true, is_core: true },
      { key: 'relationship_pace', question: 'When it comes to relationships, I prefer to...', category: 'romance', options: ['Take it slow 🐢', 'Go with the flow 🌊', 'Move with intention 🎯'], display_order: 5, is_active: true, is_core: true },
      // Bonus questions fallback
      { key: 'weekend_vibe', question: 'It\'s Friday night. What\'s the move?', category: 'lifestyle', options: ['Clubbing 🪩', 'Netflix 🍿', 'Dinner with friends 🍽️'], display_order: 10, is_active: true, is_core: false },
      { key: 'music_taste', question: 'Pass the aux cord. What are we playing?', category: 'fun', options: ['Afrobeats 🇬🇭', 'Amapiano 🎹', 'R&B 🎷', 'Gospel 🙏'], display_order: 11, is_active: true, is_core: false }
    ]
  } finally {
    loadingQuestions.value = false
  }
}

// OTP state
const otpSent = ref(false)
const otpCode = ref('')
const otpError = ref('')
const sendingOtp = ref(false)
const verifyingOtp = ref(false)

// Persona state
const assignedPersona = ref<Persona | null>(null)

// Computed
const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100)

const currentQuestion = computed(() => activeQuestions.value[currentStep.value - 3])

const maxBirthDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const isValidPhone = computed(() => {
  const cleaned = form.phone.replace(/\D/g, '')
  return cleaned.length >= 9
})

const canProceedStep2 = computed(() => {
  return form.intent && form.birthDate && form.location
})

// Methods
const getVibeEmoji = () => {
  const emojis = ['💕', '🗣️', '🎉', '🎯', '💫', '🌟', '✨']
  return emojis[currentStep.value - 3] || '✨'
}

const getCategoryIcon = (category: string, idx: number): string => {
  const icons: Record<string, string[]> = {
    general: ['✨', '💫', '⭐', '🌟'],
    lifestyle: ['🏃', '🎉', '🏠', '🌊'],
    values: ['❤️', '🤝', '💪', '🔥'],
    romance: ['💕', '💘', '💑', '🌹'],
    fun: ['🎊', '🎈', '🎮', '🎯']
  }
  const categoryIcons = icons[category] || icons.general
  return categoryIcons[idx % categoryIcons.length]
}

const selectGender = (gender: 'male' | 'female') => {
  form.gender = gender
}

const selectInterest = (interest: 'male' | 'female' | 'everyone') => {
  form.interestedIn = interest
  // Auto-advance to step 2 after selecting interest
  setTimeout(() => {
    showEncouragementToast()
    nextStep()
  }, 400)
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    showEncouragementToast()
    currentStep.value++
  }
}

const handleVibeSelect = (key: string, value: string) => {
  vibeAnswers[key] = value
  setTimeout(() => {
    if (currentStep.value < 9) {
      showEncouragementToast()
    }
    nextStep()
  }, 400)
}

const handleSendOtp = async () => {
  if (!isValidPhone.value) return
  
  sendingOtp.value = true
  otpError.value = ''
  
  try {
    const { sendOTP } = useHubtel()
    const fullPhone = '+233' + form.phone.replace(/\D/g, '').replace(/^0+/, '')
    await sendOTP(fullPhone)
    otpSent.value = true
  } catch (error) {
    otpError.value = 'Failed to send code. Please try again.'
  } finally {
    sendingOtp.value = false
  }
}

const handleVerifyOtp = async () => {
  if (otpCode.value.length !== 6) return
  
  verifyingOtp.value = true
  otpError.value = ''
  
  try {
    const { verifyOTP } = useHubtel()
    const fullPhone = '+233' + form.phone.replace(/\D/g, '').replace(/^0+/, '')
    const result = await verifyOTP(fullPhone, otpCode.value)
    
    if (!result.valid) {
      otpError.value = result.error || 'Invalid code'
      return
    }

    await createUserProfile()
    
    const { calculatePersona } = usePersona()
    assignedPersona.value = calculatePersona(vibeAnswers)
    
    currentStep.value = 11
  } catch (error) {
    otpError.value = 'Verification failed. Please try again.'
  } finally {
    verifyingOtp.value = false
  }
}

const isCreatingProfile = ref(false)

const createUserProfile = async () => {
  if (isCreatingProfile.value) return
  isCreatingProfile.value = true
  
  try {
    const supabase = useSupabaseClient<Database>()
    const fullPhone = '+233' + form.phone.replace(/\D/g, '').replace(/^0+/, '')
    
    // Call server-side signup (Handles Auth Creation + Auto-confirm + Profile + Vibes)
    const result = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        phone: fullPhone,
        displayName: form.displayName.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        location: form.location,
        interestedIn: form.interestedIn,
        intent: form.intent,
        genotype: form.genotype || null,
        religion: form.religion || null,
        heightCm: form.height,
        occupation: form.occupation || null,
        vibeAnswers
      }
    })

    if (result.success && result.email && result.password) {
      // Sign in with the returned credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password
      })

      if (signInError) throw signInError
    }
  } catch (error: any) {
    console.error('Profile creation error:', error)
    throw error
  } finally {
    isCreatingProfile.value = false
  }
}


const finishOnboarding = async () => {
  const supabase = useSupabaseClient<Database>()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && assignedPersona.value) {
    const { savePersona } = usePersona()
    await savePersona(user.id, assignedPersona.value.id)
  }
  
  await navigateTo('/me')
}
</script>

<style scoped>
/* Minimal CSS for complex animations */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.confetti {
  position: absolute;
  font-size: 1.5rem;
  animation: confettiFall 3s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes confettiFall {
  0% { opacity: 1; transform: translateY(-50px) translateX(var(--x)) rotate(0deg); }
  100% { opacity: 0; transform: translateY(300px) translateX(var(--x)) rotate(720deg); }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
