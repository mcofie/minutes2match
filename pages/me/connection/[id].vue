<template>
  <main class="m2m-app letter-page relative min-h-screen min-h-dvh overflow-x-clip bg-[#f7f7f7] text-[#393737] print:min-h-0 print:bg-none print:bg-white">
    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.04] blur-3xl print:hidden"></div>

    <!-- Header (same as the app layout): centred logo, tabs on the right on desktop -->
    <nav class="sticky top-0 z-[60] border-b border-black/[0.04] bg-white/85 backdrop-blur-md print:hidden">
      <div class="relative mx-auto flex h-14 max-w-6xl items-center justify-end px-4 sm:h-16 sm:px-6">
        <NuxtLink to="/matches" aria-label="Minutes 2 Match" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity hover:opacity-80 sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>

        <div class="hidden items-center gap-1 rounded-full bg-[#f1efec] p-1 md:flex">
          <NuxtLink to="/matches" aria-current="page" class="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#393737] pl-3 pr-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(57,55,55,0.18)]">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Matches
          </NuxtLink>
          <NuxtLink to="/me" class="inline-flex h-9 items-center justify-center gap-2 rounded-full pl-3 pr-4 text-sm font-semibold text-[#6c6862] transition-colors hover:text-[#393737]">
            <span class="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#e7e4e0] ring-2 ring-white">
                <img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 96)" alt="" decoding="async" class="h-full w-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#6c6862]">{{ currentUser?.display_name?.charAt(0) || '?' }}</span>
            </span>
            Profile
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="relative z-10 mx-auto hidden max-w-6xl px-4 pt-5 sm:block sm:px-6 sm:pt-7 print:hidden">
      <NuxtLink to="/matches" class="inline-flex items-center gap-1.5 rounded-full py-2 text-sm font-medium text-[#6c6862] transition-colors hover:text-[#393737]">
        <span aria-hidden="true">←</span> Back to matches
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <template v-if="loading">
      <SkeletonMatchLetter />
      <p class="sr-only" role="status">Loading your match…</p>
    </template>

    <!-- Error State -->
    <div v-else-if="error" class="relative z-10 mx-auto max-w-md px-4 py-20 text-center">
      <h2 class="font-display mb-2 text-3xl text-[#393737]">Connection not found</h2>
      <p class="mb-6 text-[#6c6862]">{{ error }}</p>
      <NuxtLink to="/matches" class="btn-solid grain grain-strong px-7 py-3.5 text-base">Back to matches</NuxtLink>
    </div>

    <!-- Connection Content -->
    <div v-else class="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-0 sm:px-6 sm:pb-32 sm:pt-6 print:max-w-none print:p-0">
      <div class="mx-auto max-w-3xl space-y-4 sm:space-y-6 print:max-w-none print:space-y-0">

          <!-- ===== The match brief, as a printable love letter ===== -->
          <div v-if="matchProfile" class="sticky top-14 z-40 -mx-4 flex items-center justify-between gap-3 bg-[#f7f7f7]/85 px-4 py-2 backdrop-blur-md sm:py-2.5 sm:top-16 sm:mx-0 sm:rounded-full sm:px-2 print:hidden">
            <div class="flex min-w-0 items-center gap-2">
            <NuxtLink to="/matches" aria-label="Back to matches" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#393737] ring-1 ring-black/10 sm:hidden">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </NuxtLink>
            <button type="button" class="inline-flex min-w-0 items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa]" @click="showProfile = true">
              <span class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f4f3f1]">
                <img v-if="matchProfile.photo_url" :src="avatarUrl(matchProfile.photo_url, 48)" alt="" decoding="async" class="h-full w-full object-cover" />
                <span v-else class="font-display flex h-full w-full items-center justify-center text-sm text-[#9b9690]">{{ theirFirstName.charAt(0) }}</span>
              </span>
              <span class="truncate">{{ theirFirstName }}'s profile</span>
            </button>
            </div>
            <button type="button" class="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2.5 text-sm font-medium text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa] sm:px-4" @click="printLetter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              <span class="sr-only sm:not-sr-only">Print or save as PDF</span>
            </button>
          </div>

          <article v-if="matchProfile" class="love-letter letter-flow relative text-[#393737]">
            <!-- Sky header -->
            <header class="relative isolate mx-[calc(50%-50vw)] overflow-hidden bg-gradient-to-b from-[#f7f7f7] via-[#e9eff5] to-[#dde7f1] px-5 pb-16 pt-6 text-center sm:px-6 sm:pb-32 sm:pt-16 print:mx-0">
              <span class="inline-flex rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-[#393737] shadow-[0_4px_14px_rgba(57,77,100,0.08)] backdrop-blur">Your match brief</span>

              <div class="mt-6 flex items-center justify-center sm:mt-8" aria-hidden="true">
                <div class="h-20 w-20 overflow-hidden rounded-full bg-[#eef1f5] ring-4 ring-white sm:h-24 sm:w-24">
                  <img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 96)" alt="" decoding="async" class="h-full w-full object-cover" />
                  <span v-else class="font-display flex h-full w-full items-center justify-center text-3xl text-[#9b9690]">{{ myFirstName.charAt(0) }}</span>
                </div>
                <div class="-ml-5 h-20 w-20 overflow-hidden rounded-full bg-[#eef1f5] ring-4 ring-white sm:h-24 sm:w-24">
                  <img v-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 96)" alt="" decoding="async" fetchpriority="high" class="h-full w-full object-cover" :class="(match?.unlocked || match?.currentUserPaid) ? '' : 'scale-110 blur-[6px]'" />
                  <span v-else class="font-display flex h-full w-full items-center justify-center text-3xl text-[#9b9690]">?</span>
                </div>
              </div>

              <h2 class="font-display mx-auto mt-5 text-[2.5rem] leading-none sm:mt-6 tracking-tight text-[#393737] sm:text-7xl">{{ matchScoreValue }}% compatible.</h2>
              <p class="mx-auto mt-3 max-w-md text-base leading-snug text-[#6c6862] sm:mt-5 sm:text-xl">
                {{ matchTier.tier }}, based on your Vibe Check, what you're each looking for and your profiles.
              </p>
              <p class="mt-3 text-sm text-[#9b9690]">
                <template v-if="matchedOn">Matched on {{ matchedOn }} · </template>For {{ myFirstName }}
              </p>

              <!-- clouds, in the letter's paper colour -->
              <svg viewBox="0 0 1440 220" preserveAspectRatio="none" class="pointer-events-none absolute inset-x-0 -bottom-1 -z-10 h-14 w-full sm:h-32" aria-hidden="true">
                <defs><filter id="letter-cloud" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="8" /></filter></defs>
                <g fill="#f7f7f7" filter="url(#letter-cloud)">
                  <ellipse cx="720" cy="215" rx="820" ry="70" />
                  <circle cx="120" cy="190" r="90" /><circle cx="330" cy="175" r="100" /><circle cx="560" cy="195" r="85" />
                  <circle cx="880" cy="180" r="100" /><circle cx="1110" cy="190" r="90" /><circle cx="1330" cy="175" r="100" />
                </g>
              </svg>
            </header>

            <!-- Letter body -->
            <div class="relative pb-4 pt-5 sm:pb-6 sm:pt-12">
            <div class="relative mx-auto max-w-[42rem]">
              <!-- Opening -->
              <div v-reveal class="space-y-4 sm:space-y-5 text-base leading-[1.65] sm:text-xl sm:leading-[1.6]">
                <p style="--i: 0" class="rv-item font-display pb-0.5 text-[1.75rem] leading-[1.1] tracking-tight sm:text-[2.6rem]">Dear {{ myFirstName }},</p>
                <p class="rv-item" style="--i: 1">
                  We've found someone we think you'll really like.
                  <template v-if="theirName !== 'Them'">Their name is <strong class="font-semibold">{{ theirName }}</strong>, and on paper</template>
                  <template v-else>We can't tell you their name just yet, but on paper</template>
                  the two of you are <strong class="font-semibold">{{ matchScoreValue }}% compatible</strong>. That's what we call {{ matchTier.tier.toLowerCase() }}.
                </p>
                <p v-if="tldr.length > 1" class="rv-item" style="--i: 2">{{ tldr.slice(1).join(' ') }}</p>
                <p class="rv-item" style="--i: 3">We didn't take this lightly, so here's everything we saw. Judge for yourself.</p>
              </div>

              <!-- The headline numbers -->
              <div v-if="headlineStats.length" v-reveal class="mt-8 grid divide-x sm:mt-12 divide-[#e5e2de] border-y border-[#e5e2de]" :class="headlineStats.length === 3 ? 'grid-cols-3' : headlineStats.length === 2 ? 'grid-cols-2' : 'grid-cols-1'">
                <div v-for="(stat, i) in headlineStats" :key="stat.label" class="rv-item px-2 py-5 text-center sm:py-9" :style="{ '--i': i }">
                  <p class="font-display text-[2.1rem] leading-none tabular-nums text-[#393737] sm:text-6xl"><span v-count="stat.value"></span><span class="text-[#c4121a]">{{ stat.suffix }}</span></p>
                  <p class="mx-auto mt-2 max-w-[9rem] text-xs sm:mt-3 leading-snug text-[#6c6862] sm:text-base">{{ stat.label }}</p>
                </div>
              </div>

              <!-- I. Why we think it works -->
              <section v-if="briefNum('why')" v-reveal class="letter-section mt-14 sm:mt-28">
                <div class="rv-item text-center">
                  <LetterVignette scene="dawn" class="section-art mx-auto mb-3 w-36 sm:mb-8 sm:w-72 print:hidden" />
                  <p class="text-base text-[#393737] sm:text-2xl">The short version</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">Why we think it works</h3>
                </div>
                <figure v-if="match?.ai_analysis" class="rv-item mt-6 sm:mt-9" style="--i: 1">
                  <blockquote class="font-display text-[1.45rem] leading-[1.25] tracking-tight sm:text-[2.4rem]">“{{ stripEmoji(match.ai_analysis) }}”</blockquote>
                </figure>
                <p v-if="matchReasons.length" style="--i: 2" class="rv-item mt-6 text-base leading-[1.65] sm:text-xl sm:leading-[1.6]">
                  What stood out most: <span v-for="(r, i) in matchReasons" :key="r">{{ r }}<template v-if="i < matchReasons.length - 2">, </template><template v-else-if="i === matchReasons.length - 2"> and </template></span>.
                </p>
              </section>

              <!-- II. Where you line up -->
              <section v-if="briefNum('lineup')" v-reveal class="letter-section mt-14 sm:mt-28">
                <div class="rv-item text-center">
                  <LetterVignette scene="meadow" class="section-art mx-auto mb-3 w-36 sm:mb-8 sm:w-72 print:hidden" />
                  <p class="text-base text-[#393737] sm:text-2xl">By the numbers</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">Where you line up</h3>
                </div>
                <p class="rv-item mx-auto mt-2.5 max-w-xl text-center sm:mt-4 text-base leading-[1.65] text-[#6c6862] sm:text-xl sm:leading-[1.6]" style="--i: 1">Your {{ matchScoreValue }}% is made of six parts. Here's what each one earned.</p>

                <!-- at a glance -->
                <div v-if="lineupHighlights" class="rv-item mt-5 flex flex-wrap justify-center gap-2" style="--i: 2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-[#efece8] px-3 py-1.5 text-sm text-[#6c6862]"><span class="font-medium text-[#393737]">Strongest</span> · {{ lineupHighlights.best }}</span>
                  <span v-if="lineupHighlights.grow" class="inline-flex items-center gap-1.5 rounded-full bg-[#efece8] px-3 py-1.5 text-sm text-[#6c6862]"><span class="font-medium text-[#393737]">Room to grow</span> · {{ lineupHighlights.grow }}</span>
                </div>

                <!-- one row per part: name and why, score, and a thick track like the Vibe Check sliders -->
                <dl class="mt-5 text-left sm:mt-7">
                  <div v-for="(bar, i) in evidenceBars" :key="bar.label" class="rv-item border-b border-black/[0.08] py-4 sm:py-5" :style="{ '--i': i + 3 }">
                    <div>
                      <div class="flex items-start justify-between gap-3">
                        <dt class="min-w-0">
                          <span class="block text-[15px] font-medium leading-snug text-[#393737]">{{ bar.label }}</span>
                          <span class="block text-xs leading-snug text-[#9b9690]">{{ bar.hint }}</span>
                        </dt>
                        <dd class="flex shrink-0 items-center gap-2">
                          <span class="rounded-full bg-[#efece8] px-2 py-0.5 text-[11px] font-medium text-[#6c6862]">{{ BAR_WORD[barTone(bar)] }}</span>
                          <span class="text-[15px] font-semibold tabular-nums text-[#393737]">{{ bar.value }}<span class="font-normal text-[#b5b0aa]">/{{ bar.max }}</span></span>
                        </dd>
                      </div>
                      <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-[#e9e6e2]" role="meter" :aria-valuenow="bar.value" aria-valuemin="0" :aria-valuemax="bar.max" :aria-label="bar.label">
                        <div class="bar-fill h-full rounded-full bg-[#393737]" :style="{ width: `${(bar.value / bar.max) * 100}%`, '--i': i + 3 }"></div>
                      </div>
                    </div>
                  </div>
                </dl>
              </section>

              <!-- III. What you share -->
              <section v-if="briefNum('share')" v-reveal class="letter-section mt-14 sm:mt-28">
                <div class="rv-item text-center">
                  <LetterVignette scene="tree" class="section-art mx-auto mb-3 w-36 sm:mb-8 sm:w-72 print:hidden" />
                  <p class="text-base text-[#393737] sm:text-2xl">Common ground</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">What you share</h3>
                </div>
                <ul class="mt-5 space-y-3 text-base leading-relaxed sm:text-xl sm:leading-[1.6]">
                  <li v-for="(f, i) in sharedFacts" :key="f.text" class="rv-item flex gap-4" :style="{ '--i': i + 1 }"><span class="fact-rule mt-[0.8em] h-px w-4 shrink-0 bg-[#c4121a]" aria-hidden="true"></span><span>{{ f.text }}</span></li>
                </ul>
              </section>

              <!-- IV. In your own words -->
              <section v-if="briefNum('words')" v-reveal class="letter-section mt-14 sm:mt-28">
                <div class="rv-item text-center">
                  <LetterVignette scene="night" class="section-art mx-auto mb-3 w-36 sm:mb-8 sm:w-72 print:hidden" />
                  <p class="text-base text-[#393737] sm:text-2xl">Side by side</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">In your own words</h3>
                </div>
                <p class="rv-item mx-auto mt-2.5 max-w-xl text-center sm:mt-4 text-base leading-[1.65] text-[#6c6862] sm:text-xl sm:leading-[1.6]" style="--i: 1">
                  You both answered the same Vibe Check. {{ answerSummary.aligned }} of {{ answerSummary.total }} answers line up or complement each other.
                </p>
                <!-- key for the verdict icons -->
                <ul class="rv-item mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-[#6c6862]" style="--i: 2" aria-label="What the icons mean">
                  <li v-for="k in RELATION_KEY" :key="k.id" class="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] text-[#9b9690]" aria-hidden="true" v-html="RELATION_ICON[k.id]"></svg>{{ k.label }}
                  </li>
                </ul>
                <!-- Side by side, as a table on the page: one block per chapter, a row per topic.
                     Desktop: Topic | You | Them | Verdict columns. Phones: each row stacks. -->
                <div class="mt-8 space-y-10 sm:mt-12 sm:space-y-12">
                  <div v-for="chapter in answerChapters" :key="chapter.id" v-reveal class="answers-table text-left">
                    <!-- chapter title -->
                    <div class="rv-item flex items-center justify-between gap-4 pb-3">
                      <h4 class="font-display text-[1.35rem] leading-tight text-[#393737] sm:text-[1.6rem]">{{ chapter.title }}</h4>
                    </div>

                    <!-- column headings (desktop) -->
                    <div class="hidden grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1fr)_3rem] items-center gap-4 border-b border-black/[0.08] py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#9b9690] sm:grid" aria-hidden="true">
                      <span>Topic</span>
                      <span class="flex items-center gap-1.5"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#393737] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span>You</span>
                      <span class="flex items-center gap-1.5"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#ed1c24] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span>{{ theirFirstName }}</span>
                      <span class="sr-only">Verdict</span>
                    </div>

                    <ul>
                      <li
                        v-for="(pair, i) in chapter.pairs"
                        :key="pair.key"
                        class="rv-item border-t border-black/[0.08] py-3.5 sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,1fr)_3rem] sm:items-center sm:gap-4"
                        :class="i === 0 ? 'border-t-0' : ''"
                        :style="{ '--i': i + 1 }"
                      >
                        <!-- topic: icon tile + name (+ verdict on phones) -->
                        <div class="flex items-center gap-3">
                          <p class="min-w-0 flex-1 text-[15px] font-medium leading-snug text-[#393737]">{{ pair.label }}</p>
                          <span class="shrink-0 text-[#9b9690] sm:hidden" :title="relationLabel(pair)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true" v-html="RELATION_ICON[pair.relation]"></svg><span class="sr-only">{{ relationLabel(pair) }}</span></span>
                        </div>

                        <!-- scale: one track across both answer columns -->
                        <div v-if="pair.type === 'scale'" class="mt-3 sm:col-span-2 sm:mt-0">
                          <div class="relative h-5">
                            <div class="absolute inset-x-[9px] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#efece8]"></div>
                            <span class="bar-fill absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#ed1c24]/25" :style="{ left: scaleLeft(Math.min(pair.a!, pair.b!)), width: scaleSpan(pair), '--i': i + 1 }"></span>
                            <span v-if="pair.a !== pair.b" class="dot-pop absolute top-1/2 -translate-x-1/2 -translate-y-1/2" :style="{ left: scaleLeft(pair.a!) }" :title="`You: ${pair.a} of 7`"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#393737] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span></span>
                            <span class="dot-pop absolute top-1/2 -translate-x-1/2 -translate-y-1/2" :style="{ left: scaleLeft(pair.b!) }" :title="pair.a === pair.b ? `Both of you: ${pair.a} of 7` : `${theirFirstName}: ${pair.b} of 7`"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#ed1c24] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span></span>
                          </div>
                          <div class="mt-1 flex justify-between gap-3 text-[11px] leading-tight text-[#9b9690]">
                            <span>{{ pair.minLabel }}</span>
                            <span class="text-right">{{ pair.maxLabel }}</span>
                          </div>
                        </div>

                        <!-- same answer: across both columns, said once -->
                        <p v-else-if="pair.mine === pair.theirs" class="mt-2 flex items-center gap-2 text-sm leading-snug text-[#393737] sm:col-span-2 sm:mt-0">
                          <span class="flex shrink-0 -space-x-1"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#393737] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#ed1c24] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span></span>
                          <span class="min-w-0"><span class="text-[#9b9690]">Both · </span>{{ pair.mine }}</span>
                        </p>

                        <!-- different answers: one per column -->
                        <template v-else>
                          <p class="mt-2 flex items-start gap-2 text-sm leading-snug text-[#393737] sm:mt-0">
                            <span class="sm:hidden"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#393737] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span></span>
                            <span class="min-w-0"><span class="sr-only">You: </span>{{ pair.mine }}</span>
                          </p>
                          <p class="mt-1.5 flex items-start gap-2 text-sm leading-snug text-[#393737] sm:mt-0">
                            <span class="sm:hidden"><span class="block h-[18px] w-[18px] shrink-0 overflow-hidden rounded-full bg-[#ed1c24] ring-2 ring-[#f7f7f7]" aria-hidden="true"><img v-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 18)" alt="" decoding="async" class="h-full w-full object-cover" /></span></span>
                            <span class="min-w-0"><span class="sr-only">{{ theirFirstName }}: </span>{{ pair.theirs }}</span>
                          </p>
                        </template>

                        <!-- verdict (desktop column) -->
                        <span class="hidden justify-self-end text-[#9b9690] sm:inline-flex" :title="relationLabel(pair)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true" v-html="RELATION_ICON[pair.relation]"></svg><span class="sr-only">{{ relationLabel(pair) }}</span></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <!-- V. Worth talking about -->
              <section v-if="briefNum('talk')" v-reveal class="letter-section mt-14 sm:mt-28">
                <div class="rv-item text-center">
                  <LetterVignette scene="sunset" class="section-art mx-auto mb-3 w-36 sm:mb-8 sm:w-72 print:hidden" />
                  <p class="text-base text-[#393737] sm:text-2xl">Room to grow</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">Worth talking about</h3>
                </div>
                <p class="rv-item mx-auto mt-2.5 max-w-xl text-center sm:mt-4 text-base leading-[1.65] sm:text-xl sm:leading-[1.6]" style="--i: 1">No two people are identical, and that's a good thing. These make wonderful first-date conversation:</p>
                <p v-for="(t, i) in talkingPoints" :key="t" class="rv-item mt-3 text-base leading-[1.7] sm:text-xl sm:leading-[1.6]" :style="{ '--i': i + 2 }">{{ t }}</p>
              </section>

              <!-- Interlude, like Popcorn's "That's why we built" -->
              <div v-if="briefNum('dates')" v-reveal class="mt-16 text-center sm:mt-32">
                <LetterVignette scene="meet" class="rv-item section-art mx-auto w-36 sm:w-72" />
                <p class="rv-item mt-4 text-base text-[#393737] sm:mt-8 sm:text-2xl" style="--i: 1">That's why we think you two should</p>
                <p class="rv-item mt-1 text-[3rem] font-semibold leading-none tracking-[-0.05em] text-[#393737] sm:text-[4.5rem]" style="--i: 2">meet.</p>
              </div>

              <!-- VI. A few date ideas: three cards, each with a little scene, why it fits, when and where -->
              <section v-if="briefNum('dates')" v-reveal class="letter-section mt-14 sm:mt-24">
                <div class="rv-item text-center">
                  <p class="text-base text-[#393737] sm:text-2xl">Where to start</p>
                  <h3 class="font-display mt-1.5 text-[2rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[4rem]">A few date ideas</h3>
                </div>
                <p class="rv-item mx-auto mt-2.5 max-w-xl text-center text-base leading-[1.65] text-[#6c6862] sm:mt-4 sm:text-xl sm:leading-[1.6]" style="--i: 1">Picked for you two from what you share, where you live and when you're both free. Swipe to see them all.</p>

                <!-- Swipe through: cards bleed to the screen edge and snap into place; details open per card -->
                <ol class="no-scrollbar -mx-4 -mb-6 mt-6 flex items-stretch snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-10 pt-1 sm:-mx-6 sm:mt-9 sm:scroll-px-6 sm:px-6 sm:[mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)] print:mx-0 print:flex-wrap print:overflow-visible print:px-0" aria-label="Date ideas">
                  <li
                    v-for="(idea, i) in dateIdeas"
                    :key="idea.id"
                    class="rv-item flex w-[min(78vw,17rem)] shrink-0 snap-start flex-col rounded-[1.5rem] bg-white p-4 text-left ring-1 ring-black/5 sm:w-[18rem] sm:p-5"
                    :class="i === 0 ? 'shadow-[0_14px_34px_rgba(57,77,100,0.10)]' : 'shadow-[0_6px_18px_rgba(57,77,100,0.05)]'"
                    :style="{ '--i': i + 2 }"
                  >
                    <div class="flex flex-wrap gap-1.5">
                      <span v-if="i === 0" class="inline-flex items-center gap-1 rounded-full bg-[#fdecec] px-2 py-0.5 text-[11px] font-semibold text-[#c4121a]">
                        <svg viewBox="0 0 24 24" class="h-2.5 w-2.5" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" /></svg>
                        Top pick
                      </span>
                      <span class="rounded-full bg-[#f4f2ef] px-2 py-0.5 text-[11px] font-medium text-[#6c6862]">{{ IDEA_KIND[idea.kind] || 'Date' }}</span>
                    </div>
                    <h4 class="font-display mt-2.5 text-[1.15rem] leading-[1.2] text-[#393737] sm:text-[1.3rem]">{{ idea.title }}</h4>

                    <!-- Collapsible middle: what to do and why it fits -->
                    <button
                      type="button"
                      class="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[#6c6862] transition-colors hover:text-[#393737] print:hidden"
                      :aria-expanded="openIdeas.has(idea.id)"
                      :aria-controls="`idea-${idea.id}`"
                      @click="toggleIdea(idea.id)"
                    >
                      {{ openIdeas.has(idea.id) ? 'Less' : 'Why it fits' }}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 transition-transform duration-200" :class="{ 'rotate-180': openIdeas.has(idea.id) }" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    <div :id="`idea-${idea.id}`" class="grid transition-[grid-template-rows] duration-300 ease-out print:!grid-rows-[1fr]" :class="openIdeas.has(idea.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
                      <div class="min-h-0 overflow-hidden" :inert="!openIdeas.has(idea.id)">
                        <p class="pt-2 text-sm leading-relaxed text-[#6c6862]">{{ idea.desc }}</p>
                        <ul class="mt-2.5 space-y-1">
                          <li v-for="w in idea.why" :key="w" class="flex items-start gap-1.5 text-[13px] leading-snug text-[#393737]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#ed1c24]" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                            {{ w }}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="min-h-3 flex-1" aria-hidden="true"></div>

                    <div v-if="idea.when || idea.where" class="mt-auto space-y-1 border-t border-black/[0.06] pt-3 text-[13px] text-[#6c6862]">
                      <p v-if="idea.when" class="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-3.5 w-3.5 shrink-0 text-[#9b9690]" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        {{ idea.when }}
                      </p>
                      <p v-if="idea.where" class="flex min-w-0 items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0 text-[#9b9690]" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                        <span class="truncate">{{ idea.where }}</span>
                      </p>
                    </div>
                  </li>
                </ol>
              </section>

            <!-- When you're both free -->
            <section v-if="match?.unlocked || match?.currentUserPaid" v-reveal class="letter-section mt-12 sm:mt-16 print:hidden">
              <div class="rv-item text-center">
                <h3 class="font-display text-[1.75rem] leading-tight tracking-tight text-[#393737] sm:text-[2.25rem]">When you're both free</h3>
                <p v-if="mutualAvailability.length > 0" class="mt-1 text-sm tabular-nums text-[#6c6862]">{{ scheduleMatchRate }}% overlap</p>
              </div>

              <ul v-if="mutualAvailability.length > 0" class="rv-item mt-5 divide-y divide-[#e5e2de] border-y border-[#e5e2de]">
                <li v-for="overlap in mutualAvailability" :key="overlap.day" class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5">
                  <span class="text-base text-[#393737]">{{ overlap.day }}</span>
                  <span class="flex flex-wrap gap-2">
                    <span v-for="slot in overlap.slots" :key="slot" class="rounded-full bg-white px-3 py-1 ring-1 ring-black/5 text-sm capitalize text-[#393737]">{{ slot }}</span>
                  </span>
                </li>
              </ul>

              <div v-else class="rv-item mt-4 text-center">
                <p class="text-lg leading-relaxed text-[#6c6862]">
                  <template v-if="!matchProfile?.availability || Object.values(matchProfile.availability).every((a: any) => !a?.length)">
                    {{ matchProfile?.display_name }} hasn't set their free times yet. Agree on a time when you say hello.
                  </template>
                  <template v-else>
                    Your usual free times don't overlap, but most matches find a time that works anyway.
                  </template>
                </p>
                <button type="button" class="mt-4 rounded-full border border-[#ed1c24] px-5 py-2.5 text-sm font-medium text-[#ed1c24] transition-colors hover:bg-[#ed1c24] hover:text-white" @click="openContactMethod">
                  Suggest a time
                </button>
              </div>
            </section>

              <!-- Sign-off -->
              <footer v-reveal class="letter-section mt-14 sm:mt-28">
                <p class="rv-item text-base leading-[1.65] sm:text-xl sm:leading-[1.6]">We have a good feeling about this one.</p>
                <p class="rv-item mt-6 text-base sm:text-xl sm:leading-[1.6]" style="--i: 1">With love,</p>
                <p class="mt-1"><span class="sig-write font-script inline-block text-[2.6rem] leading-none text-[#c4121a]">Minutes 2 Match</span></p>
                <p class="rv-item mt-2 text-sm text-[#9b9690]" style="--i: 3">Your matchmakers in Accra &amp; Nairobi</p>

                <p class="rv-item mt-10 border-t border-[#e5e2de] pt-6 text-base leading-relaxed text-[#6c6862]" style="--i: 4">
                  <span class="font-semibold text-[#393737]">P.S.</span>
                  Don't overthink the first message. Something like
                  <span class="text-[#393737]">“Hi {{ theirName === 'Them' ? 'there' : theirName }}, our matchmakers think we're a {{ matchScoreValue }}% match. Coffee this week?”</span>
                  works beautifully.
                </p>

              </footer>

              <!-- Closing, like Popcorn's "I'm ready. Join Popcorn." -->
              <div v-reveal class="mt-16 pb-4 text-center sm:mt-32 sm:pb-10 print:hidden">
                <p class="rv-item font-display text-[2.2rem] leading-[1.05] tracking-tight sm:text-[4.25rem]">Your move.<br />Say hello to {{ theirFirstName }}.</p>
                <button type="button" class="rv-item btn-solid grain grain-strong mt-6 w-full px-8 py-4 text-base sm:mt-8 sm:w-auto" style="--i: 1" @click="openContactMethod">Say hello <span aria-hidden="true">→</span></button>
              </div>
            </div>
            </div>
          </article>

      </div>

    </div>

    <!-- Phone bar: Matches and Profile (same as the app layout) -->
    <nav aria-label="App" class="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden print:hidden">
      <div class="grid w-full max-w-[20rem] grid-cols-2 gap-1 rounded-full bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(52,38,25,0.16)] ring-1 ring-black/5 backdrop-blur">
        <NuxtLink to="/matches" aria-current="page" class="flex h-12 items-center justify-center gap-2 rounded-full bg-[#393737] text-[0.95rem] font-semibold text-white active:scale-[0.97]">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          Matches
        </NuxtLink>
        <NuxtLink to="/me" class="flex h-12 items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold text-[#6c6862] active:scale-[0.97]">
          <span class="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#e7e4e0] shadow-[0_1px_4px_rgba(52,38,25,0.15)] ring-2 ring-white">
                <img v-if="currentUser?.photo_url" :src="avatarUrl(currentUser.photo_url, 96)" alt="" decoding="async" class="h-full w-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6c6862]">{{ currentUser?.display_name?.charAt(0) || '?' }}</span>
          </span>
          Profile
        </NuxtLink>
      </div>
    </nav>

    <!-- Their profile, on demand -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showProfile && matchProfile" class="m2m-app letter-page fixed inset-0 z-[70] print:hidden" role="dialog" aria-modal="true" :aria-label="`${theirFirstName}'s profile`">
          <div class="drawer-scrim absolute inset-0 bg-[#1f1c1a]/30 backdrop-blur-[2px]" @click="showProfile = false"></div>
          <aside class="drawer-panel absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[1.75rem] bg-white text-[#393737] shadow-[0_-20px_60px_rgba(0,0,0,0.12)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-l-[1.75rem] sm:rounded-tr-none">
            <div class="relative flex h-14 shrink-0 items-center justify-end border-b border-[#f0ece7] px-3 sm:h-16 sm:px-4">
              <span class="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#e7e3de] sm:hidden" aria-hidden="true"></span>
              <p class="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pt-1 text-lg text-[#393737] sm:pt-0">{{ theirFirstName }}'s profile</p>
              <button type="button" class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa] active:scale-95" aria-label="Close" @click="showProfile = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-4 w-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="overflow-y-auto overscroll-contain bg-[#f7f7f7] px-5 pb-8 pt-7 text-center sm:px-6">
            <!-- Photo -->
            <div class="relative mx-auto h-32 w-32 sm:h-36 sm:w-36">
              <div class="h-full w-full overflow-hidden rounded-full bg-[#eef1f5] ring-[6px] ring-white shadow-[0_14px_36px_rgba(57,77,100,0.14)]">
                <img
                  v-if="isOpen && matchProfile?.photo_url"
                  :src="avatarUrl(matchProfile.photo_url, 144)"
                  decoding="async"
                  :alt="matchProfile.display_name"
                  class="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 hover:scale-105"
                  @click="showImageZoom = true"
                />
                <img v-else-if="matchProfile?.photo_url" :src="avatarUrl(matchProfile.photo_url, 144)" alt="" decoding="async" class="h-full w-full scale-110 object-cover blur-[8px]" />
                <span v-else class="font-display flex h-full w-full items-center justify-center text-5xl text-[#9b9690]">{{ isOpen ? (matchProfile?.display_name || '?').charAt(0).toUpperCase() : '?' }}</span>
              </div>
            </div>

            <h2 class="font-display mt-5 inline-flex items-center gap-2 text-[2rem] leading-tight text-[#393737] sm:text-[2.25rem]">
              {{ isOpen ? matchProfile?.display_name : (personaData?.name || 'Your match') }}
              <svg v-if="matchProfile?.is_verified" viewBox="0 0 24 24" class="h-5 w-5 shrink-0 text-[#3b82c4]" aria-label="Verified member" role="img"><path fill="currentColor" d="M12 2.5l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21.5l-2.4-1.8-3 .2-.9-2.9-2.4-1.8 1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z" /><path d="m8.5 12.2 2.3 2.3 4.7-4.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </h2>
            <p class="mt-1 text-base text-[#6c6862]">
              <template v-if="isOpen">{{ [getAge(matchProfile?.birth_date), formatPlace(matchProfile?.location)].filter(Boolean).join(' · ') }}</template>
              <template v-else>Details unlock once you're connected</template>
            </p>
            <span class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6c6862] ring-1 ring-black/5">
              <span class="h-1.5 w-1.5 rounded-full" :class="match?.unlocked ? 'bg-[#2f9e5b]' : 'bg-[#e0a03a]'" aria-hidden="true"></span>
              {{ match?.unlocked ? 'Connected' : 'Waiting to connect' }}
            </span>

            <!-- How to reach them -->
            <div v-if="match?.unlocked && matchProfile" class="mt-7 overflow-hidden rounded-[1.5rem] bg-white text-left ring-1 ring-black/5">
              <p class="px-5 pb-1 pt-4 text-sm text-[#9b9690]">Reach {{ theirFirstName }}</p>
              <template v-if="matchProfile.preferred_contact_method === 'instagram' || matchProfile.preferred_contact_method === 'snapchat'">
                <a
                  v-if="contactHandle"
                  :href="contactHref"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#fafafa]"
                >
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f2ef] text-[#393737]" aria-hidden="true">
                    <svg v-if="matchProfile.preferred_contact_method === 'instagram'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" class="h-5 w-5"><path d="M12 3c3 0 5 2.2 5 5.2v2.3l1.8-.6c.5-.1.9.5.4.9l-1.9 1.2c.6 1.7 2 2.9 3.4 3.3-.3.8-1.4 1-2.4 1.1-.3.6-.2 1.4-.9 1.4-1 0-2-.6-3.4.4-1.2.9-2.8.9-4 0-1.4-1-2.4-.4-3.4-.4-.7 0-.6-.8-.9-1.4-1-.1-2.1-.3-2.4-1.1 1.4-.4 2.8-1.6 3.4-3.3L2.8 10.8c-.5-.4-.1-1 .4-.9l1.8.6V8.2C5 5.2 7 3 12 3Z" /></svg>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-base font-medium text-[#393737]">{{ matchProfile.preferred_contact_method === 'instagram' ? 'Instagram' : 'Snapchat' }}</span>
                    <span class="block truncate text-sm text-[#9b9690]">@{{ contactHandle }}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                </a>
                <p v-else class="px-5 pb-4 pt-1 text-sm text-[#9b9690]">{{ theirFirstName }} hasn't added their {{ matchProfile.preferred_contact_method === 'instagram' ? 'Instagram handle' : 'Snapchat username' }} yet.</p>
              </template>
              <template v-else-if="matchProfile.phone">
                <a :href="`https://wa.me/${matchProfile.phone.replace(/\D/g, '')}`" target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#fafafa]">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#1f8a4c]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 9.2c.2 2.6 2.6 5 5.2 5.4l1.2-1.2-1.8-.9-.7.7c-1-.4-2.1-1.4-2.5-2.5l.7-.7-.9-1.8z" /></svg>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-base font-medium text-[#393737]">Message on WhatsApp</span>
                    <span class="block truncate text-sm text-[#9b9690]">{{ matchProfile.phone }}</span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                </a>
                <a :href="`tel:${matchProfile.phone}`" class="flex items-center gap-4 border-t border-black/[0.06] px-5 py-3.5 transition-colors hover:bg-[#fafafa]">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f2ef] text-[#393737]" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
                  </span>
                  <span class="flex-1 text-base font-medium text-[#393737]">Call</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                </a>
              </template>
            </div>

              <!-- Details -->
              <dl v-if="isOpen && profileFacts.length" class="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div v-for="row in profileFacts" :key="row.label" class="rounded-[1.25rem] bg-white px-4 py-3.5 ring-1 ring-black/5">
                  <dt class="text-xs text-[#9b9690]">{{ row.label }}</dt>
                  <dd class="mt-0.5 truncate text-base font-medium text-[#393737]">{{ row.value }}</dd>
                </div>
              </dl>

              <div v-if="matchProfile.about_me" class="mt-4 rounded-[1.5rem] bg-white px-5 py-5 text-left ring-1 ring-black/5">
                <p class="text-sm text-[#9b9690]">In {{ theirFirstName }}'s words</p>
                <p class="font-display mt-2 text-xl leading-snug text-[#393737]">“{{ stripEmoji(matchProfile.about_me) }}”</p>
              </div>

              <div v-if="matchProfile.interests?.length" class="mt-4 rounded-[1.5rem] bg-white px-5 py-5 text-left ring-1 ring-black/5">
                <p class="text-sm text-[#9b9690]">Into</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span v-for="interest in matchProfile.interests" :key="interest" class="rounded-full bg-[#f4f2ef] px-3.5 py-1.5 text-sm text-[#393737]">{{ stripEmoji(getInterestLabel(interest)) }}</span>
                </div>
              </div>

              <div class="mt-8 flex items-center justify-center gap-6">
                <button type="button" class="py-2 text-sm text-[#b4232a] transition-colors hover:text-[#8f1a20]" @click="handleReport">Report</button>
                <span class="h-4 w-px bg-[#e7e3de]" aria-hidden="true"></span>
                <button type="button" class="py-2 text-sm text-[#9b9690] transition-colors hover:text-[#393737]" @click="handleBlock">Block</button>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <!-- Report Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showReportModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showReportModal = false">
          <div class="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl border dark:border-stone-700 overflow-hidden">
            <!-- Header -->
            <div class="bg-red-500 p-4 flex justify-between items-center border-b-2">
              <h3 class="text-white font-bold text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                Report User
              </h3>
              <button @click="showReportModal = false" class="text-white hover:text-white/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            
            <!-- Body -->
            <div class="p-6 space-y-6">
              <p class="text-sm text-stone-600 dark:text-stone-400">
                Help us keep the community safe. Your report will be reviewed by our team.
              </p>
              
              <!-- Reason Selection -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-stone-500">Reason for reporting</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="option in reportReasons" 
                    :key="option.value"
                    @click="reportForm.reason = option.value"
                    :class="[
                      'p-3 rounded-xl border text-left transition-all text-xs font-bold uppercase tracking-wide',
                      reportForm.reason === option.value 
                        ? 'border-[#ece8e3] dark:border-white bg-[#393737] dark:bg-white text-white dark:text-[#393737]' 
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    ]"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
              
              <!-- Description -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-stone-500">Additional details (optional)</label>
                <textarea 
                  v-model="reportForm.description"
                  rows="3"
                  placeholder="Describe what happened..."
                  class="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-[#ece8e3] dark:focus:border-white outline-none text-sm resize-none transition-colors"
                ></textarea>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="p-4 bg-stone-50 dark:bg-stone-800 border-t-2 border-stone-200 dark:border-stone-700 flex gap-3">
              <button 
                @click="showReportModal = false"
                class="flex-1 py-3 bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-medium border border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="submitReport"
                :disabled="!reportForm.reason || submittingReport"
                class="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium border border-red-600 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="submittingReport" class="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ submittingReport ? 'Submitting...' : 'Submit Report' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Image Zoom Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showImageZoom && match?.unlocked && matchProfile?.photo_url" class="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8" @click.self="showImageZoom = false">
          <button @click="showImageZoom = false" class="absolute top-6 right-6 text-white hover:text-white/80 transition-colors p-2 z-[101] bg-stone-800/50 rounded-full border border-white/10 hover:bg-stone-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
          <div class="relative w-full h-full flex items-center justify-center" @click.self="showImageZoom = false">
             <img 
               :src="matchProfile.photo_url"
               :alt="matchProfile.display_name"
               class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300 transform scale-100 cursor-zoom-out"
               @click="showImageZoom = false"
             />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Nudge Custom Message Modal -->
    <Teleport to="body">
       <div 
         v-if="showNudgeModal" 
         class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md transition-all duration-300"
         @click.self="showNudgeModal = false"
       >
         <div class="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_10px_30px_rgba(52,38,25,0.07)] p-6 animate-in zoom-in duration-300 ring-1 ring-black/5">
           <div class="flex items-center justify-between mb-4">
             <h3 class="text-xl font-serif font-semibold">Customize Nudge</h3>
             <button @click="showNudgeModal = false" class="text-stone-400 hover:text-[#393737] transition-colors">
               <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
           </div>

           <p class="text-xs text-stone-500 mb-4 leading-relaxed">
             Personalize your message to encourage <strong>{{ (match?.unlocked || match?.currentUserPaid) ? matchProfile?.display_name : 'your match' }}</strong> to unlock your profile.
           </p>

           <div class="mb-4">
             <textarea 
               v-model="nudgeMessage" 
               placeholder="Hey! Just unlocked our match. Hope you're having a great day!"
               class="w-full h-24 p-4 rounded-2xl border border-stone-100 focus:border-amber-400 focus:ring-0 text-sm font-medium resize-none transition-all placeholder:text-stone-300"
               maxlength="120"
             ></textarea>
             <div class="flex justify-end mt-1">
               <span class="text-[10px] font-bold" :class="nudgeMessage.length > 100 ? 'text-amber-600' : 'text-stone-300'">{{ nudgeMessage.length }}/120</span>
             </div>
           </div>

           <button 
             @click="handleNudge(nudgeMessage)"
             :disabled="nudging || !nudgeMessage.trim()"
             class="w-full py-3.5 bg-amber-400 text-[#393737] font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
           >
             <span v-if="nudging" class="w-4 h-4 border border-black/30 border-t-black rounded-full animate-spin"></span>
             {{ nudging ? 'Sending...' : 'Send Nudge' }}
           </button>
         </div>
       </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'
import { calculateCompatibility, getCompatibilityTier, COMPATIBILITY_MAP, normalizeCity } from '~/utils/compatibility'
import { VIBE_CHAPTERS, VALUES_KEY, getScaleQuestion, chapterForKey, labelForKey, parseScaleAnswer, parseValuesAnswer, scaleRelation } from '~/utils/vibeQuestions'
import { useToast } from '~/composables/useToast'
import type { M2MDatabase } from '~/types/database.types'
import type { MatchBrief } from '~/composables/useMatchBrief'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<M2MDatabase>() as any


const matchId = computed(() => route.params.id as string)

const loading = ref(true)
const error = ref<string | null>(null)
const match = ref<any>(null)
const matchProfile = ref<any>(null)
const unlocking = ref(false)
const nudging = ref(false)
const nudged = ref(false)
const showNudgeModal = ref(false)
const nudgeMessage = ref('')
const showImageZoom = ref(false)

const personaData = computed(() => {
  const personaId = matchProfile.value?.dating_persona
  return personaId ? personas[personaId] : Object.values(personas)[0]
})

const getAge = (birthDate: string | null) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}


