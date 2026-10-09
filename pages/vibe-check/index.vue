<template>
  <main class="m2m-app relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-gradient-to-b from-white via-white to-[#f7f7f7] text-[#393737] antialiased">
    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-[#ed1c24]/[0.045] blur-3xl"></div>
    <div aria-hidden="true" class="pointer-events-none absolute -right-32 top-56 h-72 w-72 rounded-full bg-[#f3c7bd]/25 blur-3xl"></div>

    <!-- Retake confirmation: a bottom sheet on phones, a centred card on larger screens -->
    <Transition name="modal">
      <div v-if="showRetakeModal" class="fixed inset-0 z-[100] flex items-end justify-center bg-[#1f1c1a]/35 backdrop-blur-[3px] sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="retake-title" @click.self="cancelRetake">
        <div class="relative w-full max-w-md overflow-hidden rounded-t-[2rem] bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-center shadow-[0_-12px_50px_rgba(0,0,0,0.14)] sm:rounded-[2rem] sm:px-8 sm:pb-8 sm:pt-8 sm:shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <span class="mx-auto mb-3 block h-1 w-10 rounded-full bg-[#e7e3de] sm:hidden" aria-hidden="true"></span>

          <LetterVignette scene="dawn" class="mx-auto w-24 sm:w-28" />

          <h2 id="retake-title" class="font-display mt-3 text-[1.9rem] leading-[1.1] tracking-tight text-[#393737] sm:text-[2.1rem]">Retake the Vibe Check?</h2>
          <p class="mx-auto mt-2.5 max-w-[22rem] text-base leading-relaxed text-[#6c6862]">
            Your new answers will replace the old ones, so future matches reflect who you are today.
          </p>

          <ul class="mx-auto mt-5 max-w-[22rem] space-y-2.5 rounded-2xl bg-[#f7f6f4] px-4 py-3.5 text-left text-sm text-[#393737]">
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#ed1c24] ring-1 ring-black/5" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
              </span>
              Your answers and compatibility scores are recalculated
            </li>
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#2f7a4d] ring-1 ring-black/5" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              Your name, photo and past matches stay as they are
            </li>
            <li class="flex items-start gap-2.5">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#2f7a4d] ring-1 ring-black/5" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              </span>
              Takes about 3 minutes
            </li>
          </ul>

          <div class="mt-6 flex flex-col gap-1">
            <button type="button" class="btn-next" style="max-width: none" @click="confirmRetake">Yes, retake it</button>
            <button type="button" class="w-full rounded-full py-3 text-sm font-medium text-[#6c6862] transition-colors hover:text-[#393737]" @click="cancelRetake">Not now</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Progress -->
    <div class="fixed inset-x-0 top-0 z-30 h-[3px] bg-[#f1efec]" role="progressbar" :aria-valuenow="Math.round(progressPercentage)" aria-valuemin="0" aria-valuemax="100" aria-label="Progress">
      <div class="h-full rounded-r-full bg-[#ed1c24] transition-[width] duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Top bar: back on the left, logo centred, close on the right (members only) -->
    <header class="sticky top-0 z-20 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div class="relative mx-auto flex h-14 max-w-lg items-center justify-between px-4 sm:h-16">
        <button v-if="canGoBack" type="button" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa] active:scale-95" aria-label="Previous question" @click="prevStep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <span v-else class="h-10 w-10" aria-hidden="true"></span>

        <span v-if="isMemberFlow" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </span>
        <NuxtLink v-else to="/" aria-label="Minutes 2 Match home" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>

        <NuxtLink v-if="isMemberFlow && currentStep < doneStep" to="/me" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa] active:scale-95" aria-label="Close and go back to your account">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-4 w-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </NuxtLink>
        <span v-else class="h-10 w-10" aria-hidden="true"></span>
      </div>
    </header>

    <!-- Saving answers (retake / returning member) -->
    <Teleport to="body">
      <div v-if="isCreatingProfile && currentStep <= lastQuestionStep" class="m2m-app fixed inset-0 z-[110] flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-sm" role="status" aria-live="polite">
        <div class="h-10 w-10 animate-spin rounded-full border-[3px] border-[#ece8e3] border-t-[#ed1c24]"></div>
        <p class="text-lg text-[#393737]">Saving your answers…</p>
      </div>
    </Teleport>

    <!-- Content Container -->
    <div v-if="holdContent" class="flex flex-1 items-center justify-center" aria-hidden="true">
      <div class="h-8 w-8 animate-spin rounded-full border-[3px] border-[#ece8e3] border-t-[#ed1c24]"></div>
    </div>
    <div v-else class="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 sm:pt-12">

      <!-- Step 1: Quick Intro -->
      <div v-if="currentStep === 1" class="w-full animate-fade-in">
        <!-- Sky + phone, fading into the form -->
        <div class="relative -mx-5 -mt-8 mb-2 h-56 sm:-mt-12 sm:h-64" aria-hidden="true">
          <div class="sky-glow absolute -inset-x-40 -top-24 bottom-0"></div>
          <svg viewBox="0 0 440 230" class="cloud-drift absolute -left-16 top-6 w-56 opacity-90"><g fill="#fff" style="filter: blur(5px)"><ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" /><circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /></g></svg>
          <svg viewBox="0 0 440 230" class="cloud-drift cloud-drift-reverse absolute -right-20 top-0 w-64 opacity-90"><g fill="#fff" style="filter: blur(6px)"><ellipse cx="185" cy="157" rx="165" ry="53" /><circle cx="91" cy="133" r="56" /><circle cx="151" cy="91" r="76" /><circle cx="227" cy="82" r="84" /><circle cx="302" cy="112" r="67" /></g></svg>
          <div class="absolute bottom-0 left-1/2 w-[11.5rem] -translate-x-1/2 rounded-t-[2.2rem] border-[6px] border-b-0 border-[#1f1f1f] bg-white px-3 pt-3 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
            <div class="mx-auto mb-3 h-4 w-16 rounded-full bg-black"></div>
            <img src="/ama_profile.png" alt="" class="mx-auto h-14 w-14 rounded-full object-cover" />
            <p class="font-display mt-2 text-center text-sm text-[#393737]">Your match is here</p>
            <p class="mt-0.5 text-center text-[10px] text-[#9b9690]">92% compatible · Accra</p>
            <div class="mt-3 grid grid-cols-2 gap-1.5">
              <div class="h-12 rounded-xl bg-[#f6f6f7]"></div>
              <div class="h-12 rounded-xl bg-[#f6f6f7]"></div>
            </div>
          </div>
        </div>

        <h1 class="font-display text-center text-[2.4rem] leading-[1.05] tracking-tight text-balance sm:text-5xl">3 minutes to your next great match.</h1>

        <!-- About you: one card, name then two segmented choices -->
        <div class="mt-8 space-y-6 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_36px_rgba(57,55,55,0.06)] ring-1 ring-black/5 sm:p-6">
          <div>
            <label for="vc-name" class="mb-2 block text-sm text-[#6c6862]">Your first name</label>
            <div class="relative">
              <input
                id="vc-name"
                v-model="form.displayName"
                type="text"
                placeholder="e.g. Ama"
                autocomplete="given-name"
                autocapitalize="words"
                maxlength="20"
                class="h-14 w-full rounded-2xl border border-[#e5e2dd] bg-[#fbfaf9] px-4 pr-12 text-lg text-[#393737] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a8a39d] hover:border-[#cfc9c1] focus:border-[#393737] focus:bg-white focus:ring-4 focus:ring-black/5"
                @keyup.enter="canProceedStep1 && nextStep()"
              />
              <span v-if="form.displayName.trim().length >= 2" class="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#393737] text-white" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            </div>
            <p class="mt-2 text-xs text-[#9b9690]">This is the name your matches will see.</p>
          </div>

          <SegmentedControl v-model="form.gender" label="I'm a" :options="GENDER_OPTIONS" />
          <SegmentedControl v-model="form.interestedIn" label="Interested in" :options="INTERESTED_OPTIONS" />
        </div>

        <div class="mt-10 flex flex-col items-center gap-5">
          <button type="button" class="btn-next" :disabled="!canProceedStep1" @click="nextStep">Next</button>
          <p class="text-base text-[#6c6862]">Already signed up? <NuxtLink to="/login" class="font-medium text-[#393737] underline-offset-4 hover:underline">Log in</NuxtLink></p>
          <NuxtLink to="/#how-it-works" class="text-sm text-[#9b9690] underline-offset-4 hover:text-[#393737] hover:underline">How does it work?</NuxtLink>
        </div>
      </div>

      <!-- Step 2: Quick Details -->
      <div v-else-if="currentStep === 2" class="w-full animate-fade-in">
        <h1 class="font-display text-center text-[2.25rem] leading-[1.05] tracking-tight text-balance sm:text-[2.75rem]">Nice to meet you, {{ form.displayName }}.</h1>
        <p class="mt-3 text-center text-lg text-[#6c6862]">A few quick details first.</p>

        <div class="mt-8 space-y-4">
          <div class="space-y-6 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_36px_rgba(57,55,55,0.06)] ring-1 ring-black/5 sm:p-6">
            <fieldset>
              <legend class="mb-2 text-sm text-[#6c6862]">What are you looking for?</legend>
              <ChoiceChips v-model="form.intent" :options="INTENT_OPTIONS" layout="grid-2" :clearable="false" />
            </fieldset>

            <div>
              <p class="mb-2 text-sm text-[#6c6862]">Your birthday</p>
              <UiDatePicker v-model="form.birthDate" placeholder="Pick a date" variant="soft" forBirthday />
            </div>

            <!-- Where you are: Accra or Nairobi, then (optionally) which part -->
            <fieldset>
              <legend class="mb-2 text-sm text-[#6c6862]">Where are you based?</legend>
              <CityPicker v-model="form.location" />
            </fieldset>
          </div>

          <!-- Optional extras: a calm panel that opens in place -->
          <section class="overflow-hidden rounded-[1.5rem] bg-white ring-1 transition-shadow" :class="showExtras ? 'ring-[#393737]/15 shadow-[0_12px_32px_rgba(57,55,55,0.07)]' : 'ring-[#e5e2dd]'">
            <button type="button" class="flex w-full items-center gap-4 px-5 py-4 text-left" :aria-expanded="showExtras" aria-controls="vc-extras" @click="showExtras = !showExtras">
              <!-- Ring fills as details are added -->
              <span class="relative flex h-11 w-11 shrink-0 items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 44 44" class="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="22" cy="22" r="19" fill="none" stroke="#efece8" stroke-width="3" />
                  <circle cx="22" cy="22" r="19" fill="none" stroke="#ed1c24" stroke-width="3" stroke-linecap="round" :stroke-dasharray="`${(extrasFilled / 4) * 119.4} 119.4`" class="transition-[stroke-dasharray] duration-500" />
                </svg>
                <span class="text-sm font-semibold text-[#393737]">{{ extrasFilled }}/4</span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-base font-semibold text-[#393737]">A little more about you</span>
                <span class="block text-sm text-[#9b9690]">{{ extrasFilled === 4 ? 'All added. Thank you!' : 'Optional, but helpful' }}</span>
              </span>
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f2ef] text-[#6c6862] transition-transform duration-300" :class="{ 'rotate-180': showExtras }" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </button>

            <div id="vc-extras" class="grid transition-[grid-template-rows] duration-300 ease-out" :class="showExtras ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
              <div class="min-h-0 overflow-hidden" :inert="!showExtras">
                <div class="space-y-6 border-t border-black/[0.06] px-5 pb-6 pt-5">
                  <!-- Work -->
                  <div>
                    <label for="vc-occupation" class="mb-2 block text-sm text-[#6c6862]">What do you do?</label>
                    <input id="vc-occupation" v-model="form.occupation" type="text" autocomplete="organization-title" maxlength="60" placeholder="e.g. Nurse, designer, student" class="h-12 w-full rounded-2xl border border-[#e5e2dd] bg-[#fbfaf9] px-4 text-base text-[#393737] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a8a39d] hover:border-[#cfc9c1] focus:border-[#393737] focus:bg-white focus:ring-4 focus:ring-black/5" />
                  </div>

                  <!-- Faith -->
                  <fieldset>
                    <legend class="mb-2 text-sm text-[#6c6862]">Faith</legend>
                    <ChoiceChips v-model="form.religion" :options="RELIGIONS" />
                  </fieldset>

                  <HeightSlider v-model="form.height" />

                  <!-- Genotype -->
                  <fieldset>
                    <legend class="mb-2 text-sm text-[#6c6862]">Genotype <span class="text-[#9b9690]">· only if you're comfortable sharing</span></legend>
                    <ChoiceChips v-model="form.genotype" :options="GENOTYPES" layout="grid-4" />
                  </fieldset>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div class="mt-10 flex justify-center">
          <button type="button" class="btn-next" :disabled="!canProceedStep2" @click="nextStep">Next</button>
        </div>
      </div>

      <!-- Vibe Questions: one step per question, grouped into chapters -->
      <div v-else-if="currentStep >= FIRST_QUESTION_STEP && currentStep <= lastQuestionStep" :key="currentStep" class="w-full animate-fade-in space-y-6 sm:space-y-8">
        <!-- Where you are: part, chapter name, and a dot per question in this chapter -->
        <div v-if="currentChapter" class="flex flex-col items-center text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b9690]">Part {{ chapterProgress.part }} of {{ chapterProgress.parts }}</p>
          <p class="font-display mt-1 text-xl leading-tight text-[#393737]">{{ currentChapter.title }}</p>
          <div class="mt-3 flex items-center gap-1.5" :aria-label="`Question ${chapterProgress.index} of ${chapterProgress.count} in this part`" role="img">
            <span
              v-for="n in chapterProgress.count"
              :key="n"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="n === chapterProgress.index ? 'w-6 bg-[#ed1c24]' : n < chapterProgress.index ? 'w-1.5 bg-[#393737]' : 'w-1.5 bg-[#dcd8d3]'"
            ></span>
          </div>
        </div>

        <div v-if="loadingQuestions" class="py-12 text-center">
          <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#ece8e3] border-t-[#ed1c24]"></div>
          <p class="text-[#9b9690]">Getting your questions ready…</p>
        </div>

        <template v-else-if="currentQuestion">
          <h1 class="font-display text-center text-[1.7rem] leading-[1.15] tracking-tight text-balance sm:pt-0 sm:text-[2.4rem]">{{ currentQuestion.question }}</h1>

          <!-- 1–7 statement -->
          <div v-if="currentQuestion.type === 'scale'" class="space-y-4 pt-2">
            <div class="grid grid-cols-7 gap-1 min-[380px]:gap-1.5 sm:gap-2.5" role="radiogroup" :aria-label="currentQuestion.question">
              <button
                v-for="n in 7"
                :key="n"
                type="button"
                role="radio"
                :aria-checked="vibeAnswers[currentQuestion.key] === String(n)"
                :aria-label="`${n}${n === 1 ? ` (${currentQuestion.scale_min_label})` : n === 7 ? ` (${currentQuestion.scale_max_label})` : ''}`"
                class="aspect-square min-h-[2.6rem] rounded-full text-base font-medium transition-all active:scale-95 sm:text-lg"
                :class="vibeAnswers[currentQuestion.key] === String(n) ? 'bg-[#393737] text-white shadow-[0_8px_20px_rgba(57,55,55,0.25)]' : 'bg-white text-[#393737] ring-1 ring-black/10 hover:ring-[#393737]'"
                @click="handleScaleSelect(currentQuestion.key, n)"
              >{{ n }}</button>
            </div>
            <div class="flex justify-between gap-4 text-sm leading-snug text-[#6c6862]">
              <span class="max-w-[45%]"><span aria-hidden="true">← </span>{{ currentQuestion.scale_min_label }}</span>
              <span class="max-w-[45%] text-right">{{ currentQuestion.scale_max_label }}<span aria-hidden="true"> →</span></span>
            </div>
          </div>

          <!-- Top values pick -->
          <div v-else-if="currentQuestion.type === 'values'" class="space-y-6">
            <p class="text-center text-sm text-[#6c6862]">Pick up to {{ valuesLimit }} · {{ selectedValues.length }} picked</p>
            <div class="flex flex-wrap justify-center gap-2">
              <button
                v-for="option in currentQuestion.options"
                :key="option"
                type="button"
                :aria-pressed="selectedValues.includes(option)"
                :disabled="!selectedValues.includes(option) && selectedValues.length >= valuesLimit"
                class="rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 sm:text-base"
                :class="selectedValues.includes(option) ? 'bg-[#393737] text-white' : 'bg-white text-[#393737] ring-1 ring-black/10 hover:ring-[#393737]'"
                @click="toggleValue(currentQuestion.key, option)"
              >{{ cleanLabel(option) }}</button>
            </div>
            <div class="sticky bottom-0 -mx-5 flex justify-center bg-gradient-to-t from-white via-white/95 to-white/0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0 sm:pt-2">
              <button type="button" class="btn-next" style="max-width: none" :disabled="selectedValues.length < 3" @click="confirmValues">{{ selectedValues.length < 3 ? `Pick at least ${3 - selectedValues.length} more` : 'Next' }}</button>
            </div>
          </div>

          <!-- Multiple choice -->
          <div v-else class="space-y-2.5">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              type="button"
              class="flex min-h-[3.5rem] w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.99] sm:px-5 sm:py-4"
              :class="vibeAnswers[currentQuestion.key] === option ? 'bg-white ring-2 ring-[#393737] shadow-[0_8px_24px_rgba(52,38,25,0.08)]' : 'bg-white ring-1 ring-black/5 hover:ring-black/20'"
              @click="handleVibeSelect(currentQuestion.key, option)"
            >
              <span class="flex-1 text-base leading-snug text-[#393737] sm:text-lg">{{ cleanLabel(option) }}</span>
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors" :class="vibeAnswers[currentQuestion.key] === option ? 'bg-[#393737] text-white' : 'ring-1 ring-black/15'" aria-hidden="true">
                <svg v-if="vibeAnswers[currentQuestion.key] === option" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            </button>
          </div>
        </template>
      </div>

      <!-- Phone Verification -->
      <div v-else-if="currentStep === phoneStep" class="w-full animate-fade-in space-y-8">
        <div class="space-y-3 text-center">
          <h1 class="font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-[2.75rem]">Last step.</h1>
          <p class="text-lg text-[#6c6862]">
            <template v-if="!otpSent">Verify your number to save your profile.</template>
            <template v-else>We sent a 6-digit code to <span class="whitespace-nowrap font-semibold text-[#393737]">{{ fullPhone }}</span>{{ sentVia === 'telegram' ? ' on Telegram' : '' }}.</template>
          </p>
        </div>

        <div v-if="!otpSent" class="space-y-3">
          <div class="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_36px_rgba(57,55,55,0.06)] ring-1 ring-black/5 sm:p-6">
            <SegmentedControl v-model="phoneCountry" label="Country" :options="COUNTRY_OPTIONS" size="sm" />
            <div>
              <label for="vc-phone" class="mb-2 block text-sm text-[#6c6862]">Phone number</label>
              <div class="relative">
                <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#9b9690]" aria-hidden="true">{{ phoneCountry }}</span>
                <input
                  id="vc-phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  :placeholder="getPhoneCountry(phoneCountry as any).example"
                  maxlength="15"
                  class="h-14 w-full rounded-2xl border border-[#e5e2dd] bg-[#fbfaf9] px-4 text-lg text-[#393737] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#a8a39d] hover:border-[#cfc9c1] focus:border-[#393737] focus:bg-white focus:ring-4 focus:ring-black/5 no-spin pl-[4.75rem]"
                  :class="contactPickerSupported ? 'pr-12' : ''"
                />
                <button v-if="contactPickerSupported" type="button" class="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#9b9690] transition-colors hover:bg-[#f6f5f4] hover:text-[#393737]" title="Choose from contacts" aria-label="Choose from contacts" @click.prevent="pickVibeContact">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="M16 2v2M8 2v2" /><rect x="3" y="4" width="18" height="18" rx="2" /><circle cx="12" cy="11" r="3" /><path d="M7 19a5 5 0 0 1 10 0" /></svg>
                </button>
              </div>
              <p class="mt-2 text-xs text-[#9b9690]">We'll send a 6-digit code to confirm it's you.</p>
            </div>
          </div>
          <div class="flex justify-center pt-6">
            <button type="button" class="btn-next" :disabled="!isValidPhone || sendingOtp" @click="handleSendOtp">
              {{ sendingOtp ? 'Sending code…' : 'Send code' }}
            </button>
          </div>
        </div>

        <div v-else class="space-y-5">
          <label for="vc-otp" class="sr-only">6-digit verification code</label>
          <input
            id="vc-otp"
            v-model="otpCode"
            type="tel"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="••••••"
            maxlength="6"
            class="font-display no-spin h-16 w-full rounded-[1.25rem] border border-[#e5e2dd] bg-white pl-[0.35em] text-center text-2xl tracking-[0.35em] text-[#393737] outline-none transition-[border-color,box-shadow] placeholder:text-[#d9d4ce] hover:border-[#cfc9c1] focus:border-[#393737] focus:ring-4 focus:ring-black/5 xs:pl-[0.5em] xs:text-3xl xs:tracking-[0.5em]"
            @keyup.enter="otpCode.length === 6 && handleVerifyOtp()"
          />

          <p v-if="otpError" role="alert" class="rounded-2xl bg-[#fff1f1] px-4 py-3 text-center text-sm text-[#b4232a]">{{ otpError }}</p>

          <div class="flex justify-center pt-2">
            <button type="button" class="btn-next" :disabled="otpCode.length !== 6 || verifyingOtp" @click="handleVerifyOtp">
              {{ verifyingOtp ? 'Verifying…' : 'Verify' }}
            </button>
          </div>

          <p class="h-4 text-center text-xs text-[#9b9690]" aria-live="polite">
            <template v-if="fallbackTimer > 0">Sending a backup code in {{ fallbackTimer }}s</template>
            <template v-else-if="fallbackTriggered">Backup code sent 📨</template>
          </p>

          <button class="w-full rounded-full py-2 text-sm font-medium text-[#6c6862] transition-colors hover:text-[#393737]" @click="resetPhone">← Change number</button>
        </div>
      </div>

      <!-- Profile Photo (required) -->
      <div v-else-if="currentStep === successStep" class="w-full animate-fade-in space-y-8">
        <div class="space-y-3 text-center">
          <h1 class="font-display text-[2.25rem] leading-[1.05] tracking-tight sm:text-[2.75rem]">Add your photo.</h1>
          <p class="text-lg text-[#6c6862]">Show matches the real you. Clear portraits get 3× more connections.</p>
        </div>

        <div class="flex flex-col items-center space-y-6">
          <button
            type="button"
            class="group relative h-44 w-44 overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(52,38,25,0.10)] ring-1 ring-black/5 transition-transform hover:scale-[1.02]"
            :aria-label="uploadedPhotoUrl ? 'Change photo' : 'Choose a photo'"
            @click="triggerPhotoUpload"
          >
            <img v-if="photoPreview || uploadedPhotoUrl" :src="photoPreview || avatarUrl(uploadedPhotoUrl, 176)" alt="Your photo" class="h-full w-full object-cover" />
            <span v-else class="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f3f1] text-2xl text-[#9b9690]">+</span>
              <span class="text-sm font-medium text-[#6c6862]">Choose a photo</span>
            </span>
            <span v-if="uploadingPhoto" class="absolute inset-0 flex items-center justify-center bg-white/70">
              <span class="h-8 w-8 animate-spin rounded-full border-[3px] border-[#ece8e3] border-t-[#ed1c24]"></span>
            </span>
          </button>

          <input ref="photoInput" type="file" accept="image/*,.heic,.heif" class="hidden" @change="handlePhotoUpload" />

          <button type="button" class="btn-next" :disabled="!uploadedPhotoUrl || uploadingPhoto" @click="currentStep = doneStep">Next</button>
        </div>
      </div>

      <!-- Persona Reveal -->
      <div v-else-if="currentStep === doneStep" class="w-full animate-fade-in text-center">
        <div class="relative py-6">


          <span class="inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#393737] ring-1 ring-black/[0.07]">{{ isRetakeMode ? 'Your answers are updated' : 'Your dating persona' }}</span>
          <LetterVignette scene="meet" class="mx-auto mt-6 w-32 sm:w-40" />

          <h1 class="font-display mt-6 text-[2.2rem] leading-[1.05] tracking-tight sm:text-5xl">You're {{ assignedPersona?.name }}.</h1>
          <p class="mx-auto mt-4 max-w-md text-lg leading-relaxed text-[#6c6862]">{{ assignedPersona?.description }}</p>

          <div class="mt-8 rounded-[1.75rem] bg-white p-5 text-left ring-1 ring-black/5 sm:mt-10 sm:p-7">
            <p class="font-display text-xl">What happens next</p>
            <ol class="mt-4 space-y-3">
              <li class="flex items-center gap-3 text-base text-[#393737]"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#ed1c24]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></span>We look for someone who shares what matters to you.</li>
              <li class="flex items-center gap-3 text-base text-[#393737]"><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf1f8] text-[#2f5b85]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></span>We text you the moment your match is ready.</li>
            </ol>
          </div>

          <div class="mt-8 flex justify-center">
            <button type="button" class="btn-next" style="max-width: none" @click="finishOnboarding">Go to my account</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'
import VibeCard from '~/components/VibeCard.vue'
import { PhotoError } from '~/composables/usePhotoUpload'
import { usePersona, type Persona } from '~/composables/usePersona'
import { createClient } from '@supabase/supabase-js'
import type { M2MDatabase } from '~/types/database.types'
import { SCALE_QUESTIONS, VALUES_QUESTION, VALUES_PICK, VIBE_CHAPTERS, LEGACY_DIMENSION_CHAPTER, parseValuesAnswer } from '~/utils/vibeQuestions'

const route = useRoute()
const user = useSupabaseUser()

// The Supabase module stores JWT claims in useSupabaseUser(): the member's id is `sub` (there's no `id`).
// Fall back to asking Supabase directly if the claims haven't loaded yet.
const getSignedInUserId = async (): Promise<string | null> => {
  const fromClaims = (user.value as any)?.sub || (user.value as any)?.id
  if (fromClaims) return fromClaims
  const { data } = await useSupabaseClient().auth.getUser()
  return data.user?.id || null
}
const toast = useToast()
const { isTMA: isTMARaw, tgUser, hapticFeedback } = useTelegram()
const { personas } = usePersona()
const isMounted = ref(false)

const isTMA = computed(() => isMounted.value && isTMARaw.value)

useSeoMeta({
  title: 'Vibe Check | Minutes 2 Match',
  ogTitle: 'What is your dating persona?',
  description: 'Take our 90-second intentionality assessment to discover your dating persona and find compatible matches in Accra and Nairobi.',
  ogDescription: 'Take our 90-second intentionality assessment to discover your dating persona and find compatible matches in Accra and Nairobi.',
  ogImage: 'https://minutes2match.com/og-vibe.png',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://minutes2match.com/vibe-check' }
  ]
})

