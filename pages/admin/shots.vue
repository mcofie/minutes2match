<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Shoot Your Shot</h1>
        <p class="page-subtitle">Track shot submissions, payments, and unlocks</p>
      </div>
      <button class="btn-primary" @click="exportShots">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Export CSV
      </button>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="stat-card success">
          <div class="stat-icon !bg-emerald-50 text-emerald-600">🎯</div>
          <div>
            <p class="stat-label">Total Shots</p>
            <p class="stat-value">{{ stats.total }}</p>
          </div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon !bg-blue-50 text-blue-600">👀</div>
          <div>
            <p class="stat-label">Unlocked</p>
            <p class="stat-value text-emerald-600">{{ stats.unlocked }}</p>
            <div class="text-[10px] mt-1 text-stone-500">
              {{ stats.total ? Math.round((stats.unlocked / stats.total) * 100) : 0 }}% reveal rate
            </div>
          </div>
        </div>
        <div class="stat-card accent">
          <div class="stat-icon !bg-amber-50 text-amber-600">⏳</div>
          <div>
            <p class="stat-label">Awaiting</p>
            <p class="stat-value text-amber-600">{{ stats.sent }}</p>
            <div class="text-[10px] mt-1 text-stone-500">Sent but not opened</div>
          </div>
        </div>
      </div>

      <!-- Revenue Card -->
      <div class="stat-card !flex-col !items-start gap-3">
        <p class="stat-label">Shot Revenue</p>
        <p class="stat-value font-mono text-2xl">{{ formatGHS(stats.revenue) }}</p>
        <div class="w-full space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-stone-500">Paid shots</span>
            <span class="font-bold text-stone-900">{{ stats.paid }}</span>
          </div>
          <div class="w-full bg-stone-50 h-2 rounded-full overflow-hidden">
            <div 
              class="bg-emerald-400 h-full rounded-full transition-all duration-1000" 
              :style="{ width: `${stats.total ? (stats.paid / stats.total) * 100 : 0}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-stone-500">Unpaid / pending</span>
            <span class="font-bold text-stone-900">{{ stats.total - stats.paid }}</span>
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
          placeholder="Search shooter, target, or phone..." 
          class="search-input"
        />
      </div>
      <div class="flex gap-2">
        <select v-model="activeFilter" class="form-select">
          <option value="all">All Statuses</option>
          <option value="awaiting_payment">Awaiting Payment</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="unlocked">Unlocked</option>
          <option value="expired">Expired</option>
        </select>
        <select v-model="paymentFilter" class="form-select">
          <option value="">All Payments</option>
          <option value="success">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Shooter</th>
            <th>Target</th>
            <th class="text-right">Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-12 text-stone-400">
              <div class="flex flex-col items-center gap-2">
                <span class="animate-spin text-2xl">⏳</span>
                <span>Loading shots...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredShots.length === 0">
            <td colspan="7" class="text-center py-16 text-stone-400">
              <div class="flex flex-col items-center gap-3">
                <span class="text-3xl opacity-50">🎯</span>
                <span class="font-medium">No shots found</span>
              </div>
            </td>
          </tr>
          <tr v-for="shot in filteredShots" :key="shot.id" class="group hover:bg-stone-50 transition-colors">
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900">{{ formatDate(shot.created_at) }}</span>
                <span class="text-xs text-stone-400 font-mono">{{ formatTime(shot.created_at) }}</span>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-3">
                <div class="user-avatar-sm bg-rose-100 text-rose-600">
                  {{ shot.shooter_name?.charAt(0) || '?' }}
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-stone-900">{{ shot.shooter_name }}</span>
                  <span class="text-xs text-stone-400 font-mono">{{ shot.shooter_phone }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-3">
                <div class="user-avatar-sm bg-blue-100 text-blue-600">
                  {{ shot.target_name?.charAt(0) || '?' }}
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-stone-900">{{ shot.target_name }}</span>
                  <span class="text-xs text-stone-400 font-mono">{{ shot.target_phone }}</span>
                </div>
              </div>
            </td>
            <td class="text-right">
              <span class="font-mono font-bold text-stone-900">{{ formatGHS(shot.amount_paid) }}</span>
            </td>
            <td>
              <span class="status-pill" :class="shot.payment_status">
                <span class="dot"></span> {{ shot.payment_status }}
              </span>
            </td>
            <td>
              <span class="status-pill" :class="shotStatusClass(shot.status)">
                <span class="dot"></span> {{ shot.status?.replace('_', ' ') }}
              </span>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-1">
                <button 
                  v-if="shot.payment_status === 'success'"
                  class="btn-icon group-hover:visible invisible" 
                  @click="resendSms(shot.id)" 
                  :disabled="resendingSms === shot.id"
                  title="Resend SMS"
                  :class="{ 'animate-pulse text-rose-500': resendingSms === shot.id }"
                >
                  <svg v-if="resendingSms === shot.id" class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </button>
                <button 
                  v-if="shot.message || shot.hints?.length" 
                  class="btn-icon group-hover:visible invisible" 
                  @click="selectedShot = shot" 
                  title="View Details"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shot Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedShot" class="modal-overlay" @click.self="selectedShot = null">
        <div class="modal--receipt slide-in-up">
          <div class="modal__header">
            <h2 class="modal__title">Shot Details</h2>
            <button class="modal__close" @click="selectedShot = null">×</button>
          </div>
          <div class="modal__content p-6 space-y-5">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-xs font-bold uppercase text-stone-400 mb-1">Shooter</p>
                <p class="font-bold text-stone-900">{{ selectedShot.shooter_name }}</p>
                <p class="text-xs text-stone-500 font-mono">{{ selectedShot.shooter_phone }}</p>
                <p class="text-xs text-stone-500">{{ selectedShot.shooter_email }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold uppercase text-stone-400 mb-1">Target</p>
                <p class="font-bold text-stone-900">{{ selectedShot.target_name }}</p>
                <p class="text-xs text-stone-500 font-mono">{{ selectedShot.target_phone }}</p>
              </div>
            </div>

            <div v-if="selectedShot.hints?.length" class="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p class="text-xs font-bold uppercase text-stone-400 tracking-wider mb-3">🕵️ Mystery Clues</p>
              <div class="space-y-2">
                <div v-for="(hint, i) in selectedShot.hints" :key="i" class="flex items-start gap-2 text-sm">
                  <span class="text-base shrink-0">{{ hint.emoji }}</span>
                  <div>
                    <p class="text-xs text-stone-400">{{ hint.question }}</p>
                    <p class="font-medium text-stone-800">"{{ hint.answer }}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedShot.message" class="bg-rose-50 rounded-xl p-4 border border-rose-100">
              <p class="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">💌 Personal Message</p>
              <p class="text-sm text-stone-700 italic">"{{ selectedShot.message }}"</p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs font-bold uppercase text-stone-400">Amount</p>
                <p class="font-mono font-bold">{{ formatGHS(selectedShot.amount_paid) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase text-stone-400">Payment Ref</p>
                <p class="font-mono text-stone-600 text-xs">{{ selectedShot.payment_ref || '—' }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase text-stone-400">Viewed At</p>
                <p class="text-stone-700">{{ selectedShot.viewed_at ? formatDate(selectedShot.viewed_at) : '—' }}</p>
              </div>
              <div>
                <p class="text-xs font-bold uppercase text-stone-400">Unlocked At</p>
                <p class="text-stone-700">{{ selectedShot.unlocked_at ? formatDate(selectedShot.unlocked_at) : '—' }}</p>
              </div>
            </div>
          </div>
          <div class="p-4 bg-stone-50 border-t border-stone-100">
            <button class="btn-secondary w-full" @click="selectedShot = null">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Shots' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const loading = ref(true)
const shots = ref<any[]>([])
const activeFilter = ref('all')
const paymentFilter = ref('')
const searchQuery = ref('')
const selectedShot = ref<any>(null)
const resendingSms = ref<string | null>(null)

const resendSms = async (shotId: string) => {
  if (resendingSms.value) return
  if (!confirm('Are you sure you want to resend the SMS for this shot?')) return

  resendingSms.value = shotId
  try {
    const result = await $fetch('/api/admin/shots/resend-sms', {
      method: 'POST',
      body: { shotId }
    }) as any
    
    if (result.success) {
      alert(result.message)
    }
  } catch (err: any) {
    alert(err.data?.message || 'Failed to resend SMS')
  } finally {
    resendingSms.value = null
  }
}

const stats = computed(() => ({
  total: shots.value.length,
  unlocked: shots.value.filter(s => s.status === 'unlocked').length,
  sent: shots.value.filter(s => s.status === 'sent' || s.status === 'viewed').length,
  paid: shots.value.filter(s => s.payment_status === 'success').length,
  revenue: shots.value
    .filter(s => s.payment_status === 'success')
    .reduce((sum, s) => sum + Number(s.amount_paid || 0), 0)
}))

const filteredShots = computed(() => {
  let result = shots.value

  if (activeFilter.value !== 'all') {
    result = result.filter(s => s.status === activeFilter.value)
  }

  if (paymentFilter.value) {
    result = result.filter(s => s.payment_status === paymentFilter.value)
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.shooter_name?.toLowerCase().includes(q) ||
      s.shooter_phone?.includes(q) ||
      s.shooter_email?.toLowerCase().includes(q) ||
      s.target_name?.toLowerCase().includes(q) ||
      s.target_phone?.includes(q)
    )
  }

  return result
})

const shotStatusClass = (status: string) => {
  switch (status) {
    case 'unlocked': return 'unlocked'
    case 'sent': return 'sent'
    case 'viewed': return 'viewed'
    case 'awaiting_payment': return 'awaiting'
    case 'expired': return 'expired'
    default: return 'default'
  }
}

const formatGHS = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

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

const exportShots = () => {
  const csv = [
    ['Date', 'Shooter', 'Shooter Phone', 'Shooter Email', 'Target', 'Target Phone', 'Amount', 'Payment Status', 'Status', 'Message'].join(','),
    ...shots.value.map(s => [
      new Date(s.created_at).toISOString(),
      s.shooter_name,
      s.shooter_phone,
      s.shooter_email,
      s.target_name,
      s.target_phone,
      s.amount_paid,
      s.payment_status,
      s.status,
      `"${(s.message || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `shots-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) shots.value = data
    if (error) console.error('Failed to fetch shots:', error)
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
.stat-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.stat-card.success { border-left: 4px solid #10B981; }
.stat-card.info { border-left: 4px solid #3B82F6; }
.stat-card.accent { border-left: 4px solid #F59E0B; }
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
.status-pill.success { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.status-pill.success .dot { background: #059669; }
.status-pill.pending { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.pending .dot { background: #D97706; }
.status-pill.failed { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
.status-pill.failed .dot { background: #DC2626; }
.status-pill.unlocked { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.status-pill.unlocked .dot { background: #059669; }
.status-pill.sent { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.sent .dot { background: #D97706; }
.status-pill.viewed { background: #EFF6FF; color: #2563EB; border: 1px solid #93C5FD; }
.status-pill.viewed .dot { background: #2563EB; }
.status-pill.awaiting { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.awaiting .dot { background: #6B7280; }
.status-pill.expired { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.expired .dot { background: #6B7280; }
.status-pill.default { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.default .dot { background: #6B7280; }

/* Buttons */
.btn-primary { display: flex; align-items: center; padding: 0.625rem 1rem; background: #111827; color: white; border-radius: 8px; font-weight: 600; font-size: 0.875rem; transition: background 0.2s; }
.btn-primary:hover { background: #374151; }
.btn-secondary { padding: 0.625rem 1rem; background: white; border: 1px solid #E5E7EB; color: #374151; border-radius: 8px; font-weight: 600; font-size: 0.875rem; transition: all 0.2s; }
.btn-secondary:hover { background: #F9FAFB; border-color: #D1D5DB; }
.btn-icon { padding: 6px; color: #6B7280; border-radius: 6px; transition: all 0.2s; }
.btn-icon:hover { background: #F3F4F6; color: #111827; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal--receipt { width: 100%; max-width: 480px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.slide-in-up { animation: slideUp 0.2s ease-out; }
.modal__header { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; }
.modal__title { margin: 0; font-size: 1rem; font-weight: 700; }
.modal__close { font-size: 1.5rem; color: #6B7280; cursor: pointer; padding: 0 0.25rem; }
.modal__close:hover { color: #111827; }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
