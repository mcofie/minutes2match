<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Vouches</h1>
        <p class="page-subtitle">Track friend-to-friend matchmaking referrals</p>
      </div>
      <button class="btn-primary" @click="exportVouches">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Export CSV
      </button>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid mb-8">
      <div class="stat-card success">
        <div class="stat-icon !bg-emerald-50 text-emerald-600">🤝</div>
        <div>
          <p class="stat-label">Total Vouches</p>
          <p class="stat-value">{{ stats.total }}</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon !bg-blue-50 text-blue-600">💕</div>
        <div>
          <p class="stat-label">Matched</p>
          <p class="stat-value text-emerald-600">{{ stats.matched }}</p>
        </div>
      </div>
      <div class="stat-card accent">
        <div class="stat-icon !bg-amber-50 text-amber-600">⏳</div>
        <div>
          <p class="stat-label">Pending</p>
          <p class="stat-value text-amber-600">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon !bg-rose-50 text-rose-600">📊</div>
        <div>
          <p class="stat-label">Conversion</p>
          <p class="stat-value font-mono">{{ stats.total ? Math.round((stats.matched / stats.total) * 100) : 0 }}%</p>
          <div class="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="bg-emerald-500 h-full transition-all duration-1000" :style="{ width: `${stats.total ? (stats.matched / stats.total) * 100 : 0}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search matcher, friend, or phone..." 
          class="search-input"
        />
      </div>
      <select v-model="activeFilter" class="form-select">
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="partial">Partial</option>
        <option value="matched">Matched</option>
        <option value="declined">Declined</option>
        <option value="expired">Expired</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Matcher</th>
            <th>Friend A</th>
            <th>Friend B</th>
            <th>Status</th>
            <th>Created</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-stone-400">
              <div class="flex flex-col items-center gap-2">
                <span class="animate-spin text-2xl">⏳</span>
                <span>Loading vouches...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredVouches.length === 0">
            <td colspan="6" class="text-center py-16 text-stone-400">
              <div class="flex flex-col items-center gap-3">
                <span class="text-3xl opacity-50">🤝</span>
                <span class="font-medium">No vouches found</span>
              </div>
            </td>
          </tr>
          <tr v-for="vouch in filteredVouches" :key="vouch.id" class="group hover:bg-stone-50 transition-colors">
            <td>
              <div class="flex items-center gap-3">
                <div class="user-avatar-sm bg-stone-100 text-stone-600">
                  {{ vouch.matcher_name?.charAt(0) || '?' }}
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-stone-900">{{ vouch.matcher_name }}</span>
                  <span class="text-xs text-stone-400 font-mono">{{ vouch.matcher_phone }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900 flex items-center gap-1.5">
                  {{ vouch.friend_a_name }}
                  <span v-if="vouch.friend_a_accepted" class="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">✓ Accepted</span>
                </span>
                <span class="text-xs text-stone-400 font-mono">{{ vouch.friend_a_phone }}</span>
              </div>
            </td>
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900 flex items-center gap-1.5">
                  {{ vouch.friend_b_name }}
                  <span v-if="vouch.friend_b_accepted" class="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">✓ Accepted</span>
                </span>
                <span class="text-xs text-stone-400 font-mono">{{ vouch.friend_b_phone }}</span>
              </div>
            </td>
            <td>
              <span class="status-pill" :class="vouch.status">
                <span class="dot"></span> {{ vouch.status }}
              </span>
            </td>
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900">{{ formatDate(vouch.created_at) }}</span>
                <span class="text-xs text-stone-400 font-mono">{{ formatTime(vouch.created_at) }}</span>
              </div>
            </td>
            <td>
              <span class="text-sm text-stone-500 max-w-[200px] truncate block">{{ vouch.matcher_note || '—' }}</span>
            </td>
            <td class="text-right">
              <button 
                v-if="vouch.status !== 'matched' && vouch.status !== 'declined' && vouch.status !== 'expired'"
                class="btn-icon group-hover:visible invisible" 
                @click="resendSms(vouch.id)" 
                :disabled="resendingSms === vouch.id"
                title="Resend SMS to Both"
                :class="{ 'animate-pulse text-rose-500': resendingSms === vouch.id }"
              >
                <svg v-if="resendingSms === vouch.id" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Vouches' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const loading = ref(true)
const vouches = ref<any[]>([])
const activeFilter = ref('all')
const searchQuery = ref('')
const resendingSms = ref<string | null>(null)

const resendSms = async (vouchId: string) => {
  if (resendingSms.value) return
  if (!confirm('Are you sure you want to resend the SMS for this vouch? It will only send to friends who haven\'t accepted.')) return

  resendingSms.value = vouchId
  try {
    const result = await $fetch('/api/admin/vouches/resend-sms', {
      method: 'POST',
      body: { vouchId, target: 'both' }
    }) as any
    
    if (result.success) {
      alert(result.results.join('\n'))
    }
  } catch (err: any) {
    alert(err.data?.message || 'Failed to resend SMS')
  } finally {
    resendingSms.value = null
  }
}

const stats = computed(() => ({
  total: vouches.value.length,
  matched: vouches.value.filter(v => v.status === 'matched').length,
  pending: vouches.value.filter(v => v.status === 'pending' || v.status === 'partial').length
}))

const filteredVouches = computed(() => {
  let result = vouches.value

  if (activeFilter.value !== 'all') {
    result = result.filter(v => v.status === activeFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      v.matcher_name?.toLowerCase().includes(q) ||
      v.matcher_phone?.includes(q) ||
      v.friend_a_name?.toLowerCase().includes(q) ||
      v.friend_a_phone?.includes(q) ||
      v.friend_b_name?.toLowerCase().includes(q) ||
      v.friend_b_phone?.includes(q)
    )
  }

  return result
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  })
}

const exportVouches = () => {
  const csv = [
    ['Date', 'Matcher', 'Matcher Phone', 'Friend A', 'Friend A Phone', 'Friend A Accepted', 'Friend B', 'Friend B Phone', 'Friend B Accepted', 'Status', 'Note'].join(','),
    ...vouches.value.map(v => [
      new Date(v.created_at).toISOString(),
      v.matcher_name,
      v.matcher_phone,
      v.friend_a_name,
      v.friend_a_phone,
      v.friend_a_accepted ? 'Yes' : 'No',
      v.friend_b_name,
      v.friend_b_phone,
      v.friend_b_accepted ? 'Yes' : 'No',
      v.status,
      `"${(v.matcher_note || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vouches-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('vouches')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) vouches.value = data
    if (error) console.error('Failed to fetch vouches:', error)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Layout */
.admin-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 800; color: #111827; letter-spacing: -0.025em; }
.page-subtitle { color: #6B7280; font-size: 0.875rem; margin-top: 0.25rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.stat-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.stat-card.success { border-left: 4px solid #10B981; }
.stat-card.info { border-left: 4px solid #3B82F6; }
.stat-card.accent { border-left: 4px solid #F59E0B; }
.stat-card.danger { border-left: 4px solid #EF4444; }
.stat-icon { font-size: 2rem; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; background: #F3F4F6; border-radius: 50%; }
.stat-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #111827; }

/* Filters */
.filters-bar { display: flex; gap: 1rem; justify-content: space-between; margin-bottom: 1rem; align-items: center; flex-wrap: wrap; }
.search-wrapper { flex: 1; min-width: 250px; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9CA3AF; }
.search-input { width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.875rem; transition: border-color 0.2s; }
.search-input:focus { outline: none; border-color: #3B82F6; }
.form-select { padding: 0.625rem 2rem 0.625rem 1rem; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 0.875rem; background-color: white; min-width: 140px; color: #374151; }

/* Table */
.table-container { background: white; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #F3F4F6; font-size: 0.875rem; }
.user-avatar-sm { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }

/* Status Pills */
.status-pill { display: inline-flex; align-items: center; gap: 0.375rem; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.status-pill.matched { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.status-pill.matched .dot { background: #059669; }
.status-pill.pending { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.pending .dot { background: #D97706; }
.status-pill.partial { background: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
.status-pill.partial .dot { background: #2563EB; }
.status-pill.declined { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
.status-pill.declined .dot { background: #DC2626; }
.status-pill.expired { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.expired .dot { background: #6B7280; }

/* Buttons */
.btn-primary { display: flex; align-items: center; padding: 0.625rem 1rem; background: #111827; color: white; border-radius: 8px; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
.btn-primary:hover { background: #374151; }
.btn-secondary { padding: 0.625rem 1rem; background: white; border: 1px solid #E5E7EB; color: #374151; border-radius: 8px; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
.btn-secondary:hover { background: #F9FAFB; }
.btn-icon { padding: 6px; color: #6B7280; border-radius: 6px; transition: all 0.2s; }
.btn-icon:hover { background: #F3F4F6; color: #111827; }
</style>
