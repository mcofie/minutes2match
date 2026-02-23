<template>
  <div class="dashboard-page">
    <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
          Platform Quality Audit 🛡️
        </h1>
        <p class="text-stone-500">Maintaining premium candidate pool integrity through behavioral analysis.</p>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="runAudit(true)" 
          :disabled="loading"
          class="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <span v-else>✨ Run AI Intelligence Check</span>
        </button>
        <button 
          @click="runAudit(false)" 
          :disabled="loading"
          class="bg-white text-stone-900 border border-stone-200 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all disabled:opacity-50"
        >
          {{ loading ? 'Analyzing...' : 'Refresh Standard Audit' }}
        </button>
      </div>
    </header>

    <div v-if="auditData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="stat-card">
        <span class="block text-3xl font-black text-stone-900 mb-1">{{ auditData.auditCount }}</span>
        <span class="text-xs font-bold text-stone-500 uppercase tracking-widest">Profiles Audited</span>
      </div>
      <div class="stat-card">
        <span class="block text-3xl font-black text-orange-600 mb-1">{{ auditData.purgeCount }}</span>
        <span class="text-xs font-bold text-stone-500 uppercase tracking-widest">Recommended for Purge</span>
      </div>
      <div class="stat-card">
        <span class="block text-3xl font-black text-emerald-600 mb-1">{{ integrityRate }}%</span>
        <span class="text-xs font-bold text-stone-500 uppercase tracking-widest">Integrity Rating</span>
      </div>
      <div class="stat-card">
        <span class="block text-3xl font-black text-stone-900 mb-1">{{ new Date(auditData.timestamp).toLocaleTimeString() }}</span>
        <span class="text-xs font-bold text-stone-500 uppercase tracking-widest">Last Run Time</span>
      </div>
    </div>

    <!-- API Key Warning -->
    <div v-if="auditData && !auditData.diagnostics?.hasGeminiKey" class="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3">
       <span class="text-xl">⚠️</span>
       <div>
          <div class="text-sm font-bold text-orange-800">Gemini API Key Missing</div>
          <div class="text-xs text-orange-700">The AI features are disabled. Please add <code>GEMINI_API_KEY</code> to your <code>.env</code> and restart the server.</div>
       </div>
    </div>

    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 class="text-lg font-bold text-stone-900">Purge Recommendation List</h2>
        <div class="flex gap-2">
           <button class="btn-secondary text-xs" :disabled="!selectedUsers.length">Bulk Re-Verify</button>
           <button class="btn-secondary text-xs bg-red-50 text-red-600 border-red-100" :disabled="!selectedUsers.length">Bulk Deactivate</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-stone-50">
            <tr>
              <th class="p-4 border-b border-stone-100">
                <input type="checkbox" class="rounded border-stone-300" @change="toggleAll" :checked="allSelected" />
              </th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">Candidate</th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">Behavioral Score</th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">AI Intelligence</th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">Red Flags</th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">Stats</th>
              <th class="p-4 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-if="loading" v-for="i in 5" :key="i">
              <td colspan="6" class="p-8 text-center animate-pulse text-stone-300">Scanning data nodes...</td>
            </tr>
            <tr v-else-if="!auditData?.results.length" class="text-center">
              <td colspan="6" class="p-12 text-stone-400 italic">No users found violating integrity thresholds. Platform is healthy! ✨</td>
            </tr>
            <tr v-for="user in auditData?.results" :key="user.id" class="hover:bg-stone-50 transition-colors">
              <td class="p-4">
                <input type="checkbox" v-model="selectedUsers" :value="user.id" class="rounded border-stone-300" />
              </td>
              <td class="p-4">
                <div class="font-bold text-stone-900">{{ user.display_name || 'Hidden Name' }}</div>
                <div class="text-[10px] font-mono text-stone-500">{{ user.phone }}</div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 w-16 bg-stone-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" 
                         :class="user.quality_score > 50 ? 'bg-orange-400' : 'bg-red-500'"
                         :style="{ width: user.quality_score + '%' }"></div>
                  </div>
                  <span class="text-xs font-black" :class="user.quality_score > 50 ? 'text-orange-600' : 'text-red-600'">{{ user.quality_score }}</span>
                </div>
              </td>
              <td class="p-4">
                <div v-if="user.ai_analysis" class="space-y-1">
                   <div class="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                      <span class="text-stone-400">Coherence</span>
                      <span :class="user.ai_analysis.coherence_score > 60 ? 'text-emerald-600' : 'text-red-500'">{{ user.ai_analysis.coherence_score }}%</span>
                   </div>
                   <div class="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                      <span class="text-stone-400">Effort</span>
                      <span :class="user.ai_analysis.effort_score > 60 ? 'text-emerald-600' : 'text-red-500'">{{ user.ai_analysis.effort_score }}%</span>
                   </div>
                   <div class="text-[8px] text-stone-400 italic line-clamp-1 truncate w-24" :title="user.ai_analysis.summary">
                      {{ user.ai_analysis.summary }}
                   </div>
                </div>
                <div v-else class="text-[9px] font-bold text-stone-300 italic">No AI Data</div>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="reason in user.reasons" :key="reason" class="text-[9px] font-black px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100">
                    {{ reason }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <div class="text-[10px] font-bold text-stone-500 leading-tight">
                  <div>{{ user.stats.unlocked }} Unlocked / {{ user.stats.matches }} Matches</div>
                  <div>{{ user.stats.vibe_questions }} Vibe Points • {{ user.stats.badges }} Badges</div>
                </div>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button class="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-900 transition-colors" title="View Profile">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="p-1.5 hover:bg-red-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors" title="Deactivate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
const auditData = ref<any>(null)
const selectedUsers = ref<string[]>([])

const integrityRate = computed(() => {
  if (!auditData.value) return 0
  return Math.round(((auditData.value.auditCount - auditData.value.purgeCount) / auditData.value.auditCount) * 100)
})

const allSelected = computed(() => {
  return auditData.value?.results.length > 0 && selectedUsers.value.length === auditData.value.results.length
})

const toggleAll = () => {
  if (allSelected.value) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = auditData.value?.results.map((r: any) => r.id) || []
  }
}

const runAudit = async (deepDive = false) => {
  loading.value = true
  try {
    const data = await $fetch('/api/admin/quality-audit', { 
      method: 'POST',
      body: { runAIDeepDive: deepDive }
    })
    auditData.value = data
  } catch (err) {
    console.error('Audit failed:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  runAudit()
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}
.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
}
.btn-secondary {
  background: white;
  border: 1px solid #E5E7EB;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-secondary:hover:not(:disabled) {
  border-color: #000;
  background: #f9f9f9;
}
</style>
