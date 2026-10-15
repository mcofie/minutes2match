<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Matchmaker</h1>
        <p class="ad-sub">Members who opt in are matched automatically each week. Use this to introduce two people by hand, or preview who the automatic run would pair.</p>
      </div>
      <div class="ad-actions">
        <NuxtLink to="/admin/matches/scoring-logic" class="btn-ghost btn-sm">How scoring works</NuxtLink>
        <NuxtLink to="/admin/matches" class="btn-ghost btn-sm">All matches</NuxtLink>
      </div>
    </header>

    <div class="ad-toolbar">
      <div class="ad-tabs" role="tablist" aria-label="Mode">
        <button role="tab" :aria-selected="mode === 'manual'" class="ad-tab" :class="{ 'is-active': mode === 'manual' }" @click="mode = 'manual'">By hand</button>
        <button role="tab" :aria-selected="mode === 'auto'" class="ad-tab" :class="{ 'is-active': mode === 'auto' }" @click="mode = 'auto'; generateAutoMatches()">Automatic preview</button>
      </div>
      <div class="ad-toolbar__spacer"></div>
      <div class="ad-tabs" role="tablist" aria-label="Who to include">
        <button role="tab" :aria-selected="pool === 'week'" class="ad-tab" :class="{ 'is-active': pool === 'week' }" @click="pool = 'week'">
          Opted in this week <span class="ad-tab__count">{{ optedInCount }}</span>
        </button>
        <button role="tab" :aria-selected="pool === 'everyone'" class="ad-tab" :class="{ 'is-active': pool === 'everyone' }" @click="pool = 'everyone'">
          Everyone <span class="ad-tab__count">{{ activeCount }}</span>
        </button>
      </div>
    </div>

    <div v-if="loadingData" class="ad-panel"><div class="ad-empty"><span class="ad-spinner"></span><p class="mt-3">Loading members and answers…</p></div></div>

    <!-- ============ AUTOMATIC PREVIEW ============ -->
    <template v-else-if="mode === 'auto'">
      <section class="ad-panel mb-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-xl text-sm ad-muted">
            Same as the weekly run: each person at most once, chosen so the most people get a good match.
            Members already matched this week are left out; anyone who missed out last week gets priority.
          </div>
          <div class="flex items-end gap-2">
            <label class="text-xs ad-muted">
              Minimum score
              <span class="relative mt-1 block w-28">
                <input v-model.number="autoConfig.minScore" type="number" min="0" max="100" class="form-input ad-num !pr-8 text-right" />
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ad-faint">%</span>
              </span>
            </label>
            <button class="btn-ink" :disabled="generatingAuto" @click="generateAutoMatches">{{ generatingAuto ? 'Scoring…' : 'Run preview' }}</button>
          </div>
        </div>

        <div class="ad-stats !mb-0 mt-5 !shadow-none">
          <div class="ad-stat">
            <div class="ad-stat__label">In the pool</div>
            <div class="ad-stat__value">{{ autoPoolSize }}</div>
            <div class="ad-stat__hint">{{ pool === 'week' ? 'opted in, not matched yet' : 'active, not matched this week' }}</div>
          </div>
          <div class="ad-stat">
            <div class="ad-stat__label">Pairs found</div>
            <div class="ad-stat__value">{{ autoMatches.length }}</div>
          </div>
          <div class="ad-stat">
            <div class="ad-stat__label">Would stay unmatched</div>
            <div class="ad-stat__value">{{ Math.max(0, autoPoolSize - autoMatches.length * 2) }}</div>
          </div>
          <div class="ad-stat">
            <div class="ad-stat__label">Selected</div>
            <div class="ad-stat__value">{{ selectedAutoMatches.length }}</div>
          </div>
        </div>
      </section>

      <div v-if="autoMatches.length" class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-1">
          <button class="btn-ghost btn-sm" @click="selectedAutoMatches = [...autoMatches]">Select all</button>
          <button class="btn-ghost btn-sm" @click="selectAllHigh">Select 80%+ without warnings</button>
          <button v-if="selectedAutoMatches.length" class="btn-ghost btn-sm" @click="selectedAutoMatches = []">Clear</button>
        </div>
        <button class="btn-primary" :disabled="!selectedAutoMatches.length || creatingBulk" @click="createBulkMatches">
          {{ creatingBulk ? 'Introducing…' : `Introduce ${selectedAutoMatches.length || ''} pair${selectedAutoMatches.length === 1 ? '' : 's'}` }}
        </button>
      </div>

      <p v-if="bulkSuccess" class="ad-callout mb-4 !bg-[#e9f6ef] !text-[#1f7a4d]">{{ bulkSuccess }}</p>
      <p v-if="bulkError" class="ad-callout ad-callout--red mb-4">{{ bulkError }}</p>

      <div v-if="generatingAuto" class="ad-panel"><div class="ad-empty"><span class="ad-spinner"></span></div></div>
      <div v-else-if="!autoMatches.length" class="ad-panel">
        <div class="ad-empty">
          <p class="ad-empty__title">No pairs at {{ autoConfig.minScore }}% or above</p>
          <p>{{ autoPoolSize < 2 ? 'There aren’t enough people in the pool yet.' : 'Try a lower minimum score.' }}</p>
          <button v-if="autoPoolSize >= 2 && autoConfig.minScore > 0" class="btn-secondary mt-4" @click="autoConfig.minScore = Math.max(0, autoConfig.minScore - 10); generateAutoMatches()">
            Try {{ Math.max(0, autoConfig.minScore - 10) }}%
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="match in autoMatches"
          :key="`${match.user1.id}-${match.user2.id}`"
          class="ad-panel !p-4 text-left transition-shadow"
          :class="isAutoMatchSelected(match) ? '!shadow-[0_0_0_2px_#393737]' : 'hover:!shadow-[0_14px_36px_rgba(52,38,25,0.10)]'"
          :aria-pressed="isAutoMatchSelected(match)"
          @click="toggleAutoMatchSelection(match)"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="ad-pill ad-pill--plain" :class="scorePill(match.score)">{{ match.score }}%</span>
            <span class="flex h-5 w-5 items-center justify-center rounded-full border" :class="isAutoMatchSelected(match) ? 'border-[#393737] bg-[#393737] text-white' : 'border-[#ded9d2]'">
              <svg v-if="isAutoMatchSelected(match)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="u in [match.user1, match.user2]" :key="u.id" class="ad-person">
              <span class="ad-avatar">
                <img v-if="u.photo_url" :src="u.photo_url" alt="" />
                <template v-else>{{ u.display_name?.charAt(0) || '?' }}</template>
              </span>
              <span class="min-w-0">
                <span class="ad-person__name text-sm">{{ u.display_name }}</span>
                <span class="ad-person__meta">{{ shortMeta(u) }}</span>
              </span>
            </div>
          </div>
          <p v-if="match.missedLastWeek" class="mt-3 text-xs font-medium text-[#2f5d9e]">Priority: missed out last week</p>
          <p v-if="match.reasons.length" class="mt-3 line-clamp-2 text-xs ad-muted">{{ match.reasons.slice(0, 2).join(' · ') }}</p>
          <p v-if="match.warnings.length" class="mt-1 line-clamp-1 text-xs text-[#9a5b0f]">{{ match.warnings[0] }}</p>
        </button>
      </div>
    </template>

    <!-- ============ BY HAND ============ -->
    <template v-else>
      <section class="ad-panel mb-6">
        <div class="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div
            v-for="slot in ([1, 2] as const)"
            :key="slot"
            class="relative rounded-[1.25rem] p-4 transition-shadow"
            :class="[
              slot === 2 ? 'md:order-3' : '',
              selectingSlot === slot ? 'bg-[#faf8f5] shadow-[0_0_0_2px_#393737]' : 'bg-[#f6f4f1]',
              slotUser(slot) ? '' : 'cursor-pointer'
            ]"
            @click="selectingSlot = slot"
          >
            <template v-if="slotUser(slot)">
              <button class="ad-icon-btn absolute right-2 top-2 !h-8 !w-8" :aria-label="`Clear person ${slot === 1 ? 'A' : 'B'}`" @click.stop="clearSlot(slot)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
              <div class="ad-person pr-8">
                <span class="ad-avatar ad-avatar--lg">
                  <img v-if="slotUser(slot).photo_url" :src="slotUser(slot).photo_url" alt="" />
                  <template v-else>{{ slotUser(slot).display_name?.charAt(0) || '?' }}</template>
                </span>
                <div class="min-w-0">
                  <span class="ad-person__name text-base">{{ slotUser(slot).display_name }}</span>
                  <span class="ad-person__meta">{{ longMeta(slotUser(slot)) }}</span>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap gap-1">
                <span v-if="isOptedIn(slotUser(slot))" class="ad-pill ad-pill--blue">In this week</span>
                <span v-if="matchedThisWeek.has(slotUser(slot).id)" class="ad-pill ad-pill--amber">Matched this week</span>
                <span v-if="slotUser(slot).is_active === false" class="ad-pill">Incognito</span>
                <span v-if="slotUser(slot).intent" class="ad-pill ad-pill--plain capitalize">{{ slotUser(slot).intent }}</span>
                <span v-if="slotUser(slot).genotype" class="ad-pill ad-pill--plain">{{ slotUser(slot).genotype }}</span>
                <span v-if="slotUser(slot).dating_persona" class="ad-pill ad-pill--plain">{{ getPersona(slotUser(slot).dating_persona)?.name }}</span>
              </div>
            </template>
            <div v-else class="flex h-full min-h-[7rem] flex-col items-center justify-center text-center">
              <p class="font-display text-xl">Person {{ slot === 1 ? 'A' : 'B' }}</p>
              <p class="mt-1 text-sm ad-faint">
                {{ slot === 1 ? 'Pick someone below' : user1 ? 'Pick from their best fits below' : 'Pick person A first' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center gap-2 px-2 md:order-2">
            <p class="font-display text-[2.5rem] leading-none" :class="user2 && matchData.score < 40 ? 'text-[#b4232a]' : ''">{{ user1 && user2 ? `${matchData.score}%` : '—' }}</p>
            <span v-if="user1 && user2" class="ad-pill" :class="matchData.eligibility?.eligible ? 'ad-pill--green' : 'ad-pill--red'">{{ matchData.eligibility?.eligible ? 'Eligible' : 'Blocked' }}</span>
            <button class="btn-primary mt-2" :disabled="!canCreateMatch || creating" @click="createMatch">{{ creating ? 'Introducing…' : 'Introduce' }}</button>
          </div>
        </div>

        <!-- Why / why not -->
        <div v-if="user1 && user2" class="mt-6 grid grid-cols-1 gap-6 border-t border-[#ece8e3] pt-5 md:grid-cols-2">
          <div class="space-y-4">
            <div v-if="matchData.reasons.length">
              <span class="ad-label">Strengths</span>
              <ul class="space-y-1.5 text-sm">
                <li v-for="reason in matchData.reasons" :key="reason" class="flex gap-2.5"><span class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f7a4d]"></span>{{ reason }}</li>
              </ul>
            </div>
            <div v-if="matchData.warnings.length">
              <span class="ad-label">Watch-outs</span>
              <ul class="space-y-1.5 text-sm">
                <li v-for="warn in matchData.warnings" :key="warn" class="flex gap-2.5"><span class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d08a1e]"></span>{{ warn }}</li>
              </ul>
            </div>
            <div v-if="matchData.eligibility?.hardBlockers?.length">
              <span class="ad-label">Blockers</span>
              <ul class="space-y-1.5 text-sm text-[#b4232a]">
                <li v-for="blocker in matchData.eligibility.hardBlockers" :key="blocker" class="flex gap-2.5"><span class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ed1c24]"></span>{{ blocker }}</li>
              </ul>
            </div>
            <p class="text-xs ad-faint">
              Confidence {{ matchData.confidence || 0 }}%<template v-if="matchData.missingData?.length"> · missing {{ matchData.missingData.join(', ') }}</template>
            </p>
          </div>
          <div v-if="matchData.breakdown">
            <span class="ad-label">Breakdown</span>
            <CompatibilityBreakdown :breakdown="matchData.breakdown" />
          </div>
        </div>

        <p v-if="matchSuccess" class="ad-callout mt-5 !bg-[#e9f6ef] !text-[#1f7a4d]">{{ matchSuccess }}</p>
        <p v-if="matchError" class="ad-callout ad-callout--red mt-5">{{ matchError }}</p>
      </section>

      <!-- Candidates -->
      <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="font-display text-2xl leading-tight">{{ user1 && selectingSlot === 2 ? `Best fits for ${user1.display_name}` : 'Choose person A' }}</h2>
          <p class="mt-0.5 text-sm ad-muted">{{ filteredCandidates.length }} {{ user1 && selectingSlot === 2 ? 'sorted by compatibility' : pool === 'week' ? 'opted in this week' : 'active members' }}</p>
        </div>
      </div>
      <div class="ad-toolbar">
        <label class="ad-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
          <input v-model="filters.search" type="search" placeholder="Search name or phone" aria-label="Search members" />
        </label>
        <div class="ad-tabs" role="tablist" aria-label="Gender">
          <button v-for="g in [{ k: '', l: 'Everyone' }, { k: 'female', l: 'Women' }, { k: 'male', l: 'Men' }]" :key="g.k" class="ad-tab" :class="{ 'is-active': filters.gender === g.k }" @click="filters.gender = g.k">{{ g.l }}</button>
        </div>
        <select v-model="filters.city" class="ad-select" aria-label="City">
          <option value="">All cities</option>
          <option v-for="c in SERVED_CITIES" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
        <select v-model="filters.genotype" class="ad-select" aria-label="Genotype">
          <option value="">Any genotype</option>
          <option v-for="g in ['AA', 'AS', 'SS', 'AC', 'SC']" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <div v-if="filteredCandidates.length === 0" class="ad-panel">
        <div class="ad-empty">
          <p class="ad-empty__title">Nobody here</p>
          <p>{{ pool === 'week' ? 'No one has opted in this week yet. Switch to Everyone to see all active members.' : 'No members fit these filters.' }}</p>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="user in paginationCandidates"
          :key="user.id"
          class="ad-panel flex flex-col !p-4 text-left transition-shadow"
          :class="[
            isSelected(user) ? '!shadow-[0_0_0_2px_#393737]' : 'hover:!shadow-[0_14px_36px_rgba(52,38,25,0.10)]',
            isDisabled(user) ? 'pointer-events-none opacity-40' : ''
          ]"
          :disabled="isDisabled(user)"
          @click="selectCandidate(user)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="ad-person">
              <span class="ad-avatar">
                <img v-if="user.photo_url" :src="user.photo_url" alt="" />
                <template v-else>{{ user.display_name?.charAt(0) || '?' }}</template>
              </span>
              <span class="min-w-0">
                <span class="ad-person__name text-sm">{{ user.display_name }}</span>
                <span class="ad-person__meta">{{ shortMeta(user) }}</span>
              </span>
            </div>
            <span v-if="user.matchDetails && !isDisabled(user)" class="ad-pill ad-pill--plain shrink-0" :class="scorePill(user.matchDetails.score)">{{ user.matchDetails.score }}%</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-1">
            <span v-if="matchedThisWeek.has(user.id)" class="ad-pill ad-pill--amber">Matched this week</span>
            <span v-else-if="isOptedIn(user)" class="ad-pill ad-pill--blue">In this week</span>
            <span v-if="user.intent" class="ad-pill ad-pill--plain capitalize">{{ user.intent }}</span>
            <span v-if="user.genotype" class="ad-pill ad-pill--plain">{{ user.genotype }}</span>
          </div>
          <p v-if="user.matchDetails?.reasons?.length" class="mt-2 line-clamp-2 text-xs ad-muted">{{ user.matchDetails.reasons.slice(0, 2).join(' · ') }}</p>
        </button>
      </div>

      <div v-if="filteredCandidates.length > visibleCount" class="mt-6 text-center">
        <button class="btn-secondary" @click="visibleCount += 12">Show more</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'
