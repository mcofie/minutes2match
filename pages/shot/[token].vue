<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>Someone's Interested | Minutes 2 Match</Title>
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
        <p class="text-stone-500 dark:text-stone-400 font-medium">Loading...</p>
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="text-center py-20">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="text-4xl">😔</span>
        </div>
        <h1 class="text-2xl font-serif font-bold mb-3">Link Not Available</h1>
        <p class="text-stone-500 dark:text-stone-400 mb-6">{{ fetchError }}</p>
        <NuxtLink to="/" class="text-sm font-bold text-rose-500 hover:underline">Go to Minutes2Match →</NuxtLink>
      </div>

      <!-- ====== UNLOCKED VIEW ====== -->
      <div v-else-if="shot.isUnlocked" class="animate-in fade-in zoom-in duration-500">
        <div class="text-center mb-8">
          <div class="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-rose-50/50 dark:ring-rose-900/20">
            <span class="text-5xl">💕</span>
          </div>
          <h1 class="text-3xl font-serif font-bold mb-2 tracking-tight">Shot Revealed!</h1>
          <p class="text-stone-500 dark:text-stone-400">Here's who's interested in you</p>
        </div>

        <div class="bg-white dark:bg-stone-900 rounded-2xl border-2 border-black dark:border-stone-700 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
          <!-- Identity Reveal -->
          <div class="bg-rose-50 dark:bg-rose-900/20 p-6 border-b border-black dark:border-stone-700 text-center">
            <p class="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">Interested in you</p>
            <p class="text-3xl font-serif font-bold text-rose-900 dark:text-rose-100">{{ shot.shooterName }}</p>
            <p class="text-sm text-stone-500 dark:text-stone-400 mt-2 font-mono">📱 {{ shot.shooterPhone }}</p>
          </div>

          <!-- Their Clues (now revealed context) -->
          <div v-if="shot.hints?.length" class="p-6 border-b border-stone-100 dark:border-stone-800">
            <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Their clues were...</p>
            <div class="space-y-3">
              <div v-for="(hint, i) in shot.hints" :key="i" class="flex items-start gap-3 text-sm">
                <span class="text-lg shrink-0">{{ hint.emoji }}</span>
                <div>
                  <p class="text-stone-500 dark:text-stone-400 text-xs">{{ hint.question }}</p>
                  <p class="font-medium text-stone-800 dark:text-stone-200">{{ hint.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Message -->
          <div v-if="shot.message" class="p-6 border-b border-stone-100 dark:border-stone-800">
            <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Their message to you</p>
            <div class="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700">
              <p class="text-stone-700 dark:text-stone-300 italic leading-relaxed">"{{ shot.message }}"</p>
            </div>
          </div>

          <!-- CTA -->
          <div class="p-6">
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <span class="text-lg shrink-0">💡</span>
              <span>If you're interested, reach out to them! They took a bold step — the ball's in your court now.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== TEASER VIEW (Not Yet Unlocked) ====== -->
      <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            🎯 Someone Shot Their Shot
          </div>
          <h1 class="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight leading-tight">
            Hey {{ shot.targetName }}, someone's <span class="italic text-rose-500">interested</span> in you
          </h1>
          <p class="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            They left 3 mystery clues — can you guess who it is?
          </p>
        </div>

        <!-- Mystery Card -->
        <div class="bg-white dark:bg-stone-900 rounded-2xl border-2 border-black dark:border-stone-700 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]">
          <!-- Mystery Profile -->
          <div class="p-8 text-center border-b border-stone-100 dark:border-stone-800">
            <div class="w-28 h-28 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <span class="text-5xl">🤫</span>
              <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-stone-900">
                ?
              </div>
            </div>
            <p class="text-sm text-stone-500 dark:text-stone-400 mb-1">Someone who knows you has</p>
            <p class="text-2xl font-serif font-bold mb-1">Shot Their Shot</p>
            <p class="text-stone-400 dark:text-stone-500 text-sm">at <strong class="text-stone-900 dark:text-stone-200">{{ shot.targetName }}</strong></p>
          </div>

          <!-- Mystery Clues Section -->
          <div v-if="shot.hints?.length" class="p-6">
            <div class="flex items-center gap-2 mb-5">
              <span class="text-lg">🕵️</span>
              <p class="text-sm font-bold text-stone-700 dark:text-stone-300">Mystery Clues</p>
              <span class="text-xs text-stone-400 dark:text-stone-500 ml-auto">Can you guess who?</span>
            </div>

            <div class="space-y-3">
              <div 
                v-for="(hint, i) in shot.hints" 
                :key="i"
                class="clue-card group bg-stone-50 dark:bg-stone-800 rounded-xl p-4 border border-stone-100 dark:border-stone-700 hover:border-rose-200 dark:hover:border-rose-800 transition-all cursor-default"
                :style="{ animationDelay: `${i * 150}ms` }"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-white dark:bg-stone-700 rounded-lg flex items-center justify-center text-xl shrink-0 border border-stone-100 dark:border-stone-600 group-hover:scale-110 transition-transform">
                    {{ hint.emoji }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Clue {{ i + 1 }}</p>
                    <p class="text-xs text-stone-500 dark:text-stone-400 mb-1.5">{{ hint.question }}</p>
                    <p class="text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug">"{{ hint.answer }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Unlock Section -->
          <div class="px-6 pb-6 pt-2">
            <div class="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-lg p-4 text-center mb-4">
              <p class="text-sm text-rose-700 dark:text-rose-300 font-medium">
                Think you know who it is? 🤔
              </p>
              <p class="text-xs text-rose-500/70 dark:text-rose-400/70 mt-1">
                Unlock to reveal their identity
              </p>
            </div>

            <!-- Error -->
            <div v-if="unlockError" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {{ unlockError }}
            </div>

            <button 
              @click="unlockShot" 
              :disabled="unlocking" 
              class="w-full bg-black dark:bg-stone-100 text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white transition-all disabled:opacity-50"
            >
              {{ unlocking ? 'Revealing...' : '👀 Unlock Identity' }}
            </button>
            <p class="text-center text-xs text-stone-400 dark:text-stone-500 mt-3">
              Free to unlock • They'll be notified you saw their shot
            </p>
          </div>
        </div>
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
const shot = ref<any>({})
const unlocking = ref(false)
const unlockError = ref('')

// Fetch shot data
onMounted(async () => {
  try {
    const data = await $fetch(`/api/shots/${token}`)
    shot.value = data
  } catch (err: any) {
    fetchError.value = err.data?.message || 'This link is no longer valid.'
  } finally {
    loading.value = false
  }
})

const unlockShot = async () => {
  unlocking.value = true
  unlockError.value = ''

  try {
    const result = await $fetch('/api/shots/unlock', {
      method: 'POST',
      body: { token }
    }) as any

    if (result.success) {
      shot.value = {
        ...shot.value,
        isUnlocked: true,
        shooterName: result.shooterName,
        shooterPhone: result.shooterPhone,
        message: result.message,
        status: 'unlocked'
      }
    }
  } catch (err: any) {
    unlockError.value = err.data?.message || 'Something went wrong.'
  } finally {
    unlocking.value = false
  }
}
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.clue-card {
  animation: clue-appear 0.5s ease-out both;
}

@keyframes clue-appear {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
