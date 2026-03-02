<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>You've Been Vouched | Minutes 2 Match</Title>
    </Head>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] dark:bg-stone-950 border-b border-black dark:border-stone-800">
      <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo-full.png" alt="minutes2match" class="h-16 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink to="/vouch" class="hidden sm:block text-xs font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hidden sm:block text-xs font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/" class="text-sm font-bold uppercase tracking-widest hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400 transition-colors">
            ← Back to Home
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="max-w-lg mx-auto px-6 py-12 md:py-20">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-stone-100 dark:border-stone-800 border-t-rose-500 animate-spin mx-auto mb-6"></div>
        <p class="text-stone-500 dark:text-stone-400 font-medium">Loading your vouch...</p>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="text-center py-20">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-4xl">😔</span>
        </div>
        <h1 class="text-2xl font-serif font-bold mb-3">Oops!</h1>
        <p class="text-stone-500 dark:text-stone-400 mb-6">{{ fetchError }}</p>
        <NuxtLink to="/" class="text-sm font-bold text-rose-500 hover:underline">Go to Minutes2Match →</NuxtLink>
      </div>

      <!-- Already Responded -->
      <div v-else-if="vouch.yourAccepted" class="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <span class="text-5xl">✅</span>
        </div>
        <h1 class="text-3xl font-serif font-bold mb-3 tracking-tight">You're In!</h1>
        <p class="text-stone-500 dark:text-stone-400 text-lg max-w-sm mx-auto leading-relaxed">
          You've already accepted this vouch. 
          <span v-if="vouch.status === 'matched'" class="block mt-2 text-rose-500 font-bold">🎉 You've been matched with {{ vouch.otherName }}!</span>
          <span v-else class="block mt-2">Waiting for <strong class="text-stone-900 dark:text-stone-200">{{ vouch.otherName }}</strong> to respond.</span>
        </p>
      </div>

      <!-- Declined -->
      <div v-else-if="responded && !accepted" class="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div class="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-8">
          <span class="text-5xl">👋</span>
        </div>
        <h1 class="text-3xl font-serif font-bold mb-3">No worries!</h1>
        <p class="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
          You've declined this vouch. No hard feelings.
        </p>
      </div>

      <!-- Accepted Just Now -->
      <div v-else-if="responded && accepted" class="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50 dark:ring-emerald-900/20">
          <span class="text-5xl">{{ responseStatus === 'matched' ? '💕' : '✅' }}</span>
        </div>
        <h1 class="text-3xl font-serif font-bold mb-3 tracking-tight">
          {{ responseStatus === 'matched' ? 'It\'s a Match!' : 'Accepted!' }}
        </h1>
        <p class="text-stone-500 dark:text-stone-400 text-lg max-w-sm mx-auto leading-relaxed">
          <span v-if="responseStatus === 'matched'">
            Both of you accepted! 🎉 You'll both receive details via SMS shortly.
          </span>
          <span v-else>
            You've accepted! Waiting for <strong class="text-stone-900 dark:text-stone-200">{{ vouch.otherName }}</strong> to respond. We'll text you when they do.
          </span>
        </p>
      </div>

      <!-- Vouch Card (Pending Response) -->
      <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            💌 You've Been Vouched
          </div>
          <h1 class="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight leading-tight">
            Someone thinks you'd be <span class="italic text-rose-500">perfect</span> for someone
          </h1>
        </div>

        <!-- Vouch Details Card -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border-2 border-black dark:border-stone-700 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
          <!-- Header -->
          <div class="bg-rose-50 dark:bg-rose-900/20 p-6 border-b border-black dark:border-stone-700">
            <p class="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">Vouched by</p>
            <p class="text-2xl font-serif font-bold text-rose-900 dark:text-rose-100">{{ vouch.matcherName }}</p>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div>
              <p class="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">Hey {{ vouch.yourName }} 👋</p>
              <p class="text-stone-700 dark:text-stone-300 leading-relaxed">
                Your friend <strong>{{ vouch.matcherName }}</strong> thinks you and <strong>{{ vouch.otherName }}</strong> would be an amazing match.
              </p>
            </div>

            <div v-if="vouch.matcherNote" class="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
              <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Their reason</p>
              <p class="text-stone-700 dark:text-stone-300 italic leading-relaxed">"{{ vouch.matcherNote }}"</p>
            </div>

            <!-- Error -->
            <div v-if="respondError" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
              {{ respondError }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button 
                @click="respondToVouch(true)" 
                :disabled="responding" 
                class="flex-1 bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-xl font-bold text-base hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all disabled:opacity-50"
              >
                {{ responding ? '...' : '💕 I\'m In!' }}
              </button>
              <button 
                @click="respondToVouch(false)" 
                :disabled="responding" 
                class="px-6 py-4 border-2 border-stone-200 dark:border-stone-700 rounded-xl font-bold text-sm text-stone-500 hover:border-stone-400 dark:hover:border-stone-500 transition-all disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        </div>

        <p class="text-center text-xs text-stone-400 dark:text-stone-500 mt-6">
          Powered by <NuxtLink to="/" class="underline hover:text-black dark:hover:text-white">Minutes2Match</NuxtLink> • Free, no account needed
        </p>
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
const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const fetchError = ref('')
const vouch = ref<any>({})
const responded = ref(false)
const accepted = ref(false)
const responding = ref(false)
const respondError = ref('')
const responseStatus = ref('')

// Fetch vouch data
onMounted(async () => {
  try {
    const data = await $fetch(`/api/vouches/${token}`)
    vouch.value = data
  } catch (err: any) {
    fetchError.value = err.data?.message || 'This vouch link is no longer valid.'
  } finally {
    loading.value = false
  }
})

const respondToVouch = async (accept: boolean) => {
  responding.value = true
  respondError.value = ''

  try {
    const result = await $fetch('/api/vouches/respond', {
      method: 'POST',
      body: { token, accept }
    }) as any

    responded.value = true
    accepted.value = accept
    responseStatus.value = result.status
  } catch (err: any) {
    respondError.value = err.data?.message || 'Something went wrong.'
  } finally {
    responding.value = false
  }
}
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
