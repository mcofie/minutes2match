<template>
  <div 
    v-if="isOpen && user"
    class="fixed bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-80 h-[80vh] md:h-[450px] bg-white border-2 border-black border-b-0 md:border-b-2 rounded-t-3xl md:rounded-2xl shadow-none md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col z-[200] animate-in slide-in-from-bottom-6 duration-300"
  >
    <!-- Header -->
    <div class="px-4 py-3 border-b-2 border-black flex items-center justify-between bg-stone-900 text-white rounded-t-[14px] md:rounded-t-[22px]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-stone-800">
          <NuxtImg v-if="user.photoUrl" :src="user.photoUrl" class="w-full h-full object-cover" />
        </div>
        <div>
          <h4 class="text-xs font-black uppercase tracking-widest">{{ user.displayName }}</h4>
          <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Active Connection</span>
        </div>
      </div>
      <button @click="$emit('close')" class="hover:scale-110 transition-transform">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-stone-50" ref="messageContainer">
      <div v-if="loading" class="flex flex-col items-center justify-center h-full opacity-40">
         <div class="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center p-4">
        <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
           <span class="text-xl">⚡</span>
        </div>
        <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">Send an icebreaker to start the vibe.</p>
        
        <div class="mt-6 flex flex-col gap-2 w-full">
           <button 
             v-for="ice in icebreakers" 
             :key="ice"
             @click="sendIcebreaker(ice)"
             class="px-3 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-bold text-stone-600 hover:border-black hover:text-black transition-all text-left"
           >
             "{{ ice }}"
           </button>
        </div>
      </div>

      <div 
        v-for="(msg, i) in messages" 
        :key="i"
        class="flex"
        :class="msg.role === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-[80%] px-3 py-2 text-[11px] font-medium leading-relaxed border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          :class="msg.role === 'me' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-black rounded-2xl rounded-tl-none'"
        >
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-3 border-t-2 border-stone-100 bg-white rounded-b-2xl">
      <div class="relative flex items-center gap-2">
        <input 
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Say something bold..."
          class="flex-1 bg-stone-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl px-4 py-2 text-xs font-bold outline-none transition-all"
        />
        <button 
          @click="sendMessage"
          class="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors"
        >
          <svg class="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
const props = defineProps<{
  user: any
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
const supabase = useSupabaseClient()
const authUser = useSupabaseUser()

const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(false)
const messageContainer = ref<HTMLElement | null>(null)

const icebreakers = [
  'Ask about their persona',
  'What brought you to the lobby today?',
  'You have a great vibe! Hi from Accra'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// Fetch existing messages
const fetchHistory = async () => {
   if (!props.user?.matchId) return
   loading.value = true
   try {
      const { messages: data } = await $fetch<any>(`/api/lobby/messages?matchId=${props.user.matchId}`)
      messages.value = data
      scrollToBottom()
   } catch (e) {
      console.error('Fetch history error:', e)
   } finally {
      loading.value = false
   }
}

// Realtime subscription
let channel: any = null

const setupRealtime = () => {
   if (!props.user?.matchId) return
   
   channel = supabase.channel(`match:${props.user.matchId}`)
     .on('postgres_changes', { 
       event: 'INSERT', 
       schema: 'm2m', 
       table: 'lobby_messages', 
       filter: `match_id=eq.${props.user.matchId}` 
     }, (payload: any) => {
       const newMsg = payload.new
       
       // Only add if not already in list (for sender)
       if (newMsg.sender_id !== authUser.value?.id) {
          messages.value.push({
             id: newMsg.id,
             role: 'them',
             text: newMsg.text,
             timestamp: newMsg.created_at
          })
          scrollToBottom()
       }
     })
     .subscribe()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !props.user?.matchId) return
  
  const text = newMessage.value
  newMessage.value = ''
  
  // Optimistic UI
  messages.value.push({
    role: 'me',
    text: text,
    timestamp: new Date().toISOString()
  })
  scrollToBottom()

  try {
     await $fetch('/api/lobby/messages', {
        method: 'POST',
        body: { matchId: props.user.matchId, text: text }
     })
  } catch (err) {
     console.error('Send error:', err)
     // Rollback or show error
  }
}

const sendIcebreaker = (text: string) => {
  newMessage.value = text
  sendMessage()
}

onMounted(() => {
   if (props.isOpen) {
      fetchHistory()
      setupRealtime()
   }
})

onUnmounted(() => {
   if (channel) supabase.removeChannel(channel)
})

watch(() => props.isOpen, (val) => {
   if (val) {
      fetchHistory()
      setupRealtime()
   } else {
      if (channel) supabase.removeChannel(channel)
   }
})
</script>