// Retake modal state
const showRetakeModal = ref(false)
const isRetakeMode = ref(false)
const isCheckingAuth = ref(true)
const isReturningUser = ref(false) // User who logged in but hasn't completed vibe check
// Retake or "finish your Vibe Check": a signed-in member, so no sign-up steps
const isMemberFlow = computed(() => isRetakeMode.value || isReturningUser.value)
// On those links, wait until we know who you are, so the sign-up intro never flashes behind the dialog
// and keep holding while their saved details load, so the name screen never flashes before the first question
const resumingProfile = ref(false)
const holdContent = computed(() => (route.query.retake === 'true' || route.query.returnUser === 'true') && (isCheckingAuth.value || showRetakeModal.value || resumingProfile.value))

// Check if user is already logged in
onMounted(async () => {
  isMounted.value = true
  const isRetakeRequest = route.query.retake === 'true'
  const isReturnUser = route.query.returnUser === 'true'
  
  // The session may still be restoring on a fresh load; on member links ask for it directly
  const signedIn = !!user.value || ((isRetakeRequest || isReturnUser) && !!(await getSignedInUserId().catch(() => null)))

  if (signedIn) {
    if (isReturnUser) {
      // User is logged in but needs to complete vibe check
      // Let them proceed without modal
      console.log('[VibeCheck] Returning user needs to complete vibe check')
      isReturningUser.value = true
      await resumeFromExistingProfile()
      isCheckingAuth.value = false
    } else if (isRetakeRequest) {
      // User wants to retake - show confirmation modal
      showRetakeModal.value = true
      isCheckingAuth.value = false
    } else {
      // Logged in user without retake flag - redirect to dashboard
      await navigateTo('/me')
      return
    }
  } else {
    isCheckingAuth.value = false
  }

  // Handle Bot Pre-fills
  if (route.query.persona) {
    assignedPersona.value = personas[route.query.persona as string] || null
    console.log('[VibeCheck] Pre-filled persona from bot:', assignedPersona.value?.name)
  }

  if (route.query.phone) {
    const incomingPhone = String(route.query.phone).replace(/\s/g, '')
    if (incomingPhone.startsWith('+254') || incomingPhone.startsWith('254')) {
      phoneCountry.value = '+254'
      form.phone = incomingPhone.replace(/^\+?254/, '').replace(/^0+/, '')
    } else {
      phoneCountry.value = '+233'
      form.phone = incomingPhone.replace(/^\+?233/, '').replace(/^0+/, '')
    }
    console.log('[VibeCheck] Pre-filled phone from bot:', form.phone)
  }

  if (isTMA.value && tgUser.value) {
    if (!form.displayName) {
        form.displayName = tgUser.value.first_name || ''
    }
  }
  
  fetchVibeQuestions()
})

