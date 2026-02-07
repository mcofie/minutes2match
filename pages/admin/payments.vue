<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Payments & Revenue</h1>
        <p class="page-subtitle">Track real-time transactions and financial health</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="exportPayments">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export CSV
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card success">
        <div class="stat-icon">💰</div>
        <div>
          <p class="stat-label">Today's Revenue</p>
          <p class="stat-value font-mono">{{ formatGHS(stats.todayRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">📅</div>
        <div>
          <p class="stat-label">This Week</p>
          <p class="stat-value font-mono">{{ formatGHS(stats.weekRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card accent">
        <div class="stat-icon">📊</div>
        <div>
          <p class="stat-label">This Month</p>
          <p class="stat-value font-mono">{{ formatGHS(stats.monthRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card danger" v-if="stats.failedCount > 0">
        <div class="stat-icon">⚠️</div>
        <div>
          <p class="stat-label">Failed Payments</p>
          <p class="stat-value">{{ stats.failedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div v-if="alerts.length > 0" class="alerts-section">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title text-amber-800 flex items-center gap-2">
          <span class="animate-pulse">⚠️</span> Action Required
        </h2>
      </div>
      <div class="grid gap-3">
        <div v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div class="flex items-center gap-4 flex-1">
             <div class="p-2 bg-red-100 text-red-600 rounded-lg">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             </div>
             <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-stone-900">{{ alert.alert_type }}</span>
                  <span class="text-xs font-mono bg-stone-100 px-1 py-0.5 rounded text-stone-500">{{ alert.payment_ref }}</span>
                </div>
                <p class="text-sm text-stone-600">{{ alert.error_message }}</p>
             </div>
          </div>
          <button class="btn-sm whitespace-nowrap" @click="resolveAlert(alert.id)">Mark Resolved</button>
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
          placeholder="Search ref, user, or phone..." 
          class="search-input"
        />
      </div>
      
      <div class="flex gap-2">
        <select v-model="filters.status" class="form-select">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select v-model="filters.purpose" class="form-select">
          <option value="">All Types</option>
          <option value="event_ticket">Event Tickets</option>
          <option value="match_unlock">Match Unlocks</option>
        </select>
        <!-- Date Inputs could go here if needed, keeping it simple for now -->
      </div>
    </div>

    <!-- Payments Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Transaction Date</th>
            <th>Details</th>
            <th>Customer</th>
            <th class="text-right">Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-stone-400">
              <div class="flex flex-col items-center gap-2">
                <span class="animate-spin text-2xl">⏳</span>
                <span>Loading transactions...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredPayments.length === 0">
            <td colspan="6" class="text-center py-16 text-stone-400">
               <div class="flex flex-col items-center gap-3">
                <span class="text-3xl opacity-50">🧾</span>
                <span class="font-medium">No transactions found</span>
              </div>
            </td>
          </tr>
          <tr v-for="payment in filteredPayments" :key="payment.id" class="group hover:bg-stone-50 transition-colors">
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900">{{ formatDate(payment.created_at) }}</span>
                <span class="text-xs text-stone-400 font-mono">{{ formatTime(payment.created_at) }}</span>
              </div>
            </td>
            <td>
              <div class="flex flex-col gap-1">
                 <div class="flex items-center gap-2">
                    <span 
                      class="purpose-icon" 
                      :class="payment.purpose === 'event_ticket' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'"
                    >
                      {{ payment.purpose === 'event_ticket' ? '🎟️' : '💕' }}
                    </span>
                    <span class="text-sm font-medium text-stone-700 capitalize">
                      {{ payment.purpose?.replace('_', ' ') }}
                    </span>
                 </div>
                 <span class="text-xs font-mono text-stone-400">{{ payment.provider_ref }}</span>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-3">
                <div class="user-avatar-sm bg-stone-100 text-stone-600">
                  {{ payment.user?.display_name?.charAt(0) || '?' }}
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-stone-900">{{ payment.user?.display_name || 'Unknown' }}</span>
                  <span class="text-xs text-stone-400 font-mono">{{ payment.user?.phone }}</span>
                </div>
              </div>
            </td>
            <td class="text-right">
              <span class="font-mono font-bold text-stone-900">{{ formatGHS(payment.amount) }}</span>
            </td>
            <td>
              <span class="status-pill" :class="payment.status">
                <span class="dot"></span> {{ payment.status }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn-icon group-hover:visible invisible" @click="viewPaymentDetails(payment)" title="View Receipt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
     <div v-if="totalPages > 1" class="mt-4 flex justify-between items-center text-sm text-stone-500">
      <span>Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalPayments) }} of {{ totalPayments }}</span>
      <div class="flex gap-2">
        <button 
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded hover:bg-white disabled:opacity-50"
        >Prev</button>
        <button 
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border rounded hover:bg-white disabled:opacity-50"
        >Next</button>
      </div>
    </div>

    <!-- Payment Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedPayment" class="modal-overlay" @click.self="selectedPayment = null">
        <div class="modal modal--receipt slide-in-up">
          <div class="modal__header">
            <h2 class="modal__title">Transaction Receipt</h2>
            <button class="modal__close" @click="selectedPayment = null">×</button>
          </div>
          
          <div class="modal__content">
            <div class="receipt-header">
               <div class="receipt-icon">🧾</div>
               <div class="receipt-amount">{{ formatGHS(selectedPayment.amount) }}</div>
               <div class="status-pill large" :class="selectedPayment.status">
                 <span class="dot"></span> {{ selectedPayment.status }}
               </div>
            </div>

            <div class="receipt-body">
              <div class="detail-row">
                 <span class="label">Date</span>
                 <span class="value">{{ new Date(selectedPayment.created_at).toLocaleString() }}</span>
              </div>
              <div class="detail-row">
                 <span class="label">Reference</span>
                 <span class="value font-mono">{{ selectedPayment.provider_ref }}</span>
              </div>
              <div class="detail-row">
                 <span class="label">Product</span>
                 <span class="value capitalize">{{ selectedPayment.purpose?.replace('_', ' ') }}</span>
              </div>
              <div class="divider"></div>
              <div class="detail-row">
                 <span class="label">Customer</span>
                 <span class="value">{{ selectedPayment.user?.display_name }}</span>
              </div>
              <div class="detail-row">
                 <span class="label">Phone</span>
                 <span class="value font-mono">{{ selectedPayment.user?.phone }}</span>
              </div>
              
              <div v-if="selectedPayment.metadata" class="mt-6">
                 <p class="text-xs font-bold uppercase text-stone-400 mb-2">Technical Metadata</p>
                 <pre class="bg-stone-50 p-3 rounded border border-stone-200 text-xs overflow-auto font-mono text-stone-600">{{ JSON.stringify(selectedPayment.metadata, null, 2) }}</pre>
              </div>
            </div>
            
            <div class="receipt-footer">
               <button class="btn-secondary w-full" @click="selectedPayment = null">Close Receipt</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Payments' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const currentPage = ref(1)
const pageSize = ref(15)
const totalPayments = ref(0)
const loading = ref(true)
const payments = ref<any[]>([])
const alerts = ref<any[]>([])
const selectedPayment = ref<any>(null)
const searchQuery = ref('')

const stats = ref({
  todayRevenue: 0,
  weekRevenue: 0,
  monthRevenue: 0,
  failedCount: 0
})

const filters = reactive({
  status: '',
  purpose: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const totalPages = computed(() => Math.ceil(totalPayments.value / pageSize.value))

const filteredPayments = computed(() => {
  if (!searchQuery.value) return payments.value
  
  const query = searchQuery.value.toLowerCase()
  return payments.value.filter(p => 
    p.provider_ref?.toLowerCase().includes(query) ||
    p.user?.display_name?.toLowerCase().includes(query) ||
    p.user?.phone?.includes(query)
  )
})

// Formatters
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

// Data Fetching
const fetchPayments = async () => {
  loading.value = true
  
  let query = supabase
    .from('payments')
    .select('*, user:profiles!payments_user_id_fkey(id, display_name, phone)', { count: 'exact' })
  
  // Apply filters
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.purpose) query = query.eq('purpose', filters.purpose)
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo + 'T23:59:59')
  
  // Apply Pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)
  
  if (error) {
    console.error('Error fetching payments:', error)
  }

  payments.value = data || []
  totalPayments.value = count || 0
  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPayments()
}

// Watch filters
watch(filters, () => {
  currentPage.value = 1
  fetchPayments()
}, { deep: true })

const fetchAlerts = async () => {
  const { data } = await supabase
    .from('payment_alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(10)
  
  alerts.value = data || []
}

const fetchStats = async () => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  // Helper for summing
  const sumAmount = (data: any[]) => (data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  // Today
  const { data: todayData } = await supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', todayStart)
  stats.value.todayRevenue = sumAmount(todayData || [])
  
  // Week
  const { data: weekData } = await supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', weekStart)
  stats.value.weekRevenue = sumAmount(weekData || [])
  
  // Month
  const { data: monthData } = await supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', monthStart)
  stats.value.monthRevenue = sumAmount(monthData || [])
  
  // Failed count
  const { count } = await supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', weekStart)
  stats.value.failedCount = count || 0
}

const resolveAlert = async (alertId: string) => {
  await supabase
    .from('payment_alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', alertId)
  
  await fetchAlerts()
}

const viewPaymentDetails = (payment: any) => {
  selectedPayment.value = payment
}

const exportPayments = () => {
  const csv = [
    ['Date', 'Reference', 'User', 'Purpose', 'Amount', 'Status'].join(','),
    ...payments.value.map(p => [
      new Date(p.created_at).toISOString(),
      p.provider_ref,
      p.user?.display_name || 'Unknown',
      p.purpose,
      p.amount,
      p.status
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

onMounted(() => {
  fetchPayments()
  fetchAlerts()
  fetchStats()
})
</script>

<style scoped>
/* Layout */
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
}

.page-subtitle {
  color: #6B7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.stat-card.success { border-left: 4px solid #10B981; }
.stat-card.info { border-left: 4px solid #3B82F6; }
.stat-card.accent { border-left: 4px solid #8B5CF6; }
.stat-card.danger { border-left: 4px solid #EF4444; }

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 50%;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

/* Alerts */
.alerts-section {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #F3F4F6;
  gap: 1rem;
}

/* Controls */
.filters-bar {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9CA3AF;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3B82F6;
}

.form-select {
  padding: 0.625rem 2rem 0.625rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: white;
  min-width: 140px;
  color: #374151;
}

/* Table */
.table-container {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #F3F4F6;
  font-size: 0.875rem;
}

.purpose-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill.large {
  padding: 4px 12px;
  font-size: 0.875rem;
}

.status-pill.success { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.status-pill.success .dot { background: #059669; }

.status-pill.pending { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.pending .dot { background: #D97706; }

.status-pill.failed { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
.status-pill.failed .dot { background: #DC2626; }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.btn-primary {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  background: #111827;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-secondary {
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  color: #374151;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.btn-icon {
  padding: 6px;
  color: #6B7280;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #F3F4F6;
  color: #111827;
}

/* Modal Receipt */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal--receipt {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.slide-in-up {
  animation: slideUp 0.2s ease-out;
}

.modal__header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
}

.modal__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.receipt-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0 1.5rem;
}

.receipt-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.receipt-amount {
  font-size: 2rem;
  font-weight: 800;
  font-family: monospace;
  color: #111827;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
}

.receipt-body {
  padding: 0 1.5rem 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.detail-row .label { color: #6B7280; }
.detail-row .value { color: #111827; font-weight: 500; }

.divider {
  height: 1px;
  background: #E5E7EB;
  margin: 1rem 0;
  border-top: 1px dashed #E5E7EB;
}

.receipt-footer {
  padding: 1.5rem;
  background: #F9FAFB;
  border-top: 1px solid #F3F4F6;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
