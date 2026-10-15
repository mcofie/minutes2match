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
        <section class="ad-panel lg:sticky lg:top-20">
          <h2 class="ad-label">Summary</h2>
          <div class="ad-kv"><span>Recipients</span><span class="ad-num font-semibold">{{ selectedUsers.length }}</span></div>
          <div class="ad-kv"><span>Length</span><span class="ad-num">{{ message.length }}/160</span></div>
          <div class="ad-kv"><span>Estimated cost</span><span class="ad-num">~GH₵{{ (selectedUsers.length * 0.05).toFixed(2) }}</span></div>

          <p v-if="selectedUsers.length" class="mt-3 text-xs leading-relaxed ad-muted">
            To {{ selectedUsers.slice(0, 3).map(u => u.display_name || u.phone).join(', ') }}<template v-if="selectedUsers.length > 3"> and {{ selectedUsers.length - 3 }} more</template>.
          </p>

          <button class="btn-primary mt-5 w-full !py-3" :disabled="!canSend || sending" @click="sendMessages">
            <template v-if="sending">Sending {{ sentCount }}/{{ selectedUsers.length }}…</template>
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
const sentCount = ref(0)
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

const sendMessages = async () => {
  if (!canSend.value) return
  
  sending.value = true
  sentCount.value = 0
  
  // Generate a broadcast ID to group messages
  const broadcastId = crypto.randomUUID()
  
  try {
    // Get the current session for auth
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    
    if (!token) {
      throw new Error('Not authenticated')
    }

    // Prepare recipients for bulk API
    const recipients = selectedUsers.value
      .filter(u => u.phone)
      .map(u => ({
        id: u.id,
        phone: u.phone,
        name: u.display_name || ''
      }))

    // Call bulk SMS API (server handles history logging in bulk)
    const result = await $fetch<{
      success: boolean
      broadcastId: string
      summary: { total: number; sent: number; failed: number }
      results: Array<{ id: string; phone: string; success: boolean; error?: string }>
    }>('/api/admin/bulk-sms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        recipients,
        message: message.value
      }
    })

    sentCount.value = result.summary.sent
    const failedCount = result.summary.failed
    
    // Log the broadcast locally for the UI
    broadcasts.value.unshift({
      id: result.broadcastId || broadcastId,
      message: message.value,
      count: sentCount.value,
      sent_at: new Date().toISOString()
    })
    
    // Show success/partial success message
    if (failedCount > 0) {
      if (sentCount.value === 0) {
        throw new Error('All messages failed to send. Check logs.')
      }
      successMessage.value = `Sent ${sentCount.value} messages (${failedCount} failed)`
    } else {
      successMessage.value = `Sent ${sentCount.value} messages successfully!`
    }
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 4000)
    
    // Reset
    message.value = ''
    selectedUserIds.value = []
    activeFilter.value = 'all'
    
  } catch (error: any) {
    console.error('Broadcast error:', error)
    alert(error.data?.message || error.message || 'Failed to send messages. Please try again.')
  } finally {
    sending.value = false
    sentCount.value = 0
  }
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
