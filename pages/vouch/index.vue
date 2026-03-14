<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>Vouch for Two Friends | Minutes 2 Match</Title>
      <Meta name="description" content="Know two people who'd be perfect together? Vouch for them on Minutes 2 Match." />
      <Meta property="og:title" content="Vouch for Two Friends 🤝" />
      <Meta property="og:description" content="Know two people who'd be perfect? Set them up on Minutes 2 Match — it's free!" />
      <Meta property="og:image" content="https://minutes2match.com/og-vouch.png" />
      <Meta property="og:type" content="website" />
      <Meta name="twitter:card" content="summary_large_image" />
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-20 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>

        <div class="hidden md:flex items-center gap-10 text-sm font-bold text-stone-900 dark:text-stone-200">
          <NuxtLink to="/#manifesto" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Manifesto</NuxtLink>
          <NuxtLink to="/#process" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Process</NuxtLink>
          <NuxtLink to="/vouch" class="text-rose-500 dark:text-rose-400">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Pricing</NuxtLink>
        </div>

        <div class="flex items-center gap-4 md:gap-8">
          <NuxtLink to="/login" class="hidden md:block text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-stone-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
             MEMBER LOGIN
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="hidden md:inline-flex bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-2.5 rounded-md border border-black dark:border-stone-600 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white transition-all shadow-[4px_4px_0px_0px_#E7E5E4] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
            VIBE CHECK
          </NuxtLink>

          <NuxtLink to="/vibe-check" class="md:hidden bg-black dark:bg-stone-100 text-white dark:text-black px-4 py-2.5 rounded-lg text-[10px] font-bold border border-black dark:border-stone-600 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest">
            JOIN
          </NuxtLink>
          
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 border-2 border-black dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
            <span class="w-5 h-0.5 bg-black dark:bg-white transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''"></span>
          </button>
        </div>
      </div>
      
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-show="mobileMenuOpen" class="md:hidden absolute top-full left-0 right-0 bg-[#FFFCF8] dark:bg-stone-900 border-b border-black dark:border-stone-800 shadow-lg">
          <div class="px-6 py-6 space-y-4">
            <NuxtLink to="/" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Home
            </NuxtLink>
            <NuxtLink to="/vouch" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold text-rose-500 transition-colors border-b border-stone-100 dark:border-stone-800">
              Vouch
            </NuxtLink>
            <NuxtLink to="/shoot-your-shot" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              Shoot Your Shot
            </NuxtLink>
            <NuxtLink to="/pricing" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
               Pricing
            </NuxtLink>
            <NuxtLink to="/login" @click="mobileMenuOpen = false" class="block w-full py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
              MEMBER LOGIN
            </NuxtLink>
            <NuxtLink to="/vibe-check" @click="mobileMenuOpen = false" class="block w-full text-center bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-colors mt-4">
              START VIBE CHECK
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>

    <main class="max-w-2xl mx-auto px-6 py-12 md:py-20 pt-28 md:pt-36">
      <!-- Success State -->
      <div v-if="submitted" class="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50 dark:ring-emerald-900/20">
          <span class="text-5xl">💕</span>
        </div>
        <h1 class="text-4xl font-serif font-bold mb-4 tracking-tight">Vouch Sent!</h1>
        <p class="text-lg text-stone-500 dark:text-stone-400 mb-8 max-w-md mx-auto leading-relaxed">
          We've sent an SMS to both <strong class="text-stone-900 dark:text-stone-200">{{ form.friendAName }}</strong> and <strong class="text-stone-900 dark:text-stone-200">{{ form.friendBName }}</strong>. 
          When they both accept, you'll be notified!
        </p>
        <div class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto mb-8">
          <p class="font-bold text-stone-900 dark:text-stone-200 mb-2">What happens next?</p>
          <ul class="space-y-2 text-left">
            <li class="flex items-start gap-2"><span>📱</span><span>Both friends receive an SMS with a link</span></li>
            <li class="flex items-start gap-2"><span>✅</span><span>Each friend accepts or declines</span></li>
            <li class="flex items-start gap-2"><span>💕</span><span>If both accept, you get notified!</span></li>
          </ul>
        </div>
        <NuxtLink to="/" class="inline-block bg-black dark:bg-stone-100 text-white dark:text-black px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all">
          Back to Home
        </NuxtLink>

        <!-- WhatsApp Share + Vouch Another -->
        <div class="flex flex-col sm:flex-row gap-3 mt-6 max-w-sm mx-auto">
          <a 
            :href="whatsappShareUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#1da851] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Share
          </a>
          <button 
            @click="submitted = false; resetForm()" 
            class="flex-1 border-2 border-black dark:border-stone-600 text-black dark:text-stone-200 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-stone-100 dark:hover:text-black transition-all"
          >
            Vouch Another Pair
          </button>
        </div>
      </div>

      <!-- Form -->
      <div v-else>
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">
            Know two people who'd be <span class="italic text-rose-500">perfect</span> together?
          </h1>
          <p class="text-lg text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
            Vouch for two friends and we'll connect them. It's free — no account needed.
          </p>
        </div>

        <!-- Social Proof -->
        <div v-if="socialProof.vouchesCount > 0" class="text-center mb-8">
          <span class="inline-flex items-center gap-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-4 py-2 rounded-full text-xs font-bold">
            <span class="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            {{ socialProof.vouchesCount }} vouches matched so far
          </span>
        </div>

        <form @submit.prevent="submitVouch" class="space-y-8">
          <!-- Your Info -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-black dark:bg-stone-100 text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h2 class="font-serif font-bold text-xl">About You (The Matcher)</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Name *</label>
                <div class="relative">
                  <input v-model="form.matcherName" type="text" required placeholder="e.g. Ama Serwah" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('matcher')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📇</span>
                  </button>
                </div>
              </div>
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Phone *</label>
                <div class="relative">
                  <input v-model="form.matcherPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('matcher')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📱</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Email (optional)</label>
              <input v-model="form.matcherEmail" type="email" placeholder="you@email.com" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
          </div>

          <!-- Friend A -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h2 class="font-serif font-bold text-xl">Friend A</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Name *</label>
                <div class="relative">
                  <input v-model="form.friendAName" type="text" required placeholder="Friend's name" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('friendA')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📇</span>
                  </button>
                </div>
              </div>
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Phone *</label>
                <div class="relative">
                  <input v-model="form.friendAPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('friendA')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📱</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Friend B -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h2 class="font-serif font-bold text-xl">Friend B</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Name *</label>
                <div class="relative">
                  <input v-model="form.friendBName" type="text" required placeholder="Friend's name" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('friendB')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📇</span>
                  </button>
                </div>
              </div>
              <div class="relative group">
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Phone *</label>
                <div class="relative">
                  <input v-model="form.friendBPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
                  <button v-if="contactPickerSupported" @click.prevent="pickContact('friendB')" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors p-1" title="Select from Contacts">
                    <span class="text-xl">📱</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <h2 class="font-serif font-bold text-xl">Why would they be great together? (optional)</h2>
            <textarea v-model="form.matcherNote" rows="3" placeholder="They both love travel and have the same energy..." class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none placeholder:text-stone-300 dark:placeholder:text-stone-600"></textarea>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <span>{{ error }}</span>
          </div>

          <!-- Submit -->
          <button 
            type="submit" 
            :disabled="submitting" 
            class="w-full py-4 rounded-xl font-bold text-lg transition-all border-2 active:scale-[0.98] disabled:cursor-not-allowed"
            :class="submitting
              ? 'bg-stone-100 text-stone-400 border-stone-200 shadow-none'
              : 'bg-rose-500 text-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-600 hover:-translate-y-[1px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer'"
          >
            {{ submitting ? 'Sending...' : 'Vouch for Them' }}
          </button>

          <p class="text-center text-xs text-stone-400 dark:text-stone-500">
            Free • No account needed • SMS will be sent to both friends
          </p>
        </form>
      </div>
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
const mobileMenuOpen = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const error = ref('')

