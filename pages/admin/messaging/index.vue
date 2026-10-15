<template>
  <div class="ad-page">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">SMS</h1>
        <p class="ad-sub">Write a message and send it to members. Use {name} to personalise it.</p>
      </div>
      <NuxtLink to="/admin/messaging/history" class="btn-ghost">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
        History
      </NuxtLink>
    </header>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- Message -->
        <section class="ad-panel space-y-4">
          <div>
            <span class="ad-label">Start from a template</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="template in templates"
                :key="template.name"
                class="h-8 rounded-full border px-3.5 text-sm transition-colors"
                :class="message === template.message ? 'border-[#393737] bg-[#393737] text-white' : 'border-[#ded9d2] text-[#6c6862] hover:border-[#393737] hover:text-[#393737]'"
                @click="applyTemplate(template)"
              >{{ template.name }}</button>
            </div>
          </div>

          <div>
            <label class="ad-label" for="sms-message">Message</label>
            <textarea
              id="sms-message"
              v-model="message"
              rows="5"
              maxlength="160"
              placeholder="Hi {name}! …"
              class="form-input resize-none !text-[0.95rem] leading-relaxed"
            ></textarea>
            <div class="mt-1.5 flex justify-between text-xs">
              <span :class="message.length > 140 ? 'font-semibold text-[#9a5b0f]' : 'ad-faint'">{{ message.length }}/160</span>
              <span v-if="message.includes('{name}')" class="text-[#1f7a4d]">Personalised</span>
            </div>
          </div>

          <div v-if="message">
            <span class="ad-label">Preview</span>
            <p class="max-w-sm rounded-[1.25rem] rounded-bl-md bg-[#f1efec] px-4 py-3 text-sm leading-relaxed">{{ previewMessage }}</p>
          </div>
        </section>

        <!-- Recipients -->
        <section class="ad-panel space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="ad-label !mb-0">Recipients · {{ selectedUsers.length }} selected</h2>
            <div class="flex gap-1">
              <button class="btn-ghost btn-sm" @click="selectAll">Select all{{ activeFilter !== 'all' || search ? ' shown' : '' }}</button>
              <button v-if="selectedUsers.length" class="btn-ghost btn-sm" @click="clearSelection">Clear</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="ad-tabs">
              <button
                v-for="f in audienceFilters"
                :key="f.key"
                class="ad-tab"
                :class="{ 'is-active': activeFilter === f.key }"
                @click="filterUsers(f.key)"
              >
                {{ f.label }}
                <span class="ad-tab__count">{{ f.count }}</span>
              </button>
            </div>
            <label class="ad-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
              <input v-model="search" type="search" placeholder="Search name or phone" aria-label="Search members" />
            </label>
          </div>
          <p v-if="activeFilter !== 'all'" class="-mt-1 text-xs ad-faint">Choosing a group selects everyone in it.</p>

          <div class="max-h-80 overflow-y-auto rounded-2xl border border-[#ece8e3]">
            <div v-if="loading" class="ad-empty !py-10"><span class="ad-spinner"></span></div>
            <p v-else-if="filteredUsers.length === 0" class="ad-empty !py-10">No members found.</p>
            <label
              v-for="user in filteredUsers"
              v-else
              :key="user.id"
              class="flex cursor-pointer items-center gap-3 border-b border-[#f3f1ee] px-4 py-2.5 last:border-0 hover:bg-[#fcfbf9]"
            >
              <input v-model="selectedUserIds" type="checkbox" :value="user.id" class="h-4 w-4" />
              <span class="ad-avatar ad-avatar--sm">{{ user.display_name?.charAt(0) || '?' }}</span>
              <span class="min-w-0 flex-1">
                <span class="ad-person__name !font-medium text-sm">{{ user.display_name || 'No name' }}</span>
                <span class="ad-person__meta">{{ user.phone }}</span>
              </span>
              <span v-if="user.gender" class="text-xs capitalize ad-faint">{{ user.gender }}</span>
            </label>
          </div>
        </section>
      </div>

      <!-- Send -->
      <aside class="space-y-6">
        <!-- Blast in progress (or just finished) -->
        <section v-if="blast" class="ad-panel" aria-live="polite">
          <div class="flex items-center justify-between gap-3">
            <h2 class="ad-label !mb-0">{{ blast.status === 'sending' ? (sending ? 'Sending' : 'Paused') : blast.status === 'cancelled' ? 'Stopped' : 'Sent' }}</h2>
            <span class="ad-num text-sm font-semibold">{{ blastPercent }}%</span>
          </div>
          <div class="mt-3 flex h-2 overflow-hidden rounded-full bg-[#f1efec]" :title="`${blast.sent} sent, ${blast.failed} failed of ${blast.total}`">
            <span class="h-full bg-[#393737] transition-[width] duration-500" :style="{ width: (blast.total ? (blast.sent / blast.total) * 100 : 0) + '%' }"></span>
            <span class="h-full bg-[#ed1c24] transition-[width] duration-500" :style="{ width: (blast.total ? (blast.failed / blast.total) * 100 : 0) + '%' }"></span>
          </div>
          <div class="mt-3 ad-kv"><span>Sent</span><span class="ad-num font-semibold">{{ blast.sent }} of {{ blast.total }}</span></div>
          <div v-if="blast.failed" class="ad-kv"><span>Failed</span><span class="ad-num text-[#b4232a]">{{ blast.failed }}</span></div>
          <div v-if="blast.cancelled" class="ad-kv"><span>Not sent (stopped)</span><span class="ad-num">{{ blast.cancelled }}</span></div>
          <p v-if="blastMessage" class="mt-3 line-clamp-2 text-xs ad-faint">"{{ blastMessage }}"</p>

          <div class="mt-4 flex flex-wrap gap-2">
            <template v-if="blast.status === 'sending'">
              <button v-if="!sending" class="btn-ink btn-sm" @click="runBlast(blast.broadcastId)">Continue</button>
              <button class="btn-ghost btn-sm" @click="cancelBlast">Stop sending</button>
            </template>
            <template v-else>
              <button v-if="blast.failed" class="btn-ink btn-sm" :disabled="sending" @click="retryFailed">Retry {{ blast.failed }} failed</button>
              <NuxtLink to="/admin/messaging/history" class="btn-ghost btn-sm">View in history</NuxtLink>
              <button class="btn-ghost btn-sm" @click="dismissBlast">Done</button>
            </template>
          </div>
          <p v-if="blast.status === 'sending'" class="mt-3 text-xs leading-relaxed ad-faint">
            {{ sending ? 'Keep this page open to send fastest.' : 'Paused.' }} Unsent messages stay queued, and the server finishes them if the page is closed.
          </p>
        </section>

        <section class="ad-panel lg:sticky lg:top-20">
          <h2 class="ad-label">Summary</h2>
          <div class="ad-kv"><span>Recipients</span><span class="ad-num font-semibold">{{ selectedUsers.length }}</span></div>
          <div class="ad-kv"><span>Length</span><span class="ad-num">{{ message.length }}/160</span></div>
          <div class="ad-kv"><span>Estimated cost</span><span class="ad-num">~GH₵{{ (selectedUsers.length * 0.05).toFixed(2) }}</span></div>

          <p v-if="selectedUsers.length" class="mt-3 text-xs leading-relaxed ad-muted">
            To {{ selectedUsers.slice(0, 3).map(u => u.display_name || u.phone).join(', ') }}<template v-if="selectedUsers.length > 3"> and {{ selectedUsers.length - 3 }} more</template>.
          </p>

          <button class="btn-primary mt-5 w-full !py-3" :disabled="!canSend || sending || (!!blast && !blastDone)" @click="sendMessages">
            <template v-if="sending && !blast">Starting…</template>
            <template v-else>Send {{ selectedUsers.length || '' }} SMS</template>
          </button>
          <p v-if="!message" class="mt-2 text-center text-xs ad-faint">Write a message to send.</p>
          <p v-else-if="selectedUsers.length === 0" class="mt-2 text-center text-xs ad-faint">Pick at least one recipient.</p>
        </section>

        <section v-if="broadcasts.length" class="ad-panel">
          <h2 class="ad-label">Sent this session</h2>
          <ul class="space-y-3">
            <li v-for="b in broadcasts" :key="b.id" class="text-sm">
              <p class="line-clamp-2">{{ b.message }}</p>
              <p class="mt-0.5 text-xs ad-faint">{{ b.count }} recipients · {{ formatDate(b.sent_at) }}</p>
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <Transition name="toast">
      <div v-if="showSuccess" role="status" class="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-full bg-[#393737] px-5 py-3 text-sm text-white shadow-[0_18px_50px_rgba(52,38,25,0.25)]">
        <span class="h-2 w-2 rounded-full bg-[#4ade80]"></span>
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'SMS Messaging' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const sending = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const users = ref<any[]>([])
const selectedUserIds = ref<string[]>([])
const message = ref('')
const search = ref('')
const activeFilter = ref('all')
const broadcasts = ref<any[]>([])

