<template>
  <div>
    <!-- Actions -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-bold m-0">Vibe Questions</h1>
      <button class="btn-primary" @click="openCreateModal">+ New Question</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-loading">Loading questions...</div>

    <!-- Empty State -->
    <div v-else-if="questions.length === 0" class="state-empty">
      <p>No questions found. Add one to get started!</p>
    </div>

    <!-- Questions Grid -->
    <div v-else class="card-grid">
      <div 
        v-for="question in sortedQuestions" 
        :key="question.key" 
        class="admin-card"
        :class="{ 'opacity-50': !question.is_active }"
      >
        <div class="admin-card__header">
          <div class="flex gap-2 items-center">
            <span class="text-xs text-muted font-mono">#{{ question.display_order }}</span>
            <span class="badge badge--gray">{{ question.category }}</span>
          </div>
          
          <button 
              @click="toggleActive(question)" 
              class="text-xs font-bold uppercase tracking-wider"
              :class="question.is_active ? 'text-green-600' : 'text-gray-400'"
            >
              {{ question.is_active ? 'Active' : 'Inactive' }}
          </button>
        </div>

        <h3 class="admin-card__title mb-4">{{ question.question }}</h3>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <span v-for="(opt, idx) in question.options" :key="idx" class="badge badge--gray bg-gray-50 border border-gray-200">
            {{ opt }}
          </span>
        </div>
        
        <div class="admin-card__actions">
          <button @click="editQuestion(question)" class="btn-secondary flex-1">Edit</button>
          <button @click="confirmDelete(question)" class="btn-danger flex-1">Delete</button>
        </div>
      </div>
    </div>

    <!-- Edit/Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal__header">
            <h2 class="modal__title">{{ isEditing ? 'Edit Question' : 'New Question' }}</h2>
            <button class="modal__close" @click="closeModal">×</button>
          </div>

          <div class="modal__content">
            <form @submit.prevent="saveQuestion">
              <div class="form-group">
                <label class="form-label">Question Key</label>
                <input 
                  v-model="form.key" 
                  type="text" 
                  placeholder="e.g. weekend_vibe" 
                  :disabled="isEditing"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Question Text</label>
                <input 
                  v-model="form.question" 
                  type="text" 
                  placeholder="e.g. What is your ideal date?" 
                  required
                  class="form-input"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select v-model="form.category" class="form-select">
                    <option value="general">General</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="values">Values</option>
                    <option value="romance">Romance</option>
                    <option value="fun">Fun</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Order</label>
                  <input 
                    v-model.number="form.display_order" 
                    type="number" 
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Options</label>
                <div class="flex flex-col gap-2 mb-3">
                  <div v-for="(opt, idx) in form.options" :key="idx" class="flex gap-2">
                    <input 
                      v-model="form.options[idx]" 
                      type="text" 
                      placeholder="Option text"
                      required
                      class="form-input"
                    />
                    <button type="button" @click="removeOption(idx)" class="btn-secondary px-3 text-red-500 hover:text-red-700">×</button>
                  </div>
                </div>
                <button type="button" @click="addOption" class="btn-secondary w-full text-xs">+ Add Option</button>
              </div>
            </form>
          </div>
          
          <div class="modal__footer">
            <button class="btn-primary w-full" @click="saveQuestion" :disabled="saving">
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

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
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
  options: ['']
})

const sortedQuestions = computed(() => {
  return [...questions.value].sort((a, b) => a.display_order - b.display_order)
})

const fetchQuestions = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
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
  form.value = {
    key: '',
    question: '',
    category: 'general',
    display_order: questions.value.length + 1,
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
      options: form.value.options.filter(o => o.trim() !== '')
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('questions')
        .update(payload)
        .eq('key', form.value.key)
      if (error) throw error
    } else {
      const { error } = await supabase
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

const toggleActive = async (question: any) => {
  try {
    const { error } = await supabase
      .from('questions')
      .update({ is_active: !question.is_active })
      .eq('key', question.key)
    
    if (error) throw error
    question.is_active = !question.is_active
  } catch (e) {
    console.error('Error updating status:', e)
  }
}

const confirmDelete = async (question: any) => {
  if (!confirm(`Are you sure you want to delete "${question.question}"?\nThis cannot be undone and may break existing user data.`)) return

  try {
    const { error } = await supabase
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

/* No custom styles needed */
