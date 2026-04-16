<template>
  <div class="max-w-5xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-stone-900">Spark Deck Manager</h1>
        <p class="text-stone-500 mt-2">Manage live vibes, seasonal polls, regions, and Spotify playlists.</p>
      </div>
      <button 
        @click="openCreateModal" 
        class="bg-black text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-stone-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <span>+</span> New Poll
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-stone-400">
      <div class="w-10 h-10 border-4 border-stone-200 border-t-black rounded-full animate-spin mb-4"></div>
      Loading polls...
    </div>

    <!-- Content -->
    <div v-else class="space-y-10">
      
      <!-- Stats Dashboard Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-sm flex flex-col relative overflow-hidden">
          <div class="absolute -right-4 -top-4 opacity-5 text-8xl">🎴</div>
          <span class="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Total Polls Configured</span>
          <span class="text-4xl font-black text-stone-900 relative z-10">{{ polls.length }}</span>
        </div>
        <div class="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 shadow-sm flex flex-col relative overflow-hidden">
          <div class="absolute -right-2 -top-4 opacity-10 text-8xl">✨</div>
          <span class="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Active Live Polls</span>
          <span class="text-4xl font-black text-emerald-600 relative z-10">{{ polls.filter(p => p.is_active).length }}</span>
        </div>
        <div class="bg-black p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] flex flex-col relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-10 text-8xl group-hover:scale-110 transition-transform">🔥</div>
          <span class="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Total Submissions</span>
          <span class="text-4xl font-black text-white relative z-10">
            {{ polls.reduce((acc, p) => acc + (p.option_a_count || 0) + (p.option_b_count || 0), 0).toLocaleString() }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <span class="text-stone-400 text-[10px] font-black uppercase tracking-widest">Deck Orders</span>
          <div class="mt-2 text-3xl font-black text-stone-900">{{ orderSummary.total }}</div>
        </div>
        <div class="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span class="text-emerald-600/70 text-[10px] font-black uppercase tracking-widest">Paid Orders</span>
          <div class="mt-2 text-3xl font-black text-emerald-600">{{ orderSummary.success }}</div>
        </div>
        <div class="bg-amber-50 p-5 rounded-3xl border border-amber-100 shadow-sm">
          <span class="text-amber-700/70 text-[10px] font-black uppercase tracking-widest">Pending Orders</span>
          <div class="mt-2 text-3xl font-black text-amber-600">{{ orderSummary.pending }}</div>
        </div>
        <div class="bg-black p-5 rounded-3xl border border-black shadow-sm">
          <span class="text-stone-400 text-[10px] font-black uppercase tracking-widest">Deck Revenue</span>
          <div class="mt-2 text-3xl font-black text-white">GH₵ {{ orderSummary.revenue.toFixed(2) }}</div>
        </div>
      </div>

      <section class="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div class="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-stone-900">Recent Spark Deck Orders</h2>
            <p class="text-sm text-stone-500 mt-1">Recent purchases waiting for fulfillment or confirmation.</p>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-stone-400">{{ orders.length }} recent</span>
        </div>

        <div v-if="orders.length === 0" class="px-6 py-12 text-center text-stone-400">
          No Spark Deck orders yet.
        </div>

        <div v-else class="divide-y divide-stone-100">
          <div v-for="order in orders" :key="order.id" class="px-6 py-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-bold text-stone-900">{{ order.shipping_name || 'Unknown recipient' }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  :class="order.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'">
                  {{ order.status }}
                </span>
              </div>
              <p class="text-sm text-stone-600 mt-1">{{ order.shipping_phone || 'No phone on file' }}</p>
              <p class="text-sm text-stone-500 mt-1">{{ order.shipping_address || 'No delivery address captured' }}</p>
            </div>

            <div class="md:text-right shrink-0">
              <div class="text-sm font-black text-stone-900">GH₵ {{ Number(order.amount || 0).toFixed(2) }}</div>
              <div class="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-1">{{ formatDate(order.created_at) }}</div>
              <div class="text-[11px] font-mono text-stone-400 mt-1">{{ order.provider_ref }}</div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="polls.length === 0" class="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
        <div class="text-4xl mb-4">🎴</div>
        <h3 class="text-xl font-bold text-stone-900 mb-2">No polls found</h3>
        <p class="text-stone-500 mb-6">Create your first poll to sync physical Spark decks.</p>
        <button @click="openCreateModal" class="text-black font-semibold hover:underline">Create Poll</button>
      </div>

      <section v-for="level in ['spark', 'fire', 'inferno', 'wildcard']" :key="level">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xl font-bold text-stone-900 capitalize" :class="getLevelTextColor(level)">The {{ level }}</h2>
          <span class="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">
            {{ groupedPolls[level]?.length || 0 }} Polls
          </span>
        </div>
        
        <div v-if="!groupedPolls[level] || groupedPolls[level].length === 0" class="p-6 bg-stone-50 rounded-2xl border border-stone-100 text-center text-stone-400 text-sm font-medium">
           No polls configured for this level.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="poll in groupedPolls[level]" 
            :key="poll.id" 
            class="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full"
            :class="{ 'opacity-60 grayscale': !poll.is_active }"
          >
            <!-- Actions Overlay -->
            <div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button @click="editPoll(poll)" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-black hover:text-white transition-colors">✎</button>
              <button @click="confirmDelete(poll)" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">×</button>
            </div>

            <!-- Meta Row -->
            <div class="flex items-center gap-2 mb-3 text-xs font-medium">
              <span class="bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">{{ poll.season || 'Standard' }}</span>
              <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{{ poll.country || 'Global' }}</span>
              <button 
                @click="toggleActive(poll)" 
                class="ml-auto px-2 py-0.5 rounded transition-colors uppercase tracking-wider text-[10px] font-bold"
                :class="poll.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-stone-400 hover:text-stone-800'"
              >
                {{ poll.is_active ? 'Live' : 'Set Active' }}
              </button>
            </div>

            <h3 class="font-black text-stone-900 text-xl mb-4 pr-16 leading-tight">{{ poll.question }}</h3>

            <!-- Massive Brutalist Stats & Progress for standard polls -->
            <div v-if="poll.level_id !== 'wildcard'" class="mt-auto space-y-4 pb-4">
               <div class="border-2 border-stone-200 rounded-xl p-3 bg-stone-50 transition-colors" :class="{'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white': (poll.option_a_count || 0) > (poll.option_b_count || 0)}">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-black uppercase tracking-wider text-black truncate pr-2">{{ poll.option_a_label }}</span>
                   <div class="text-right">
                      <span class="text-xs font-bold text-stone-500 mr-2">{{ getPercentage(poll.option_a_count, poll.option_b_count) }}%</span>
                      <span class="text-xl font-black text-black">{{ poll.option_a_count || 0 }}</span>
                   </div>
                 </div>
                 <div class="h-2 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                   <div class="h-full transition-all duration-500 ease-out" :class="getLevelBgColor(poll.level_id)" :style="{ width: getPercentage(poll.option_a_count, poll.option_b_count) + '%' }"></div>
                 </div>
               </div>

               <div class="border-2 border-stone-200 rounded-xl p-3 bg-stone-50 transition-colors" :class="{'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white': (poll.option_b_count || 0) > (poll.option_a_count || 0)}">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-black uppercase tracking-wider text-black truncate pr-2">{{ poll.option_b_label }}</span>
                   <div class="text-right">
                      <span class="text-xs font-bold text-stone-500 mr-2">{{ getPercentage(poll.option_b_count, poll.option_a_count) }}%</span>
                      <span class="text-xl font-black text-black">{{ poll.option_b_count || 0 }}</span>
                   </div>
                 </div>
                 <div class="h-2 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                   <div class="h-full transition-all duration-500 ease-out" :class="getLevelBgColor(poll.level_id)" :style="{ width: getPercentage(poll.option_b_count, poll.option_a_count) + '%' }"></div>
                 </div>
               </div>
            </div>

            <!-- Spacer for wildcards to maintain card layout -->
            <div v-if="poll.level_id === 'wildcard'" class="mt-auto h-4"></div>

            <!-- Footer Meta -->
            <div class="pt-4 border-t border-stone-100 flex items-center text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-2 relative" :class="poll.level_id === 'wildcard' ? 'justify-start' : 'justify-between'">
               <span class="flex items-center gap-1.5" title="Total unique times this question was viewed">
                 👁️ <span class="text-black">{{ poll.view_count || 0 }}</span> Views
               </span>
               
               <button v-if="poll.is_active && poll.level_id !== 'wildcard'" @click="triggerConfetti(poll)" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black text-white border-2 border-black rounded-full transition-all font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] hover:bg-white hover:text-black active:scale-95 hover:translate-y-0.5" title="Blast Confetti!">
                  🎉 Blast
               </button>

               <span class="flex items-center gap-1.5 ml-auto" v-if="poll.level_id !== 'wildcard'" title="Total amount of votes cast">
                 ✓ <span class="text-black">{{ (poll.option_a_count || 0) + (poll.option_b_count || 0) }}</span> Votes
               </span>
            </div>
            
          </div>
        </div>
      </section>
    </div>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="closeModal"></div>
        
        <!-- Modal Card -->
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="px-8 py-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <div>
              <h2 class="text-xl font-bold text-stone-900">{{ isEditing ? 'Edit Poll' : 'New Poll' }}</h2>
              <p class="text-sm text-stone-500">Configure vibe check question</p>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-black transition-colors" @click="closeModal">×</button>
          </div>

          <!-- Content -->
          <div class="p-8 space-y-8">
            <form @submit.prevent="savePoll" id="pollForm">
              
              <!-- Context Group -->
              <div>
                 <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">Context</h3>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Level</label>
                      <select v-model="form.level_id" required class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                        <option value="spark">The Spark</option>
                        <option value="fire">The Fire</option>
                        <option value="inferno">The Inferno</option>
                        <option value="wildcard">The Wildcard</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Season</label>
                      <select v-model="form.season" class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                        <option value="Standard">Standard (Year-round)</option>
                        <option value="New Year">🎆 New Year</option>
                        <option value="Valentine's Day">💘 Valentine's Day</option>
                        <option value="Easter">🐰 Easter</option>
                        <option value="Summer Break">☀️ Summer</option>
                        <option value="Halloween">🎃 Halloween</option>
                        <option value="Thanksgiving">🦃 Thanksgiving</option>
                        <option value="Detty December">🎉 Detty December</option>
                        <option value="Christmas">🎄 Christmas</option>
                        <option value="Winter">❄️ Winter</option>
                        <option value="Special Event">🔥 Special Event</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Country/Region</label>
                      <select v-model="form.country" class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                        <option value="Global">🌍 Global (Default)</option>
                        <option value="Ghana">🇬🇭 Ghana</option>
                        <option value="United Kingdom">🇬🇧 United Kingdom</option>
                        <option value="United States">🇺🇸 United States</option>
                        <option value="Nigeria">🇳🇬 Nigeria</option>
                        <option value="Kenya">🇰🇪 Kenya</option>
                        <option value="South Africa">🇿🇦 South Africa</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="France">🇫🇷 France</option>
                      </select>
                    </div>
                 </div>
              </div>

              <!-- Question Group -->
              <div>
                 <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 pt-4 border-t border-stone-100">The Question</h3>
                 <div class="space-y-4">
                    <div class="form-group">
                      <input v-model="form.question" type="text" placeholder="e.g. Jollof or Waakye?" required
                        class="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-lg font-medium" />
                    </div>

                    <div v-if="form.level_id !== 'wildcard'" class="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                       <div class="form-group">
                         <label class="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Option A Label</label>
                         <input v-model="form.option_a_label" type="text" placeholder="Ghana Jollof" :required="form.level_id !== 'wildcard'"
                           class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
                       </div>
                       <div class="form-group">
                         <label class="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Option B Label</label>
                         <input v-model="form.option_b_label" type="text" placeholder="Waakye" :required="form.level_id !== 'wildcard'"
                           class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Media & Delivery -->
              <div>
                 <h3 v-if="form.level_id !== 'wildcard'" class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 pt-4 border-t border-stone-100">Media & Delivery</h3>
                 <div class="space-y-4">
                    <div v-if="form.level_id !== 'wildcard'" class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Custom Spotify Playlist URI (Optional)</label>
                      <input v-model="form.spotify_uri" type="text" placeholder="https://open.spotify.com/playlist/..."
                        class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm" />
                      <p class="text-xs text-stone-400 mt-1">Leave blank to use the default Tech-Noir playlist for this level.</p>
                    </div>

                    <p v-if="form.level_id === 'wildcard'" class="text-xs text-stone-400">
                      Wildcards now follow the same country and season targeting rules as the main deck.
                    </p>

                    <label class="flex items-center gap-3 cursor-pointer select-none mt-4 py-2" :class="{'pt-4 border-t border-stone-100': form.level_id === 'wildcard'}">
                       <input type="checkbox" v-model="form.is_active" class="w-5 h-5 rounded text-black focus:ring-black border-stone-300" />
                       <span v-if="form.level_id === 'wildcard'" class="font-medium text-stone-900">Include in Active Wildcard Pool</span>
                       <span v-else class="font-medium text-stone-900">Set as Active Poll</span>
                    </label>
                 </div>
              </div>

            </form>
          </div>
          
          <!-- Footer -->
          <div class="p-6 border-t border-stone-100 bg-stone-50 rounded-b-3xl flex justify-end gap-3 sticky bottom-0">
            <button type="button" class="px-6 py-2 rounded-xl font-medium text-stone-500 hover:bg-stone-200 transition-colors" @click="closeModal">Cancel</button>
            <button 
              type="submit" 
              form="pollForm"
              class="px-8 py-2 rounded-xl font-medium bg-black text-white hover:scale-105 transition-transform shadow-lg shadow-stone-300 disabled:opacity-50 disabled:hover:scale-100"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Poll' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'

useHead({ title: 'Spark Deck Manager' })

definePageMeta({ 
  layout: 'admin', 
  middleware: ['admin'] 
})

const supabase = useSupabaseClient()
const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const polls = ref<any[]>([])
const orders = ref<any[]>([])
const showModal = ref(false)
const isEditing = ref(false)
const orderSummary = ref({
  total: 0,
  revenue: 0,
  pending: 0,
  success: 0,
  failed: 0
})

type SparkDeckDashboardResponse = {
  success: boolean
  polls: any[]
  orders: any[]
  orderSummary: {
    total: number
    revenue: number
    pending: number
    success: number
    failed: number
  }
}

const form = ref({
  id: '',
  level_id: 'spark',
  season: 'Standard',
  country: 'Global',
  question: '',
  option_a_label: '',
  option_b_label: '',
  spotify_uri: '',
  is_active: false
})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const response = await $fetch<SparkDeckDashboardResponse>('/api/admin/spark-deck/data')
    polls.value = response.polls || []
    orders.value = response.orders || []
    orderSummary.value = response.orderSummary || orderSummary.value
  } catch (error: any) {
    console.error('Failed to fetch Spark Deck dashboard:', error)
    toast.error('Load Failed', error?.data?.statusMessage || error?.message || 'Could not load Spark Deck manager data.')
  } finally {
    loading.value = false
  }
}

