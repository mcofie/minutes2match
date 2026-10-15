<template>
  <div class="ad-page">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Payments</h1>
        <p class="ad-sub">Revenue, transactions and active subscriptions.</p>
      </div>
      <div class="ad-actions">
        <div class="ad-tabs" role="tablist" aria-label="Period">
          <button
            v-for="p in periods"
            :key="p.key"
            role="tab"
            :aria-selected="selectedPeriod === p.key"
            class="ad-tab"
            :class="{ 'is-active': selectedPeriod === p.key }"
            @click="selectedPeriod = p.key"
          >{{ p.label }}</button>
        </div>
      </div>
    </header>

    <div v-if="selectedPeriod === 'custom'" class="ad-toolbar justify-end">
      <input v-model="filters.dateFrom" type="date" class="ad-select !pr-4 !bg-none" aria-label="From" />
      <span class="ad-faint text-sm">to</span>
      <input v-model="filters.dateTo" type="date" class="ad-select !pr-4 !bg-none" aria-label="To" />
    </div>

    <div class="ad-stats">
      <div class="ad-stat">
        <div class="ad-stat__label">Revenue</div>
        <div class="ad-stat__value">{{ formatGHS(stats.periodRevenue) }}</div>
        <div class="ad-stat__hint">{{ periodLabel }}</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">Success rate</div>
        <div class="ad-stat__value">{{ stats.successRate }}%</div>
        <div class="ad-stat__hint">of all payment attempts</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">Average order</div>
        <div class="ad-stat__value">{{ formatGHS(stats.avgOrderValue) }}</div>
        <div class="ad-stat__hint">successful payments</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">All-time revenue</div>
        <div class="ad-stat__value">{{ formatGHS(stats.totalRevenue) }}</div>
        <div class="ad-stat__hint">{{ formatGHS(stats.todayRevenue) }} today</div>
      </div>
    </div>

    <!-- Revenue by product -->
    <section class="ad-panel mb-7">
      <div class="mb-4 flex items-baseline justify-between gap-4">
        <h2 class="ad-label !mb-0">Revenue by product</h2>
        <span class="text-xs ad-faint">{{ periodLabel }}</span>
      </div>
      <template v-if="splitRows.length">
        <div class="flex h-2.5 w-full overflow-hidden rounded-full bg-[#f1efec]">
          <div
            v-for="row in splitRows"
            :key="row.key"
            class="h-full transition-[width] duration-700"
            :style="{ width: row.pct + '%', background: row.color }"
            :title="`${row.label}: ${formatGHS(row.value)}`"
          ></div>
        </div>
        <ul class="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="row in splitRows" :key="row.key" class="flex items-center gap-3 text-sm">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ background: row.color }"></span>
            <span class="flex-1 ad-muted">{{ row.label }}</span>
            <span class="ad-num font-medium">{{ formatGHS(row.value) }}</span>
            <span class="ad-num w-10 text-right text-xs ad-faint">{{ row.pct }}%</span>
          </li>
        </ul>
      </template>
      <p v-else class="text-sm ad-faint">No revenue in this period.</p>
    </section>

    <!-- Payment alerts -->
    <section v-if="alerts.length > 0" class="ad-panel mb-7">
      <h2 class="ad-label flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-[#ed1c24]"></span>Needs attention</h2>
      <ul>
        <li v-for="alert in alerts" :key="alert.id" class="ad-kv !items-center">
          <div class="min-w-0 !text-[#393737]">
            <p class="font-semibold">{{ alert.alert_type }} <span class="ml-1 font-mono text-xs font-normal ad-faint">{{ alert.payment_ref }}</span></p>
            <p class="mt-0.5 text-sm ad-muted">{{ alert.error_message }}</p>
          </div>
          <div><button class="btn-secondary btn-sm" @click="resolveAlert(alert.id)">Mark resolved</button></div>
        </li>
      </ul>
    </section>

    <div class="ad-toolbar">
      <div class="ad-tabs" role="tablist">
        <button role="tab" :aria-selected="activeTab === 'transactions'" class="ad-tab" :class="{ 'is-active': activeTab === 'transactions' }" @click="activeTab = 'transactions'">Transactions</button>
        <button role="tab" :aria-selected="activeTab === 'subscriptions'" class="ad-tab" :class="{ 'is-active': activeTab === 'subscriptions' }" @click="activeTab = 'subscriptions'">Subscriptions</button>
      </div>

      <template v-if="activeTab === 'transactions'">
        <label class="ad-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
          <input v-model="searchQuery" type="search" placeholder="Search reference, name or phone" aria-label="Search transactions" />
        </label>
        <select v-model="filters.status" class="ad-select" aria-label="Status">
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select v-model="filters.purpose" class="ad-select" aria-label="Product">
          <option value="">All products</option>
          <option value="event_ticket">Event tickets</option>
          <option value="match_unlock">Match unlocks</option>
          <option value="subscription">Subscriptions</option>
          <option value="spark_deck">Spark decks</option>
          <option value="shoot_your_shot">Shoot your shot</option>
        </select>
        <button class="btn-ghost" @click="exportPayments">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </template>

      <template v-else>
        <label class="ad-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
          <input v-model="subSearchQuery" type="search" placeholder="Search subscriber name or phone" aria-label="Search subscriptions" />
        </label>
        <span class="text-sm ad-muted">
          {{ subMetrics.expiringSoon }} expiring within 48h · {{ subscriptions.filter((s: any) => s.auto_renew).length }} auto-renewing
        </span>
        <button v-if="subMetrics.expiringSoon > 0" class="btn-primary btn-sm" :disabled="isRemindingAll" @click="bulkRemindExpiring">
          {{ isRemindingAll ? 'Sending…' : `Remind ${subMetrics.expiringSoon} expiring` }}
        </button>
      </template>
    </div>

    <!-- Transactions -->
    <div v-if="activeTab === 'transactions'">
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer</th>
              <th class="ad-right">Amount</th>
              <th>Status</th>
              <th class="ad-right"><span class="sr-only">Receipt</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6"><div class="ad-empty"><span class="ad-spinner"></span></div></td>
            </tr>
            <tr v-else-if="filteredPayments.length === 0">
              <td colspan="6">
                <div class="ad-empty">
                  <p class="ad-empty__title">No transactions</p>
                  <p>Try another filter or period.</p>
                </div>
              </td>
            </tr>
            <template v-else>
              <tr v-for="payment in filteredPayments" :key="payment.id" class="is-clickable" @click="viewPaymentDetails(payment)">
                <td class="ad-num">
                  {{ formatDate(payment.created_at) }}
                  <span class="block text-xs ad-faint">{{ formatTime(payment.created_at) }}</span>
                </td>
                <td>
                  <span class="font-medium">{{ purposeLabel(payment.purpose) }}</span>
                  <span class="block font-mono text-[11px] ad-faint">{{ payment.provider_ref }}</span>
                </td>
                <td>
                  <div class="ad-person">
                    <span class="ad-avatar ad-avatar--sm">{{ payment.user?.display_name?.charAt(0) || '?' }}</span>
                    <div class="min-w-0">
                      <span class="ad-person__name !font-medium">{{ payment.user?.display_name || 'Unknown' }}</span>
                      <span class="ad-person__meta">{{ payment.user?.phone }}</span>
                    </div>
                  </div>
                </td>
                <td class="ad-right ad-num font-semibold">{{ formatGHS(payment.amount) }}</td>
                <td><span class="ad-pill" :class="paymentPill[payment.status]">{{ payment.status }}</span></td>
                <td class="ad-right">
                  <button class="ad-icon-btn" title="View receipt" aria-label="View receipt" @click.stop="viewPaymentDetails(payment)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="ad-pager">
        <span>{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalPayments) }} of {{ totalPayments }}</span>
        <div class="ad-pager__buttons">
          <button class="btn-secondary btn-sm" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">Previous</button>
          <button class="btn-secondary btn-sm" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>

    <!-- Subscriptions -->
    <div v-else class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Subscriber</th>
            <th>Period</th>
            <th>Status</th>
            <th class="ad-right"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loadingSubs">
            <td colspan="4"><div class="ad-empty"><span class="ad-spinner"></span></div></td>
          </tr>
          <tr v-else-if="filteredSubs.length === 0">
            <td colspan="4">
              <div class="ad-empty">
                <p class="ad-empty__title">No active subscriptions</p>
                <p>{{ subSearchQuery ? 'No subscribers match your search.' : 'Active subscribers will show up here.' }}</p>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="sub in filteredSubs" :key="sub.id">
              <td>
                <div class="ad-person">
                  <span class="ad-avatar">{{ sub.user?.display_name?.charAt(0) || '?' }}</span>
                  <div class="min-w-0">
                    <span class="ad-person__name">{{ sub.user?.display_name || 'Member' }}</span>
                    <span class="ad-person__meta">{{ sub.user?.phone }}</span>
                  </div>
                </div>
              </td>
              <td class="ad-num">
                {{ formatDate(sub.start_date) }} – <span :class="isExpiringSoon(sub.end_date) ? 'font-semibold text-[#b4232a]' : ''">{{ formatDate(sub.end_date) }}</span>
              </td>
              <td>
                <span v-if="isExpired(sub.end_date)" class="ad-pill">Lapsed</span>
                <span v-else-if="isExpiringSoon(sub.end_date)" class="ad-pill ad-pill--amber">Expires soon</span>
                <span v-else class="ad-pill ad-pill--green">Active</span>
                <span v-if="sub.auto_renew && !isExpired(sub.end_date)" class="block mt-1 text-xs ad-faint">Auto-renews</span>
              </td>
              <td class="ad-right">
                <button class="btn-secondary btn-sm" :disabled="sendingReminderId === sub.id" @click="sendSubReminder(sub)">
                  {{ sendingReminderId === sub.id ? 'Sending…' : 'Send reminder' }}
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Receipt -->
    <Teleport to="body">
      <div v-if="selectedPayment" class="m2m-app m2m-admin modal-overlay" @click.self="selectedPayment = null">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <div class="modal__header">
            <h2 id="receipt-title" class="modal__title">Receipt</h2>
            <button class="modal__close" aria-label="Close" @click="selectedPayment = null">×</button>
          </div>

          <div class="modal__content">
            <div class="mb-6 text-center">
              <p class="font-display text-[2.5rem] leading-none tracking-tight">{{ formatGHS(selectedPayment.amount) }}</p>
              <span class="ad-pill mt-3" :class="paymentPill[selectedPayment.status]">{{ selectedPayment.status }}</span>
            </div>

            <div class="ad-kv"><span>Date</span><span class="ad-num">{{ new Date(selectedPayment.created_at).toLocaleString('en-GB') }}</span></div>
            <div class="ad-kv"><span>Product</span><span>{{ purposeLabel(selectedPayment.purpose) }}</span></div>
            <div class="ad-kv"><span>Reference</span><span class="font-mono text-xs">{{ selectedPayment.provider_ref }}</span></div>
            <div class="ad-kv"><span>Customer</span><span>{{ selectedPayment.user?.display_name || 'Unknown' }}</span></div>
            <div class="ad-kv"><span>Phone</span><span class="ad-num">{{ selectedPayment.user?.phone || '—' }}</span></div>

            <details v-if="selectedPayment.metadata" class="mt-5">
              <summary class="cursor-pointer text-sm ad-muted">Raw metadata</summary>
              <pre class="mt-2 max-h-64 overflow-auto rounded-2xl bg-[#f6f4f1] p-4 font-mono text-xs text-[#524e4b]">{{ JSON.stringify(selectedPayment.metadata, null, 2) }}</pre>
            </details>
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

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()

