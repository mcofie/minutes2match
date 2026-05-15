<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>{{ scorecardEvent?.title || 'Event Scorecard' }} | Minutes 2 Match</Title>
    </Head>

    <div class="flex items-center justify-between gap-4">
      <div>
        <NuxtLink :to="`/events/${eventId}`" class="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700">Back to Event</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-stone-900">Event Scorecard</h1>
        <p class="mt-2 text-sm text-stone-500">
          Mark the people you’d want to reconnect with. Mutual `Match` picks unlock automatically after the room closes.
        </p>
      </div>
      <span class="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
        :class="scorecardsOpen ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-stone-100 text-stone-500'">
        {{ scorecardsOpen ? 'Open Now' : 'Closed' }}
      </span>
    </div>

    <div v-if="loading" class="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400">
      Loading scorecard...
    </div>

    <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
      {{ errorMessage }}
    </div>

    <template v-else>
      <div class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-center gap-3 text-sm text-stone-600">
          <span class="font-semibold text-stone-800">{{ scorecardEvent?.title }}</span>
          <span v-if="scorecardEvent?.scorecard_deadline">Deadline: {{ formattedDeadline }}</span>
          <span>{{ candidates.length }} attendee{{ candidates.length === 1 ? '' : 's' }} to review</span>
        </div>
      </div>

      <div v-if="candidates.length === 0" class="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">
        No checked-in attendees are available for scoring yet.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="candidate in candidates"
          :key="candidate.id"
          class="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 flex items-center justify-center text-xl text-stone-400">
                <NuxtImg v-if="candidate.photo_url" :src="candidate.photo_url" class="h-full w-full object-cover" />
                <span v-else>{{ candidate.display_name?.charAt(0) || '?' }}</span>
              </div>
              <div>
                <p class="text-base font-bold text-stone-900">{{ candidate.display_name || 'Anonymous' }}</p>
                <p class="mt-1 text-xs text-stone-500">
                  {{ [candidate.gender, candidate.dating_persona, candidate.intent, candidate.occupation].filter(Boolean).join(' • ') || 'Met at the event' }}
                </p>
              </div>
            </div>
            <span
              v-if="decisions[candidate.id]?.decision"
              class="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              :class="pillClass(decisions[candidate.id]?.decision)"
            >
              {{ decisions[candidate.id]?.decision }}
            </span>
          </div>

          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              v-for="option in decisionOptions"
              :key="option.value"
              :disabled="!scorecardsOpen || saving"
              @click="setDecision(candidate.id, option.value)"
              class="rounded-xl border px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
              :class="buttonClass(candidate.id, option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <div class="mt-4">
            <textarea
              v-model="decisions[candidate.id].note"
              :disabled="!scorecardsOpen || saving"
              rows="2"
              maxlength="240"
              class="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none focus:border-black disabled:opacity-60"
              placeholder="Private note for yourself (optional)"
            />
          </div>
        </div>
      </div>

      <div class="sticky bottom-4 z-10 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-stone-600">
            {{ completedCount }} of {{ candidates.length }} scored.
          </p>
          <button
            :disabled="!scorecardsOpen || saving || completedCount === 0"
            @click="saveScorecard"
            class="rounded-xl border-2 border-black bg-black px-5 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-60"
          >
            {{ saving ? 'Saving...' : 'Submit Scorecard' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()
const { initDashboard, currentUserId } = useDashboard()

const eventId = computed(() => String(route.params.id || ''))
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const scorecardEvent = ref<any>(null)
const scorecardsOpen = ref(false)
const candidates = ref<any[]>([])
const decisions = reactive<Record<string, { decision: 'match' | 'maybe' | 'pass' | null, note: string }>>({})

const decisionOptions = [
  { value: 'match', label: 'Match' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'pass', label: 'Pass' }
] as const

const completedCount = computed(() => Object.values(decisions).filter((entry) => entry.decision).length)

const formattedDeadline = computed(() => {
  if (!scorecardEvent.value?.scorecard_deadline) return '—'
  return new Date(scorecardEvent.value.scorecard_deadline).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
  })
})

const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (currentUserId.value && currentUserId.value !== 'undefined') headers['x-user-id'] = currentUserId.value
  return Object.keys(headers).length ? headers : undefined
}

const setDecision = (candidateId: string, value: 'match' | 'maybe' | 'pass') => {
  if (!decisions[candidateId]) decisions[candidateId] = { decision: null, note: '' }
  decisions[candidateId].decision = value
}

const pillClass = (value: string | null | undefined) => {
  if (value === 'match') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value === 'maybe') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (value === 'pass') return 'border-stone-200 bg-stone-100 text-stone-500'
  return 'border-stone-200 bg-stone-100 text-stone-500'
}

const buttonClass = (candidateId: string, value: 'match' | 'maybe' | 'pass') => {
  const selected = decisions[candidateId]?.decision === value
  if (value === 'match') return selected ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
  if (value === 'maybe') return selected ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
  return selected ? 'border-stone-300 bg-stone-100 text-stone-700' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
}

const fetchScorecard = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await initDashboard()
    const result = await $fetch<any>(`/api/events/${eventId.value}/scorecard`, {
      headers: await getHeaders()
    })

    scorecardEvent.value = result.event
    scorecardsOpen.value = Boolean(result.scorecardsOpen)
    candidates.value = result.candidates || []

    for (const candidate of candidates.value) {
      decisions[candidate.id] = { decision: null, note: '' }
    }

    for (const row of result.existing || []) {
      decisions[row.target_user_id] = {
        decision: row.decision,
        note: row.note || ''
      }
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.message || 'Unable to load scorecard right now.'
  } finally {
    loading.value = false
  }
}

const saveScorecard = async () => {
  saving.value = true
  try {
    const entries = Object.entries(decisions)
      .filter(([, value]) => value.decision)
      .map(([targetUserId, value]) => ({
        targetUserId,
        decision: value.decision,
        note: value.note
      }))

    await $fetch(`/api/events/${eventId.value}/scorecard`, {
      method: 'POST',
      headers: await getHeaders(),
      body: { entries }
    })

    toast.success('Scorecard saved', 'We’ll unlock any mutual event matches after the round closes.')
    await fetchScorecard()
  } catch (error: any) {
    toast.error('Could not save scorecard', error?.data?.statusMessage || error?.message || 'Please try again.')
  } finally {
    saving.value = false
  }
}

onMounted(fetchScorecard)
</script>
