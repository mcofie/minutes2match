<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const toast = useToast()
const haptic = useHaptic()

const eventId = route.params.id as string
const accessCode = route.query.access as string

const event = ref<any>(null)
const participants = ref<any[]>([])
const meta = ref<any>({ participantCount: 0 })
const loading = ref(true)
const importing = ref(false)
const runningMatch = ref(false)
const inviting = ref(false)
const editing = ref(false)
const eventForm = ref({
   title: '',
   location: ''
})

const csvInput = ref<HTMLInputElement | null>(null)
const triggerCsv = () => csvInput.value?.click()


// MANUAL ENTRY STATE
const manualParticipant = ref({
   name: '',
   phone: '',
   gender: 'female' as 'male' | 'female',
   guestId: ''
})

// AUTHENTICATION
const checkAuth = async () => {
   try {
      console.log('[Franchise Client DEBUG] Checking Auth for:', { eventId, accessCode })
      const data = await $fetch<{ success: boolean; event: any; participants: any[]; meta: any }>(`/api/franchise/auth`, {
         params: { event_id: eventId, code: accessCode }
      })
      if (data.success) {
         event.value = data.event
         participants.value = data.participants || []
         meta.value = data.meta
         eventForm.value = { title: data.event.title, location: data.event.location || '' }
      }
   } catch (err: any) {
      console.error('[Franchise Client DEBUG] Auth Error:', err)
      toast.error('Access Denied', err.data?.message || 'Invalid or expired manager link.')
   } finally {
      loading.value = false
   }
}

// MANUAL ENTRY SUBMIT
const addManualParticipant = async () => {
   if (!manualParticipant.value.name || !manualParticipant.value.phone) {
      toast.error('Missing Info', 'Name and Phone are required.')
      return
   }

   importing.value = true
   try {
      const response = await $fetch('/api/franchise/import', {
         method: 'POST',
         body: { 
            event_id: eventId, 
            code: accessCode, 
            participants: [{
               name: manualParticipant.value.name,
               gender: manualParticipant.value.gender,
               phone: manualParticipant.value.phone,
               guestId: manualParticipant.value.guestId || `M-${Date.now().toString().slice(-3)}`
            }] 
         }
      })
      
      if (response.success) {
         toast.success('Added Successfully')
         manualParticipant.value = { name: '', phone: '', gender: 'female', guestId: '' }
         await checkAuth()
      }
   } catch (err) {
      toast.error('Failed to add')
   } finally {
      importing.value = false
   }
}

// CSV IMPORT ENGINE
const handleFileUpload = async (e: Event) => {
   const file = (e.target as HTMLInputElement).files?.[0]
   if (!file) return

   importing.value = true
   const reader = new FileReader()
   
   reader.onload = async (event: any) => {
      const text = event.target.result
      const rows = text.split('\n').filter((r: string) => r.trim())
      
      const participantsData = rows.slice(1).map((row: string) => {
         const cols = row.split(',').map(c => c.trim())
         return {
            name: cols[0],
            gender: cols[1],
            phone: cols[2],
            guestId: cols[3]
         }
      })

      try {
         const response = await $fetch<{ success: boolean; stats: any; errorCount: number }>('/api/franchise/import', {
            method: 'POST',
            body: { 
               event_id: eventId, 
               code: accessCode, 
               participants: participantsData
            }
         })
         
         if (response.success) {
            if (response.errorCount > 0) {
               toast.warning('Partial Import', `${response.stats.created + response.stats.linked} guests added, but ${response.errorCount} had errors.`)
            } else {
               toast.success('Import Successful', `${response.stats.created + response.stats.linked} guests added.`)
            }
            await checkAuth()
         }
      } catch (err: any) {
         toast.error('Import Failed', err.data?.message || 'Check your CSV format.')
      } finally {
         importing.value = false
      }
   }
   
   reader.readAsText(file)
}



// UPDATE EVENT
const updateEvent = async (newStatus?: string) => {
   try {
      const response = await $fetch('/api/franchise/update', {
         method: 'POST',
         body: {
            event_id: eventId,
            code: accessCode,
            updates: {
               title: eventForm.value.title,
               location: eventForm.value.location,
               status: newStatus || event.value.status
            }
         }
      })
      if (response.success) {
         toast.success('Event Updated')
         editing.value = false
         await checkAuth()
      }
   } catch (err) {
      toast.error('Update failed')
   }
}

// INVITE BROADCAST
const sendInvites = async () => {
   if (!confirm('This will send an SMS invitation to ALL participants with their personal match card link. Proceed?')) return
   
   inviting.value = true
   try {
      const response = await $fetch('/api/franchise/invite', {
         method: 'POST',
         body: { event_id: eventId, code: accessCode }
      })
      if (response.success) {
         toast.success('Invites Sent', response.message)
         await checkAuth()
      }
   } catch (err) {
      toast.error('Broadcasting failed')
   } finally {
      inviting.value = false
   }
}

