<template>
  <div class="max-w-6xl">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">Smart Match Queue</h1>
        <p class="text-stone-500 mt-1">Priority users waiting for matches, sorted by urgency</p>
      </div>
      <NuxtLink to="/admin/matches/matchmaker" class="bg-black text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-800 transition-colors flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="22" y1="12" x2="18" y2="12"/>
          <line x1="6" y1="12" x2="2" y2="12"/>
          <line x1="12" y1="6" x2="12" y2="2"/>
          <line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
        Open Matchmaker
      </NuxtLink>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Queue Size</p>
        <p class="text-2xl font-bold text-stone-900">{{ queueStats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">High Priority</p>
        <p class="text-2xl font-bold text-red-600">{{ queueStats.highPriority }}</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Avg. Wait</p>
        <p class="text-2xl font-bold text-stone-900">{{ queueStats.avgWait }} days</p>
      </div>
      <div class="bg-white rounded-xl border border-stone-200 p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">Matched Today</p>
        <p class="text-2xl font-bold text-green-600">{{ queueStats.matchedToday }}</p>
      </div>
    </div>

    <!-- Queue Tabs -->
    <div class="flex gap-2 mb-6">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-bold transition-colors',
          activeTab === tab.id ? 'bg-black text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        ]"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="ml-1 opacity-70">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Queue List -->
    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="w-8 h-8 border-2 border-stone-200 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-stone-500">Loading queue...</p>
      </div>

      <div v-else-if="filteredQueue.length === 0" class="p-12 text-center">
        <div class="text-4xl mb-3">🎉</div>
        <p class="text-lg font-bold text-stone-900 mb-1">Queue is empty!</p>
        <p class="text-stone-500">All verified users have been matched.</p>
      </div>

      <div v-else class="divide-y divide-stone-100">
        <div 
          v-for="(user, index) in paginatedQueue" 
          :key="user.id"
          class="p-5 hover:bg-stone-50/50 transition-colors flex items-center gap-5"
        >
          <!-- Priority Rank -->
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            :class="getPriorityClass((currentPage - 1) * pageSize + index)"
          >
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </div>

          <!-- Avatar -->
          <div class="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold flex-shrink-0 ring-4 ring-stone-50">
            {{ user.display_name?.charAt(0) }}
          </div>

          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-lg text-stone-900 truncate">{{ user.display_name }}</h3>
              <span v-if="user.is_verified" class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-100">
                Verified
              </span>
            </div>
            <div class="flex items-center gap-3 text-sm text-stone-500">
              <span class="capitalize">{{ user.gender }}</span>
              <span>•</span>
              <span>{{ user.age }}y</span>
              <span v-if="user.location">• {{ user.location }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span v-if="user.genotype" class="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-medium rounded">
                {{ user.genotype }}
              </span>
              <span v-if="user.intent" class="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-medium rounded capitalize">
                {{ user.intent }}
              </span>
              <span v-if="user.dating_persona" class="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                {{ user.dating_persona }}
              </span>
            </div>
          </div>

          <!-- Wait Time -->
          <div class="text-center px-4">
            <p class="text-2xl font-bold" :class="user.waitDays > 14 ? 'text-red-600' : user.waitDays > 7 ? 'text-amber-600' : 'text-stone-900'">
              {{ user.waitDays }}
            </p>
            <p class="text-xs text-stone-400 uppercase tracking-wide font-bold">days</p>
          </div>

          <!-- Compatible Matches -->
          <div class="text-center px-4 border-l border-stone-100">
            <p class="text-2xl font-bold text-stone-900">{{ user.potentialMatches }}</p>
            <p class="text-xs text-stone-400 uppercase tracking-wide font-bold">matches</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 flex-shrink-0">
            <button 
              @click="startMatching(user)"
              class="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-stone-800 transition-colors"
            >
              Match Now
            </button>
            <button 
              @click="viewProfile(user)"
              class="px-3 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <Pagination 
      v-if="!loading && filteredQueue.length > 0"
      class="mt-6 border-t border-stone-100"
      :current-page="currentPage" 
      :total-pages="Math.ceil(filteredQueue.length / pageSize)" 
      :total-items="filteredQueue.length"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />

    <!-- User Profile Modal -->
    <Teleport to="body">
      <div v-if="selectedUser" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="selectedUser = null">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 class="text-xl font-bold text-stone-900">User Profile</h2>
            <button @click="selectedUser = null" class="p-2 hover:bg-stone-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <!-- Profile Header -->
            <div class="flex items-center gap-4 mb-6">
              <div class="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
                {{ selectedUser.display_name?.charAt(0) }}
              </div>
              <div>
                <h3 class="text-2xl font-bold text-stone-900">{{ selectedUser.display_name }}</h3>
                <p class="text-stone-500">{{ selectedUser.gender }}, {{ selectedUser.age }}y</p>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="mb-6">
              <h4 class="text-sm font-bold uppercase tracking-wide text-stone-400 mb-3">Activity Timeline</h4>
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                  <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-stone-900">Signed up</p>
                    <p class="text-xs text-stone-500">{{ formatDate(selectedUser.created_at) }}</p>
                  </div>
                </div>
                <div v-if="selectedUser.is_verified" class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-stone-900">Verified account</p>
                    <p class="text-xs text-stone-500">Phone confirmed</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-stone-900">Waiting for match</p>
                    <p class="text-xs text-stone-500">{{ selectedUser.waitDays }} days in queue</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button 
                @click="startMatching(selectedUser); selectedUser = null"
                class="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors"
              >
                Find Matches
              </button>
              <NuxtLink 
                :to="`/admin/users?search=${encodeURIComponent(selectedUser.display_name)}`"
                class="px-4 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium text-sm hover:bg-stone-200 transition-colors"
              >
                Full Profile
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Smart Match Queue' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const router = useRouter()

// State
const loading = ref(true)
const queue = ref<any[]>([])
const selectedUser = ref<any>(null)
const activeTab = ref('all')

// Pagination State
const currentPage = ref(1)
const pageSize = ref(10)

const tabs = computed(() => [
  { id: 'all', label: 'All', count: queue.value.length },
  { id: 'urgent', label: 'Urgent (14+ days)', count: queue.value.filter(u => u.waitDays >= 14).length },
  { id: 'new', label: 'New (< 3 days)', count: queue.value.filter(u => u.waitDays < 3).length },
  { id: 'high-match', label: 'High Match Potential', count: queue.value.filter(u => u.potentialMatches >= 5).length }
])

const queueStats = computed(() => ({
  total: queue.value.length,
  highPriority: queue.value.filter(u => u.waitDays >= 14).length,
  avgWait: queue.value.length ? Math.round(queue.value.reduce((sum, u) => sum + u.waitDays, 0) / queue.value.length) : 0,
  matchedToday: 0 // TODO: fetch from matches table
}))

const filteredQueue = computed(() => {
  let result = []
  switch (activeTab.value) {
    case 'urgent':
      result = queue.value.filter(u => u.waitDays >= 14)
      break
    case 'new':
      result = queue.value.filter(u => u.waitDays < 3)
      break
    case 'high-match':
      result = queue.value.filter(u => u.potentialMatches >= 5)
      break
    default:
      result = queue.value
  }
  return result
})

const paginatedQueue = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQueue.value.slice(start, end)
})

watch(activeTab, () => {
  currentPage.value = 1
})

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Fetch queue
const fetchQueue = async () => {
  loading.value = true
  
  // Get all verified users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_verified', true)
    .order('created_at', { ascending: true })
  
  // Get all existing matches
  const { data: matches } = await supabase
    .from('matches')
    .select('user_1_id, user_2_id')
  
  const matchedUserIds = new Set<string>()
  ;(matches || []).forEach((m: any) => {
    if (m.user_1_id) matchedUserIds.add(m.user_1_id)
    if (m.user_2_id) matchedUserIds.add(m.user_2_id)
  })
  
  // Filter to users without matches and enrich data
  const unmatchedUsers = (users || [])
    .filter((u: any) => !matchedUserIds.has(u.id))
    .map((u: any) => {
      const waitDays = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const age = u.birth_date ? Math.floor((Date.now() - new Date(u.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
      
      // Calculate potential matches (users of opposite gender preference who are also unmatched)
      const potentialMatches = (users || []).filter((other: any) => {
        if (other.id === u.id) return false
        if (matchedUserIds.has(other.id)) return false
        
        // Basic compatibility check
        if (u.interested_in && u.interested_in !== 'everyone') {
          if (other.gender !== u.interested_in) return false
        } else {
          if (other.gender === u.gender) return false
        }
        
        return true
      }).length
      
      return {
        ...u,
        waitDays,
        age,
        potentialMatches
      }
    })
    .sort((a: any, b: any) => {
      // Sort by: wait time (desc), then potential matches (desc)
      if (b.waitDays !== a.waitDays) return b.waitDays - a.waitDays
      return b.potentialMatches - a.potentialMatches
    })
  
  queue.value = unmatchedUsers
  loading.value = false
}

// Helpers
const getPriorityClass = (index: number) => {
  if (index === 0) return 'bg-red-100 text-red-700 ring-2 ring-red-200'
  if (index === 1) return 'bg-amber-100 text-amber-700'
  if (index === 2) return 'bg-yellow-100 text-yellow-700'
  return 'bg-stone-100 text-stone-600'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const startMatching = (user: any) => {
  // Store user in session and redirect to matchmaker
  sessionStorage.setItem('matchUser1', JSON.stringify(user))
  router.push('/admin/matches/matchmaker')
}

const viewProfile = (user: any) => {
  selectedUser.value = user
}

// Initialize
onMounted(() => {
  fetchQueue()
})
</script>
