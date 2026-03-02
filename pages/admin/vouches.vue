<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- Stats Cards -->
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-stone-900 mb-1">{{ stats.total }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Vouches</div>
      </div>
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-emerald-600 mb-1">{{ stats.matched }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Matched</div>
      </div>
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-amber-600 mb-1">{{ stats.pending }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Pending</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="filter in ['all', 'pending', 'partial', 'matched', 'declined', 'expired']" 
          :key="filter"
          @click="activeFilter = filter"
          class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
          :class="activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-loading">Loading vouches...</div>

    <!-- Empty -->
    <div v-else-if="filteredVouches.length === 0" class="admin-card text-center py-12">
      <p class="text-stone-500">No vouches {{ activeFilter !== 'all' ? `with status "${activeFilter}"` : 'yet' }}.</p>
    </div>

    <!-- Vouches Table -->
    <div v-else class="admin-card overflow-x-auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Matcher</th>
            <th>Friend A</th>
            <th>Friend B</th>
            <th>Status</th>
            <th>Created</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vouch in filteredVouches" :key="vouch.id">
            <td>
              <div class="font-medium text-stone-900">{{ vouch.matcher_name }}</div>
              <div class="text-xs text-stone-400 font-mono">{{ vouch.matcher_phone }}</div>
            </td>
            <td>
              <div class="font-medium" :class="vouch.friend_a_accepted ? 'text-emerald-600' : 'text-stone-900'">
                {{ vouch.friend_a_name }}
                <span v-if="vouch.friend_a_accepted" class="text-xs">✅</span>
              </div>
              <div class="text-xs text-stone-400 font-mono">{{ vouch.friend_a_phone }}</div>
            </td>
            <td>
              <div class="font-medium" :class="vouch.friend_b_accepted ? 'text-emerald-600' : 'text-stone-900'">
                {{ vouch.friend_b_name }}
                <span v-if="vouch.friend_b_accepted" class="text-xs">✅</span>
              </div>
              <div class="text-xs text-stone-400 font-mono">{{ vouch.friend_b_phone }}</div>
            </td>
            <td>
              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase" :class="statusClass(vouch.status)">
                {{ vouch.status }}
              </span>
            </td>
            <td class="text-xs text-stone-500">{{ formatDate(vouch.created_at) }}</td>
            <td class="text-xs text-stone-500 max-w-[200px] truncate">{{ vouch.matcher_note || '—' }}</td>
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
const loading = ref(true)
const vouches = ref<any[]>([])
const activeFilter = ref('all')

const stats = computed(() => ({
  total: vouches.value.length,
  matched: vouches.value.filter(v => v.status === 'matched').length,
  pending: vouches.value.filter(v => v.status === 'pending' || v.status === 'partial').length
}))

const filteredVouches = computed(() => {
  if (activeFilter.value === 'all') return vouches.value
  return vouches.value.filter(v => v.status === activeFilter.value)
})

const statusClass = (status: string) => {
  switch (status) {
    case 'matched': return 'bg-emerald-100 text-emerald-700'
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'partial': return 'bg-blue-100 text-blue-700'
    case 'declined': return 'bg-red-100 text-red-700'
    case 'expired': return 'bg-stone-100 text-stone-500'
    default: return 'bg-stone-100 text-stone-700'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('vouches')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) vouches.value = data
    if (error) console.error('Failed to fetch vouches:', error)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})
</script>