const { isSupported: contactPickerSupported, pickContact: selectContact } = useContactPicker()

const socialProof = ref({ shotsCount: 0, vouchesCount: 0 })

// Fetch social proof stats
onMounted(async () => {
  try {
    const data = await $fetch('/api/stats/social-proof') as any
    socialProof.value = data
  } catch (e) {
    // Silently fail — social proof is optional
  }
})

const pickContact = async (field: 'matcher' | 'friendA' | 'friendB') => {
  const result = await selectContact()
  if (result) {
    if (field === 'matcher') {
      if (result.name && !form.matcherName) form.matcherName = result.name
      form.matcherPhone = result.phone
    } else if (field === 'friendA') {
      if (result.name) form.friendAName = result.name
      form.friendAPhone = result.phone
    } else if (field === 'friendB') {
      if (result.name) form.friendBName = result.name
      form.friendBPhone = result.phone
    }
  }
}

const form = reactive({
  matcherName: '',
  matcherPhone: '',
  matcherEmail: '',
  friendAName: '',
  friendAPhone: '',
  friendBName: '',
  friendBPhone: '',
  matcherNote: ''
})

const submitVouch = async () => {
  error.value = ''
  submitting.value = true

  try {
    const result = await $fetch('/api/vouches', {
      method: 'POST',
      body: form
    }) as any

    if (result.success) {
      submitted.value = true
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

const whatsappShareUrl = computed(() => {
  const text = encodeURIComponent(
    `I just vouched for two friends on Minutes 2 Match! 💕 Know someone who'd be great for your friend? Set them up (it's free): https://minutes2match.com/vouch`
  )
  return `https://wa.me/?text=${text}`
})

const resetForm = () => {
  form.matcherName = ''
  form.matcherPhone = ''
  form.matcherEmail = ''
  form.friendAName = ''
  form.friendAPhone = ''
  form.friendBName = ''
  form.friendBPhone = ''
  form.matcherNote = ''
  error.value = ''
}
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
