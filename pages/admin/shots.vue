<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <!-- Stats Cards -->
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-stone-900 mb-1">{{ stats.total }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Shots</div>
      </div>
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-emerald-600 mb-1">{{ stats.unlocked }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Unlocked</div>
      </div>
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-amber-600 mb-1">{{ stats.sent }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Awaiting View</div>
      </div>
      <div class="admin-card text-center py-6">
        <div class="text-3xl font-bold text-blue-600 mb-1">GH₵{{ stats.revenue }}</div>
        <div class="text-xs font-bold text-stone-400 uppercase tracking-widest">Revenue</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="filter in ['all', 'awaiting_payment', 'sent', 'viewed', 'unlocked', 'expired']" 
          :key="filter"
          @click="activeFilter = filter"
          class="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
          :class="activeFilter === filter ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ filter.replace('_', ' ') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-loading">Loading shots...</div>

    <!-- Empty -->
    <div v-else-if="filteredShots.length === 0" class="admin-card text-center py-12">
      <p class="text-stone-500">No shots {{ activeFilter !== 'all' ? `with status "${activeFilter}"` : 'yet' }}.</p>
    </div>

    <!-- Shots Table -->
    <div v-else class="admin-card overflow-x-auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Shooter</th>
            <th>Target</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Amount</th>
            <th>Created</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shot in filteredShots" :key="shot.id">
            <td>
              <div class="font-medium text-stone-900">{{ shot.shooter_name }}</div>
              <div class="text-xs text-stone-400 font-mono">{{ shot.shooter_phone }}</div>
              <div class="text-xs text-stone-400">{{ shot.shooter_email }}</div>
            </td>
            <td>
              <div class="font-medium text-stone-900">{{ shot.target_name }}</div>
              <div class="text-xs text-stone-400 font-mono">{{ shot.target_phone }}</div>
            </td>
            <td>
              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase" :class="statusClass(shot.status)">
                {{ shot.status.replace('_', ' ') }}
              </span>
            </td>
            <td>
              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase" :class="paymentClass(shot.payment_status)">
                {{ shot.payment_status }}
              </span>
            </td>
            <td class="font-mono text-sm text-stone-700">GH₵{{ shot.amount_paid }}</td>
            <td class="text-xs text-stone-500">{{ formatDate(shot.created_at) }}</td>
            <td class="text-xs text-stone-500 max-w-[200px] truncate">{{ shot.message || '—' }}</td>
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
const shots = ref<any[]>([])
const activeFilter = ref('all')

const stats = computed(() => ({
  total: shots.value.length,
  unlocked: shots.value.filter(s => s.status === 'unlocked').length,
  sent: shots.value.filter(s => s.status === 'sent' || s.status === 'viewed').length,
  revenue: shots.value
    .filter(s => s.payment_status === 'success')
    .reduce((sum, s) => sum + Number(s.amount_paid || 0), 0)
}))

const filteredShots = computed(() => {
  if (activeFilter.value === 'all') return shots.value
  return shots.value.filter(s => s.status === activeFilter.value)
})

const statusClass = (status: string) => {
  switch (status) {
    case 'unlocked': return 'bg-emerald-100 text-emerald-700'
    case 'sent': return 'bg-amber-100 text-amber-700'
    case 'viewed': return 'bg-blue-100 text-blue-700'
    case 'awaiting_payment': return 'bg-stone-100 text-stone-500'
    case 'expired': return 'bg-red-100 text-red-700'
    default: return 'bg-stone-100 text-stone-700'
  }
}

const paymentClass = (status: string) => {
  switch (status) {
    case 'success': return 'bg-emerald-100 text-emerald-700'
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'failed': return 'bg-red-100 text-red-700'
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
      .from('shots')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) shots.value = data
    if (error) console.error('Failed to fetch shots:', error)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    loading.value = false
  }
})
</script>
