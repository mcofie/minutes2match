<template>
  <div class="ad-page">
    <Head>
      <Title>Deletion requests | Admin | Minutes 2 Match</Title>
    </Head>

    <header class="ad-head">
      <div>
        <h1 class="ad-title">Deletion requests</h1>
        <p class="ad-sub">Members asking to close their account. Approving permanently deletes their profile and data.</p>
      </div>
      <button class="btn-ghost btn-sm" :disabled="loading" @click="fetchRequests">
        <svg :class="{ 'animate-spin': loading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>
        Refresh
      </button>
    </header>

    <div class="ad-toolbar">
      <div class="ad-tabs" role="tablist">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          role="tab"
          :aria-selected="activeStatusFilter === tab.key"
          class="ad-tab"
          :class="{ 'is-active': activeStatusFilter === tab.key }"
          @click="activeStatusFilter = tab.key"
        >
          {{ tab.label }}
          <span class="ad-tab__count" :class="{ 'ad-tab__count--alert': tab.key === 'pending' && tab.count > 0 }">{{ tab.count }}</span>
        </button>
      </div>
      <div class="ad-toolbar__spacer"></div>
      <label class="ad-search ad-search--fixed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
        <input v-model="searchQuery" type="search" placeholder="Search name, phone or reason" aria-label="Search requests" />
      </label>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Reason</th>
            <th>Requested</th>
            <th>Status</th>
            <th class="ad-right"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5"><div class="ad-empty"><span class="ad-spinner"></span></div></td>
          </tr>

          <tr v-else-if="filteredRequests.length === 0">
            <td colspan="5">
              <div class="ad-empty">
                <p class="ad-empty__title">Nothing here</p>
                <p>No {{ activeStatusFilter === 'all' ? '' : activeStatusFilter + ' ' }}requests{{ searchQuery ? ' match your search' : '' }}.</p>
              </div>
            </td>
          </tr>

          <template v-else>
          <tr v-for="req in filteredRequests" :key="req.id">
            <td>
              <div class="ad-person">
                <span class="ad-avatar">
                  <img v-if="req.user_photo_url" :src="req.user_photo_url" :alt="req.user_display_name" />
                  <template v-else>{{ req.user_display_name?.charAt(0) || '?' }}</template>
                </span>
                <div class="min-w-0">
                  <span class="ad-person__name">{{ req.user_display_name }}</span>
                  <span class="ad-person__meta">{{ req.user_phone }}</span>
                </div>
              </div>
            </td>

            <td>
              <span class="capitalize">{{ (req.reason || 'Not specified').replace(/_/g, ' ') }}</span>
              <span v-if="req.details" class="ad-clip ad-muted text-xs mt-0.5" :title="req.details">{{ req.details }}</span>
            </td>

            <td class="ad-num">
              {{ formatDate(req.created_at) }}
              <span class="block text-xs ad-faint">{{ formatTime(req.created_at) }}</span>
            </td>

            <td>
              <span class="ad-pill" :class="statusPill[req.status]">{{ req.status }}</span>
            </td>

            <td class="ad-right">
              <div v-if="req.status === 'pending'" class="inline-flex items-center gap-1.5">
                <button class="btn-ghost btn-sm" @click="openRejectModal(req)">Reject</button>
                <button class="btn-danger btn-sm" @click="openApproveModal(req)">Approve &amp; delete</button>
              </div>
              <span v-else class="ad-clip ml-auto text-xs ad-faint" :title="req.admin_notes">{{ req.admin_notes || 'Processed' }}</span>
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Approve -->
    <div v-if="selectedReqForApprove" class="modal-overlay" @click.self="selectedReqForApprove = null">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="approve-title">
        <div class="modal__header">
          <div>
            <h3 id="approve-title" class="modal__title">Delete this account?</h3>
            <p class="modal__sub">This can't be undone.</p>
          </div>
          <button class="modal__close" aria-label="Close" @click="selectedReqForApprove = null">×</button>
        </div>
        <div class="modal__content space-y-4">
          <div class="ad-callout ad-callout--red">
            <p class="font-semibold">{{ selectedReqForApprove.user_display_name }} · {{ selectedReqForApprove.user_phone }}</p>
            <p class="mt-1">Their account, profile and all associated data will be permanently removed from Minutes 2 Match.</p>
          </div>

          <div>
            <label class="form-label" for="approve-note">Admin note <span class="ad-faint">(optional)</span></label>
            <input id="approve-note" v-model="adminNotes" type="text" placeholder="Approved per user request" class="form-input" />
          </div>

          <div class="modal__actions">
            <button class="btn-secondary" @click="selectedReqForApprove = null">Cancel</button>
            <button class="btn-primary" :disabled="actioning" @click="approveDeletion">
              {{ actioning ? 'Deleting…' : 'Approve & delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject -->
    <div v-if="selectedReqForReject" class="modal-overlay" @click.self="selectedReqForReject = null">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="reject-title">
        <div class="modal__header">
          <div>
            <h3 id="reject-title" class="modal__title">Reject request</h3>
            <p class="modal__sub">{{ selectedReqForReject.user_display_name }} keeps their account.</p>
          </div>
          <button class="modal__close" aria-label="Close" @click="selectedReqForReject = null">×</button>
        </div>
        <div class="modal__content space-y-4">
          <div>
            <label class="form-label" for="reject-note">Reason</label>
            <textarea id="reject-note" v-model="adminNotes" rows="3" placeholder="Why is this request being declined?" class="form-input"></textarea>
          </div>

          <div class="modal__actions">
            <button class="btn-secondary" @click="selectedReqForReject = null">Cancel</button>
            <button class="btn-ink" :disabled="actioning" @click="rejectDeletion">
              {{ actioning ? 'Rejecting…' : 'Reject request' }}
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

const statusPill: Record<string, string> = {
  pending: 'ad-pill--amber',
  approved: 'ad-pill--red',
  rejected: '',
  cancelled: 'ad-pill--blue'
}

const statusTabs = computed(() => [
  { key: 'pending', label: 'Pending', count: stats.value.pending },
  { key: 'approved', label: 'Approved', count: stats.value.approved },
  { key: 'rejected', label: 'Rejected', count: stats.value.rejected },
  { key: 'cancelled', label: 'Cancelled', count: stats.value.cancelled },
  { key: 'all', label: 'All', count: stats.value.pending + stats.value.approved + stats.value.rejected + stats.value.cancelled }
])

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