const groupedPolls = computed(() => {
  const groups: Record<string, any[]> = { spark: [], fire: [], inferno: [], wildcard: [] }
  polls.value.forEach(p => {
     if (groups[p.level_id]) groups[p.level_id].push(p)
  })
  return groups
})

onMounted(fetchDashboard)

const getPercentage = (count1: number, count2: number) => {
  const safeCount1 = count1 || 0
  const safeCount2 = count2 || 0
  const total = safeCount1 + safeCount2
  if (total === 0) return 0
  return Math.round((safeCount1 / total) * 100)
}

const getLevelTextColor = (lvl: string) => {
   if(lvl === 'spark') return 'text-yellow-600'
   if(lvl === 'fire') return 'text-orange-600'
   if(lvl === 'inferno') return 'text-rose-600'
   if(lvl === 'wildcard') return 'text-purple-600'
   return 'text-stone-900'
}

const getLevelBgColor = (lvl: string) => {
   if(lvl === 'spark') return 'bg-yellow-400'
   if(lvl === 'fire') return 'bg-orange-500'
   if(lvl === 'inferno') return 'bg-rose-500'
   if(lvl === 'wildcard') return 'bg-purple-500'
   return 'bg-black'
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    id: '', level_id: 'spark', season: 'Standard', country: 'Global', question: '', option_a_label: '', option_b_label: '', spotify_uri: '', is_active: true
  }
  showModal.value = true
}

