<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const haptic = useHaptic()

const participantId = route.params.id as string

const participant = ref<any>(null)
const eventData = ref<any>(null)
const loading = ref(true)
const submitting = ref(false)

// Input State
const targetNumber = ref('')
const vote = ref<boolean | null>(null)
const comment = ref('')

const fetchParticipantData = async () => {
   try {
      const data = await $fetch<{ success: boolean; participant: any }>(`/api/franchise/participant-data`, {
         params: { id: participantId }
      })

      if (!data.success || !data.participant) {
         throw new Error('Participant not found')
      }
      
      participant.value = data.participant
      eventData.value = data.participant.event
   } catch (err: any) {
      console.error('[Participant Client DEBUG] Fetch Error:', err)
      toast.error('Invalid Link', 'Your invitation link seems broken.')
   } finally {
      loading.value = false
   }
}

const submitVote = async (choice: boolean) => {
   if (!targetNumber.value) {
      toast.error('Missing ID', "Enter the ID of the person you're date with.")
      return
   }

   submitting.value = true
   vote.value = choice
   
   try {
      haptic.hapticSuccess()
      const response = await $fetch('/api/franchise/vote', {
         method: 'POST',
         body: {
            event_id: eventData.value.id,
            from_participant_id: participantId,
            target_participant_number: targetNumber.value,
            vote: choice,
            comment: comment.value
         }
      })


      if (response.success) {
         toast.success(choice ? 'Vibe Recorded! ❤️' : 'Choice Noted')
         // Reset for next date
         targetNumber.value = ''
         comment.value = ''
         vote.value = null
      }
   } catch (err: any) {
      toast.error('Error', err.data?.message || 'Failed to save your choice.')
   } finally {
      submitting.value = false
   }
}

onMounted(() => {
   fetchParticipantData()
})
</script>

<template>
   <div class="min-h-screen bg-white dark:bg-stone-950 font-primary text-stone-900 dark:text-stone-100 flex flex-col">
      
      <!-- Top Splash -->
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
         <div class="w-10 h-10 border-4 border-rose-500 border-t-transparent animate-spin rounded-full"></div>
         <p class="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 italic">Loading Digital Match Card...</p>
      </div>

      <template v-else-if="participant">
         <!-- Navbar -->
         <nav class="p-6 flex items-center justify-between border-b border-stone-100 dark:border-stone-900 sticky top-0 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl z-50">
            <div class="flex flex-col">
               <span class="text-[10px] uppercase font-bold tracking-widest text-rose-500">{{ eventData.title }}</span>
               <h1 class="text-sm font-bold">#Guest {{ participant.participant_number }}</h1>
            </div>
            <div class="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-xs font-bold">
               {{ participant.user.display_name?.charAt(0) }}
            </div>
         </nav>

         <!-- Input Section -->
         <main class="flex-1 p-6 space-y-12 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
            
            <!-- Event Closed or Not Started State -->
            <div v-if="eventData.status !== 'active'" class="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in duration-700">
               <div class="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-3xl">
                  {{ eventData.status === 'completed' ? '🏁' : '🕒' }}
               </div>
               <div class="space-y-3">
                  <h2 class="text-2xl font-black italic tracking-tight italic">{{ eventData.status === 'completed' ? 'Event Ended' : 'Coming Soon' }}</h2>
                  <p class="text-[10px] text-stone-500 font-bold uppercase tracking-widest leading-loose">
                     {{ eventData.status === 'completed' ? 'Voting is closed for this mixer. Results will be sent via SMS!' : 'Hold tight! The organizer will wake this match card up when the mixer begins.' }}
                  </p>
               </div>
               <button @click="navigateTo('/')" class="text-[10px] font-black uppercase tracking-widest text-rose-500 border-b border-rose-500/20 pb-1">
                  Back to Hub
               </button>
            </div>

            <!-- Voting Interface (Active State) -->
            <div v-else class="w-full space-y-10 animate-in fade-in duration-1000">
               
               <!-- ID Input -->
               <div class="text-center space-y-4">
                  <h2 class="text-xs font-black uppercase tracking-[0.4em] opacity-30">Current Date ID</h2>
                  <input 
                     v-model="targetNumber"
                     type="tel"
                     placeholder="#42"
                     maxlength="4"
                     class="w-full text-center text-8xl font-black bg-transparent outline-none border-b-4 border-transparent focus:border-rose-500 placeholder:text-stone-100 dark:placeholder:text-stone-900 transition-all uppercase"
                  />
               </div>

               <!-- Comment -->
               <div class="space-y-3">
                  <p class="text-[10px] text-center font-bold uppercase tracking-widest opacity-40 italic">Optional: Mini-Review?</p>
                  <textarea 
                     v-model="comment"
                     rows="1"
                     placeholder="Great energy..."
                     class="w-full p-4 bg-stone-50 dark:bg-stone-900 rounded-2xl text-xs outline-none focus:ring-2 ring-rose-500/20 text-center"
                  ></textarea>
               </div>

               <!-- Voting Actions -->
               <div class="grid grid-cols-2 gap-4 h-24">
                  <button 
                     @click="submitVote(false)"
                     :disabled="submitting"
                     class="group bg-stone-50 dark:bg-stone-900 rounded-3xl flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all active:scale-95 disabled:opacity-30"
                  >
                     <span class="text-4xl group-hover:scale-110 transition-transform">✕</span>
                  </button>
                  <button 
                     @click="submitVote(true)"
                     :disabled="submitting"
                     class="group bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 transition-all active:scale-95 disabled:opacity-30"
                  >
                     <span class="text-4xl group-hover:scale-110 transition-transform">❤️</span>
                  </button>
               </div>

            </div>
         </main>


         <!-- Conversion Footer -->
         <footer class="p-6 pb-12">
            <div class="relative p-6 rounded-3xl bg-stone-900 overflow-hidden group">
               <!-- Blurred Background Grid -->
               <div class="absolute inset-0 grid grid-cols-6 gap-2 opacity-20 filter blur-[2px] scale-110">
                  <div v-for="i in 18" :key="i" class="aspect-square bg-gradient-to-tr from-rose-500 to-amber-500 rounded-lg"></div>
               </div>

               <div class="relative z-10 text-center space-y-4">
                  <p class="text-white text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                     Beyond this event, 2,400+ singles in Accra share your vibe.
                  </p>
                  <button 
                     @click="navigateTo('/signup')"
                     class="px-6 py-2 bg-white text-black text-[10px] uppercase font-black tracking-widest rounded-full hover:bg-rose-500 hover:text-white transition-all"
                  >
                     Join the Pool
                  </button>
               </div>
            </div>
         </footer>
      </template>
   </div>
</template>

<style scoped>
input::placeholder {
  color: #f5f5f4;
}
.dark input::placeholder {
  color: #1c1917;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
