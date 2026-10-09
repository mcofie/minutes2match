<template>
  <div class="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-500">
    <Head>
      <Title>Your account | Minutes 2 Match</Title>
    </Head>

    <template v-if="showSkeleton">
      <SkeletonMePage />
      <p class="sr-only" role="status">Loading your account…</p>
    </template>

    <template v-else>
    <!-- Header: photo + greeting -->
    <header class="flex items-center gap-4 pb-1">
      <button
        id="me-photo"
        type="button"
        class="group relative h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20"
        :aria-label="profile?.photo_url ? 'Change your photo' : 'Add a photo'"
        :disabled="uploadingPhoto"
        @click="photoInput?.click()"
      >
        <span class="block h-full w-full overflow-hidden rounded-full bg-[#f4f3f1] shadow-[0_8px_24px_rgba(52,38,25,0.12)] ring-4 ring-white">
          <img v-if="photoPreview || profile?.photo_url" :src="photoPreview || avatarUrl(profile?.photo_url, 96)" alt="" decoding="async" class="h-full w-full object-cover" />
          <span v-else class="font-display flex h-full w-full items-center justify-center text-2xl text-[#9b9690]">{{ firstName.charAt(0) }}</span>
        </span>
        <span class="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ed1c24] text-white ring-2 ring-white">
          <span v-if="uploadingPhoto" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        </span>
      </button>
      <input ref="photoInput" type="file" accept="image/*,.heic,.heif" class="hidden" @change="handlePhotoUpload" />
      <div class="min-w-0">
        <h2 class="text-[2rem] leading-none tracking-tight text-[#393737] sm:text-[2.5rem]">Hi, {{ firstName }}.</h2>
        <p class="mt-1.5 text-sm text-[#9b9690]">{{ uploadingPhoto ? 'Uploading your photo…' : 'Tap your photo to change it' }}</p>
      </div>
    </header>

    <!-- This week's matching -->
    <section class="overflow-hidden rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(52,38,25,0.07)] ring-1 ring-black/5" :class="optedIn ? 'bg-gradient-to-br from-[#eef7f1] to-white' : 'bg-gradient-to-br from-[#e9eff5] to-white'">
      <p class="text-sm font-medium text-[#9b9690]">This week's matching</p>
      <h3 class="font-display mt-1 text-2xl text-[#393737]">{{ optedIn ? "You're in for this week." : 'Want a match this week?' }}</h3>
      <p class="mt-1.5 text-base leading-relaxed text-[#6c6862]">
        <template v-if="optedIn">We'll include you until {{ weekEndLabel }}.</template>
        <template v-else>Opt in before {{ weekEndLabel }}. It's free.</template>
      </p>
      <button
        v-if="!optedIn"
        type="button"
        :disabled="savingOptIn"
        class="btn-solid grain grain-strong mt-5 w-full px-6 py-3.5 text-base disabled:opacity-60 sm:w-auto sm:px-8"
        @click="setWeeklyOptIn(true)"
      >{{ savingOptIn ? 'Opting in…' : 'Opt in for this week' }}</button>
      <button
        v-else
        type="button"
        :disabled="savingOptIn"
        class="mt-4 rounded-full px-1 py-1 text-sm font-medium text-[#6c6862] underline-offset-4 hover:text-[#393737] hover:underline disabled:opacity-60"
        @click="setWeeklyOptIn(false)"
      >{{ savingOptIn ? 'Updating…' : 'Skip this week' }}</button>
    </section>

    <!-- Your personality type, from the Vibe Check -->
    <section v-if="myPersona" class="relative overflow-hidden rounded-[1.75rem] p-5 shadow-[0_10px_30px_rgba(52,38,25,0.07)] ring-1 ring-black/5 sm:p-6" :style="{ background: myPersona.tint }">
      <LetterVignette :scene="myPersona.scene" class="pointer-events-none absolute -right-5 -top-8 w-28 opacity-90 sm:-right-3 sm:-top-6 sm:w-32" />
      <div class="relative pr-24 sm:pr-28">
        <p class="text-sm font-medium text-[#6c6862]">Your personality type</p>
        <h3 class="font-display mt-1 text-[1.75rem] leading-[1.1] tracking-tight text-[#393737]">{{ myPersona.name }}</h3>
      </div>
      <p class="relative mt-2.5 pr-12 text-base leading-relaxed text-[#4c4a4a] sm:pr-16">{{ myPersona.description }}</p>
      <ul class="relative mt-4 flex flex-wrap gap-1.5">
        <li v-for="word in myPersona.keywords" :key="word" class="rounded-full bg-white/75 px-3 py-1 text-sm capitalize text-[#393737] ring-1 ring-black/[0.04]">{{ word }}</li>
      </ul>
      <NuxtLink to="/vibe-check?retake=true" class="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6c6862] transition-colors hover:text-[#393737]">
        Not quite you? Retake the Vibe Check <span aria-hidden="true">→</span>
      </NuxtLink>
    </section>
    <NuxtLink v-else to="/vibe-check?retake=true" class="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-[0_6px_20px_rgba(52,38,25,0.05)] ring-1 ring-black/5">
      <LetterVignette scene="meet" class="w-12 shrink-0" />
      <span class="min-w-0 flex-1">
        <span class="block text-sm text-[#9b9690]">Your personality type</span>
        <span class="block text-base font-medium text-[#393737]">Take the Vibe Check to find out</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </NuxtLink>

    <!-- Match readiness: one line, just the next step -->
    <button
      v-if="readiness.missing.length"
      type="button"
      class="flex w-full items-center gap-4 rounded-[1.5rem] bg-white p-4 text-left shadow-[0_6px_20px_rgba(52,38,25,0.05)] ring-1 ring-black/5 transition-colors hover:bg-[#fcfbfa]"
      @click="goToReadinessItem(readiness.missing[0])"
    >
      <span class="relative h-12 w-12 shrink-0" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="h-full w-full -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#f1efec" stroke-width="5" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#ed1c24" stroke-width="5" stroke-linecap="round" :stroke-dasharray="125.66" :stroke-dashoffset="125.66 * (1 - readiness.percent / 100)" />
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-[#393737]">{{ readiness.percent }}%</span>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm text-[#9b9690]">Better matches · {{ readiness.missing.length }} {{ readiness.missing.length === 1 ? 'thing' : 'things' }} left</span>
        <span class="block truncate text-base font-medium text-[#393737]">Next: {{ readiness.missing[0].label }}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </button>

    <!-- Your profile: one tidy list, each row opens to edit -->
    <section class="rounded-[1.75rem] bg-white shadow-[0_10px_30px_rgba(52,38,25,0.07)] ring-1 ring-black/5">
      <p class="px-5 pb-1 pt-5 text-sm font-medium text-[#9b9690] sm:px-6 sm:pt-6">Your profile</p>
      <ul class="divide-y divide-black/[0.06]">
        <li v-for="panel in PANELS" :key="panel.id">
          <button
            type="button"
            class="flex min-h-[4.25rem] w-full scroll-mt-20 items-center gap-4 px-5 py-4 text-left active:bg-[#faf9f7] sm:px-6"
            :aria-expanded="openPanel === panel.id"
            :aria-controls="`panel-${panel.id}`"
            @click="togglePanel(panel.id)"
          >
            <span class="min-w-0 flex-1">
              <span class="block text-base font-medium text-[#393737]">{{ panel.title }}</span>
              <span class="mt-0.5 block truncate text-sm" :class="summaries[panel.id].empty ? 'text-[#ed1c24]' : 'text-[#9b9690]'">{{ summaries[panel.id].text }}</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa] transition-transform duration-200" :class="openPanel === panel.id ? 'rotate-90' : ''" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          <div v-if="openPanel === panel.id" :id="`panel-${panel.id}`" class="scroll-mt-20 px-5 pb-6 sm:px-6">
            <!-- About you -->
            <template v-if="panel.id === 'about'">
              <div class="relative">
                <label for="me-bio" class="sr-only">Bio</label>
                <textarea id="me-bio" v-model="editForm.about_me" rows="4" maxlength="300" placeholder="What drives you? What are you looking for?" class="w-full resize-none rounded-[1.25rem] border border-[#e5e2dd] bg-white p-4 pb-8 text-base leading-relaxed text-[#393737] outline-none transition-[border-color,box-shadow] placeholder:text-[#9b9690] focus:border-[#393737] focus:ring-4 focus:ring-black/5"></textarea>
                <span class="absolute bottom-3 right-4 text-xs tabular-nums text-[#b5b0aa]">{{ editForm.about_me.length }}/300</span>
              </div>
              <p class="mt-2 text-sm text-[#9b9690]">We read your bio to match personalities.</p>
            </template>

            <!-- Lifestyle & contact -->
            <div v-else-if="panel.id === 'lifestyle'" class="space-y-7">
              <fieldset>
                <legend class="mb-2 text-sm text-[#6c6862]">Where you live</legend>
                <CityPicker id="me-city" v-model="editForm.location" />
              </fieldset>

              <div>
                <label for="me-job" class="mb-2 block text-sm text-[#6c6862]">What do you do?</label>
                <input id="me-job" v-model="editForm.occupation" type="text" maxlength="60" placeholder="e.g. Nurse, designer, student" list="me-occupations" autocomplete="organization-title" :class="FIELD" />
                <datalist id="me-occupations"><option v-for="o in commonOccupations" :key="o" :value="o" /></datalist>
              </div>

              <fieldset id="me-religion" tabindex="-1" class="outline-none">
                <legend class="mb-2 text-sm text-[#6c6862]">Faith</legend>
                <ChoiceChips v-model="editForm.religion" :options="RELIGIONS" />
              </fieldset>

              <HeightSlider v-model="editForm.height_cm" />

              <fieldset>
                <legend class="mb-2 text-sm text-[#6c6862]">Genotype <span class="text-[#9b9690]">· only if you're comfortable sharing</span></legend>
                <ChoiceChips v-model="editForm.genotype" :options="GENOTYPES" layout="grid-4" />
              </fieldset>

              <fieldset class="border-t border-black/[0.06] pt-6">
                <legend class="sr-only">How matches reach you</legend>
                <SegmentedControl v-model="editForm.preferred_contact_method" label="How matches reach you" :options="CONTACT_METHODS" />
                <div v-if="editForm.preferred_contact_method === 'instagram' || editForm.preferred_contact_method === 'snapchat'" class="relative mt-3">
                  <label :for="editForm.preferred_contact_method === 'instagram' ? 'me-ig' : 'me-sc'" class="sr-only">{{ editForm.preferred_contact_method === 'instagram' ? 'Instagram handle' : 'Snapchat username' }}</label>
                  <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#9b9690]" aria-hidden="true">@</span>
                  <input v-if="editForm.preferred_contact_method === 'instagram'" id="me-ig" v-model="editForm.instagram_handle" type="text" placeholder="your Instagram handle" autocomplete="off" autocapitalize="off" spellcheck="false" :class="[FIELD, 'pl-9']" @blur="editForm.instagram_handle = editForm.instagram_handle.trim().replace(/^@+/, '')" />
                  <input v-else id="me-sc" v-model="editForm.snapchat_handle" type="text" placeholder="your Snapchat username" autocomplete="off" autocapitalize="off" spellcheck="false" :class="[FIELD, 'pl-9']" @blur="editForm.snapchat_handle = editForm.snapchat_handle.trim().replace(/^@+/, '')" />
                </div>
                <p v-else class="mt-2 text-sm text-[#9b9690]">Your match sees your WhatsApp number once your connection is unlocked.</p>
              </fieldset>
            </div>

            <!-- Hobbies -->
            <template v-else-if="panel.id === 'hobbies'">
              <div class="mb-3 flex items-baseline justify-between gap-3">
                <p class="text-sm text-[#6c6862]">Pick up to 6</p>
                <p class="text-sm font-semibold tabular-nums" :class="editForm.interests.length >= 6 ? 'text-[#ed1c24]' : 'text-[#393737]'">{{ editForm.interests.length }}/6</p>
              </div>
              <ChoiceChips id="me-hobbies" v-model="editForm.interests" :options="interestOptions" multiple :max="6" />
            </template>

            <!-- When you're free -->
            <template v-else-if="panel.id === 'free'">
              <p class="mb-3 text-sm text-[#9b9690]">We use this to suggest a date time that works for you both.</p>
              <div class="overflow-hidden rounded-[1.25rem] border border-[#e5e2dd]">
                <div class="grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] border-b border-[#efebe6] bg-[#faf9f7] text-xs text-[#9b9690]">
                  <span class="px-3 py-2"></span>
                  <span v-for="slot in SLOTS" :key="slot.id" class="px-1 py-2 text-center">{{ slot.label }}</span>
                </div>
                <div v-for="day in DAYS" :key="day.id" class="grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] items-center border-b border-[#efebe6] last:border-b-0">
                  <span class="px-3 py-2.5 text-sm text-[#393737]">{{ day.label }}</span>
                  <div v-for="slot in SLOTS" :key="slot.id" class="flex justify-center py-1.5">
                    <button
                      type="button"
                      :aria-pressed="isFree(day.id, slot.id)"
                      :aria-label="`${day.label} ${slot.label}`"
                      class="flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9"
                      :class="isFree(day.id, slot.id) ? 'bg-[#393737] text-white' : 'bg-white text-transparent ring-1 ring-black/10 hover:ring-[#393737]'"
                      @click="toggleFree(day.id, slot.id)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Who you're looking for -->
            <div v-else-if="panel.id === 'seek'" class="space-y-7">
              <fieldset>
                <legend class="mb-2 text-sm text-[#6c6862]">Looking for</legend>
                <ChoiceChips v-model="editForm.intent" :options="INTENTS" layout="grid-2" :clearable="false" />
              </fieldset>
              <SegmentedControl v-model="editForm.interested_in" label="Interested in" :options="INTERESTED_IN" />
              <AgeRangeSlider v-model:min="editForm.min_age" v-model:max="editForm.max_age" label="Ages you'd like to meet" />
            </div>

            <!-- Dealbreakers -->
            <template v-else-if="panel.id === 'deal'">
              <p class="text-sm text-[#9b9690]">Tap anything you're not open to. We'll never match you with someone who…</p>
              <fieldset class="mt-5">
                <legend class="mb-2 text-sm text-[#6c6862]">…is of this faith</legend>
                <ChoiceChips :model-value="editForm.dealbreakers.religion" :options="RELIGIONS" multiple @update:model-value="editForm.dealbreakers.religion = $event" />
              </fieldset>
              <fieldset class="mt-5">
                <legend class="mb-2 text-sm text-[#6c6862]">…is looking for</legend>
                <ChoiceChips :model-value="editForm.dealbreakers.intent" :options="INTENTS" multiple @update:model-value="editForm.dealbreakers.intent = $event" />
              </fieldset>
              <p class="mt-5 text-sm text-[#9b9690]">We also automatically avoid genotype pairings that carry a health risk.</p>
            </template>

            <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button type="button" class="h-12 w-full rounded-full text-base font-medium text-[#6c6862] hover:text-[#393737] sm:h-11 sm:w-auto sm:px-5 sm:text-sm" @click="cancelPanel">Cancel</button>
              <button type="button" :disabled="saving" class="btn-solid grain h-12 w-full px-6 text-base disabled:opacity-60 sm:h-11 sm:w-auto sm:text-sm" @click="savePanel">{{ saving ? 'Saving…' : 'Save' }}</button>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Account -->
    <section class="rounded-[1.75rem] bg-white shadow-[0_10px_30px_rgba(52,38,25,0.07)] ring-1 ring-black/5">
      <p class="px-5 pb-1 pt-5 text-sm font-medium text-[#9b9690] sm:px-6 sm:pt-6">Account</p>
      <ul class="divide-y divide-black/[0.06]">
        <li>
          <NuxtLink to="/vibe-check?retake=true" class="flex min-h-[4.25rem] items-center gap-4 px-5 py-4 active:bg-[#faf9f7] sm:px-6">
            <span class="min-w-0 flex-1">
              <span class="block text-base font-medium text-[#393737]">Retake the Vibe Check</span>
              <span class="mt-0.5 block text-sm text-[#9b9690]">Your new answers replace the old ones</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </NuxtLink>
        </li>
        <li>
          <button type="button" :disabled="loggingOut" class="flex min-h-[4.25rem] w-full items-center gap-4 px-5 py-4 text-left active:bg-[#faf9f7] disabled:opacity-60 sm:px-6" @click="handleLogout">
            <span class="flex-1 text-base font-medium text-[#393737]">{{ loggingOut ? 'Logging out…' : 'Log out' }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
          </button>
        </li>
        <li v-if="deletionRequest?.status === 'pending'" class="px-5 py-4 sm:px-6">
          <p class="text-base font-medium text-[#393737]">Account deletion in progress</p>
          <p class="mt-0.5 text-sm text-[#9b9690]">We'll remove your profile and data shortly.</p>
          <button type="button" :disabled="cancellingDeletionRequest" class="mt-3 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#393737] ring-1 ring-black/10 hover:bg-[#fafafa] disabled:opacity-60" @click="cancelDeletionRequest">
            {{ cancellingDeletionRequest ? 'Cancelling…' : 'Keep my account' }}
          </button>
        </li>
        <li v-else>
          <button type="button" class="flex min-h-[4.25rem] w-full items-center gap-4 px-5 py-4 text-left active:bg-[#faf9f7] sm:px-6" @click="showDeletionModal = true">
            <span class="flex-1 text-base font-medium text-[#b4232a]">Delete account</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 shrink-0 text-[#b5b0aa]" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </li>
      </ul>
    </section>


    <!-- Delete confirmation -->
    <Teleport to="body">
      <div v-if="showDeletionModal" class="m2m-app fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center" @click.self="showDeletionModal = false">
        <div class="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.75rem] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <h3 id="delete-title" class="font-display text-2xl text-[#393737]">Delete your account?</h3>
          <p class="mt-2 text-base text-[#6c6862]">This removes your profile, Vibe Check answers and matches. It can't be undone.</p>
          <fieldset class="mt-5">
            <legend class="mb-2 text-sm text-[#6c6862]">Why are you leaving?</legend>
            <div class="space-y-2">
              <button
                v-for="r in DELETION_REASONS"
                :key="r.value"
                type="button"
                :aria-pressed="deletionReason === r.value"
                class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] transition-all active:scale-[0.99]"
                :class="deletionReason === r.value ? 'bg-[#393737] font-medium text-white' : 'bg-white text-[#393737] ring-1 ring-[#e5e2dd] hover:ring-[#cfc9c1]'"
                @click="deletionReason = r.value"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" :class="deletionReason === r.value ? 'bg-white' : 'ring-1 ring-black/20'" aria-hidden="true">
                  <span v-if="deletionReason === r.value" class="h-2 w-2 rounded-full bg-[#393737]"></span>
                </span>
                {{ r.label }}
              </button>
            </div>
          </fieldset>
          <label for="del-details" class="mt-5 block text-sm text-[#6c6862]">Anything else? (optional)</label>
          <textarea id="del-details" v-model="deletionDetails" rows="3" maxlength="500" placeholder="We read every note" class="mt-1.5 w-full resize-none rounded-[1.25rem] border border-[#e5e2dd] p-4 text-base text-[#393737] outline-none transition-[border-color,box-shadow] placeholder:text-[#a8a39d] focus:border-[#393737] focus:ring-4 focus:ring-black/5"></textarea>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="rounded-full px-6 py-3.5 text-sm font-medium text-[#6c6862] hover:text-[#393737]" @click="showDeletionModal = false">Cancel</button>
            <button type="button" :disabled="submittingDeletionRequest" class="rounded-full bg-[#b4232a] px-6 py-3.5 text-sm font-medium text-white hover:bg-[#9a1d23] disabled:opacity-60" @click="submitDeletionRequest">
              {{ submittingDeletionRequest ? 'Submitting…' : 'Delete my account' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { PhotoError } from '~/composables/usePhotoUpload'
import type { M2MDatabase } from '~/types/database.types'
import { currentMatchWeekEnd, isOptedInThisWeek } from '~/utils/matchWeek'
import { normalizeCity } from '~/utils/compatibility'
import { SCALE_QUESTIONS, VALUES_KEY } from '~/utils/vibeQuestions'
import { personas } from '~/composables/usePersona'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()
const haptic = useHaptic()
const { profile, currentUserId, fetchProfileById, initDashboard, logout } = useDashboard()

// Log out: signs out and reloads the home page (which also clears anything cached for this member)
const loggingOut = ref(false)
const handleLogout = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  await logout()
}

// Personality type: each one gets its own painted scene and soft background
const PERSONA_LOOK: Record<string, { scene: 'dawn' | 'meadow' | 'tree' | 'night' | 'sunset' | 'meet'; tint: string }> = {
  power_player: { scene: 'dawn', tint: 'linear-gradient(135deg,#eaf1fa 0%,#ffffff 55%,#fdf0e2 100%)' },
  romantic: { scene: 'sunset', tint: 'linear-gradient(135deg,#fdeef0 0%,#ffffff 55%,#fdeadb 100%)' },
  adventurer: { scene: 'meadow', tint: 'linear-gradient(135deg,#e8f3ee 0%,#ffffff 55%,#eaf2fa 100%)' },
  intellectual: { scene: 'night', tint: 'linear-gradient(135deg,#ecebf8 0%,#ffffff 55%,#f6ecf2 100%)' },
  social_butterfly: { scene: 'meet', tint: 'linear-gradient(135deg,#fdf3df 0%,#ffffff 55%,#fdebe6 100%)' },
  homebody: { scene: 'tree', tint: 'linear-gradient(135deg,#f3efe6 0%,#ffffff 55%,#eaf2e6 100%)' },
}
const myPersona = computed(() => {
  const p = personas[profile.value?.dating_persona as string]
  if (!p) return null
  return { ...p, ...(PERSONA_LOOK[p.id] || PERSONA_LOOK.social_butterfly) }
})

const FIELD = 'h-12 w-full rounded-[1.25rem] border border-[#e5e2dd] bg-white px-4 text-base text-[#393737] outline-none transition-[border-color,box-shadow] placeholder:text-[#9b9690] focus:border-[#393737] focus:ring-4 focus:ring-black/5'

const firstName = computed(() => (profile.value?.display_name || 'there').split(' ')[0])

// ===== 1. Weekly opt-in =====
const savingOptIn = ref(false)
const optedIn = computed(() => profile.value?.is_active !== false && isOptedInThisWeek(profile.value?.weekly_opt_in_until))
const weekEndLabel = computed(() =>
  currentMatchWeekEnd().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' night'
)

const setWeeklyOptIn = async (optIn: boolean) => {
  const userId = currentUserId.value
  if (!userId) {
    toast.error('Please sign in again', 'Your session may have expired.')
    return
  }
  savingOptIn.value = true
  try {
    const update = optIn
      ? { weekly_opt_in_until: currentMatchWeekEnd().toISOString(), is_active: true }
      : { weekly_opt_in_until: null }
    const { error } = await supabase.schema('m2m').from('profiles').update(update as any).eq('id', userId)
    if (error) throw error
    await fetchProfileById(userId)
    haptic.hapticSuccess()
    toast.success(optIn ? "You're in this week 💫" : 'Skipping this week', optIn ? "We'll text you when your match is ready." : 'Opt in again whenever you like.')
  } catch (err: any) {
    console.error('[Me] Opt-in update failed:', err)
    haptic.hapticError()
    // 42703 = column missing: the weekly opt-in migration (071) hasn't been run on the database yet
    if (err?.code === '42703') {
      toast.error('Weekly matching isn’t switched on yet', 'Please try again shortly.')
    } else {
      toast.error("Couldn't update", 'Please try again.')
    }
  } finally {
    savingOptIn.value = false
  }
}

// ===== 2. Profile (bio, social & lifestyle, hobbies, who you seek) =====
const editForm = reactive({
  about_me: '',
  preferred_contact_method: 'phone',
  instagram_handle: '',
  snapchat_handle: '',
  occupation: '',
  religion: '',
  height_cm: null as number | null,
  genotype: '',
  interests: [] as string[],
  intent: 'serious',
  interested_in: 'everyone',
  min_age: 18,
  max_age: 50,
  location: '',
  availability: { weekdays: [] as string[], friday: [] as string[], saturday: [] as string[], sunday: [] as string[] } as Record<string, string[]>,
  dealbreakers: { religion: [] as string[], intent: [] as string[] },
})

const CITIES = {
  ghana: ['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast', 'Tamale', 'Koforidua', 'Ho', 'Sunyani'],
  kenya: ['Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
}
const ALL_CITIES = [...CITIES.ghana, ...CITIES.kenya]
// Saved values may be lowercase ("accra") or a neighbourhood ("East Legon"); show them as a city
const toCityOption = (raw?: string | null) => {
  const city = normalizeCity(raw)
  if (!city) return ''
  return ALL_CITIES.find(c => c.toLowerCase() === city) || 'Other'
}

const DAYS = [
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
]
const SLOTS = [
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Late night' },
]
const isFree = (day: string, slot: string) => (editForm.availability[day] || []).includes(slot)
const toggleFree = (day: string, slot: string) => {
  const list = editForm.availability[day] || (editForm.availability[day] = [])
  const i = list.indexOf(slot)
  if (i === -1) list.push(slot)
  else list.splice(i, 1)
}

const RELIGIONS = ['Christian', 'Muslim', 'Traditional', 'Other']
const GENOTYPES = ['AA', 'AS', 'AC', 'SS']
const CONTACT_METHODS = [
  { value: 'phone', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'snapchat', label: 'Snapchat' },
]
const INTERESTED_IN = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'everyone', label: 'Everyone' },
]
const INTENTS = [
  { value: 'marriage', label: 'Marriage' },
  { value: 'serious', label: 'Something serious' },
  { value: 'casual', label: 'Something casual' },
  { value: 'friendship', label: 'Friendship' },
]

const availableInterests = [
  { id: 'travel', label: 'Travel ✈️' }, { id: 'fitness', label: 'Fitness 💪' }, { id: 'cooking', label: 'Cooking 🍳' }, { id: 'movies', label: 'Movies 🎬' },
  { id: 'music', label: 'Music 🎵' }, { id: 'gaming', label: 'Gaming 🎮' }, { id: 'reading', label: 'Reading 📚' }, { id: 'art', label: 'Art 🎨' },
  { id: 'sports', label: 'Sports ⚽' }, { id: 'tech', label: 'Tech 💻' }, { id: 'fashion', label: 'Fashion 👗' }, { id: 'food', label: 'Foodie 🍕' },
  { id: 'nature', label: 'Nature 🌿' }, { id: 'photography', label: 'Photography 📸' }, { id: 'dancing', label: 'Dancing 💃' }, { id: 'entrepreneurship', label: 'Business 💼' },
]

// Same list, without the emoji, for the pickers
const interestOptions = availableInterests.map(i => ({ value: i.id, label: i.label.replace(/\s*\p{Extended_Pictographic}.*$/u, '') }))

const commonOccupations = [
  'Entrepreneur', 'Software Engineer', 'Medical Doctor', 'Lawyer', 'Banker', 'Teacher', 'Creative / Artist', 'Student', 'Nurse', 'Architect',
  'Real Estate Developer', 'HR Professional', 'Marketing Executive', 'Pilot', 'Fashion Designer', 'Chef', 'Auditor', 'Pharmacist', 'Content Creator',
]



const saving = ref(false)
const saveSuccess = ref(false)

const saveProfile = async (): Promise<boolean> => {
  const userId = currentUserId.value
  if (!userId) {
    toast.error('Please sign in again', 'Your session may have expired.')
    return false
  }
  if (editForm.min_age > editForm.max_age) {
    toast.error('Check the age range', 'The youngest age must be below the oldest.')
    return false
  }
  saving.value = true
  try {
    // Only the fields on this page; everything else on the profile is left as is
    const { error } = await supabase.schema('m2m').from('profiles').update({
      about_me: editForm.about_me.trim() || null,
      preferred_contact_method: editForm.preferred_contact_method || 'phone',
      instagram_handle: editForm.instagram_handle.trim() || null,
      snapchat_handle: editForm.snapchat_handle.trim() || null,
      occupation: editForm.occupation.trim() || null,
      religion: editForm.religion || null,
      height_cm: editForm.height_cm,
      genotype: editForm.genotype || null,
      interests: editForm.interests,
      intent: editForm.intent,
      interested_in: editForm.interested_in,
      min_age: editForm.min_age,
      max_age: editForm.max_age,
      location: editForm.location || null,
      availability: editForm.availability,
      // Keep any genotype dealbreakers set elsewhere
      dealbreakers: { ...(profile.value?.dealbreakers && !Array.isArray(profile.value.dealbreakers) ? profile.value.dealbreakers : {}), religion: editForm.dealbreakers.religion, intent: editForm.dealbreakers.intent },
    } as any).eq('id', userId)
    if (error) throw error
    await fetchProfileById(userId)

    // Refresh the AI preference extraction used for matching when the bio is meaningful
    if (editForm.about_me.trim().length > 10) {
      $fetch('/api/ai/extract-preferences', { method: 'POST', body: { userId } }).catch(err => console.error('Auto-extraction failed:', err))
    }

    saveSuccess.value = true
    haptic.hapticSuccess()
    toast.success('Profile saved', 'Your changes apply to your next match.')
    setTimeout(() => { saveSuccess.value = false }, 3000)
    return true
  } catch (err) {
    console.error('[Me] Save failed:', err)
    haptic.hapticError()
    toast.error("Couldn't save your profile", 'Please try again.')
    return false
  } finally {
    saving.value = false
  }
}

const fillForm = (p: any) => {
  if (!p) return
  Object.assign(editForm, {
    about_me: p.about_me || '',
    preferred_contact_method: p.preferred_contact_method || 'phone',
    instagram_handle: p.instagram_handle || '',
    snapchat_handle: p.snapchat_handle || '',
    occupation: p.occupation || '',
    religion: p.religion || '',
    height_cm: p.height_cm || null,
    genotype: p.genotype || '',
    interests: [...(p.interests || [])],
    intent: p.intent || 'serious',
    interested_in: p.interested_in || 'everyone',
    min_age: p.min_age || 18,
    max_age: p.max_age || 50,
    location: p.location === 'other' || p.location === 'Other' ? '' : (p.location || ''),
    availability: parseAvailability(p.availability),
    dealbreakers: {
      religion: [...(p.dealbreakers?.religion || [])],
      intent: [...(p.dealbreakers?.intent || [])].map((v: string) => v.toLowerCase()),
    },
  })
}
watch(() => profile.value, (p) => fillForm(p), { immediate: true })

function parseAvailability(raw: any): Record<string, string[]> {
  let parsed: any = raw
  try {
    if (typeof raw === 'string') parsed = raw ? JSON.parse(raw) : {}
  } catch {
    parsed = {}
  }
  return {
    weekdays: [...(parsed?.weekdays || [])],
    friday: [...(parsed?.friday || [])],
    saturday: [...(parsed?.saturday || [])],
    sunday: [...(parsed?.sunday || [])],
  }
}

// ===== Profile photo =====
const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const uploadingPhoto = ref(false)

const { uploadProfilePhoto } = usePhotoUpload()
const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow picking the same file again
  const userId = currentUserId.value
  if (!file || !userId || uploadingPhoto.value) return

  // Show it straight away; the helper resizes, rotates and converts it to JPEG before upload
  const localPreview = URL.createObjectURL(file)
  photoPreview.value = localPreview
  uploadingPhoto.value = true
  try {
    await uploadProfilePhoto(file, userId)
    await fetchProfileById(userId)
    haptic.hapticSuccess()
    toast.success('Photo updated', 'Your matches will see your new photo.')
  } catch (err: any) {
    console.error('[Me] Photo upload failed:', err)
    haptic.hapticError()
    toast.error('Upload failed', err instanceof PhotoError ? err.message : 'Please check your connection and try again.')
  } finally {
    uploadingPhoto.value = false
    photoPreview.value = null
    URL.revokeObjectURL(localPreview)
  }
}

// ===== Match readiness: the details the matchmaker and brief rely on =====
// Kept in shared state so switching back to Profile shows the right next step straight away.
// null = not loaded yet (the skeleton covers that on a first visit).
const myVibeKeys = useState<string[] | null>('me_vibeKeys', () => null)
const fetchMyVibeKeys = async (userId = currentUserId.value) => {
  if (!userId) { myVibeKeys.value ??= []; return }
  try {
    const { data } = await supabase.schema('m2m').from('vibe_answers').select('question_key').eq('user_id', userId)
    myVibeKeys.value = ((data as any[]) || []).map(a => a.question_key)
  } catch {
    myVibeKeys.value ??= []
  }
}

const readiness = computed(() => {
  const p = profile.value || {}
  const v2Answered = [...SCALE_QUESTIONS.map(q => q.key), VALUES_KEY].filter(k => (myVibeKeys.value || []).includes(k)).length
  const v2Total = SCALE_QUESTIONS.length + 1
  const freeSlots = Object.values(parseAvailability(p.availability)).flat().length
  const checks = [
    { id: 'photo', done: !!p.photo_url, label: 'Add a profile photo', why: 'The first thing your match sees', action: 'Add', target: 'me-photo' },
    { id: 'vibe', done: v2Answered >= v2Total - 1, label: 'Answer the new Vibe Check', why: `${v2Answered} of ${v2Total} new questions answered · biggest boost to accuracy`, action: 'Answer', to: '/vibe-check?retake=true' },
    { id: 'bio', done: (p.about_me || '').trim().length >= 40, label: 'Write a short bio', why: 'We read it to match personalities', action: 'Add', target: 'me-bio' },
    { id: 'city', done: !!normalizeCity(p.location), label: 'Add your city', why: 'Matches near you are easier to meet', action: 'Add', target: 'me-city' },
    { id: 'hobbies', done: (p.interests || []).length >= 3, label: 'Pick at least 3 hobbies', why: 'Shared hobbies count towards your score', action: 'Pick', target: 'me-hobbies' },
    { id: 'work', done: !!(p.occupation || '').trim(), label: 'Add your occupation', why: 'Helps us find a good fit for your lifestyle', action: 'Add', target: 'me-job' },
    { id: 'faith', done: !!p.religion, label: 'Add your faith', why: 'Shared faith is one of the strongest signals', action: 'Add', target: 'me-religion' },
    { id: 'free', done: freeSlots >= 2, label: 'Tell us when you’re free', why: 'So we can suggest a date time that works', action: 'Add', target: 'me-availability' },
  ]
  const done = checks.filter(c => c.done).length
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(c => !c.done) }
})

