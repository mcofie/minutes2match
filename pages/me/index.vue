<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <Head>
      <Title>Profile | Minutes 2 Match</Title>
    </Head>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
       <h2 class="text-2xl md:text-3xl font-bold tracking-tight dark:text-white">Profile Settings</h2>
        <div class="flex flex-wrap items-center gap-2">
           <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded-full shadow-sm">
             <span class="text-xs">{{ personaData?.emoji }}</span>
             <span>{{ personaData?.name || 'New Member' }}</span>
           </span>
           <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-full shadow-sm" title="Your Trust Score">
             <span>🛡️ {{ trustScore || 60 }}%</span>
           </span>
           <button @click="showPreview = true" class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-black hover:bg-rose-500 px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-0.5 active:translate-y-0.5">
             <span>👁️ Preview</span>
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
                  <span class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Profile Strength</span>
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

         <!-- Match Compatibility Radar -->
         <div class="bg-white dark:bg-stone-900 p-5 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(244,63,94,0.1)] group overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div class="flex items-center justify-between mb-4">
               <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 dark:text-white">Compatibility Radar</h4>
               <span class="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 text-[8px] font-black rounded border border-rose-200 dark:border-rose-900/50">LIVE</span>
            </div>
            <div class="space-y-4">
               <div class="space-y-1.5">
                  <div class="flex justify-between text-[8px] font-bold uppercase tracking-widest text-stone-400">
                     <span>Vibe Harmony</span>
                     <span class="text-stone-900 dark:text-white">88%</span>
                  </div>
                  <div class="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                     <div class="h-full bg-rose-500 w-[88%] transform group-hover:scale-x-105 transition-transform origin-left"></div>
                  </div>
               </div>
               <div class="space-y-1.5">
                  <div class="flex justify-between text-[8px] font-bold uppercase tracking-widest text-stone-400">
                     <span>Intent Alignment</span>
                     <span class="text-stone-900 dark:text-white">72%</span>
                  </div>
                  <div class="h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                     <div class="h-full bg-black dark:bg-white w-[72%] transform group-hover:scale-x-105 transition-transform origin-left"></div>
                  </div>
               </div>
            </div>
            <div class="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
               <p class="text-[9px] text-stone-500 dark:text-stone-400 leading-tight">Your persona aligns best with <span class="text-stone-900 dark:text-white font-bold">"The Intellectual"</span> and <span class="text-stone-900 dark:text-white font-bold">"The Adventurer"</span> types this week.</p>
            </div>
         </div>

         <!-- Persona Detail Card -->
         <div v-if="personaData" class="bg-white dark:bg-stone-900 p-5 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div class="flex items-center gap-3 mb-4">
               <div class="w-10 h-10 rounded-lg border-2 border-black bg-rose-500 flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{{ personaData.emoji }}</div>
               <div>
                  <h4 class="text-xs font-black uppercase tracking-widest leading-none">{{ personaData.name }}</h4>
                  <p class="text-[9px] font-bold text-stone-400 uppercase mt-1">Your Vibe</p>
               </div>
            </div>
            <p class="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed italic">"{{ personaData.description }}"</p>
         </div>

         <!-- Community Health Card -->
         <div class="bg-stone-900 text-white p-5 rounded-xl border-2 border-stone-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden relative group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div class="absolute -top-2 -right-2 p-4 opacity-5 text-6xl group-hover:scale-110 transition-transform">🛡️</div>
            <h4 class="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500 mb-4">Pool Quality Control</h4>
            <div class="space-y-4">
               <div class="flex items-center justify-between">
                  <span class="text-[9px] font-bold uppercase tracking-widest text-stone-400">Match Pool Purity</span>
                  <span class="text-xs font-black text-emerald-400">98.4%</span>
               </div>
               <div class="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden border border-stone-700">
                  <div class="h-full bg-emerald-500 w-[98%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
               </div>
               <div class="pt-2 border-t border-stone-800/50">
                  <p class="text-[10px] text-stone-300 leading-relaxed">
                     <span class="text-rose-500 font-black">ACTIVE PURGE:</span> Our algorithm recently removed <span class="text-white font-bold">14 inactive or low-quality profiles</span> to maintain your connection standards.
                  </p>
               </div>
               <div class="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500">
                  <span class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Vetting Pulse: Healthy
               </div>
            </div>
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
      </div>

      <!-- Main Content Area -->
      <div class="md:col-span-2 space-y-6 pb-32 md:pb-0 min-w-0">
         <!-- Mobile Section Nav -->
         <div class="md:hidden flex overflow-x-auto gap-3 pb-4 no-scrollbar sticky top-16 z-[55] bg-[#FFFCF8]/95 dark:bg-stone-950/95 backdrop-blur-md py-4 border-b border-stone-100 dark:border-stone-800 transition-all duration-300 -mx-4 px-4 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
            <button 
              v-for="section in profileSections" 
              :key="'m-'+section.id"
              @click="activeProfileSection = section.id as any"
              class="flex-shrink-0 px-5 py-2.5 rounded-full border-2 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
              :class="activeProfileSection === section.id ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-800'"
            >
              {{ section.label }}
            </button>
         </div>

         <!-- Mobile Photo/Badges Header -->
         <div class="md:hidden flex flex-col gap-4 mb-4">
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
                    <input type="date" v-model="editForm.birth_date" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-bold" />
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

         <!-- ACCOUNT SECTION -->
         <div v-if="activeProfileSection === 'account'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
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
             <div class="bg-white dark:bg-stone-900 p-4 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <button @click="showPaymentHistory = !showPaymentHistory" class="w-full flex items-center justify-between">
                   <h3 class="font-bold font-serif text-lg text-black dark:text-white">Payment History</h3>
                   <span class="text-stone-400" :class="showPaymentHistory ? 'rotate-180' : ''">▼</span>
                </button>
                <div v-show="showPaymentHistory" class="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                   <div v-if="loadingPayments" class="text-center text-xs py-4">Loading...</div>
                   <div v-else-if="userPayments.length === 0" class="text-center text-xs py-4 text-stone-400">No history</div>
                   <div v-else v-for="payment in userPayments.slice(0, 5)" :key="'p-m-'+payment.id" class="flex justify-between items-center text-xs">
                      <span class="font-bold">{{ payment.purpose }}</span>
                      <span class="font-mono">{{ formatPaymentGHS(payment.amount) }}</span>
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
const toast = useToast()
const haptic = useHaptic()
const { profile, subscription, fetchProfileById, trustScore } = useDashboard()

