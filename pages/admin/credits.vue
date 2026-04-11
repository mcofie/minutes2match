<template>
  <div class="admin-credits">
    <!-- Header/Stats -->
    <div class="credits-header">
      <div class="header-left">
        <h1 class="text-2xl font-black uppercase tracking-tight">Credit Ledger</h1>
        <p class="text-stone-400 text-sm">Monitor all credits issued and account activities.</p>
      </div>
      
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-label">Total Credits Issued</span>
          <span class="stat-value text-green-600">GHS {{ totalCredits.toFixed(2) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Transactions Today</span>
          <span class="stat-value">{{ transactionsToday }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <select v-model="filters.reason" class="form-select">
          <option value="">All Reasons</option>
          <option value="reward">🎉 Reward / Promo</option>
          <option value="refund">🔙 Refund</option>
          <option value="compensation">🎁 Compensation</option>
          <option value="adjustment">⚙️ Admin Correction</option>
          <option value="match_expired_refund">🔄 Match Expired Refund</option>
          <option value="promotional_credit">✨ Promotional Credit</option>
        </select>
        
        <select v-model="filters.type" class="form-select">
          <option value="credit">Credits Issued (In)</option>
          <option value="debit">Credits Spent (Out)</option>
          <option value="">All Transactions</option>
        </select>
      </div>

      <div class="search-group">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Search by name or phone..." 
          class="form-input search-input"
        />
        <button @click="fetchTransactions" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Filter
        </button>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Account / User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Balance After</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-12">
              <div class="spinner-container">
                <div class="spinner"></div>
                <span class="mt-2 text-stone-400 font-medium">Loading ledger...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="transactions.length === 0">
            <td colspan="7" class="text-center py-12 text-stone-400 italic">No transactions found for the current filters.</td>
          </tr>
          <tr v-for="tx in transactions" :key="tx.id" class="tx-row">
            <td class="font-mono text-[10px] text-stone-500">
              {{ formatDateTime(tx.created_at) }}
            </td>
            <td>
              <div class="user-cell" v-if="tx.user">
                <div class="user-avatar-small">
                  <img v-if="tx.user.photo_url" :src="tx.user.photo_url" class="rounded-full object-cover w-full h-full" />
                  <span v-else>{{ tx.user.display_name?.charAt(0) || '?' }}</span>
                </div>
                <div class="user-info">
                  <div class="user-name">{{ tx.user.display_name || 'Deleted User' }}</div>
                  <div class="user-phone">{{ tx.user.phone }}</div>
                </div>
              </div>
              <div v-else class="text-stone-400 italic text-xs">Unknown / Deleted</div>
            </td>
            <td>
              <span class="badge-mini" :class="tx.type === 'credit' ? 'badge-credit' : 'badge-debit'">
                {{ tx.type.toUpperCase() }}
              </span>
            </td>
            <td>
              <span class="font-bold tabular-nums" :class="tx.type === 'credit' ? 'text-green-600' : 'text-rose-500'">
                {{ tx.type === 'credit' ? '+' : '-' }} GHS {{ tx.amount.toFixed(2) }}
              </span>
            </td>
            <td class="text-xs font-medium">
              {{ formatReason(tx.reason) }}
            </td>
            <td>
              <span class="font-mono text-xs text-stone-500">GHS {{ tx.balance_after.toFixed(2) }}</span>
            </td>
            <td class="text-xs text-stone-400 max-w-[200px] truncate" :title="tx.description">
              {{ tx.description || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-footer" v-if="totalTransactions > pageSize">
      <Pagination 
        :current-page="currentPage" 
        :total-pages="Math.ceil(totalTransactions / pageSize)" 
        :total-items="totalTransactions"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Credit Ledger | Admin' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const loading = ref(true)
const transactions = ref<any[]>([])
const totalTransactions = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  reason: '',
  type: 'credit',
  search: ''
})

const transactionsToday = ref(0)
const totalCredits = ref(0)

const fetchTransactions = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/credits', {
      query: {
        page: currentPage.value,
        pageSize: pageSize.value,
        type: filters.type,
        reason: filters.reason,
        search: filters.search
      }
    }) as any
    
    transactions.value = response.transactions || []
    totalTransactions.value = response.total || 0
    totalCredits.value = response.totalCreditsIssued || 0
    
    // Calculate daily count from current page
    if (currentPage.value === 1) {
       const today = new Date().toISOString().split('T')[0]
       transactionsToday.value = transactions.value
         .filter(t => t.created_at.startsWith(today)).length
    }
  } catch (err) {
    console.error('Failed to fetch transactions:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTransactions()
}

watch(filters, () => {
  currentPage.value = 1
  fetchTransactions()
}, { deep: true })

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const formatReason = (reason: string) => {
  const map: Record<string, string> = {
    'reward': '🎉 Reward / Promo',
    'refund': '🔙 Refund',
    'compensation': '🎁 Compensation',
    'adjustment': '⚙️ Admin Correction',
    'match_unlock_spend': '🔓 Match Unlock',
    'match_expired_refund': '🔄 Match Expired Refund',
    'promotional_credit': '✨ Promotional Credit',
    'admin_adjustment': '⚙️ Admin Adjustment'
  }
  return map[reason] || reason.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

onMounted(() => {
  fetchTransactions()
})
</script>

<style scoped>
.admin-credits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.credits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a8a29e;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
}

.filters-bar {
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #E5E7EB;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.search-group {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  min-width: 300px;
}

.search-input {
  flex: 1;
}

.data-table-container {
  background: white;
  border-radius: 1rem;
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-small {
  width: 2rem;
  height: 2rem;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  overflow: hidden;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #111827;
}

.user-phone {
  font-size: 0.6875rem;
  color: #9CA3AF;
  font-family: monospace;
}

.badge-mini {
  padding: 0.125rem 0.5rem;
  border-radius: 100px;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.badge-credit {
  background: #DCFCE7;
  color: #166534;
}

.badge-debit {
  background: #FEE2E2;
  color: #991B1B;
}

.tx-row:hover {
  background: #F9FAFB;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #F3F4F6;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pagination-footer {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .credits-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-stats {
    width: 100%;
  }
  
  .stat-card {
    flex: 1;
  }
}
</style>