const handleReport = () => {
   showProfile.value = false
   showReportModal.value = true
}

// Report functionality
const showReportModal = ref(false)
const submittingReport = ref(false)
const reportForm = reactive({
  reason: '' as string,
  description: ''
})

const reportReasons = [
  { value: 'inappropriate_behavior', label: 'Inappropriate' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'underage', label: 'Underage' },
  { value: 'other', label: 'Other' }
]

const submitReport = async () => {
  if (!reportForm.reason || !matchProfile.value?.id) return
  
  submittingReport.value = true
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      toast.error('Error', 'You must be logged in to submit a report.')
      return
    }
    
    // Check for existing report in last 24 hours
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', session.user.id)
      .eq('reported_user_id', matchProfile.value.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle()
    
    if (existingReport) {
      toast.info('Already Reported', 'You have already reported this user recently. Our team is reviewing it.')
      showReportModal.value = false
      return
    }
    
    // Insert report
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: session.user.id,
        reported_user_id: matchProfile.value.id,
        match_id: matchId.value,
        reason: reportForm.reason,
        description: reportForm.description || null,
        status: 'pending'
      })
    
    if (error) {
      console.error('Report insert error:', error)
      throw new Error(error.message)
    }
    
    toast.success('Report Submitted', 'Thank you for helping keep our community safe.')
    showReportModal.value = false
    reportForm.reason = ''
    reportForm.description = ''
  } catch (error: any) {
    const message = error.message || 'Failed to submit report. Please try again.'
    toast.error('Report Failed', message)
  } finally {
    submittingReport.value = false
  }
}