// Templates
const templates = [
  { name: 'Event reminder', message: 'Hi {name}! Reminder: Your M2M event is coming up. See you there!' },
  { name: 'New match', message: 'Hi {name}! You have a new match waiting. Log in to see who it is!' },
  { name: 'Announcement', message: 'Hi {name}! We have exciting news from Minutes 2 Match...' },
  { name: 'Special offer', message: 'Hi {name}! Exclusive offer just for you. Check your M2M dashboard!' },
]

// Computed
const audienceFilters = computed(() => [
  { key: 'all', label: 'Everyone', count: users.value.length },
  { key: 'male', label: 'Men', count: users.value.filter(u => u.gender === 'male').length },
  { key: 'female', label: 'Women', count: users.value.filter(u => u.gender === 'female').length },
  { key: 'verified', label: 'Verified', count: users.value.filter(u => u.is_verified).length }
])

const filteredUsers = computed(() => {
  let result = users.value

  // Apply filter
  if (activeFilter.value === 'male') {
    result = result.filter(u => u.gender === 'male')
  } else if (activeFilter.value === 'female') {
    result = result.filter(u => u.gender === 'female')
  } else if (activeFilter.value === 'verified') {
    result = result.filter(u => u.is_verified)
  }

  // Apply search
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(u => 
      (u.display_name || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    )
  }

  return result
})