const confirmRetake = async () => {
  resumingProfile.value = true // hold the page until we know which step to open on
  showRetakeModal.value = false
  isRetakeMode.value = true
  isReturningUser.value = true // save answers to the existing profile; no phone / photo steps
  try {
    await resumeFromExistingProfile()
  } finally {
    resumingProfile.value = false
  }
}

// Signed-in members (retake or finishing the check) already gave us these details:
// fill them in from their profile and start at the first step that still needs something.
const resumeFromExistingProfile = async () => {
  const userId = await getSignedInUserId()
  if (!userId) return
  const supabase = useSupabaseClient<M2MDatabase>() as any
  const { data: p } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('display_name, gender, interested_in, intent, birth_date, location, genotype, religion, height_cm, occupation, photo_url')
    .eq('id', userId)
    .maybeSingle()
  if (!p) return

  form.displayName = p.display_name || form.displayName
  form.gender = p.gender || form.gender
  form.interestedIn = p.interested_in || form.interestedIn
  form.intent = p.intent || form.intent
  form.birthDate = p.birth_date || form.birthDate
  form.location = p.location || form.location
  // Saved values may differ in case ("christian"); line them up with the chips
  form.genotype = GENOTYPES.find(g => g === String(p.genotype || '').toUpperCase()) || p.genotype || form.genotype
  form.religion = RELIGIONS.find(r => r.toLowerCase() === String(p.religion || '').toLowerCase()) || p.religion || form.religion
  form.height = p.height_cm ?? form.height
  form.occupation = p.occupation || form.occupation
  if (p.photo_url) uploadedPhotoUrl.value = p.photo_url

  const hasBasics = form.displayName.trim().length >= 2 && !!form.gender && !!form.interestedIn
  const hasDetails = !!form.intent && !!form.birthDate && !!form.location
  currentStep.value = hasBasics && hasDetails ? FIRST_QUESTION_STEP : hasBasics ? 2 : 1
  firstStepForThisFlow.value = currentStep.value
}

