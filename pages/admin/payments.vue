<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Payments</h1>
        <p class="page-subtitle">Payment log and revenue tracking</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportPayments">
          📥 Export CSV
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-emerald-100 text-emerald-600">💰</div>
        <div>
          <p class="stat-label">Today's Revenue</p>
          <p class="stat-value">{{ formatGHS(stats.todayRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600">📅</div>
        <div>
          <p class="stat-label">This Week</p>
          <p class="stat-value">{{ formatGHS(stats.weekRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-purple-100 text-purple-600">📊</div>
        <div>
          <p class="stat-label">This Month</p>
          <p class="stat-value">{{ formatGHS(stats.monthRevenue) }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-red-100 text-red-600">⚠️</div>
        <div>
          <p class="stat-label">Failed Payments</p>
          <p class="stat-value">{{ stats.failedCount }}</p>
        </div>
      </div>
    </div>

    <!-- Alerts Section -->
    <div v-if="alerts.length > 0" class="alerts-section">
      <h2 class="section-title">⚠️ Unresolved Alerts</h2>
      <div class="alerts-list">
        <div v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div class="alert-content">
            <span class="alert-badge" :class="getAlertClass(alert.alert_type)">
              {{ alert.alert_type }}
            </span>
            <span class="alert-ref">{{ alert.payment_ref }}</span>
            <span class="alert-amount" v-if="alert.amount">{{ formatGHS(alert.amount) }}</span>
            <span class="alert-message">{{ alert.error_message }}</span>
            <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
          </div>
          <button class="btn-sm" @click="resolveAlert(alert.id)">✓ Resolve</button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
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
      <input 
        type="date" 
        v-model="filters.dateFrom" 
        class="form-input"
        placeholder="From Date"
      />
      <input 
        type="date" 
        v-model="filters.dateTo" 
        class="form-input"
        placeholder="To Date"
      />
      <button class="btn-secondary" @click="fetchPayments">Apply</button>
    </div>

    <!-- Payments Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>User</th>
            <th>Purpose</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-8 text-stone-400">Loading...</td>
          </tr>
          <tr v-else-if="payments.length === 0">
            <td colspan="7" class="text-center py-8 text-stone-400">No payments found</td>
          </tr>
          <tr v-for="payment in payments" :key="payment.id">
            <td>{{ formatDate(payment.created_at) }}</td>
            <td class="font-mono text-xs">{{ payment.provider_ref?.slice(0, 12) }}...</td>
            <td>
              <div class="flex items-center gap-2">
                <span class="user-avatar-sm">{{ payment.user?.display_name?.charAt(0) || '?' }}</span>
                <span>{{ payment.user?.display_name || 'Unknown' }}</span>
              </div>
            </td>
            <td>
              <span class="purpose-badge" :class="payment.purpose === 'event_ticket' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
                {{ payment.purpose === 'event_ticket' ? '🎟️ Ticket' : '💕 Match' }}
              </span>
            </td>
            <td class="font-bold">{{ formatGHS(payment.amount) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(payment.status)">
                {{ payment.status }}
              </span>
            </td>
            <td>
              <button class="btn-sm" @click="viewPaymentDetails(payment)">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedPayment" class="modal-overlay" @click.self="selectedPayment = null">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">Payment Details</h2>
            <button class="modal__close" @click="selectedPayment = null">×</button>
          </div>
          <div class="modal__content">
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">Reference</span>
                <span class="detail-value font-mono">{{ selectedPayment.provider_ref }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value font-bold text-lg">{{ formatGHS(selectedPayment.amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="status-badge" :class="getStatusClass(selectedPayment.status)">{{ selectedPayment.status }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Purpose</span>
                <span class="detail-value">{{ selectedPayment.purpose }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">User</span>
                <span class="detail-value">{{ selectedPayment.user?.display_name }} ({{ selectedPayment.user?.phone }})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ formatDate(selectedPayment.created_at) }}</span>
              </div>
            </div>
            <div v-if="selectedPayment.metadata" class="mt-4">
              <p class="detail-label mb-2">Metadata</p>
              <pre class="bg-stone-100 p-3 rounded-lg text-xs overflow-auto">{{ JSON.stringify(selectedPayment.metadata, null, 2) }}</pre>
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

const loading = ref(true)
const payments = ref<any[]>([])
const alerts = ref<any[]>([])
const selectedPayment = ref<any>(null)

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

const formatGHS = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'success': return 'bg-emerald-100 text-emerald-700'
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'failed': return 'bg-red-100 text-red-700'
    default: return 'bg-stone-100 text-stone-700'
  }
}

const getAlertClass = (type: string) => {
  switch (type) {
    case 'payment_failed': return 'bg-red-100 text-red-700'
    case 'verification_error': return 'bg-orange-100 text-orange-700'
    case 'webhook_error': return 'bg-yellow-100 text-yellow-700'
    case 'refund_needed': return 'bg-purple-100 text-purple-700'
    default: return 'bg-stone-100 text-stone-700'
  }
}

const fetchPayments = async () => {
  loading.value = true
  
  let query = supabase
    .from('payments')
    .select('*, user:profiles!payments_user_id_fkey(id, display_name, phone)')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.purpose) query = query.eq('purpose', filters.purpose)
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
  if (filters.dateTo) query = query.lte('created_at', filters.dateTo + 'T23:59:59')
  
  const { data } = await query
  payments.value = data || []
  loading.value = false
}

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
  
  // Today's revenue
  const { data: todayData } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'success')
    .gte('created_at', todayStart)
  
  stats.value.todayRevenue = (todayData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  
  // Week revenue
  const { data: weekData } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'success')
    .gte('created_at', weekStart)
  
  stats.value.weekRevenue = (weekData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  
  // Month revenue
  const { data: monthData } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'success')
    .gte('created_at', monthStart)
  
  stats.value.monthRevenue = (monthData || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  
  // Failed count
  const { count } = await supabase
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', weekStart)
  
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.alerts-section {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  gap: 1rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.alert-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
}

.alert-ref {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.alert-amount {
  font-weight: 700;
}

.alert-message {
  color: #dc2626;
  font-size: 0.875rem;
}

.alert-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.filters-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters-bar .form-select,
.filters-bar .form-input {
  min-width: 150px;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  background: #f9fafb;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.data-table tr:hover {
  background: #f9fafb;
}

.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.purpose-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-sm:hover {
  background: #f3f4f6;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.detail-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: #111827;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
</style>