// MATCH ENGINE TRIGGER
const runMatchmaker = async () => {
   if (!confirm('Are you sure? This will calculate all mutual matches and send SMS notifications to all participants.')) return

   runningMatch.value = true
   try {
      haptic.hapticSuccess()
      const data = await $fetch<{ success: boolean; matchCount: number }>('/api/franchise/match', {
         method: 'POST',
         body: { event_id: eventId, code: accessCode }
      })
      
      if (data.success) {
         toast.success('Event Closed', `${data.matchCount} mutual matches were found and notified!`)
         await checkAuth()
      }
   } catch (err) {
      toast.error('Process Failed', 'The matchmaker engine encountered an error.')
   } finally {
      runningMatch.value = false
   }
}


const removeParticipant = async (pId: string) => {
   if (!confirm('Remove this guest from the event?')) return

   try {
      const response = await $fetch('/api/franchise/participant-delete', {
         method: 'POST',
         body: {
            event_id: eventId,
            code: accessCode,
            participant_id: pId
         }
      })
      if (response.success) {
         toast.success('Removed')
         await checkAuth()
      }
   } catch (err) {
      toast.error('Delete failed')
   }
}

const copyLink = async () => {
   if (!event.value?.short_code) return
   try {
      const fullUrl = `${window.location.origin}/s/${event.value.short_code}`
      await navigator.clipboard.writeText(fullUrl)
      toast.success('Link Copied!', 'Organizer magic link copied to clipboard.')
      haptic.hapticSuccess()
   } catch (err) {
      toast.error('Failed to copy')
   }
}

onMounted(() => {


   if (!eventId || !accessCode) {
      toast.error('Invalid link', 'Please use your organizer magic link.')
      navigateTo('/')
      return
   }
   checkAuth()
})
</script>