const cancelRetake = async () => {
  showRetakeModal.value = false
  await navigateTo('/me')
}

// Form state
const form = reactive({
  displayName: '',
  gender: '' as 'male' | 'female' | '',
  interestedIn: '' as 'male' | 'female' | 'everyone' | '',
  birthDate: '',
  location: '',
  intent: '',
  genotype: '',
  religion: '',
  height: null as number | null,
  occupation: '',
  phone: ''
})
const phoneCountry = ref('+233')

const { isSupported: contactPickerSupported, pickContact } = useContactPicker()

const pickVibeContact = async () => {
  const result = await pickContact()
  if (result) {
    if (result.name && !form.displayName) form.displayName = result.name
    const incomingPhone = result.phone.replace(/\s/g, '')
    if (incomingPhone.startsWith('+254') || incomingPhone.startsWith('254')) {
      phoneCountry.value = '+254'
      form.phone = incomingPhone.replace(/^\+?254/, '').replace(/^0+/, '')
    } else {
      if (incomingPhone.startsWith('+233') || incomingPhone.startsWith('233')) phoneCountry.value = '+233'
      form.phone = incomingPhone.replace(/^\+?233/, '').replace(/^0+/, '')
    }
  }
}

const vibeAnswers = reactive<Record<string, string>>({})
const vibeDimensions = reactive<Record<string, string>>({})
const currentStep = ref(1)
// Steps: 1-2 profile, then one step per question, then phone, success and done
const FIRST_QUESTION_STEP = 3
const totalQuestions = computed(() => activeQuestions.value.length || 16)
const lastQuestionStep = computed(() => FIRST_QUESTION_STEP + totalQuestions.value - 1)
const phoneStep = computed(() => lastQuestionStep.value + 1)
const successStep = computed(() => lastQuestionStep.value + 2)
const doneStep = computed(() => lastQuestionStep.value + 3)
const totalSteps = computed(() => doneStep.value)
const showExtras = ref(false)
const RELIGIONS = ['Christian', 'Muslim', 'Traditional', 'Other']
const GENOTYPES = ['AA', 'AS', 'AC', 'SS']
const extrasFilled = computed(() => [form.occupation.trim(), form.religion, form.height, form.genotype].filter(Boolean).length)