const PRODUCTS: Record<string, { label: string; color: string }> = {
  event_ticket: { label: 'Event tickets', color: '#393737' },
  match_unlock: { label: 'Match unlocks', color: '#ed1c24' },
  subscription: { label: 'Subscriptions', color: '#f29a8f' },
  spark_deck: { label: 'Spark decks', color: '#c9b8a6' },
  shoot_your_shot: { label: 'Shoot your shot', color: '#8d857c' }
}

const PURPOSE_LABELS: Record<string, string> = {
  event_ticket: 'Event ticket',
  match_unlock: 'Match unlock',
  subscription: 'Subscription',
  premium_sub: 'Subscription',
  spark_deck: 'Spark deck',
  shoot_your_shot: 'Shoot your shot'
}

const purposeLabel = (purpose: string) =>
  PURPOSE_LABELS[purpose] || (purpose ? purpose.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) : 'Payment')

const paymentPill: Record<string, string> = {
  success: 'ad-pill--green',
  pending: 'ad-pill--amber',
  failed: 'ad-pill--red'
}

const periods = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: '7 days' },
  { key: 'month', label: 'This month' },
  { key: 'total', label: 'All time' },
  { key: 'custom', label: 'Custom' }
]

// State
const currentPage = ref(1)
const pageSize = ref(15)
const totalPayments = ref(0)
const loading = ref(true)
const payments = ref<any[]>([])
const alerts = ref<any[]>([])
const selectedPayment = ref<any>(null)
const searchQuery = ref('')
const subSearchQuery = ref('')
const activeTab = ref('transactions') // 'transactions' | 'subscriptions'
const selectedPeriod = ref('total') // 'today' | 'week' | 'month' | 'total' | 'custom'

