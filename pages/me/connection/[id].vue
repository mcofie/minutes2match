<template>
  <main class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans relative transition-colors duration-300">
    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] dark:bg-stone-950/90 dark:backdrop-blur-md border-b border-black dark:border-stone-800 transition-colors duration-300">
      <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/me" class="flex items-center">
           <img src="/logo-full.png" alt="minutes2match" class="h-20 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        
        <!-- User Info -->
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold text-black dark:text-stone-100 uppercase tracking-widest">{{ match?.unlocked ? matchProfile?.display_name : (personaData?.name || 'Mystery Match') }}</p>
            <p class="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Your Match</p>
          </div>
          <div class="w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-stone-800 border-2 border-black dark:border-stone-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            <img v-if="match?.unlocked && matchProfile?.photo_url" :src="matchProfile.photo_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-lg font-serif italic">{{ personaData?.emoji || '✨' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Sub Navigation -->
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex gap-8 border-t border-black/10 dark:border-white/10">
          <NuxtLink 
            to="/me"
            class="py-4 text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap border-b-2 border-transparent text-stone-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white flex items-center gap-2"
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
      <h2 class="text-xl font-bold text-stone-900 dark:text-white mb-2">Connection not found</h2>
      <p class="text-stone-500 dark:text-stone-400 mb-6">{{ error }}</p>
      <NuxtLink to="/me" class="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-stone-100 text-white dark:text-black rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-white transition-colors">
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Connection Content -->
    <div v-else class="max-w-6xl mx-auto px-4 py-8 pb-32">
      <div class="grid md:grid-cols-12 gap-8">
        
        <!-- Left Sidebar (Photo & Actions) -->
        <div class="md:col-span-4 lg:col-span-3 space-y-8">
          <!-- Profile Card -->
          <div class="bg-white dark:bg-stone-900 p-6 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] text-center sticky top-32">
            <!-- Photo -->
            <div class="relative inline-block mb-4">
              <div 
                class="w-32 h-32 rounded-full overflow-hidden border-2 border-black dark:border-stone-600 mx-auto"
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
              
              <!-- Member Badge -->
              <div v-if="matchProfile?.is_verified" class="absolute -top-2 -right-4 z-10 animate-bounce-in">
                 <div class="bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border-2 border-white dark:border-stone-900 shadow-md flex items-center gap-1 transform rotate-6 hover:rotate-0 transition-transform cursor-help" title="Verified Member">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400 dark:text-yellow-600"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Member
                 </div>
              </div>

              <!-- Status Badge -->
              <div 
                class="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black dark:border-stone-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] whitespace-nowrap"
                :class="match?.unlocked ? 'bg-emerald-400 text-black' : 'bg-rose-500 text-white'"
              >
                {{ match?.unlocked ? 'Connected' : 'Pending' }}
              </div>
            </div>

            <h2 class="text-2xl font-serif font-black text-black dark:text-white mb-1 mt-2">
              {{ match?.unlocked ? matchProfile?.display_name : (personaData?.name || 'Your Match') }}
            </h2>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-8 font-bold uppercase tracking-wide">
              {{ match?.unlocked ? `${getAge(matchProfile?.birth_date)} years old` : 'Age hidden' }}
              <span v-if="match?.unlocked && matchProfile?.location">• {{ matchProfile.location }}</span>
            </p>

            <!-- Actions -->
            <div class="space-y-4">
              <div v-if="match?.unlocked && matchProfile" class="grid grid-cols-2 gap-4">
                <a 
                  :href="`https://wa.me/${matchProfile.phone?.replace(/\D/g, '')}`"
                  target="_blank"
                  class="flex flex-col items-center justify-center gap-2 p-3 bg-black dark:bg-stone-100 text-white dark:text-black hover:bg-stone-800 dark:hover:bg-white rounded-lg transition-all border-2 border-black dark:border-stone-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
                </a>
                <a 
                  :href="`tel:${matchProfile.phone}`"
                  class="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-black dark:hover:border-stone-400 hover:text-black dark:hover:text-white rounded-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Call</span>
                </a>
              </div>
              
              <div v-else-if="match?.currentUserPaid" class="w-full py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded-lg font-bold text-xs uppercase tracking-widest border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center gap-2 cursor-wait">
                <span class="w-4 h-4 border-2 border-amber-300 dark:border-amber-700 border-t-amber-600 dark:border-t-amber-400 rounded-full animate-spin"></span>
                Waiting for Match...
              </div>

              <button 
                v-else
                @click="handleUnlock"
                :disabled="unlocking"
                class="w-full py-4 bg-black dark:bg-stone-100 text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(244,63,94,1)] hover:bg-rose-500 dark:hover:bg-rose-500 dark:hover:text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 border-2 border-black dark:border-stone-100 flex items-center justify-center gap-2"
              >
                <span v-if="unlocking" class="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></span>
                {{ unlocking ? 'Processing...' : `Unlock for GH₵${match?.unlock_price || 10}` }}
              </button>
            </div>
            
            <p class="text-xs text-stone-400 dark:text-stone-500 mt-4 leading-relaxed">
               Profiles with photos get 80% more matches.
            </p>
          </div>
        </div>

        <!-- Main Content (Form-like Inputs) -->
        <div class="md:col-span-8 lg:col-span-9 space-y-6">
          
          <!-- Basic Details -->
          <!-- Compatibility & Date Idea (Editorial Style) -->
          <div v-if="match?.unlocked && matchProfile" class="grid sm:grid-cols-2 gap-8 mb-8">
             <!-- Vibe Match (Editorial Report) -->
             <div class="bg-white dark:bg-stone-900 border border-black dark:border-stone-700 p-8 flex flex-col justify-between text-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-shadow duration-300">
                <!-- Decorative Corner Lines -->
                <div class="absolute top-2 left-2 w-4 h-4 border-t border-l border-black dark:border-white"></div>
                <div class="absolute top-2 right-2 w-4 h-4 border-t border-r border-black dark:border-white"></div>
                <div class="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-black dark:border-white"></div>
                <div class="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-black dark:border-white"></div>
                
                <div>
                   <h3 class="font-serif italic text-xl text-stone-900 dark:text-stone-100 mb-2">The Compatibility Report</h3>
                   <div class="w-12 h-px bg-black md:mx-auto mb-6"></div>
                   
                   <div v-if="sharedInterests.length" class="mb-6">
                      <div class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Key Areas of Connection</div>
                      <div class="flex flex-wrap justify-center gap-x-4 gap-y-2">
                         <span v-for="interest in sharedInterests" :key="interest" class="font-serif text-lg border-b border-stone-200">
                            {{ getInterestLabel(interest) }}
                         </span>
                      </div>
                   </div>
                   <div v-else class="mb-6">
                      <p class="font-serif text-stone-500">"A study in contrasts."</p>
                   </div>
                </div>

                <div class="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-4">
                   established {{ new Date(match.created_at).toLocaleDateString() }}
                </div>
             </div>
             
             <!-- Smart Date Idea (Editor's Pick) -->
             <div v-if="dateIdea" class="bg-stone-50 dark:bg-stone-800 border border-black dark:border-stone-600 p-8 flex flex-col justify-center text-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-shadow duration-300">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                   Editor's Choice
                </div>
                
                <h3 class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Our Recommendation</h3>
                
                <div class="text-4xl mb-4">{{ dateIdea.emoji }}</div>
                
                <h4 class="font-serif font-bold text-2xl text-black dark:text-white leading-tight mb-4">
                   {{ dateIdea.title }}
                </h4>
                
                <p class="font-serif italic text-stone-600 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
                   "{{ dateIdea.desc }}"
                </p>
             </div>
          </div>

          <!-- Basic Details (Unlocked) -->
          <div v-if="match?.unlocked && matchProfile" class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h3 class="text-2xl font-serif font-bold text-black mb-8 flex items-center gap-2">
               <span>Basic Info</span>
               <div class="h-px flex-1 bg-stone-100"></div>
             </h3>
             
             <div class="grid md:grid-cols-2 gap-6">
                 <!-- Display Name -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Display Name</label>
                    <div class="font-serif text-lg font-bold">{{ matchProfile.display_name }}</div>
                 </div>
                 
                 <!-- Age -->
                 <div class="space-y-2">
                     <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Age</label>
                     <div class="font-serif text-lg font-bold">{{ getAge(matchProfile.birth_date) }} years</div>
                 </div>
                 
                 <!-- Location -->
                 <div class="space-y-2">
                     <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Location</label>
                     <div class="font-serif text-lg font-bold">{{ matchProfile.location }}</div>
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
                    <div class="font-serif text-lg font-bold">{{ matchProfile.occupation || 'Not specified' }}</div>
                 </div>

                 <!-- Religion -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Religion ⛪️</label>
                    <div class="font-serif text-lg font-bold">{{ matchProfile.religion || 'Not specified' }}</div>
                 </div>
                 
                 <!-- Height -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Height 📏</label>
                     <div class="font-serif text-lg font-bold">{{ matchProfile.height_cm ? `${matchProfile.height_cm} cm` : 'Not specified' }}</div>
                 </div>

                 <!-- Intent -->
                 <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Looking For 💍</label>
                     <div class="font-serif text-lg font-bold capitalize">{{ matchProfile.intent || 'Friendship' }}</div>
                 </div>
              </div>
           </div>
           
           <!-- Partial Unlock / Waiting State -->
           <div v-else-if="match?.currentUserPaid" class="bg-amber-50 p-8 rounded-xl border-2 border-amber-200">
             <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-amber-200">⏳</div>
                <div>
                   <h3 class="text-xl font-bold font-serif text-amber-900 mb-2">Waiting for Match</h3>
                   <p class="text-amber-800 leading-relaxed text-sm">
                      You've unlocked this profile, but we're waiting for them to unlock yours. We've sent them a notification!
                   </p>
                   <div class="mt-4 flex flex-col gap-2">
                      <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-amber-700">
                         <span>Status</span>
                         <span>Expires in {{ formatTimeRemaining(match.expires_at) }}</span>
                      </div>
                      <div class="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                         <div class="h-full bg-amber-500 w-1/2 animate-pulse"></div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           
           <!-- Locked / Blind Details -->
           <div v-else class="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] opacity-70">
              <div class="flex items-center justify-between mb-8 opacity-50">
                 <h3 class="text-2xl font-serif font-bold text-black flex items-center gap-2">
                   <span>Basic Info</span>
                   <div class="h-px flex-1 bg-stone-100"></div>
                 </h3>
                 <span class="text-xs font-bold uppercase tracking-widest bg-stone-100 px-3 py-1 rounded">Locked</span>
              </div>
              
              <div class="flex flex-col items-center justify-center py-12 text-center text-stone-400">
                 <svg class="w-12 h-12 mb-4 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                 </svg>
                 <p class="font-serif italic text-lg mb-2 text-stone-500">Details Hidden</p>
                 <p class="text-sm max-w-xs mx-auto">Unlock this profile to view their full details, phone number, and bio.</p>
              </div>
           </div>
          
          <!-- About Section -->
          <div v-if="match?.unlocked && matchProfile" class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
             <div class="flex items-center justify-between mb-4">
                 <h3 class="text-2xl font-serif font-bold text-black dark:text-white">About Me</h3>
                 <span class="text-[10px] font-bold font-mono text-stone-400 dark:text-stone-500">{{ matchProfile.about_me?.length || 0 }}/300</span>
             </div>
             <div class="w-full p-6 bg-white dark:bg-stone-950 rounded-lg border-2 border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300 min-h-[100px] leading-relaxed font-serif text-lg">
                "{{ matchProfile.about_me || 'No bio available yet.' }}"
             </div>
          </div>

          <!-- Interests -->
          <div v-if="match?.unlocked && matchProfile?.interests?.length" class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
             <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-serif font-bold text-black dark:text-white">Interests</h3>
                <span class="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500">{{ matchProfile.interests.length }} selected</span>
             </div>
             <div class="flex flex-wrap gap-2">
                <span 
                  v-for="interest in matchProfile.interests" 
                  :key="interest"
                  class="px-4 py-2 bg-white dark:bg-stone-800 text-black dark:text-white rounded-full text-xs font-bold uppercase tracking-widest border-2 border-stone-200 dark:border-stone-600"
                >
                  <!-- Helper to find emoji -->
                  {{ getInterestLabel(interest) }}
                </span>
             </div>
          </div>

          <!-- Conversation Starters (Bottom) -->
          <div v-if="match?.unlocked" class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
             <h3 class="text-2xl font-serif font-bold text-black dark:text-white mb-6">Ice Breakers 🧊</h3>
             <div class="grid md:grid-cols-2 gap-4">
               <button 
                v-for="(starter, index) in conversationStarters" 
                :key="index"
                @click="copyStarter(starter, index)"
                class="group relative text-left p-6 pr-10 rounded-xl border-2 border-stone-100 dark:border-stone-700 hover:border-black dark:hover:border-stone-400 hover:bg-white dark:hover:bg-stone-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:-translate-y-1"
              >
                {{ starter }}
                <div v-if="copiedIndex === index" class="absolute top-2 right-2 text-[10px] font-bold text-white bg-black dark:bg-stone-100 dark:text-black px-2 py-1 rounded-sm uppercase tracking-wider">
                  Copied
                </div>
                <div v-else class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-black dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
              </button>
             </div>
          </div>
          
          <!-- Pro Tips (Bottom) -->
          <div class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
            <div class="flex items-start gap-4">
               <div class="pt-1">
                  <span class="text-2xl">💡</span>
               </div>
               <div>
                   <h3 class="text-lg font-bold text-black dark:text-white uppercase tracking-widest mb-4">Safety & Etiquette</h3>
                   <ul class="space-y-3 text-sm text-stone-700 dark:text-stone-300">
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
        <button @click="handleReport" class="text-xs font-bold text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            Report User
        </button>
        <span class="text-stone-300 dark:text-stone-700">|</span>
        <button @click="handleBlock" class="text-xs font-bold text-stone-400 dark:text-stone-500 hover:text-red-500 uppercase tracking-wider flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
            Block User
        </button>
      </div>
    </div>

    <!-- Report Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showReportModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showReportModal = false">
          <div class="bg-white dark:bg-stone-900 w-full max-w-md rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">
            <!-- Header -->
            <div class="bg-red-500 p-4 flex justify-between items-center border-b-2 border-black">
              <h3 class="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                Report User
              </h3>
              <button @click="showReportModal = false" class="text-white hover:text-white/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            
            <!-- Body -->
            <div class="p-6 space-y-6">
              <p class="text-sm text-stone-600 dark:text-stone-400">
                Help us keep the community safe. Your report will be reviewed by our team.
              </p>
              
              <!-- Reason Selection -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-stone-500">Reason for reporting</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="option in reportReasons" 
                    :key="option.value"
                    @click="reportForm.reason = option.value"
                    :class="[
                      'p-3 rounded-lg border-2 text-left transition-all text-xs font-bold uppercase tracking-wide',
                      reportForm.reason === option.value 
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' 
                        : 'border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    ]"
                  >
                    <span class="mr-1">{{ option.emoji }}</span> {{ option.label }}
                  </button>
                </div>
              </div>
              
              <!-- Description -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-stone-500">Additional details (optional)</label>
                <textarea 
                  v-model="reportForm.description"
                  rows="3"
                  placeholder="Describe what happened..."
                  class="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-lg border-2 border-stone-200 dark:border-stone-700 focus:border-black dark:focus:border-white outline-none text-sm resize-none transition-colors"
                ></textarea>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="p-4 bg-stone-50 dark:bg-stone-800 border-t-2 border-stone-200 dark:border-stone-700 flex gap-3">
              <button 
                @click="showReportModal = false"
                class="flex-1 py-3 bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg font-bold text-xs uppercase tracking-widest border-2 border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                @click="submitReport"
                :disabled="!reportForm.reason || submittingReport"
                class="flex-1 py-3 bg-red-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest border-2 border-red-600 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span v-if="submittingReport" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ submittingReport ? 'Submitting...' : 'Submit Report' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'
import { useToast } from '~/composables/useToast'
import type { Database } from '~/types/database'

const toast = useToast()
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

const formatTimeRemaining = (expiresAt: string) => {
  if (!expiresAt) return '24h'
  const now = new Date().getTime()
  const end = new Date(expiresAt).getTime()
  const diff = end - now
  
  if (diff <= 0) return 'Expired'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 24) {
     const days = Math.floor(hours / 24)
     return `${days}d left`
  }
  return `${hours}h left`
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
   showReportModal.value = true
}

