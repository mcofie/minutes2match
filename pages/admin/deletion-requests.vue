<template>
  <div class="admin-page">
    <Head>
      <Title>Account Deletion Requests | Admin | Minutes 2 Match</Title>
    </Head>

    <!-- Header -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Account Deletion Requests</h1>
        <p class="page-subtitle">Review and approve or reject user requests for account deletion</p>
      </div>
      <div class="header-actions">
        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            v-for="tab in ['pending', 'all', 'approved', 'rejected', 'cancelled']" 
            :key="tab"
            @click="activeStatusFilter = tab"
            :class="['toggle-btn', { 'active': activeStatusFilter === tab }]"
            class="capitalize"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card urgent">
        <div class="stat-icon">⏳</div>
        <div>
          <p class="stat-label">Pending Review</p>
          <p class="stat-value">{{ stats.pending }}</p>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div>
          <p class="stat-label">Approved & Deleted</p>
          <p class="stat-value">{{ stats.approved }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div>
          <p class="stat-label">Rejected Requests</p>
          <p class="stat-value">{{ stats.rejected }}</p>
        </div>
      </div>
      <div class="stat-card info">
        <div class="stat-icon">↩️</div>
        <div>
          <p class="stat-label">User Cancelled</p>
          <p class="stat-value">{{ stats.cancelled }}</p>
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
          placeholder="Search by name, phone, or reason..." 
          class="search-input"
        />
      </div>

      <button 
        @click="fetchRequests" 
        :disabled="loading"
        class="btn-secondary"
      >
        <span :class="loading ? 'animate-spin' : ''">🔄</span> Refresh
      </button>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>User Details</th>
            <th>Reason</th>
            <th>Details</th>
            <th>Requested On</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-stone-400">
              <div class="flex flex-col items-center gap-2">
                <span class="animate-spin text-2xl">⏳</span>
                <span>Loading deletion requests...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="filteredRequests.length === 0">
            <td colspan="6" class="text-center py-16 text-stone-400">
              <div class="flex flex-col items-center gap-3">
                <span class="text-3xl opacity-50">🧹</span>
                <span class="font-medium text-stone-700">No account deletion requests found</span>
                <span class="text-xs">Check another status tab or search filter.</span>
              </div>
            </td>
          </tr>

          <tr v-for="req in filteredRequests" :key="req.id" class="group hover:bg-stone-50 transition-colors">
            <td>
              <div class="flex items-center gap-3">
                <div class="user-avatar-sm overflow-hidden bg-stone-100 border border-stone-200">
                  <img v-if="req.user_photo_url" :src="req.user_photo_url" :alt="req.user_display_name" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-stone-600">{{ req.user_display_name?.charAt(0) || '?' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-stone-900">{{ req.user_display_name }}</span>
                  <span class="text-xs font-mono text-stone-500">{{ req.user_phone }}</span>
                </div>
              </div>
            </td>

            <td>
              <span class="reason-badge bg-stone-100 text-stone-800 border border-stone-200 capitalize">
                {{ (req.reason || 'Not specified').replace(/_/g, ' ') }}
              </span>
            </td>

            <td class="max-w-xs truncate text-stone-600 text-xs">
              {{ req.details || '-' }}
            </td>

            <td>
              <div class="flex flex-col">
                <span class="font-medium text-stone-900 text-xs">{{ formatDate(req.created_at) }}</span>
                <span class="text-xs text-stone-400 font-mono">{{ formatTime(req.created_at) }}</span>
              </div>
            </td>

            <td>
              <span class="status-pill" :class="req.status">
                <span class="dot"></span> {{ req.status }}
              </span>
            </td>

            <td class="text-right">
              <div v-if="req.status === 'pending'" class="flex items-center justify-end gap-2">
                <button @click="openRejectModal(req)" class="btn-xs border border-stone-300 text-stone-700 hover:bg-stone-100">
                  Reject
                </button>
                <button @click="openApproveModal(req)" class="btn-xs bg-red-600 text-white hover:bg-red-700 font-semibold border-none">
                  Approve & Delete
                </button>
              </div>
              <div v-else class="text-xs text-stone-400 italic">
                {{ req.admin_notes ? `Note: ${req.admin_notes}` : 'Processed' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve Modal -->
    <div v-if="selectedReqForApprove" class="modal-overlay">
      <div class="modal slide-in-up max-w-md">
        <div class="modal__header">
          <div>
            <h3 class="modal__title text-red-600 flex items-center gap-2">
              <span>⚠️</span> Approve Account Deletion
            </h3>
            <p class="text-xs text-stone-500 mt-1">Permanent and irreversible action</p>
          </div>
          <button @click="selectedReqForApprove = null" class="modal__close">×</button>
        </div>
        <div class="modal__content space-y-4">
          <div class="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-900 space-y-2">
            <p class="font-bold">Are you sure you want to approve deletion for:</p>
            <p class="font-mono text-sm font-bold text-red-950">{{ selectedReqForApprove.user_display_name }} ({{ selectedReqForApprove.user_phone }})</p>
            <p class="text-[11px] opacity-90 leading-relaxed">This will permanently delete their account, profile, and all associated data from Minutes 2 Match.</p>
          </div>

          <div>
            <label class="section-label">Admin Note (Optional)</label>
            <input 
              v-model="adminNotes" 
              type="text" 
              placeholder="Approved per user request"
              class="search-input"
            />
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button @click="selectedReqForApprove = null" class="btn-dismiss flex-1">
              Cancel
            </button>
            <button @click="approveDeletion" :disabled="actioning" class="btn-action bg-red-600 text-white hover:bg-red-700 flex-1">
              {{ actioning ? 'Deleting...' : 'Approve & Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="selectedReqForReject" class="modal-overlay">
      <div class="modal slide-in-up max-w-md">
        <div class="modal__header">
          <div>
            <h3 class="modal__title">Reject Deletion Request</h3>
            <p class="text-xs text-stone-500 mt-1">Decline user request</p>
          </div>
          <button @click="selectedReqForReject = null" class="modal__close">×</button>
        </div>
        <div class="modal__content space-y-4">
          <div>
            <label class="section-label">Reason / Admin Note</label>
            <textarea 
              v-model="adminNotes" 
              rows="3" 
              placeholder="Specify reason for rejection..."
              class="search-input"
            ></textarea>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button @click="selectedReqForReject = null" class="btn-dismiss flex-1">
              Cancel
            </button>
            <button @click="rejectDeletion" :disabled="actioning" class="btn-action bg-stone-900 text-white hover:bg-black flex-1">
              {{ actioning ? 'Rejecting...' : 'Confirm Reject' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const loading = ref(false)
const requests = ref<any[]>([])
const stats = ref({ pending: 0, approved: 0, rejected: 0, cancelled: 0 })
const activeStatusFilter = ref('pending')
const searchQuery = ref('')

const selectedReqForApprove = ref<any>(null)
const selectedReqForReject = ref<any>(null)
const adminNotes = ref('')
const actioning = ref(false)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const fetchRequests = async () => {
  loading.value = true
  try {
    const statusParam = activeStatusFilter.value === 'all' ? '' : activeStatusFilter.value
    const res = await $fetch<{ success: boolean; requests: any[]; stats: any }>('/api/admin/deletion-requests', {
      query: {
        status: statusParam,
        search: searchQuery.value
      }
    })
    requests.value = res.requests || []
    stats.value = res.stats || { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
  } catch (err: any) {
    console.error('Failed to fetch deletion requests:', err)
  } finally {
    loading.value = false
  }
}

watch([activeStatusFilter], () => {
  fetchRequests()
})

const filteredRequests = computed(() => {
  if (!searchQuery.value) return requests.value
  const q = searchQuery.value.toLowerCase()
  return requests.value.filter((r: any) =>
    r.user_display_name?.toLowerCase().includes(q) ||
    r.user_phone?.toLowerCase().includes(q) ||
    r.reason?.toLowerCase().includes(q)
  )
})

const openApproveModal = (req: any) => {
  selectedReqForApprove.value = req
  adminNotes.value = 'Approved per user request'
}

const openRejectModal = (req: any) => {
  selectedReqForReject.value = req
  adminNotes.value = 'Request reviewed and declined by admin.'
}

const approveDeletion = async () => {
  if (!selectedReqForApprove.value || actioning.value) return
  actioning.value = true
  try {
    await $fetch(`/api/admin/deletion-requests/${selectedReqForApprove.value.id}/approve`, {
      method: 'POST',
      body: { admin_notes: adminNotes.value }
    })
    alert('Account deletion approved and user deleted.')
    selectedReqForApprove.value = null
    fetchRequests()
  } catch (err: any) {
    alert(`Failed to approve deletion: ${err.data?.statusMessage || err.message}`)
  } finally {
    actioning.value = false
  }
}

const rejectDeletion = async () => {
  if (!selectedReqForReject.value || actioning.value) return
  actioning.value = true
  try {
    await $fetch(`/api/admin/deletion-requests/${selectedReqForReject.value.id}/reject`, {
      method: 'POST',
      body: { admin_notes: adminNotes.value }
    })
    alert('Deletion request rejected.')
    selectedReqForReject.value = null
    fetchRequests()
  } catch (err: any) {
    alert(`Failed to reject request: ${err.data?.statusMessage || err.message}`)
  } finally {
    actioning.value = false
  }
}

onMounted(() => {
  fetchRequests()
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
.stat-card.info { border-left: 4px solid #3B82F6; }
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
  background: transparent;
  border: none;
  cursor: pointer;
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

.status-pill.pending { background: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; }
.status-pill.pending .dot { background: #D97706; }

.status-pill.approved { background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; }
.status-pill.approved .dot { background: #DC2626; }

.status-pill.rejected { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.status-pill.rejected .dot { background: #6B7280; }

.status-pill.cancelled { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
.status-pill.cancelled .dot { background: #2563EB; }

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-xs {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
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
  max-width: 500px;
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
  background: none;
  border: none;
  cursor: pointer;
}

.modal__close:hover {
  background: #E5E7EB;
  color: #111827;
}

.modal__content {
  padding: 1.5rem;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.btn-dismiss {
  padding: 0.625rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  background: white;
  border: 1px solid #D1D5DB;
  color: #374151;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-dismiss:hover {
  background: #F3F4F6;
}

.btn-action {
  padding: 0.625rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  transition: all 0.2s;
  cursor: pointer;
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