const selectedUsers = computed(() => {
  return users.value.filter(u => selectedUserIds.value.includes(u.id))
})

const previewMessage = computed(() => {
  return message.value.replace(/\{name\}/g, 'Ama')
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && selectedUsers.value.length > 0
})

// Methods
const fetchUsers = async () => {
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, phone, gender, is_verified')
    .order('display_name', { ascending: true })
  
  users.value = data || []
  loading.value = false
}

const filterUsers = (filter: string) => {
  activeFilter.value = filter
  // Auto-select all in the filtered group
  if (filter !== 'all') {
    const filtered = filteredUsers.value
    selectedUserIds.value = filtered.map(u => u.id)
  }
}

const selectAll = () => {
  selectedUserIds.value = filteredUsers.value.map(u => u.id)
}

const clearSelection = () => {
  selectedUserIds.value = []
}

const applyTemplate = (template: { name: string; message: string }) => {
  message.value = template.message
}

// ----- Sending: a blast is queued on the server, then sent in batches while this page asks for more -----
interface BlastProgress {
  broadcastId: string
  status: 'sending' | 'done' | 'cancelled'
  total: number
  pending: number
  sending: number
  sent: number
  failed: number
  cancelled: number
}
const blast = ref<BlastProgress | null>(null)
const blastMessage = ref('')
const stopRequested = ref(false)
const blastDone = computed(() => !!blast.value && blast.value.status !== 'sending')
const blastPercent = computed(() => {
  const b = blast.value
  if (!b || !b.total) return 0
  return Math.round(((b.sent + b.failed + b.cancelled) / b.total) * 100)
})