// Report functionality
const showReportModal = ref(false)
const submittingReport = ref(false)
const reportForm = reactive({
  reason: '' as string,
  description: ''
})

const reportReasons = [
  { value: 'inappropriate_behavior', label: 'Inappropriate', emoji: '😤' },
  { value: 'fake_profile', label: 'Fake Profile', emoji: '🎭' },
  { value: 'harassment', label: 'Harassment', emoji: '⚠️' },
  { value: 'spam', label: 'Spam', emoji: '📧' },
  { value: 'underage', label: 'Underage', emoji: '🔞' },
  { value: 'other', label: 'Other', emoji: '❓' }
]

const submitReport = async () => {
  if (!reportForm.reason || !matchProfile.value?.id) return
  
  submittingReport.value = true
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      toast.error('Error', 'You must be logged in to submit a report.')
      return
    }
    
    // Check for existing report in last 24 hours
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', session.user.id)
      .eq('reported_user_id', matchProfile.value.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .maybeSingle()
    
    if (existingReport) {
      toast.info('Already Reported', 'You have already reported this user recently. Our team is reviewing it.')
      showReportModal.value = false
      return
    }
    
    // Insert report
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: session.user.id,
        reported_user_id: matchProfile.value.id,
        match_id: matchId.value,
        reason: reportForm.reason,
        description: reportForm.description || null,
        status: 'pending'
      })
    
    if (error) {
      console.error('Report insert error:', error)
      throw new Error(error.message)
    }
    
    toast.success('Report Submitted', 'Thank you for helping keep our community safe.')
    showReportModal.value = false
    reportForm.reason = ''
    reportForm.description = ''
  } catch (error: any) {
    const message = error.message || 'Failed to submit report. Please try again.'
    toast.error('Report Failed', message)
  } finally {
    submittingReport.value = false
  }
}

