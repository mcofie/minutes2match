<template>
  <div class="letter-page mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>Matches | Minutes 2 Match</Title>
    </Head>

    <SkeletonMatchesPage v-if="loadingMatches" />

    <!-- No matches yet -->
    <section v-else-if="matches.length === 0" class="pb-6 pt-2 text-center sm:pt-6">
      <LoveBirds scene="why" class="section-art mx-auto mb-2 w-52 sm:w-72" />
      <span class="inline-flex rounded-full bg-white px-3.5 py-1 text-sm text-[#393737] ring-1 ring-black/[0.08]">Your matches</span>
      <h1 class="font-display mx-auto mt-5 max-w-xl text-[2.75rem] leading-[1.02] tracking-tight text-[#393737] sm:text-[4.5rem]">Your match is on the way.</h1>
      <p class="mx-auto mt-4 max-w-md text-lg leading-snug text-[#6c6862]">
        <template v-if="matchStatus.state === 'in' || matchStatus.state === 'next'">You're in. Matches go out {{ runLabel }}. We're looking for someone who shares what matters to you, and we'll text you as soon as they're ready.</template>
        <template v-else-if="matchStatus.state === 'done'">We couldn't find you a match this week. Opt in again for the next round, {{ runLabel }}.</template>
        <template v-else>You're not in matching yet. Opt in before {{ runLabel }} and we'll look for someone who shares what matters to you. It's free.</template>
      </p>
      <div class="mt-7 flex flex-col items-center gap-4">
        <button v-if="canOptIn" type="button" class="btn-solid grain grain-strong inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base disabled:opacity-60" :disabled="savingOptIn" @click="optIn">
          {{ savingOptIn ? 'Opting in…' : `Opt in for ${runDay}` }}
        </button>
        <p v-else class="inline-flex items-center gap-2 rounded-full bg-[#e9f6ef] px-4 py-2 text-sm font-semibold text-[#1f7a4d]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          You're in for {{ runDay }}
        </p>
        <NuxtLink to="/about#how-it-works" class="text-base font-semibold text-[#393737] underline-offset-4 hover:underline">How matching works</NuxtLink>
      </div>
    </section>

    <template v-else-if="featured">
      <!-- Header, Popcorn style: pill, big serif line, quiet subline -->
      <section class="pt-2 text-center sm:pt-8">
        <span class="inline-flex rounded-full bg-white px-3.5 py-1 text-sm text-[#393737] ring-1 ring-black/[0.08]">{{ featuredIsThisWeek ? "This week's match" : 'Your latest match' }}</span>
        <h1 class="font-display mt-4 text-[2.9rem] leading-[1.02] tracking-tight text-[#393737] sm:mt-5 sm:text-[5rem]">Meet {{ featuredName }}.</h1>
        <p class="mt-3 text-lg text-[#6c6862] sm:text-xl">
          <template v-if="scoreLine(featured)">{{ scoreLine(featured) }} </template>Matched {{ matchedWhen(featured.created_at) }}.
        </p>
        <p v-if="profile?.is_active === false" class="mt-3 inline-flex rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-medium text-[#b4232a]">You're hidden from matching right now</p>
      </section>

      <!-- A fan of cards: you, them, and what you share -->
      <NuxtLink :to="briefLink(featured)" class="relative z-10 mt-8 flex items-start justify-center sm:mt-12" :aria-label="`Open your match brief with ${featuredName}`">
        <div class="fan-card fan-back relative -mr-14 mt-8 h-[12rem] w-[8rem] shrink-0 overflow-hidden rounded-[1.1rem] bg-[#eceae6] shadow-[0_10px_30px_rgba(52,38,25,0.10)] sm:-mr-14 sm:h-[18rem] sm:w-48" style="--r: -8deg">
          <img v-if="profile?.photo_url" :src="avatarUrl(profile.photo_url, 220)" alt="" decoding="async" class="h-full w-full object-cover" />
          <span v-else class="font-display flex h-full w-full items-center justify-center text-5xl text-[#b9c3cf]">{{ (profile?.display_name || 'You').charAt(0) }}</span>
          <span class="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-[#393737] backdrop-blur">You</span>
        </div>
        <div class="fan-card relative z-10 h-[17rem] w-[11.5rem] shrink-0 overflow-hidden rounded-[1.25rem] bg-[#e9eff5] shadow-[0_28px_60px_rgba(52,38,25,0.26)] ring-[3px] ring-white sm:h-[23rem] sm:w-[15.5rem]" style="--r: 0deg">
          <img v-if="featured.matchedProfile?.photo_url" :src="avatarUrl(featured.matchedProfile.photo_url, 260, 370)" :alt="featuredName" width="520" height="740" decoding="async" fetchpriority="high" class="h-full w-full object-cover" />
          <span v-else class="font-display flex h-full w-full items-center justify-center text-7xl text-[#b9c3cf]">{{ featuredName.charAt(0) }}</span>
          <span class="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-[#393737] backdrop-blur">{{ featuredName }}</span>
        </div>
        <!-- A keepsake made for this pair: their scene, what they share, which match this is -->
        <div class="fan-card fan-back relative -ml-14 mt-8 h-[12rem] w-[8rem] shrink-0 overflow-hidden rounded-[1.1rem] shadow-[0_10px_30px_rgba(52,38,25,0.10)] ring-1 ring-black/[0.04] sm:h-[18rem] sm:w-48" :style="{ '--r': '8deg', background: keepsake.tint }">
          <!-- glow behind the painted scene -->
          <div aria-hidden="true" class="absolute -right-6 top-2 h-32 w-32 rounded-full opacity-80 blur-2xl sm:h-44 sm:w-44" :style="{ background: keepsake.glow }"></div>
          <LetterVignette :scene="keepsake.scene" class="absolute -right-5 top-1 w-[7.5rem] opacity-90 mix-blend-luminosity sm:-right-4 sm:top-3 sm:w-[10.5rem]" />
          <!-- tiny sparkles -->
          <span v-for="(dot, i) in KEEPSAKE_SPARKLES" :key="i" aria-hidden="true" class="absolute rounded-full bg-white" :style="{ left: dot[0], top: dot[1], width: `${dot[2]}px`, height: `${dot[2]}px`, opacity: dot[3] }"></span>
          <div class="absolute inset-x-0 bottom-0 flex flex-col items-end pb-3 pl-[3.6rem] pr-2.5 pt-12 text-right sm:pb-4 sm:pr-4 sm:pt-16" :style="{ background: keepsake.band }">
            <span class="whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/75 sm:text-[0.65rem]"><span class="hidden sm:inline">Match </span>No. {{ keepsake.number }}</span>
            <span v-if="keepsake.line" class="font-display mt-1 text-[0.9rem] leading-[1.1] tracking-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.15)] sm:text-xl">{{ keepsake.line }}</span>
            <span class="mt-1.5 whitespace-nowrap text-[0.65rem] tabular-nums text-white/80 sm:text-xs"><span class="sm:hidden">{{ keepsake.monthShort }}</span><span class="hidden sm:inline">{{ keepsake.month }}</span></span>
          </div>
        </div>
      </NuxtLink>

      <!-- What we know, as a list -->
      <div class="relative mx-auto -mt-10 max-w-md rounded-[1.75rem] bg-white px-5 pb-6 pt-14 shadow-[0_10px_30px_rgba(52,38,25,0.06)] ring-1 ring-black/[0.05] sm:-mt-12 sm:px-6 sm:pt-16">
        <ul class="divide-y divide-black/[0.06]">
          <li v-for="row in featuredRows" :key="row.icon" class="flex items-start gap-3.5 py-3.5 text-base text-[#393737]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-5 w-5 shrink-0 text-[#393737]" aria-hidden="true" v-html="ICONS[row.icon]"></svg>
            <span class="min-w-0" :class="row.icon === 'note' ? 'font-display text-[1.05rem] leading-snug' : ''">{{ row.text }}</span>
          </li>
        </ul>
        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <NuxtLink :to="briefLink(featured)" @pointerenter="prefetchBrief(featured.id)" class="btn-solid grain inline-flex w-full items-center justify-center px-6 py-3 text-base sm:w-auto">Read your match brief</NuxtLink>
          <button type="button" class="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#393737] px-6 py-3 text-base font-semibold text-[#393737] transition-colors hover:bg-[#393737] hover:text-white sm:w-auto" @click="sayHelloToFeatured">
            Say hello <span aria-hidden="true">→</span>
          </button>
        </div>
        <p class="mt-3 text-center text-xs text-[#9b9690]">{{ helloHintFor(featured.matchedProfile, featuredName) }}</p>
      </div>

      <!-- Where you stand for the next run -->
      <div class="mx-auto mt-5 flex max-w-md items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-black/[0.05]">
        <p class="text-sm leading-snug text-[#393737]">{{ nextRunText }}</p>
        <button v-if="canOptIn" type="button" class="btn-solid grain shrink-0 px-4 py-2 text-sm disabled:opacity-60" :disabled="savingOptIn" @click="optIn">{{ savingOptIn ? 'Opting in…' : 'Opt in' }}</button>
        <span v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f6ef] text-[#1f7a4d]" aria-label="You're in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
      </div>

      <!-- Past matches: one quiet row, like an FAQ item -->
      <details v-if="pastMatches.length" class="group mx-auto mt-10 max-w-md sm:mt-14">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-black/[0.05] [&::-webkit-details-marker]:hidden">
          <span class="font-display text-[1.3rem] leading-none text-[#393737]">Past matches <span class="text-[#9b9690]">· {{ pastMatches.length }}</span></span>
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecebe9] text-[#8a8785] transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </summary>
        <ul class="mt-2 space-y-2">
          <li v-for="m in pastMatches" :key="m.id">
            <NuxtLink :to="briefLink(m)" @pointerenter="prefetchBrief(m.id)" @touchstart.passive="prefetchBrief(m.id)" class="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/[0.05] transition-colors hover:bg-[#fcfbfa]">
              <span class="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#eceae6]">
                <img v-if="m.matchedProfile?.photo_url" :src="avatarUrl(m.matchedProfile.photo_url, 48)" alt="" decoding="async" class="h-full w-full object-cover" loading="lazy" />
                <span v-else class="font-display flex h-full w-full items-center justify-center text-lg text-[#9b9690]">{{ nameOf(m).charAt(0) }}</span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="font-display block truncate text-lg leading-tight text-[#393737]">{{ nameOf(m) }}</span>
                <span class="mt-0.5 block truncate text-sm text-[#9b9690]">Matched {{ matchedWhen(m.created_at) }}<template v-if="scoreOf(m) >= 50"> · {{ scoreOf(m) }}%</template></span>
              </span>
              <span v-if="myFeedback[m.id]" class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="FEEDBACK_LABEL[myFeedback[m.id]]?.cls || 'bg-[#f4f2ef] text-[#6c6862]'">{{ FEEDBACK_LABEL[myFeedback[m.id]]?.label || 'Answered' }}</span>
            </NuxtLink>
          </li>
        </ul>
      </details>
    </template>
  </div>
</template>

<script setup lang="ts">
import { weeklyMatchStatus, formatMatchRun, currentMatchWeekEnd, optInWeekEnd } from '~/utils/matchWeek'
import { useToast } from '~/composables/useToast'
import { useSayHello, helloHintFor } from '~/composables/useSayHello'
import { useMatchStore } from '~/stores/useMatchStore'
import { storeToRefs } from 'pinia'
import type { M2MDatabase } from '~/types/database.types'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const toast = useToast()
const { profile, fetchProfileById } = useDashboard()
// Matching runs once a week, on Sunday (see utils/matchWeek)
const matchStatus = computed(() => weeklyMatchStatus(profile.value?.weekly_opt_in_until, profile.value?.is_active !== false))
const runLabel = computed(() => formatMatchRun(matchStatus.value.runAt))
// "Sunday 19 October"
const runDay = computed(() => matchStatus.value.runAt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))
// Not in for the next run yet: offer the one-tap opt-in
const canOptIn = computed(() => ['open', 'closed', 'done'].includes(matchStatus.value.state))

