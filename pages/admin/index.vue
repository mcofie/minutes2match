<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Good {{ timeOfDay.toLowerCase() }}</h1>
        <p class="ad-sub">Here's how Minutes 2 Match is doing today.</p>
      </div>
      <NuxtLink to="/admin/matches/matchmaker" class="btn-primary">Open matchmaker</NuxtLink>
    </header>

    <div class="ad-stats">
      <NuxtLink to="/admin/users" class="ad-stat hover:!bg-[#fcfbf9]">
        <div class="ad-stat__label">Members</div>
        <div class="ad-stat__value">{{ stats.totalUsers.toLocaleString() }}</div>
        <div class="ad-stat__hint">{{ stats.newUsersThisWeek > 0 ? `+${stats.newUsersThisWeek} this week` : 'None new this week' }}</div>
      </NuxtLink>
      <NuxtLink to="/admin/matches" class="ad-stat hover:!bg-[#fcfbf9]">
        <div class="ad-stat__label">Opted in this week</div>
        <div class="ad-stat__value">{{ weekly ? weekly.totals.optedIn : '…' }}</div>
        <div class="ad-stat__hint">{{ weekly ? `${share(weekly.totals.optedIn)}% of members` : '' }}</div>
      </NuxtLink>
      <NuxtLink to="/admin/matches" class="ad-stat hover:!bg-[#fcfbf9]" :class="{ 'ad-stat--alert': (weekly?.totals.waiting || 0) > 0 }">
        <div class="ad-stat__label">Matched this week</div>
        <div class="ad-stat__value">{{ weekly ? weekly.totals.matched : '…' }}</div>
        <div class="ad-stat__hint">{{ weekly ? `${weekly.totals.waiting} still waiting · ${stats.totalMatches} all time` : '' }}</div>
      </NuxtLink>
      <NuxtLink to="/admin/payments" class="ad-stat hover:!bg-[#fcfbf9]">
        <div class="ad-stat__label">Revenue</div>
        <div class="ad-stat__value">{{ formatCurrency(stats.totalRevenue) }}</div>
        <div class="ad-stat__hint">{{ stats.totalPayments }} payments</div>
      </NuxtLink>
    </div>

    <!-- Only shown when something is actually wrong -->
    <div v-if="healthIssues.length" class="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[1.25rem] bg-[#fdecec] px-5 py-3 text-sm text-[#8f1c22]">
      <span class="flex items-center gap-2 font-semibold"><span class="h-1.5 w-1.5 rounded-full bg-[#ed1c24]"></span>Needs attention</span>
      <NuxtLink v-for="issue in healthIssues" :key="issue.label" :to="issue.to" class="hover:underline">{{ issue.count }} {{ issue.label }}</NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Cities -->
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article v-for="c in SERVED_CITIES" :key="c.key" class="ad-panel">
            <div class="mb-3 flex items-center gap-3">
              <CountryFlag :code="c.flag" shape="circle" class="h-7 w-7" />
              <div>
                <h2 class="font-display text-xl leading-none">{{ c.label }}</h2>
                <p class="mt-1 text-xs ad-faint">{{ c.country }}</p>
              </div>
              <span class="ml-auto text-right">
                <span class="ad-num block text-2xl font-medium leading-none">{{ weekly ? weekly.pool[c.key].members : '…' }}</span>
                <span class="text-xs ad-faint">members</span>
              </span>
            </div>
            <template v-if="weekly">
              <div class="ad-kv"><span>Opted in this week</span><span class="ad-num font-semibold">{{ weekly.pool[c.key].optedIn }}</span></div>
              <div class="ad-kv"><span>Matched this week</span><span class="ad-num">{{ weekly.pool[c.key].matched }}</span></div>
              <div class="ad-kv"><span>Still waiting</span><span class="ad-num" :class="weekly.pool[c.key].waiting ? 'font-semibold text-[#b4232a]' : ''">{{ weekly.pool[c.key].waiting }}</span></div>
              <div class="ad-kv">
                <span>Opt-ins vs last week</span>
                <span class="ad-num">
                  {{ weekly.weeks[c.key][0]?.optedIn ?? 0 }}
                  <span v-if="weekly.weeks[c.key][1]" class="text-xs ad-faint">from {{ weekly.weeks[c.key][1].optedIn }}</span>
                </span>
              </div>
            </template>
          </article>
          <p v-if="weekly && weekly.pool.other.members" class="text-xs ad-faint sm:col-span-2">
            {{ weekly.pool.other.members }} members live elsewhere or haven't set a city.
          </p>
        </section>

        <!-- Funnel -->
        <section class="ad-panel">
          <div class="mb-5 flex items-baseline justify-between gap-4">
            <h2 class="ad-label !mb-0">From sign-up to match</h2>
            <span class="text-xs ad-faint">share of all members</span>
          </div>
          <ul class="space-y-3.5">
            <li v-for="step in funnelSteps" :key="step.label" class="grid grid-cols-[10rem_1fr_auto] items-center gap-4 text-sm" :title="`${step.label}: ${step.value} (${step.rate}%)`">
              <span class="ad-muted">{{ step.label }}</span>
              <span class="h-2 overflow-hidden rounded-full bg-[#f1efec]">
                <span class="block h-full rounded-full bg-[#393737] transition-[width] duration-700" :style="{ width: `${step.rate}%` }"></span>
              </span>
              <span class="ad-num w-24 text-right"><span class="font-semibold">{{ step.value }}</span> <span class="text-xs ad-faint">{{ step.rate }}%</span></span>
            </li>
          </ul>
        </section>

        <!-- Activity -->
        <section class="ad-panel !p-0">
          <h2 class="ad-label !mb-0 px-6 pb-3 pt-5">Recent activity</h2>
          <div v-if="loading" class="ad-empty !py-10"><span class="ad-spinner"></span></div>
          <p v-else-if="recentActivity.length === 0" class="px-6 pb-6 text-sm ad-faint">Nothing yet.</p>
          <ul v-else>
            <li v-for="activity in recentActivity" :key="activity.id" class="flex items-center gap-3 border-t border-[#f3f1ee] px-6 py-3">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1efec] text-[#6c6862]" :title="activity.type">
                <svg v-if="activity.type === 'signup'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                <svg v-else-if="activity.type === 'payment'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <svg v-else-if="activity.type === 'match'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <p class="min-w-0 flex-1 truncate text-sm">{{ activity.message }}</p>
              <span class="shrink-0 text-xs ad-faint">{{ formatTime(activity.created_at) }}</span>
            </li>
          </ul>
        </section>

        <!-- Audience -->
        <section class="ad-panel">
          <h2 class="ad-label">Who's on the app</h2>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <p class="mb-3 text-xs font-semibold ad-muted">Gender</p>
              <ul class="space-y-2.5">
                <li v-for="row in genderRows" :key="row.label" class="text-sm" :title="`${row.label}: ${row.count}`">
                  <div class="mb-1 flex justify-between"><span class="ad-muted">{{ row.label }}</span><span class="ad-num font-medium">{{ row.count }}</span></div>
                  <span class="block h-1.5 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: share(row.count) + '%' }"></span></span>
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-3 text-xs font-semibold ad-muted">Age</p>
              <ul class="space-y-2.5">
                <li v-for="(count, range) in ageDistribution" :key="range" class="text-sm" :title="`${range}: ${count}`">
                  <div class="mb-1 flex justify-between"><span class="ad-muted">{{ range }}</span><span class="ad-num font-medium">{{ count }}</span></div>
                  <span class="block h-1.5 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: share(count) + '%' }"></span></span>
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-3 text-xs font-semibold ad-muted">Looking for</p>
              <ul class="space-y-2.5">
                <li v-for="(count, intent) in intentDistribution" :key="intent" class="text-sm" :title="`${intent}: ${count}`">
                  <div class="mb-1 flex justify-between gap-2"><span class="truncate capitalize ad-muted">{{ intent }}</span><span class="ad-num font-medium">{{ count }}</span></div>
                  <span class="block h-1.5 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: share(count) + '%' }"></span></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Match quality -->
        <section class="ad-panel">
          <div class="mb-1 flex items-baseline justify-between gap-4">
            <h2 class="ad-label !mb-0">Match quality</h2>
            <NuxtLink to="/admin/matches/scoring-logic" class="text-xs font-medium ad-muted hover:text-[#393737]">How scoring works →</NuxtLink>
          </div>
          <div class="ad-kv"><span>Average confidence</span><span class="ad-num">{{ matchQuality.averageConfidence }}%</span></div>
          <div class="ad-kv"><span>Best-performing score band</span><span>{{ matchQuality.bestBand }} <span class="text-xs ad-faint">· {{ matchQuality.bestBandPositiveRate }}% positive</span></span></div>
          <div class="ad-kv"><span>Most common warning</span><span>{{ matchQuality.topWarning }}</span></div>
        </section>
      </div>

      <aside class="space-y-6">
        <!-- Waiting for a match -->
        <section class="ad-panel">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="ad-label !mb-0">Waiting this week</h2>
            <span class="ad-tab__count" :class="{ 'ad-tab__count--alert': waitingUsers.length > 0 }">{{ waitingUsers.length }}</span>
          </div>
          <p v-if="waitingUsers.length === 0" class="text-sm ad-faint">Everyone who opted in has a match.</p>
          <ul v-else class="space-y-3">
            <li v-for="user in waitingUsers.slice(0, 5)" :key="user.id" class="flex items-center gap-3">
              <span class="ad-avatar">{{ user.display_name?.charAt(0) || '?' }}</span>
              <div class="min-w-0 flex-1">
                <span class="ad-person__name text-sm">{{ user.display_name }}</span>
                <span class="ad-person__meta">{{ memberCityLabel(user.location) }}</span>
              </div>
              <NuxtLink :to="`/admin/matches/matchmaker?user=${user.id}`" class="btn-secondary btn-sm">Match</NuxtLink>
            </li>
          </ul>
          <NuxtLink v-if="waitingUsers.length > 5" to="/admin/matches/matchmaker" class="mt-4 block text-center text-sm font-medium ad-muted hover:text-[#393737]">See all {{ waitingUsers.length }}</NuxtLink>
        </section>

        <!-- Profile nudges -->
        <section v-for="group in nudgeGroups" :key="group.type" class="ad-panel">
          <div class="mb-1 flex items-center justify-between">
            <h2 class="ad-label !mb-0">{{ group.title }}</h2>
            <span class="ad-tab__count">{{ group.items.length }}</span>
          </div>
          <p class="mb-3 text-xs ad-faint">{{ group.description }}</p>
          <p v-if="group.loading" class="text-sm ad-faint">Checking…</p>
          <p v-else-if="group.items.length === 0" class="text-sm ad-faint">All done.</p>
          <template v-else>
            <ul class="space-y-3">
              <li v-for="profile in group.items.slice(0, 3)" :key="profile.id" class="flex items-center gap-3">
                <span class="ad-avatar">{{ profile.displayName?.charAt(0) || '?' }}</span>
                <div class="min-w-0 flex-1">
                  <span class="ad-person__name text-sm">{{ profile.displayName || 'Unknown' }}</span>
                  <span class="ad-person__meta truncate">Missing {{ profile.missingFields.slice(0, 2).join(', ') }}{{ profile.missingFields.length > 2 ? '…' : '' }}</span>
                </div>
                <span v-if="group.type === 'incomplete'" class="ad-num text-xs ad-faint">{{ profile.completenessPercent }}%</span>
              </li>
            </ul>
            <button class="btn-secondary mt-4 w-full" :disabled="group.sending" @click="openSmsModal(group.type)">
              {{ group.sending ? 'Sending…' : `Text all ${group.items.length}` }}
            </button>
          </template>
        </section>

        <!-- System health -->
        <section class="ad-panel">
          <h2 class="ad-label">System health</h2>
          <div class="ad-kv"><span>Failed SMS, 24h</span><span class="ad-num" :class="stats.smsFailed24h ? 'font-semibold text-[#b4232a]' : ''">{{ stats.smsFailed24h }}</span></div>
          <div class="ad-kv"><span>Pending SMS, 24h</span><span class="ad-num" :class="stats.smsPending24h ? 'font-semibold text-[#9a5b0f]' : ''">{{ stats.smsPending24h }}</span></div>
          <div class="ad-kv"><span>Open payment alerts</span><span class="ad-num" :class="stats.unresolvedPaymentAlerts ? 'font-semibold text-[#b4232a]' : ''">{{ stats.unresolvedPaymentAlerts }}</span></div>
          <div class="ad-kv"><span>Webhook errors, 7d</span><span class="ad-num" :class="stats.webhookErrors7d ? 'font-semibold text-[#b4232a]' : ''">{{ stats.webhookErrors7d }}</span></div>
          <div class="ad-kv"><span>Failed payments, 7d</span><span class="ad-num">{{ stats.paymentFailedAlerts7d }}</span></div>
        </section>
      </aside>
    </div>

    <!-- Confirm profile reminder SMS -->
    <Teleport to="body">
      <div v-if="showSmsModal" class="m2m-app m2m-admin modal-overlay" @click.self="showSmsModal = false">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="sms-title">
          <div class="modal__header">
            <div>
              <h3 id="sms-title" class="modal__title">Send reminders?</h3>
              <p class="modal__sub">{{ smsModalType === 'incomplete' ? incompleteProfiles.length : missingDetailsProfiles.length }} members will get this SMS.</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="showSmsModal = false">×</button>
          </div>
          <div class="modal__content">
            <p class="max-w-sm whitespace-pre-wrap rounded-[1.25rem] rounded-bl-md bg-[#f1efec] px-4 py-3 text-sm leading-relaxed">{{ smsModalMessage }}</p>
          </div>
          <div class="modal__footer">
            <button class="btn-secondary" @click="showSmsModal = false">Cancel</button>
            <button class="btn-primary" :disabled="sendingReminders || sendingMissingDetailsReminders" @click="confirmSendSms">
              {{ sendingReminders || sendingMissingDetailsReminders ? 'Sending…' : 'Send now' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'

useHead({ title: 'Dashboard' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()

// State
const loading = ref(true)
const stats = reactive({
  totalUsers: 0,
  verifiedUsers: 0,
  completeProfiles: 0,
  matchedUsers: 0,
  unlockedUsers: 0,
  newUsersThisWeek: 0,
  totalMatches: 0,
  unlockedMatches: 0,
  partialPaymentMatches: 0,
  pendingMatches: 0,
  totalRevenue: 0,
  eventRevenue: 0,
  matchRevenue: 0,
  subscriptionRevenue: 0,
  sparkDeckRevenue: 0,
  shotRevenue: 0,
  walletTopupRevenue: 0,
  totalPayments: 0,
  avgUnlockPrice: 0,
  smsFailed24h: 0,
  smsPending24h: 0,
  unresolvedPaymentAlerts: 0,
  webhookErrors7d: 0,
  paymentFailedAlerts7d: 0,
  maleUsers: 0,
  femaleUsers: 0,
  unspecifiedGender: 0,
  ageData: [] as string[],
  intentData: [] as string[],
  personaData: [] as string[]
})
const recentActivity = ref<any[]>([])
const waitingUsers = ref<any[]>([])
const matchQuality = reactive({
  averageConfidence: 0,
  bestBand: '—',
  bestBandPositiveRate: 0,
  topWarning: 'No warnings yet'
})

// Incomplete profiles state
interface IncompleteProfile {
  id: string
  phone: string
  displayName: string
  missingFields: string[]
  completenessPercent: number
}
const incompleteProfiles = ref<IncompleteProfile[]>([])
const loadingIncomplete = ref(false)
const sendingReminders = ref(false)

// Missing details profiles state
const missingDetailsProfiles = ref<IncompleteProfile[]>([])
const loadingMissingDetails = ref(false)
const sendingMissingDetailsReminders = ref(false)

// Computed
const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
})

const verificationRate = computed(() => {
  if (!stats.totalUsers) return 0
  return Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
})

const eventRevenuePercent = computed(() => {
  if (!stats.totalRevenue) return 0
  return Math.round((stats.eventRevenue / stats.totalRevenue) * 100)
})

const matchRevenuePercent = computed(() => {
  if (!stats.totalRevenue) return 0
  return Math.round((stats.matchRevenue / stats.totalRevenue) * 100)
})

const genderSplit = computed(() => {
  const total = stats.maleUsers + stats.femaleUsers
  if (!total) return { male: 50, female: 50 }
  return {
    male: Math.round((stats.maleUsers / total) * 100),
    female: Math.round((stats.femaleUsers / total) * 100)
  }
})

const ageDistribution = computed(() => {
  const ranges = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45+': 0
  }
  
  stats.ageData.forEach(dateStr => {
    if (!dateStr) return
    const birthDate = new Date(dateStr)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    
    if (age < 25) ranges['18-24']++
    else if (age < 35) ranges['25-34']++
    else if (age < 45) ranges['35-44']++
    else ranges['45+']++
  })
  
  return ranges
})

const intentDistribution = computed(() => {
  const counts: Record<string, number> = {
    'marriage': 0,
    'serious': 0,
    'casual': 0,
    'friendship': 0,
    'other': 0
  }
  stats.intentData.forEach(intent => {
    if (intent && counts[intent] !== undefined) counts[intent]++
    else counts['other']++
  })
  return counts
})

const matchSuccessRate = computed(() => {
  if (!stats.totalMatches) return 0
  return Math.round((stats.unlockedMatches / stats.totalMatches) * 100)
})

const pctOfTotalUsers = (value: number) => {
  if (!stats.totalUsers) return 0
  return Math.round((value / stats.totalUsers) * 100)
}

// Weekly matching snapshot and city split (see /api/admin/weekly-stats)
const weekly = ref<any>(null)
const fetchWeekly = async () => {
  try {
    weekly.value = await $fetch('/api/admin/weekly-stats', { query: { weeks: 2 } })
  } catch (e) {
    console.error('[Admin] Weekly stats failed:', e)
  }
}

// Share of all members, for the audience meters
const share = (count: number) => (stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0)

const genderRows = computed(() => [
  { label: 'Men', count: stats.maleUsers },
  { label: 'Women', count: stats.femaleUsers },
  { label: 'Not given', count: stats.unspecifiedGender }
].filter(row => row.label !== 'Not given' || row.count > 0))

const healthIssues = computed(() => [
  { label: 'failed SMS in 24h', count: stats.smsFailed24h, to: '/admin/messaging/history' },
  { label: 'open payment alerts', count: stats.unresolvedPaymentAlerts, to: '/admin/payments' },
  { label: 'webhook errors this week', count: stats.webhookErrors7d, to: '/admin/payments' }
].filter(issue => issue.count > 0))

const nudgeGroups = computed(() => [
  {
    type: 'incomplete' as const,
    title: 'Incomplete profiles',
    description: 'Missing two or more key fields.',
    items: incompleteProfiles.value,
    loading: loadingIncomplete.value,
    sending: sendingReminders.value
  },
  {
    type: 'missing' as const,
    title: 'Missing details',
    description: 'Missing secondary details.',
    items: missingDetailsProfiles.value,
    loading: loadingMissingDetails.value,
    sending: sendingMissingDetailsReminders.value
  }
])

const funnelSteps = computed(() => [
  { label: 'Verified', value: stats.verifiedUsers, rate: pctOfTotalUsers(stats.verifiedUsers) },
  { label: 'Profile complete', value: stats.completeProfiles, rate: pctOfTotalUsers(stats.completeProfiles) },
  { label: 'Opted in this week', value: weekly.value?.totals.optedIn ?? 0, rate: pctOfTotalUsers(weekly.value?.totals.optedIn ?? 0) },
  { label: 'Ever matched', value: stats.matchedUsers, rate: pctOfTotalUsers(stats.matchedUsers) }
])

const revenueMix = computed(() => {
  const total = stats.totalRevenue || 1
  return [
    { label: 'Match Unlocks', amount: stats.matchRevenue, percent: Math.round((stats.matchRevenue / total) * 100), barClass: 'bg-rose-500' },
    { label: 'Subscriptions', amount: stats.subscriptionRevenue, percent: Math.round((stats.subscriptionRevenue / total) * 100), barClass: 'bg-emerald-500' },
    { label: 'Events', amount: stats.eventRevenue, percent: Math.round((stats.eventRevenue / total) * 100), barClass: 'bg-blue-500' },
    { label: 'Spark Deck', amount: stats.sparkDeckRevenue, percent: Math.round((stats.sparkDeckRevenue / total) * 100), barClass: 'bg-amber-500' },
    { label: 'Shoot Your Shot', amount: stats.shotRevenue, percent: Math.round((stats.shotRevenue / total) * 100), barClass: 'bg-purple-500' },
    { label: 'Wallet Topups', amount: stats.walletTopupRevenue, percent: Math.round((stats.walletTopupRevenue / total) * 100), barClass: 'bg-stone-500' }
  ].filter(item => item.amount > 0)
})

const personaDistribution = computed(() => {
  const counts: Record<string, number> = {}
  stats.personaData.forEach(p => {
    if (!p) return
    counts[p] = (counts[p] || 0) + 1
  })
  return counts
})

const getPersonaEmoji = (id: string) => {
  return (personas as any)[id]?.emoji || '✨'
}

const getPersonaName = (id: string) => {
  return (personas as any)[id]?.name || 'Mystery'
}

// Fetch stats
const fetchStats = async () => {
  // Total users
  const { count: totalUsers } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  stats.totalUsers = totalUsers || 0

  // Profile Specific Stats
  const { data: profileStats } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('display_name, gender, birth_date, is_verified, intent, dating_persona, location, interested_in')
  
  if (profileStats) {
    stats.maleUsers = profileStats.filter((p: any) => p.gender === 'male').length
    stats.femaleUsers = profileStats.filter((p: any) => p.gender === 'female').length
    stats.unspecifiedGender = profileStats.filter((p: any) => !p.gender).length
    stats.verifiedUsers = profileStats.filter((p: any) => p.is_verified).length
    stats.completeProfiles = profileStats.filter((p: any) =>
      p.display_name && p.gender && p.birth_date && p.intent && p.location && p.interested_in
    ).length
    stats.ageData = profileStats.map((p: any) => p.birth_date).filter(Boolean) as string[]
    stats.intentData = profileStats.map((p: any) => p.intent).filter(Boolean) as string[]
    stats.personaData = profileStats.map((p: any) => p.dating_persona).filter(Boolean) as string[]
  }

  // New users this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newUsers } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo)
  
  stats.newUsersThisWeek = newUsers || 0

  // Match stats (expired matches are from the old pay-to-unlock flow and never became introductions)
  const { data: rawMatches } = await supabase.schema('m2m').from('matches').select('status, unlock_price, user_1_id, user_2_id').neq('status', 'expired')
  
  const matches = rawMatches as any[] || []
  if (matches.length) {
    stats.totalMatches = matches.length
    stats.unlockedMatches = matches.filter(m => m.status === 'unlocked').length
    stats.partialPaymentMatches = matches.filter(m => m.status === 'partial_payment').length
    stats.pendingMatches = matches.filter(m => m.status === 'pending_payment').length
    
    const totalPrice = matches.reduce((sum, m) => sum + parseFloat(m.unlock_price || 0), 0)
    stats.avgUnlockPrice = matches.length ? totalPrice / matches.length : 0

    const matchedUsers = new Set<string>()
    const unlockedUsers = new Set<string>()
    matches.forEach((m: any) => {
      if (m.user_1_id) matchedUsers.add(m.user_1_id)
      if (m.user_2_id) matchedUsers.add(m.user_2_id)
      if (m.status === 'unlocked') {
        if (m.user_1_id) unlockedUsers.add(m.user_1_id)
        if (m.user_2_id) unlockedUsers.add(m.user_2_id)
      }
    })
    stats.matchedUsers = matchedUsers.size
    stats.unlockedUsers = unlockedUsers.size
  }

  // Revenue
  const { data: rawPayments } = await supabase
    .schema('m2m')
    .from('payments')
    .select('amount, purpose, created_at')
    .eq('status', 'success')
  
  const payments = rawPayments as any[] || []
  if (payments.length) {
    stats.totalPayments = payments.length
    stats.totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.eventRevenue = payments.filter(p => p.purpose === 'event_ticket').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.matchRevenue = payments.filter(p => p.purpose === 'match_unlock').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.subscriptionRevenue = payments.filter(p => ['premium_sub', 'subscription'].includes(p.purpose)).reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.sparkDeckRevenue = payments.filter(p => p.purpose === 'spark_deck').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.shotRevenue = payments.filter(p => p.purpose === 'shoot_your_shot').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.walletTopupRevenue = payments.filter(p => p.purpose === 'wallet_topup').reduce((sum, p) => sum + parseFloat(p.amount), 0)
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: failedSms24h },
    { count: pendingSms24h },
    { count: unresolvedAlerts },
    { count: webhookAlerts7d },
    { count: paymentFailedAlerts7d }
  ] = await Promise.all([
    supabase.schema('m2m').from('sms_history').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', dayAgo),
    supabase.schema('m2m').from('sms_history').select('*', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', dayAgo),
    supabase.schema('m2m').from('payment_alerts').select('*', { count: 'exact', head: true }).eq('resolved', false),
    supabase.schema('m2m').from('payment_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'webhook_error').gte('created_at', weekAgo),
    supabase.schema('m2m').from('payment_alerts').select('*', { count: 'exact', head: true }).eq('alert_type', 'payment_failed').gte('created_at', weekAgo)
  ])

  stats.smsFailed24h = failedSms24h || 0
  stats.smsPending24h = pendingSms24h || 0
  stats.unresolvedPaymentAlerts = unresolvedAlerts || 0
  stats.webhookErrors7d = webhookAlerts7d || 0
  stats.paymentFailedAlerts7d = paymentFailedAlerts7d || 0
}

const fetchMatchQuality = async () => {
  try {
    const data = await ($fetch as any)('/api/admin/matches/evaluation') as any
    matchQuality.averageConfidence = data?.overview?.averageConfidence || 0
    const bestBucket = [...(data?.buckets || [])]
      .filter((bucket: any) => bucket.total >= 3)
      .sort((a: any, b: any) => {
        if (b.positiveRate !== a.positiveRate) return b.positiveRate - a.positiveRate
        return b.unlockRate - a.unlockRate
      })[0]
    matchQuality.bestBand = bestBucket?.label || '—'
    matchQuality.bestBandPositiveRate = bestBucket?.positiveRate || 0
    matchQuality.topWarning = data?.topWarnings?.[0]?.warning || 'No warnings yet'
  } catch (error) {
    console.error('Failed to fetch match quality:', error)
  }
}

// Fetch recent activity
const fetchRecentActivity = async () => {
  loading.value = true
  
  const { data: profiles } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: payments } = await supabase
    .schema('m2m')
    .from('payments')
    .select('id, amount, purpose, created_at')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: matchesCreated } = await supabase
    .schema('m2m')
    .from('matches')
    .select('id, created_at')
    .neq('status', 'expired')
    .order('created_at', { ascending: false })
    .limit(5)

  const activities = [
    ...(profiles as any[] || []).map(p => ({
      id: `profile-${p.id}`,
      type: 'signup',
      message: `${p.display_name || 'New user'} signed up`,
      created_at: p.created_at
    })),
    ...(payments as any[] || []).map(p => ({
      id: `payment-${p.id}`,
      type: 'payment',
      message: `Payment of GH₵${p.amount} for ${p.purpose.replace('_', ' ')}`,
      created_at: p.created_at
    })),
    ...(matchesCreated as any[] || []).map(m => ({
      id: `match-${m.id}`,
      type: 'match',
      message: 'New match created',
      created_at: m.created_at
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
   .slice(0, 7)

  recentActivity.value = activities
  loading.value = false
}

// Fetch users waiting for matches
// Opted in for this week's matching but not matched yet this week
const fetchWaitingUsers = async () => {
  const nowIso = new Date().toISOString()
  const weekStartIso = currentMatchWeekStart().toISOString()
  const [{ data: optedIn }, { data: thisWeeksMatches }] = await Promise.all([
    supabase
      .schema('m2m')
      .from('profiles')
      .select('id, display_name, location, weekly_opt_in_until')
      .gte('weekly_opt_in_until', nowIso)
      .not('is_active', 'is', false)
      .order('display_name'),
    supabase.schema('m2m').from('matches').select('user_1_id, user_2_id').gte('created_at', weekStartIso).neq('status', 'expired')
  ])

  const matchedThisWeek = new Set<string>()
  for (const m of (thisWeeksMatches as any[]) || []) {
    if (m.user_1_id) matchedThisWeek.add(m.user_1_id)
    if (m.user_2_id) matchedThisWeek.add(m.user_2_id)
  }
  waitingUsers.value = ((optedIn as any[]) || []).filter(u => !matchedThisWeek.has(u.id))
}

// Helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const getWaitingDays = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Fetch incomplete profiles (dry run)
const fetchIncompleteProfiles = async () => {
  loadingIncomplete.value = true
  try {
    const response = await ($fetch as any)('/api/admin/notify-incomplete-profiles', {
      method: 'POST',
      body: { dryRun: true }
    }) as { profiles: IncompleteProfile[] }
    
    incompleteProfiles.value = response.profiles || []
  } catch (error) {
    console.error('Error fetching incomplete profiles:', error)
  } finally {
    loadingIncomplete.value = false
  }
}

// Modal state
const showSmsModal = ref(false)
const smsModalType = ref<'incomplete' | 'missing'>('incomplete')
const smsModalMessage = ref('')

const openSmsModal = (type: 'incomplete' | 'missing') => {
  smsModalType.value = type
  if (type === 'incomplete') {
    smsModalMessage.value = `Hi! Your Minutes 2 Match profile is incomplete. Complete it to unlock better matches! Visit: minutes2match.com/me`
  } else {
    smsModalMessage.value = `Hi! Please complete your profile details (Occupation, Genotype, Interests, etc.) to get better matches on Minutes 2 Match. Update here: minutes2match.com/me`
  }
  showSmsModal.value = true
}

const confirmSendSms = async () => {
  if (smsModalType.value === 'incomplete') {
    await sendProfileReminders()
  } else {
    await sendMissingDetailsReminders()
  }
  showSmsModal.value = false
}

// Send SMS reminders to users with incomplete profiles
const sendProfileReminders = async () => {
  sendingReminders.value = true
  try {
    const response = await ($fetch as any)('/api/admin/notify-incomplete-profiles', {
      method: 'POST',
      body: { 
        dryRun: false,
        message: smsModalMessage.value
      }
    }) as { sent: number; failed: number }
    
    alert(`✅ Sent ${response.sent} reminders!${response.failed > 0 ? ` (${response.failed} failed)` : ''}`)
    
    // Refresh the list
    await fetchIncompleteProfiles()
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    alert('Failed to send reminders: ' + (error.message || 'Unknown error'))
  } finally {
    sendingReminders.value = false
  }
}

// Fetch missing details profiles (dry run)
const fetchMissingDetailsProfiles = async () => {
  loadingMissingDetails.value = true
  try {
    const response = await ($fetch as any)('/api/admin/notify-missing-details', {
      method: 'POST',
      body: { dryRun: true }
    }) as { profiles: IncompleteProfile[] }
    
    missingDetailsProfiles.value = response.profiles || []
  } catch (error) {
    console.error('Error fetching missing details profiles:', error)
  } finally {
    loadingMissingDetails.value = false
  }
}

// Send SMS reminders to users with missing details
const sendMissingDetailsReminders = async () => {
  sendingMissingDetailsReminders.value = true
  try {
    const response = await ($fetch as any)('/api/admin/notify-missing-details', {
      method: 'POST',
      body: { 
        dryRun: false, 
        message: smsModalMessage.value
      }
    }) as { sent: number; failed: number }
    
    alert(`✅ Sent ${response.sent} reminders!${response.failed > 0 ? ` (${response.failed} failed)` : ''}`)
    
    // Refresh the list
    await fetchMissingDetailsProfiles()
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    alert('Failed to send reminders: ' + (error.message || 'Unknown error'))
  } finally {
    sendingMissingDetailsReminders.value = false
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchMatchQuality(),
    fetchRecentActivity(),
    fetchWaitingUsers(),
    fetchIncompleteProfiles(),
    fetchMissingDetailsProfiles(),
    fetchWeekly()
  ])
})
</script>