import type { CandidatePair } from '~/utils/pairing'
import type { M2MDatabase } from '~/types/database.types'

interface VibeAnswer {
  question_key: string
  answer_value: string
  /** Ties older question variants (love_language_v2 …) to what they measure */
  dimension?: string | null
}

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const currentUser = useSupabaseUser()
const { calculateCompatibility } = useCompatibility()

const mode = ref<'manual' | 'auto'>('manual')
// Who's in play: this week's opted-in pool (what the automatic run uses) or every active member
const pool = ref<'week' | 'everyone'>('week')

const loadingData = ref(true)
const users = ref<any[]>([])
const user1 = ref<any>(null)
const user2 = ref<any>(null)
const selectingSlot = ref<1 | 2>(1)
const creating = ref(false)
const matchError = ref('')
const matchSuccess = ref('')
const visibleCount = ref(12)

const autoMatches = ref<any[]>([])
const selectedAutoMatches = ref<any[]>([])
const generatingAuto = ref(false)
const creatingBulk = ref(false)
const bulkSuccess = ref('')
const bulkError = ref('')
const autoConfig = reactive({ minScore: 50 })

const filters = reactive({
  gender: '',
  city: '' as '' | ServedCity,
  genotype: '',
  search: ''
})

const existingMatches = ref<Set<string>>(new Set())
const matchedThisWeek = ref<Set<string>>(new Set())
// Opted in last week but weren't matched: the weekly run gives them priority
const missedLastWeek = ref<Set<string>>(new Set())
const userVibeAnswers = ref<Map<string, VibeAnswer[]>>(new Map())