// Opt in right here (same update as the profile page): before Sunday's run it counts for this week, after it for next
const savingOptIn = ref(false)
const optIn = async () => {
  const userId = currentUserId.value || profile.value?.id
  if (!userId || savingOptIn.value) return
  savingOptIn.value = true
  try {
    const { error } = await supabase.schema('m2m').from('profiles')
      .update({ weekly_opt_in_until: optInWeekEnd().toISOString(), is_active: true } as any).eq('id', userId)
    if (error) throw error
    await fetchProfileById(userId)
    toast.success("You're in", `Your match arrives ${runLabel.value}. We'll text you.`)
  } catch (err) {
    console.error('[Matches] Opt-in failed:', err)
    toast.error("Couldn't opt you in", 'Please try again.')
  } finally {
    savingOptIn.value = false
  }
}

const nextRunText = computed(() => {
  const state = matchStatus.value.state
  if (state === 'in' || state === 'next') return `You're in for ${runDay.value}. We'll text you when your next match is ready.`
  if (state === 'done' && !featuredIsThisWeek.value) return `No match for you this week. Opt in again for ${runDay.value}.`
  return `Want your next match on ${runDay.value}? Opt in, it's free.`
})

const matchStore = useMatchStore()
const { matches, loadingMatches } = storeToRefs(matchStore)
const { fetchMatches } = matchStore