const editPoll = (poll: any) => {
  isEditing.value = true
  form.value = { ...poll, country: poll.country || 'Global', spotify_uri: poll.spotify_uri || '' }
  showModal.value = true
}

const closeModal = () => showModal.value = false

const savePoll = async () => {
  saving.value = true
  try {
     await $fetch('/api/admin/spark-deck/save', {
       method: 'POST',
       body: { ...form.value }
     })

     await fetchDashboard()
     closeModal()
     toast.success(isEditing.value ? 'Poll Updated' : 'Poll Created', isEditing.value ? 'Spark Deck poll updated successfully.' : 'New Spark Deck poll created successfully.')
  } catch (err) {
     console.error('Failed saving', err)
     const error = err as any
     toast.error('Save Failed', error?.data?.statusMessage || error?.message || 'Could not save this poll.')
  } finally {
     saving.value = false
  }
}

const toggleActive = async (poll: any) => {
   try {
      const newStatus = !poll.is_active
      await $fetch('/api/admin/spark-deck/toggle', {
        method: 'POST',
        body: { pollId: poll.id }
      })
      await fetchDashboard()
      toast.info('Status Updated', `${poll.question} is now ${newStatus ? 'live' : 'inactive'}.`)
   } catch (err: any) {
      console.error('Failed to toggle poll:', err)
      toast.error('Update Failed', err?.data?.statusMessage || err?.message || 'Could not update this poll.')
   }
}