// Supabase returns at most 1,000 rows per request; page through so nobody's answers get cut off
const fetchAll = async (build: () => any) => {
  const rows: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999)
    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return rows
}

onMounted(async () => {
  const stored = sessionStorage.getItem('matchUser1')
  if (stored) {
    try {
      const picked = JSON.parse(stored)
      sessionStorage.removeItem('matchUser1')
      user1.value = picked
      filters.gender = preferredGender(picked)
      selectingSlot.value = 2
      // Coming from a member who isn't in this week's pool: show everyone
      if (!isOptedIn(picked)) pool.value = 'everyone'
    } catch (e) {}
  }
  try {
    await Promise.all([fetchUsers(), fetchExistingMatches(), fetchVibeAnswers(), fetchMatchmakerSettings()])
  } catch (e) {
    console.error('[Matchmaker] Failed to load data:', e)
  } finally {
    loadingData.value = false
  }
})

const fetchMatchmakerSettings = async () => {
  const { data } = await supabase.from('settings').select('key, value').eq('key', 'auto_match_min_score')
  const item = data?.[0]
  if (item) autoConfig.minScore = Number(item.value?.score ?? 75)
}

const fetchUsers = async () => {
  users.value = await fetchAll(() => supabase.from('profiles').select('*').eq('is_verified', true).order('created_at', { ascending: false }))
}