const handleNudge = async (customMessage: string) => {
   if (!match.value?.id) return
   nudging.value = true
   try {
     const res = await $fetch('/api/matches/nudge', {
       method: 'POST',
       body: { matchId: match.value.id, customMessage }
     })
     if ((res as any).success) {
       toast.success('Nudge sent', "We've sent them an SMS alert.")
       nudged.value = true
       showNudgeModal.value = false
     } else {
       toast.error('Nudge Failed', (res as any).message || 'Something went wrong.')
     }
   } catch (err) {
     toast.error('Nudge Failed', 'Connection error.')
   } finally {
     nudging.value = false
   }
}

const handleBlock = () => {
   // Placeholder for block functionality
   if(confirm('Are you sure you want to block this user?')) {
     toast.success('User blocked', 'You will no longer see this user.')
   }
}

// Available interests for mapping
const availableInterests = [
  { id: 'travel', label: 'Travel' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'movies', label: 'Movies' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'reading', label: 'Reading' },
  { id: 'art', label: 'Art' },
  { id: 'sports', label: 'Sports' },
  { id: 'tech', label: 'Tech' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'food', label: 'Foodie' },
  { id: 'nature', label: 'Nature' },
  { id: 'photography', label: 'Photography' },
  { id: 'dancing', label: 'Dancing' },
  { id: 'entrepreneurship', label: 'Business' }
]

