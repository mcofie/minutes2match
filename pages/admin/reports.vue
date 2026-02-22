<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">User Reports</h1>
        <p class="page-subtitle">Monitor community safety and handle reported incidents</p>
      </div>
      <div class="header-actions">
        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            v-for="tab in ['active', 'resolved']" 
            :key="tab"
            @click="activeTab = tab"
            :class="['toggle-btn', { 'active': activeTab === tab }]"
          >
            {{ tab === 'active' ? 'Needs Review' : 'Resolved' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card urgent">
        <div class="stat-icon">🚨</div>
        <div>
          <p class="stat-label">Pending Action</p>
          <p class="stat-value">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">👀</div>
        <div>
          <p class="stat-label">Under Review</p>
          <p class="stat-value">{{ stats.reviewed }}</p>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div>
          <p class="stat-label">Total Resolves</p>
          <p class="stat-value">{{ stats.actioned + stats.dismissed }}</p>
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
          placeholder="Search by name or phone..." 
          class="search-input"
        />
      </div>
      
      <select v-if="activeTab === 'resolved'" v-model="filters.status" class="form-select">
        <option value="">All Outcomes</option>
        <option value="actioned">Actioned</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>

    <!-- Reports Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Reported On</th>
            <th>Type</th>
            <th>Reported User</th>
            <th>Reporter</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-stone-400">
              <div class="flex flex-col items-center gap-2">
                <span class="animate-spin text-2xl">⏳</span>
                <span>Loading reports...</span>
              </div>
            </td>
          </tr>
          
          <tr v-else-if="filteredReports.length === 0">
            <td colspan="6" class="text-center py-16 text-stone-400">
              <div class="flex flex-col items-center gap-3">
                <span class="text-3xl opacity-50">🛡️</span>
                <span class="font-medium">No reports found</span>
                <span class="text-xs">Great job! The community is safe.</span>
              </div>
            </td>
          </tr>
          
          <tr v-for="report in filteredReports" :key="report.id" class="group hover:bg-stone-50 transition-colors">
            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900">{{ formatDate(report.created_at) }}</span>
                <span class="text-xs text-stone-400">{{ formatTimeAgo(report.created_at) }}</span>
              </div>
            </td>
            <td>
              <span class="reason-badge" :class="getReasonClass(report.reason)">
                {{ getReasonEmoji(report.reason) }} {{ formatReason(report.reason) }}
              </span>
            </td>
            <td>
              <div class="flex items-center gap-3">
                <div class="relative">
                  <span class="user-avatar-sm bg-red-100 text-red-600 border border-red-200">
                    {{ report.reported_user?.display_name?.charAt(0) || '?' }}
                  </span>
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-stone-900">{{ report.reported_user?.display_name || 'Unknown' }}</span>
                  <span class="text-xs font-mono text-stone-500">{{ report.reported_user?.phone }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <span class="user-avatar-xs">{{ report.reporter?.display_name?.charAt(0) || '?' }}</span>
                <span class="text-sm">{{ report.reporter?.display_name || 'Unknown' }}</span>
              </div>
            </td>
            <td>
              <span class="status-pill" :class="report.status">
                <span class="dot"></span> {{ report.status }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn-review group-hover:visible invisible" @click="viewReport(report)">
                Review Case
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-between items-center text-sm text-stone-500">
      <span>Showing {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalReports) }} of {{ totalReports }}</span>
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

    <!-- Report Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedReport" class="modal-overlay" @click.self="selectedReport = null">
        <div class="modal modal--lg slide-in-up">
          <div class="modal__header">
            <div>
              <h2 class="modal__title">Case #{{ selectedReport.id.slice(0, 8) }}</h2>
              <span class="text-xs text-stone-500">Opened {{ formatDate(selectedReport.created_at) }}</span>
            </div>
            <button class="modal__close" @click="selectedReport = null">×</button>
          </div>
          
          <div class="modal__content">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Incident Details -->
              <div class="space-y-6">
                <!-- User Cards -->
                <div class="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-stone-400">Parties Involved</span>
                  </div>
                  
                  <div class="space-y-4">
                    <!-- Reported User -->
                    <div class="flex items-center justify-between group">
                      <div class="flex items-center gap-3">
                        <div class="user-avatar bg-red-100 text-red-600 ring-2 ring-red-500/20">
                          {{ selectedReport.reported_user?.display_name?.charAt(0) || '?' }}
                        </div>
                        <div>
                          <p class="font-bold text-red-700 flex items-center gap-2">
                            {{ selectedReport.reported_user?.display_name }}
                            <span class="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded uppercase font-bold">Reported</span>
                          </p>
                          <p class="text-xs text-stone-500">{{ selectedReport.reported_user?.phone }}</p>
                        </div>
                      </div>
                      <NuxtLink :to="`/admin/users?search=${selectedReport.reported_user?.phone}`" class="text-xs btn-xs">
                        Profile
                      </NuxtLink>
                    </div>

                    <div class="h-px bg-stone-200 w-full"></div>

                    <!-- Reporter -->
                    <div class="flex items-center gap-3 opacity-75">
                      <div class="user-avatar bg-stone-200 text-stone-600">
                        {{ selectedReport.reporter?.display_name?.charAt(0) || '?' }}
                      </div>
                      <div>
                        <p class="font-medium text-stone-900">{{ selectedReport.reporter?.display_name }}</p>
                        <p class="text-xs text-stone-500">Reporter</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <h3 class="section-label">Incident Description</h3>
                  <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-stone-800 leading-relaxed shadow-sm">
                    <p v-if="selectedReport.description">{{ selectedReport.description }}</p>
                    <p v-else class="italic text-stone-400">No additional details provided.</p>
                  </div>
                </div>
              </div>

              <!-- Right Column: Meta & Actions -->
              <div class="space-y-6">
                <!-- Meta Info -->
                <div class="bg-white border border-stone-100 p-4 rounded-xl shadow-sm">
                  <div class="flex justify-between items-center mb-4">
                     <span class="reason-badge lg" :class="getReasonClass(selectedReport.reason)">
                        {{ getReasonEmoji(selectedReport.reason) }} {{ formatReason(selectedReport.reason) }}
                     </span>
                     <span class="status-pill" :class="selectedReport.status">
                        <span class="dot"></span> {{ selectedReport.status }}
                     </span>
                  </div>

                  <div class="space-y-3 text-sm">
                    <div v-if="selectedReport.match_id" class="flex justify-between py-2 border-b border-stone-100">
                      <span class="text-stone-500">Match Context</span>
                      <span class="font-mono text-xs">{{ selectedReport.match_id.slice(0,8) }}...</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-stone-100">
                      <span class="text-stone-500">Reviewer</span>
                      <span>{{ selectedReport.reviewed_by || 'Unassigned' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Admin Action Box -->
                <div class="bg-stone-50 p-4 rounded-xl border border-stone-200">
                   <h3 class="section-label mb-2">Internal Notes</h3>
                   <textarea 
                    v-model="adminNotes"
                    rows="3"
                    placeholder="Enter notes for other admins..."
                    class="form-textarea mb-4"
                  ></textarea>

                  <div class="grid grid-cols-2 gap-3 mt-4">
                    <button 
                      @click="updateReportStatus('dismissed')" 
                      class="btn-action btn-dismiss"
                      :disabled="updating || selectedReport.status === 'dismissed'"
                    >
                      <span>❌ Dismiss Report</span>
                    </button>
                    <button 
                      @click="updateReportStatus('actioned')" 
                      class="btn-action btn-ban"
                      :disabled="updating || selectedReport.status === 'actioned'"
                    >
                      <span>🚫 Ban / Warn User</span>
                    </button>
                  </div>
                  <button 
                    v-if="selectedReport.status === 'pending'"
                    @click="updateReportStatus('reviewed')" 
                    class="w-full mt-3 btn-action btn-neutral"
                    :disabled="updating"
                  >
                    <span>👀 Mark as Under Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'User Reports' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()

// State
const activeTab = ref('active') // 'active' (pending/reviewed) or 'resolved' (actioned/dismissed)
const currentPage = ref(1)
const pageSize = ref(15)
const totalReports = ref(0)
const loading = ref(true)
const updating = ref(false)
const reports = ref<any[]>([])
const selectedReport = ref<any>(null)
const adminNotes = ref('')
const searchQuery = ref('')
const stats = ref({
  pending: 0,
  reviewed: 0,
  actioned: 0,
  dismissed: 0
})
const filters = reactive({
  status: ''
})

// Computeds
const totalPages = computed(() => Math.ceil(totalReports.value / pageSize.value))

const filteredReports = computed(() => {
  if (!searchQuery.value) return reports.value
  
  const query = searchQuery.value.toLowerCase()
  return reports.value.filter((r: any) => 
    r.reporter?.display_name?.toLowerCase().includes(query) ||
    r.reported_user?.display_name?.toLowerCase().includes(query) ||
    r.reported_user?.phone?.includes(query)
  )
})

// Formatters
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const formatReason = (reason: string) => {
  return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getReasonEmoji = (reason: string) => {
  const map: Record<string, string> = {
    'inappropriate_behavior': '😤',
    'fake_profile': '🎭',
    'harassment': '⚠️',
    'spam': '📧',
    'underage': '🔞',
    'other': '❓'
  }
  return map[reason] || '❓'
}

const getReasonClass = (reason: string) => {
  switch (reason) {
    case 'harassment': return 'bg-red-100 text-red-800 ring-1 ring-red-500/30'
    case 'underage': return 'bg-purple-100 text-purple-800 ring-1 ring-purple-500/30'
    case 'fake_profile': return 'bg-amber-100 text-amber-800 ring-1 ring-amber-500/30'
    case 'spam': return 'bg-blue-100 text-blue-800 ring-1 ring-blue-500/30'
    default: return 'bg-stone-100 text-stone-700 ring-1 ring-stone-500/20'
  }
}

// Data Fetching
const fetchReports = async () => {
  loading.value = true
  
  let query = supabase
    .schema('m2m')
    .from('reports')
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, display_name, phone),
      reported_user:profiles!reports_reported_user_id_fkey(id, display_name, phone)
    `, { count: 'exact' })
  
  // Tab Handling
  if (activeTab.value === 'active') {
    query = query.in('status', ['pending', 'reviewed'])
  } else {
    // Resolved tab
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.in('status', ['actioned', 'dismissed'])
    }
  }
  
  // Search logic is client-side for now for simplicity with joins, 
  // but strictly we should filter server side if list is huge.
  // For admin tool < 1000 records, client side filter is smoother.
  
  // Apply Pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)
  
  if (error) {
    console.error('Error fetching reports:', error)
  }

  reports.value = data || []
  totalReports.value = count || 0
  loading.value = false
}

const fetchStats = async () => {
  const statuses = ['pending', 'reviewed', 'actioned', 'dismissed']
  for (const status of statuses) {
    const { count } = await supabase
      .schema('m2m')
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', status)
    stats.value[status as keyof typeof stats.value] = count || 0
  }
}

// Actions
const viewReport = (report: any) => {
  selectedReport.value = report
  adminNotes.value = report.admin_notes || ''
}

const updateReportStatus = async (newStatus: string) => {
  if (!selectedReport.value) return
  updating.value = true
  
  const updates: any = { 
    status: newStatus,
    admin_notes: adminNotes.value,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Assign reviewer if not yet set
  if (!selectedReport.value.reviewed_by) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) updates.reviewed_by = user.id
  }
  
  const { error } = await supabase
    .schema('m2m')
    .from('reports')
    .update(updates)
    .eq('id', selectedReport.value.id)
  
  if (error) {
    alert('Failed to update report')
  } else {
    selectedReport.value = null
    await fetchReports()
    await fetchStats()
  }
  updating.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchReports()
}

// Watchers
watch(activeTab, () => {
  currentPage.value = 1
  fetchReports()
})
watch(filters, () => fetchReports(), { deep: true })

onMounted(() => {
  fetchReports()
  fetchStats()
})
</script>

<style scoped>
/* Page Layout */
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-card.urgent { border-left: 4px solid #EF4444; }
.stat-card.info { border-left: 4px solid #F59E0B; }
.stat-card.success { border-left: 4px solid #10B981; }

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

/* Controls */
.view-toggle {
  display: flex;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 8px;
  gap: 2px;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  color: #6B7280;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.search-wrapper {
  flex: 1;
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
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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

.user-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.user-avatar-xs {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
  color: #6B7280;
}

/* Badges */
.reason-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.reason-badge.lg {
  padding: 0.375rem 0.75rem;
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

.status-pill.pending { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
.status-pill.pending .dot { background: #DC2626; }

.status-pill.reviewed { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.reviewed .dot { background: #D97706; }

.status-pill.actioned { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.status-pill.actioned .dot { background: #059669; }

.status-pill.dismissed { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.dismissed .dot { background: #6B7280; }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.btn-review {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
}

.btn-review:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

.modal {
  background: white;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.slide-in-up {
  animation: slideUp 0.2s ease-out;
}

.modal__header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #FAFAFA;
}

.modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.modal__close {
  font-size: 1.5rem;
  color: #9CA3AF;
  line-height: 1;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal__close:hover {
  background: #E5E7EB;
  color: #111827;
}

.modal__content {
  padding: 2rem;
  overflow-y: auto;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.btn-action {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-dismiss {
  background: white;
  border: 1px solid #D1D5DB;
  color: #4B5563;
}

.btn-dismiss:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}

.btn-ban {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
}

.btn-ban:hover {
  background: #FEE2E2;
  border-color: #F87171;
}

.btn-neutral {
  background: white;
  border: 1px solid #D1D5DB;
  color: #6B7280;
  font-size: 0.875rem;
}

.btn-neutral:hover {
  background: #F9FAFB;
  text-decoration: underline;
}

.btn-xs {
    padding: 2px 6px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
    transition: all 0.2s;
}

.btn-xs:hover {
    border-color: #9ca3af;
    color: #374151;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