const fetchExistingMatches = async () => {
  const rows = await fetchAll(() => supabase.from('matches').select('user_1_id, user_2_id, created_at, status').order('created_at'))
  const pairs = new Set<string>()
  const thisWeek = new Set<string>()
  const lastWeek = new Set<string>()
  const weekStart = currentMatchWeekStart().getTime()
  const lastWeekStart = weekStart - 7 * 86400000
  for (const m of rows) {
    pairs.add(`${m.user_1_id}-${m.user_2_id}`)
    pairs.add(`${m.user_2_id}-${m.user_1_id}`)
    if (m.status === 'expired') continue
    const at = new Date(m.created_at).getTime()
    const bucket = at >= weekStart ? thisWeek : at >= lastWeekStart ? lastWeek : null
    bucket?.add(m.user_1_id)
    bucket?.add(m.user_2_id)
  }
  existingMatches.value = pairs
  matchedThisWeek.value = thisWeek

  try {
    const optIns = await fetchAll(() => supabase.from('weekly_opt_ins').select('user_id, opted_out_at')
      .eq('week_start', matchWeekKey(new Date(lastWeekStart))).order('user_id'))
    missedLastWeek.value = new Set(optIns.filter((r: any) => !r.opted_out_at && !lastWeek.has(r.user_id)).map((r: any) => r.user_id))
  } catch {
    missedLastWeek.value = new Set()
  }
}

