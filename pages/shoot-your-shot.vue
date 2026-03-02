<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>Shoot Your Shot | Minutes 2 Match</Title>
      <Meta name="description" content="Interested in someone? Shoot your shot on Minutes 2 Match." />
    </Head>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800">
      <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo-full.png" alt="minutes2match" class="h-16 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink to="/vouch" class="hidden sm:block text-xs font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hidden sm:block text-xs font-bold uppercase tracking-widest text-rose-500">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/" class="text-sm font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">
            ← Back to Home
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="max-w-2xl mx-auto px-6 py-12 md:py-20">
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          🎯 Shoot Your Shot
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">
          Got someone <span class="italic text-rose-500">on your mind?</span>
        </h1>
        <p class="text-lg text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
          Let them know someone's interested. They'll get a mystery SMS with 3 clues — and can tap to reveal it's you.
        </p>
      </div>

      <form @submit.prevent="submitShot" class="space-y-8">
        <!-- Step 1: Your Info -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-black dark:bg-stone-100 text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <h2 class="font-serif font-bold text-xl">About You</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Name *</label>
              <input v-model="form.shooterName" type="text" required placeholder="e.g. Kwame Asante" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Phone *</label>
              <input v-model="form.shooterPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Email * <span class="text-stone-300 dark:text-stone-600 normal-case">(for payment receipt)</span></label>
            <input v-model="form.shooterEmail" type="email" required placeholder="you@email.com" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
          </div>
        </div>

        <!-- Step 2: Target -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <h2 class="font-serif font-bold text-xl">Who Are You Shooting At? 🎯</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Their Name *</label>
              <input v-model="form.targetName" type="text" required placeholder="Their name" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Their Phone *</label>
              <input v-model="form.targetPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
          </div>
        </div>

        <!-- Step 3: Mystery Hints -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h2 class="font-serif font-bold text-xl">Drop 3 Mystery Clues 🕵️</h2>
              <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Pick 3 questions and answer them — these will be shown as hints before they unlock your identity</p>
            </div>
          </div>

          <!-- Selection Counter -->
          <div class="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700">
            <span class="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Clues selected</span>
            <div class="flex gap-1.5">
              <div v-for="i in 3" :key="i" class="w-3 h-3 rounded-full transition-all duration-300" :class="i <= selectedHints.length ? 'bg-rose-500 scale-110' : 'bg-stone-200 dark:bg-stone-700'"></div>
            </div>
          </div>

          <!-- Question Cards -->
          <div class="grid gap-3">
            <div 
              v-for="question in availableQuestions" 
              :key="question.id"
              class="group relative"
            >
              <!-- Question Toggle Button -->
              <button
                type="button"
                @click="toggleQuestion(question)"
                class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4"
                :class="isSelected(question.id) 
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-700' 
                  : selectedHints.length >= 3 
                    ? 'border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 opacity-50 cursor-not-allowed' 
                    : 'border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-white dark:hover:bg-stone-800'"
              >
                <span class="text-2xl shrink-0">{{ question.emoji }}</span>
                <span class="text-sm font-medium flex-1 text-stone-700 dark:text-stone-300">{{ question.question }}</span>
                <div 
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  :class="isSelected(question.id) ? 'bg-rose-500 border-rose-500' : 'border-stone-300 dark:border-stone-600'"
                >
                  <svg v-if="isSelected(question.id)" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>

              <!-- Answer Input (slides in when selected) -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0 -translate-y-2"
                enter-to-class="opacity-100 max-h-24 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-24 translate-y-0"
                leave-to-class="opacity-0 max-h-0 -translate-y-2"
              >
                <div v-if="isSelected(question.id)" class="mt-2 ml-12 mr-2 overflow-hidden">
                  <input
                    :value="getAnswer(question.id)"
                    @input="(e: Event) => updateAnswer(question.id, (e.target as HTMLInputElement).value)"
                    type="text"
                    :placeholder="question.placeholder"
                    maxlength="100"
                    class="w-full bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600"
                  />
                </div>
              </Transition>
            </div>
          </div>

          <!-- Reshuffle -->
          <button 
            type="button" 
            @click="reshuffleQuestions" 
            class="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 mx-auto"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Shuffle for different questions
          </button>
        </div>

        <!-- Step 4: Personal Message -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-stone-300 dark:bg-stone-700 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <h2 class="font-serif font-bold text-xl">Personal Message <span class="text-stone-400 font-normal text-base">(optional)</span></h2>
          </div>
          <textarea v-model="form.message" rows="3" maxlength="280" placeholder="Say something genuine... they'll see this when they unlock your identity." class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none placeholder:text-stone-300 dark:placeholder:text-stone-600"></textarea>
          <p class="text-xs text-stone-400 text-right">{{ form.message?.length || 0 }}/280</p>
        </div>

        <!-- Price Info -->
        <div class="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-xl p-5 flex items-start gap-4">
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0 text-2xl">💰</div>
          <div>
            <p class="font-bold text-stone-900 dark:text-stone-100 text-sm">This costs <span class="text-rose-500">GH₵15</span></p>
            <p class="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
              You'll be redirected to Paystack to complete payment. Once confirmed, they'll get a mysterious SMS with your 3 clues.
            </p>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
          <span>⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Submit -->
        <button 
          type="submit" 
          :disabled="submitting || !isComplete" 
          class="w-full bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black dark:border-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Setting up payment...' : '🎯 Shoot Your Shot — GH₵15' }}
        </button>

        <p v-if="!isComplete" class="text-center text-xs text-amber-600 dark:text-amber-400">
          ☝️ Pick and answer all 3 mystery clues above to continue
        </p>
        <p v-else class="text-center text-xs text-stone-400 dark:text-stone-500">
          Secure checkout via Paystack • Your identity stays hidden until they unlock
        </p>
      </form>
    </main>

    <!-- Footer -->
    <footer class="border-t border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 mt-16">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-stone-400 dark:text-stone-500 font-medium whitespace-nowrap">
            © {{ new Date().getFullYear() }} Minutes 2 Match.
          </p>
          <div class="flex items-center gap-6">
            <a href="https://www.instagram.com/minutes2match" target="_blank" class="text-xs text-stone-400 dark:text-stone-500 hover:text-rose-500 transition-colors font-medium">Instagram</a>
            <NuxtLink to="/terms" class="text-xs text-stone-400 dark:text-stone-500 hover:text-rose-500 transition-colors font-medium">Terms</NuxtLink>
            <NuxtLink to="/privacy" class="text-xs text-stone-400 dark:text-stone-500 hover:text-rose-500 transition-colors font-medium">Privacy</NuxtLink>
            <NuxtLink to="/release-notes" class="text-xs text-stone-400 dark:text-stone-500 hover:text-rose-500 transition-colors font-medium">Updates</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { availableQuestions, selectedHints, isSelected, toggleQuestion, updateAnswer, reshuffleQuestions, isComplete, formattedHints } = useShotHints()

const submitting = ref(false)
const error = ref('')

const form = reactive({
  shooterName: '',
  shooterPhone: '',
  shooterEmail: '',
  targetName: '',
  targetPhone: '',
  message: ''
})

const getAnswer = (questionId: string) => {
  const hint = selectedHints.value.find(h => h.question.id === questionId)
  return hint?.answer || ''
}

const submitShot = async () => {
  if (!isComplete.value) {
    error.value = 'Please pick and answer all 3 mystery clues.'
    return
  }

  error.value = ''
  submitting.value = true

  try {
    const result = await $fetch('/api/shots', {
      method: 'POST',
      body: {
        ...form,
        hints: formattedHints.value
      }
    }) as any

    if (result.success && result.paymentUrl) {
      window.location.href = result.paymentUrl
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
