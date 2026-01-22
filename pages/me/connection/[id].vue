<template>
  <main class="min-h-screen bg-[#FFFCF8] text-stone-900 font-sans relative">
    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] border-b border-black">
      <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/me" class="flex items-center">
           <img src="/logo-full.png" alt="minutes2match" class="h-20 w-auto object-contain hover:opacity-80 transition-opacity" />
        </NuxtLink>
        
        <!-- User Info -->
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-black uppercase tracking-widest">{{ matchProfile?.display_name || 'Connection' }}</p>
            <p class="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Your Match</p>
          </div>
          <div class="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img v-if="matchProfile?.photo_url" :src="matchProfile.photo_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-lg font-serif italic">{{ personaData?.emoji || '✨' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Sub Navigation -->
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex gap-8 border-t border-black/10">
          <NuxtLink 
            to="/me"
            class="py-4 text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap border-b-2 border-transparent text-stone-400 hover:text-black hover:border-black flex items-center gap-2"
          >
            ← Back to Matches
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-16 text-center">
      <div class="w-12 h-12 rounded-full border-3 border-stone-200 border-t-black animate-spin mx-auto mb-4"></div>
      <p class="text-stone-500 font-medium">Loading connection...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-16 text-center">
      <div class="text-4xl mb-4">😕</div>
      <h2 class="text-xl font-bold text-stone-900 mb-2">Connection not found</h2>
      <p class="text-stone-500 mb-6">{{ error }}</p>
      <NuxtLink to="/me" class="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-stone-800 transition-colors">
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Connection Content -->
    <div v-else class="max-w-6xl mx-auto px-4 py-8 pb-32">
      <div class="grid md:grid-cols-12 gap-8">
        
        <!-- Left Sidebar (Photo & Actions) -->
        <div class="md:col-span-4 lg:col-span-3 space-y-8">
          <!-- Profile Card -->
          <div class="bg-white p-6 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center sticky top-32">
            <!-- Photo -->
            <div class="relative inline-block mb-4">
              <div 
                class="w-32 h-32 rounded-full overflow-hidden border-2 border-black mx-auto"
                :style="{ backgroundColor: match?.unlocked ? '#f5f5f4' : (personaData?.color || '#1a1a2e') }"
              >
                <img 
                  v-if="match?.unlocked && matchProfile?.photo_url" 
                  :src="matchProfile.photo_url" 
                  :alt="matchProfile.display_name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-5xl">
                  {{ personaData?.emoji || '✨' }}
                </div>
              </div>
              <!-- Badge -->
              <div 
                class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                :class="match?.unlocked ? 'bg-emerald-400 text-black' : 'bg-rose-500 text-white'"
              >
                {{ match?.unlocked ? 'Connected' : 'Pending' }}
              </div>
            </div>

            <h2 class="text-2xl font-serif font-black text-black mb-1 mt-2">
              {{ match?.unlocked ? matchProfile?.display_name : (personaData?.name || 'Your Match') }}
            </h2>
            <p class="text-xs text-stone-500 mb-8 font-bold uppercase tracking-wide">
              {{ match?.unlocked ? `${getAge(matchProfile?.birth_date)} years old` : 'Age hidden' }}
              <span v-if="match?.unlocked && matchProfile?.location">• {{ matchProfile.location }}</span>
            </p>

            <!-- Actions -->
            <div class="space-y-4">
              <div v-if="match?.unlocked && matchProfile" class="grid grid-cols-2 gap-4">
                <a 
                  :href="`https://wa.me/${matchProfile.phone?.replace(/\D/g, '')}`"
                  target="_blank"
                  class="flex flex-col items-center justify-center gap-2 p-3 bg-black text-white hover:bg-stone-800 rounded-lg transition-all border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
                </a>
                <a 
                  :href="`tel:${matchProfile.phone}`"
                  class="flex flex-col items-center justify-center gap-2 p-3 bg-white border-2 border-stone-200 text-stone-700 hover:border-black hover:text-black rounded-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Call</span>
                </a>
              </div>
              
              <button 
                v-else
                @click="handleUnlock"
                :disabled="unlocking"
                class="w-full py-4 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:bg-rose-500 hover:-translate-y-0.5 transition-all disabled:opacity-50 border-2 border-black flex items-center justify-center gap-2"
              >
                <span v-if="unlocking" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ unlocking ? 'Processing...' : `Unlock for GH₵${match?.unlock_price || 10}` }}
              </button>
            </div>
            
            <p class="text-xs text-stone-400 mt-4 leading-relaxed">
               Profiles with photos get 80% more matches.
            </p>
          </div>
        </div>

        <!-- Main Content (Form-like Inputs) -->
        <div class="md:col-span-8 lg:col-span-9 space-y-6">
          
          <!-- Basic Details -->
          <div v-if="match?.unlocked && matchProfile" class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h3 class="text-2xl font-serif font-bold text-black mb-8 flex items-center gap-2">
               <span>Basic Info</span>
               <div class="h-px flex-1 bg-stone-100"></div>
             </h3>
             
             <div class="grid md:grid-cols-2 gap-6">
                 <!-- Display Name -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Display Name</label>
                    <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-bold font-serif text-lg">
                        {{ matchProfile.display_name }}
                    </div>
                 </div>

                 <!-- Phone -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Phone (Verified)</label>
                    <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-mono font-bold">
                        {{ matchProfile.phone }}
                    </div>
                 </div>

                 <!-- Occupation -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Occupation 💼</label>
                    <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-medium">
                        {{ matchProfile.occupation || 'Not specified' }}
                    </div>
                 </div>

                 <!-- Religion -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Religion ⛪️</label>
                    <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-medium">
                        {{ matchProfile.religion || 'Not specified' }}
                    </div>
                 </div>
                 
                 <!-- Height -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Height 📏</label>
                     <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-medium">
                        {{ matchProfile.height_cm ? `${matchProfile.height_cm} cm` : 'Not specified' }}
                    </div>
                 </div>

                 <!-- Intent -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Looking For 💍</label>
                     <div class="w-full px-4 py-3 bg-stone-50 rounded-lg border-2 border-stone-100 text-stone-900 font-medium capitalize">
                        {{ matchProfile.intent || 'Friendship' }}
                    </div>
                 </div>
             </div>
          </div>
          
          <!-- About Section -->
          <div v-if="match?.unlocked && matchProfile" class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <div class="flex items-center justify-between mb-4">
                 <h3 class="text-2xl font-serif font-bold text-black">About Me</h3>
                 <span class="text-[10px] font-bold font-mono text-stone-400">{{ matchProfile.about_me?.length || 0 }}/300</span>
             </div>
             <div class="w-full p-6 bg-white rounded-lg border-2 border-stone-100 text-stone-700 min-h-[100px] leading-relaxed font-serif text-lg">
                "{{ matchProfile.about_me || 'No bio available yet.' }}"
             </div>
          </div>

          <!-- Interests -->
          <div v-if="match?.unlocked && matchProfile?.interests?.length" class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-serif font-bold text-black">Interests</h3>
                <span class="text-[10px] font-mono font-bold text-stone-400">{{ matchProfile.interests.length }} selected</span>
             </div>
             <div class="flex flex-wrap gap-2">
                <span 
                  v-for="interest in matchProfile.interests" 
                  :key="interest"
                  class="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest border-2 border-stone-200"
                >
                  <!-- Helper to find emoji -->
                  {{ getInterestLabel(interest) }}
                </span>
             </div>
          </div>

          <!-- Conversation Starters (Bottom) -->
          <div v-if="match?.unlocked" class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h3 class="text-2xl font-serif font-bold text-black mb-6">Ice Breakers 🧊</h3>
             <div class="grid md:grid-cols-2 gap-4">
               <button 
                v-for="(starter, index) in conversationStarters" 
                :key="index"
                @click="copyStarter(starter, index)"
                class="group relative text-left p-6 pr-10 rounded-xl border-2 border-stone-100 hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-medium text-stone-600 hover:text-black hover:-translate-y-1"
              >
                {{ starter }}
                <div v-if="copiedIndex === index" class="absolute top-2 right-2 text-[10px] font-bold text-white bg-black px-2 py-1 rounded-sm uppercase tracking-wider">
                  Copied
                </div>
                <div v-else class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
              </button>
             </div>
          </div>
          
          <!-- Pro Tips (Bottom) -->
          <div class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div class="flex items-start gap-4">
               <div class="pt-1">
                  <span class="text-2xl">💡</span>
               </div>
               <div>
                   <h3 class="text-lg font-bold text-black uppercase tracking-widest mb-4">Safety & Etiquette</h3>
                   <ul class="space-y-3 text-sm text-stone-700">
                      <li class="flex gap-4 items-center">
                        <span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        <span class="font-medium">Always meet in a public place for the first time.</span>
                      </li>
                      <li class="flex gap-4 items-center">
                        <span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        <span class="font-medium">Keep the conversation light and respectful.</span>
                      </li>
                      <li class="flex gap-4 items-center">
                        <span class="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        <span class="font-medium">Reference their profile to show genuine interest.</span>
                      </li>
                   </ul>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Safety Actions -->
      <div class="mt-12 mb-8 flex items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
        <button @click="handleReport" class="text-xs font-bold text-stone-400 hover:text-stone-600 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            Report User
        </button>
        <span class="text-stone-300">|</span>
        <button @click="handleBlock" class="text-xs font-bold text-stone-400 hover:text-red-500 uppercase tracking-wider flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
            Block User
        </button>
      </div>
    </div>


  </main>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'