// Emoji in stored answers, reasons and labels read as clutter in a letter
const stripEmoji = (text: string) => String(text || '').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u200D\uFE0F]/gu, '').replace(/\s{2,}/g, ' ').trim()

const getInterestLabel = (id: string) => {
  const interest = availableInterests.find(i => i.id === id)
  return interest ? interest.label : stripEmoji(id)
}

const currentUser = ref<any>(null)

const sharedInterests = computed(() => {
  if (!matchProfile.value?.interests || !currentUser.value?.interests) return []
  return matchProfile.value.interests.filter((i: string) => currentUser.value.interests.includes(i))
})

// Availability Logic
const mutualAvailability = computed(() => {
  if (!currentUser.value?.availability || !matchProfile.value?.availability) return []
  
  const days = ['weekdays', 'friday', 'saturday', 'sunday']
  
  // Defensive parsing
  let user1Avail: any = {}
  let user2Avail: any = {}
  
  try {
     user1Avail = typeof currentUser.value.availability === 'string' ? JSON.parse(currentUser.value.availability) : currentUser.value.availability
     user2Avail = typeof matchProfile.value.availability === 'string' ? JSON.parse(matchProfile.value.availability) : matchProfile.value.availability
  } catch (e) {
     return []
  }

  if (!user1Avail || !user2Avail) return []

  const shared: { day: string, slots: string[] }[] = []
  for (const day of days) {
    const user1Slots = user1Avail[day] || []
    const user2Slots = user2Avail[day] || []
    
    if (!Array.isArray(user1Slots) || !Array.isArray(user2Slots)) continue
    
    const common = user1Slots.filter((slot: string) => user2Slots.includes(slot))
    
    if (common.length > 0) {
      shared.push({ 
        day: day === 'weekdays' ? 'Weekdays' : day.charAt(0).toUpperCase() + day.slice(1), 
        slots: common 
      })
    }
  }
  return shared
})

