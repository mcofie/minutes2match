<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>Someone's Interested | Minutes 2 Match</Title>
      <Meta name="description" content="Someone shot their shot at you on Minutes 2 Match! Tap to reveal who's interested." />
      <Meta property="og:title" content="Someone's Interested in You 💫" />
      <Meta property="og:description" content="Someone just shot their shot at you on Minutes 2 Match. Tap to reveal who it is!" />
      <Meta property="og:image" content="https://minutes2match.com/og-shot.png" />
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
          <NuxtLink to="/vouch" class="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
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
            <NuxtLink to="/vouch" @click="mobileMenuOpen = false" class="block w-full text-left py-3 text-sm font-bold hover:text-rose-500 dark:hover:text-rose-400 dark:text-stone-200 transition-colors border-b border-stone-100 dark:border-stone-800">
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

    <main class="max-w-lg mx-auto px-6 py-12 md:py-20 pt-28 md:pt-36">
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
        <!-- Confetti Canvas -->
        <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-50" style="width: 100vw; height: 100vh;"></canvas>

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
            <p class="text-3xl font-serif font-bold text-rose-900 dark:text-rose-100 reveal-name">{{ shot.shooterName }}</p>
            <p class="text-sm text-stone-500 dark:text-stone-400 mt-2 font-mono">📱 {{ shot.shooterPhone }}</p>
          </div>

          <!-- Their Clues (now revealed context) with animated flip -->
          <div v-if="shot.hints?.length" class="p-6 border-b border-stone-100 dark:border-stone-800">
            <p class="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Their clues were...</p>
            <div class="space-y-3">
              <div 
                v-for="(hint, i) in shot.hints" 
                :key="i" 
                class="clue-reveal flex items-start gap-3 text-sm"
                :style="{ animationDelay: `${300 + Number(i) * 200}ms` }"
              >
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
          <h1 class="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight leading-tight">
            Hey {{ shot.targetName }}, someone's <span class="italic text-rose-500">interested</span> in you
          </h1>
          <p class="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            They left 3 mystery clues — can you guess who it is?
          </p>
        </div>

        <!-- Expiry Countdown -->
        <div v-if="timeRemaining" class="flex items-center justify-center gap-2 mb-6">
          <span class="text-sm text-stone-400 dark:text-stone-500">⏳ Expires in</span>
          <span class="font-mono font-bold text-sm px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full border border-amber-100 dark:border-amber-800">
            {{ timeRemaining }}
          </span>
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
                :style="{ animationDelay: `${Number(i) * 150}ms` }"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-white dark:bg-stone-700 rounded-lg flex items-center justify-center text-xl shrink-0 border border-stone-100 dark:border-stone-600 group-hover:scale-110 transition-transform">
                    {{ hint.emoji }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Clue {{ Number(i) + 1 }}</p>
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
const mobileMenuOpen = ref(false)

const loading = ref(true)
const fetchError = ref('')
const shot = ref<any>({})
const unlocking = ref(false)
const unlockError = ref('')
const confettiCanvas = ref<HTMLCanvasElement | null>(null)
const timeRemaining = ref('')

// Compute expiry countdown
let countdownInterval: ReturnType<typeof setInterval> | null = null

const updateCountdown = () => {
  if (!shot.value.expiresAt) return
  const now = new Date().getTime()
  const expiry = new Date(shot.value.expiresAt).getTime()
  const diff = expiry - now

  if (diff <= 0) {
    timeRemaining.value = 'Expired'
    if (countdownInterval) clearInterval(countdownInterval)
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    timeRemaining.value = `${days}d ${hours}h`
  } else if (hours > 0) {
    timeRemaining.value = `${hours}h ${minutes}m`
  } else {
    timeRemaining.value = `${minutes}m`
  }
}

// Simple confetti burst
const fireConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const colors = ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6']
  const particles: any[] = []

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 18 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    })
  }

  let frame = 0
  const animate = () => {
    frame++
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.vx
      p.vy += 0.3 // gravity
      p.y += p.vy
      p.rotation += p.rotationSpeed
      p.opacity -= 0.008

      if (p.opacity <= 0) return

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })

    if (frame < 150 && particles.some(p => p.opacity > 0)) {
      requestAnimationFrame(animate)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  requestAnimationFrame(animate)
}

// Fetch shot data
onMounted(async () => {
  try {
    const data = await $fetch(`/api/shots/${token}`)
    shot.value = data

    // Start countdown if not unlocked
    if (!shot.value.isUnlocked && shot.value.expiresAt) {
      updateCountdown()
      countdownInterval = setInterval(updateCountdown, 60000) // Update every minute
    }

    // Fire confetti if already unlocked (user revisiting)
    if (shot.value.isUnlocked) {
      nextTick(() => setTimeout(fireConfetti, 300))
    }
  } catch (err: any) {
    fetchError.value = err.data?.message || 'This link is no longer valid.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
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

      // Fire confetti on unlock!
      nextTick(() => setTimeout(fireConfetti, 200))
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

/* Animated clue reveal on unlock */
.clue-reveal {
  animation: clue-flip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes clue-flip {
  0% {
    opacity: 0;
    transform: rotateX(90deg) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: rotateX(0) translateY(0);
  }
}

/* Name reveal animation */
.reveal-name {
  animation: name-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.1s;
}

@keyframes name-reveal {
  0% {
    opacity: 0;
    filter: blur(12px);
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
}
</style>