// Questions from database
interface VibeQuestion {
  key: string
  question: string
  category: string
  options: string[]
  display_order: number
  is_active: boolean
  is_core?: boolean
  dimension: string
  type?: 'choice' | 'scale' | 'values'
  chapter?: string | null
  story_label?: string | null
  scale_min_label?: string | null
  scale_max_label?: string | null
  max_picks?: number | null
}

// Vibe Check v2 questions from the shared definitions (used when the table doesn't have them yet)
const v2QuestionsFromUtil = (): VibeQuestion[] => [
  ...SCALE_QUESTIONS.map((q, i) => ({
    key: q.key, question: q.question, category: 'values', options: [], display_order: 100 + i, is_active: true, is_core: true,
    dimension: q.key, type: 'scale' as const, chapter: q.chapter, story_label: q.label, scale_min_label: q.minLabel, scale_max_label: q.maxLabel,
  })),
  {
    key: VALUES_QUESTION.key, question: VALUES_QUESTION.question, category: 'values', options: VALUES_QUESTION.options, display_order: 204,
    is_active: true, is_core: true, dimension: VALUES_QUESTION.key, type: 'values' as const, chapter: VALUES_QUESTION.chapter, max_picks: VALUES_PICK,
  },
]

const CHAPTER_ORDER = VIBE_CHAPTERS.map(c => c.id) as string[]
const chapterOf = (q: VibeQuestion) => q.chapter || LEGACY_DIMENSION_CHAPTER[q.dimension] || 'live'
const orderByChapter = (qs: VibeQuestion[]) =>
  [...qs].sort((a, b) => CHAPTER_ORDER.indexOf(chapterOf(a)) - CHAPTER_ORDER.indexOf(chapterOf(b)) || (a.display_order || 0) - (b.display_order || 0))