const getAge = (birthDate: string | null): number => {
  if (!birthDate) return 25
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// One match a week: the newest leads, everything before it is history
const featured = computed(() => matches.value[0] || null)
const pastMatches = computed(() => matches.value.slice(1))
const featuredIsThisWeek = computed(() => {
  const created = featured.value?.created_at
  if (!created) return false
  const weekStart = currentMatchWeekEnd().getTime() - 7 * 24 * 60 * 60 * 1000
  return new Date(created).getTime() > weekStart
})

const stripEmoji = (text: string) => String(text || '').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u200D\uFE0F]/gu, '').replace(/\s{2,}/g, ' ').trim()
const nameOf = (m: any) => m?.matchedProfile?.display_name?.split(' ')[0] || 'Your match'
const featuredName = computed(() => nameOf(featured.value))
const scoreOf = (m: any) => Math.round(Number(m?.match_score) || 0)
// As in the match letter: below 50 we don't put a number on it
const scoreLine = (m: any) => {
  const score = scoreOf(m)
  if (!score) return ''
  return score < 50 ? 'Different in ways worth exploring.' : `${score}% compatible.`
}
// "accra, east legon" -> "Accra, East Legon"
const formatPlace = (raw?: string | null) => String(raw || '').replace(/_/g, ' ').trim().toLowerCase().replace(/(^|[\s,(-])\p{L}/gu, c => c.toUpperCase())

// Say hello from here too, with a first message built on something real
const openHello = useSayHello()
const sayHelloToFeatured = () => {
  const m = featured.value
  if (!m) return
  const hi = m.matchedProfile?.display_name ? `Hi ${featuredName.value}` : 'Hi'
  const sharedId = (m.matchedProfile?.interests || []).find((i: string) => (profile.value?.interests || []).includes(i) && INTEREST_SCENE[i])
  const message = m.is_from_lobby
    ? `${hi}, it was great connecting in the lobby. Coffee this week?`
    : sharedId
      ? `${hi}, looks like we're both into ${INTEREST_SCENE[sharedId].words}. Coffee this week?`
      : `${hi}, we've just been matched on Minutes 2 Match. Coffee this week?`
  openHello(m.matchedProfile, featuredName.value, message, m.id)
}

// Your own answer to "how's it going?" for each past match
const FEEDBACK_LABEL: Record<string, { label: string; cls: string }> = {
  going_well: { label: 'Going well', cls: 'bg-[#e9f6ef] text-[#1f7a4d]' },
  chatting: { label: 'Chatting', cls: 'bg-[#eaf1fb] text-[#2f5d9e]' },
  no_reply: { label: 'No reply', cls: 'bg-[#f4f2ef] text-[#6c6862]' },
  not_a_fit: { label: 'Not a fit', cls: 'bg-[#f4f2ef] text-[#9b9690]' },
}
const myFeedback = ref<Record<string, string>>({})
const loadMyFeedback = async () => {
  try {
    myFeedback.value = await $fetch<Record<string, string>>('/api/matches/my-feedback')
  } catch { /* the list still works without it */ }
}
const featuredNote = computed(() => stripEmoji(featured.value?.ai_analysis || featured.value?.matchedProfile?.ai_analysis || ''))
const featuredReasons = computed<string[]>(() =>
  (Array.isArray(featured.value?.match_reasons) ? featured.value.match_reasons : [])
    .filter((r: any) => typeof r === 'string').map(stripEmoji).filter(Boolean).slice(0, 3)
)
const briefLink = (m: any) => `/me/connection/${m.id}`

// The keepsake card: unique to the pair. The scene follows what they share; failing that, the match id picks one.
type KeepsakeScene = 'dawn' | 'meadow' | 'tree' | 'night' | 'sunset' | 'meet'
const INTEREST_SCENE: Record<string, { scene: KeepsakeScene; words: string }> = {
  music: { scene: 'sunset', words: 'music' }, dancing: { scene: 'sunset', words: 'dancing' }, movies: { scene: 'night', words: 'film nights' },
  reading: { scene: 'night', words: 'a good book' }, art: { scene: 'night', words: 'art' }, photography: { scene: 'meadow', words: 'photography' },
  travel: { scene: 'meadow', words: 'travel' }, nature: { scene: 'meadow', words: 'the outdoors' }, fitness: { scene: 'dawn', words: 'staying active' },
  sports: { scene: 'dawn', words: 'sport' }, food: { scene: 'tree', words: 'good food' }, cooking: { scene: 'tree', words: 'cooking' },
  tech: { scene: 'night', words: 'tech' }, fashion: { scene: 'sunset', words: 'style' }, gaming: { scene: 'night', words: 'gaming' },
  entrepreneurship: { scene: 'dawn', words: 'building things' },
}
// Each scene's card colours: base gradient, a glow behind the painting, and the band behind the text
const SCENE_TINT: Record<KeepsakeScene, string> = {
  dawn: 'linear-gradient(165deg,#7aa7e6 0%,#b58ee8 45%,#ff9f7a 100%)',
  meadow: 'linear-gradient(165deg,#5fb3e8 0%,#5fd0a8 55%,#c6e86b 100%)',
  tree: 'linear-gradient(165deg,#4fc1b0 0%,#8bd67a 50%,#ffd36b 100%)',
  night: 'linear-gradient(165deg,#3b3f9e 0%,#7a4fc4 50%,#e66fa8 100%)',
  sunset: 'linear-gradient(165deg,#ff7a9a 0%,#ff6b5b 45%,#ffb347 100%)',
  meet: 'linear-gradient(165deg,#ed1c24 0%,#ff5e7e 50%,#ffa45c 100%)',
}
const SCENE_GLOW: Record<KeepsakeScene, { glow: string; band: string }> = {
  dawn: { glow: '#ffd9a8', band: 'linear-gradient(to top, rgba(120,70,170,0.75), rgba(120,70,170,0))' },
  meadow: { glow: '#fff3a8', band: 'linear-gradient(to top, rgba(20,120,95,0.75), rgba(20,120,95,0))' },
  tree: { glow: '#fff0b0', band: 'linear-gradient(to top, rgba(25,120,105,0.75), rgba(25,120,105,0))' },
  night: { glow: '#ffd1f0', band: 'linear-gradient(to top, rgba(35,30,95,0.8), rgba(35,30,95,0))' },
  sunset: { glow: '#ffe1a8', band: 'linear-gradient(to top, rgba(190,40,70,0.75), rgba(190,40,70,0))' },
  meet: { glow: '#ffd6b0', band: 'linear-gradient(to top, rgba(160,15,35,0.75), rgba(160,15,35,0))' },
}
const KEEPSAKE_SPARKLES: [string, string, number, number][] = [
  ['62%', '10%', 3, 0.9], ['84%', '22%', 2, 0.7], ['70%', '38%', 2, 0.6], ['90%', '50%', 3, 0.8], ['56%', '28%', 2, 0.5],
]
const SCENES: KeepsakeScene[] = ['dawn', 'meadow', 'tree', 'night', 'sunset', 'meet']
const hashString = (text: string) => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

const keepsake = computed(() => {
  const m = featured.value
  const theirs: string[] = m?.matchedProfile?.interests || []
  const mine: string[] = profile.value?.interests || []
  const shared = theirs.find(i => mine.includes(i) && INTEREST_SCENE[i])
  const intent = m?.matchedProfile?.intent === profile.value?.intent ? m?.matchedProfile?.intent : null

  let scene: KeepsakeScene = SCENES[hashString(m?.id || '') % SCENES.length]
  let line = ''
  if (shared) {
    scene = INTEREST_SCENE[shared].scene
    line = `Both love ${INTEREST_SCENE[shared].words}`
  } else if (intent === 'marriage') {
    scene = 'dawn'; line = 'Both want forever'
  } else if (intent === 'serious') {
    scene = 'meet'; line = 'Both here for real'
  } else if (featuredReasons.value[0]) {
    line = featuredReasons.value[0]
  }

  return {
    scene,
    line,
    tint: SCENE_TINT[scene],
    ...SCENE_GLOW[scene],
    number: String(matches.value.length).padStart(2, '0'),
    month: m?.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '',
    monthShort: m?.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '',
  }
})

// Line icons for the detail list (lucide-style paths)
const ICONS: Record<string, string> = {
  place: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  work: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  shared: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  note: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
}
const featuredRows = computed(() => {
  const m = featured.value
  if (!m) return []
  const p = m.matchedProfile || {}
  const rows: { icon: string; text: string }[] = []
  const place = [p.birth_date ? `${getAge(p.birth_date)}` : '', formatPlace(p.location)].filter(Boolean).join(' · ')
  if (place) rows.push({ icon: 'place', text: place })
  if (p.occupation) rows.push({ icon: 'work', text: p.occupation })
  if (featuredReasons.value.length) rows.push({ icon: 'shared', text: featuredReasons.value.join(' · ') })
  if (featuredNote.value) rows.push({ icon: 'note', text: `“${featuredNote.value}”` })
  return rows
})

const matchedWhen = (iso?: string) => {
  if (!iso) return 'recently'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return `on ${new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`
}

// Load the dashboard and matches side by side (not one after the other), then warm the newest brief
const { initDashboard, currentUserId } = useDashboard()
const supaUser = useSupabaseUser()
const { prefetchBrief } = useMatchBrief()
onMounted(async () => {
    const fastId = (supaUser.value as any)?.sub || (supaUser.value as any)?.id || currentUserId.value
    try {
        if (fastId) {
            await Promise.all([initDashboard(), fetchMatches(fastId)])
        } else if (await initDashboard() && currentUserId.value) {
            await fetchMatches(currentUserId.value)
        } else {
            loadingMatches.value = false
        }
    } catch {
        loadingMatches.value = false
    }
    prefetchBrief(featured.value?.id)
    if (pastMatches.value.length) loadMyFeedback()
})
</script>
