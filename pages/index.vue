<template>
  <div class="dd-page min-h-screen bg-[#fffbeb] text-[#393737] font-sans antialiased overflow-x-hidden">
    <!-- ============ HERO ============ -->
    <section class="relative z-10 min-h-0 overflow-hidden bg-gradient-to-b from-white via-white to-[#f7f7f7] sm:min-h-[640px]">
      <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.045] blur-3xl"></div>
      <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-48 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-[#f7f7f7] to-transparent"></div>

      <!-- Header -->
      <div class="absolute inset-x-0 top-0 z-20 h-14 bg-white sm:h-16">
        <div class="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center px-4 sm:px-6">
          <NuxtLink to="/" aria-label="Minutes 2 Match home" class="relative z-10 block h-7 w-[124px] overflow-hidden sm:h-8 sm:w-[140px]">
            <NuxtImg
              format="webp"
              src="/logo-full.png"
              alt="Minutes 2 Match"
              class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain select-none sm:h-[102px]"
            />
          </NuxtLink>

          <div class="absolute right-0 md:hidden">
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-full" :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'" :aria-expanded="mobileMenuOpen" @click="mobileMenuOpen = !mobileMenuOpen">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" class="h-6 w-6 text-[#ed1c24]">
                <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="mobileMenuOpen" class="md:hidden absolute left-4 right-4 top-14 z-30 sm:top-16 rounded-2xl bg-white p-2 shadow-xl">
            <NuxtLink v-for="l in mobileLinks" :key="l.to" :to="l.to" class="block rounded-xl px-4 py-3 text-base font-medium text-[#393737] hover:bg-[#f0f0f0]" @click="mobileMenuOpen = false">
              {{ l.label }}
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <!-- Hero content -->
      <div class="relative z-10 mx-auto flex min-h-0 w-full max-w-6xl items-center justify-center px-4 pb-16 pt-28 sm:min-h-[560px] sm:px-6 sm:pb-20 sm:pt-36">
        <div class="flex w-full flex-col items-center text-center">
          <h1 class="font-display manual-bold mx-auto mb-6 max-w-4xl sm:mb-7 text-[clamp(2.3rem,10.5vw,5rem)] leading-[1.02] tracking-tight text-balance text-[#393737]">
            <span class="hero-rise hero-rise-1 inline-block">Date without swiping.</span><br />
            <span class="hero-rise hero-rise-2 inline-flex items-baseline justify-center text-[#ed1c24]">
              <span>Find your&nbsp;</span><Transition name="hero-word" mode="out-in"><span :key="heroWords[heroWordIndex]" class="hero-word-live">{{ heroWords[heroWordIndex] }}</span></Transition>
            </span>
          </h1>
          <p class="hero-rise hero-rise-3 mx-auto mb-9 max-w-xl text-base leading-relaxed xs:text-lg sm:mb-10 text-pretty text-[#6c6862] sm:text-xl">
            Thoughtful weekly introductions, based on what matters to you. Start building a real connection in your city.
          </p>
          <div class="hero-rise hero-rise-4 w-full max-w-lg">
            <form @submit.prevent="handleHeroSubmit">
              <div class="flex flex-col gap-3">
                <div class="flex w-full items-center rounded-full border border-[#ded9d2] bg-white px-4 shadow-[0_8px_28px_rgba(52,38,25,0.08)] transition-[border-color,box-shadow] focus-within:border-[#ed1c24] focus-within:ring-4 focus-within:ring-[#ed1c24]/10">
                  <label class="flex shrink-0 items-center border-r border-[#e8e2da] pr-3 sm:pr-4">
                    <span class="sr-only">Country code</span>
                    <select v-model="phoneCountry" aria-label="Country code" class="min-h-14 cursor-pointer bg-transparent pr-2 text-sm font-semibold text-[#393737] outline-none sm:text-base">
                      <option v-for="c in PHONE_COUNTRIES" :key="c.code" :value="c.code">{{ c.flag }} {{ c.code }}</option>
                    </select>
                  </label>
                  <input
                    v-model="heroPhone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    :placeholder="getPhoneCountry(phoneCountry).example"
                    aria-label="Phone number"
                    :aria-invalid="!!heroPhoneError"
                    aria-describedby="hero-phone-error"
                    required
                    class="min-w-0 w-full bg-transparent px-4 py-4 text-base text-[#393737] placeholder:text-[#9b9690] outline-none sm:text-lg"
                  />
                </div>
                <p v-if="heroPhoneError" id="hero-phone-error" role="alert" class="px-4 text-left text-sm text-[#b4232a]">{{ heroPhoneError }}</p>
                <button type="submit" :disabled="heroSubmitting" class="btn-solid grain grain-strong w-full px-8 py-4 text-base shadow-[0_8px_24px_rgba(237,28,36,0.2)] disabled:opacity-80 sm:py-[1.1rem] sm:text-lg">
                  <template v-if="heroSubmitting">Checking…</template>
                  <template v-else>Get started <span aria-hidden="true">→</span></template>
                </button>
              </div>
            </form>
            <p class="mt-4 text-sm text-[#817a72]">No swiping. Just thoughtful introductions.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ HOW IT WORKS ============ -->
    <section id="how-it-works" class="scroll-mt-4 bg-[#f7f7f7] px-4 py-10 sm:px-6 sm:py-14">
      <div class="mx-auto max-w-6xl">
        <div class="mx-auto mb-7 max-w-4xl text-center sm:mb-9">
          <h2 class="font-display manual-bold mx-auto max-w-4xl py-4 text-[1.875rem] xs:text-4xl leading-[1.08] tracking-tight text-balance text-[#393737] sm:py-8 sm:text-5xl md:text-6xl">A better way to meet,<br class="hidden sm:block"> with peace of mind.</h2>
          <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#737373] sm:mt-5 sm:text-lg">Get started in 5 minutes.<br>Meet thoughtful matches in Accra and Nairobi.</p>
        </div>

        <div class="grid gap-5 md:grid-cols-3 md:gap-6">
          <article v-for="(step, index) in howItWorksSteps" :key="step.title" class="hiw-card group flex min-h-0 flex-col items-center overflow-hidden rounded-[1.65rem] bg-gradient-to-b from-[#e9eef3] to-[#f2f4f6] px-5 pb-7 pt-6 text-center sm:px-7 sm:pt-8">
            <!-- Same-height stage for every step, so the titles below line up -->
            <div class="hiw-stage relative mb-4 flex h-[230px] w-full items-center justify-center sm:mb-6" aria-hidden="true">
              <!-- 1. Tell us about you: a Vibe Check question -->
              <template v-if="index === 0">
                <div class="hiw-back absolute h-[176px] w-[196px] -translate-x-4 translate-y-2 -rotate-6 rounded-[1.25rem] bg-gradient-to-b from-[#dbe4ee] to-[#e8edf2] ring-1 ring-white/70"></div>
                <div class="hiw-front relative w-[214px] rounded-[1.25rem] bg-white p-4 text-left shadow-[0_14px_36px_rgba(52,38,25,0.10)]">
                  <p class="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#9b9690]">Part 1 of 4</p>
                  <p class="font-display mt-0.5 text-[0.95rem] leading-tight text-[#393737]">What you want</p>
                  <div class="mt-1.5 flex gap-1"><span class="h-1 w-1 rounded-full bg-[#393737]"></span><span class="h-1 w-4 rounded-full bg-[#ed1c24]"></span><span class="h-1 w-1 rounded-full bg-[#dcd8d3]"></span><span class="h-1 w-1 rounded-full bg-[#dcd8d3]"></span></div>
                  <p class="font-display mt-3 text-[1.05rem] leading-snug text-[#393737]">Having children is part of the life I want.</p>
                  <div class="mt-3 grid grid-cols-7 gap-1">
                    <span v-for="n in 7" :key="n" class="flex aspect-square items-center justify-center rounded-full text-[0.62rem] font-semibold" :class="n === 6 ? 'bg-[#393737] text-white' : 'bg-[#f3f2f0] text-[#6c6862]'">{{ n }}</span>
                  </div>
                  <div class="mt-1.5 flex justify-between text-[0.55rem] text-[#9b9690]"><span>Not for me</span><span>It's my dream</span></div>
                </div>
              </template>

              <!-- 2. Get matched: two people, one score -->
              <template v-else-if="index === 1">
                <div class="relative flex items-start">
                  <div class="hiw-left relative -mr-6 mt-4 h-[156px] w-[112px] -rotate-6 overflow-hidden rounded-[1.1rem] bg-[#eceae6] shadow-[0_12px_30px_rgba(52,38,25,0.14)] ring-[3px] ring-white">
                    <img src="/kwame_profile.png" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div class="hiw-right relative z-10 h-[156px] w-[112px] rotate-6 overflow-hidden rounded-[1.1rem] bg-[#eceae6] shadow-[0_16px_36px_rgba(52,38,25,0.18)] ring-[3px] ring-white">
                    <img src="/ama_profile.png" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <span class="absolute left-1/2 top-[52%] z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[0.72rem] font-semibold text-[#393737] shadow-[0_8px_20px_rgba(52,38,25,0.14)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-[#ed1c24]"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>86% compatible
                  </span>
                  <span class="absolute -bottom-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#393737] px-3 py-1 text-[0.68rem] font-medium text-white">Both love music</span>
                </div>
              </template>

              <!-- 3. Go on a date: an idea picked for the pair -->
              <template v-else>
                <div class="hiw-back absolute h-[176px] w-[196px] translate-x-4 translate-y-2 rotate-6 rounded-[1.25rem] bg-gradient-to-b from-[#f4e2d6] to-[#f3ece6] ring-1 ring-white/70"></div>
                <div class="hiw-front relative w-[214px] overflow-hidden rounded-[1.25rem] bg-white text-left shadow-[0_14px_36px_rgba(52,38,25,0.10)]">
                  <div class="relative h-[86px] overflow-hidden bg-gradient-to-b from-[#e7ebf4] via-[#f6e6e6] to-[#f9dcc4]">
                    <LetterVignette scene="sunset" class="absolute -top-6 left-1/2 w-28 -translate-x-1/2" />
                    <span class="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[0.58rem] font-semibold text-[#393737]">Picked for you both</span>
                  </div>
                  <div class="p-3.5">
                    <p class="font-display text-[1.05rem] leading-tight text-[#393737]">Live music night</p>
                    <p class="mt-1 text-[0.68rem] leading-snug text-[#6c6862]">You both love music, and you're both free Friday.</p>
                    <div class="mt-2.5 flex items-center gap-1.5 text-[0.65rem] font-medium text-[#393737]">
                      <span class="rounded-full bg-[#f3f2f0] px-2 py-0.5">Fri · 7pm</span>
                      <span class="rounded-full bg-[#f3f2f0] px-2 py-0.5">Osu, Accra</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <h3 class="font-display mb-1.5 text-2xl font-normal tracking-tight text-[#393737] sm:text-3xl">{{ step.title }}</h3>
            <p class="max-w-[19rem] text-base leading-relaxed text-[#74777a]">{{ step.description }}</p>
          </article>
        </div>

        <div class="mt-5 flex justify-center">
          <NuxtLink to="/vibe-check" class="btn-solid grain grain-strong px-8 py-4 text-lg sm:px-10 sm:py-5">Get started</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ CONNECTION STORIES ============ -->
    <section id="stories" class="relative isolate overflow-hidden bg-gradient-to-b from-[#f7f7f7] via-[#edf3f8] to-[#e5eef7] px-4 py-10 sm:px-6 sm:py-14">
      <svg aria-hidden="true" viewBox="0 0 440 230" class="cloud-drift pointer-events-none absolute -left-28 top-5 w-[300px] opacity-90 sm:-left-20 sm:top-8 sm:w-[440px]">
        <defs><filter id="cloud-left-soft" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="5" /></filter></defs>
        <g fill="#fff" filter="url(#cloud-left-soft)">
          <ellipse cx="185" cy="157" rx="165" ry="53" />
          <circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" />
          <circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" />
          <circle cx="352" cy="144" r="47" />
        </g>
      </svg>
      <svg aria-hidden="true" viewBox="0 0 500 250" class="cloud-drift cloud-drift-reverse pointer-events-none absolute -right-32 -top-5 w-[330px] opacity-90 sm:-right-20 sm:top-0 sm:w-[500px]">
        <defs><filter id="cloud-right-soft" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="6" /></filter></defs>
        <g fill="#fff" filter="url(#cloud-right-soft)">
          <ellipse cx="258" cy="173" rx="206" ry="57" />
          <circle cx="137" cy="144" r="59" /><circle cx="203" cy="105" r="82" />
          <circle cx="291" cy="85" r="91" /><circle cx="378" cy="113" r="80" />
          <circle cx="432" cy="151" r="57" />
        </g>
      </svg>
      <div class="relative mx-auto max-w-6xl">
        <h2 class="font-display manual-bold mx-auto max-w-2xl py-4 text-center text-[1.875rem] xs:text-4xl leading-[1.05] tracking-tight text-balance text-[#393737] sm:py-8 sm:text-5xl md:text-6xl">
          Your next story<br>starts with a real connection.
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-[#737373] sm:text-lg">Thoughtful introductions begin with what matters most to you.</p>

        <!-- The same soft painted vignette as the match letter, blending into the page -->
        <LetterVignette scene="meet" class="story-art mx-auto mt-8 w-56 sm:mt-10 sm:w-72" />
      </div>
    </section>

    <!-- ============ FEATURE CARDS ============ -->
    <section class="overflow-hidden bg-[#f7f7f7] px-4 py-10 sm:px-6 sm:py-14">
        <div class="mx-auto max-w-6xl">
        <h2 class="font-display manual-bold mx-auto mb-7 max-w-3xl py-4 text-center text-[1.875rem] xs:text-4xl leading-[1.08] tracking-tight text-balance text-[#393737] sm:mb-8 sm:py-8 sm:text-5xl md:text-6xl">
          One place to meet.<br>More ways to connect.
        </h2>
        <div class="grid gap-5 md:grid-cols-2 md:gap-6">
          <!-- Matches -->
          <article class="flex h-[540px] flex-col items-center overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[#e9ecf1] to-[#f3f4f6] px-5 pt-10 text-center sm:h-[680px] sm:px-6 sm:rounded-[3rem] sm:pt-16">
            <h3 class="font-display text-[2.75rem] leading-none tracking-tight text-[#393737] sm:text-5xl lg:text-6xl">Matches</h3>
            <p class="mt-3 text-base text-[#6c6b6b] xs:text-lg sm:mt-4 sm:text-xl">Weekly introductions, values first</p>
            <NuxtLink to="/how-it-works" class="group mt-4 inline-flex items-center gap-2.5 sm:mt-6 text-base font-semibold tracking-tight text-[#393737] sm:text-lg">
              Learn more
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#393737] text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="m9 18 6-6-6-6" /></svg></span>
            </NuxtLink>

            <div class="device mt-auto" aria-hidden="true">
              <div class="device-screen px-4 pt-7 sm:px-5">
                <NuxtImg src="/ama_profile.png" alt="" class="mx-auto h-[4.5rem] w-[4.5rem] rounded-full object-cover shadow-[0_6px_16px_rgba(0,0,0,0.12)]" />
                <p class="mt-3 flex items-center justify-center gap-1 text-[10px] font-semibold text-[#393737]"><span class="text-[#9b9898]">❦</span> Verified Member <span class="-scale-x-100 text-[#9b9898]">❦</span></p>
                <p class="mt-1 font-display text-2xl tracking-tight text-[#393737]">Ama Owusu</p>

                <div class="mt-5 rounded-2xl border border-[#ececec] p-3 text-left">
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-sm font-medium text-[#393737]"><svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>Your match</span>
                    <span class="text-[11px] text-[#6c6b6b]">View ›</span>
                  </div>
                  <div class="mt-2.5 grid grid-cols-2 gap-2">
                    <div class="rounded-xl border border-[#ececec] p-2.5">
                      <span class="iri-tile block h-8 w-6 rounded-md"></span>
                      <p class="mt-2 text-xs font-medium text-[#393737]">Values</p>
                      <p class="whitespace-nowrap text-[9px] text-[#6c6b6b]">92% aligned</p>
                    </div>
                    <div class="rounded-xl border border-[#ececec] p-2.5">
                      <span class="iri-tile block h-7 w-7 rounded-md"></span>
                      <p class="mt-2.5 text-xs font-medium text-[#393737]">Lifestyle</p>
                      <p class="text-[9px] text-[#6c6b6b]">Easygoing</p>
                    </div>
                  </div>
                </div>

                <div class="mt-3 rounded-2xl border border-[#ececec] p-3 text-left">
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-xs font-medium text-[#393737]"><svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z" /></svg>Why you click</span>
                    <span class="text-[11px] text-[#9b9898]">ⓘ</span>
                  </div>
                  <div class="mt-2 flex gap-2.5">
                    <NuxtImg src="/images/landing/picnic.jpg" alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover" />
                    <div class="flex-1 divide-y divide-[#f0f0f0] text-[10px]">
                      <p class="pb-1 font-medium text-[#393737]">Accra 🇬🇭</p>
                      <p class="flex justify-between py-1 text-[#4c4c4c]"><span>Family</span><span class="text-[#3f8f5b]">✓ Shared</span></p>
                      <p class="flex justify-between pt-1 text-[#4c4c4c]"><span>Faith</span><span class="text-[#3f8f5b]">✓ Shared</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <!-- Events -->
          <article class="flex h-[540px] flex-col items-center overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[#e9ecf1] to-[#f3f4f6] px-5 pt-10 text-center sm:h-[680px] sm:px-6 sm:rounded-[3rem] sm:pt-16">
            <h3 class="font-display text-[2.75rem] leading-none tracking-tight text-[#393737] sm:text-5xl lg:text-6xl">Events</h3>
            <p class="mt-3 text-base text-[#6c6b6b] xs:text-lg sm:mt-4 sm:text-xl">Curated nights, made for conversation</p>
            <NuxtLink to="/events" class="group mt-4 inline-flex items-center gap-2.5 sm:mt-6 text-base font-semibold tracking-tight text-[#393737] sm:text-lg">
              Learn more
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#393737] text-white transition-transform group-hover:translate-x-0.5" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="m9 18 6-6-6-6" /></svg></span>
            </NuxtLink>

            <div class="device mt-auto" aria-hidden="true">
              <div class="device-screen">
                <div class="relative h-[44%] overflow-hidden bg-gradient-to-b from-[#c9d9ea] sm:h-[52%] via-[#dfe8f2] to-white">
                  <svg viewBox="0 0 200 80" class="absolute -left-10 top-[38%] w-40 opacity-90"><g fill="#fff" filter="blur(3px)"><ellipse cx="100" cy="58" rx="90" ry="20" /><circle cx="60" cy="45" r="24" /><circle cx="100" cy="34" r="30" /><circle cx="140" cy="46" r="22" /></g></svg>
                  <svg viewBox="0 0 200 80" class="absolute -right-12 top-[58%] w-44 opacity-90"><g fill="#fff" filter="blur(3px)"><ellipse cx="100" cy="58" rx="90" ry="20" /><circle cx="60" cy="45" r="24" /><circle cx="100" cy="34" r="30" /><circle cx="140" cy="46" r="22" /></g></svg>
                  <svg viewBox="0 0 120 110" class="absolute left-1/2 top-[22%] w-28 -translate-x-1/2 -rotate-12 drop-shadow-[0_10px_14px_rgba(80,100,130,0.25)] sm:w-32">
                    <defs>
                      <linearGradient id="evt-heart" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset=".55" stop-color="#e6e9ef" /><stop offset="1" stop-color="#c3c9d4" /></linearGradient>
                      <radialGradient id="evt-heart-shine" cx=".3" cy=".25" r=".35"><stop offset="0" stop-color="#fff" stop-opacity=".95" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></radialGradient>
                    </defs>
                    <path d="M60 100 14 56C2 44 3 24 17 14c12-9 29-6 43 10 14-16 31-19 43-10 14 10 15 30 3 42Z" fill="url(#evt-heart)" />
                    <path d="M60 100 14 56C2 44 3 24 17 14c12-9 29-6 43 10 14-16 31-19 43-10 14 10 15 30 3 42Z" fill="url(#evt-heart-shine)" />
                  </svg>
                  <svg viewBox="0 0 24 24" class="absolute left-[60%] top-[14%] w-5 text-white drop-shadow"><path fill="currentColor" d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12-.6-6.5-5.5-11.4-12-12C6.5 11.4 11.4 6.5 12 0Z" /></svg>
                  <svg viewBox="0 0 24 24" class="absolute left-[66%] top-[30%] w-7 text-white drop-shadow"><path fill="currentColor" d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12-.6-6.5-5.5-11.4-12-12C6.5 11.4 11.4 6.5 12 0Z" /></svg>
                </div>
                <div class="px-5 pt-2 text-center">
                  <p class="font-display text-2xl leading-tight tracking-tight text-[#393737] sm:text-[1.7rem]">Your table<br>is waiting</p>
                  <p class="mt-2 text-sm text-[#6c6b6b]">Small groups, balanced ratios</p>
                  <span class="mt-4 inline-flex rounded-full bg-[#393737] px-7 py-2.5 sm:mt-5 text-sm font-medium text-white">Get started</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section id="faq" class="bg-[#f7f7f7] px-4 py-10 sm:px-6 sm:py-14">
      <div class="mx-auto w-full max-w-3xl">
        <h2 class="font-display manual-bold mx-auto mb-7 max-w-[700px] py-4 text-center text-[1.875rem] xs:text-4xl leading-[1.08] tracking-tight text-balance text-[#393737] sm:mb-8 sm:py-8 sm:text-5xl md:text-6xl">
          Got questions?<br>Here's the answers.
        </h2>
        <div class="space-y-3">
          <div v-for="(f, i) in faqs" :key="i" class="rounded-[1.25rem] bg-white px-5 sm:rounded-[1.5rem] sm:px-7">
            <h3 class="flex">
              <button
                type="button"
                class="flex min-h-[68px] flex-1 items-center justify-between gap-5 py-4 text-left font-display text-base leading-snug text-[#393737] sm:min-h-[76px] sm:text-lg"
                :aria-expanded="openFaq === i"
                @click="openFaq = openFaq === i ? null : i"
              >
                {{ f.q }}
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-white">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" class="h-4 w-4 transition-transform duration-200" :class="openFaq === i ? 'rotate-180' : ''">
                    <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95637 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" />
                  </svg>
                </span>
              </button>
            </h3>
            <div v-show="openFaq === i" class="pb-5 pr-10 text-sm leading-relaxed text-[#737373] sm:pb-6 sm:text-base">{{ f.a }}</div>
          </div>
        </div>
        <div class="mt-6 flex justify-center sm:mt-8">
          <NuxtLink to="/vibe-check" class="btn-solid grain grain-strong px-8 py-4 text-lg sm:px-10 sm:py-5">Get started</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ CITY REQUEST ============ -->
    <section id="waitlist-section" class="bg-[#f7f7f7] px-4 py-10 sm:px-6 sm:py-14">
      <div class="city-sky relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] px-6 py-16 text-center sm:rounded-[3rem] sm:py-24">
        <svg aria-hidden="true" viewBox="0 0 440 230" class="cloud-drift pointer-events-none absolute -left-24 top-6 -z-10 w-[260px] opacity-95 sm:-left-16 sm:top-10 sm:w-[400px]">
          <defs><filter id="city-cloud-a" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="5" /></filter></defs>
          <g fill="#fff" filter="url(#city-cloud-a)">
            <ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" />
            <circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /><circle cx="352" cy="144" r="47" />
          </g>
        </svg>
        <svg aria-hidden="true" viewBox="0 0 500 250" class="cloud-drift cloud-drift-reverse pointer-events-none absolute -bottom-10 -right-28 -z-10 w-[300px] opacity-95 sm:-right-16 sm:w-[480px]">
          <defs><filter id="city-cloud-b" x="-15%" y="-25%" width="130%" height="160%"><feGaussianBlur stdDeviation="6" /></filter></defs>
          <g fill="#fff" filter="url(#city-cloud-b)">
            <ellipse cx="258" cy="173" rx="206" ry="57" /><circle cx="137" cy="144" r="59" /><circle cx="203" cy="105" r="82" />
            <circle cx="291" cy="85" r="91" /><circle cx="378" cy="113" r="80" /><circle cx="432" cy="151" r="57" />
          </g>
        </svg>

        <div class="mx-auto max-w-2xl">
          <p class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#5f5b57] shadow-[0_4px_14px_rgba(57,55,55,0.06)] backdrop-blur">
            <span aria-hidden="true">🇬🇭 🇰🇪</span> Live in Accra &amp; Nairobi
          </p>
          <h2 class="font-display manual-bold mt-6 text-[1.875rem] xs:text-4xl leading-[1.08] tracking-tight text-balance text-[#393737] sm:text-5xl md:text-6xl">
            Your city could be next.
          </h2>
          <p class="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#5f6b78] sm:text-lg">Tell us where you'd like to meet someone new. We'd love to bring Minutes 2 Match to you.</p>

          <form class="mx-auto mt-8 w-full max-w-md" @submit.prevent="requestCity">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:bg-white sm:p-1.5 sm:shadow-[0_10px_30px_rgba(57,77,100,0.12)]">
              <label class="flex flex-1 items-center gap-2 rounded-full bg-white px-5 shadow-[0_10px_30px_rgba(57,77,100,0.12)] sm:bg-transparent sm:pl-4 sm:pr-2 sm:shadow-none">
                <span class="sr-only">Your city</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#9b9690]" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
                <input v-model="requestedCity" type="text" autocomplete="address-level2" placeholder="Your city, e.g. Lagos" required class="h-12 w-full min-w-0 bg-transparent text-base text-[#393737] outline-none placeholder:text-[#9b9690]" />
              </label>
              <button type="submit" class="btn-solid grain grain-strong px-7 py-3.5 text-base">Request my city</button>
            </div>
          </form>
          <p class="mt-4 text-sm text-[#7a8590]">Opens your email app. We read every request.</p>
        </div>
      </div>
    </section>

    <!-- ============ FOOTER ============ -->
    <footer id="footer" class="relative overflow-hidden bg-[#f7f7f7] px-4 pt-14 text-[#393737] sm:px-6 sm:pt-20">
      <div class="mx-auto max-w-6xl">
        <!-- Closing CTA -->
        <div class="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-white p-7 text-center shadow-[0_10px_40px_rgba(57,55,55,0.06)] sm:flex-row sm:p-10 sm:text-left">
          <div>
            <p class="font-display text-3xl leading-tight tracking-tight text-[#393737] sm:text-4xl">Ready to meet someone real?</p>
            <p class="mt-2 text-base text-[#737373]">Take the free Vibe Check. It only takes 5 minutes.</p>
          </div>
          <NuxtLink to="/vibe-check" class="btn-solid grain grain-strong w-full shrink-0 px-8 py-4 text-base sm:w-auto sm:text-lg">Get started <span aria-hidden="true">→</span></NuxtLink>
        </div>

        <div class="mt-14 grid gap-12 sm:mt-16 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <!-- Brand -->
          <div>
            <NuxtLink to="/" aria-label="Minutes 2 Match home" class="relative block h-10 w-[220px] overflow-hidden sm:h-12 sm:w-[250px]">
              <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[160px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain sm:h-[184px]" />
            </NuxtLink>
            <p class="mt-4 max-w-sm text-[15px] leading-relaxed text-[#77736f]">Thoughtful introductions and curated events to help you meet with intention.</p>

            <nav aria-label="Social links" class="mt-6 flex items-center gap-2 text-[#5f5b57]">
              <a href="https://www.instagram.com/minutes2match" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5 transition-colors hover:bg-[#fce8e8] hover:text-[#ed1c24]">
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/></svg>
              </a>
              <a href="mailto:hello@minutes2match.com" aria-label="Email" class="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5 transition-colors hover:bg-[#fce8e8] hover:text-[#ed1c24]">
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.5 7h15L12 12.2ZM4 8.3V17h16V8.3l-7.4 5.1a1 1 0 0 1-1.2 0L4 8.3Z"/></svg>
              </a>
            </nav>
          </div>

          <!-- Link columns -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-10 lg:justify-self-end lg:gap-x-20">
            <nav v-for="col in footerCols" :key="col.title" :aria-label="col.title">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9692]">{{ col.title }}</p>
              <ul class="mt-4 space-y-3">
                <li v-for="l in col.links" :key="l.label">
                  <a v-if="l.section" :href="`#${l.section}`" class="text-[15px] font-medium text-[#393737] transition-colors hover:text-[#ed1c24]" @click.prevent="scrollToSection(l.section)">{{ l.label }}</a>
                  <a v-else-if="l.href" :href="l.href" :target="l.href.startsWith('http') ? '_blank' : undefined" :rel="l.href.startsWith('http') ? 'noopener noreferrer' : undefined" class="text-[15px] font-medium text-[#393737] transition-colors hover:text-[#ed1c24]">{{ l.label }}</a>
                  <NuxtLink v-else :to="l.to!" class="text-[15px] font-medium text-[#393737] transition-colors hover:text-[#ed1c24]">{{ l.label }}</NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div class="mt-14 flex flex-col gap-4 border-t border-black/[0.06] pb-10 pt-6 text-sm text-[#96918d] sm:flex-row sm:items-center sm:justify-between">
          <p>© {{ year }} Minutes 2 Match. Made with <span class="text-[#ed1c24]" aria-label="love">♥</span> in Accra &amp; Nairobi.</p>
          <a href="#" class="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#393737]" @click.prevent="scrollToTop">
            Back to top
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
          </a>
        </div>
      </div>

    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

useSeoMeta({
  title: 'Minutes 2 Match | Real Connections via Protocol & Events',
  ogTitle: 'Minutes 2 Match | Date without swiping',
  description: 'Date without swiping. We get to know you deeply, then introduce you to a compatible match and curated events in Accra.',
  ogDescription: 'Date without swiping. We get to know you deeply, then introduce you to a compatible match each week.',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Minutes 2 Match | Date without swiping',
  twitterDescription: 'We get to know you deeply, then introduce you to a compatible match each week.',
  twitterImage: '/og-image.png',
})

const config = useRuntimeConfig()
const router = useRouter()
const year = new Date().getFullYear()
const scrollToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
// Glide to a section on this page and keep the address bar in step (#how-it-works)
const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${id}`)
}

const footerCols: { title: string; links: { label: string; to?: string; href?: string; section?: string }[] }[] = [
  { title: 'Product', links: [{ label: 'How it works', section: 'how-it-works' }, { label: 'Events', to: '/events' }, { label: 'Vibe Check', to: '/vibe-check' }] },
  { title: 'Company', links: [{ label: 'Contact', href: 'mailto:hello@minutes2match.com' }, { label: 'Instagram', href: 'https://www.instagram.com/minutes2match' }, { label: 'Terms', to: '/terms' }, { label: 'Privacy', to: '/privacy' }] },
]
const mobileMenuOpen = ref(false)
const heroWords = ['person', 'match', 'spark']
const heroWordIndex = ref(0)
let heroWordTimer: ReturnType<typeof setInterval> | undefined

const mobileLinks = [
  { to: '/events', label: 'Events' },
  { to: '/login', label: 'Log in' },
]
// Hero: vibe-check already accepts ?phone= and normalises it
const phone = ref('')
const phoneCountry = ref<PhoneCountryCode>('+233')
const heroPhoneError = ref('')
// Typing or pasting +233… / +254… switches the country automatically
const heroPhone = computed({
  get: () => phone.value,
  set: (raw: string) => {
    const { country, local } = parsePhoneInput(raw, phoneCountry.value)
    phoneCountry.value = country
    phone.value = local
    heroPhoneError.value = ''
  },
})
watch(phoneCountry, () => { heroPhoneError.value = '' })
// Signed-in members go to their account; registered numbers go to OTP login; new numbers start the Vibe Check
const user = useSupabaseUser()
const heroSubmitting = ref(false)
const handleHeroSubmit = async () => {
  if (user.value) return navigateTo('/me')

  if (!phone.value) return router.push('/vibe-check')

  if (!isValidLocalPhone(phone.value, phoneCountry.value)) {
    const c = getPhoneCountry(phoneCountry.value)
    heroPhoneError.value = `Enter a valid ${c.name} number, e.g. ${c.example}`
    return
  }

  const fullPhone = toE164(phone.value, phoneCountry.value)
  heroSubmitting.value = true
  try {
    const { registered } = await $fetch<{ registered: boolean }>('/api/auth/phone-status', {
      method: 'POST',
      body: { phone: fullPhone },
    })
    await router.push({ path: registered ? '/login' : '/vibe-check', query: { phone: fullPhone } })
  } catch {
    // If the check fails, fall back to the Vibe Check (it handles returning users too)
    await router.push({ path: '/vibe-check', query: { phone: fullPhone } })
  } finally {
    heroSubmitting.value = false
  }
}

const howItWorksSteps = [
  {
    title: 'Tell us about you',
    description: 'Share your values, interests, and what you want.',
  },
  {
    title: 'Get matched',
    description: 'Meet someone compatible, with a note on why you click.',
  },
  {
    title: 'Go on a date!',
    description: 'Get date ideas tailored to you both. Take it from there.',
  },
]

// Story video: set to the video URL (e.g. '/videos/story.mp4') to enable the play button

const openFaq = ref<number | null>(null)
const faqs = [
  { q: 'How does Minutes 2 Match work?', a: 'Take the Vibe Check, a short questionnaire about your values, lifestyle and what you want. We use it to find people you\'re genuinely compatible with, then introduce you to a match or invite you to a curated event.' },
  { q: 'Is Minutes 2 Match in my city?', a: 'We\'re live in Accra and Nairobi. Email hello@minutes2match.com and we\'ll let you know when we launch near you.' },
  { q: 'What if Minutes 2 Match is not in my city?', a: 'Email hello@minutes2match.com and tell us where you\'d like us to launch next.' },
  { q: 'Who can join?', a: 'Any adult looking for something intentional. Every profile is reviewed before it enters the matching pool.' },
  { q: 'What do you do with my data?', a: 'Your answers are only used to compute compatibility. We never sell your data and your profile is never publicly listed.' },
  { q: 'Does it cost money?', a: 'No. The Vibe Check and matching are free. Opt in each week, and when you and your match both say you\'re interested, you can reach each other.' },
  { q: 'How are events curated?', a: 'We cap numbers, balance ratios and use Vibe Check data so the people in the room are people you could actually click with.' },
]

// City request: opens a pre-filled email
const requestedCity = ref('')
const requestCity = () => {
  const city = requestedCity.value.trim()
  if (!city) return
  window.location.href = `mailto:hello@minutes2match.com?subject=${encodeURIComponent(`Bring Minutes 2 Match to ${city}`)}&body=${encodeURIComponent(`Hi! I'd love to see Minutes 2 Match in ${city}.`)}`
}
onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroWordTimer = window.setInterval(() => {
      heroWordIndex.value = (heroWordIndex.value + 1) % heroWords.length
    }, 3400)
  }
})
onBeforeUnmount(() => {
  if (heroWordTimer) window.clearInterval(heroWordTimer)
})
</script>

<style scoped>
/* "A better way to meet" step graphics: a little life on hover */
.hiw-front, .hiw-back, .hiw-left, .hiw-right {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), rotate 0.5s cubic-bezier(0.22, 1, 0.36, 1), translate 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .hiw-card:hover .hiw-front { translate: 0 -6px; }
  .hiw-card:hover .hiw-back { rotate: -10deg; }
  .hiw-card:hover .hiw-back.rotate-6 { rotate: 10deg; }
  .hiw-card:hover .hiw-left { rotate: -10deg; translate: -6px 0; }
  .hiw-card:hover .hiw-right { rotate: 10deg; translate: 6px 0; }
}
.dd-page {
  /* Same type as the match letter: Messina Sans (Hanken Grotesk until licensed) at medium weight, slightly tight */
  font-family: 'Messina Sans', 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  letter-spacing: -0.025em;
}
.dd-page :deep(input) { min-height: 3.5rem; }
.hero-rise {
  animation: hero-rise-in 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero-rise-1 { animation-delay: 80ms; }
.hero-rise-2 { animation-delay: 190ms; }
.hero-rise-3 { animation-delay: 320ms; }
.hero-rise-4 { animation-delay: 440ms; }
.hero-word-live { white-space: nowrap; }
.cloud-drift {
  animation: cloud-drift 32s ease-in-out infinite alternate;
  will-change: transform;
}
.cloud-drift-reverse {
  animation-duration: 40s;
  animation-direction: alternate-reverse;
}
.hero-word-enter-active,
.hero-word-leave-active {
  will-change: opacity, transform, filter;
  transition: opacity 360ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1), filter 360ms ease;
}
.hero-word-enter-active {
  will-change: opacity, transform, filter;
  transition: opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease;
}
.hero-word-enter-from { opacity: 0; transform: translateY(0.24em); filter: blur(7px); }
.hero-word-leave-to { opacity: 0; transform: translateY(-0.16em); filter: blur(5px); }
@keyframes hero-rise-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes cloud-drift {
  from { transform: translate3d(-1.25rem, 0, 0) scale(0.96); }
  to { transform: translate3d(2rem, 0.75rem, 0) scale(1.04); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-rise { animation: none; }
  .cloud-drift { animation: none; }
  .hero-word-enter-active,
  .hero-word-leave-active { transition: none; }
}
.font-display {
  /* Same as the match letter: Untitled Serif (Source Serif 4 until licensed) at regular weight */
  font-family: 'Untitled Serif', 'Source Serif 4', Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.025em;
}
.manual-bold {
  -webkit-text-stroke-width: 0;
}

/* Product card phone mockup */
.device {
  position: relative;
  width: min(88%, 310px);
  height: 340px;
  padding: 3px 3px 0;
  border-radius: 3.4rem 3.4rem 0 0;
  background: linear-gradient(90deg, #b9b9b9, #e4e4e4 18%, #cfcfcf 50%, #e4e4e4 82%, #b9b9b9);
  box-shadow: 0 -2px 30px rgba(0, 0, 0, 0.08);
}
@media (min-width: 640px) {
  .device { height: 420px; }
}
.device::before,
.device::after {
  content: '';
  position: absolute;
  width: 3px;
  border-radius: 2px;
  background: #c4c4c4;
}
.device::before { left: -3px; top: 25%; height: 18%; }
.device::after { right: -3px; top: 35%; height: 22%; }
.device-screen {
  height: 100%;
  overflow: hidden;
  border: 10px solid #1c1c1c;
  border-bottom: 0;
  border-radius: 3.25rem 3.25rem 0 0;
  background: #fff;
}
.iri-tile {
  border: 1px solid #b8b8b8;
  background: linear-gradient(135deg, #f5f5f5 0%, #d6d9de 30%, #ffffff 50%, #cfd3da 75%, #eeeeee 100%);
}

/* City request */
.city-sky {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.7) 0%, transparent 60%),
    linear-gradient(180deg, #cddcec 0%, #e1eaf4 45%, #f3ece6 100%);
}

/* Footer */
/* Film-grain overlay on buttons */
.grain {
  position: relative;
  overflow: hidden;
}
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: var(--grain-opacity, 0.3);
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}
.grain-strong {
  --grain-opacity: 0.55;
}

.btn-solid,
.btn-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border-width: 1px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: inset 0 2px 4px 0 var(--tw-inset, rgba(0, 0, 0, 0.05));
  transition: color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms;
}
.btn-solid,
.btn-solid-colors {
  background-color: #ed1c24;
  color: #fff;
  border-color: transparent;
  --tw-inset: rgba(255, 255, 255, 0.2);
}
.btn-solid:hover,
.btn-solid-colors:hover {
  background-color: #d71920;
}
.btn-light {
  background-color: rgb(253 243 243);
  color: rgb(115 40 55);
  border-color: rgb(245 214 215 / 0.5);
  --tw-inset: rgb(255 255 255 / 0.3);
}
.btn-light:hover {
  background-color: rgb(245 214 215);
}
.btn-white-colors {
  background-color: #fff;
  color: #393737;
  border-color: #d3d2d1;
}
.btn-white-colors:hover {
  background-color: #f0f0f0;
}
</style>