const activeProfileSection = ref<'identity' | 'lifestyle' | 'hobbies' | 'matching' | 'account'>('identity')
const profileSections = [
  { id: 'identity', label: 'Identity', icon: '👤', desc: 'Basic info & bio' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟', desc: 'Social & details' },
  { id: 'hobbies', label: 'Hobbies', icon: '🎨', desc: 'Your interests' },
  { id: 'matching', label: 'Matching', icon: '💍', desc: 'Who you seek' },
  { id: 'account', label: 'Account', icon: '⚙️', desc: 'Status & Subscription' }
]

const editForm = reactive({
  display_name: '', gender: '', birth_date: '', location: '', intent: '', interested_in: '', genotype: '', religion: '', height_cm: null as number | null, occupation: '', instagram_handle: '', snapchat_handle: '', preferred_contact_method: 'phone', about_me: '', min_age: 18, max_age: 50, interests: [] as string[], is_active: true,
  dealbreakers: { genotype: [] as string[], intent: [] as string[], religion: [] as string[] }
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
    const { error } = await supabase.from('profiles').update({
        display_name: editForm.display_name, gender: editForm.gender, birth_date: editForm.birth_date, location: editForm.location, intent: editForm.intent, interested_in: editForm.interested_in, genotype: editForm.genotype || null, religion: editForm.religion || null, height_cm: editForm.height_cm, occupation: editForm.occupation || null, instagram_handle: editForm.instagram_handle || null, snapchat_handle: editForm.snapchat_handle || null, preferred_contact_method: editForm.preferred_contact_method || 'phone', about_me: editForm.about_me || null, min_age: editForm.min_age, max_age: editForm.max_age, interests: editForm.interests, dealbreakers: editForm.dealbreakers
    } as any).eq('id', userId)
    if (error) throw error
    await fetchProfileById(userId)
    saveSuccess.value = true
    haptic.hapticSuccess()
    toast.success('Profile updated!', 'Your changes have been saved.')
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
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
    Object.assign(editForm, {
      display_name: newProfile.display_name || '', gender: newProfile.gender || '', birth_date: newProfile.birth_date || '', location: newProfile.location || '', intent: newProfile.intent || '', interested_in: newProfile.interested_in || '', genotype: newProfile.genotype || '', religion: newProfile.religion || '', height_cm: newProfile.height_cm || null, occupation: newProfile.occupation || '', instagram_handle: newProfile.instagram_handle || '', snapchat_handle: newProfile.snapchat_handle || '', preferred_contact_method: newProfile.preferred_contact_method || 'phone', about_me: newProfile.about_me || '', min_age: newProfile.min_age || 18, max_age: newProfile.max_age || 50, interests: [...(newProfile.interests || [])], is_active: newProfile.is_active !== false,
      dealbreakers: { genotype: newProfile.dealbreakers?.genotype || [], intent: newProfile.dealbreakers?.intent || [], religion: newProfile.dealbreakers?.religion || [] }
    })
    fetchUserPayments(newProfile.id)
  }
}, { immediate: true })

onMounted(async () => {
    const { initDashboard } = useDashboard()
    await initDashboard()
})

</script>