const activeQuestions = ref<VibeQuestion[]>([])
const loadingQuestions = ref(true)

const fetchVibeQuestions = async () => {
  loadingQuestions.value = true
  const supabase = useSupabaseClient<M2MDatabase>() as any
  
  try {
    // Fetch all active questions
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
    
    if (error) throw error
    
    if (data && data.length > 0) {
      // Dimension Pooling Logic: Ensures users answer one from each core dimension
      const coreDimensions = ['love_language', 'communication', 'social', 'life_goals', 'pace']
      const finalQuestions: any[] = []
      
      // 1. Pick 1 random question for each CORE dimension
      for (const dim of coreDimensions) {
          const dimPool = data.filter((q: any) => q.dimension === dim && q.is_core === true)
          if (dimPool.length > 0) {
              const selected = dimPool[Math.floor(Math.random() * dimPool.length)]
              finalQuestions.push(selected)
          }
      }
      
      // 2. Vibe Check v2: every 1–7 statement plus the values pick (from the table, or the shared definitions)
      const v2FromDb = data.filter((q: any) => q.type === 'scale' || q.type === 'values')
      finalQuestions.push(...(v2FromDb.length ? v2FromDb : v2QuestionsFromUtil()))

      // 3. Tell the story chapter by chapter: want → relate → live → believe
      activeQuestions.value = orderByChapter(finalQuestions)
    }
  } catch (err) {
    console.error('Failed to fetch questions:', err)
    // Enhanced fallback questions covering key dimensions
    activeQuestions.value = orderByChapter([
      // Core questions fallback
      { key: 'love_language', question: 'How do you most feel loved?', category: 'romance', options: ['Words of Affirmation - Tell me you love me 💬', 'Acts of Service - Do things for me 🛠️', 'Receiving Gifts - Surprise me with something 🎁', 'Quality Time - Give me your undivided attention ⏰', 'Physical Touch - Hold me, hug me 🫂'], display_order: 1, is_active: true, is_core: true, dimension: 'love_language' },
      { key: 'conflict_style', question: 'When we disagree, I prefer to...', category: 'values', options: ['Talk it out immediately - Let\'s resolve this now 🗣️', 'Take space first - I need time to process 🧘', 'Find a quick compromise - Let\'s meet in the middle 🤝', 'Avoid confrontation - It\'ll blow over 😶', 'Write it out - Texting is easier 📝'], display_order: 2, is_active: true, is_core: true, dimension: 'communication' },
      { key: 'social_energy', question: 'On a scale of homebody to social butterfly, I am...', category: 'lifestyle', options: ['Full homebody - My couch is my bestie 🛋️', 'Mostly introverted - Small gatherings only 🏠', 'Balanced - Depends on my mood ⚖️', 'Mostly extroverted - I love being out 🌟', 'Life of the party - Where\'s the next event? 🦋'], display_order: 3, is_active: true, is_core: true, dimension: 'social' },
      { key: 'life_priority', question: 'In 5 years, my biggest priority is...', category: 'values', options: ['Building my career and wealth 💼', 'Starting or growing a family 👨‍👩‍👧', 'Traveling and experiencing life 🌍', 'Finding inner peace and balance 🧘', 'Making an impact in my community 🌱'], display_order: 4, is_active: true, is_core: true, dimension: 'life_goals' },
      { key: 'relationship_pace', question: 'When it comes to relationships, I prefer to...', category: 'romance', options: ['Take it slow - Let\'s be friends first 🐢', 'Go with the flow - See where it goes 🌊', 'Move with intention - I know what I want 🎯', 'Move fast if it feels right - Life is short 🚀'], display_order: 5, is_active: true, is_core: true, dimension: 'pace' },
      // Vibe Check v2
      ...v2QuestionsFromUtil(),
    ])
  } finally {
    loadingQuestions.value = false
  }
}
// OTP state
const otpSent = ref(false)
const otpCode = ref('')
const otpError = ref('')
const otpId = ref('')
const sendingOtp = ref(false)
const verifyingOtp = ref(false)
const fallbackTimer = ref(0)
let fallbackInterval: ReturnType<typeof setInterval> | null = null
const fallbackTriggered = ref(false)
const sentVia = ref('')

onUnmounted(() => {
  if (fallbackInterval) clearInterval(fallbackInterval)
})

// Photo upload state & methods
const photoInput = ref<HTMLInputElement | null>(null)
const uploadedPhotoUrl = ref<string | null>(null)
const uploadingPhoto = ref(false)

const triggerPhotoUpload = () => {
  if (!uploadingPhoto.value) {
    photoInput.value?.click()
  }
}

// Show the chosen photo straight away, then prepare (resize, rotate, JPEG) and upload it
const photoPreview = ref<string | null>(null)
const { uploadProfilePhoto } = usePhotoUpload()
const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // so picking the same file again still works
  if (!file || uploadingPhoto.value) return

  const localPreview = URL.createObjectURL(file)
  photoPreview.value = localPreview
  uploadingPhoto.value = true
  try {
    uploadedPhotoUrl.value = await uploadProfilePhoto(file)
    hapticFeedback('light')
  } catch (err: any) {
    console.error('[VibeCheck Photo] Upload failed:', err)
    toast.error('Upload failed', err instanceof PhotoError ? err.message : 'Please check your connection and try again.')
  } finally {
    uploadingPhoto.value = false
    photoPreview.value = null
    URL.revokeObjectURL(localPreview)
  }
}

const fetchUserProfilePhoto = async () => {
  const supabase = useSupabaseClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser?.id) {
    const { data: profile } = await supabase
      .schema('m2m')
      .from('profiles')
      .select('photo_url')
      .eq('id', currentUser.id)
      .single()
    if (profile?.photo_url) {
      uploadedPhotoUrl.value = profile.photo_url
    }
  }
}

// Persona state
const assignedPersona = ref<Persona | null>(null)