const subscriptions = ref<any[]>([])
const loadingSubs = ref(false)
const sendingReminderId = ref<string | null>(null)

const stats = ref({
  todayRevenue: 0,
  periodRevenue: 0,
  totalRevenue: 0,
  failedCount: 0,
  successRate: 0,
  avgOrderValue: 0,
  growth: {
    today: 0
  },
  revenueSplit: {
    event_ticket: 0,
    match_unlock: 0,
    subscription: 0,
    spark_deck: 0,
    shoot_your_shot: 0
  }
})

const subMetrics = ref({
  total: 0,
  expiringSoon: 0,
  newToday: 0
})

const isRemindingAll = ref(false)

const filters = reactive({
  status: '',
  purpose: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const periodLabel = computed(() => {
  if (selectedPeriod.value === 'custom') {
    return filters.dateFrom ? `From ${formatDate(filters.dateFrom)}` : 'Custom range'
  }
  return periods.find(p => p.key === selectedPeriod.value)?.label || ''
})

const splitRows = computed(() => {
  const split = stats.value.revenueSplit as Record<string, number>
  const total = Object.values(split).reduce((sum, v) => sum + (v || 0), 0)
  return Object.entries(split)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      key,
      value,
      label: PRODUCTS[key]?.label || key,
      color: PRODUCTS[key]?.color || '#9b9690',
      pct: total ? Math.round((value / total) * 100) : 0
    }))
})

