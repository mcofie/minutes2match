<template>
  <main class="min-h-screen bg-[#FFFCF8] flex flex-col font-sans text-stone-900 relative overflow-hidden">
    <!-- Fonts -->
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <Link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <!-- Retake Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showRetakeModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
          <div class="text-center space-y-4">
            <span class="text-5xl block animate-spin-slow">🔄</span>
            <h2 class="text-3xl font-serif font-bold text-black">Retake Vibe Test?</h2>
            <p class="text-stone-600 leading-relaxed font-light">
              You've already completed the vibe test. Retaking it will <strong class="text-black font-bold">replace your current answers</strong> and may affect your matches.
            </p>
            <div class="bg-rose-50 border-2 border-rose-100 rounded-lg p-4 text-left">
              <div class="flex items-start gap-3">
                <span class="text-rose-500 text-xl font-bold">⚠️</span>
                <div class="text-sm text-rose-900">
                  <p class="font-bold uppercase tracking-wider text-xs">This action cannot be undone</p>
                  <p class="text-rose-700 mt-1 font-mono text-xs">Your persona and compatibility scores will be recalculated.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 flex flex-col gap-3">
            <button
              @click="confirmRetake"
              class="w-full bg-black text-white py-3 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all border-2 border-black"
            >
              Yes, Retake Test 🎯
            </button>
            <button
              @click="cancelRetake"
              class="w-full py-3 text-stone-500 font-bold uppercase tracking-widest text-xs hover:text-black transition-colors"
            >
              No, Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-2 bg-stone-100 z-50 border-b border-black">
      <div class="h-full bg-rose-500 transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Encouragement Toast -->
    <Transition name="toast">
      <div v-if="showEncouragement" class="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(244,63,94,1)] border border-black z-50 flex items-center gap-2">
        <span>{{ encouragementMessage }}</span>
      </div>
    </Transition>

    <!-- Content Container -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto min-h-[600px] relative z-10">
      
      <!-- Step 1: Quick Intro -->
      <div v-if="currentStep === 1" class="w-full animate-fade-in space-y-10">
        <div class="text-center space-y-2">
          <span class="text-5xl block mb-6 animate-bounce-slow">👋</span>
          <h1 class="text-4xl md:text-5xl font-serif font-bold text-black tracking-tight">Let's meet you!</h1>
          <p class="text-stone-500 font-light font-serif italic text-lg">This takes about 90 seconds</p>
        </div>

        <div class="space-y-8">
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-black pb-1 mb-2 inline-block">What should we call you?</label>
            <input
              type="text"
              v-model="form.displayName"
              placeholder="YOUR FIRST NAME"
              class="w-full px-4 py-4 bg-transparent text-2xl md:text-3xl font-serif font-bold text-center placeholder-stone-200 focus:outline-none focus:placeholder-stone-100 transition-colors border-b-2 border-stone-200 focus:border-black rounded-none"
              maxlength="20"
              @keyup.enter="form.displayName.length >= 2 && nextStep()"
            />
          </div>

          <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" v-if="form.displayName.length >= 2">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-black pb-1 mb-2 inline-block">I am</label>
            <div class="grid grid-cols-2 gap-4">
              <VibeCard text="A Guy" icon="🙋‍♂️" :selected="form.gender === 'male'" @select="selectGender('male')" />
              <VibeCard text="A Lady" icon="🙋‍♀️" :selected="form.gender === 'female'" @select="selectGender('female')" />
            </div>
          </div>

          <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" v-if="form.gender">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-black pb-1 mb-2 inline-block">Looking for</label>
            <div class="grid grid-cols-2 gap-4">
              <VibeCard text="Men" icon="🧔" :selected="form.interestedIn === 'male'" @select="selectInterest('male')" />
              <VibeCard text="Women" icon="👩" :selected="form.interestedIn === 'female'" @select="selectInterest('female')" />
            </div>
            <button 
              class="w-full text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors py-3 hover:underline underline-offset-4"
              @click="selectInterest('everyone')"
            >
              I'm open to everyone ✨
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Quick Details -->
      <div v-else-if="currentStep === 2" class="w-full animate-fade-in space-y-10">
        <div class="text-center space-y-2">
          <span class="text-5xl block mb-6">📋</span>
          <h1 class="text-3xl md:text-4xl font-serif font-bold text-black tracking-tight">Almost there, {{ form.displayName }}!</h1>
          <p class="text-stone-500 font-light font-serif italic">Just a few quick details</p>
        </div>

        <div class="space-y-8">
          <div class="space-y-4">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-black pb-1 mb-2 inline-block">What are you looking for?</label>
            <div class="grid grid-cols-2 gap-3">
              <VibeCard text="Marriage" icon="💍" size="sm" :selected="form.intent === 'marriage'" @select="form.intent = 'marriage'" />
              <VibeCard text="Relationship" icon="❤️" size="sm" :selected="form.intent === 'serious'" @select="form.intent = 'serious'" />
              <VibeCard text="Casual" icon="🥂" size="sm" :selected="form.intent === 'casual'" @select="form.intent = 'casual'" />
              <VibeCard text="Friendship" icon="👋" size="sm" :selected="form.intent === 'friendship'" @select="form.intent = 'friendship'" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-900">Birthday</label>
              <UiDatePicker 
                v-model="form.birthDate" 
                placeholder="Select date"
                class="font-mono text-sm"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-900">City</label>
              <div class="relative">
                <select v-model="form.location" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:outline-none focus:border-black transition-all appearance-none font-bold text-sm">
                  <option value="">Select...</option>
                  <option value="accra">Accra</option>
                  <option value="kumasi">Kumasi</option>
                  <option value="tamale">Tamale</option>
                  <option value="takoradi">Takoradi</option>
                  <option value="other">Other</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs">▼</div>
              </div>
            </div>
          </div>

          <!-- Collapsible Extras -->
          <button class="w-full text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors flex items-center justify-center gap-2 py-2 border-b border-dashed border-stone-300 pb-1" @click="showExtras = !showExtras">
            <span>{{ showExtras ? 'Show Less' : 'Add Optional Details' }}</span>
            <span class="text-[10px] transform transition-transform" :class="{ 'rotate-180': showExtras }">▼</span>
          </button>
          
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div v-if="showExtras" class="bg-white p-6 rounded-xl border-2 border-stone-100 shadow-sm">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500">Genotype</label>
                  <select v-model="form.genotype" class="w-full px-3 py-2 rounded border-2 border-stone-100 bg-white text-xs font-bold focus:border-black outline-none font-mono">
                    <option value="">Skip</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500">Religion</label>
                  <select v-model="form.religion" class="w-full px-3 py-2 rounded border-2 border-stone-100 bg-white text-xs font-bold focus:border-black outline-none font-mono">
                    <option value="">Skip</option>
                    <option value="Christian">Christian</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500">Height (cm)</label>
                  <input type="number" v-model.number="form.height" placeholder="175" class="w-full px-3 py-2 rounded border-2 border-stone-100 bg-white text-xs font-bold focus:border-black outline-none font-mono placeholder-stone-300" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-stone-500">Occupation</label>
                  <input type="text" v-model="form.occupation" placeholder="Engineer" class="w-full px-3 py-2 rounded border-2 border-stone-100 bg-white text-xs font-bold focus:border-black outline-none font-mono placeholder-stone-300" />
                </div>
              </div>
            </div>
          </Transition>

          <button
            :disabled="!canProceedStep2"
            @click="nextStep"
            class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
          >
            Let's vibe check! 🎯
          </button>
        </div>
      </div>

      <!-- Steps 3-9: Vibe Questions (5 core + 2 bonus = 7 total) -->
      <div v-else-if="currentStep >= 3 && currentStep <= 9" class="w-full animate-fade-in space-y-10">
        <div class="text-center space-y-4">
          <span class="text-5xl block mb-4">{{ getVibeEmoji() }}</span>
          <div class="flex items-center justify-center gap-3 mb-2">
            <span v-if="currentStep <= 7" class="text-[10px] font-bold uppercase tracking-widest text-black bg-stone-100 border border-black px-3 py-1 rounded-full">Core Vibe</span>
            <span v-else class="text-[10px] font-bold uppercase tracking-widest text-white bg-rose-500 border border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Bonus</span>
          </div>
          <p class="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">Question {{ currentStep - 2 }} / {{ totalQuestions }}</p>
        </div>

        <div v-if="loadingQuestions" class="text-center py-12">
          <div class="w-12 h-12 rounded-full border-4 border-stone-200 border-t-black animate-spin mx-auto mb-6"></div>
          <p class="text-stone-500 font-serif italic">Curating vibes...</p>
        </div>

        <template v-else-if="currentQuestion">
          <h1 class="text-2xl md:text-4xl font-serif font-bold text-center leading-tight mb-8 text-black">{{ currentQuestion.question }}</h1>

          <div class="space-y-4">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              class="group w-full flex items-center gap-6 p-6 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-[2px] relative overflow-hidden"
              :class="vibeAnswers[currentQuestion.key] === option ? 'bg-black border-black text-white shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white border-stone-200 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'"
              @click="handleVibeSelect(currentQuestion.key, option)"
            >
               <!-- Selection Indicator for Active Item -->
               <div v-if="vibeAnswers[currentQuestion.key] === option" class="absolute left-0 top-0 bottom-0 w-2 bg-rose-500"></div>

              <span class="text-3xl group-hover:scale-110 transition-transform duration-300">{{ getCategoryIcon(currentQuestion.category, idx) }}</span>
              <span class="font-bold text-lg md:text-xl font-sans" :class="vibeAnswers[currentQuestion.key] === option ? 'text-white' : 'text-stone-800'">{{ option }}</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Step 10: Phone Verification -->
      <div v-else-if="currentStep === 10" class="w-full animate-fade-in space-y-10">
        <div class="text-center space-y-2">
          <span class="text-5xl block mb-6">📱</span>
          <h1 class="text-3xl md:text-4xl font-serif font-bold text-black tracking-tight">Last step!</h1>
          <p class="text-stone-500 font-light font-serif italic">Verify your number to save your profile</p>
        </div>

        <div class="space-y-6" v-if="!otpSent">
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-black pb-1 mb-2 inline-block">Phone Number</label>
            <div class="flex items-center w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus-within:ring-0 focus-within:border-black transition-all group hover:border-stone-400">
              <span class="font-bold text-stone-900 select-none mr-3 border-r-2 border-stone-200 pr-3 font-mono">+233</span>
              <input
                type="tel"
                v-model="form.phone"
                placeholder="20 123 4567"
                class="flex-1 text-lg font-bold outline-none bg-transparent placeholder-stone-300 text-stone-900 font-mono tracking-wide"
                maxlength="10"
              />
            </div>
          </div>
          
          <button
            :disabled="!isValidPhone || sendingOtp"
            @click="handleSendOtp"
            class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
          >
            {{ sendingOtp ? 'Sending...' : 'Send Code 📨' }}
          </button>
        </div>

        <div class="space-y-6" v-else>
          <div class="space-y-4">
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-900 w-full text-center">Enter the 6-digit code</label>
            <input
              type="text"
              v-model="otpCode"
              placeholder="000000"
              class="w-full py-4 text-4xl font-bold tracking-[0.5em] text-center outline-none bg-transparent border-b-4 border-stone-200 focus:border-black transition-colors placeholder-stone-200 font-mono"
              maxlength="6"
              @keyup.enter="otpCode.length === 6 && handleVerifyOtp()"
            />
          </div>

          <p v-if="otpError" class="text-rose-500 text-sm text-center font-bold bg-rose-50 py-2 rounded border border-rose-200">{{ otpError }}</p>

          <button
            :disabled="otpCode.length !== 6 || verifyingOtp"
            @click="handleVerifyOtp"
            class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
          >
            {{ verifyingOtp ? 'Verifying...' : 'Verify & Continue ✨' }}
          </button>

          <button @click="otpSent = false" class="w-full text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors py-2">
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
          
          <div class="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
            <div class="absolute inset-0 bg-white border-2 border-black rounded-full animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
            <div class="absolute inset-0 bg-stone-50 rounded-full opacity-50 blur-xl"></div>
            <span class="text-7xl relative z-10">{{ assignedPersona?.emoji }}</span>
          </div>
          
          <h1 class="text-4xl md:text-5xl font-serif font-bold text-black mb-6">You're {{ assignedPersona?.name }}!</h1>
          <p class="text-xl text-stone-600 max-w-md mx-auto mb-12 leading-relaxed font-light">{{ assignedPersona?.description }}</p>
          
          <div class="bg-white rounded-xl p-8 mb-10 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6 border-b border-stone-100 pb-2">What happens next?</p>
            <div class="flex gap-6 justify-center">
              <div class="flex-1 text-center">
                <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto border-2 border-black">💕</div>
                <p class="text-xs font-bold uppercase tracking-wide text-black">We find matches</p>
              </div>
              <div class="flex-1 text-center">
                 <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3 mx-auto border-2 border-black">📱</div>
                 <p class="text-xs font-bold uppercase tracking-wide text-black">SMS when matched</p>
              </div>
            </div>
          </div>
          
          <button
            @click="finishOnboarding"
            class="w-full bg-black text-white py-5 rounded-lg font-bold uppercase tracking-widest text-lg hover:bg-rose-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all border-2 border-black shadow-[6px_6px_0px_0px_rgba(244,63,94,1)]"
          >
            Go to Account ✨
          </button>
        </div>
      </div>

      <!-- Footer Navigation (only for manual steps) -->
      <div v-if="currentStep === 1 && form.interestedIn" class="w-full mt-8 animate-fade-in">
        <button
          @click="nextStep"
          class="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all border-2 border-black"
        >
          Continue
        </button>
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
const isReturningUser = ref(false) // User who logged in but hasn't completed vibe check

