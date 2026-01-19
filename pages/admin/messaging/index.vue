<template>
  <div class="max-w-5xl">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-900">SMS Messaging</h1>
        <p class="text-stone-500 mt-1">Compose and send SMS messages to users</p>
      </div>
      <NuxtLink to="/admin/messaging/history" class="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-black transition-colors">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        View History
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Compose Message -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Compose Card -->
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 class="font-bold text-stone-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Compose Message
            </h2>
          </div>
          
          <div class="p-6 space-y-4">
            <!-- Message Templates -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">Quick Templates</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="template in templates" 
                  :key="template.name"
                  @click="applyTemplate(template)"
                  class="px-3 py-1.5 text-xs font-medium rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors"
                >
                  {{ template.name }}
                </button>
              </div>
            </div>

            <!-- Message Input -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">Message</label>
              <textarea 
                v-model="message"
                rows="5"
                placeholder="Type your message here... Use {name} to personalize."
                class="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none text-stone-900"
                maxlength="160"
              ></textarea>
              <div class="flex justify-between mt-2 text-xs text-stone-400">
                <span>{{ message.length }}/160 characters</span>
                <span v-if="message.includes('{name}')" class="text-green-600">✓ Personalized</span>
              </div>
            </div>

            <!-- Preview -->
            <div v-if="message" class="bg-stone-50 rounded-xl p-4">
              <label class="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">Preview</label>
              <div class="bg-white rounded-lg p-3 border border-stone-100 text-sm text-stone-700">
                {{ previewMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recipients Card -->
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
            <h2 class="font-bold text-stone-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Recipients
              <span class="text-xs font-normal text-stone-400">({{ selectedUsers.length }} selected)</span>
            </h2>
            <div class="flex gap-2">
              <button 
                @click="selectAll" 
                class="text-xs font-medium text-stone-500 hover:text-black"
              >
                Select All
              </button>
              <button 
                @click="clearSelection" 
                class="text-xs font-medium text-red-500 hover:text-red-600"
                v-if="selectedUsers.length"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="p-6">
            <!-- Quick Filters -->
            <div class="flex flex-wrap gap-2 mb-4">
              <button 
                @click="filterUsers('all')"
                :class="['px-3 py-1.5 text-xs font-medium rounded-full border transition-colors', activeFilter === 'all' ? 'bg-black text-white border-black' : 'border-stone-200 hover:border-stone-300']"
              >
                All Users ({{ users.length }})
              </button>
              <button 
                @click="filterUsers('male')"
                :class="['px-3 py-1.5 text-xs font-medium rounded-full border transition-colors', activeFilter === 'male' ? 'bg-blue-600 text-white border-blue-600' : 'border-stone-200 hover:border-stone-300']"
              >
                Males ({{ users.filter(u => u.gender === 'male').length }})
              </button>
              <button 
                @click="filterUsers('female')"
                :class="['px-3 py-1.5 text-xs font-medium rounded-full border transition-colors', activeFilter === 'female' ? 'bg-pink-600 text-white border-pink-600' : 'border-stone-200 hover:border-stone-300']"
              >
                Females ({{ users.filter(u => u.gender === 'female').length }})
              </button>
              <button 
                @click="filterUsers('verified')"
                :class="['px-3 py-1.5 text-xs font-medium rounded-full border transition-colors', activeFilter === 'verified' ? 'bg-green-600 text-white border-green-600' : 'border-stone-200 hover:border-stone-300']"
              >
                Verified ({{ users.filter(u => u.is_verified).length }})
              </button>
            </div>

            <!-- Search -->
            <input 
              v-model="search"
              type="text"
              placeholder="Search by name or phone..."
              class="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-black/5 text-sm mb-4"
            />

            <!-- User List -->
            <div class="max-h-64 overflow-y-auto border border-stone-100 rounded-xl">
              <div v-if="loading" class="p-8 text-center text-stone-400 text-sm">
                Loading users...
              </div>
              <div v-else-if="filteredUsers.length === 0" class="p-8 text-center text-stone-400 text-sm">
                No users found
              </div>
              <div v-else>
                <label 
                  v-for="user in filteredUsers" 
                  :key="user.id"
                  class="flex items-center gap-3 p-3 hover:bg-stone-50 cursor-pointer border-b border-stone-50 last:border-0"
                >
                  <input 
                    type="checkbox" 
                    :value="user.id"
                    v-model="selectedUserIds"
                    class="w-4 h-4 rounded border-stone-300 text-black focus:ring-black"
                  />
                  <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                    {{ user.display_name?.charAt(0) || '?' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-stone-900 truncate">{{ user.display_name || 'No name' }}</p>
                    <p class="text-xs text-stone-400">{{ user.phone }}</p>
                  </div>
                  <span 
                    :class="['text-[10px] px-2 py-0.5 rounded-full font-medium', user.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600']"
                  >
                    {{ user.gender }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Summary & Send -->
      <div class="space-y-6">
        <!-- Summary Card -->
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden sticky top-6">
          <div class="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 class="font-bold text-stone-900">Summary</h2>
          </div>
          
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-stone-50">
              <span class="text-sm text-stone-500">Recipients</span>
              <span class="font-bold text-stone-900">{{ selectedUsers.length }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-stone-50">
              <span class="text-sm text-stone-500">Message Length</span>
              <span class="font-bold text-stone-900">{{ message.length }}/160</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-stone-500">Est. Cost</span>
              <span class="font-bold text-stone-900">~GH₵{{ (selectedUsers.length * 0.05).toFixed(2) }}</span>
            </div>

            <!-- Selected Users Preview -->
            <div v-if="selectedUsers.length > 0 && selectedUsers.length <= 5" class="pt-4 border-t border-stone-100">
              <p class="text-xs font-bold uppercase tracking-wide text-stone-400 mb-2">Sending to:</p>
              <div class="space-y-1">
                <div v-for="user in selectedUsers" :key="user.id" class="text-xs text-stone-600">
                  {{ user.display_name || user.phone }}
                </div>
              </div>
            </div>
            <div v-else-if="selectedUsers.length > 5" class="pt-4 border-t border-stone-100">
              <p class="text-xs text-stone-400">
                {{ selectedUsers.slice(0, 3).map(u => u.display_name || u.phone).join(', ') }} and {{ selectedUsers.length - 3 }} more...
              </p>
            </div>

            <!-- Send Button -->
            <button 
              @click="sendMessages"
              :disabled="!canSend || sending"
              :class="[
                'w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
                canSend && !sending 
                  ? 'bg-black text-white hover:bg-stone-800 active:scale-[0.98]' 
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              ]"
            >
              <svg v-if="sending" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="sending">Sending {{ sentCount }}/{{ selectedUsers.length }}...</span>
              <span v-else>Send {{ selectedUsers.length }} SMS</span>
            </button>

            <!-- Validation Messages -->
            <div v-if="!message" class="text-xs text-amber-600 flex items-center gap-1">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Please write a message
            </div>
            <div v-else-if="selectedUsers.length === 0" class="text-xs text-amber-600 flex items-center gap-1">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Select at least one recipient
            </div>
          </div>
        </div>

        <!-- Recent Broadcasts -->
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-stone-100 bg-stone-50">
            <h2 class="font-bold text-stone-900 text-sm">Recent Broadcasts</h2>
          </div>
          <div class="p-4">
            <div v-if="broadcasts.length === 0" class="text-center py-6 text-stone-400 text-xs">
              No broadcasts yet
            </div>
            <div v-else class="space-y-3">
              <div v-for="b in broadcasts" :key="b.id" class="text-xs">
                <p class="text-stone-600 line-clamp-2">{{ b.message }}</p>
                <p class="text-stone-400 mt-1">{{ b.count }} recipients · {{ formatDate(b.sent_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <Transition name="toast">
      <div v-if="showSuccess" class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'SMS Messaging' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { sendSMS } = useHubtel()

// State
const loading = ref(true)
const sending = ref(false)
const sentCount = ref(0)
const showSuccess = ref(false)
const successMessage = ref('')
const users = ref<any[]>([])
const selectedUserIds = ref<string[]>([])
const message = ref('')
const search = ref('')
const activeFilter = ref('all')
const broadcasts = ref<any[]>([])

// Templates
const templates = [
  { name: '🎉 Event Reminder', message: 'Hi {name}! Reminder: Your M2M event is coming up. See you there!' },
  { name: '💕 Match Available', message: 'Hi {name}! You have a new match waiting. Log in to see who it is!' },
  { name: '📢 Announcement', message: 'Hi {name}! We have exciting news from Minutes 2 Match...' },
  { name: '🎁 Special Offer', message: 'Hi {name}! Exclusive offer just for you. Check your M2M dashboard!' },
]

// Computed
const filteredUsers = computed(() => {
  let result = users.value

  // Apply filter
  if (activeFilter.value === 'male') {
    result = result.filter(u => u.gender === 'male')
  } else if (activeFilter.value === 'female') {
    result = result.filter(u => u.gender === 'female')
  } else if (activeFilter.value === 'verified') {
    result = result.filter(u => u.is_verified)
  }

  // Apply search
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(u => 
      (u.display_name || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    )
  }

  return result
})

const selectedUsers = computed(() => {
  return users.value.filter(u => selectedUserIds.value.includes(u.id))
})

const previewMessage = computed(() => {
  return message.value.replace('{name}', 'Maxwell')
})

const canSend = computed(() => {
  return message.value.trim().length > 0 && selectedUsers.value.length > 0
})

// Methods
const fetchUsers = async () => {
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, phone, gender, is_verified')
    .order('display_name', { ascending: true })
  
  users.value = data || []
  loading.value = false
}

const filterUsers = (filter: string) => {
  activeFilter.value = filter
  // Auto-select all in the filtered group
  if (filter !== 'all') {
    const filtered = filteredUsers.value
    selectedUserIds.value = filtered.map(u => u.id)
  }
}

const selectAll = () => {
  selectedUserIds.value = filteredUsers.value.map(u => u.id)
}

const clearSelection = () => {
  selectedUserIds.value = []
}

const applyTemplate = (template: { name: string; message: string }) => {
  message.value = template.message
}

const sendMessages = async () => {
  if (!canSend.value) return
  
  sending.value = true
  sentCount.value = 0
  
  // Generate a broadcast ID to group messages
  const broadcastId = crypto.randomUUID()
  
  try {
    for (const recipient of selectedUsers.value) {
      if (recipient.phone) {
        const personalizedMessage = message.value.replace('{name}', recipient.display_name || 'there')
        let status = 'sent'
        
        try {
          await sendSMS(recipient.phone, personalizedMessage)
          sentCount.value++
        } catch (e) {
          console.error('Failed to send to:', recipient.phone, e)
          status = 'failed'
        }
        
        // Save to database
        try {
          // @ts-ignore
          await supabase.from('sms_history').insert({
            recipient_id: recipient.id,
            recipient_phone: recipient.phone,
            recipient_name: recipient.display_name,
            message: personalizedMessage,
            status,
            broadcast_id: broadcastId,
            sent_by: user.value?.id
          })
        } catch (dbError) {
          console.error('Failed to log SMS:', dbError)
        }
      }
    }
    
    // Log the broadcast locally
    broadcasts.value.unshift({
      id: broadcastId,
      message: message.value,
      count: sentCount.value,
      sent_at: new Date().toISOString()
    })
    
    // Show success
    successMessage.value = `Sent ${sentCount.value} messages successfully!`
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 4000)
    
    // Reset
    message.value = ''
    selectedUserIds.value = []
    activeFilter.value = 'all'
    
  } catch (error) {
    console.error('Broadcast error:', error)
    alert('Some messages may have failed to send.')
  } finally {
    sending.value = false
    sentCount.value = 0
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

// Initialize
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