// Keep asking the server to send the next batches until nothing is left (or Cancel is pressed)
const runBlast = async (broadcastId: string) => {
  sending.value = true
  stopRequested.value = false
  let errors = 0
  try {
    while (!stopRequested.value) {
      try {
        blast.value = await $fetch<BlastProgress>(`/api/admin/bulk-sms/${broadcastId}/process`, { method: 'POST' })
        errors = 0
      } catch (e) {
        // A dropped request doesn't lose anything: unsent messages stay queued. Try again a few times.
        if (++errors >= 4) throw e
        await new Promise(r => setTimeout(r, 2000 * errors))
        continue
      }
      if (blast.value.status !== 'sending') break
    }
  } catch (error: any) {
    console.error('Broadcast error:', error)
    alert('Sending paused because the server isn\'t responding. Unsent messages are still queued; press Continue to carry on.')
  } finally {
    sending.value = false
  }

  if (blast.value?.status === 'done') {
    const b = blast.value
    broadcasts.value.unshift({ id: b.broadcastId, message: blastMessage.value, count: b.sent, sent_at: new Date().toISOString() })
    successMessage.value = b.failed ? `Sent ${b.sent} of ${b.total}. ${b.failed} failed.` : `Sent to all ${b.sent} recipients.`
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 5000)
  }
}

const sendMessages = async () => {
  if (!canSend.value) return
  const count = selectedUsers.value.length
  if (count > 20 && !confirm(`Send this SMS to ${count} members?`)) return

  sending.value = true
  try {
    const recipients = selectedUsers.value.map(u => ({ id: u.id, phone: u.phone, name: u.display_name || '' }))
    const res = await $fetch<{ broadcastId: string; queued: number; skipped: { noPhone: number; duplicates: number } }>('/api/admin/bulk-sms', {
      method: 'POST',
      body: { recipients, message: message.value }
    })
    blastMessage.value = message.value
    blast.value = { broadcastId: res.broadcastId, status: 'sending', total: res.queued, pending: res.queued, sending: 0, sent: 0, failed: 0, cancelled: 0 }
    // Clear the form: the blast now lives on the server
    message.value = ''
    selectedUserIds.value = []
    activeFilter.value = 'all'
    await runBlast(res.broadcastId)
  } catch (error: any) {
    console.error('Broadcast error:', error)
    alert(error.data?.message || error.message || 'Could not start sending. Please try again.')
    sending.value = false
  }
}

const cancelBlast = async () => {
  if (!blast.value) return
  if (!confirm('Stop sending? Messages already sent stay sent.')) return
  stopRequested.value = true
  try {
    blast.value = await $fetch<BlastProgress>(`/api/admin/bulk-sms/${blast.value.broadcastId}/cancel`, { method: 'POST' })
  } catch (e) {
    alert('Could not cancel. Please try again.')
  }
}

const retryFailed = async () => {
  if (!blast.value) return
  blast.value = await $fetch<BlastProgress>(`/api/admin/bulk-sms/${blast.value.broadcastId}/retry`, { method: 'POST' })
  if (blast.value.status === 'sending') await runBlast(blast.value.broadcastId)
}

const dismissBlast = () => {
  blast.value = null
}

// A blast still sending from earlier (page closed, connection dropped): offer to carry on
const findUnfinishedBlast = async () => {
  const { data } = await (supabase as any).schema('m2m').from('sms_broadcasts')
    .select('id, message').eq('status', 'sending').order('created_at', { ascending: false }).limit(1)
  const unfinished = data?.[0]
  if (!unfinished) return
  blastMessage.value = unfinished.message
  try {
    blast.value = await $fetch<BlastProgress>(`/api/admin/bulk-sms/${unfinished.id}`)
  } catch {}
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

// Initialize
onMounted(() => {
  fetchUsers()
  findUnfinishedBlast()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