<template>
   <div class="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 font-primary text-stone-900 dark:text-stone-100">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center pt-24 space-y-4">
         <div class="w-8 h-8 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
         <p class="text-xs uppercase tracking-widest font-bold opacity-50">Authenticating Manager View...</p>
      </div>

      <div v-else-if="event" class="max-w-xl mx-auto space-y-8">
         
         <!-- Header & Meta -->
         <header class="space-y-6">
            <div class="flex items-center justify-between">
               <span class="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full">
                  Franchise Portal
               </span>
               <div :class="event.status === 'completed' ? 'text-stone-400' : 'text-green-500'" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {{ event.status }}
               </div>
            </div>

            <div v-if="!editing" class="space-y-4">
               <div class="flex items-end justify-between">
                  <h1 class="text-4xl font-black tracking-tight leading-tight">{{ event.title }}</h1>
                  <button @click="editing = true" class="text-xs font-bold text-rose-500 opacity-40 hover:opacity-100 mb-2">Edit</button>
               </div>
               
               <div class="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <p v-if="event.location" class="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                     <span>📍</span> {{ event.location }}
                  </p>
                  <p v-if="event.short_code" @click="copyLink" class="cursor-pointer hover:text-rose-500 transition-all flex items-center gap-1.5">
                     <span>🔗</span> Magic Link: <span class="text-rose-500/60 lowercase italic">/s/{{ event.short_code }}</span>
                  </p>
               </div>
            </div>


            <div v-else class="p-6 bg-white dark:bg-stone-900 rounded-3xl border-2 border-stone-100 dark:border-stone-800 space-y-4 animate-in fade-in slide-in-from-top-4">
               <div class="space-y-3">
                  <input v-model="eventForm.title" placeholder="Event Title" class="w-full p-4 bg-stone-50 dark:bg-black rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-rose-500" />
                  <input v-model="eventForm.location" placeholder="Location" class="w-full p-4 bg-stone-50 dark:bg-black rounded-2xl text-xs outline-none" />
               </div>
               <div class="flex gap-2">
                  <button @click="updateEvent()" class="flex-1 py-3 bg-black dark:bg-stone-100 text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Save Changes</button>
                  <button @click="editing = false" class="px-6 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
               <div class="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 text-center">
                  <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Guests</p>
                  <p class="text-2xl font-black italic">{{ participants.length }}</p>
               </div>
               <div class="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 text-center">
                  <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
                  <p class="text-xs font-black uppercase tracking-widest text-rose-500 pt-1.5">{{ event.status }}</p>
               </div>
            </div>
         </header>

         <!-- Main Workflow -->
         <section class="space-y-8">
            
            <!-- Step 1: Management (Unchanged for briefly) -->
            <div class="space-y-4">
               <div class="flex items-center justify-between px-4">
                  <h2 class="text-xs font-black uppercase tracking-[0.3em] opacity-40">Setup</h2>
               </div>
               
               <div class="p-6 bg-white dark:bg-stone-900 rounded-[2.5rem] border-2 border-stone-200 dark:border-stone-800 space-y-6">
                  <!-- Manual Entry and CSV remain similar inside -->
                  <div class="space-y-4">
                     <div class="grid grid-cols-2 gap-3">
                        <input v-model="manualParticipant.name" placeholder="Full Name" class="w-full p-4 bg-stone-50 dark:bg-black rounded-2xl text-xs outline-none" />
                        <input v-model="manualParticipant.phone" placeholder="Phone" class="w-full p-4 bg-stone-50 dark:bg-black rounded-2xl text-xs outline-none" />
                     </div>
                     <button @click="addManualParticipant" :disabled="importing" class="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-30">
                        {{ importing ? '...' : 'Add Guest' }}
                     </button>
                     <button @click="triggerCsv" class="w-full py-4 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Bulk Import (CSV)
                     </button>
                     <input type="file" ref="csvInput" @change="handleFileUpload" class="hidden" accept=".csv" />

                  </div>
               </div>
            </div>

            <!-- Step 2: Live Controls -->
            <div class="space-y-4">
               <h2 class="text-xs font-black uppercase tracking-[0.3em] opacity-40 px-4">Life Cycle</h2>
               <div class="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] border-2 border-stone-200 dark:border-stone-800 space-y-6">
                  
                  <!-- Invite Broadcast -->
                  <div class="flex items-start justify-between">
                     <div class="space-y-1">
                        <h3 class="text-sm font-black italic">Invite All Guests</h3>
                        <p class="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Sends SMS with personal match cards</p>
                     </div>
                     <button 
                        @click="sendInvites"
                        :disabled="inviting || participants.length === 0"
                        class="px-6 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-90 disabled:opacity-30"
                     >
                        {{ inviting ? 'Sending...' : 'Broadcast' }}
                     </button>
                  </div>

                  <div class="h-px bg-stone-100 dark:bg-stone-800"></div>

                  <!-- Start/End Toggle -->
                  <div class="flex items-start justify-between">
                     <div class="space-y-1">
                        <h3 class="text-sm font-black italic">{{ event.status === 'active' ? 'End Current Event' : 'Start Event' }}</h3>
                        <p class="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                           {{ event.status === 'active' ? 'Closes match card access' : 'Wakes up match cards' }}
                        </p>
                     </div>
                     <button 
                        @click="updateEvent(event.status === 'active' ? 'completed' : 'active')"
                        class="px-6 py-3 border-2 border-stone-200 dark:border-stone-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                     >
                        {{ event.status === 'active' ? 'End Now' : 'Go Live' }}
                     </button>
                  </div>
               </div>
            </div>

            <!-- Step 3: Match Release -->
            <div class="space-y-4">
               <h2 class="text-xs font-black uppercase tracking-[0.3em] opacity-40 px-4">Matches</h2>
               <div class="p-8 bg-black dark:bg-stone-100 text-white dark:text-black rounded-[2.5rem] space-y-6">
                  <div class="space-y-1">
                     <h3 class="text-xl font-black italic">Release Matches</h3>
                     <p class="text-[10px] opacity-50 font-bold uppercase tracking-widest">This notifies everyone of their match results via SMS</p>
                  </div>
                  
                  <button 
                     @click="runMatchmaker"
                     :disabled="runningMatch || event.status !== 'completed'"
                     class="w-full py-5 bg-rose-500 text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
                  >
                     <span v-if="runningMatch" class="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></span>
                     {{ event.status === 'completed' ? 'Release Matches Now' : 'Awaiting Event End' }}
                  </button>
               </div>
            </div>


            <!-- Guest List Management -->
            <div class="space-y-4">
               <div class="flex items-center justify-between px-4">
                  <h2 class="text-xs font-black uppercase tracking-[0.3em] opacity-40">Guest List</h2>
                  <span class="text-[10px] font-bold py-1 px-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                     {{ participants.length }} Total
                  </span>
               </div>

               <div v-if="participants.length > 0" class="space-y-3">
                  <div v-for="p in participants" :key="p.id" class="p-4 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-3xl flex items-center justify-between group">
                     <div class="flex items-center gap-4">
                        <div :class="p.gender === 'male' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'" class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg">
                           {{ p.gender === 'male' ? '♂' : '♀' }}
                        </div>
                        <div>
                           <h4 class="text-sm font-bold">{{ p.profile?.display_name || 'Anonymous Guest' }}</h4>
                           <p class="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                              #{{ p.participant_number }} • {{ p.profile?.phone || 'No phone' }}
                           </p>
                        </div>

                     </div>
                     <button @click="removeParticipant(p.id)" class="p-4 text-stone-300 hover:text-rose-500 transition-all active:scale-90">
                        ✕
                     </button>

                  </div>
               </div>
               
               <div v-else class="py-12 text-center opacity-30 italic text-xs">
                  No guests added yet.
               </div>
            </div>

         </section>


         <!-- Footer -->
         <footer class="text-center pt-8">
            <p class="text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-[0.3em]">
               Powered by Minutes 2 Match Software
            </p>
         </footer>

      </div>
   </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