const scheduleMatchRate = computed(() => {
  if (mutualAvailability.value.length === 0) return 0
  const slots = mutualAvailability.value.reduce((acc: number, curr: any) => acc + curr.slots.length, 0)
  // Max slots is ~12. Scale to 100.
  const score = Math.round((slots / 12) * 100)
  return Math.min(score + 30, 99) // Base 30 + slot bonus
})

// ===== Compatibility evidence ("Why you two match") =====
const myAnswers = ref<{ question_key: string; answer_value: string }[]>([])

const toVibe = (list: any[]) => (list || []).map(a => ({ question_key: a.question_key, answer: String(a.answer_value ?? '') }))

// Same scorer the matchmaker uses, run on both profiles for the breakdown
const compat = computed(() => {
  if (!currentUser.value || !matchProfile.value) return null
  try {
    return calculateCompatibility(currentUser.value, toVibe(myAnswers.value), matchProfile.value, toVibe(matchProfile.value.vibeAnswers))
  } catch (e) {
    console.error('Compatibility calc failed:', e)
    return null
  }
})

// The stored score is what they saw on the match card, so lead with it
const matchScoreValue = computed(() => Math.round(Number(match.value?.match_score ?? compat.value?.score ?? 0)))
const matchTier = computed(() => getCompatibilityTier(matchScoreValue.value))
const theirName = computed(() => (match.value?.unlocked || match.value?.currentUserPaid) ? (matchProfile.value?.display_name || 'Them') : 'Them')