// ===== Rows: one panel open at a time, each with its own Save / Cancel =====
type PanelId = 'about' | 'lifestyle' | 'hobbies' | 'free' | 'seek' | 'deal'
const PANELS: { id: PanelId; title: string }[] = [
  { id: 'about', title: 'About you' },
  { id: 'lifestyle', title: 'Lifestyle & contact' },
  { id: 'hobbies', title: 'Hobbies' },
  { id: 'free', title: "When you're free" },
  { id: 'seek', title: "Who you're looking for" },
  { id: 'deal', title: 'Dealbreakers' },
]
const openPanel = ref<PanelId | null>(null)

const togglePanel = (id: PanelId) => {
  if (openPanel.value && openPanel.value !== id) fillForm(profile.value) // drop unsaved edits from the other row
  openPanel.value = openPanel.value === id ? null : id
  // On phones the opened row can land below the fold: bring its header into view
  if (openPanel.value) {
    nextTick(() => document.getElementById(`panel-${id}`)?.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}
const cancelPanel = () => {
  fillForm(profile.value)
  openPanel.value = null
}
const savePanel = async () => {
  if (await saveProfile()) openPanel.value = null
}

const INTEREST_LABEL = Object.fromEntries(availableInterests.map(i => [i.id, i.label]))
const SLOT_SHORT: Record<string, string> = { afternoon: 'afternoon', evening: 'evening', night: 'late night' }
const DAY_SHORT: Record<string, string> = { weekdays: 'Weekdays', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' }

// One-line summaries shown on each row (from what's saved, not unsaved edits)
const summaries = computed(() => {
  const p = profile.value || {}
  const city = toCityOption(p.location)
  const lifestyle = [p.occupation, p.religion, city === 'Other' ? '' : city].filter(Boolean).join(' · ')
  const hobbies = (p.interests || []).map((i: string) => (INTEREST_LABEL[i] || i).replace(/\s*\p{Extended_Pictographic}.*$/u, '')).join(', ')
  const avail = parseAvailability(p.availability)
  const freeParts = Object.entries(avail).flatMap(([day, slots]) => slots.map(sl => `${DAY_SHORT[day]} ${SLOT_SHORT[sl] || sl}`))
  const seekWho = ({ male: 'Men', female: 'Women', everyone: 'Everyone' } as Record<string, string>)[p.interested_in] || 'Everyone'
  const seekIntent = INTENTS.find(i => i.value === p.intent)?.label || ''
  const db = p.dealbreakers && !Array.isArray(p.dealbreakers) ? p.dealbreakers : {}
  const dealCount = (db.religion || []).length + (db.intent || []).length
  return {
    about: { text: (p.about_me || '').trim() || 'Add a few lines about you', empty: !(p.about_me || '').trim() },
    lifestyle: { text: lifestyle || 'Add your city, work and faith', empty: !lifestyle },
    hobbies: { text: hobbies || 'Pick a few hobbies', empty: !hobbies },
    free: { text: freeParts.length ? freeParts.slice(0, 3).join(', ') + (freeParts.length > 3 ? ` +${freeParts.length - 3}` : '') : "Add when you're free", empty: !freeParts.length },
    seek: { text: [seekWho, `${p.min_age || 18}–${p.max_age || 50}`, seekIntent].filter(Boolean).join(' · '), empty: false },
    deal: { text: dealCount ? `${dealCount} set` : 'None', empty: false },
  } as Record<PanelId, { text: string; empty: boolean }>
})

// Readiness line: jump straight to the right row (or photo / Vibe Check)
const TARGET_PANEL: Record<string, PanelId> = {
  'me-bio': 'about', 'me-city': 'lifestyle', 'me-job': 'lifestyle', 'me-religion': 'lifestyle', 'me-hobbies': 'hobbies', 'me-availability': 'free',
}
const goToReadinessItem = (item: { to?: string; target?: string }) => {
  if (item.to) return navigateTo(item.to)
  if (item.target === 'me-photo') return photoInput.value?.click()
  const panel = item.target ? TARGET_PANEL[item.target] : undefined
  if (!panel) return
  if (openPanel.value !== panel) togglePanel(panel)
  nextTick(() => {
    const el = document.getElementById(item.target!) || document.getElementById(`panel-${panel}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(el as HTMLElement | null)?.focus?.({ preventScroll: true })
  })
}

// ===== 4. Account deletion =====
const deletionRequest = useState<any>('me_deletionRequest', () => null)
const showDeletionModal = ref(false)
const submittingDeletionRequest = ref(false)
const cancellingDeletionRequest = ref(false)
const deletionReason = ref('found_match')
const DELETION_REASONS = [
  { value: 'found_match', label: 'I found a partner on Minutes 2 Match' },
  { value: 'taking_break', label: "I'm taking a break from dating" },
  { value: 'privacy', label: 'Privacy or security concerns' },
  { value: 'not_satisfied', label: "I'm not happy with my matches" },
  { value: 'other', label: 'Something else' },
]
const deletionDetails = ref('')

const fetchDeletionRequest = async () => {
  try {
    const res = await $fetch<{ success: boolean; request: any }>('/api/me/deletion-request')
    deletionRequest.value = res?.request || null
  } catch (err) {
    console.error('Failed to fetch deletion request:', err)
  }
}

const submitDeletionRequest = async () => {
  if (submittingDeletionRequest.value) return
  submittingDeletionRequest.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string; request: any }>('/api/me/deletion-request', {
      method: 'POST',
      body: { reason: deletionReason.value, details: deletionDetails.value },
    })
    toast.success('Request received', res.message || "We'll delete your account shortly.")
    deletionRequest.value = res.request
    showDeletionModal.value = false
  } catch (err: any) {
    toast.error("Couldn't submit", err.data?.statusMessage || err.message || 'Please try again.')
  } finally {
    submittingDeletionRequest.value = false
  }
}

const cancelDeletionRequest = async () => {
  if (cancellingDeletionRequest.value) return
  cancellingDeletionRequest.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string; request: any }>('/api/me/deletion-request/cancel', { method: 'POST' })
    toast.success('Welcome back', res.message || 'Your account will stay.')
    deletionRequest.value = res.request
  } catch (err: any) {
    toast.error("Couldn't cancel", err.data?.statusMessage || err.message || 'Please try again.')
  } finally {
    cancellingDeletionRequest.value = false
  }
}

// Skeleton until everything the page draws is here, so nothing appears and then changes.
// After the first visit it's all in shared state, so switching tabs shows the full page at once.
const showSkeleton = computed(() => !profile.value || myVibeKeys.value === null)

// Everything loads side by side; cached values are already on screen and refresh quietly
const supaUser = useSupabaseUser()
onMounted(async () => {
  const fastId = (supaUser.value as any)?.sub || (supaUser.value as any)?.id || currentUserId.value
  await Promise.all([initDashboard(), fastId ? fetchMyVibeKeys(fastId) : null, fetchDeletionRequest()])
  if (!fastId) await fetchMyVibeKeys()
})
</script>