const triggerConfetti = async (poll: any) => {
   // Send an ephemeral broadcast directly to all current users viewing this poll's sync page!
   const channel = supabase.channel(`m2m:poll_${poll.id}`)
   channel.subscribe(async (status) => {
     if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'confetti',
          payload: { trigger: true }
        })
        
        // Notify Discord that the host just triggered confetti
        await $fetch('/api/admin/notify-spark', {
           method: 'POST',
           body: { action: 'confetti', poll }
        }).catch(() => {})
        
        setTimeout(() => { supabase.removeChannel(channel) }, 1000)
        toast.success('Confetti Sent', 'Live players on this poll just got the blast.')
     }
   })
}

const confirmDelete = async (poll: any) => {
  if (!confirm(`Are you sure you want to completely delete this poll?`)) return
  try {
    await $fetch('/api/admin/spark-deck/delete', {
      method: 'POST',
      body: { pollId: poll.id }
    })
    await fetchDashboard()
    toast.success('Poll Deleted', 'Spark Deck poll removed successfully.')
  } catch (err: any) {
    console.error('Failed to delete poll:', err)
    toast.error('Delete Failed', err?.data?.statusMessage || err?.message || 'Could not delete this poll.')
  }
}

const formatDate = (value: string) => {
  if (!value) return 'Unknown time'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