const matchReasons = computed<string[]>(() => {
  const r = match.value?.match_reasons
  const list = Array.isArray(r) ? r : (compat.value?.strengths || [])
  return list.filter((x: any) => typeof x === 'string').map(stripEmoji).filter(Boolean).slice(0, 5)
})

const evidenceBars = computed(() => {
  const b = compat.value?.breakdown
  if (!b) return []
  return [
    { label: 'Values & vibe', value: b.vibeMatch, max: 40, hint: 'Your Vibe Check answers' },
    { label: 'Life goals', value: b.goalsMatch, max: 20, hint: 'What you want, and faith' },
    { label: 'Lifestyle', value: b.lifestyleMatch, max: 20, hint: 'Persona, work and city' },
    { label: 'Life stage', value: b.maturityMatch, max: 10, hint: 'How close you are in age' },
    { label: 'Shared interests', value: b.interestMatch, max: 10, hint: 'Hobbies you both picked' },
    { label: 'Personality', value: b.aiSynergy || 0, max: 10, hint: 'What you each wrote about yourselves' },
  ].map(x => ({ ...x, value: Math.max(0, Math.min(x.max, Math.round(x.value))) }))
})
// Each part's strength, in the same three tones as the answers table
type BarTone = 'same' | 'complementary' | 'different'
const barTone = (bar: { value: number; max: number }): BarTone => {
  const r = bar.max ? bar.value / bar.max : 0
  return r >= 0.7 ? 'same' : r >= 0.4 ? 'complementary' : 'different'
}
const BAR_WORD: Record<BarTone, string> = { same: 'Strong', complementary: 'Good', different: 'Room to grow' }
const lineupHighlights = computed(() => {
  const bars = evidenceBars.value
  if (!bars.length) return null
  const ratio = (x: { value: number; max: number }) => x.value / x.max
  const sorted = [...bars].sort((a, b) => ratio(b) - ratio(a))
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  return { best: best.label, grow: worst !== best && ratio(worst) < 0.4 ? worst.label : '' }
})