const fetchVibeAnswers = async () => {
  const rows = await fetchAll(() => supabase.from('vibe_answers').select('user_id, question_key, answer_value, dimension').order('user_id').order('question_key'))
  const answersMap = new Map<string, VibeAnswer[]>()
  for (const row of rows) {
    const existing = answersMap.get(row.user_id) || []
    existing.push({ question_key: row.question_key, answer_value: row.answer_value, dimension: row.dimension })
    answersMap.set(row.user_id, existing)
  }
  userVibeAnswers.value = answersMap
}

// === Helpers ===
const isOptedIn = (u: any) => u?.is_active !== false && isOptedInThisWeek(u?.weekly_opt_in_until)

const preferredGender = (u: any) => {
  if (u?.interested_in && u.interested_in !== 'everyone') return u.interested_in
  if (u?.gender === 'male') return 'female'
  if (u?.gender === 'female') return 'male'
  return ''
}

const getAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const cmToFeet = (cm: number) => {
  if (!cm) return ''
  const realFeet = (cm * 0.3937) / 12
  const feet = Math.floor(realFeet)
  const inches = Math.round((realFeet - feet) * 12)
  return `${feet}'${inches}"`
}

const genderWord = (g?: string) => (g === 'male' ? 'Man' : g === 'female' ? 'Woman' : '')
const shortMeta = (u: any) => [genderWord(u.gender), getAge(u.birth_date), memberCityLabel(u.location)].filter(Boolean).join(' · ')
const longMeta = (u: any) => [genderWord(u.gender), getAge(u.birth_date), u.height_cm ? cmToFeet(u.height_cm) : null, memberCityLabel(u.location)].filter(Boolean).join(' · ')