const totalPages = computed(() => Math.ceil(totalPayments.value / pageSize.value))

const filteredPayments = computed(() => {
  if (!searchQuery.value) return payments.value
  
  const query = searchQuery.value.toLowerCase()
  return payments.value.filter((p: any) => 
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
  try {
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
    
    if (error) throw error

    // Resolve missing user profiles from payment metadata
    const orphanPayments = (data || []).filter((p: any) => !p.user && p.metadata?.userId)
    if (orphanPayments.length > 0) {
      const orphanUserIds = [...new Set(orphanPayments.map((p: any) => p.metadata.userId))]
      const { data: resolvedProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, phone')
        .in('id', orphanUserIds)
      
      const profileMap = new Map((resolvedProfiles || []).map((p: any) => [p.id, p]))
      
      for (const payment of (data || []) as any[]) {
        if (!payment.user && payment.metadata?.userId) {
          const resolved = profileMap.get(payment.metadata.userId)
          if (resolved) {
            payment.user = resolved
          }
        }
      }
    }

    payments.value = data || []
    totalPayments.value = count || 0
  } catch (e) {
    console.error('Error fetching payments:', e)
  } finally {
    loading.value = false
  }
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
  try {
    const { data, error } = await supabase
      .from('payment_alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    alerts.value = data || []
  } catch (e) {
    console.error('Error fetching alerts:', e)
  }
}

const fetchStats = async () => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    
    let periodStart = ''
    if (selectedPeriod.value === 'today') periodStart = todayStart
    else if (selectedPeriod.value === 'week') periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    else if (selectedPeriod.value === 'month') periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    else if (selectedPeriod.value === 'custom' && filters.dateFrom) periodStart = new Date(filters.dateFrom).toISOString()

    // Helper for summing
    const sumAmount = (data: any[]) => (data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    // Parallel fetch
    const [allSuccess, totalCountResponse, todayResponse, yesterdayResponse, periodResponse] = await Promise.all([
      supabase.from('payments').select('amount, purpose, status').eq('status', 'success'),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', todayStart),
      supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', yesterdayStart).lte('created_at', todayStart),
      periodStart ? supabase.from('payments').select('amount, purpose').eq('status', 'success').gte('created_at', periodStart) : Promise.resolve({ data: [] })
    ])

    const recentData = allSuccess.data || []
    const periodData = selectedPeriod.value === 'total' ? recentData : (periodResponse.data || [])
    
    const totalCount = totalCountResponse.count || 0
    const successCount = recentData.length
    
    stats.value.successRate = totalCount ? Math.round((successCount / totalCount) * 100) : 0
    stats.value.totalRevenue = sumAmount(recentData)
    stats.value.avgOrderValue = successCount ? Math.round(stats.value.totalRevenue / successCount) : 0
    
    // Split based on period data
    stats.value.revenueSplit = {
      event_ticket: sumAmount(periodData.filter((p: any) => p.purpose === 'event_ticket')),
      match_unlock: sumAmount(periodData.filter((p: any) => p.purpose === 'match_unlock')),
      subscription: sumAmount(periodData.filter((p: any) => ['premium_sub', 'subscription'].includes(p.purpose))),
      spark_deck: sumAmount(periodData.filter((p: any) => p.purpose === 'spark_deck')),
      shoot_your_shot: sumAmount(periodData.filter((p: any) => p.purpose === 'shoot_your_shot'))
    }

    // Time-based
    stats.value.todayRevenue = sumAmount(todayResponse.data || [])
    stats.value.periodRevenue = selectedPeriod.value === 'total' ? stats.value.totalRevenue : sumAmount(periodResponse.data || [])
    
    const yesterdayRevenue = sumAmount(yesterdayResponse.data || [])
    stats.value.growth.today = yesterdayRevenue ? Math.round(((stats.value.todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 100
  } catch (e) {
    console.error('Error fetching stats:', e)
  }
}

watch(selectedPeriod, () => {
  if (selectedPeriod.value !== 'custom') {
     filters.dateFrom = ''
     filters.dateTo = ''
  }
  fetchStats()
})

watch(() => filters.dateFrom, () => {
  if (selectedPeriod.value === 'custom') fetchStats()
})

const resolveAlert = async (alertId: string) => {
  await supabase
    .schema('m2m')
    .from('payment_alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', alertId)
  
  await fetchAlerts()
}

const viewPaymentDetails = (payment: any) => {
  selectedPayment.value = payment
}

const filteredSubs = computed(() => {
  if (!subSearchQuery.value) return subscriptions.value
  
  const query = subSearchQuery.value.toLowerCase()
  return subscriptions.value.filter((s: any) => 
    s.user?.display_name?.toLowerCase().includes(query) ||
    s.user?.phone?.includes(query)
  )
})

// Subscriptions logic
const fetchSubscriptions = async () => {
  loadingSubs.value = true
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, user:profiles(id, display_name, phone)')
      .eq('status', 'active')
      .order('end_date', { ascending: true })

    if (error) throw error
    subscriptions.value = data || []
    
    // Update metrics
    subMetrics.value.total = data?.length || 0
    subMetrics.value.expiringSoon = data?.filter((s: any) => isExpiringSoon(s.end_date)).length || 0
  } catch (e: any) {
    console.error('Error fetching subscriptions:', e)
    // Fallback if the above query fails due to relationship naming
    if (e.message?.includes('relationship')) {
      const { data: fallbackData } = await supabase
        .from('subscriptions')
        .select('*, user:profiles!subscriptions_user_id_fkey(id, display_name, phone)')
        .eq('status', 'active')
      subscriptions.value = fallbackData || []
    }
  } finally {
    loadingSubs.value = false
  }
}

const isExpiringSoon = (endDate: string) => {
  const diff = new Date(endDate).getTime() - new Date().getTime()
  const hours = diff / (1000 * 60 * 60)
  return hours > 0 && hours < 48
}

const isExpired = (endDate: string) => {
  return new Date(endDate).getTime() < new Date().getTime()
}

const bulkRemindExpiring = async () => {
  const expiring = subscriptions.value.filter((s: any) => isExpiringSoon(s.end_date))
  if (expiring.length === 0) return
  
  if (!confirm(`Send SMS reminders to ${expiring.length} users whose subscriptions expire within 48 hours?`)) return
  
  isRemindingAll.value = true
  let success = 0
  
  for (const sub of expiring) {
    try {
      await sendSubReminder(sub, true) // silent mode
      success++
    } catch (e) {
      console.error('Failed to remind:', sub.user?.phone)
    }
  }
  
  alert(`Bulk reminder complete. ${success} messages sent.`)
  isRemindingAll.value = false
}

const sendSubReminder = async (sub: any, silent = false) => {
  if (!sub.user?.phone) {
    if (!silent) alert('User has no phone number')
    return
  }

  sendingReminderId.value = sub.id
  try {
    const { sendSMS } = useZend()
    const endDate = formatDate(sub.end_date)
    const message = `Friendly reminder: Your Minutes 2 Match subscription is active until ${endDate}. Log in to find your perfect match! 💕 - M2Match`
    
    const result = await sendSMS(sub.user.phone, message)
    if (result.success) {
      if (!silent) alert('Reminder sent successfully!')
    } else {
      throw new Error('Failed to send SMS')
    }
  } catch (e) {
    console.error('Error sending reminder:', e)
    if (!silent) alert('Failed to send reminder SMS')
    throw e
  } finally {
    sendingReminderId.value = null
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'subscriptions' && subscriptions.value.length === 0) {
    fetchSubscriptions()
  }
})

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

onMounted(async () => {
  // Use Promise.all to fetch everything concurrently but safely
  try {
    await Promise.all([
      fetchPayments(),
      fetchAlerts(),
      fetchStats()
    ])
  } catch (e) {
    console.error('Core data fetch failed:', e)
  }
})
</script>