const INTENT_LABELS: Record<string, string> = { marriage: 'marriage', serious: 'something serious', casual: 'something casual', friendship: 'friendship' }

const sharedFacts = computed(() => {
  const me = currentUser.value
  const them = matchProfile.value
  if (!me || !them) return []
  const facts: { text: string }[] = []
  if (me.intent && me.intent === them.intent) facts.push({ text: `You both want ${INTENT_LABELS[me.intent] || me.intent}` })
  if (me.religion && them.religion && me.religion.toLowerCase() === them.religion.toLowerCase()) facts.push({ text: `You share the same faith (${me.religion})` })
  if (normalizeCity(me.location) && normalizeCity(me.location) === normalizeCity(them.location)) facts.push({ text: `You both live in ${normalizeCity(me.location).replace(/\b\w/g, (c: string) => c.toUpperCase())}` })
  if (me.birth_date && them.birth_date) {
    const gap = Math.abs(getAge(me.birth_date) - getAge(them.birth_date))
    if (gap <= 4) facts.push({ text: gap === 0 ? "You're the same age" : `Only ${gap} year${gap === 1 ? '' : 's'} apart` })
  }
  if (me.dating_persona && me.dating_persona === them.dating_persona) {
    const p = personas[me.dating_persona]
    facts.push({ text: `You're both ${p?.name || 'the same dating persona'}` })
  }
  if (sharedValues.value.length) {
    facts.push({ text: `You both value ${joinList(valueNames(sharedValues.value))}` })
  }
  if (sharedInterests.value.length) {
    const names = sharedInterests.value.slice(0, 3).map((i: string) => getInterestLabel(i)).join(', ')
    facts.push({ text: `${sharedInterests.value.length} shared interest${sharedInterests.value.length === 1 ? '' : 's'}: ${names}` })
  }
  if (mutualAvailability.value.length) {
    facts.push({ text: `Free at the same time on ${mutualAvailability.value.length} day${mutualAvailability.value.length === 1 ? '' : 's'}` })
  }
  return facts
})

// "Quality Time - Give me your undivided attention ⏰" -> "Quality Time"
const shortAnswer = (raw: string) => {
  const text = String(raw || '')
  return stripEmoji(text.split(' - ')[0])
}

type AnswerPair = {
  key: string
  label: string
  chapter: string
  type: 'choice' | 'scale'
  mine: string
  theirs: string
  relation: 'same' | 'complementary' | 'different'
  // 1–7 statements only
  a?: number
  b?: number
  minLabel?: string
  maxLabel?: string
  question?: string
}

const answerPairs = computed<AnswerPair[]>(() => {
  const mine = new Map(myAnswers.value.map(a => [a.question_key, String(a.answer_value ?? '')]))
  const order = { same: 0, complementary: 1, different: 2 } as const
  const pairs: AnswerPair[] = []
  for (const t of (matchProfile.value?.vibeAnswers || []) as any[]) {
    const key = t.question_key as string
    if (key === VALUES_KEY || !mine.has(key) || !t.answer_value) continue
    const m = mine.get(key)!
    const th = String(t.answer_value)
    const chapter = chapterForKey(key) || 'live'
    const scale = getScaleQuestion(key)
    if (scale) {
      const a = parseScaleAnswer(m)
      const b = parseScaleAnswer(th)
      if (a === null || b === null) continue
      pairs.push({ key, label: scale.label, chapter, type: 'scale', mine: String(a), theirs: String(b), relation: scaleRelation(a, b), a, b, minLabel: scale.minLabel, maxLabel: scale.maxLabel, question: scale.question })
    } else {
      const base = key.replace(/_v\d+$/, '')
      const relation = m === th ? 'same' : (COMPATIBILITY_MAP[base]?.[m]?.includes(th) ? 'complementary' : 'different')
      pairs.push({ key, label: labelForKey(key), chapter, type: 'choice', mine: shortAnswer(m), theirs: shortAnswer(th), relation })
    }
  }
  return pairs.sort((x, y) => order[x.relation] - order[y.relation])
})

// "In your own words", told chapter by chapter
const answerChapters = computed(() =>
  VIBE_CHAPTERS
    .map(c => {
      const pairs = answerPairs.value.filter(p => p.chapter === c.id)
      return { ...c, pairs, aligned: pairs.filter(p => p.relation !== 'different').length }
    })
    .filter(c => c.pairs.length)
)

// Verdicts as flat line icons: same (tick), compatible (overlapping circles), different (arrows apart)
const RELATION_ICON: Record<AnswerPair['relation'], string> = {
  same: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  complementary: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  different: '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>',
}
const RELATION_KEY: { id: AnswerPair['relation']; label: string }[] = [
  { id: 'same', label: 'Same' },
  { id: 'complementary', label: 'Compatible' },
  { id: 'different', label: 'Different' },
]
const relationLabel = (pair: AnswerPair) => pair.type === 'scale'
  ? { same: 'In sync', complementary: 'Close', different: 'Far apart' }[pair.relation]
  : { same: 'Same', complementary: 'Compatible', different: 'Different' }[pair.relation]

// Position on the 1–7 track (inset 9px each side so the end avatars don't clip)
const scaleLeft = (n: number) => `calc(9px + (100% - 18px) * ${(n - 1) / 6})`
const scaleSpan = (pair: AnswerPair) => `calc((100% - 18px) * ${Math.abs(pair.a! - pair.b!) / 6})`

const answerSummary = computed(() => {
  const total = answerPairs.value.length
  const aligned = answerPairs.value.filter(p => p.relation !== 'different').length
  return { total, aligned }
})

// Shared "top 5" values
const sharedValues = computed(() => {
  const mineV = parseValuesAnswer(myAnswers.value.find(a => a.question_key === VALUES_KEY)?.answer_value)
  const theirsV = parseValuesAnswer((matchProfile.value?.vibeAnswers || []).find((a: any) => a.question_key === VALUES_KEY)?.answer_value)
  return mineV.filter(v => theirsV.includes(v))
})
const valueNames = (vals: string[]) => vals.map(stripEmoji)

// Honest, friendly talking points where you answered differently
const talkingPoints = computed(() => {
  const them = theirName.value === 'Them' ? 'they' : theirName.value
  return answerPairs.value
    .filter(p => p.relation === 'different')
    .slice(0, 2)
    .map(p => p.type === 'scale'
      ? `${p.label}: you're a ${p.a} and ${them}'s a ${p.b}, on a scale from “${p.minLabel}” to “${p.maxLabel}”.`
      : `${p.label}: you said ${p.mine}, ${them} said ${p.theirs}.`)
})

// ===== Match brief: TL;DR + date ideas =====
const myFirstName = computed(() => (currentUser.value?.display_name || 'there').split(' ')[0])
const printLetter = () => window.print()

// Numbered sections (like a terms page), counting only the ones that have data
const briefSections = computed(() => {
  const present: Record<string, boolean> = {
    why: !!match.value?.ai_analysis || matchReasons.value.length > 0,
    lineup: evidenceBars.value.length > 0,
    share: sharedFacts.value.length > 0,
    words: answerPairs.value.length > 0,
    talk: talkingPoints.value.length > 0,
    dates: dateIdeas.value.length > 0,
  }
  return ['why', 'lineup', 'share', 'words', 'talk', 'dates'].filter(k => present[k])
})
const briefNum = (key: string) => {
  const i = briefSections.value.indexOf(key)
  return i === -1 ? 0 : i + 1
}