import type { Database } from '~/types/database'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()

const matchId = computed(() => route.params.id as string)

const loading = ref(true)
const error = ref<string | null>(null)
const match = ref<any>(null)
const matchProfile = ref<any>(null)
const unlocking = ref(false)
const copiedIndex = ref<number | null>(null)

const personaData = computed(() => {
  const personaId = matchProfile.value?.dating_persona
  return personaId ? personas[personaId] : Object.values(personas)[0]
})

const conversationStarters = computed(() => {
  const name = matchProfile.value?.display_name || 'there'
  const interests = matchProfile.value?.interests || []
  const occupation = matchProfile.value?.occupation
  
  const starters = [
    `Hey ${name}! I noticed we matched, and I'd love to get to know you better. How's your week going?`,
  ]
  
  if (interests.length > 0) {
    starters.push(`Hi ${name}! I see you're into ${interests[0]} – that's awesome! What got you interested in that?`)
  } else {
    starters.push(`Hi ${name}! What do you like to do for fun on weekends?`)
  }
  
  if (occupation) {
    starters.push(`Hey! Being a ${occupation} sounds interesting. What's the best part about it?`)
  } else {
    starters.push(`Hey! I'd love to hear about what you're passionate about. What excites you most these days?`)
  }
  
  starters.push(`Hi ${name}! Would you be up for grabbing coffee sometime this week? I know a great spot.`)
  
  return starters
})