const scorePill = (score: number) => (score >= 60 ? 'ad-pill--green' : score >= 40 ? 'ad-pill--amber' : 'ad-pill--red')

const getPersona = (id: string) => personas[id] || null

const getPersonaIcon = (id: string) => {
  const icons: Record<string, string> = {
    'power_player': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-briefcase"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    'romantic': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    'adventurer': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-compass"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    'intellectual': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    'social_butterfly': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-5.341"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'homebody': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  }
  return icons[id] || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
}

// === COMPATIBILITY LOGIC ===
const EMPTY_BREAKDOWN = {
  vibeMatch: 0,
  goalsMatch: 0,
  lifestyleMatch: 0,
  maturityMatch: 0,
  interestMatch: 0
}

const EMPTY_ELIGIBILITY = {
  eligible: false,
  hardBlockers: [],
  softRisks: [],
  watchouts: [],
  differences: []
}

const EMPTY_MATCH_RESULT = {
  score: 0,
  reasons: [],
  warnings: [],
  confidence: 0,
  breakdown: EMPTY_BREAKDOWN,
  eligibility: EMPTY_ELIGIBILITY,
  missingData: []
}

const computeFullMatch = (u1: any, u2: any) => {
  if (!u1 || !u2) return EMPTY_MATCH_RESULT
  const ans1 = userVibeAnswers.value.get(u1.id) || []
  const ans2 = userVibeAnswers.value.get(u2.id) || []
  
  const mapProfile = (u: any) => ({
    id: u.id,
    gender: u.gender,
    interested_in: u.interested_in,
    intent: u.intent,
    location: u.location,
    religion: u.religion,
    genotype: u.genotype,
    birth_date: u.birth_date,
    dating_persona: u.dating_persona,
    occupation: u.occupation,
    badges: u.badges,
    dealbreakers: u.dealbreakers,
    min_age: u.min_age,
    max_age: u.max_age,
    preferences_extracted: u.preferences_extracted
  })

  // Format to correct answer type for calculateCompatibility
  const fmtAns1 = ans1.map(a => ({ question_key: a.question_key, answer_value: a.answer_value, answer: a.answer_value, dimension: a.dimension }))
  const fmtAns2 = ans2.map(a => ({ question_key: a.question_key, answer_value: a.answer_value, answer: a.answer_value, dimension: a.dimension }))

  const result = calculateCompatibility(mapProfile(u1) as any, fmtAns1, mapProfile(u2) as any, fmtAns2)
  return {
    score: result.score,
    reasons: result.strengths,
    warnings: result.warnings,
    breakdown: result.breakdown || EMPTY_BREAKDOWN,
    confidence: result.confidence,
    eligibility: result.eligibility,
    missingData: result.missingData
  }
}

const calculateMatchScore = (u1: any, u2: any) => {
  return computeFullMatch(u1, u2)
}

// For manual mode (one-sided calculation)
const calculateMatchDetails = (candidate: any) => {
  if (!user1.value) return EMPTY_MATCH_RESULT
  return calculateMatchScore(user1.value, candidate)
}

// === POOL ===
const activeUsers = computed(() => users.value.filter(u => u.is_active !== false))
const activeCount = computed(() => activeUsers.value.length)
const optedInCount = computed(() => activeUsers.value.filter(isOptedIn).length)
const poolUsers = computed(() => (pool.value === 'week' ? activeUsers.value.filter(isOptedIn) : activeUsers.value))

// === AUTOMATIC PREVIEW ===
// Same shape as the weekly run: best pairs first, each person used at most once, nobody already matched this week
const autoPool = computed(() => poolUsers.value.filter(u => !matchedThisWeek.value.has(u.id)))
const autoPoolSize = computed(() => autoPool.value.length)

const generateAutoMatches = async () => {
  generatingAuto.value = true
  autoMatches.value = []
  selectedAutoMatches.value = []
  bulkSuccess.value = ''
  bulkError.value = ''
  await nextTick()
  await new Promise(r => setTimeout(r, 30)) // let the spinner paint before the heavy loop

  const people = autoPool.value
  const candidates: CandidatePair[] = []
  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const u1 = people[i]
      const u2 = people[j]
      if (existingMatches.value.has(`${u1.id}-${u2.id}`)) continue
      const result = calculateMatchScore(u1, u2)
      if (result.score < autoConfig.minScore || !result.eligibility?.eligible) continue
      const boost = (missedLastWeek.value.has(u1.id) ? MISSED_LAST_WEEK_BOOST : 0) + (missedLastWeek.value.has(u2.id) ? MISSED_LAST_WEEK_BOOST : 0)
      candidates.push({
        a: u1.id,
        b: u2.id,
        weight: result.score + boost,
        data: { user1: u1, user2: u2, score: result.score, reasons: result.reasons, warnings: result.warnings, confidence: result.confidence, breakdown: result.breakdown, missedLastWeek: boost > 0 }
      })
    }
  }

  // Same pairing as the weekly run: the most people matched, then the highest total
  const pairs = choosePairs(candidates).map(c => c.data).sort((x: any, y: any) => y.score - x.score)
  autoMatches.value = pairs
  generatingAuto.value = false
}

