<template>
  <div class="max-w-5xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-stone-900">Vibe Questions</h1>
        <p class="text-stone-500 mt-2">Manage the questions that power the compatibility algorithm.</p>
      </div>
      <button 
        @click="openCreateModal" 
        class="bg-black text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-stone-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <span>+</span> New Question
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-stone-400">
      <div class="w-10 h-10 border-4 border-stone-200 border-t-black rounded-full animate-spin mb-4"></div>
      Loading questions...
    </div>

    <!-- Empty State -->
    <div v-else-if="questions.length === 0" class="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
      <div class="text-4xl mb-4">📝</div>
      <h3 class="text-xl font-bold text-stone-900 mb-2">No questions yet</h3>
      <p class="text-stone-500 mb-6">Start by adding your first vibe check question.</p>
      <button @click="openCreateModal" class="text-black font-semibold hover:underline">Create Question</button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-10">
      
      <!-- Core Questions Section -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xl font-bold text-stone-900">Core Questions</h2>
          <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            For Compatibility
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="question in coreQuestions" 
            :key="question.key" 
            class="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            :class="{ 'opacity-60 grayscale': !question.is_active }"
          >
            <!-- Badge overlay -->
            <div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button @click="editQuestion(question)" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-black hover:text-white transition-colors">✎</button>
              <button @click="confirmDelete(question)" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">×</button>
            </div>

            <div class="flex flex-col h-full">
              <!-- Meta Row -->
              <div class="flex items-center gap-2 mb-3 text-xs font-medium text-stone-400">
                <span class="font-mono bg-stone-100 px-1.5 py-0.5 rounded">#{{ question.display_order }}</span>
                <span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                  ⚖️ {{ question.weight }} pts
                </span>
                <span class="capitalize ml-auto" :class="question.is_active ? 'text-green-600' : 'text-stone-300'">
                  {{ question.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <!-- Question -->
              <h3 class="font-bold text-stone-900 text-lg mb-1 leading-snug pr-16">{{ question.question }}</h3>
              <p class="text-xs text-stone-500 font-medium mb-4 uppercase tracking-wider">{{ question.dimension?.replace('_', ' ') }}</p>

              <!-- Options Preview -->
              <div class="mt-auto">
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="(opt, idx) in question.options.slice(0, 3)" 
                    :key="idx" 
                    class="text-[10px] px-2 py-1 bg-stone-50 border border-stone-100 rounded-md text-stone-600 truncate max-w-[150px]"
                  >
                    {{ opt }}
                  </span>
                  <span v-if="question.options.length > 3" class="text-[10px] px-1.5 py-1 text-stone-400">
                    +{{ question.options.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bonus Questions Section -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xl font-bold text-stone-900">Bonus Questions</h2>
          <span class="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
            For Vibe Check
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="question in bonusQuestions" 
            :key="question.key" 
            class="group bg-white p-4 rounded-2xl border border-stone-200 hover:border-stone-300 transition-all flex flex-col h-full"
            :class="{ 'opacity-60': !question.is_active }"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                {{ question.category }}
              </span>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button @click="editQuestion(question)" class="text-stone-400 hover:text-black">✎</button>
                 <button @click="confirmDelete(question)" class="text-stone-400 hover:text-red-500">×</button>
              </div>
            </div>

            <h3 class="font-semibold text-stone-900 text-sm mb-3 line-clamp-2">{{ question.question }}</h3>
            
            <div class="mt-auto pt-3 border-t border-stone-50">
              <div class="flex justify-between items-center text-xs text-stone-400">
                 <span>Order: {{ question.display_order }}</span>
                 <span>{{ question.options.length }} options</span>
              </div>
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
              <h2 class="text-xl font-bold text-stone-900">{{ isEditing ? 'Edit Question' : 'New Question' }}</h2>
              <p class="text-sm text-stone-500">Configure vibe check details</p>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-black transition-colors" @click="closeModal">×</button>
          </div>

          <!-- Content -->
          <div class="p-8 space-y-8">
            <form @submit.prevent="saveQuestion" id="questionForm">
              
              <!-- Basic Info Group -->
              <div>
                 <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">Basics</h3>
                 <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="form-group">
                        <label class="block text-sm font-medium text-stone-700 mb-1">Key (Unique ID)</label>
                        <input v-model="form.key" type="text" :disabled="isEditing" placeholder="love_language" required
                          class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 disabled:bg-stone-50 font-mono text-sm" />
                      </div>
                      <div class="form-group">
                        <label class="block text-sm font-medium text-stone-700 mb-1">Category</label>
                        <select v-model="form.category" class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                          <option value="general">General</option>
                          <option value="romance">Romance</option>
                          <option value="lifestyle">Lifestyle</option>
                          <option value="values">Values</option>
                          <option value="fun">Fun</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="block text-sm font-medium text-stone-700 mb-1">Question Text</label>
                      <input v-model="form.question" type="text" placeholder="e.g. How do you spend your weekends?" required
                        class="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-lg font-medium" />
                    </div>
                 </div>
              </div>

               <!-- Sorting & Matching Group -->
               <div>
                 <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 pt-4 border-t border-stone-100">Matching Logic</h3>
                 <div class="bg-stone-50 p-4 rounded-xl space-y-4">
                    <div class="flex items-center gap-4">
                       <label class="flex items-center gap-2 cursor-pointer select-none">
                          <input type="checkbox" v-model="form.is_core" class="w-5 h-5 rounded text-black focus:ring-black border-stone-300" />
                          <span class="font-medium text-stone-900">Core Question?</span>
                       </label>
                       <span class="text-xs text-stone-500">Enable this if the question is critical for compatibility scoring.</span>
                    </div>

                    <div v-if="form.is_core" class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                       <div>
                          <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Weight (0-15)</label>
                          <input v-model.number="form.weight" type="number" min="0" max="20" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white" />
                       </div>
                       <div>
                          <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Dimension</label>
                          <select v-model="form.dimension" class="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white">
                             <option value="general">General</option>
                             <option value="love_language">Love Language</option>
                             <option value="communication">Communication</option>
                             <option value="social">Social Energy</option>
                             <option value="life_goals">Life Goals</option>
                             <option value="pace">Relationship Pace</option>
                          </select>
                       </div>
                    </div>
                    
                    <div>
                       <label class="block text-xs font-bold uppercase text-stone-500 mb-1">Display Order</label>
                       <input v-model.number="form.display_order" type="number" class="w-24 px-3 py-2 rounded-lg border border-stone-200 bg-white" />
                    </div>
                 </div>
               </div>

              <!-- Options Group -->
              <div>
                <div class="flex justify-between items-center mb-4 pt-4 border-t border-stone-100">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400">Answer Options</h3>
                  <button type="button" @click="addOption" class="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">+ Add Option</button>
                </div>
                
                <div class="space-y-2">
                  <div v-for="(opt, idx) in form.options" :key="idx" class="flex gap-2 items-center group">
                    <span class="text-stone-300 font-mono text-xs w-6">{{ idx + 1 }}.</span>
                    <input 
                      v-model="form.options[idx]" 
                      type="text" 
                      placeholder="Option text"
                      required
                      class="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <button type="button" @click="removeOption(idx)" class="w-8 h-8 flex items-center justify-center rounded-full text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">×</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Footer -->
          <div class="p-6 border-t border-stone-100 bg-stone-50 rounded-b-3xl flex justify-end gap-3 sticky bottom-0">
            <button type="button" class="px-6 py-2 rounded-xl font-medium text-stone-500 hover:bg-stone-200 transition-colors" @click="closeModal">Cancel</button>
            <button 
              type="submit" 
              form="questionForm"
              class="px-8 py-2 rounded-xl font-medium bg-black text-white hover:scale-105 transition-transform shadow-lg shadow-stone-300 disabled:opacity-50 disabled:hover:scale-100"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Question' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'Vibe Questions' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()
const loading = ref(true)
const saving = ref(false)
const questions = ref<any[]>([])
const showModal = ref(false)
const isEditing = ref(false)

const form = ref({
  key: '',
  question: '',
  category: 'general',
  display_order: 0,
  is_core: false,
  weight: 0,
  dimension: 'general',
  options: ['']
})

const sortedQuestions = computed(() => {
  return [...questions.value].sort((a, b) => {
    // Sort logic: Core first, then by order
    if (a.is_core && !b.is_core) return -1
    if (!a.is_core && b.is_core) return 1
    return a.display_order - b.display_order
  })
})

const coreQuestions = computed(() => sortedQuestions.value.filter(q => q.is_core))
const bonusQuestions = computed(() => sortedQuestions.value.filter(q => !q.is_core))

const fetchQuestions = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .schema('m2m')
      .from('questions')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    questions.value = data || []
  } catch (e) {
    console.error('Error fetching questions:', e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  // Find next order
  const maxOrder = questions.value.reduce((max, q) => Math.max(max, q.display_order || 0), 0)
  
  form.value = {
    key: '',
    question: '',
    category: 'general',
    display_order: maxOrder + 1,
    is_core: false,
    weight: 1,
    dimension: 'general',
    options: ['', '']
  }
  showModal.value = true
}

const editQuestion = (question: any) => {
  isEditing.value = true
  form.value = {
    key: question.key,
    question: question.question,
    category: question.category,
    display_order: question.display_order,
    is_core: !!question.is_core,
    weight: question.weight || 1,
    dimension: question.dimension || 'general',
    options: [...question.options] // Clone array
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const addOption = () => {
  form.value.options.push('')
}

const removeOption = (idx: number) => {
  if (form.value.options.length <= 2) return // Keep at least 2
  form.value.options.splice(idx, 1)
}

const saveQuestion = async () => {
  if (saving.value) return
  if (!form.value.key || !form.value.question || form.value.options.length < 2) {
    alert('Please fill in all fields and provide at least 2 options.')
    return
  }

  saving.value = true
  try {
    const payload = {
      key: form.value.key,
      question: form.value.question,
      category: form.value.category,
      display_order: form.value.display_order,
      is_core: form.value.is_core,
      weight: form.value.weight,
      dimension: form.value.dimension,
      options: form.value.options.filter(o => o.trim() !== '')
    }

    if (isEditing.value) {
      const { error } = await supabase
        .schema('m2m')
      .from('questions')
        .update(payload)
        .eq('key', form.value.key)
      if (error) throw error
    } else {
      const { error } = await supabase
        .schema('m2m')
      .from('questions')
        .insert(payload)
      if (error) throw error
    }

    await fetchQuestions()
    closeModal()
  } catch (e: any) {
    console.error('Error saving question:', e)
    alert(e.message || 'Failed to save question')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (question: any) => {
  if (!confirm(`Are you sure you want to delete "${question.question}"?`)) return

  try {
    const { error } = await supabase
      .schema('m2m')
      .from('questions')
      .delete()
      .eq('key', question.key)
    
    if (error) throw error
    await fetchQuestions()
  } catch (e) {
    console.error('Error deleting question:', e)
  }
}

onMounted(() => {
  fetchQuestions()
})
</script>
