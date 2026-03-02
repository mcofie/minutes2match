<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-black dark:text-stone-50 font-sans">
    <Head>
      <Title>You've Been Vouched | Minutes 2 Match</Title>
      <Meta name="description" content="Someone thinks you'd be perfect for someone! Tap to see who vouched for you." />
      <Meta property="og:title" content="You've Been Vouched 💌" />
      <Meta property="og:description" content="A friend thinks you'd be a great match for someone. Tap to see your vouch!" />
      <Meta property="og:image" content="https://minutes2match.com/og-vouch-invite.png" />
    </Head>

    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-[1440px] mx-auto px-4 md:px-6 h-20 md:h-28 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center z-50 -ml-2 md:ml-0">
           <NuxtImg format="webp" src="/logo-full.png" alt="minutes2match" class="h-20 md:h-28 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8 text-sm font-bold">
          <NuxtLink to="/" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Home</NuxtLink>
          <NuxtLink to="/vouch" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Vouch</NuxtLink>
          <NuxtLink to="/shoot-your-shot" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Shoot Your Shot</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-rose-500 dark:text-stone-300 dark:hover:text-rose-400 transition-colors">Pricing</NuxtLink>
        </div>

        <div class="flex items-center gap-3 md:gap-6">
          <NuxtLink to="/login" class="hidden md:block text-sm font-bold hover:underline decoration-2 underline-offset-4 dark:text-stone-200">
             MEMBER LOGIN
          </NuxtLink>
          <NuxtLink to="/vibe-check" class="hidden md:inline-flex group relative items-center overflow-hidden rounded-md border border-black dark:border-stone-600 bg-black dark:bg-stone-100 text-white dark:text-black px-6 py-3 focus:outline-none hover:bg-rose-500 dark:hover:bg-rose-500 hover:border-rose-500 dark:hover:border-rose-500 dark:hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
            <span class="text-xs font-bold uppercase tracking-widest">VIBE CHECK</span>
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
        <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-50" style="width: 100vw; height: 100vh;"></canvas>
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
        <canvas ref="confettiCanvas" class="fixed inset-0 pointer-events-none z-50" style="width: 100vw; height: 100vh;"></canvas>
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
const mobileMenuOpen = ref(false)

const loading = ref(true)
const fetchError = ref('')
const vouch = ref<any>({})
const responded = ref(false)
const accepted = ref(false)
const responding = ref(false)
const respondError = ref('')
const responseStatus = ref('')
const confettiCanvas = ref<HTMLCanvasElement | null>(null)

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

// Fetch vouch data
onMounted(async () => {
  try {
    const data = await $fetch(`/api/vouches/${token}`)
    vouch.value = data
    
    // Fire confetti if already matched
    if (vouch.value.status === 'matched') {
      nextTick(() => setTimeout(fireConfetti, 300))
    }
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

    if (result.status === 'matched') {
      nextTick(() => setTimeout(fireConfetti, 200))
    }
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