watch(pool, () => {
  if (mode.value === 'auto') generateAutoMatches()
})

const isAutoMatchSelected = (match: any) =>
  selectedAutoMatches.value.some(m => m.user1.id === match.user1.id && m.user2.id === match.user2.id)

const toggleAutoMatchSelection = (match: any) => {
  const idx = selectedAutoMatches.value.findIndex(m => m.user1.id === match.user1.id && m.user2.id === match.user2.id)
  if (idx >= 0) selectedAutoMatches.value.splice(idx, 1)
  else selectedAutoMatches.value.push(match)
}

const selectAllHigh = () => {
  selectedAutoMatches.value = autoMatches.value.filter(m => m.score >= 80 && !m.warnings.length)
}

const notifyPair = (user1Id: string, user2Id: string) =>
  $fetch('/api/admin/notify-match', { method: 'POST', body: { user1Id, user2Id } })
    .catch(err => console.error('Failed to send notification:', err))

const createBulkMatches = async () => {
  if (!selectedAutoMatches.value.length) return
  creatingBulk.value = true
  bulkError.value = ''
  bulkSuccess.value = ''
  try {
    const chosen = [...selectedAutoMatches.value]
    const { error } = await supabase.from('matches').insert(chosen.map(m => ({
      user_1_id: m.user1.id,
      user_2_id: m.user2.id,
      ...unlockedMatchFields(),
      created_by: currentUser.value?.id,
      match_score: m.score,
      match_reasons: m.reasons,
      match_warnings: m.warnings,
      match_breakdown: m.breakdown,
      match_confidence: m.confidence,
      created_by_label: 'admin_preview'
    })))
    if (error) throw error

    Promise.all(chosen.map(m => notifyPair(m.user1.id, m.user2.id)))
    bulkSuccess.value = `Introduced ${chosen.length} pair${chosen.length === 1 ? '' : 's'}. They're being notified.`

    const created = new Set(chosen.map(m => `${m.user1.id}-${m.user2.id}`))
    autoMatches.value = autoMatches.value.filter(m => !created.has(`${m.user1.id}-${m.user2.id}`))
    selectedAutoMatches.value = []
    await fetchExistingMatches()
  } catch (err: any) {
    bulkError.value = err.code === '23505' ? 'One or more of these pairs were already matched.' : `Couldn't introduce them: ${err.message}`
  } finally {
    creatingBulk.value = false
  }
}

