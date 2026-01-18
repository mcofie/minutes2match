<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold m-0">All Matches</h1>
      <NuxtLink to="/admin/matches/matchmaker" class="btn-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        Open Matchmaker
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="users__filters">
      <select v-model="filters.status" class="form-select user-filter">
        <option value="">All Statuses</option>
        <option value="pending_payment">Pending Payment</option>
        <option value="partial_payment">Partial Payment</option>
        <option value="unlocked">Unlocked / Paid</option>
        <option value="rejected">Rejected</option>
        <option value="expired">Expired</option>
      </select>
      
      <input
        type="text"
        v-model="filters.search"
        placeholder="Search by user name..."
        class="form-input user-search"
      />
    </div>

    <!-- Matches Table -->
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User 1</th>
            <th>User 2</th>
            <th>Status</th>
            <th>Unlock Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-8 text-muted">Loading matches...</td>
          </tr>
          <tr v-else-if="filteredMatches.length === 0">
            <td colspan="6" class="text-center py-8 text-muted">No matches found</td>
          </tr>
          <tr v-for="match in filteredMatches" :key="match.id">
            <td class="whitespace-nowrap">{{ formatDate(match.created_at) }}</td>
            <td>
              <div class="user-cell">
                <div class="user-avatar-sm">{{ match.user_1?.display_name?.charAt(0) || '?' }}</div>
                <div>
                  <div class="user-name-sm">{{ match.user_1?.display_name || 'Anonymous' }}</div>
                  <div class="user-meta-sm">{{ match.user_1?.phone }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="user-cell">
                <div class="user-avatar-sm">{{ match.user_2?.display_name?.charAt(0) || '?' }}</div>
                <div>
                  <div class="user-name-sm">{{ match.user_2?.display_name || 'Anonymous' }}</div>
                  <div class="user-meta-sm">{{ match.user_2?.phone }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="badge" :class="getStatusClass(match.status)">
                {{ formatStatus(match.status) }}
              </span>
            </td>
            <td class="font-bold">GH₵{{ match.unlock_price }}</td>
            <td>
              <div class="flex items-center gap-2">
                <!-- Delete Action (Optional, for admin) -->
                <button 
                  class="btn-secondary btn-sm text-red-600 hover:bg-red-50" 
                  @click="confirmDelete(match)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const matches = ref<any[]>([])
const loading = ref(true)
const filters = reactive({
  status: '',
  search: ''
})

// Fetch matches
const fetchMatches = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_1:profiles!matches_user_1_id_fkey(*),
        user_2:profiles!matches_user_2_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    matches.value = data || []
  } catch (e) {
    console.error('Error fetching matches:', e)
  } finally {
    loading.value = false
  }
}

// Computed
const filteredMatches = computed(() => {
  return matches.value.filter(m => {
    // Filter by status
    if (filters.status && m.status !== filters.status) return false
    
    // Filter by search (name of either user)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const u1Name = (m.user_1?.display_name || '').toLowerCase()
      const u2Name = (m.user_2?.display_name || '').toLowerCase()
      const u1Phone = (m.user_1?.phone || '')
      const u2Phone = (m.user_2?.phone || '')
      
      if (!u1Name.includes(q) && !u2Name.includes(q) && !u1Phone.includes(q) && !u2Phone.includes(q)) {
        return false
      }
    }
    
    return true
  })
})

// Helpers
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: 'Pending Payment',
    partial_payment: 'Partial Payment',
    unlocked: 'Unlocked',
    rejected: 'Rejected',
    expired: 'Expired'
  }
  return map[status] || status.replace('_', ' ')
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'unlocked': return 'badge--green'
    case 'partial_payment': return 'badge--blue'
    case 'pending_payment': return 'badge--yellow'
    case 'rejected': return 'badge--red'
    default: return 'badge--gray'
  }
}

const confirmDelete = async (match: any) => {
  if (!confirm('Are you sure you want to delete this match? This cannot be undone.')) return
  
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', match.id)
      
    if (error) throw error
    
    matches.value = matches.value.filter(m => m.id !== match.id)
  } catch (e) {
    alert('Failed to delete match')
  }
}

onMounted(() => {
  fetchMatches()
})
</script>

<style scoped>
.users__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

.user-filter {
  width: auto;
  min-width: 180px;
}

.user-search {
  flex: 1;
  min-width: 250px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-sm {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: white;
  font-weight: 700;
  border-radius: 50%;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-name-sm {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1a1a1a;
}

.user-meta-sm {
  font-size: 0.7rem;
  color: #888;
}

/* Badges should use global admin.css classes */
.whitespace-nowrap {
  white-space: nowrap;
}
</style>
