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

    <!-- Empty State -->
    <div v-else-if="polls.length === 0" class="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
      <div class="text-4xl mb-4">🎴</div>
      <h3 class="text-xl font-bold text-stone-900 mb-2">No polls found</h3>
      <p class="text-stone-500 mb-6">Create your first poll to sync physical Spark decks.</p>
      <button @click="openCreateModal" class="text-black font-semibold hover:underline">Create Poll</button>
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

      <section v-for="level in ['spark', 'fire', 'inferno']" :key="level">
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

            <!-- Massive Brutalist Stats & Progress -->
            <div class="mt-auto space-y-4 pb-4">
               <div class="border-2 border-stone-200 rounded-xl p-3 bg-stone-50 transition-colors" :class="{'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white': poll.option_a_count > poll.option_b_count}">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-black uppercase tracking-wider text-black truncate pr-2">{{ poll.option_a_label }}</span>
                   <div class="text-right">
                      <span class="text-xs font-bold text-stone-500 mr-2">{{ getPercentage(poll.option_a_count, poll.option_b_count) }}%</span>
                      <span class="text-xl font-black text-black">{{ poll.option_a_count }}</span>
                   </div>
                 </div>
                 <div class="h-2 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                   <div class="h-full transition-all duration-500 ease-out" :class="getLevelBgColor(poll.level_id)" :style="{ width: getPercentage(poll.option_a_count, poll.option_b_count) + '%' }"></div>
                 </div>
               </div>

               <div class="border-2 border-stone-200 rounded-xl p-3 bg-stone-50 transition-colors" :class="{'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white': poll.option_b_count > poll.option_a_count}">
                 <div class="flex justify-between items-end mb-2">
                   <span class="text-sm font-black uppercase tracking-wider text-black truncate pr-2">{{ poll.option_b_label }}</span>
                   <div class="text-right">
                      <span class="text-xs font-bold text-stone-500 mr-2">{{ getPercentage(poll.option_b_count, poll.option_a_count) }}%</span>
                      <span class="text-xl font-black text-black">{{ poll.option_b_count }}</span>
                   </div>
                 </div>
                 <div class="h-2 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                   <div class="h-full transition-all duration-500 ease-out" :class="getLevelBgColor(poll.level_id)" :style="{ width: getPercentage(poll.option_b_count, poll.option_a_count) + '%' }"></div>
                 </div>
               </div>
            </div>

            <!-- Footer Meta -->
            <div class="pt-4 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-2 relative">
               <span class="flex items-center gap-1.5" title="Total unique times this QR code was scanned">
                 👁️ <span class="text-black">{{ poll.view_count || 0 }}</span> Opens
               </span>
               
               <button v-if="poll.is_active" @click="triggerConfetti(poll)" class="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black text-white border-2 border-black rounded-full transition-all font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] hover:bg-white hover:text-black active:scale-95 hover:translate-y-0.5" title="Blast Confetti!">
                  🎉 Blast
               </button>

               <span class="flex items-center gap-1.5" title="Total amount of votes cast">
                 ✓ <span class="text-black">{{ poll.option_a_count + poll.option_b_count }}</span> Votes
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

                    <div class="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                       <div class="form-group">
                         <label class="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Option A Label</label>
                         <input v-model="form.option_a_label" type="text" placeholder="Ghana Jollof" required
                           class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
                       </div>
                       <div class="form-group">
                         <label class="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Option B Label</label>
                         <input v-model="form.option_b_label" type="text" placeholder="Waakye" required
                           class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5" />
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Media & Delivery -->
              <div>
                 <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 pt-4 border-t border-stone-100">Media & Delivery</h3>
                 <div class="space-y-4">
                    <div class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Custom Spotify Playlist URI (Optional)</label>
                      <input v-model="form.spotify_uri" type="text" placeholder="https://open.spotify.com/playlist/..."
                        class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm" />
                      <p class="text-xs text-stone-400 mt-1">Leave blank to use the default Tech-Noir playlist for this level.</p>
                    </div>

                    <label class="flex items-center gap-3 cursor-pointer select-none mt-4 py-2">
                       <input type="checkbox" v-model="form.is_active" class="w-5 h-5 rounded text-black focus:ring-black border-stone-300" />
                       <span class="font-medium text-stone-900">Set as Active Poll</span>
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