// Computed
// Members only answer the questions, so their bar runs over the questions alone
const progressPercentage = computed(() => {
  if (isMemberFlow.value) {
    if (currentStep.value > lastQuestionStep.value) return 100
    return Math.max(0, ((currentStep.value - FIRST_QUESTION_STEP + 1) / totalQuestions.value) * 100)
  }
  return (currentStep.value / totalSteps.value) * 100
})
// Options are stored with their emoji (matching compares the full text); show them without
const cleanLabel = (text: string) => String(text || '').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u200D\uFE0F]/gu, '').replace(/\s{2,}/g, ' ').trim()
// Part N of M, and where this question sits inside its chapter
const chapterProgress = computed(() => {
  const q = currentQuestion.value
  const order = VIBE_CHAPTERS.map(c => c.id).filter(id => activeQuestions.value.some(x => chapterOf(x) === id))
  const inChapter = q ? activeQuestions.value.filter(x => chapterOf(x) === chapterOf(q)) : []
  return {
    part: q ? order.indexOf(chapterOf(q)) + 1 : 1,
    parts: order.length || 1,
    index: q ? inChapter.indexOf(q) + 1 : 1,
    count: inChapter.length || 1,
  }
})
const isQuestionStep = computed(() => currentStep.value >= FIRST_QUESTION_STEP && currentStep.value <= lastQuestionStep.value)
// Back works through the questions (and from details to intro for new members), never into finished steps
const firstStepForThisFlow = ref(1)
const canGoBack = computed(() => currentStep.value > firstStepForThisFlow.value && currentStep.value <= lastQuestionStep.value)
const prevStep = () => {
  if (!canGoBack.value) return
  hapticFeedback('light')
  currentStep.value--
}

const currentQuestion = computed(() => activeQuestions.value[currentStep.value - FIRST_QUESTION_STEP])
const currentChapter = computed(() => currentQuestion.value ? VIBE_CHAPTERS.find(c => c.id === chapterOf(currentQuestion.value!)) : null)

const maxBirthDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const isValidPhone = computed(() => {
  const cleaned = form.phone.replace(/\D/g, '')
  // Handles 201234567 (9), 0201234567 (10), or 233201234567 (12)
  return cleaned.length >= 9 && cleaned.length <= 15
})

const fullPhone = computed(() => {
  const cleaned = form.phone.replace(/\D/g, '').replace(/^0+/, '')
  return cleaned.startsWith('233') || cleaned.startsWith('254') ? '+' + cleaned : phoneCountry.value + cleaned
})

const canProceedStep1 = computed(() => form.displayName.trim().length >= 2 && !!form.gender && !!form.interestedIn)

const canProceedStep2 = computed(() => {
  return form.intent && form.birthDate && form.location
})

// Methods
// Step 1 and 2 choices
const GENDER_OPTIONS = [{ value: 'male', label: 'Man' }, { value: 'female', label: 'Woman' }]
const INTERESTED_OPTIONS = [{ value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }, { value: 'everyone', label: 'Everyone' }]
const INTENT_OPTIONS = [{ value: 'marriage', label: 'Marriage' }, { value: 'serious', label: 'A relationship' }, { value: 'casual', label: 'Something casual' }, { value: 'friendship', label: 'Friendship' }]
const COUNTRY_OPTIONS = [{ value: '+233', label: 'Ghana +233', flag: 'gh' as const }, { value: '+254', label: 'Kenya +254', flag: 'ke' as const }]


const nextStep = async () => {
  if (currentStep.value < totalSteps.value) {
    hapticFeedback('light')
    // Leaving the last question as a returning user: skip phone verification
    if (currentStep.value === lastQuestionStep.value && isReturningUser.value) {
        await handleReturningUserCompletion()
        return
    }
    
    currentStep.value++
  }
}

const handleVibeSelect = (key: string, value: string) => {
  vibeAnswers[key] = value
  // Track dimension for accurate matching
  const q = activeQuestions.value.find(q => q.key === key)
  if (q?.dimension) {
    vibeDimensions[key] = q.dimension
  }
  
  hapticFeedback('medium')
  setTimeout(() => {
    nextStep()
  }, 400)
}

// 1–7 statements: store the number as text
const handleScaleSelect = (key: string, n: number) => handleVibeSelect(key, String(n))

// Values pick: toggle up to VALUES_PICK, stored as a JSON array string
const selectedValues = computed(() => currentQuestion.value?.type === 'values' ? parseValuesAnswer(vibeAnswers[currentQuestion.value.key]) : [])
const valuesLimit = computed(() => currentQuestion.value?.max_picks || VALUES_PICK)
const toggleValue = (key: string, option: string) => {
  const picked = parseValuesAnswer(vibeAnswers[key])
  const next = picked.includes(option) ? picked.filter(v => v !== option) : picked.length < valuesLimit.value ? [...picked, option] : picked
  vibeAnswers[key] = JSON.stringify(next)
  const q = activeQuestions.value.find(q => q.key === key)
  if (q?.dimension) vibeDimensions[key] = q.dimension
  hapticFeedback('light')
}
const confirmValues = () => {
  if (selectedValues.value.length < 3) return
  nextStep()
}

const handleSendOtp = async () => {
  if (!isValidPhone.value) return
  
  sendingOtp.value = true
  otpError.value = ''
  
  try {
    // Everyone verifies by SMS; sign-up links existing / seeded profiles once the code checks out
    const { sendOTP } = useZend()
    const otpResult = await sendOTP(fullPhone.value, undefined) // default provider
    otpId.value = otpResult.otpId
    sentVia.value = otpResult.provider || 'sms'
    otpSent.value = true

    // Autonomous UI Failover Strategy
    fallbackTriggered.value = false
    fallbackTimer.value = 60
    if (fallbackInterval) clearInterval(fallbackInterval)
    
    fallbackInterval = setInterval(() => {
      if (fallbackTimer.value > 0) {
        fallbackTimer.value--
      } else {
        clearInterval(fallbackInterval!)
        // If 45 seconds passed and they are still on this screen without verifying
        if (currentStep.value === phoneStep.value && otpSent.value && !verifyingOtp.value && !isCreatingProfile.value) {
          fallbackTriggered.value = true
          toast.info('Network Warning', 'Network seems slow. Sending a backup verification code now...')
          console.log('[Vibe Check Auto-Failover] Firing Zend backup after 60s delay')
          // Silently trigger the backup SMS
          sendOTP(fullPhone.value, 'zend')
        }
      }
    }, 1000) // 1 second intervals

  } catch (error) {
    otpError.value = 'Failed to send code. Please try again.'
  } finally {
    sendingOtp.value = false
  }
}

const handleVerifyOtp = async () => {
  if (otpCode.value.length !== 6) return
  
  verifyingOtp.value = true
  otpError.value = ''
  
  if (fallbackInterval) clearInterval(fallbackInterval)

  try {
    await createUserProfile(otpCode.value, otpId.value)
    
    const { calculatePersona } = usePersona()
    assignedPersona.value = calculatePersona(vibeAnswers)
    
    // Fetch profile photo (e.g. from Telegram pre-fills or existing seeds)
    await fetchUserProfilePhoto()
    
    currentStep.value = successStep.value
  } catch (error) {
    otpError.value = 'Verification failed. Please try again.'
  } finally {
    verifyingOtp.value = false
  }
}

