<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>Profile | Minutes 2 Match</Title>
    </Head>
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 md:gap-4 mb-5 md:mb-8 pt-2">
       <h2 class="text-2xl font-bold tracking-tight dark:text-white leading-none">Profile Settings</h2>
       <div class="flex items-center gap-1.5 md:gap-2 shrink-0">
           <span class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2 sm:px-3 py-1.5 rounded-full shadow-sm" :title="personaData?.name || 'New Member'">
             <span class="text-xs">{{ personaData?.emoji || '✨' }}</span>
             <span class="hidden sm:inline">{{ personaData?.name || 'New Member' }}</span>
           </span>
           <span class="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 px-2 sm:px-3 py-1.5 rounded-full shadow-sm" title="Your Trust Score">
             <span>🛡️</span> 
             <span>{{ trustScore || 60 }}%</span>
           </span>
           <span v-if="creditBalanceDashboard > 0" @click="activeProfileSection = 'account'" class="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 px-2 sm:px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" title="M2M Credit — tap to view wallet">
             <span>💚</span> 
             <span>GHS {{ creditBalanceDashboard.toFixed(2) }}</span>
           </span>
           <span v-if="passkeys.length > 0" class="hidden md:inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-full shadow-sm cursor-pointer" @click="activeProfileSection = 'security'" title="Biometric Login Enabled">
             <span class="text-xs">🔑</span>
             <span>Protected</span>
           </span>
           <button @click="showPreview = true" class="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-black hover:bg-rose-500 px-2.5 sm:px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5" title="Preview Profile">
             <span class="text-xs">👁️</span>
             <span class="hidden sm:inline">Preview</span>
           </button>
        </div>
    </div>

    <div class="grid md:grid-cols-3 gap-8 min-w-0 w-full">
      <!-- Sidebar (Desktop Only) -->
      <div class="hidden md:block md:col-span-1 space-y-6 min-w-0">
         <!-- Photo Card -->
         <div class="bg-white dark:bg-stone-900 p-6 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] text-center flex flex-col items-center">
            <div class="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" @click="triggerPhotoUpload">
               <div class="w-full h-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-black dark:border-stone-600 relative">
                  <NuxtImg v-if="photoPreview || profile?.photo_url" :src="photoPreview || profile?.photo_url" class="w-full h-full object-cover" width="128" height="128" />
                  <div v-else class="w-full h-full flex items-center justify-center text-4xl text-stone-300 dark:text-stone-600">📷</div>
                  <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span class="text-white text-xs font-bold uppercase tracking-widest">{{ uploadingPhoto ? 'Wait...' : 'Update' }}</span>
                  </div>
               </div>
               <input type="file" ref="photoInput" accept="image/*" @change="handlePhotoUpload" class="hidden" />
            </div>
            
            <!-- Profile Strength -->
            <div class="w-full mb-6">
               <div class="flex justify-between items-center mb-2">
                  <span class="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-300">Profile Strength</span>
                  <span class="text-xs font-black" :class="profileStrength > 80 ? 'text-emerald-500' : 'text-rose-500'">{{ profileStrength }}%</span>
               </div>
               <div class="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full border border-black overflow-hidden relative">
                  <div class="absolute top-0 left-0 h-full transition-all duration-1000" :class="profileStrength > 80 ? 'bg-emerald-400' : 'bg-rose-400'" :style="{ width: `${profileStrength}%` }"></div>
                  <!-- Strength Notches -->
                  <div class="absolute inset-0 flex justify-between px-1">
                     <div v-for="i in 4" :key="i" class="w-px h-full bg-black/10"></div>
                  </div>
               </div>
            </div>

            <p class="text-[10px] font-medium text-stone-500 dark:text-stone-400">
               <span v-if="profileStrength < 100" class="flex flex-col gap-1">
                  <span>✨ <span class="font-bold">Add matching info</span> for 2x more matches</span>
               </span>
               <span v-else class="text-emerald-500 font-bold">✨ You're unstoppable!</span>
            </p>
         </div>

         <!-- Section Navigation (Sidebar) -->
         <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
            <button 
              v-for="section in profileSections" 
              :key="section.id"
              @click="activeProfileSection = section.id as any"
              class="w-full text-left p-4 flex items-center gap-4 transition-all border-b border-stone-100 dark:border-stone-800 last:border-0"
              :class="activeProfileSection === section.id ? 'bg-black dark:bg-stone-800 text-white' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'"
            >
              <span class="text-xl">{{ section.icon }}</span>
              <div class="flex-1">
                <p class="text-[10px] font-bold uppercase tracking-widest" :class="activeProfileSection === section.id ? 'text-rose-400' : 'text-stone-400'">{{ section.label }}</p>
                <p class="text-xs font-semibold" :class="activeProfileSection === section.id ? 'text-white' : 'text-stone-600 dark:text-stone-300'">{{ section.desc }}</p>
              </div>
            </button>
         </div>

         <!-- Match Compatibility Radar -->
         <div class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] group relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div class="flex items-center justify-between mb-8">
               <h4 class="text-[12px] font-bold text-black dark:text-white uppercase tracking-wider">Compatibility Radar</h4>
               <span class="px-3 py-1 bg-[#fff1f2] dark:bg-rose-900/30 text-[#f43f5e] text-[10px] font-bold rounded border border-[#fecdd3] dark:border-rose-900/50 uppercase tracking-widest">Live</span>
            </div>
            
            <div class="space-y-6">
               <div class="space-y-2">
                  <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#a8a29e] dark:text-stone-300">
                     <span>Vibe Harmony</span>
                     <span class="text-black dark:text-stone-200">88%</span>
                  </div>
                  <div class="h-2 bg-[#f5f5f4] dark:bg-stone-800 rounded-full overflow-hidden">
                     <div class="h-full bg-[#f43f5e] w-[88%] transform group-hover:scale-x-105 transition-transform origin-left rounded-full"></div>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#a8a29e] dark:text-stone-300">
                     <span>Intent Alignment</span>
                     <span class="text-black dark:text-white">72%</span>
                  </div>
                  <div class="h-2 bg-[#f5f5f4] dark:bg-stone-800 rounded-full overflow-hidden">
                     <div class="h-full bg-black dark:bg-white w-[72%] transform group-hover:scale-x-105 transition-transform origin-left rounded-full"></div>
                  </div>
               </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-[#f5f5f4] dark:border-stone-800">
               <p class="text-[14px] text-[#57534e] dark:text-stone-400 leading-relaxed font-medium">Your persona aligns best with <span class="text-black dark:text-white font-bold">"The Intellectual"</span> and <span class="text-black dark:text-white font-bold">"The Adventurer"</span> types this week.</p>
            </div>
         </div>

         <!-- Persona Detail Card -->
         <div v-if="personaData" class="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] group hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div class="flex items-center gap-4 mb-6">
               <div class="w-[60px] h-[60px] rounded-[18px] border-2 border-black bg-[#ff0042] flex items-center justify-center text-3xl shadow-none">{{ personaData.emoji }}</div>
               <div>
                  <h4 class="text-[18px] font-bold text-black uppercase tracking-tight">{{ personaData.name }}</h4>
                  <p class="text-[10px] font-bold text-[#a8a29e] uppercase tracking-[0.15em] mt-1">Your Vibe</p>
               </div>
            </div>
            <p class="text-[15px] font-medium text-[#57534e] dark:text-stone-300 leading-relaxed italic">"{{ personaData.description }}"</p>
         </div>

         <!-- Community Health Card -->
         <div class="bg-stone-900 text-white p-6 md:p-8 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden relative group hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div class="absolute -top-2 -right-2 p-4 opacity-[0.02] text-6xl group-hover:scale-110 transition-transform">🛡️</div>
            <h4 class="text-[12px] font-black uppercase tracking-[0.2em] text-[#1c1917] mb-8">Pool Quality Control</h4>
            <div class="space-y-6">
               <div class="flex items-center justify-between mb-4">
                  <span class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#f5f5f4]">Match Pool Purity</span>
                  <span class="text-[18px] font-medium text-[#00f28e]">98.4%</span>
               </div>
               <div class="h-2 w-full bg-[#1c1917] rounded-full overflow-hidden mb-8">
                  <div class="h-full bg-[#00f28e] w-[98%] shadow-[0_0_8px_rgba(0,242,142,0.5)] rounded-full"></div>
               </div>
               <div class="pt-2">
                  <p class="text-[14px] text-[#d6d3d1] leading-relaxed font-medium">
                     <span class="text-[#ff0042] font-bold uppercase tracking-widest text-[11px] mr-1">Active Purge:</span> Our algorithm recently removed <span class="text-white font-bold">14 inactive or low-quality profiles</span> to maintain your connection standards.
                  </p>
               </div>
               <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a8a29e] mt-2 pt-4">
                  <span class="relative flex h-3 w-3">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f28e] opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-3 w-3 bg-[#00f28e]"></span>
                  </span>
                  Vetting Pulse: Healthy
               </div>
            </div>
         </div>
      </div>

      <!-- Main Content Area -->
      <div class="md:col-span-2 space-y-6 pb-32 md:pb-0 min-w-0">
         <!-- Mobile Section Nav -->
         <div class="md:hidden flex overflow-x-auto gap-3 pb-4 no-scrollbar sticky top-16 z-[55] bg-[#FFFCF8]/95 dark:bg-stone-950/95 backdrop-blur-md py-4 border-b border-stone-100 dark:border-stone-800 transition-all duration-300 -mx-4 px-4 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
            <button 
              v-for="section in profileSections" 
              :key="'m-'+section.id"
              @click="activeProfileSection = section.id as any"
              class="flex-shrink-0 px-5 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2"
              :class="activeProfileSection === section.id ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-800'"
            >
              <span class="text-sm">{{ section.icon }}</span>
              {{ section.label }}
            </button>
         </div>

         <!-- Mobile Photo/Badges Header (Only show in Identity section) -->
         <div v-if="activeProfileSection === 'identity'" class="md:hidden flex flex-col gap-4 mb-4">
            <div @click="triggerPhotoUpload" class="bg-white dark:bg-stone-900 p-4 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 active:scale-[0.98] transition-all overflow-hidden">
               <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-black flex-shrink-0">
                  <NuxtImg v-if="photoPreview || profile?.photo_url" :src="photoPreview || profile?.photo_url" class="w-full h-full object-cover" width="56" height="56" />
                  <div v-else class="w-full h-full flex items-center justify-center text-xl text-stone-300">📷</div>
               </div>
               <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-0.5">Profile Photo</p>
                  <p class="text-[9px] font-medium text-stone-500 uppercase tracking-widest truncate">Tap to update</p>
               </div>
            </div>
            <div class="bg-white dark:bg-stone-900 p-4 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 overflow-hidden">
               <div class="flex -space-x-2 flex-shrink-0">
                  <template v-if="profile?.badges?.length">
                     <div v-for="badge in profile.badges.slice(0,3)" :key="badge" :title="badge" class="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center text-lg shadow-sm">
                        <span v-if="badge.includes('photo')">📸</span>
                        <span v-else-if="badge.includes('phone')">📱</span>
                        <span v-else-if="badge.includes('premium')">👑</span>
                        <span v-else>✨</span>
                     </div>
                  </template>
                  <div v-else class="w-10 h-10 rounded-full border-2 border-stone-100 bg-stone-50 flex items-center justify-center text-stone-300">?</div>
               </div>
               <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-0.5">Badges Earned</p>
                  <p class="text-[9px] font-medium text-stone-500 uppercase tracking-widest truncate">{{ profile?.badges?.length || 0 }} achievements</p>
               </div>
            </div>
         </div>

         <!-- IDENTITY SECTION -->
         <div v-if="activeProfileSection === 'identity'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <!-- Basic Info -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8 flex items-center gap-2">
                  <span>Basic Info</span>
                  <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Display Name</label>
                    <input type="text" v-model="editForm.display_name" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Base Location</label>
                    <input list="locations-list" v-model="editForm.location" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" placeholder="e.g. Accra, Ghana" />
                    <datalist id="locations-list">
                       <option v-for="loc in ghanaLocations" :key="loc" :value="loc" />
                    </datalist>
                    <div class="flex flex-wrap gap-2 mt-2">
                       <button v-for="loc in ['Accra', 'East Legon', 'Kumasi', 'Tema']" :key="loc" @click="editForm.location = loc" type="button" class="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">{{ loc }}</button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Gender</label>
                    <select v-model="editForm.gender" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                       <option value="male">Male</option>
                       <option value="female">Female</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Birth Date</label>
                    <UiDatePicker 
                      v-model="editForm.birth_date" 
                      placeholder="Select your birthday"
                      class="font-mono text-sm w-full"
                      forBirthday
                    />
                  </div>
                </div>
            </div>

            <!-- Bio / About Me -->
             <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                <div class="flex items-center justify-between mb-4 md:mb-6">
                   <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white">About Me</h3>
                   <span class="text-xs font-mono font-bold" :class="editForm.about_me.length > 250 ? 'text-rose-500 md:text-rose-400' : 'text-stone-400 dark:text-stone-500'">
                      {{ editForm.about_me.length }}/300
                   </span>
                </div>
                <textarea 
                  v-model="editForm.about_me" 
                  maxlength="300"
                  rows="4"
                  placeholder="Tell your story... What drives you? What are you looking for?"
                  class="w-full p-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-medium resize-none leading-relaxed"
                ></textarea>
                <div class="mt-4 flex flex-wrap gap-2">
                   <span class="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase rounded-full">✨ Bio helps you match 80% faster</span>
                </div>
             </div>
         </div>

         <!-- LIFESTYLE SECTION -->
         <div v-if="activeProfileSection === 'lifestyle'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
               <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8 flex items-center gap-2">
                  <span>Lifestyle</span>
                  <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Occupation</label>
                    <input list="occupations-list" v-model="editForm.occupation" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" />
                    <datalist id="occupations-list">
                       <option v-for="job in commonOccupations" :key="job" :value="job" />
                    </datalist>
                    <div class="flex flex-wrap gap-2 mt-2">
                       <button v-for="job in ['Entrepreneur', 'Student', 'Engineer', 'Creative']" :key="job" @click="editForm.occupation = job" type="button" class="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">{{ job }}</button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Height (cm)</label>
                     <select v-model="editForm.height_cm" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                        <option :value="null">Select height...</option>
                        <option v-for="h in heightOptions" :key="h.cm" :value="h.cm">{{ h.label }}</option>
                     </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Genotype</label>
                    <select v-model="editForm.genotype" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                       <option value="">Select...</option>
                       <option value="AA">AA</option>
                       <option value="AS">AS</option>
                       <option value="AC">AC</option>
                       <option value="SS">SS</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Religion</label>
                    <select v-model="editForm.religion" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                       <option value="">Select...</option>
                       <option value="christian">Christian</option>
                       <option value="muslim">Muslim</option>
                       <option value="traditional">Traditional</option>
                       <option value="other">Other</option>
                    </select>
                  </div>
               </div>
            </div>

            <!-- Contact & Socials -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
               <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8 flex items-center gap-2">
                 <span>Match Reveal Settings</span>
                 <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Instagram Handle</label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">@</span>
                        <input type="text" v-model="editForm.instagram_handle" placeholder="username" class="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" />
                      </div>
                  </div>
                  <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Snapchat Handle</label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">👻</span>
                        <input type="text" v-model="editForm.snapchat_handle" placeholder="username" class="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" />
                      </div>
                  </div>
                  <div class="md:col-span-2 space-y-4 pt-4">
                      <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 block mb-2 tracking-widest">Preferred Reveal Method</label>
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <button 
                           type="button"
                           @click="editForm.preferred_contact_method = 'phone'"
                           class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group"
                           :class="editForm.preferred_contact_method === 'phone' ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-800' : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700'"
                         >
                           <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" :class="editForm.preferred_contact_method === 'phone' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 group-hover:bg-stone-100 dark:group-hover:bg-stone-700'">📱</div>
                           <div class="text-left">
                             <p class="text-xs font-bold uppercase tracking-widest" :class="editForm.preferred_contact_method === 'phone' ? 'text-black dark:text-white' : 'text-stone-400'">Phone</p>
                             <p class="text-[10px] text-stone-400">Reveal mobile number</p>
                           </div>
                         </button>

                         <button 
                           type="button"
                           @click="editForm.preferred_contact_method = 'instagram'"
                           class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group"
                           :class="editForm.preferred_contact_method === 'instagram' ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-800' : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700'"
                         >
                           <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" :class="editForm.preferred_contact_method === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 text-white' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 group-hover:bg-stone-100 dark:group-hover:bg-stone-700'">📸</div>
                           <div class="text-left">
                             <p class="text-xs font-bold uppercase tracking-widest" :class="editForm.preferred_contact_method === 'instagram' ? 'text-black dark:text-white' : 'text-stone-400'">Instagram</p>
                             <p class="text-[10px] text-stone-400">Reveal IG handle</p>
                           </div>
                         </button>

                         <button 
                           type="button"
                           @click="editForm.preferred_contact_method = 'snapchat'"
                           class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group"
                           :class="editForm.preferred_contact_method === 'snapchat' ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-800' : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-200 dark:hover:border-stone-700'"
                         >
                           <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" :class="editForm.preferred_contact_method === 'snapchat' ? 'bg-yellow-400 text-white' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 group-hover:bg-stone-100 dark:group-hover:bg-stone-700'">👻</div>
                           <div class="text-left">
                             <p class="text-xs font-bold uppercase tracking-widest" :class="editForm.preferred_contact_method === 'snapchat' ? 'text-black dark:text-white' : 'text-stone-400'">Snapchat</p>
                             <p class="text-[10px] text-stone-400">Reveal Snap handle</p>
                           </div>
                         </button>
                      </div>
                  </div>
               </div>
            </div>
         </div>

         <!-- HOBBIES SECTION -->
         <div v-if="activeProfileSection === 'hobbies'" class="animate-in fade-in slide-in-from-right-4 duration-300">
            <!-- Interests -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
               <div class="flex items-center justify-between mb-4 md:mb-6">
                  <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white">Interests</h3>
                  <span class="text-xs font-mono font-bold text-stone-400 dark:text-stone-500">{{ editForm.interests.length }}/6 selected</span>
               </div>
               <div class="flex flex-wrap gap-2">
                  <button 
                     v-for="interest in availableInterests" 
                     :key="interest.id"
                     @click="toggleInterest(interest.id)"
                     class="px-4 py-2 rounded-full border-2 text-xs font-bold transition-all"
                     :class="editForm.interests.includes(interest.id) ? 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-stone-500 border-stone-100 hover:border-stone-200'"
                  >
                     {{ interest.label }}
                  </button>
               </div>
            </div>
         </div>

         <!-- MATCHING SECTION -->
         <div v-if="activeProfileSection === 'matching'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <!-- Intent & Interest -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
               <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8 flex items-center gap-2">
                  <span>Matching Preferences</span>
                  <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Considering</label>
                     <select v-model="editForm.intent" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                      <option value="marriage">Marriage</option>
                      <option value="serious">Serious Relationship</option>
                      <option value="casual">Casual Dating</option>
                      <option value="friendship">Friendship</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Interested In</label>
                    <select v-model="editForm.interested_in" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold">
                      <option value="male">Men</option>
                      <option value="female">Women</option>
                      <option value="everyone">Everyone</option>
                    </select>
                  </div>
               </div>
            </div>

             <!-- Dealbreakers Summary in Matching -->
             <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-rose-200 dark:border-rose-900 shadow-[4px_4px_0px_0px_rgba(244,63,94,0.3)] md:shadow-[8px_8px_0px_0px_rgba(244,63,94,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(244,63,94,0.1)]">
                <div class="flex items-center gap-3 mb-2">
                   <span class="text-2xl">🚫</span>
                   <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white">Dealbreakers</h3>
                </div>
               <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-8">Set your non-negotiable preferences. We'll filter matches accordingly.</p>
               
               <!-- Age Range -->
               <div class="mb-8">
                  <div class="flex justify-between items-center mb-4">
                     <label class="text-[10px] font-bold uppercase text-stone-600 dark:text-stone-300 tracking-widest">Age Range: {{ editForm.min_age }} - {{ editForm.max_age }}</label>
                  </div>
                  <div class="px-2">
                     <div class="flex gap-4">
                        <div class="flex-1 space-y-2">
                           <span class="text-[9px] font-bold text-stone-400 uppercase">Min</span>
                           <input type="range" v-model.number="editForm.min_age" min="18" max="50" class="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-black" />
                        </div>
                        <div class="flex-1 space-y-2">
                           <span class="text-[9px] font-bold text-stone-400 uppercase">Max</span>
                           <input type="range" v-model.number="editForm.max_age" min="20" max="60" class="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-black" />
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Multi-select Dealbreakers -->
               <div class="space-y-6">
                  <div v-for="cat in ['genotype', 'religion', 'intent']" :key="cat" class="space-y-3">
                     <label class="text-[10px] font-bold uppercase text-stone-600 dark:text-stone-300 tracking-widest">{{ cat }} Preferences</label>
                     <div class="flex flex-wrap gap-2">
                        <button 
                           v-for="val in getOptions(cat)" 
                           :key="val"
                           @click="toggleDealbreaker(cat as any, val)"
                           class="px-3 py-1.5 rounded-lg border-2 text-[10px] font-bold transition-all"
                           :class="editForm.dealbreakers[cat as keyof typeof editForm.dealbreakers]?.includes(val) ? 'bg-rose-500 text-white border-rose-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' : 'bg-white dark:bg-stone-800 text-stone-500 border-stone-100 dark:border-stone-700'"
                        >
                           {{ val }}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

          <!-- AVAILABILITY SECTION -->
          <div v-if="activeProfileSection === 'availability'" class="animate-in fade-in slide-in-from-right-4 duration-300">
             <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8 flex items-center gap-2">
                   <span>Dating Availability</span>
                   <div class="h-px flex-1 bg-stone-100 dark:bg-stone-800"></div>
                </h3>
                <AvailabilityPicker v-model="editForm.availability" />
             </div>
          </div>

         <!-- SECURITY SECTION -->
         <div v-if="activeProfileSection === 'security'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-4">Passkeys</h3>
                <p class="text-sm text-stone-500 mb-8 leading-relaxed">
                   Use FaceID, TouchID, or your device passcode to sign in instantly without waiting for an SMS. This is much more secure than OTPs.
                </p>

                <div v-if="passkeys.length > 0" class="space-y-3 mb-8">
                   <div v-for="pk in passkeys" :key="pk.id" class="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border-2 border-stone-100 dark:border-stone-700">
                      <div class="flex items-center gap-3">
                         <span class="text-xl">🔑</span>
                         <div>
                            <p class="text-xs font-bold">{{ pk.name }}</p>
                            <p class="text-[10px] text-stone-400 uppercase">Registered {{ new Date(pk.created_at).toLocaleDateString() }}</p>
                         </div>
                      </div>
                      <button @click="handleDeletePasskey(pk.id)" class="text-stone-400 hover:text-rose-500 p-2 transition-colors">
                         <span class="text-lg">🗑️</span>
                      </button>
                   </div>
                </div>

                <button 
                  v-if="isPasskeySupported"
                  @click="handleRegisterPasskey"
                  :disabled="registeringPasskey"
                  class="w-full py-4 bg-stone-50 dark:bg-stone-800 text-black dark:text-white border-2 border-black dark:border-stone-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-all flex items-center justify-center gap-3 group"
                >
                   <span class="text-xl group-hover:scale-110 transition-transform">➕</span>
                   {{ registeringPasskey ? 'Registering...' : 'Add FaceID / TouchID' }}
                </button>
                <div v-else class="p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-700 dark:text-amber-400 text-xs text-center font-medium">
                   ⚠️ Your browser or device doesn't support Passkeys, or you are not using a secure (HTTPS) connection.
                </div>
            </div>
         </div>

         <!-- ACCOUNT SECTION -->
         <div v-if="activeProfileSection === 'account'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <!-- M2M Credit Card -->
            <div class="space-y-6">
               <!-- Physical Credit Card (Flippable) -->
               <div class="mx-auto w-full max-w-[420px]" style="perspective: 1200px;">
                  <div 
                     @click="cardFlipped = !cardFlipped"
                     class="relative aspect-[1.586/1] cursor-pointer transition-transform duration-700 select-none"
                     :class="cardFlipped ? 'credit-card-flipped' : ''"
                     style="transform-style: preserve-3d;"
                  >
                     <!-- ===== FRONT FACE ===== -->
                     <div class="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden" :style="{ background: cardGradient, boxShadow: `0 20px 60px -15px ${cardShadow}` }">
                        <!-- Card texture overlay -->
                        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0); background-size: 8px 8px;"></div>
                        
                        <!-- Soft glow decoration -->
                        <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                        <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl" :class="cardAccentGlow"></div>
                        
                        <!-- Large decorative heart watermark -->
                        <div class="absolute top-1/2 right-6 -translate-y-1/2 opacity-[0.07] pointer-events-none">
                           <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" :class="cardTextDark"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>

                        <!-- Card Content -->
                        <div class="relative z-10 h-full flex flex-col justify-between p-6 sm:p-7">
                           <!-- Top Row: Logo & Contactless -->
                           <div class="flex items-start justify-between">
                              <div class="flex items-center gap-2">
                                 <div class="w-8 h-8 rounded-lg bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :class="cardTextDark"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                 </div>
                                 <span class="text-[11px] font-black tracking-[0.15em] uppercase" :class="cardTextMuted">Minutes2Match</span>
                              </div>
                              <div class="opacity-40">
                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" :class="cardTextDark">
                                    <path d="M7.5 12a4.5 4.5 0 0 1 4.5-4.5"/>
                                    <path d="M5 12a7 7 0 0 1 7-7"/>
                                    <path d="M10 12a2 2 0 0 1 2-2"/>
                                 </svg>
                              </div>
                           </div>
                           
                           <!-- Middle: EMV Chip -->
                           <div class="flex items-center gap-4">
                              <div class="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-300 border border-amber-300/50 shadow-sm relative overflow-hidden">
                                 <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-px opacity-30">
                                    <div class="bg-amber-400 rounded-[1px]"></div><div class="bg-amber-400 rounded-[1px]"></div><div class="bg-amber-400 rounded-[1px]"></div>
                                    <div class="bg-amber-400 rounded-[1px]"></div><div class="bg-amber-300 rounded-[1px]"></div><div class="bg-amber-400 rounded-[1px]"></div>
                                    <div class="bg-amber-400 rounded-[1px]"></div><div class="bg-amber-400 rounded-[1px]"></div><div class="bg-amber-400 rounded-[1px]"></div>
                                 </div>
                              </div>
                           </div>

                           <!-- Bottom: Balance & Name -->
                           <div class="space-y-3">
                              <div>
                                 <p class="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" :class="cardTextLight">Available Balance</p>
                                 <p class="text-2xl sm:text-3xl font-black font-mono tabular-nums tracking-wider leading-none" :class="cardTextDark">
                                    GHS {{ creditBalanceDashboard.toFixed(2) }}
                                 </p>
                              </div>
                              <div class="flex items-end justify-between">
                                 <div>
                                    <p class="text-[8px] font-bold uppercase tracking-[0.15em] mb-0.5" :class="cardTextLight">Cardholder</p>
                                    <p class="text-[13px] font-bold uppercase tracking-[0.1em]" :class="cardTextMuted">{{ profile?.display_name || 'M2M Member' }}</p>
                                 </div>
                                 <div class="text-right">
                                    <p class="text-[8px] font-bold uppercase tracking-[0.15em] mb-0.5" :class="cardTextLight">Valid</p>
                                    <p class="text-[13px] font-bold tracking-wide" :class="cardTextMuted">∞</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <!-- Tap hint -->
                        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-[0.2em] opacity-30" :class="cardTextDark">Tap to flip</div>
                     </div>

                     <!-- ===== BACK FACE ===== -->
                     <div class="absolute inset-0 rounded-[20px] overflow-hidden backface-hidden credit-card-back" :style="{ background: cardGradient, boxShadow: `0 20px 60px -15px ${cardShadow}` }">
                        <!-- Card texture -->
                        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0); background-size: 8px 8px;"></div>

                        <div class="relative z-10 h-full flex flex-col">
                           <!-- Magnetic Stripe -->
                           <div class="w-full h-12 bg-stone-900/70 mt-6"></div>
                           
                           <!-- Signature Strip & CVV -->
                           <div class="px-6 sm:px-7 mt-4 flex items-center gap-3">
                              <div class="flex-1 h-9 rounded bg-white/60 backdrop-blur-sm flex items-center px-3">
                                 <span class="text-[10px] italic font-medium text-stone-400">{{ profile?.display_name || 'M2M Member' }}</span>
                              </div>
                              <div class="text-right">
                                 <p class="text-[7px] font-bold uppercase tracking-widest mb-0.5" :class="cardTextLight">CVV</p>
                                 <p class="text-sm font-black font-mono" :class="cardTextDark">♡♡♡</p>
                              </div>
                           </div>

                           <!-- Card details -->
                           <div class="flex-1 px-6 sm:px-7 py-4 flex flex-col justify-between">
                              <!-- Stats row -->
                              <div class="grid grid-cols-3 gap-3">
                                 <div class="text-center">
                                    <p class="text-[8px] font-bold uppercase tracking-widest mb-1" :class="cardTextLight">Credits In</p>
                                    <p class="text-sm font-black font-mono" :class="cardTextDark">{{ creditTransactions.filter((t: any) => t.type === 'credit').length }}</p>
                                 </div>
                                 <div class="text-center">
                                    <p class="text-[8px] font-bold uppercase tracking-widest mb-1" :class="cardTextLight">Spent</p>
                                    <p class="text-sm font-black font-mono" :class="cardTextDark">{{ creditTransactions.filter((t: any) => t.type === 'debit').length }}</p>
                                 </div>
                                 <div class="text-center">
                                    <p class="text-[8px] font-bold uppercase tracking-widest mb-1" :class="cardTextLight">Balance</p>
                                    <p class="text-sm font-black font-mono" :class="cardTextDark">{{ creditBalanceDashboard.toFixed(0) }}</p>
                                 </div>
                              </div>

                              <!-- Bottom branding -->
                              <div class="flex items-end justify-between">
                                 <div>
                                    <p class="text-[8px] font-bold uppercase tracking-[0.15em]" :class="cardTextLight">M2M Credit System</p>
                                    <p class="text-[7px] uppercase tracking-[0.1em]" :class="cardTextLight">Non-transferable • Non-withdrawable</p>
                                 </div>
                                 <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" :class="cardTextDark"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <!-- Tap hint -->
                        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-[0.2em] opacity-30" :class="cardTextDark">Tap to flip back</div>
                     </div>
                  </div>
               </div>

               <!-- Top Up Wallet -->
               <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 p-4 sm:p-5 overflow-hidden">
                  <div class="flex items-center justify-between mb-4">
                     <p class="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">Top Up Wallet</p>
                     <span class="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Instant Credit</span>
                  </div>

                  <!-- Quick Amount Buttons -->
                  <div class="grid grid-cols-2 gap-3 mb-4">
                     <button 
                        @click="topUpAmount = 15; topUpCustom = false"
                        class="relative p-4 rounded-xl border-2 transition-all duration-200 text-left group"
                        :class="topUpAmount === 15 && !topUpCustom 
                           ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-[0_0_0_1px_rgba(22,163,74,0.3)]' 
                           : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/30'"
                     >
                        <div class="flex items-center justify-between mb-2">
                           <span class="text-lg font-black text-stone-900 dark:text-stone-100 font-mono">GHS 15</span>
                           <span v-if="topUpAmount === 15 && !topUpCustom" class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                           </span>
                        </div>
                        <p class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">1 Match Unlock</p>
                     </button>
                     <button 
                        @click="topUpAmount = 30; topUpCustom = false"
                        class="relative p-4 rounded-xl border-2 transition-all duration-200 text-left group"
                        :class="topUpAmount === 30 && !topUpCustom 
                           ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-[0_0_0_1px_rgba(22,163,74,0.3)]' 
                           : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/30'"
                     >
                        <div class="flex items-center justify-between mb-2">
                           <span class="text-lg font-black text-stone-900 dark:text-stone-100 font-mono">GHS 30</span>
                           <span v-if="topUpAmount === 30 && !topUpCustom" class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                           </span>
                        </div>
                        <div class="flex items-center gap-2">
                           <p class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">2 Match Unlocks</p>
                           <span class="text-[8px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">Popular</span>
                        </div>
                     </button>
                  </div>

                  <!-- Custom Amount -->
                  <div class="mb-4">
                     <button 
                        @click="topUpCustom = !topUpCustom; if (topUpCustom) topUpAmount = 0"
                        class="w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between"
                        :class="topUpCustom 
                           ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                           : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/30'"
                     >
                        <span class="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-widest">Custom Amount</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-stone-400 transition-transform duration-200" :class="topUpCustom ? 'rotate-180' : ''"><path d="M6 9l6 6 6-6"/></svg>
                     </button>
                     <div v-if="topUpCustom" class="mt-3 px-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div class="relative">
                           <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">GHS</span>
                           <input 
                              v-model.number="topUpCustomAmount"
                              type="number"
                              min="5"
                              max="500"
                              step="5"
                              placeholder="Enter amount (min 5)"
                              class="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono font-bold text-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                           />
                        </div>
                        <p v-if="topUpCustomAmount && topUpCustomAmount >= 5" class="mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                           ≈ {{ Math.floor(topUpCustomAmount / 15) }} match unlock{{ Math.floor(topUpCustomAmount / 15) !== 1 ? 's' : '' }}
                           <span v-if="topUpCustomAmount % 15 > 0"> + GHS {{ (topUpCustomAmount % 15).toFixed(0) }} remainder</span>
                        </p>
                        <p v-else-if="topUpCustomAmount && topUpCustomAmount < 5" class="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">Minimum top-up is GHS 5</p>
                     </div>
                  </div>

                  <!-- Top Up Button -->
                  <button 
                     @click="handleTopUp"
                     :disabled="topUpLoading || (!topUpCustom && !topUpAmount) || (topUpCustom && (!topUpCustomAmount || topUpCustomAmount < 5))"
                     class="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                     :class="topUpLoading 
                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_14px_rgba(22,163,74,0.4)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.5)] active:translate-y-0.5'"
                  >
                     <div v-if="topUpLoading" class="w-4 h-4 border-2 border-stone-400 border-t-white rounded-full animate-spin"></div>
                     <template v-else>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14m-7-7h14"/></svg>
                        Top Up {{ topUpCustom && topUpCustomAmount >= 5 ? `GHS ${topUpCustomAmount}` : topUpAmount ? `GHS ${topUpAmount}` : '' }}
                     </template>
                  </button>
               </div>

               <!-- How Credits Work (below card) -->
               <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 p-4 sm:p-5">
                  <p class="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">How Credits Work</p>
                  <ul class="space-y-2.5 text-[13px] text-stone-600 dark:text-stone-400 font-medium leading-relaxed">
                     <li class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[10px] shrink-0 mt-0.5">💚</span>
                        <span>Match expires and you paid? <strong class="text-stone-900 dark:text-stone-200">Full GHS 15 credit refund</strong> to your card</span>
                     </li>
                     <li class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[10px] shrink-0 mt-0.5">⚡</span>
                        <span>Credits auto-apply when you unlock your next match</span>
                     </li>
                     <li class="flex items-start gap-2.5">
                        <span class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[10px] shrink-0 mt-0.5">∞</span>
                        <span>Credits never expire — they stay on your card forever</span>
                     </li>
                  </ul>
               </div>

               <!-- Transaction History (below card) -->
               <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-stone-200 dark:border-stone-700 overflow-hidden">
                  <div class="px-4 sm:px-5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                     <p class="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500">Transaction History</p>
                     <span v-if="creditTransactions.length > 0" class="text-[9px] font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">{{ creditTransactions.length }}</span>
                  </div>
                  <div v-if="creditTransactions.length > 0" class="divide-y divide-stone-50 dark:divide-stone-800 max-h-[240px] overflow-y-auto">
                     <div v-for="txn in creditTransactions.slice(0, 8)" :key="txn.id" class="px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                        <div class="flex items-center gap-3 min-w-0">
                           <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" :class="txn.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-rose-50 dark:bg-rose-900/20'">
                              {{ txn.type === 'credit' ? '↑' : '↓' }}
                           </div>
                           <div class="min-w-0">
                              <p class="text-xs font-bold text-stone-800 dark:text-stone-200 truncate capitalize">{{ (txn.description || txn.reason).replace(/_/g, ' ') }}</p>
                              <p class="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{{ new Date(txn.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
                           </div>
                        </div>
                        <span class="text-sm font-black font-mono tabular-nums shrink-0 ml-3" :class="txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-rose-500'">
                           {{ txn.type === 'credit' ? '+' : '-' }}{{ parseFloat(txn.amount).toFixed(2) }}
                        </span>
                     </div>
                  </div>
                  <div v-else class="py-10 text-center">
                     <div class="text-3xl mb-2 opacity-20">💳</div>
                     <p class="text-xs text-stone-400 dark:text-stone-500 font-medium italic">No transactions yet</p>
                  </div>
               </div>
            </div>

            <!-- Subscription Card -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
               <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8">Subscription Status</h3>
               <SubscriptionCard :subscription="subscription" @subscribe="handleSubscribe" />
            </div>

            <!-- Account Settings -->
            <div class="bg-white dark:bg-stone-900 p-4 sm:p-6 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
               <h3 class="text-lg md:text-2xl font-serif font-bold text-black dark:text-white mb-6 md:mb-8">Account Actions</h3>
               <div class="space-y-4">
                   <div class="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 mb-6">
                      <div class="flex items-center gap-3 mb-2">
                         <span class="text-xl">🛡️</span>
                         <h4 class="font-bold text-emerald-900 dark:text-emerald-400 text-sm uppercase tracking-wider">Trust Score: {{ trustScore || 60 }}%</h4>
                      </div>
                       <p class="text-[10px] text-emerald-800 dark:text-emerald-500 font-medium leading-relaxed">
                          Higher trust scores improve your match quality and visibility. Increase yours by verifying your identity.
                       </p>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                       <div class="p-3 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-xl flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-emerald-500 transition-colors">
                          <span class="text-xl">📱</span>
                          <span class="text-[9px] font-black uppercase text-stone-400">Phone</span>
                          <span class="text-[10px] font-bold text-emerald-500">+20 pts</span>
                       </div>
                       <div @click="triggerPhotoUpload" class="p-3 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-xl flex flex-col items-center text-center gap-1 group cursor-pointer hover:border-emerald-500 transition-colors">
                          <span class="text-xl">📸</span>
                          <span class="text-[9px] font-black uppercase text-stone-400">Photo ID</span>
                          <span class="text-[10px] font-bold text-emerald-500">+30 pts</span>
                       </div>
                    </div>

                   <div class="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-xl mb-4 group transition-all hover:border-black dark:hover:border-stone-600">
                      <div>
                         <p class="text-xs font-bold text-black dark:text-white uppercase tracking-widest">Profile Status</p>
                         <p class="text-[10px] text-stone-500 uppercase tracking-widest">{{ editForm.is_active ? 'Visible to matches' : 'Hidden from pool' }}</p>
                      </div>
                      <button 
                        @click="toggleAccountActive"
                        :disabled="togglingActive"
                        class="w-12 h-7 rounded-full transition-colors relative border-2 border-black"
                        :class="editForm.is_active ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-800'"
                      >
                         <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-[10px]', editForm.is_active ? 'left-6' : 'left-0.5']">
                            {{ editForm.is_active ? '✓' : '✕' }}
                         </span>
                      </button>
                   </div>
                  
                  <button @click="handleLogout" class="w-full py-4 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 text-black dark:text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                     Sign Out
                  </button>
               </div>
            </div>

               <!-- Payment History -->
             <div class="bg-white dark:bg-stone-900 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group overflow-hidden">
                <button @click="showPaymentHistory = !showPaymentHistory" class="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                   <div class="flex items-center gap-3">
                      <span class="text-xl">💳</span>
                      <h3 class="font-black uppercase tracking-widest text-[10px] sm:text-xs text-black dark:text-white">Transaction Logs</h3>
                   </div>
                   <div class="flex items-center gap-2">
                       <span v-if="userPayments.length > 0" class="px-2 py-0.5 bg-black text-white dark:bg-stone-800 dark:text-stone-400 text-[8px] font-black rounded-full">{{ userPayments.length }}</span>
                       <span class="text-stone-400 transition-transform duration-300" :class="showPaymentHistory ? 'rotate-180' : ''">▼</span>
                   </div>
                </button>
                <div v-show="showPaymentHistory" class="border-t border-stone-100 dark:border-stone-800 animate-in slide-in-from-top-2 duration-300">
                   <div v-if="loadingPayments" class="p-8 text-center flex flex-col items-center gap-3">
                      <div class="w-6 h-6 border-2 border-stone-200 border-t-black rounded-full animate-spin"></div>
                      <p class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Syncing history...</p>
                   </div>
                   <div v-else-if="userPayments.length === 0" class="p-12 text-center flex flex-col items-center gap-4">
                      <div class="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center text-xl grayscale opacity-50">💸</div>
                      <div>
                         <p class="text-[10px] font-black uppercase tracking-widest text-stone-500">No transactions recorded</p>
                         <p class="text-[9px] text-stone-400 mt-1 uppercase tracking-widest">Matches & tickets will appear here</p>
                      </div>
                   </div>
                   <div v-else class="max-h-[300px] overflow-y-auto no-scrollbar">
                      <div v-for="payment in userPayments" :key="'p-m-'+payment.id" class="p-4 border-b border-stone-50 dark:border-stone-800/50 last:border-0 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors flex items-center justify-between group/row">
                         <div class="flex items-center gap-4 min-w-0">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2 border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm group-hover/row:scale-110 transition-transform cursor-help" :title="payment.provider">
                               <span v-if="payment.purpose === 'subscription'">👑</span>
                               <span v-else-if="payment.purpose === 'match_unlock'">💕</span>
                               <span v-else-if="payment.purpose === 'event_ticket'">🎟️</span>
                               <span v-else>💰</span>
                            </div>
                            <div class="min-w-0">
                               <p class="text-[10px] font-black uppercase tracking-widest text-stone-900 dark:text-white truncate">
                                  {{ (payment.purpose || 'unknown transaction').replace('_', ' ') }}
                               </p>
                               <div class="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                  <span class="text-[8px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-widest">{{ new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}</span>
                                  <div class="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-stone-300 rounded-full"></div>
                                  <span class="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest" :class="payment.status === 'success' ? 'text-emerald-500' : (payment.status === 'failed' ? 'text-rose-500' : 'text-amber-500')">
                                     {{ payment.status }}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div class="text-right ml-4 shrink-0">
                            <p class="text-xs font-black text-black dark:text-white font-mono leading-none">{{ formatPaymentGHS(payment.amount) }}</p>
                            <p class="text-[8px] font-bold text-stone-400 uppercase mt-1 tracking-widest">{{ payment.provider }}</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
         </div>

         <!-- STICKY FOOTER ACTIONS (Only for editable sections) -->
         <div v-if="activeProfileSection !== 'account'" class="bg-white/95 dark:bg-stone-950/95 backdrop-blur-md p-3 md:p-4 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] sticky bottom-[104px] md:bottom-8 z-30 flex items-center gap-4 mt-12 transition-all duration-300">
            <button 
              :disabled="saving"
              @click="saveProfile"
              class="flex-1 py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white dark:hover:text-white transition-all flex items-center justify-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 overflow-hidden relative group"
            >
              <span v-if="saving" class="flex items-center gap-2">
                 <div class="w-3 h-3 border-2 border-stone-600 border-t-white rounded-full animate-spin"></div>
                 Wait...
              </span>
              <template v-else>
                 <span>Save Changes</span>
                 <span class="group-hover:translate-x-1 transition-transform">✨</span>
              </template>
            </button>
            <div v-if="saveSuccess" class="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg border-2 border-black animate-in fade-in slide-in-from-bottom-2">
               Updated Successfully!
            </div>
         </div>
       </div> <!-- End Main Content Area -->
    </div> <!-- End Grid -->

    <!-- Profile Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" @click="showPreview = false"></div>
       <div class="relative w-full max-w-sm max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          <div class="flex flex-wrap items-center justify-between mb-4 bg-white dark:bg-stone-900 p-4 rounded-xl border-2 border-black dark:border-stone-700 relative gap-3">
             <div class="flex flex-wrap gap-2 pr-6">
                <button 
                  @click="previewUnlocked = false"
                  type="button"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border-2 whitespace-nowrap"
                  :class="[!previewUnlocked ? 'bg-black text-white border-black' : 'bg-white text-stone-400 border-stone-100']"
                >Blind View</button>
                <button 
                  @click="previewUnlocked = true"
                  type="button"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border-2 whitespace-nowrap"
                  :class="[previewUnlocked ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-stone-400 border-stone-100']"
                >Unlocked View</button>
             </div>
             <button @click="showPreview = false" type="button" class="absolute top-3 right-4 p-1 text-stone-400 hover:text-black">✖</button>
          </div>
          <BlindProfileCard 
            :match-id="'preview'"
            :display-name="editForm.display_name"
            :photo-url="photoPreview || profile?.photo_url"
            :gender="editForm.gender as any"
            :location="editForm.location"
            :age="calculatedAge || 25"
            :persona-name="personaData?.name || 'New Member'"
            :persona-emoji="personaData?.emoji || '👤'"
            :persona-color="'#rose-500'"
            :vibe-preview="personaData?.description || 'No vibe description yet.'"
            :unlock-price="50"
            :interests="editForm.interests"
            :bio="editForm.about_me"
            :unlocked="previewUnlocked"
            :phone="profile?.phone"
          />
          <p class="mt-4 text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">This is how others see you</p>
       </div>
    </div>
  </div> <!-- End Outer Div -->
</template>

<script setup lang="ts">
import SubscriptionCard from '~/components/SubscriptionCard.vue'
import { personas } from '~/composables/usePersona'
import { useToast } from '~/composables/useToast'
import type { M2MDatabase } from '~/types/database.types'

definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const user = useSupabaseUser()
const toast = useToast()
const haptic = useHaptic()
const { profile, subscription, fetchProfileById, trustScore } = useDashboard()

const activeProfileSection = ref<'identity' | 'lifestyle' | 'hobbies' | 'availability' | 'matching' | 'account' | 'security'>('identity')
const profileSections = [
  { id: 'identity', label: 'Identity', icon: '👤', desc: 'Basic info & bio' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟', desc: 'Social & details' },
  { id: 'hobbies', label: 'Hobbies', icon: '🎨', desc: 'Your interests' },
  { id: 'availability', label: 'Availability', icon: '📅', desc: 'When you are free' },
  { id: 'matching', label: 'Matching', icon: '💍', desc: 'Who you seek' },
  { id: 'security', label: 'Security', icon: '🔒', desc: 'Passkeys & Login' },
  { id: 'account', label: 'Account', icon: '⚙️', desc: 'Status & Subscription' }
]

const editForm = reactive({
  display_name: '', gender: '', birth_date: '', location: '', intent: '', interested_in: '', genotype: '', religion: '', height_cm: null as number | null, occupation: '', instagram_handle: '', snapchat_handle: '', preferred_contact_method: 'phone', about_me: '', min_age: 18, max_age: 50, interests: [] as string[], is_active: true,
  dealbreakers: { genotype: [] as string[], intent: [] as string[], religion: [] as string[] },
  availability: { weekdays: [], friday: [], saturday: [], sunday: [] }
})

const availableInterests = [
  { id: 'travel', label: 'Travel ✈️' }, { id: 'fitness', label: 'Fitness 💪' }, { id: 'cooking', label: 'Cooking 🍳' }, { id: 'movies', label: 'Movies 🎬' }, { id: 'music', label: 'Music 🎵' }, { id: 'gaming', label: 'Gaming 🎮' }, { id: 'reading', label: 'Reading 📚' }, { id: 'art', label: 'Art 🎨' }, { id: 'sports', label: 'Sports ⚽' }, { id: 'tech', label: 'Tech 💻' }, { id: 'fashion', label: 'Fashion 👗' }, { id: 'food', label: 'Foodie 🍕' }, { id: 'nature', label: 'Nature 🌿' }, { id: 'photography', label: 'Photography 📸' }, { id: 'dancing', label: 'Dancing 💃' }, { id: 'entrepreneurship', label: 'Business 💼' }
]

const ghanaLocations = [
  'Accra', 'East Legon', 'Osu', 'Cantonments', 'Spintex', 'Airport Residential', 'Labone', 'Dzorwulu', 'Madina', 'Adenta', 'Tema', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Koforidua', 'Sunyani', 'Ho', 'Wa'
]

const commonOccupations = [
  'Entrepreneur', 'Software Engineer', 'Medical Doctor', 'Lawyer', 'Banker', 'Teacher', 'Creative / Artist', 'Student', 'Nurse', 'Architect', 'Real Estate Developer', 'HR Professional', 'Marketing Executive', 'Pilot', 'Fashion Designer', 'Chef', 'Auditor', 'Pharmacist', 'Content Creator'
]

const cmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

const heightOptions = Array.from({ length: 81 }, (_, i) => {
  const cm = 140 + i
  return { cm, label: `${cm} cm (${cmToFtIn(cm)})` }
})

const loadingPayments = useState<boolean>('loading_payments', () => false)
const userPayments = useState<any[]>('user_payments', () => [])
const showPaymentHistory = ref(false)
const saving = ref(false)
const saveSuccess = ref(false)
const togglingActive = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const uploadingPhoto = ref(false)

// M2M Credit Wallet
const creditBalanceDashboard = ref(0)
const creditTransactions = ref<any[]>([])
const cardFlipped = ref(false)

// Gender-based card color scheme
const cardColorScheme = computed(() => {
   const gender = editForm.gender || profile.value?.gender
   if (gender === 'female') {
      return {
         gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 60%, #f472b6 100%)',
         shadow: 'rgba(236,72,153,0.3)',
         textDark: 'text-pink-900',
         textMuted: 'text-pink-900/70',
         textLight: 'text-pink-800/40',
         accentGlow: 'bg-pink-400/20'
      }
   } else if (gender === 'male') {
      return {
         gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 60%, #34d399 100%)',
         shadow: 'rgba(22,163,74,0.3)',
         textDark: 'text-emerald-900',
         textMuted: 'text-emerald-900/70',
         textLight: 'text-emerald-800/40',
         accentGlow: 'bg-emerald-400/20'
      }
   }
   // Default / unset — lavender
   return {
      gradient: 'linear-gradient(135deg, #e8e0f0 0%, #d8cceb 25%, #c4b5e0 60%, #a78bda 100%)',
      shadow: 'rgba(139,92,246,0.3)',
      textDark: 'text-purple-900',
      textMuted: 'text-purple-900/70',
      textLight: 'text-purple-800/40',
      accentGlow: 'bg-purple-400/20'
   }
})

const cardGradient = computed(() => cardColorScheme.value.gradient)
const cardShadow = computed(() => cardColorScheme.value.shadow)
const cardTextDark = computed(() => cardColorScheme.value.textDark)
const cardTextMuted = computed(() => cardColorScheme.value.textMuted)
const cardTextLight = computed(() => cardColorScheme.value.textLight)
const cardAccentGlow = computed(() => cardColorScheme.value.accentGlow)
const fetchCreditData = async () => {
   try {
      const data = await $fetch<{ balance: number; transactions: any[] }>('/api/credits')
      creditBalanceDashboard.value = data?.balance || 0
      creditTransactions.value = data?.transactions || []
   } catch (err) {
      console.error('Failed to fetch credit data:', err)
   }
}

const topUpAmount = ref(15)
const topUpCustom = ref(false)
const topUpCustomAmount = ref<number>(0)
const topUpLoading = ref(false)

const handleTopUp = async () => {
    const finalAmount = topUpCustom.value ? topUpCustomAmount.value : topUpAmount.value
    
    if (!finalAmount || finalAmount < 5) {
        useToast().error('Please select a valid top-up amount (min GHS 5)')
        return
    }

    if (!user.value?.email) {
        useToast().error('User email not found. Please log in again.')
        return
    }

    topUpLoading.value = true
    try {
        const response = await $fetch<{ authorization_url: string }>('/api/paystack/initialize', {
            method: 'POST',
            body: {
                email: user.value.email,
                amount: finalAmount,
                metadata: {
                    purpose: 'wallet_topup',
                    userId: user.value.id
                }
            }
        })

        if (response?.authorization_url) {
            window.location.href = response.authorization_url
        } else {
            throw new Error('Failed to get payment URL')
        }
    } catch (err: any) {
        console.error('Top-up failed:', err)
        useToast().error(err.data?.message || 'Failed to initialize top-up. Please try again.')
    } finally {
        topUpLoading.value = false
    }
}

// Passkey Logic
const { isSupported: isPasskeySupported, register: registerPasskey } = usePasskeys()
const registeringPasskey = ref(false)
const passkeys = ref<any[]>([])

const fetchPasskeys = async () => {
    if (!profile.value?.id) return
    const { data } = await supabase.schema('m2m').from('user_passkeys').select('*').eq('user_id', profile.value.id)
    passkeys.value = data || []
}

const handleRegisterPasskey = async () => {
    registeringPasskey.value = true
    try {
        await registerPasskey()
        await fetchPasskeys()
        toast.success('Passkey Registered!', 'You can now sign in with One-Tap.')
    } catch (err: any) {
        toast.error('Passkey Failed', err.message)
    } finally {
        registeringPasskey.value = false
    }
}

const handleDeletePasskey = async (id: string) => {
    try {
        const { error } = await supabase.schema('m2m').from('user_passkeys').delete().eq('id', id)
        if (error) throw error
        await fetchPasskeys()
        toast.success('Passkey deleted')
    } catch (err) {
        toast.error('Failed to remove passkey')
    }
}

watch(activeProfileSection, (val) => {
    if (val === 'security') fetchPasskeys()
})

const personaData = computed(() => profile.value?.dating_persona ? personas[profile.value.dating_persona] : null)

const profileStrength = computed(() => {
  let score = 0
  if (profile.value?.photo_url) score += 20
  if (editForm.about_me?.length > 20) score += 20
  if (editForm.location) score += 10
  if (editForm.occupation) score += 10
  if (editForm.height_cm) score += 10
  if (editForm.interests?.length >= 3) score += 15
  if (editForm.instagram_handle || editForm.snapchat_handle) score += 15
  return Math.min(score, 100)
})

const showPreview = ref(false)
const previewUnlocked = ref(false)

const calculatedAge = computed(() => {
  if (!editForm.birth_date) return null
  const birth = new Date(editForm.birth_date)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
})

const toggleInterest = (interestId: string) => {
  const idx = editForm.interests.indexOf(interestId)
  if (idx === -1) { if (editForm.interests.length < 6) editForm.interests.push(interestId) }
  else editForm.interests.splice(idx, 1)
}

const toggleDealbreaker = (category: 'genotype' | 'intent' | 'religion', value: string) => {
  const current = [...(editForm.dealbreakers[category] || [])]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  editForm.dealbreakers[category] = current
}

const getOptions = (cat: string) => {
    if (cat === 'genotype') return ['AA', 'AS', 'AC', 'SS']
    if (cat === 'religion') return ['Christian', 'Muslim', 'Traditional', 'Other']
    if (cat === 'intent') return ['Marriage', 'Serious', 'Casual', 'Friendship']
    return []
}

const saveProfile = async () => {
  const { currentUserId, fetchProfileById } = useDashboard()
  const userId = currentUserId.value
  
  if (!userId || userId === 'undefined') {
    toast.error('Auth Error', 'Your session might have expired. Please login again.')
    return
  }

  saving.value = true
  try {
    console.log('[Profile] Saving availability to schema m2m:', editForm.availability)
    const { error } = await supabase.schema('m2m').from('profiles').update({
        display_name: editForm.display_name, gender: editForm.gender, birth_date: editForm.birth_date, location: editForm.location, intent: editForm.intent, interested_in: editForm.interested_in, genotype: editForm.genotype || null, religion: editForm.religion || null, height_cm: editForm.height_cm, occupation: editForm.occupation || null, instagram_handle: editForm.instagram_handle || null, snapchat_handle: editForm.snapchat_handle || null, preferred_contact_method: editForm.preferred_contact_method || 'phone', about_me: editForm.about_me || null, min_age: editForm.min_age, max_age: editForm.max_age, interests: editForm.interests, dealbreakers: editForm.dealbreakers, availability: editForm.availability
    } as any).eq('id', userId)
    if (error) throw error
    await fetchProfileById(userId)
    
    // Trigger AI Extraction if bio is present
    if (editForm.about_me && editForm.about_me.length > 10) {
       $fetch('/api/ai/extract-preferences', {
           method: 'POST',
           body: { userId }
       }).catch(err => console.error('Auto-extraction failed:', err))
    }

    saveSuccess.value = true
    haptic.hapticSuccess()
    toast.success('Profile updated!', 'Your changes have been saved.')
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    console.error('[Profile] Save failed:', err)
    haptic.hapticError()
    toast.error('Failed to save profile', 'Please try again.')
  } finally {
    saving.value = false
  }
}

const toggleAccountActive = async () => {
  const { currentUserId } = useDashboard()
  const userId = currentUserId.value
  
  if (!userId || userId === 'undefined') return

  togglingActive.value = true
  try {
    const newStatus = !editForm.is_active
    await supabase.from('profiles').update({ is_active: newStatus } as any).eq('id', userId)
    editForm.is_active = newStatus
    toast.success(newStatus ? 'Profile Active!' : 'Profile Paused')
  } catch (err) { toast.error('Failed to update status') }
  finally { togglingActive.value = false }
}

const triggerPhotoUpload = () => {
  haptic.hapticTap()
  photoInput.value?.click()
}
const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  const { currentUserId, fetchProfileById } = useDashboard()
  const userId = currentUserId.value
  
  if (!file || !userId || userId === 'undefined') return
  if (file.size > 5 * 1024 * 1024) return toast.error('File too large')
  
  uploadingPhoto.value = true
  try {
    const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`
    await supabase.storage.from('avatars').upload(fileName, file)
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ photo_url: urlData.publicUrl } as any).eq('id', userId)
    await fetchProfileById(userId)
  } catch (err) { toast.error('Upload failed') }
  finally { uploadingPhoto.value = false }
}

const { logout } = useDashboard()
const handleLogout = async () => { await logout() }
const formatPaymentGHS = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0)

const fetchUserPayments = async (userId: string) => {
  if (!userId || userId === 'undefined') return
  loadingPayments.value = true
  try {
    const { data } = await supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    userPayments.value = data || []
  } finally { loadingPayments.value = false }
}

const handleSubscribe = async () => {
    const { currentUserId } = useDashboard()
    const userId = currentUserId.value
    if (!userId || userId === 'undefined' || !profile.value) return
    try {
        const { initializePayment } = usePaystack()
        const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'subscription_price_monthly').single() as { data: any, error: any }
        const price = settingsData?.value?.amount || 50
        const response = await initializePayment(
            profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
            price, 'subscription', { userId }
        )
        const authUrl = response.authorization_url || response.data?.authorization_url
        if (authUrl) window.location.href = authUrl
    } catch (error) { toast.error('Error', 'Failed to start subscription.') }
}

watch(() => profile.value, (newProfile) => {
  if (newProfile) {
    // Defensive availability parsing
    const serverAvail = newProfile.availability
    let parsedAvail: any = {}
    try {
       parsedAvail = (typeof serverAvail === 'string' && serverAvail ? JSON.parse(serverAvail) : serverAvail) || {}
    } catch (e) {
       console.error('[Profile] Error parsing availability JSON:', e)
       parsedAvail = {}
    }

    Object.assign(editForm, {
      display_name: newProfile.display_name || '', gender: newProfile.gender || '', birth_date: newProfile.birth_date || '', location: newProfile.location || '', intent: newProfile.intent || '', interested_in: newProfile.interested_in || '', genotype: newProfile.genotype || '', religion: newProfile.religion || '', height_cm: newProfile.height_cm || null, occupation: newProfile.occupation || '', instagram_handle: newProfile.instagram_handle || '', snapchat_handle: newProfile.snapchat_handle || '', preferred_contact_method: newProfile.preferred_contact_method || 'phone', about_me: newProfile.about_me || '', min_age: newProfile.min_age || 18, max_age: newProfile.max_age || 50, interests: [...(newProfile.interests || [])], is_active: newProfile.is_active !== false,
      dealbreakers: { genotype: newProfile.dealbreakers?.genotype || [], intent: newProfile.dealbreakers?.intent || [], religion: newProfile.dealbreakers?.religion || [] },
      availability: {
         weekdays: parsedAvail.weekdays || [],
         friday: parsedAvail.friday || [],
         saturday: parsedAvail.saturday || [],
         sunday: parsedAvail.sunday || []
      }
    })
    fetchUserPayments(newProfile.id)
    fetchPasskeys() // Always fetch passkeys so global badges show correctly
  }
}, { immediate: true })

onMounted(async () => {
    const { initDashboard } = useDashboard()
    await initDashboard()
    fetchCreditData()
})

</script>

<style scoped>
/* Credit Card Flip */
.backface-hidden {
   -webkit-backface-visibility: hidden;
   backface-visibility: hidden;
}

.credit-card-back {
   transform: rotateY(180deg);
}

.credit-card-flipped {
   transform: rotateY(180deg);
}
</style>
