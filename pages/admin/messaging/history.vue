<template>
  <div class="max-w-6xl">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">SMS History</h1>
        <p class="text-stone-500 mt-1">View all sent SMS messages</p>
      </div>
      <NuxtLink to="/admin/messaging" class="bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-800 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Compose New
      </NuxtLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Total Sent</p>
        <p class="text-2xl font-bold text-stone-900">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Today</p>
        <p class="text-2xl font-bold text-stone-900">{{ stats.today }}</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">This Week</p>
        <p class="text-2xl font-bold text-stone-900">{{ stats.week }}</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Broadcasts</p>
        <p class="text-2xl font-bold text-stone-900">{{ stats.broadcasts }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
      <div class="flex-1 min-w-[200px]">
        <input 
          v-model="search"
          type="text"
          placeholder="Search by recipient or message..."
          class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm"
        />
      </div>
      <div class="flex gap-2">
        <button 
          @click="filterBy = 'all'"
          :class="['px-4 py-2 text-xs font-medium rounded-lg transition-colors', filterBy === 'all' ? 'bg-black text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200']"
        >
          All
        </button>
        <button 
          @click="filterBy = 'today'"
          :class="['px-4 py-2 text-xs font-medium rounded-lg transition-colors', filterBy === 'today' ? 'bg-black text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200']"
        >
          Today
        </button>
        <button 
          @click="filterBy = 'week'"
          :class="['px-4 py-2 text-xs font-medium rounded-lg transition-colors', filterBy === 'week' ? 'bg-black text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200']"
        >
          This Week
        </button>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-stone-50 border-b border-stone-200">
            <tr>
              <th class="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-stone-500">Recipient</th>
              <th class="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-stone-500">Message</th>
              <th class="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-stone-500">Status</th>
              <th class="text-left px-6 py-4 text-xs font-bold uppercase tracking-wide text-stone-500">Sent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="border-b border-stone-50">
              <td colspan="4" class="px-6 py-12 text-center text-stone-400">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-5 h-5 border-2 border-stone-200 border-t-black rounded-full animate-spin"></div>
                  Loading history...
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredHistory.length === 0" class="border-b border-stone-50">
              <td colspan="4" class="px-6 py-12 text-center text-stone-400">
                <div class="text-4xl mb-2">📭</div>
                <p>No SMS messages found</p>
                <NuxtLink to="/admin/messaging" class="text-black font-medium hover:underline mt-2 inline-block">Send your first message →</NuxtLink>
              </td>
            </tr>
            <tr 
              v-else
              v-for="sms in filteredHistory" 
              :key="sms.id"
              class="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                    {{ sms.recipient_name?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-stone-900">{{ sms.recipient_name || 'Unknown' }}</p>
                    <p class="text-xs text-stone-400 font-mono">{{ sms.recipient_phone }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-stone-700 max-w-md truncate">{{ sms.message }}</p>
                <p v-if="sms.broadcast_id" class="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Broadcast
                </p>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'text-xs px-2.5 py-1 rounded-full font-medium',
                  sms.status === 'sent' ? 'bg-green-50 text-green-700' : 
                  sms.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                ]">
                  {{ sms.status === 'sent' ? '✓ Sent' : sms.status === 'failed' ? '✗ Failed' : '⏳ Pending' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-stone-600">{{ formatDate(sms.created_at) }}</p>
                <p class="text-xs text-stone-400">{{ formatTime(sms.created_at) }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredHistory.length > 0" class="px-6 py-4 border-t border-stone-100 flex justify-between items-center bg-stone-50/50">
        <p class="text-xs text-stone-500">
          Showing {{ filteredHistory.length }} of {{ history.length }} messages
        </p>
        <div class="flex gap-2">
          <button 
            v-if="page > 1"
            @click="page--"
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-stone-200 hover:border-stone-300"
          >
            ← Previous
          </button>
          <button 
            v-if="hasMore"
            @click="loadMore"
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-stone-800"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'SMS History' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const loading = ref(true)
const history = ref<any[]>([])
const search = ref('')
const filterBy = ref('all')
const page = ref(1)
const pageSize = 50
const hasMore = ref(true)

const stats = reactive({
  total: 0,
  today: 0,
  week: 0,
  broadcasts: 0
})

// Computed
const filteredHistory = computed(() => {
  let result = history.value

  // Search filter
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(sms => 
      (sms.recipient_name || '').toLowerCase().includes(q) ||
      (sms.recipient_phone || '').toLowerCase().includes(q) ||
      (sms.message || '').toLowerCase().includes(q)
    )
  }

  // Date filter
  if (filterBy.value === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    result = result.filter(sms => new Date(sms.created_at) >= today)
  } else if (filterBy.value === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    result = result.filter(sms => new Date(sms.created_at) >= weekAgo)
  }

  return result
})

// Fetch history
const fetchHistory = async () => {
  loading.value = true
  
  // @ts-ignore
  const { data, error } = await supabase
    .from('sms_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(pageSize * page.value)
  
  if (error) {
    console.error('Error fetching SMS history:', error)
  } else {
    history.value = data || []
    hasMore.value = (data?.length || 0) === pageSize * page.value
  }
  
  loading.value = false
}

// Fetch stats
const fetchStats = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  // Total
  // @ts-ignore
  const { count: total } = await supabase
    .from('sms_history')
    .select('*', { count: 'exact', head: true })
  stats.total = total || 0

  // Today
  // @ts-ignore
  const { count: todayCount } = await supabase
    .from('sms_history')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
  stats.today = todayCount || 0

  // This week
  // @ts-ignore
  const { count: weekCount } = await supabase
    .from('sms_history')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())
  stats.week = weekCount || 0

  // Unique broadcasts
  // @ts-ignore
  const { data: broadcasts } = await supabase
    .from('sms_history')
    .select('broadcast_id')
    .not('broadcast_id', 'is', null)
  
  const uniqueBroadcasts = new Set((broadcasts || []).map((b: any) => b.broadcast_id))
  stats.broadcasts = uniqueBroadcasts.size
}

const loadMore = () => {
  page.value++
  fetchHistory()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchHistory(),
    fetchStats()
  ])
})
</script>