useHead({ title: 'Spark Deck Manager' })

definePageMeta({ 
  layout: 'admin', 
  middleware: ['admin'] 
})

const supabase = useSupabaseClient()
const loading = ref(true)
const saving = ref(false)
const polls = ref<any[]>([])
const showModal = ref(false)
const isEditing = ref(false)

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

const fetchPolls = async () => {
  loading.value = true
  const { data, error } = await supabase.schema('m2m').from('poll_questions').select('*').order('created_at', { ascending: false })
  if (!error && data) {
    polls.value = data
  }
  loading.value = false
}

const groupedPolls = computed(() => {
  const groups: Record<string, any[]> = { spark: [], fire: [], inferno: [] }
  polls.value.forEach(p => {
     if (groups[p.level_id]) groups[p.level_id].push(p)
  })
  return groups
})

onMounted(fetchPolls)

const getPercentage = (count1: number, count2: number) => {
  const total = count1 + count2
  if (total === 0) return 0
  return Math.round((count1 / total) * 100)
}

const getLevelTextColor = (lvl: string) => {
   if(lvl === 'spark') return 'text-yellow-600'
   if(lvl === 'fire') return 'text-orange-600'
   if(lvl === 'inferno') return 'text-rose-600'
   return 'text-stone-900'
}

const getLevelBgColor = (lvl: string) => {
   if(lvl === 'spark') return 'bg-yellow-400'
   if(lvl === 'fire') return 'bg-orange-500'
   if(lvl === 'inferno') return 'bg-rose-500'
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
     const payload = {
        level_id: form.value.level_id,
        season: form.value.season || 'Standard',
        country: form.value.country || 'Global',
        question: form.value.question,
        option_a_label: form.value.option_a_label,
        option_b_label: form.value.option_b_label,
        spotify_uri: form.value.spotify_uri || null,
        is_active: form.value.is_active
     }

     if (form.value.is_active) {
         // Auto-disable others in the same level/country/season logically
         await supabase.schema('m2m').from('poll_questions').update({ is_active: false } as any)
            .eq('level_id', form.value.level_id)
            .eq('country', form.value.country || 'Global')
            .eq('season', form.value.season || 'Standard')
     }

     if (isEditing.value && form.value.id) {
         await supabase.schema('m2m').from('poll_questions').update(payload as any).eq('id', form.value.id)
     } else {
         await supabase.schema('m2m').from('poll_questions').insert(payload as any)
         
         // Notify Discord of new content!
         await $fetch('/api/admin/notify-spark', {
            method: 'POST',
            body: { action: 'created', poll: form.value }
         }).catch(() => {})
     }
     
     await fetchPolls()
     closeModal()
  } catch (err) {
     console.error('Failed saving', err)
  }
  saving.value = false
}

const toggleActive = async (poll: any) => {
   const newStatus = !poll.is_active
   if (newStatus) {
      // Turn off other active polls for this exact segment
      await supabase.schema('m2m').from('poll_questions').update({ is_active: false } as any)
         .eq('level_id', poll.level_id)
         .eq('country', poll.country || 'Global')
         .eq('season', poll.season || 'Standard')
         
      // Notify Discord that a new poll went Live
      await $fetch('/api/admin/notify-spark', {
         method: 'POST',
         body: { action: 'live', poll }
      }).catch(() => {})
   }
   await supabase.schema('m2m').from('poll_questions').update({ is_active: newStatus } as any).eq('id', poll.id)
   await fetchPolls()
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
     }
   })
}

const confirmDelete = async (poll: any) => {
  if (!confirm(`Are you sure you want to completely delete this poll?`)) return
  await supabase.schema('m2m').from('poll_questions').delete().eq('id', poll.id)
  await fetchPolls()
}
</script>