const handleBlock = () => {
   // Placeholder for block functionality
   if(confirm('Are you sure you want to block this user?')) {
     toast.success('User blocked', 'You will no longer see this user.')
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

const currentUser = ref<any>(null)

const sharedInterests = computed(() => {
  if (!matchProfile.value?.interests || !currentUser.value?.interests) return []
  return matchProfile.value.interests.filter((i: string) => currentUser.value.interests.includes(i))
})

const dateIdea = computed(() => {
   if (!matchProfile.value) return null
   const interests = matchProfile.value.interests || []
   const shared = sharedInterests.value
   
   // Prioritize shared interests
   const relevant = shared.length ? shared : interests
   
   if (relevant.includes('coffee') || relevant.includes('reading')) return { title: 'Bookstore Café Date', emoji: '☕️', desc: 'Find a cozy corner, sip some latte, and browse books together.' }
   if (relevant.includes('art') || relevant.includes('photography')) return { title: 'Gallery Hopping', emoji: '🎨', desc: 'Visit a local art exhibition and critique the abstract pieces.' }
   if (relevant.includes('fitness') || relevant.includes('sports')) return { title: 'Active Date', emoji: '🏃‍♂️', desc: 'Go for a scenic run or try a bouldering gym together.' }
   if (relevant.includes('food') || relevant.includes('cooking')) return { title: 'Food Tour', emoji: '🌮', desc: 'Hop between three different spots: appetizers, mains, and dessert.' }
   if (relevant.includes('music') || relevant.includes('dancing')) return { title: 'Live Music Night', emoji: '🎷', desc: 'Find a jazz bar or a local gig and enjoy the vibes.' }
   if (relevant.includes('nature') || relevant.includes('travel')) return { title: 'Sunset Picnic', emoji: '🌅', desc: 'Pack some snacks and find a spot with a view to watch the sunset.' }
   if (relevant.includes('movies')) return { title: 'Drive-in Cinema', emoji: '🎬', desc: 'Watch a classic movie under the stars (or just a regular cinema!).' }
   
   return { title: 'Classic Dinner Date', emoji: '🥂', desc: 'Pick a restaurant with great ambiance and get to know each other properly.' }
})

// Fetch match data
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    const userId = session.user.id

    // Fetch CURRENT USER details (for comparison)
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    currentUser.value = myProfile

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