// === BY HAND ===
const slotUser = (slot: 1 | 2) => (slot === 1 ? user1.value : user2.value)

const clearSlot = (slot: 1 | 2) => {
  if (slot === 1) {
    user1.value = null
    user2.value = null
    selectingSlot.value = 1
  } else {
    user2.value = null
    selectingSlot.value = 2
  }
}

const filteredCandidates = computed(() => {
  const ranking = !!user1.value && selectingSlot.value === 2
  let list = poolUsers.value.filter(u => {
    if (user1.value && u.id === user1.value.id) return false
    if (user2.value && u.id === user2.value.id) return false
    if (ranking && existingMatches.value.has(`${user1.value.id}-${u.id}`)) return false
    if (filters.gender && u.gender !== filters.gender) return false
    if (filters.city && memberCity(u.location) !== filters.city) return false
    if (filters.genotype && u.genotype !== filters.genotype) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!u.display_name?.toLowerCase().includes(q) && !u.phone?.includes(q)) return false
    }
    return true
  })
  if (ranking) {
    list = list
      .map(u => ({ ...u, matchDetails: calculateMatchDetails(u) }))
      .sort((a, b) => b.matchDetails.score - a.matchDetails.score)
  }
  return list
})

const paginationCandidates = computed(() => filteredCandidates.value.slice(0, visibleCount.value))

const matchData = computed(() => {
  if (!user1.value || !user2.value) return EMPTY_MATCH_RESULT
  return calculateMatchScore(user1.value, user2.value)
})

const canCreateMatch = computed(() => !!user1.value && !!user2.value && !creating.value)

const selectCandidate = (user: any) => {
  if (isDisabled(user)) return
  if (selectingSlot.value === 1) {
    user1.value = user
    user2.value = null
    selectingSlot.value = 2
    filters.gender = preferredGender(user)
    visibleCount.value = 12
  } else {
    user2.value = user
  }
}

const isSelected = (user: any) => user1.value?.id === user.id || user2.value?.id === user.id

const isDisabled = (user: any) =>
  !!user1.value && selectingSlot.value === 2 && existingMatches.value.has(`${user1.value.id}-${user.id}`)

const createMatch = async () => {
  if (!user1.value || !user2.value) return
  creating.value = true
  matchError.value = ''
  matchSuccess.value = ''
  try {
    const { error } = await supabase.from('matches').insert({
      user_1_id: user1.value.id,
      user_2_id: user2.value.id,
      ...unlockedMatchFields(),
      created_by: currentUser.value?.id,
      match_score: matchData.value.score,
      match_reasons: matchData.value.reasons,
      match_warnings: matchData.value.warnings,
      match_breakdown: matchData.value.breakdown,
      match_confidence: matchData.value.confidence,
      created_by_label: 'admin'
    })
    if (error) throw error

    notifyPair(user1.value.id, user2.value.id)
    matchSuccess.value = `${user1.value.display_name} and ${user2.value.display_name} are introduced. They're being notified.`

    existingMatches.value.add(`${user1.value.id}-${user2.value.id}`)
    existingMatches.value.add(`${user2.value.id}-${user1.value.id}`)
    matchedThisWeek.value.add(user1.value.id)
    matchedThisWeek.value.add(user2.value.id)

    setTimeout(() => {
      user2.value = null
      matchSuccess.value = ''
    }, 2500)
  } catch (err: any) {
    matchError.value = err.code === '23505' ? 'These two have already been matched.' : `Couldn't introduce them: ${err.message}`
  } finally {
    creating.value = false
  }
}
</script>