const getAge = (birthDate: string | null) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const copyStarter = async (text: string, index: number) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedIndex.value = index
    setTimeout(() => {
        copiedIndex.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleReport = () => {
   // Placeholder for report functionality
   alert('This feature is coming soon.')
}

const handleBlock = () => {
   // Placeholder for block functionality
   if(confirm('Are you sure you want to block this user?')) {
     alert('User has been blocked.')
   }
}

const handleUnlock = async () => {
  // Redirect to payment flow
  router.push(`/payment/match/${matchId.value}`)
}

// Available interests for mapping
const availableInterests = [
  { id: 'travel', label: 'Travel ✈️' },
  { id: 'fitness', label: 'Fitness 💪' },
  { id: 'cooking', label: 'Cooking 🍳' },
  { id: 'movies', label: 'Movies 🎬' },
  { id: 'music', label: 'Music 🎵' },
  { id: 'gaming', label: 'Gaming 🎮' },
  { id: 'reading', label: 'Reading 📚' },
  { id: 'art', label: 'Art 🎨' },
  { id: 'sports', label: 'Sports ⚽' },
  { id: 'tech', label: 'Tech 💻' },
  { id: 'fashion', label: 'Fashion 👗' },
  { id: 'food', label: 'Foodie 🍕' },
  { id: 'nature', label: 'Nature 🌿' },
  { id: 'photography', label: 'Photography 📸' },
  { id: 'dancing', label: 'Dancing 💃' },
  { id: 'entrepreneurship', label: 'Business 💼' }
]

const getInterestLabel = (id: string) => {
  const interest = availableInterests.find(i => i.id === id)
  return interest ? interest.label : id
}

// Fetch match data
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    const userId = session.user.id

    // Fetch match details
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId.value)
      .single()

    if (matchError || !matchData) {
      console.error('Match fetch error:', matchError)
      error.value = 'Match not found'
      loading.value = false
      return
    }

    const matchRecord = matchData as any

    // Determine which user is the match
    const isUser1 = matchRecord.user_1_id === userId
    const matchedUserId = isUser1 ? matchRecord.user_2_id : matchRecord.user_1_id
    const currentUserPaid = isUser1 ? matchRecord.user_1_paid : matchRecord.user_2_paid

    // Fetch matched user's profile using server-side API (bypasses RLS)
    let profileData = null
    try {
      const enrichedProfiles = await $fetch<Record<string, any>>('/api/enrich_matches', {
        method: 'POST',
        body: { matchUserIds: [matchedUserId] }
      })
      profileData = enrichedProfiles[matchedUserId] || null
    } catch (e) {
      console.error('Failed to enrich profile:', e)
    }

    match.value = {
      ...matchRecord,
      unlocked: matchRecord.status === 'unlocked',
      currentUserPaid,
      unlock_price: matchRecord.unlock_price || 10
    }

    matchProfile.value = profileData

  } catch (err: any) {
    console.error('Connection page error:', err)
    error.value = err.message || 'Failed to load connection'
  } finally {
    loading.value = false
  }
})

useHead({
  title: 'Your Connection - Minutes 2 Match'
})
</script>
