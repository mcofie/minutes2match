<template>
  <div class="ad-page">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Reports</h1>
        <p class="ad-sub">Safety reports from members. Open a case to review it, then take action or dismiss.</p>
      </div>
    </header>

    <div class="ad-stats">
      <div class="ad-stat" :class="{ 'ad-stat--alert': stats.pending > 0 }">
        <div class="ad-stat__label">Needs action</div>
        <div class="ad-stat__value">{{ stats.pending }}</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">In review</div>
        <div class="ad-stat__value">{{ stats.reviewed }}</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">Actioned</div>
        <div class="ad-stat__value">{{ stats.actioned }}</div>
      </div>
      <div class="ad-stat">
        <div class="ad-stat__label">Dismissed</div>
        <div class="ad-stat__value">{{ stats.dismissed }}</div>
      </div>
    </div>

    <div class="ad-toolbar">
      <div class="ad-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="ad-tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="ad-tab__count" :class="{ 'ad-tab__count--alert': tab.key === 'active' && tab.count > 0 }">{{ tab.count }}</span>
        </button>
      </div>
      <select v-if="activeTab === 'resolved'" v-model="filters.status" class="ad-select" aria-label="Outcome">
        <option value="">All outcomes</option>
        <option value="actioned">Actioned</option>
        <option value="dismissed">Dismissed</option>
      </select>
      <div class="ad-toolbar__spacer"></div>
      <label class="ad-search ad-search--fixed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
        <input v-model="searchQuery" type="search" placeholder="Search name or phone" aria-label="Search reports" />
      </label>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Reported member</th>
            <th>Reason</th>
            <th>Reported by</th>
            <th>When</th>
            <th>Status</th>
            <th class="ad-right"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6"><div class="ad-empty"><span class="ad-spinner"></span></div></td>
          </tr>

          <tr v-else-if="filteredReports.length === 0">
            <td colspan="6">
              <div class="ad-empty">
                <p class="ad-empty__title">{{ activeTab === 'active' ? 'All clear' : 'No resolved reports' }}</p>
                <p>{{ searchQuery ? 'No reports match your search.' : activeTab === 'active' ? 'No open reports right now.' : 'Resolved cases will show up here.' }}</p>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr v-for="report in filteredReports" :key="report.id" class="is-clickable" @click="viewReport(report)">
              <td>
                <div class="ad-person">
                  <span class="ad-avatar">{{ report.reported_user?.display_name?.charAt(0) || '?' }}</span>
                  <div class="min-w-0">
                    <span class="ad-person__name">{{ report.reported_user?.display_name || 'Unknown' }}</span>
                    <span class="ad-person__meta">{{ report.reported_user?.phone }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="ad-pill" :class="getReasonClass(report.reason)">{{ formatReason(report.reason) }}</span>
              </td>
              <td>
                <div class="ad-person">
                  <span class="ad-avatar ad-avatar--sm">{{ report.reporter?.display_name?.charAt(0) || '?' }}</span>
                  <span class="ad-muted">{{ report.reporter?.display_name || 'Unknown' }}</span>
                </div>
              </td>
              <td class="ad-num">
                {{ formatDate(report.created_at) }}
                <span class="block text-xs ad-faint">{{ formatTimeAgo(report.created_at) }}</span>
              </td>
              <td>
                <span class="ad-pill" :class="statusPill[report.status]">{{ statusLabel[report.status] || report.status }}</span>
              </td>
              <td class="ad-right">
                <button class="btn-secondary btn-sm" @click.stop="viewReport(report)">Review</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="ad-pager">
      <span>{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalReports) }} of {{ totalReports }}</span>
      <div class="ad-pager__buttons">
        <button class="btn-secondary btn-sm" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">Previous</button>
        <button class="btn-secondary btn-sm" :disabled="currentPage === totalPages" @click="handlePageChange(currentPage + 1)">Next</button>
      </div>
    </div>

    <!-- Case detail -->
    <Teleport to="body">
      <div v-if="selectedReport" class="m2m-app m2m-admin modal-overlay" @click.self="selectedReport = null">
        <div class="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="case-title">
          <div class="modal__header">
            <div>
              <h2 id="case-title" class="modal__title">Case {{ selectedReport.id.slice(0, 8) }}</h2>
              <p class="modal__sub">Opened {{ formatDate(selectedReport.created_at) }} · {{ formatTimeAgo(selectedReport.created_at) }}</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="selectedReport = null">×</button>
          </div>

          <div class="modal__content">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-5">
                <div class="ad-panel ad-panel--flat space-y-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="ad-person">
                      <span class="ad-avatar ad-avatar--lg">{{ selectedReport.reported_user?.display_name?.charAt(0) || '?' }}</span>
                      <div class="min-w-0">
                        <span class="ad-person__name">{{ selectedReport.reported_user?.display_name || 'Unknown' }}</span>
                        <span class="ad-person__meta">Reported · {{ selectedReport.reported_user?.phone }}</span>
                      </div>
                    </div>
                    <NuxtLink :to="`/admin/users?search=${selectedReport.reported_user?.phone}`" class="btn-secondary btn-sm">Profile</NuxtLink>
                  </div>
                  <div class="ad-person">
                    <span class="ad-avatar">{{ selectedReport.reporter?.display_name?.charAt(0) || '?' }}</span>
                    <div class="min-w-0">
                      <span class="ad-person__name">{{ selectedReport.reporter?.display_name || 'Unknown' }}</span>
                      <span class="ad-person__meta">Reporter</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="ad-label">What happened</h3>
                  <div class="ad-callout">
                    <p v-if="selectedReport.description" class="whitespace-pre-line">{{ selectedReport.description }}</p>
                    <p v-else class="ad-faint">No details given.</p>
                  </div>
                </div>
              </div>

              <div class="space-y-5">
                <div>
                  <div class="ad-kv">
                    <span>Reason</span>
                    <span><span class="ad-pill" :class="getReasonClass(selectedReport.reason)">{{ formatReason(selectedReport.reason) }}</span></span>
                  </div>
                  <div class="ad-kv">
                    <span>Status</span>
                    <span><span class="ad-pill" :class="statusPill[selectedReport.status]">{{ statusLabel[selectedReport.status] || selectedReport.status }}</span></span>
                  </div>
                  <div v-if="selectedReport.match_id" class="ad-kv">
                    <span>Match</span>
                    <span class="font-mono text-xs">{{ selectedReport.match_id.slice(0, 8) }}</span>
                  </div>
                  <div class="ad-kv">
                    <span>Reviewer</span>
                    <span :class="selectedReport.reviewed_by ? 'font-mono text-xs' : 'ad-faint'">{{ selectedReport.reviewed_by ? selectedReport.reviewed_by.slice(0, 8) : 'Unassigned' }}</span>
                  </div>
                </div>

                <div>
                  <label class="ad-label" for="report-notes">Internal notes</label>
                  <textarea id="report-notes" v-model="adminNotes" rows="3" placeholder="Visible to other admins only" class="form-input"></textarea>
                </div>

                <div class="space-y-2">
                  <div class="modal__actions">
                    <button class="btn-secondary" :disabled="updating || selectedReport.status === 'dismissed'" @click="updateReportStatus('dismissed')">Dismiss</button>
                    <button class="btn-danger" :disabled="updating || selectedReport.status === 'actioned'" @click="updateReportStatus('actioned')">Ban or warn</button>
                  </div>
                  <button
                    v-if="selectedReport.status === 'pending'"
                    class="btn-ghost w-full"
                    :disabled="updating"
                    @click="updateReportStatus('reviewed')"
                  >Mark as in review</button>
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
useHead({ title: 'Reports' })

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

const getReasonClass = (reason: string) => {
  switch (reason) {
    case 'harassment': return 'ad-pill--red'
    case 'underage': return 'ad-pill--violet'
    case 'fake_profile': return 'ad-pill--amber'
    case 'spam': return 'ad-pill--blue'
    default: return ''
  }
}

const statusPill: Record<string, string> = {
  pending: 'ad-pill--red',
  reviewed: 'ad-pill--amber',
  actioned: 'ad-pill--green',
  dismissed: ''
}

const statusLabel: Record<string, string> = {
  pending: 'Needs action',
  reviewed: 'In review',
  actioned: 'Actioned',
  dismissed: 'Dismissed'
}

const tabs = computed(() => [
  { key: 'active', label: 'Open', count: stats.value.pending + stats.value.reviewed },
  { key: 'resolved', label: 'Resolved', count: stats.value.actioned + stats.value.dismissed }
])

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