const resetPhone = () => {
  otpSent.value = false
  otpCode.value = ''
  otpError.value = ''
  fallbackTriggered.value = false
  fallbackTimer.value = 0
  if (fallbackInterval) clearInterval(fallbackInterval)
}

const isCreatingProfile = ref(false)

// Handle completion for users who are already logged in
const handleReturningUserCompletion = async () => {
  if (isCreatingProfile.value) return // ignore double taps on the last answer
  isCreatingProfile.value = true
  try {
    // Calculate persona first
    const { calculatePersona, savePersona } = usePersona()
    assignedPersona.value = calculatePersona(vibeAnswers)
    
    const userId = await getSignedInUserId()
    if (!userId) throw new Error('Not signed in')

    // Update profile and save vibe answers
    await updateUserProfile(userId)

    // Save persona to database
    if (assignedPersona.value) {
       await savePersona(userId, assignedPersona.value.id)
    }

    // Re-run matching with the new answers in the background. It scores every member and may
    // send notifications, which can take a while; don't make the member wait on it.
    $fetch('/api/profiles/trigger-match', {
            method: 'POST',
            body: { userId }
        }).catch(matchError => console.error('[VibeCheck JIT] Automatch failed after retake:', matchError))
    
    // Already have a photo? Go straight to the persona reveal; otherwise ask for one
    await fetchUserProfilePhoto()
    currentStep.value = uploadedPhotoUrl.value ? doneStep.value : successStep.value
  } catch (error) {
    console.error('Error completing profile:', error)
    toast.error('Save failed', 'Failed to save profile. Please try again.')
  } finally {
    isCreatingProfile.value = false
  }
}

const updateUserProfile = async (explicitUserId?: string) => {
  const supabase = useSupabaseClient<M2MDatabase>() as any
  
  const userId = explicitUserId || (await getSignedInUserId())
  console.log('[VibeCheck] updateUserProfile called with ID:', userId)
  
  if (!userId || userId === 'undefined' || userId === 'null' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    console.warn('[VibeCheck] Cannot update profile: Invalid User ID format:', userId)
    return
  }

  // Update profile fields: only ones that have a value, so a retake never blanks saved details
  const fields: Record<string, any> = {
    display_name: form.displayName.trim(),
    gender: form.gender,
    birth_date: form.birthDate,
    location: form.location,
    interested_in: form.interestedIn,
    intent: form.intent,
    genotype: form.genotype,
    religion: form.religion,
    height_cm: form.height,
    occupation: form.occupation,
    telegram_id: (isTMA.value && tgUser.value) ? tgUser.value.id.toString() : undefined,
    photo_url: (isTMA.value && tgUser.value?.photo_url) ? tgUser.value.photo_url : undefined,
  }
  const profileUpdate: Record<string, any> = { is_verified: true }
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== '') profileUpdate[key] = value
  }
  const { error: profileError } = await supabase
    .schema('m2m')
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId)

  if (profileError) throw profileError

  // Save/Update Vibe Answers
  if (vibeAnswers && Object.keys(vibeAnswers).length > 0) {
    const vibeEntries = Object.entries(vibeAnswers).map(([key, value]) => ({
        user_id: userId,
        question_key: key,
        answer_value: value,
        dimension: vibeDimensions[key] || null
    }))

    const { error: vibeError } = await supabase
        .schema('m2m')
        .from('vibe_answers')
        .upsert(vibeEntries, { onConflict: 'user_id,question_key' })
        
    if (vibeError) throw vibeError
  }
}

const createUserProfile = async (verificationCode: string, verificationOtpId: string) => {
  if (isCreatingProfile.value) return
  isCreatingProfile.value = true
  
  try {
    const supabase = useSupabaseClient<M2MDatabase>() as any
    const fullPhone = phoneCountry.value + form.phone.replace(/\D/g, '').replace(/^0+/, '')
    
    // Call server-side signup (Handles Auth Creation + Auto-confirm + Profile + Vibes)
    const result = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        phone: fullPhone,
        displayName: form.displayName.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        location: form.location,
        interestedIn: form.interestedIn,
        intent: form.intent,
        genotype: form.genotype || null,
        religion: form.religion || null,
        heightCm: form.height,
        occupation: form.occupation || null,
        code: verificationCode,
        otpId: verificationOtpId,
        vibeAnswers,
        vibeDimensions,
        telegramId: (isTMA.value && tgUser.value) ? tgUser.value.id.toString() : undefined,
        photoUrl: (isTMA.value && tgUser.value?.photo_url) ? tgUser.value.photo_url : undefined
      }
    })

    if (result.success && result.email && result.password) {
      // Sign in with the returned credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password
      })

      if (signInError) throw signInError
    }
  } catch (error: any) {
    console.error('Profile creation error:', error)
    throw error
  } finally {
    isCreatingProfile.value = false
  }
}


const finishOnboarding = async () => {
  const supabase = useSupabaseClient<M2MDatabase>() as any
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && assignedPersona.value) {
    const { savePersona } = usePersona()
    await savePersona(user.id, assignedPersona.value.id)
  }
  
  // Small delay for session stability
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Navigate to dashboard with external redirect
  return navigateTo('/me', { external: true })
}
</script>

<style scoped>
/* Onboarding "Next": charcoal pill, like the reference form */
.btn-next {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 20rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, #f2343b 0%, #e0171f 100%);
  color: #fff;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 12px 26px rgba(237, 28, 36, 0.22);
  transition: transform 150ms, opacity 150ms, box-shadow 150ms;
}
.btn-next:not(:disabled):hover { box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 14px 30px rgba(237, 28, 36, 0.3); }
.btn-next:not(:disabled):active { transform: scale(0.98); }
.btn-next:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

/* Soft sky behind the phone, fading out on every side */
.sky-glow {
  background: radial-gradient(ellipse 50% 65% at 50% 55%, #dbe6f1 0%, rgba(221, 231, 241, 0.75) 40%, rgba(233, 239, 245, 0.35) 65%, rgba(255, 255, 255, 0) 85%);
}
.cloud-drift { animation: cloud-drift 32s ease-in-out infinite alternate; }
.cloud-drift-reverse { animation-duration: 40s; animation-direction: alternate-reverse; }
@keyframes cloud-drift {
  from { transform: translate3d(-1rem, 0, 0); }
  to { transform: translate3d(1.5rem, 0.5rem, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .cloud-drift { animation: none; }
}
/* Minimal CSS for complex animations */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-bounce-slow {
  animation: bounce 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.confetti {
  position: absolute;
  font-size: 1.5rem;
  animation: confettiFall 3s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes confettiFall {
  0% { opacity: 1; transform: translateY(-50px) translateX(var(--x)) rotate(0deg); }
  100% { opacity: 0; transform: translateY(300px) translateX(var(--x)) rotate(720deg); }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .modal-enter-from > div,
  .modal-leave-to > div {
    transform: scale(0.95);
  }
}
</style>