// Check if user is already logged in
onMounted(async () => {
  const isRetakeRequest = route.query.retake === 'true'
  const isReturnUser = route.query.returnUser === 'true'
  
  if (user.value) {
    if (isReturnUser) {
      // User is logged in but needs to complete vibe check
      // Let them proceed without modal
      console.log('[VibeCheck] Returning user needs to complete vibe check')
      isReturningUser.value = true
      isCheckingAuth.value = false
    } else if (isRetakeRequest) {
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

const nextStep = async () => {
  if (currentStep.value < totalSteps) {
    // If going to step 10 (Phone) and is returning user, skip to processing
    if (currentStep.value === 9 && isReturningUser.value) {
        await handleReturningUserCompletion()
        return
    }
    
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

// Handle completion for users who are already logged in
const handleReturningUserCompletion = async () => {
  isCreatingProfile.value = true
  try {
    // Calculate persona first
    const { calculatePersona, savePersona } = usePersona()
    assignedPersona.value = calculatePersona(vibeAnswers)
    
    // Update profile and save vibe answers
    await updateUserProfile()
    
    // Save persona to database
    if (user.value && assignedPersona.value) {
       await savePersona(user.value.id, assignedPersona.value.id)
    }
    
    // Move to results step
    currentStep.value = 11
  } catch (error) {
    console.error('Error completing profile:', error)
    alert('Failed to save profile. Please try again.')
  } finally {
    isCreatingProfile.value = false
  }
}

const updateUserProfile = async () => {
  const supabase = useSupabaseClient<Database>()
  
  if (!user.value) return

  // Update profile fields
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: form.displayName.trim(),
      gender: form.gender,
      birth_date: form.birthDate,
      location: form.location,
      interested_in: form.interestedIn,
      intent: form.intent,
      genotype: form.genotype || null,
      religion: form.religion || null,
      height_cm: form.height,
      occupation: form.occupation || null,
      is_verified: true
    })
    .eq('id', user.value.id)

  if (profileError) throw profileError

  // Save/Update Vibe Answers
  if (vibeAnswers && Object.keys(vibeAnswers).length > 0) {
    const vibeEntries = Object.entries(vibeAnswers).map(([key, value]) => ({
        user_id: user.value!.id,
        question_key: key,
        answer_value: value
    }))

    const { error: vibeError } = await supabase
        .from('vibe_answers')
        .upsert(vibeEntries, { onConflict: 'user_id,question_key' })
        
    if (vibeError) throw vibeError
  }
}

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