const matchedOn = computed(() => match.value?.created_at
  ? new Date(match.value.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  : '')

const theirFirstName = computed(() => theirName.value === 'Them' ? 'Your match' : theirName.value.split(' ')[0])

// Their profile lives in a side panel so the letter stays the focus
const showProfile = ref(false)
const isOpen = computed(() => !!(match.value?.unlocked || match.value?.currentUserPaid))
// "accra, east legon" -> "Accra, East Legon"
const formatPlace = (raw?: string | null) => String(raw || '').replace(/_/g, ' ').trim().toLowerCase().replace(/(^|[\s,(-])\p{L}/gu, c => c.toUpperCase())
const contactHandle = computed(() => {
  const p = matchProfile.value
  const raw = p?.preferred_contact_method === 'instagram' ? p?.instagram_handle : p?.preferred_contact_method === 'snapchat' ? p?.snapchat_handle : ''
  return String(raw || '').trim().replace(/^@+/, '').replace(/\s+/g, '')
})
const contactHref = computed(() => matchProfile.value?.preferred_contact_method === 'instagram'
  ? `https://instagram.com/${encodeURIComponent(contactHandle.value)}`
  : `https://snapchat.com/add/${encodeURIComponent(contactHandle.value)}`)
// Age and city sit under the name, so the tiles carry the rest
const profileFacts = computed(() => {
  const p = matchProfile.value
  if (!p) return []
  return [
    { label: 'Works as', value: p.occupation || '' },
    { label: 'Faith', value: p.religion ? p.religion.charAt(0).toUpperCase() + p.religion.slice(1) : '' },
    { label: 'Height', value: p.height_cm ? `${p.height_cm} cm` : '' },
    { label: 'Looking for', value: p.intent ? (INTENT_LABELS[p.intent] || p.intent).replace(/^\w/, (c: string) => c.toUpperCase()) : '' },
  ].filter(r => r.value)
})
const closeOnEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') showProfile.value = false }
watch(showProfile, (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  open ? window.addEventListener('keydown', closeOnEscape) : window.removeEventListener('keydown', closeOnEscape)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.documentElement.style.overflow = ''
  if (typeof window !== 'undefined') window.removeEventListener('keydown', closeOnEscape)
})

// The big numbers under the opening, State of Dating style. Only the ones with something to say.
const headlineStats = computed(() => {
  const stats: { value: number; suffix: string; label: string }[] = []
  if (answerSummary.value.total) stats.push({ value: answerSummary.value.aligned, suffix: `/${answerSummary.value.total}`, label: 'answers in sync' })
  if (sharedValues.value.length) stats.push({ value: sharedValues.value.length, suffix: '', label: `core value${sharedValues.value.length === 1 ? '' : 's'} in common` })
  else if (sharedInterests.value.length) stats.push({ value: sharedInterests.value.length, suffix: '', label: `shared interest${sharedInterests.value.length === 1 ? '' : 's'}` })
  if (mutualAvailability.value.length) stats.push({ value: mutualAvailability.value.length, suffix: '', label: `day${mutualAvailability.value.length === 1 ? '' : 's'} you're both free` })
  return stats.slice(0, 3)
})

// ----- Letter animations -----
// v-reveal marks a block as .rv, then .rv-in once it scrolls into view; CSS staggers its .rv-item children.
// v-count counts a number up from 0 when it comes into view.
// Both do nothing under reduced motion, and print styles always show the finished state.
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let revealObserver: IntersectionObserver | null = null
const revealCallbacks = new WeakMap<Element, () => void>()
const whenVisible = (el: Element, cb: () => void) => {
  if (typeof IntersectionObserver === 'undefined') return cb()
  revealObserver ||= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      revealObserver!.unobserve(entry.target)
      revealCallbacks.get(entry.target)?.()
      revealCallbacks.delete(entry.target)
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
  revealCallbacks.set(el, cb)
  revealObserver.observe(el)
}
const stopWatching = (el: Element) => {
  revealObserver?.unobserve(el)
  revealCallbacks.delete(el)
}

const vReveal = {
  mounted(el: HTMLElement) {
    if (prefersReducedMotion()) return
    el.classList.add('rv')
    whenVisible(el, () => el.classList.add('rv-in'))
  },
  unmounted: stopWatching,
}

type CountEl = HTMLElement & { _countTo?: number }
const vCount = {
  mounted(el: CountEl, { value }: { value: number }) {
    el._countTo = Math.round(Number(value) || 0)
    if (prefersReducedMotion() || !el._countTo) { el.textContent = String(el._countTo); return }
    el.textContent = '0'
    whenVisible(el, () => {
      let start = 0
      const tick = (t: number) => {
        start ||= t
        const p = Math.min(1, (t - start) / 1400)
        el.textContent = String(Math.round((el._countTo || 0) * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      setTimeout(() => requestAnimationFrame(tick), 250)
      // If frames are paused (background tab, power saving), still land on the real number
      setTimeout(() => { el.textContent = String(el._countTo || 0) }, 1900)
    })
  },
  updated(el: CountEl, { value }: { value: number }) {
    const to = Math.round(Number(value) || 0)
    if (to !== el._countTo) { el._countTo = to; el.textContent = String(to) }
  },
  unmounted: stopWatching,
}

const joinList = (items: string[]) => items.length <= 1 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

// Plain-language summary written from the evidence below
const tldr = computed(() => {
  const me = currentUser.value
  const them = matchProfile.value
  if (!me || !them) return []
  const name = theirName.value === 'Them' ? 'your match' : theirName.value
  const lines: string[] = [`You and ${name} are ${matchScoreValue.value}% compatible, which we call ${matchTier.value.tier.toLowerCase()}.`]
  const common: string[] = []
  if (me.intent && me.intent === them.intent) common.push(`want ${INTENT_LABELS[me.intent] || me.intent}`)
  if (me.religion && them.religion && me.religion.toLowerCase() === them.religion.toLowerCase()) common.push('share your faith')
  if (normalizeCity(me.location) && normalizeCity(me.location) === normalizeCity(them.location)) common.push(`live in ${normalizeCity(me.location).replace(/\b\w/g, (c: string) => c.toUpperCase())}`)
  if (sharedInterests.value.length) common.push(`share ${sharedInterests.value.length} interest${sharedInterests.value.length === 1 ? '' : 's'}`)
  if (common.length) lines.push(`You both ${joinList(common)}.`)
  if (sharedValues.value.length >= 2) lines.push(`You even picked the same values: ${joinList(valueNames(sharedValues.value))}.`)
  if (answerPairs.value.length) lines.push(`${answerSummary.value.aligned} of your ${answerSummary.value.total} Vibe Check answers line up or complement each other.`)
  const diff = answerPairs.value.find((p: any) => p.relation === 'different')
  if (diff) lines.push(`Your biggest difference is ${diff.label.toLowerCase()}, which makes a great first-date topic.`)
  return lines
})

// Date ideas: a wide catalogue (utils/dateIdeas) scored on shared interests, their city and how they
// like to spend time; the brief shows the best three, each with why it fits and when they're both free
// Each kind of date gets a label; each card's details open on tap
const IDEA_KIND: Record<string, string> = { food: 'Food', outdoors: 'Outdoors', culture: 'Culture', active: 'Get moving', nightlife: 'Night out', cosy: 'Low-key', adventure: 'Day out' }
const openIdeas = ref(new Set<string>())
const toggleIdea = (id: string) => {
  const next = new Set(openIdeas.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIdeas.value = next
}
const dateIdeas = computed(() => {
  const me = currentUser.value
  const them = matchProfile.value
  if (!me || !them) return []
  return pickDateIdeas({
    shared: sharedInterests.value,
    either: [...new Set<string>([...(me.interests || []), ...(them.interests || [])])],
    city: normalizeCity(them.location) || normalizeCity(me.location),
    mine: new Map(myAnswers.value.map((a: any) => [a.question_key, String(a.answer_value ?? '')])),
    theirs: new Map((them.vibeAnswers || []).map((a: any) => [a.question_key, String(a.answer_value ?? '')])),
    intents: [me.intent, them.intent].filter(Boolean),
    windows: mutualAvailability.value,
    interestLabel: (id: string) => stripEmoji(getInterestLabel(id)),
  })
})

const openContactMethod = () => {
   if (!matchProfile.value) return
   const method = matchProfile.value.preferred_contact_method || 'phone'
   if (method === 'instagram' && matchProfile.value.instagram_handle) {
      window.open(`https://instagram.com/${matchProfile.value.instagram_handle.replace('@', '')}`, '_blank')
   } else if (method === 'snapchat' && matchProfile.value.snapchat_handle) {
      window.open(`https://snapchat.com/add/${matchProfile.value.snapchat_handle}`, '_blank')
   } else if (matchProfile.value.phone) {
      window.open(`https://wa.me/${matchProfile.value.phone?.replace(/\D/g, '')}`, '_blank')
   }
}

// Load the brief in one request (/api/matches/brief/:id). If /matches already prefetched it, or you've
// opened it before, it shows instantly and a fresh copy replaces it quietly.
const { briefs, loadBrief } = useMatchBrief()
const applyBrief = (data: MatchBrief) => {
  const userId = data.me?.id
  const m = data.match
  currentUser.value = data.me
  myAnswers.value = (data.myAnswers as any[]) || []
  match.value = {
    ...m,
    // Matching needs no acceptance: every match is open from the start
    unlocked: true,
    currentUserPaid: m.user_1_id === userId ? m.user_1_paid : m.user_2_paid,
    unlock_price: m.unlock_price || 10,
  }
  matchProfile.value = data.partner
}
const loadMatchData = async () => {
  const id = matchId.value
  const cached = briefs.value[id]
  if (cached) {
    applyBrief(cached)
    loading.value = false
  } else {
    loading.value = true
  }
  try {
    applyBrief(await loadBrief(id))
    error.value = null
  } catch (err: any) {
    const status = err?.statusCode || err?.response?.status
    if (status === 401) return router.push('/login')
    // Keep showing a cached copy if the refresh fails
    if (!cached) error.value = status === 404 ? 'Match not found' : 'Failed to load connection'
    console.error('Connection page error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadMatchData)

useHead({
  title: 'Your Connection - Minutes 2 Match'
})
</script>
