<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>Vouch for Two Friends | Minutes 2 Match</Title>
      <Meta name="description" content="Know two people who'd be perfect together? Vouch for them on Minutes 2 Match." />
    </Head>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800">
      <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo-full.png" alt="minutes2match" class="h-16 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink to="/vouch" class="hidden sm:block text-xs font-bold uppercase tracking-widest text-rose-500">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hidden sm:block text-xs font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/" class="text-sm font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">
            ← Back to Home
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="max-w-2xl mx-auto px-6 py-12 md:py-20">
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
      </div>

      <!-- Form -->
      <div v-else>
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            🤝 Vouch for Friends
          </div>
          <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">
            Know two people who'd be <span class="italic text-rose-500">perfect</span> together?
          </h1>
          <p class="text-lg text-stone-500 dark:text-stone-400 max-w-lg mx-auto leading-relaxed">
            Vouch for two friends and we'll connect them. It's free — no account needed.
          </p>
        </div>

        <form @submit.prevent="submitVouch" class="space-y-8">
          <!-- Your Info -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-black dark:bg-stone-100 text-white dark:text-black rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h2 class="font-serif font-bold text-xl">About You (The Matcher)</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Name *</label>
                <input v-model="form.matcherName" type="text" required placeholder="e.g. Ama Serwah" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Phone *</label>
                <input v-model="form.matcherPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Your Email (optional)</label>
              <input v-model="form.matcherEmail" type="email" placeholder="you@email.com" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
            </div>
          </div>

          <!-- Friend A -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h2 class="font-serif font-bold text-xl">Friend A</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Name *</label>
                <input v-model="form.friendAName" type="text" required placeholder="Friend's name" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Phone *</label>
                <input v-model="form.friendAPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
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
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Name *</label>
                <input v-model="form.friendBName" type="text" required placeholder="Friend's name" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2">Phone *</label>
                <input v-model="form.friendBPhone" type="tel" required placeholder="0244123456" class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600" />
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 space-y-5">
            <h2 class="font-serif font-bold text-xl">Why would they be great together? (optional)</h2>
            <textarea v-model="form.matcherNote" rows="3" placeholder="They both love travel and have the same energy..." class="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none placeholder:text-stone-300 dark:placeholder:text-stone-600"></textarea>
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
            class="w-full bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black dark:border-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Sending...' : '🤝 Vouch for Them' }}
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
const submitted = ref(false)
const submitting = ref(false)
const error = ref('')

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
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
