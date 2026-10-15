<template>
  <div class="m2m-app letter-page min-h-screen overflow-x-clip bg-[#f7f7f7] text-[#393737] antialiased">
    <!-- ===== Sky header: the same clouds and blue as the match letter ===== -->
    <header class="relative isolate overflow-hidden bg-gradient-to-b from-[#f7f7f7] via-[#e9eff5] to-[#dde7f1] px-5 pb-20 pt-6 text-center sm:px-6 sm:pb-36">
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 z-0">
        <svg viewBox="0 0 440 230" class="about-cloud absolute -left-24 top-10 w-[270px] opacity-75 sm:-left-16 sm:top-16 sm:w-[390px]">
          <defs><filter id="about-cloud-left" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="8" /></filter></defs>
          <g fill="#fff" filter="url(#about-cloud-left)">
            <ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" />
            <circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /><circle cx="352" cy="144" r="47" />
          </g>
        </svg>
        <svg viewBox="0 0 500 250" class="about-cloud about-cloud-reverse absolute -right-28 top-24 w-[300px] opacity-70 sm:-right-20 sm:top-28 sm:w-[430px]">
          <defs><filter id="about-cloud-right" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="9" /></filter></defs>
          <g fill="#fff" filter="url(#about-cloud-right)">
            <ellipse cx="258" cy="173" rx="206" ry="57" /><circle cx="137" cy="144" r="59" /><circle cx="203" cy="105" r="82" />
            <circle cx="291" cy="85" r="91" /><circle cx="378" cy="113" r="80" /><circle cx="432" cy="151" r="57" />
          </g>
        </svg>
      </div>

      <nav class="relative z-10 mx-auto flex h-10 max-w-6xl items-center justify-between text-left" aria-label="Main">
        <NuxtLink to="/events" class="text-sm font-medium text-[#6c6862] hover:text-[#393737]">Events</NuxtLink>
        <NuxtLink to="/" aria-label="Minutes 2 Match home" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>
        <NuxtLink v-if="signedIn" to="/matches" class="rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[#393737] shadow-sm">Matches</NuxtLink>
        <NuxtLink v-else to="/login" class="rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[#393737] shadow-sm">Log in</NuxtLink>
      </nav>

      <div class="relative z-10">
        <span class="mt-14 inline-flex rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-[#393737] shadow-[0_4px_14px_rgba(57,77,100,0.08)] backdrop-blur sm:mt-20">Our story</span>
        <h1 class="font-display mx-auto mt-6 max-w-3xl text-balance text-[2.6rem] leading-[1.02] tracking-tight sm:text-7xl">Swiping wasn't it.</h1>
        <p class="mx-auto mt-5 max-w-xl text-pretty text-lg leading-snug text-[#6c6862] sm:mt-6 sm:text-xl">
          We started Minutes 2 Match for real-life connection, without the stress and fatigue that come with swiping.
        </p>
      </div>

      <!-- clouds, in the page's paper colour -->
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" class="pointer-events-none absolute inset-x-0 -bottom-1 -z-10 h-14 w-full sm:h-32" aria-hidden="true">
        <defs><filter id="about-cloud-edge" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <g fill="#f7f7f7" filter="url(#about-cloud-edge)">
          <ellipse cx="720" cy="215" rx="820" ry="70" />
          <circle cx="120" cy="190" r="90" /><circle cx="330" cy="175" r="100" /><circle cx="560" cy="195" r="85" />
          <circle cx="880" cy="180" r="100" /><circle cx="1110" cy="190" r="90" /><circle cx="1330" cy="175" r="100" />
        </g>
      </svg>
    </header>

    <main class="letter-flow relative px-5 pb-10 sm:px-6">
      <div class="mx-auto max-w-[42rem]">
        <!-- ===== I. Why we started ===== -->
        <section v-reveal class="pt-6 sm:pt-12">
          <div class="rv-item text-center">
            <LoveBirds scene="why" class="section-art mx-auto mb-2 w-56 sm:mb-6 sm:w-96" />
            <p class="text-base sm:text-2xl">Where it began</p>
            <h2 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight sm:text-[4rem]">Why we started</h2>
          </div>
          <div class="mt-7 space-y-5 text-base leading-[1.7] sm:mt-10 sm:text-xl sm:leading-[1.6]">
            <p class="rv-item" style="--i: 1">
              I was tired of looking for connection in the wrong places. The dating apps didn't help: they showed
              me photos and a line or two, and none of the things that actually make two people work.
            </p>
            <p class="rv-item" style="--i: 2">
              Swiping wasn't it. We wanted real-life connection, without the stress and fatigue that come with swiping.
              So Minutes 2 Match started as a <NuxtLink to="/events" class="underline decoration-[#393737]/30 underline-offset-4 hover:text-[#ed1c24]">speed dating event</NuxtLink>:
              a room full of people meeting face to face, a few minutes at a time.
            </p>
            <p class="rv-item" style="--i: 3">
              Those evenings showed us how much a real conversation can do. Now we bring that feeling to every week:
              one thoughtful introduction, based on what matters to you, from faith and family to children.
              Starting in <strong class="font-semibold">Accra</strong> and <strong class="font-semibold">Nairobi</strong>.
            </p>
            <div class="rv-item flex items-center gap-4 pt-2" style="--i: 4">
              <img src="/founder-maxwell.webp" alt="Maxwell Cofie" width="640" height="800" class="h-16 w-16 shrink-0 rounded-full object-cover object-[50%_30%] shadow-[0_8px_20px_rgba(57,55,55,0.14)] ring-4 ring-white sm:h-20 sm:w-20" loading="lazy" decoding="async" />
              <p>
                <span class="font-display block text-[1.5rem] leading-tight sm:text-[1.75rem]">Maxwell Cofie</span>
                <span class="text-sm text-[#817a72] sm:text-base">Founder, Minutes 2 Match</span>
              </p>
            </div>
          </div>
        </section>

        <!-- ===== II. How it works ===== -->
        <section id="how-it-works" v-reveal class="mt-20 scroll-mt-6 sm:mt-32">
          <div class="rv-item text-center">
            <LoveBirds scene="lineup" class="section-art mx-auto mb-2 w-56 sm:mb-6 sm:w-96" />
            <p class="text-base sm:text-2xl">Simple, on purpose</p>
            <h2 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight sm:text-[4rem]">How it works</h2>
          </div>
          <ol class="relative mt-9 space-y-9 sm:mt-14 sm:space-y-12">
            <li v-for="(step, i) in STEPS" :key="step.title" class="rv-item grid grid-cols-[2.75rem_1fr] gap-4 sm:grid-cols-[3.5rem_1fr] sm:gap-6" :style="{ '--i': i + 1 }">
              <span class="font-display flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-[0_6px_18px_rgba(57,77,100,0.08)] ring-1 ring-black/[0.04] sm:h-14 sm:w-14 sm:text-2xl">{{ i + 1 }}</span>
              <div>
                <h3 class="font-display text-[1.5rem] leading-tight sm:text-[2rem]">{{ step.title }}</h3>
                <p class="mt-2 text-base leading-[1.7] text-[#6c6862] sm:text-lg">{{ step.text }}</p>
              </div>
            </li>
          </ol>
          <p class="rv-item mt-10 text-center text-base text-[#6c6862] sm:text-lg" style="--i: 5">
            Rather meet people in person first? <NuxtLink to="/events" class="font-semibold text-[#393737] underline decoration-[#393737]/30 underline-offset-4 hover:text-[#ed1c24]">Come to one of our events.</NuxtLink>
          </p>
          <p class="rv-item mx-auto mt-6 flex max-w-lg items-start justify-center gap-2.5 text-center text-sm leading-relaxed text-[#817a72] sm:text-base" style="--i: 6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <span>Your answers are used to find and introduce your match, and we never sell your data. <NuxtLink to="/privacy" class="underline underline-offset-4 hover:text-[#393737]">Privacy policy</NuxtLink></span>
          </p>
        </section>

        <!-- ===== III. What we're hoping to achieve ===== -->
        <section v-reveal class="mt-20 sm:mt-32">
          <div class="rv-item text-center">
            <p class="text-base sm:text-2xl">Where we're going</p>
            <h2 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight sm:text-[4rem]">What we're hoping to achieve</h2>
          </div>
          <p class="rv-item mt-7 text-base leading-[1.7] sm:mt-10 sm:text-xl sm:leading-[1.6]" style="--i: 1">
            We measure ourselves by one thing: how many introductions turn into something real.
            Not the hours you spend in an app, and not how many people you swipe past.
          </p>
          <ul class="mt-7 space-y-5 sm:mt-9">
            <li v-for="(goal, i) in GOALS" :key="goal.title" class="rv-item flex gap-4" :style="{ '--i': i + 2 }">
              <svg viewBox="0 0 24 24" fill="currentColor" class="mt-1.5 h-5 w-5 shrink-0 text-[#ed1c24]" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              <p class="text-base leading-[1.7] sm:text-xl sm:leading-[1.6]">
                <strong class="font-semibold">{{ goal.title }}</strong> {{ goal.text }}<template v-for="r in goal.refs || []" :key="r"><sup><a :href="`#ref-${r}`" class="ml-0.5 font-medium text-[#c4121a] no-underline hover:underline">[{{ r }}]</a></sup></template>
              </p>
            </li>
          </ul>
        </section>

        <!-- ===== Interlude ===== -->
        <div v-reveal class="mt-20 text-center sm:mt-32">
          <figure class="rv-item story-art mx-auto w-[min(66vw,17rem)] sm:w-[30rem]">
            <img src="/lovebirds.webp" alt="" width="994" height="975" loading="lazy" decoding="async" class="block h-auto w-full" />
          </figure>
          <p class="rv-item mt-4 text-base sm:mt-8 sm:text-2xl" style="--i: 1">That's why we built</p>
          <h2 class="rv-item relative mx-auto mt-2 block h-12 w-[213px] overflow-hidden sm:h-[4.5rem] sm:w-[319px]" style="--i: 2">
            <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[154px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[231px]" />
          </h2>
        </div>

        <!-- ===== Invitation ===== -->
        <div v-reveal class="mt-14 sm:mt-20">
          <div class="rv-item flex flex-col items-center gap-6 rounded-[2rem] bg-white p-7 text-center shadow-[0_10px_40px_rgba(57,55,55,0.06)] sm:p-10">
            <div>
              <p class="font-display text-3xl leading-tight tracking-tight sm:text-4xl">If this sounds like you, we'd love to meet you.</p>
              <p class="mt-2 text-base text-[#6c6862]">The Vibe Check is free and takes about five minutes.</p>
            </div>
            <NuxtLink to="/vibe-check" class="btn-solid grain grain-strong w-full px-8 py-4 text-base sm:w-auto sm:text-lg">Take the Vibe Check <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </div>

        <!-- ===== References ===== -->
        <section class="mt-16 border-t border-black/[0.08] pt-6 sm:mt-20" aria-labelledby="references">
          <h2 id="references" class="!font-sans text-sm font-semibold !tracking-normal text-[#6c6862]">References</h2>
          <ol class="mt-3 space-y-2 text-sm leading-relaxed text-[#817a72]">
            <li v-for="ref in REFERENCES" :id="`ref-${ref.n}`" :key="ref.n" class="scroll-mt-6">
              [{{ ref.n }}] {{ ref.text }}
              <a :href="ref.url" target="_blank" rel="noopener" class="underline decoration-black/20 underline-offset-2 hover:text-[#393737]">{{ ref.source }}</a>
            </li>
          </ol>
        </section>
      </div>
    </main>

    <!-- ===== Footer ===== -->
    <footer class="px-5 pb-10 pt-6 sm:px-6">
      <div class="mx-auto flex max-w-[42rem] flex-col items-center gap-4 border-t border-black/[0.06] pt-8 text-sm text-[#817a72] sm:flex-row sm:justify-between">
        <span>© {{ new Date().getFullYear() }} Minutes 2 Match</span>
        <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
          <NuxtLink to="/" class="hover:text-[#393737]">Home</NuxtLink>
          <NuxtLink to="/events" class="hover:text-[#393737]">Events</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-[#393737]">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-[#393737]">Privacy</NuxtLink>
          <a href="mailto:hello@minutes2match.com" class="hover:text-[#393737]">Contact</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'About · Minutes 2 Match',
  description: 'Why we started Minutes 2 Match: one thoughtful introduction a week, built around what matters to you, starting in Accra and Nairobi.',
  ogTitle: 'Why we started Minutes 2 Match',
  ogDescription: 'Swiping wasn\'t it: one thoughtful introduction a week, built around what matters to you.',
  ogType: 'website',
  ogUrl: 'https://minutes2match.com/about'
})
useHead({ link: [{ rel: 'canonical', href: 'https://minutes2match.com/about' }] })

const signedIn = computed(() => !!useSupabaseUser().value)

const STEPS = [
  {
    title: 'Take the Vibe Check',
    text: 'Five minutes on what you want, how you love and what you believe: children, faith, family, money, and the values you look for in a partner.'
  },
  {
    title: 'Opt in for the week',
    text: "Matching is weekly and free. Tell us you're in, and you're in the running for Sunday. Busy week? Skip it."
  },
  {
    title: 'Meet one person, every Sunday',
    text: "We compare what you both said and introduce you to one compatible person, with a letter on why you might click: where you line up, where you differ, and a few date ideas for when you're both free."
  },
  {
    title: 'Tell us how it went',
    text: 'A quick tap after you meet helps us make every introduction after it a little better.'
  }
]

const GOALS: { title: string; text: string; refs?: number[] }[] = [
  { title: 'Make every introduction count.', text: "One person you're genuinely curious about is worth more than a hundred you'll never message." },
  {
    title: 'Help fewer people feel alone.',
    text: 'Close relationships, more than money or fame, keep us happy and healthy as we age, and the World Health Organization now treats social connection as a global health priority.',
    refs: [1, 2]
  },
  { title: 'Build for where we live.', text: 'Accra and Nairobi first, with questions and date ideas that fit life here, and more cities as we grow.' },
  { title: 'Make dating feel human again.', text: 'Kind, intentional and safe, with a real team that reads your feedback and keeps the community respectful.' }
]

const REFERENCES = [
  {
    n: 1,
    text: 'Harvard Study of Adult Development, running since 1938. See Waldinger & Schulz, The Good Life (2023), and',
    source: 'Harvard Gazette, "Over nearly 80 years, Harvard study has been showing how to live a healthy and happy life" (2017).',
    url: 'https://news.harvard.edu/gazette/story/2017/04/over-nearly-80-years-harvard-study-has-been-showing-how-to-live-a-healthy-and-happy-life/'
  },
  {
    n: 2,
    text: 'World Health Organization,',
    source: 'Commission on Social Connection.',
    url: 'https://www.who.int/groups/commission-on-social-connection'
  }
]

// Sections rise into view as you scroll (same as the match letter; styles in app-theme.css)
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
let observer: IntersectionObserver | null = null
const vReveal = {
  mounted(el: HTMLElement) {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return
    el.classList.add('rv')
    observer ||= new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('rv-in')
        observer!.unobserve(entry.target)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    observer.observe(el)
  },
  unmounted(el: HTMLElement) {
    observer?.unobserve(el)
  }
}
</script>

<style scoped>
.about-cloud {
  animation: about-cloud-drift 32s ease-in-out infinite alternate;
  will-change: transform;
}
.about-cloud-reverse {
  animation-duration: 40s;
  animation-direction: alternate-reverse;
}
@keyframes about-cloud-drift {
  from { transform: translate3d(-1.25rem, 0, 0) scale(0.96); }
  to { transform: translate3d(2rem, 0.75rem, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .about-cloud { animation: none; }
}
/* As on the landing page: the paper melts into the page; only the ink and watercolour stay */
.story-art img {
  mix-blend-mode: multiply;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 72%, transparent 100%), linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 72%, transparent 100%), linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%);
  mask-composite: intersect;
}
</style>
