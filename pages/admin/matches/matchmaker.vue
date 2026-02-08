<template>
  <div class="matchmaker-container">
    <!-- Mode Toggle -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 py-4 gap-4">
      <div class="bg-gray-100 p-1 rounded-full flex relative">
        <button 
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          :class="mode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'"
          @click="mode = 'manual'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
          Manual Match
        </button>
        <button 
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          :class="mode === 'auto' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'"
          @click="mode = 'auto'; generateAutoMatches()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="15" y1="9" x2="15" y2="15"></line><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="9" x2="9" y2="15"></line><path d="M9 1v3"></path><path d="M15 1v3"></path><path d="M9 20v3"></path><path d="M15 20v3"></path><path d="M20 9h3"></path><path d="M20 14h3"></path><path d="M1 9h3"></path><path d="M1 14h3"></path></svg>
          Auto Matchmaker
        </button>
      </div>
      
      <NuxtLink to="/admin/matches" class="btn-secondary flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Matches List
      </NuxtLink>
    </div>

    <!-- ====================== -->
    <!-- AUTO MATCHMAKER MODE -->
    <!-- ====================== -->
    <div v-if="mode === 'auto'" class="auto-matchmaker">
      <div class="admin-card mb-8">
        <div class="admin-card__header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
          <div>
            <h2 class="admin-card__title m-0 flex items-center gap-2">
              Auto Matchmaker
              <span v-if="autoMatches.length" class="badge badge--primary">{{ autoMatches.length }} suggestions</span>
            </h2>
            <p class="text-sm text-muted m-0 mt-1">AI-powered match suggestions based on compatibility algorithms.</p>
          </div>
          
          <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div class="flex items-center gap-2 border-r border-gray-200 pr-3">
              <span class="text-xs font-bold uppercase text-muted tracking-wider">Min Score</span>
              <div class="flex items-center relative">
                <input 
                  v-model.number="autoConfig.minScore" 
                  type="number" 
                  class="form-input py-1 px-2 w-16 text-center font-bold !h-8 text-sm" 
                  min="0"
                  max="100"
                />
                <span class="absolute right-5 text-xs text-muted pointer-events-none">%</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
               <span class="text-xs font-bold uppercase text-muted tracking-wider">Price</span>
               <div class="relative">
                 <span class="absolute left-2 top-1.5 text-xs text-muted pointer-events-none">GH₵</span>
                 <input 
                   v-model.number="unlockPrice" 
                   type="number" 
                   class="form-input py-1 pl-7 pr-2 w-20 text-right font-bold !h-8 text-sm" 
                   min="0"
                 />
               </div>
            </div>

            <button 
              class="btn-secondary py-1 px-3 !h-8 text-xs font-bold"
              :disabled="generatingAuto"
              @click="generateAutoMatches"
            >
              {{ generatingAuto ? 'Running...' : 'Run Auto Match' }}
            </button>
          </div>
        </div>

        <!-- Compact Stats Bar -->
        <div class="stats-bar">
          <div class="stats-bar__item">
            <span class="stats-bar__value">{{ users.length }}</span>
            <span class="stats-bar__label">Users</span>
          </div>
          <div class="stats-bar__divider"></div>
          <div class="stats-bar__item stats-bar__item--success">
            <span class="stats-bar__value">{{ autoMatches.length }}</span>
            <span class="stats-bar__label">Matches</span>
          </div>
          <div class="stats-bar__divider"></div>
          <div class="stats-bar__item stats-bar__item--premium">
            <span class="stats-bar__value">{{ autoMatches.filter(m => m.score >= 70).length }}</span>
            <span class="stats-bar__label">High Quality</span>
          </div>
          <div class="stats-bar__divider"></div>
          <div class="stats-bar__item stats-bar__item--accent">
            <span class="stats-bar__value">{{ selectedAutoMatches.length }}</span>
            <span class="stats-bar__label">Selected</span>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div v-if="autoMatches.length" class="flex items-center justify-between flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div class="flex gap-2">
            <button class="btn-secondary py-1.5 px-3 text-xs" @click="selectAllHigh">
              Select All 70%+
            </button>
            <button class="btn-secondary py-1.5 px-3 text-xs" @click="selectedAutoMatches = []">
              Clear
            </button>
          </div>
          
          <button 
            class="btn-primary py-2 px-6 shadow-sm"
            :disabled="!selectedAutoMatches.length || creatingBulk"
            @click="createBulkMatches"
          >
            {{ creatingBulk ? 'Creating Matches...' : `Create ${selectedAutoMatches.length} Matches` }}
          </button>
        </div>

        <!-- Auto Match Results -->
        <div v-if="generatingAuto" class="text-center py-16">
          <div class="animate-pulse">
            <div class="text-brand-primary mb-2">
               <svg class="animate-spin mx-auto" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
            </div>
            <p class="text-lg font-bold text-muted">Analyzing user compatibility...</p>
          </div>
        </div>

        <div v-else-if="!autoMatches.length" class="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl">
          <div class="text-gray-300 mb-4">
             <svg class="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <p class="text-lg font-bold text-muted">No matches found above {{ autoConfig.minScore }}%</p>
          <button class="btn-secondary mt-4" @click="autoConfig.minScore = Math.max(0, autoConfig.minScore - 10); generateAutoMatches()">
            Lower Threshold to {{ Math.max(0, autoConfig.minScore - 10) }}%
          </button>
        </div>

        <div v-else class="auto-match-grid">
          <div 
            v-for="match in autoMatches" 
            :key="`${match.user1.id}-${match.user2.id}`"
            class="auto-match-card"
            :class="{ 'auto-match-card--selected': isAutoMatchSelected(match) }"
            @click="toggleAutoMatchSelection(match)"
          >
            <!-- Score Badge -->
            <div class="auto-match-card__score" :style="{ backgroundColor: getScoreColor(match.score) }">
              {{ match.score }}%
            </div>

            <!-- Checkbox -->
            <div class="auto-match-card__check">
              <input type="checkbox" :checked="isAutoMatchSelected(match)" @change="toggleAutoMatchSelection(match)" @click.stop class="w-5 h-5 accent-black rounded" />
            </div>

            <!-- Users -->
            <div class="auto-match-card__users">
              <!-- User 1 -->
              <div class="auto-match-card__user">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm border border-gray-200 overflow-hidden">
                  <img v-if="match.user1.photo_url" :src="match.user1.photo_url" :alt="match.user1.display_name" class="w-full h-full object-cover" />
                  <span v-else>{{ match.user1.display_name?.charAt(0) }}</span>
                </div>
                <div class="mt-2 text-center">
                  <div class="font-bold text-sm truncate max-w-[90px]">{{ match.user1.display_name }}</div>
                  <div class="text-[10px] text-muted font-mono uppercase">{{ match.user1.gender?.substring(0,1) }} • {{ getAge(match.user1.birth_date) }}</div>
                  <ProfileBadges :profile="match.user1" size="xs" :max-display="2" class="mt-1 justify-center" />
                </div>
              </div>

              <!-- Heart Connector -->
              <div class="auto-match-card__heart">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-gray-300"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>

              <!-- User 2 -->
              <div class="auto-match-card__user">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm border border-gray-200 overflow-hidden">
                  <img v-if="match.user2.photo_url" :src="match.user2.photo_url" :alt="match.user2.display_name" class="w-full h-full object-cover" />
                  <span v-else>{{ match.user2.display_name?.charAt(0) }}</span>
                </div>
                <div class="mt-2 text-center">
                  <div class="font-bold text-sm truncate max-w-[90px]">{{ match.user2.display_name }}</div>
                  <div class="text-[10px] text-muted font-mono uppercase">{{ match.user2.gender?.substring(0,1) }} • {{ getAge(match.user2.birth_date) }}</div>
                  <ProfileBadges :profile="match.user2" size="xs" :max-display="2" class="mt-1 justify-center" />
                </div>
              </div>
            </div>

            <!-- Match Reasons -->
            <div class="auto-match-card__reasons">
              <span v-for="reason in match.reasons.slice(0, 2)" :key="reason" class="text-[10px] bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded border border-gray-100">
                {{ reason }}
              </span>
            </div>

            <!-- Warnings -->
            <div v-if="match.warnings.length" class="auto-match-card__warnings mt-1">
              <span v-for="warn in match.warnings.slice(0,1)" :key="warn" class="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-bold">
                ! {{ warn }}
              </span>
            </div>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="bulkSuccess" class="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold mt-6 border border-green-100 flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {{ bulkSuccess }}
        </div>
        <div v-if="bulkError" class="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold mt-6 border border-red-100">
          {{ bulkError }}
        </div>
      </div>
    </div>

    <!-- ====================== -->
    <!-- MANUAL MATCH MODE -->
    <!-- ====================== -->
    <div v-else>
      <!-- Top Area: The Match Stage -->
      <div class="admin-card mb-8">
        <div class="admin-card__header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-6">
          <div>
            <h2 class="admin-card__title m-0">Manual Matchmaker</h2>
            <p class="text-sm text-muted m-0">Hand-pick connections based on smart compatibility scores.</p>
          </div>
          
          <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <div class="flex items-center gap-2 pl-2">
              <label class="text-xs font-bold uppercase text-muted tracking-wider">Price</label>
              <div class="flex items-center relative">
                <span class="absolute left-2 text-xs text-muted pointer-events-none">GH₵</span>
                <input 
                  v-model.number="unlockPrice" 
                  type="number" 
                  class="form-input py-1 pl-8 pr-2 w-20 text-right font-bold !h-10 text-sm" 
                  min="0"
                />
              </div>
            </div>
            <button 
              class="btn-primary py-2 px-6 text-sm shadow-md hover:scale-105 transition-transform h-10 flex items-center gap-2"
              :disabled="!canCreateMatch || creating"
              @click="createMatch"
            >
              <span v-if="creating" class="animate-spin mr-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              </span>
              {{ creating ? 'Connecting...' : 'Create Match' }}
            </button>
          </div>
        </div>

        <div class="match-stage">
          <!-- User 1 (The Anchor) -->
          <div 
            class="stage-card group"
            :class="{ 'stage-card--filled': user1, 'stage-card--active': selectingSlot === 1 }"
            @click="selectingSlot = 1"
          >
            <div v-if="!user1" class="flex flex-col items-center justify-center text-center h-full min-h-[220px] p-6">
              <div class="w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-stone-50 text-stone-300 group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              
              <h3 class="font-bold text-lg mb-2 text-stone-900">Select Person A</h3>
              <p class="text-sm text-stone-500 max-w-[200px] leading-relaxed mb-6">
                Start by selecting the primary user for this match interaction
              </p>
              
              <div class="px-5 py-2.5 bg-stone-100 rounded-lg text-xs font-bold uppercase tracking-wide text-stone-600 transition-colors group-hover:bg-black group-hover:text-white">
                Choose User
              </div>
            </div>
            <div v-else class="stage-card__filled p-6 relative h-full flex flex-col">
              <button class="absolute top-3 right-3 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10" @click.stop="user1 = null; user2 = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="flex flex-col items-center text-center">
                <div class="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4 ring-4 ring-stone-50 overflow-hidden">
                  <img v-if="user1.photo_url" :src="user1.photo_url" :alt="user1.display_name" class="w-full h-full object-cover" />
                  <span v-else>{{ user1.display_name?.charAt(0) }}</span>
                </div>
                
                <h3 class="text-xl font-bold text-stone-900 leading-tight mb-1">{{ user1.display_name }}</h3>
                <div class="flex items-center gap-2 text-sm text-stone-500 font-medium mb-5">
                  <span class="capitalize">{{ user1.gender }}</span>
                  <span>•</span>
                  <span>{{ getAge(user1.birth_date) }}y</span>
                  <span v-if="user1.height_cm">• {{ cmToFeet(user1.height_cm) }}</span>
                </div>

                <div class="grid grid-cols-2 gap-3 w-full mb-5">
                  <div class="bg-stone-50 rounded-lg p-2.5 text-center border border-stone-100">
                     <span class="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Genotype</span>
                     <span class="font-bold text-sm text-stone-900">{{ user1.genotype || '?' }}</span>
                  </div>
                  <div class="bg-stone-50 rounded-lg p-2.5 text-center border border-stone-100">
                     <span class="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Intent</span>
                     <span class="font-bold text-sm text-stone-900 capitalize">{{ user1.intent || '?' }}</span>
                  </div>
                </div>

                <div v-if="user1.dating_persona" class="w-full flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 mb-5">
                  <span class="text-xl" v-html="getPersonaIcon(user1.dating_persona)"></span>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm text-stone-900">{{ getPersona(user1.dating_persona)?.name }}</span>
                    <span class="text-[10px] uppercase tracking-wide text-blue-600 font-bold">Persona</span>
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap justify-center gap-2">
                   <span class="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200">
                     {{ user1.location || 'Unknown' }}
                   </span>
                   <span v-if="user1.is_verified" class="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     Verified
                   </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connection Animation -->
          <div class="connection-bridge">
            <div class="connection-line"></div>
            <div class="connection-heart" :class="{'bg-red-50 text-red-600 border-red-200': matchData.score < 40 && user2}">
              <span v-if="matchData.score > 0" class="text-xs font-bold">{{ matchData.score }}%</span>
              <span v-else class="text-gray-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </span>
            </div>
          </div>

          <!-- User 2 (The Match) -->
          <div 
            class="stage-card group"
            :class="{ 'stage-card--filled': user2, 'stage-card--active': selectingSlot === 2 }"
            @click="selectingSlot = 2"
          >
            <div v-if="!user2 && !hoveredUser" class="flex flex-col items-center justify-center text-center h-full min-h-[220px] p-6">
              <div 
                class="w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300 shadow-sm"
                :class="user1 ? 'bg-black text-white scale-100' : 'bg-stone-50 text-stone-300'"
              >
                <svg v-if="user1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                   <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              
              <h3 class="font-bold text-lg mb-2" :class="user1 ? 'text-stone-900' : 'text-stone-400'">
                {{ user1 ? 'Select Match' : 'Waiting for Person A' }}
              </h3>
              
              <p class="text-sm text-stone-500 max-w-[200px] leading-relaxed mb-6">
                {{ user1 ? 'Choose a compatible partner to complete the pair' : 'Select a primary user to start matching' }}
              </p>
              
              <div v-if="user1" class="px-5 py-2.5 bg-stone-100 rounded-lg text-xs font-bold uppercase tracking-wide text-stone-600 transition-colors group-hover:bg-stone-200">
                Browse Candidates
              </div>
            </div>

            <div v-else-if="!user2 && hoveredUser" class="flex flex-col items-center justify-center text-center h-full min-h-[220px] p-6 bg-stone-50/50 relative">
              <div class="absolute top-3 right-3">
                 <span class="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">Preview</span>
              </div>
              
              <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-white border-2 border-dashed border-stone-300 shadow-sm text-2xl font-bold text-stone-400 overflow-hidden">
                 <img v-if="hoveredUser.photo_url" :src="hoveredUser.photo_url" :alt="hoveredUser.display_name" class="w-full h-full object-cover" />
                 <span v-else>{{ hoveredUser.display_name?.charAt(0) }}</span>
              </div>
              
              <h3 class="font-bold text-lg mb-1 text-stone-500">{{ hoveredUser.display_name }}</h3>
              <div class="bg-white border border-stone-200 rounded-full px-3 py-1 text-xs font-medium text-stone-500 mb-4 shadow-sm">
                 {{ getAge(hoveredUser.birth_date) }}y • {{ hoveredUser.gender }}
              </div>
              
              <div class="text-xs text-stone-400 animate-pulse font-medium">
                 Click card below to select
              </div>
            </div>

            <div v-else class="stage-card__filled p-6 relative h-full flex flex-col">
              <button class="absolute top-3 right-3 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10" @click.stop="user2 = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div class="flex flex-col items-center text-center">
                <div class="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4 ring-4 ring-stone-50 overflow-hidden">
                  <img v-if="user2.photo_url" :src="user2.photo_url" :alt="user2.display_name" class="w-full h-full object-cover" />
                  <span v-else>{{ user2.display_name?.charAt(0) }}</span>
                </div>
                
                <h3 class="text-xl font-bold text-stone-900 leading-tight mb-1">{{ user2.display_name }}</h3>
                <div class="flex items-center gap-2 text-sm text-stone-500 font-medium mb-5">
                  <span class="capitalize">{{ user2.gender }}</span>
                  <span>•</span>
                  <span>{{ getAge(user2.birth_date) }}y</span>
                  <span v-if="user2.height_cm">• {{ cmToFeet(user2.height_cm) }}</span>
                </div>

                <div class="grid grid-cols-2 gap-3 w-full mb-3">
                  <div class="bg-stone-50 rounded-lg p-2.5 text-center border border-stone-100">
                     <span class="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Genotype</span>
                     <span class="font-bold text-sm text-stone-900">{{ user2.genotype || '?' }}</span>
                  </div>
                  <div class="bg-stone-50 rounded-lg p-2.5 text-center border border-stone-100">
                     <span class="block text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Intent</span>
                     <span class="font-bold text-sm text-stone-900 capitalize">{{ user2.intent || '?' }}</span>
                  </div>
                </div>

                <!-- Match Analysis -->
                <div v-if="matchData.reasons.length || matchData.warnings.length" class="w-full mb-5 flex flex-wrap justify-center gap-1.5">
                   <span v-for="reason in matchData.reasons" :key="reason" class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded border border-green-100">
                     {{ reason }}
                   </span>
                   <span v-for="warn in matchData.warnings" :key="warn" class="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wide rounded border border-red-100">
                     ! {{ warn }}
                   </span>
                </div>

                <div v-if="user2.dating_persona" class="w-full flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 mb-5">
                  <span class="text-xl" v-html="getPersonaIcon(user2.dating_persona)"></span>
                  <div class="flex flex-col items-start">
                    <span class="font-bold text-sm text-stone-900">{{ getPersona(user2.dating_persona)?.name }}</span>
                    <span class="text-[10px] uppercase tracking-wide text-blue-600 font-bold">Persona</span>
                  </div>
                </div>

                <div class="mt-auto flex flex-wrap justify-center gap-2">
                   <span class="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200">
                     {{ user2.location || 'Unknown' }}
                   </span>
                   <span v-if="user2.is_verified" class="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     Verified
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Compatibility Breakdown -->
        <div v-if="user1 && (user2 || hoveredUser)" class="mt-6">
          <CompatibilityBreakdown
            :user1="user1"
            :user2="user2 || hoveredUser"
            :score="matchData.score"
            :reasons="matchData.reasons"
            :warnings="matchData.warnings"
          />
        </div>
        
        <!-- Status Messages -->
        <div v-if="matchSuccess" class="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold mt-6 border border-green-100 flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {{ matchSuccess }}
        </div>
        <div v-if="matchError" class="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold mt-6 border border-red-100">
          {{ matchError }}
        </div>
      </div>

      <!-- Candidate Browser -->
      <div class="match-candidates">
        <div class="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
          <div>
            <h3 class="text-xl font-bold m-0 flex items-center gap-2">
              {{ user1 ? `Top Picks for ${user1.display_name}` : 'All Users' }}
              <span class="badge badge--gray text-xs h-5 px-2">{{ filteredCandidates.length }}</span>
            </h3>
            <p class="text-sm text-muted m-0 mt-1">
              {{ user1 ? 'Sorted by compatibility score & priority' : 'Select a user to start matching' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
            <div class="bg-white rounded-lg border border-gray-200 p-1 flex h-10 items-center shadow-sm">
              <button 
                class="px-3 py-1 text-xs font-bold rounded h-8 transition-colors"
                :class="filters.gender === '' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="filters.gender = ''"
              >All</button>
              <button 
                class="px-3 py-1 text-xs font-bold rounded h-8 transition-colors"
                :class="filters.gender === 'male' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="filters.gender = 'male'"
              >Male</button>
              <button 
                class="px-3 py-1 text-xs font-bold rounded h-8 transition-colors"
                :class="filters.gender === 'female' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'"
                @click="filters.gender = 'female'"
              >Female</button>
            </div>
            
            <div class="h-10 border border-gray-200 rounded-lg overflow-hidden flex items-center bg-white shadow-sm px-2">
              <span class="text-[10px] font-bold text-muted mr-2 uppercase tracking-wider">Genotype</span>
              <select v-model="filters.genotype" class="text-sm font-bold bg-transparent border-none outline-none h-full cursor-pointer">
                  <option value="">Any</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="SS">SS</option>
                  <option value="AC">AC</option>
                  <option value="SC">SC</option>
              </select>
            </div>

            <div class="h-10 border border-gray-200 rounded-lg overflow-hidden flex items-center bg-white shadow-sm w-48 px-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                v-model="filters.search" 
                type="text" 
                placeholder="Search name..." 
                class="text-sm border-none outline-none w-full h-full bg-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Candidate Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <div 
            v-for="user in paginationCandidates" 
            :key="user.id" 
            class="candidate-card"
            :class="{ 'opacity-50 grayscale': isDisabled(user), 'candidate-card--selected': isSelected(user) }"
            @click="selectCandidate(user)"
            @mouseenter="hoveredUser = user"
            @mouseleave="hoveredUser = null"
          >
            <div v-if="user1 && !isDisabled(user)" class="match-score-badge" :style="{ backgroundColor: getScoreColor(user.matchDetails.score) }">
               {{ user.matchDetails.score }}%
            </div>

            <div v-if="getWaitingDays(user.created_at) > 7" class="priority-badge" title="Waiting for a match">
              {{ getWaitingDays(user.created_at) }}d wait
            </div>

            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm border border-gray-200 overflow-hidden">
                <img v-if="user.photo_url" :src="user.photo_url" :alt="user.display_name" class="w-full h-full object-cover" />
                <span v-else>{{ user.display_name?.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm truncate leading-tight">{{ user.display_name }}</h4>
                <div class="text-[10px] text-muted font-mono uppercase mt-0.5">
                  {{ user.gender?.substring(0,3) }} • {{ getAge(user.birth_date) }}y
                </div>
              </div>
            </div>
            
            <div class="flex gap-1 mb-2 text-[9px] font-bold">
              <span v-if="user.genotype" class="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded">{{ user.genotype }}</span>
              <span v-if="user.intent" class="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 rounded capitalize truncate max-w-[60px]">{{ user.intent }}</span>
              <span v-if="user.height_cm" class="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded">{{ cmToFeet(user.height_cm) }}</span>
            </div>

            <div class="h-5 mb-2">
               <span v-if="user.dating_persona" class="inline-flex items-center gap-1 text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 truncate w-full">
                 <span class="flex-shrink-0" v-html="getPersonaIcon(user.dating_persona)"></span> 
                 <span class="truncate">{{ getPersona(user.dating_persona)?.name }}</span>
               </span>
            </div>
            
            <div v-if="user1 && user.matchDetails?.reasons.length" class="min-h-[18px] mb-1 flex flex-wrap gap-1">
               <span v-for="reason in user.matchDetails.reasons.slice(0, 2)" :key="reason" class="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">
                 {{ reason }}
               </span>
            </div>
            
            <button class="w-full mt-2 py-1.5 rounded textxs font-bold transition-colors border"
              :class="isSelected(user) ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'">
              {{ isSelected(user) ? 'Selected' : 'Select' }}
            </button>
          </div>
        </div>
        
        <div v-if="filteredCandidates.length > visibleCount" class="text-center mt-8">
          <button class="btn-secondary text-sm px-6 py-2" @click="visibleCount += 12">Load More Users</button>
        </div>
      </div>
    </div>
    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click="closeSuccessModal">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
          
          <!-- Modal Content -->
          <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative overflow-hidden transform transition-all z-10" @click.stop>
            
            <!-- Confetti Gradient Strip -->
            <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

            <!-- Success Icon Animation -->
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-5 relative group">
              <div class="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
              <svg class="w-10 h-10 text-green-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
            
            <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">Match Created!</h3>
            <p class="text-gray-500 text-sm mb-8 leading-relaxed">
              These two users have been successfully paired. An SMS notification has been sent.
            </p>

            <!-- User Comparison Visual -->
            <div class="flex items-center justify-center gap-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div class="flex flex-col items-center gap-2 flex-1 min-w-0">
                <img :src="successModalData.user1_photo || 'https://placehold.co/100'" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-gray-200" />
                <span class="text-xs font-bold truncate w-full px-1 text-gray-700">{{ successModalData.user1_name.split(' ')[0] }}</span>
              </div>
              
               <div class="flex flex-col items-center justify-center z-10 -mx-2">
                 <div class="w-10 h-10 rounded-full bg-white border-2 border-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs shadow-sm transform rotate-12">
                   {{ successModalData.score }}%
                 </div>
               </div>

              <div class="flex flex-col items-center gap-2 flex-1 min-w-0">
                <img :src="successModalData.user2_photo || 'https://placehold.co/100'" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-gray-200" />
                <span class="text-xs font-bold truncate w-full px-1 text-gray-700">{{ successModalData.user2_name.split(' ')[0] }}</span>
              </div>
            </div>

            <button @click="closeSuccessModal" class="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all transform active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
              <span>Continue Matching</span>
              <svg class="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'
import { useCompatibility, type VibeAnswer, type UserProfile } from '~/composables/useCompatibility'
import type { Database } from '~/types/database'

useHead({ title: 'Matchmaker' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient<Database>()
const currentUser = useSupabaseUser()

// Mode
const mode = ref<'manual' | 'auto'>('manual')

// State
const users = ref<any[]>([])
const user1 = ref<any>(null)
const user2 = ref<any>(null)
const hoveredUser = ref<any>(null)
const selectingSlot = ref(1)
const unlockPrice = ref(15) // Testing price - change back to 50 for production
const creating = ref(false)
const matchError = ref('')
const matchSuccess = ref('')
const visibleCount = ref(12)

// Auto matchmaker state
const autoMatches = ref<any[]>([])
const selectedAutoMatches = ref<any[]>([])
const generatingAuto = ref(false)
const creatingBulk = ref(false)
const bulkSuccess = ref('')
const bulkError = ref('')

const autoConfig = reactive({
  minScore: 50
})

const filters = reactive({
  gender: '',
  genotype: '',
  search: ''
})

// Fetch existing matches to exclude
const existingMatches = ref<Set<string>>(new Set())

// Vibe answers for enhanced compatibility scoring
const userVibeAnswers = ref<Map<string, VibeAnswer[]>>(new Map())
const { calculateCompatibility, getCompatibilityTier } = useCompatibility()

onMounted(() => {
  const stored = sessionStorage.getItem('matchUser1')
  if (stored) {
    try {
      user1.value = JSON.parse(stored)
      sessionStorage.removeItem('matchUser1')
      
      if (user1.value.interested_in && user1.value.interested_in !== 'everyone') {
          filters.gender = user1.value.interested_in
      } else {
          if (user1.value.gender === 'male') filters.gender = 'female'
          if (user1.value.gender === 'female') filters.gender = 'male'
      }
      
      selectingSlot.value = 2
    } catch (e) {}
  }
  fetchUsers()
  fetchExistingMatches()
  fetchVibeAnswers()
})

const fetchUsers = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
  
  users.value = data || []
}

const fetchExistingMatches = async () => {
  const { data } = await supabase
    .from('matches')
    .select('user_1_id, user_2_id')
  
  if (data) {
    const matches = data as any[]
    const pairs = new Set<string>()
    matches.forEach(m => {
      pairs.add(`${m.user_1_id}-${m.user_2_id}`)
      pairs.add(`${m.user_2_id}-${m.user_1_id}`)
    })
    existingMatches.value = pairs
  }
}

// Fetch all vibe answers for enhanced compatibility scoring
const fetchVibeAnswers = async () => {
  const { data } = await supabase
    .from('vibe_answers')
    .select('user_id, question_key, answer')
  
  if (data) {
    const answersMap = new Map<string, VibeAnswer[]>()
    data.forEach((row: any) => {
      const existing = answersMap.get(row.user_id) || []
      existing.push({ question_key: row.question_key, answer: row.answer })
      answersMap.set(row.user_id, existing)
    })
    userVibeAnswers.value = answersMap
  }
}

// === Utility Functions ===
const getAge = (birthDate: string | null): number => {
  if (!birthDate) return 25
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const cmToFeet = (cm: number) => {
  if (!cm) return ''
  const realFeet = ((cm * 0.393700) / 12);
  const feet = Math.floor(realFeet);
  const inches = Math.round((realFeet - feet) * 12);
  return `${feet}'${inches}"`;
}

const getWaitingDays = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getPersona = (id: string) => personas[id] || null

const getPersonaIcon = (id: string) => {
  const icons: Record<string, string> = {
    'power_player': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
    'romantic': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
    'adventurer': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>',
    'intellectual': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>',
    'social_butterfly': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>',
    'homebody': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>'
  }
  return icons[id] || '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
}

// === COMPATIBILITY MATRIX ===
const compatibilityMatrix: Record<string, string[]> = {
  power_player: ['power_player', 'intellectual'],
  romantic: ['romantic', 'adventurer'],
  adventurer: ['adventurer', 'social_butterfly', 'romantic'],
  intellectual: ['intellectual', 'power_player', 'homebody'],
  social_butterfly: ['social_butterfly', 'adventurer'],
  homebody: ['homebody', 'romantic', 'intellectual']
}

// SMART MATCHING ALGORITHM - Enhanced with Vibe Answers
const calculateMatchScore = (u1: any, u2: any) => {
  let score = 0
  const reasons: string[] = []
  const warnings: string[] = []
  
  // 1. Gender / Interest Logic (Mutual)
  const u1WantsU2 = !u1.interested_in || u1.interested_in === 'everyone' || u1.interested_in === u2.gender
  const u2WantsU1 = !u2.interested_in || u2.interested_in === 'everyone' || u2.interested_in === u1.gender
  
  if (!u1WantsU2 || !u2WantsU1) {
    return { score: 0, reasons: [], warnings: ['Gender Mismatch'] }
  }
  
  // 2. DEALBREAKER CHECKS (New - Filter based on user preferences)
  const u1Dealbreakers = u1.dealbreakers || {}
  const u2Dealbreakers = u2.dealbreakers || {}
  const age1 = getAge(u1.birth_date)
  const age2 = getAge(u2.birth_date)
  
  // Check U1's dealbreakers against U2
  if (u1Dealbreakers.genotype?.length > 0 && u2.genotype) {
    if (!u1Dealbreakers.genotype.includes(u2.genotype)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Genotype'] }
    }
  }
  if (u1Dealbreakers.intent?.length > 0 && u2.intent) {
    if (!u1Dealbreakers.intent.includes(u2.intent)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Intent'] }
    }
  }
  if (u1Dealbreakers.religion?.length > 0 && u2.religion) {
    if (!u1Dealbreakers.religion.includes(u2.religion)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Religion'] }
    }
  }
  // Age range dealbreakers (user1's preferred age range)
  if (u1.min_age && u1.max_age) {
    if (age2 < u1.min_age || age2 > u1.max_age) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Age Range'] }
    }
  }
  
  // Check U2's dealbreakers against U1
  if (u2Dealbreakers.genotype?.length > 0 && u1.genotype) {
    if (!u2Dealbreakers.genotype.includes(u1.genotype)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Genotype'] }
    }
  }
  if (u2Dealbreakers.intent?.length > 0 && u1.intent) {
    if (!u2Dealbreakers.intent.includes(u1.intent)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Intent'] }
    }
  }
  if (u2Dealbreakers.religion?.length > 0 && u1.religion) {
    if (!u2Dealbreakers.religion.includes(u1.religion)) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Religion'] }
    }
  }
  // Age range dealbreakers (user2's preferred age range)
  if (u2.min_age && u2.max_age) {
    if (age1 < u2.min_age || age1 > u2.max_age) {
      return { score: 0, reasons: [], warnings: ['Dealbreaker: Age Range'] }
    }
  }
  
  // Opposite gender bonus
  if (u1.gender !== u2.gender) score += 15
  
  // 3. Age Rule
  const gap = Math.abs(age1 - age2)
  if (gap <= 3) { score += 10; reasons.push('Close Age') }
  else if (gap <= 7) { score += 5 }
  else if (gap > 10) { score -= 5 }
  
  // 3. Genotype Compatibility (CRITICAL)
  if (u1.genotype && u2.genotype) {
    const g1 = u1.genotype
    const g2 = u2.genotype
    
    if ((g1 === 'SS' && g2 !== 'AA') || (g2 === 'SS' && g1 !== 'AA')) {
      score -= 100
      warnings.push('Medical Risk (SS)')
    }
    else if ((g1.includes('S') || g1.includes('C')) && (g2.includes('S') || g2.includes('C'))) {
      score -= 40
      warnings.push('Genotype Risk')
    }
    else if (g1 === 'AA' || g2 === 'AA') {
      score += 5
      reasons.push('Safe Genotype')
    }
  }

  // 4. Intent (Goals)
  if (u1.intent && u2.intent) {
    const serious = ['marriage', 'serious']
    const casual = ['casual', 'friendship']
    
    if (u1.intent === u2.intent) {
      score += 15
      reasons.push('Same Goals')
    } 
    else if (serious.includes(u1.intent) && serious.includes(u2.intent)) {
      score += 8
    }
    else if ((serious.includes(u1.intent) && casual.includes(u2.intent)) || (casual.includes(u1.intent) && serious.includes(u2.intent))) {
      score -= 20
      warnings.push('Mismatched Goals')
    }
  }

  // 5. Persona Synergy
  const p1 = u1.dating_persona
  const p2 = u2.dating_persona
  if (p1 && p2) {
    if (compatibilityMatrix[p1]?.includes(p2) || compatibilityMatrix[p2]?.includes(p1)) {
      score += 10
      reasons.push('Great Vibe')
    } else if (p1 === p2) {
      score += 5
      reasons.push('Similar Vibe')
    }
  }

  // 6. Religion
  if (u1.religion && u2.religion && u1.religion !== 'None' && u2.religion !== 'None') {
    if (u1.religion === u2.religion) {
      score += 8
      reasons.push('Shared Faith')
    }
  }
  
  // 7. Location
  if (u1.location && u2.location && u1.location === u2.location) {
    score += 7
    reasons.push('Same City')
  }
  
  // 8. VIBE ANSWERS COMPATIBILITY (NEW - Up to 30 bonus points)
  const u1Answers = userVibeAnswers.value.get(u1.id)
  const u2Answers = userVibeAnswers.value.get(u2.id)
  
  if (u1Answers && u2Answers && u1Answers.length > 0 && u2Answers.length > 0) {
    // Convert to profiles for calculateCompatibility
    const profile1: UserProfile = {
      id: u1.id,
      gender: u1.gender,
      interested_in: u1.interested_in,
      intent: u1.intent,
      location: u1.location,
      religion: u1.religion,
      genotype: u1.genotype,
      birth_date: u1.birth_date
    }
    const profile2: UserProfile = {
      id: u2.id,
      gender: u2.gender,
      interested_in: u2.interested_in,
      intent: u2.intent,
      location: u2.location,
      religion: u2.religion,
      genotype: u2.genotype,
      birth_date: u2.birth_date
    }
    
    const vibeResult = calculateCompatibility(profile1, u1Answers, profile2, u2Answers)
    
    // Add vibe score (scaled to add up to 30 points max)
    const vibeBonus = Math.round(vibeResult.score * 0.3) // 30% of 0-100 = 0-30 points
    score += vibeBonus
    
    // Add vibe-based insights
    if (vibeResult.strengths.length > 0) {
      reasons.push(...vibeResult.strengths.slice(0, 2))
    }
    if (vibeResult.warnings.length > 0) {
      warnings.push(...vibeResult.warnings.slice(0, 1))
    }
    
    // Show vibe analysis indicator
    if (vibeBonus >= 20) {
      reasons.unshift('💕 High Vibe Match')
    } else if (vibeBonus >= 10) {
      reasons.unshift('✨ Good Vibe Match')
    }
  }
  
  return { score: Math.max(0, Math.min(score, 100)), reasons, warnings }
}

// For manual mode (one-sided calculation)
const calculateMatchDetails = (candidate: any) => {
  if (!user1.value) return { score: 0, reasons: [], warnings: [] }
  return calculateMatchScore(user1.value, candidate)
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#3B82F6'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

// === AUTO MATCHMAKER ===
const generateAutoMatches = async () => {
  generatingAuto.value = true
  autoMatches.value = []
  selectedAutoMatches.value = []
  bulkSuccess.value = ''
  bulkError.value = ''
  
  await new Promise(r => setTimeout(r, 500)) // Brief delay for UX
  
  const potentialMatches: any[] = []
  const usedPairs = new Set<string>()
  
  // Get all verified users
  const eligibleUsers = users.value.filter(u => u.is_verified)
  
  // Compare all pairs
  for (let i = 0; i < eligibleUsers.length; i++) {
    for (let j = i + 1; j < eligibleUsers.length; j++) {
      const u1 = eligibleUsers[i]
      const u2 = eligibleUsers[j]
      
      // Skip if already matched
      const pairKey = [u1.id, u2.id].sort().join('-')
      if (existingMatches.value.has(`${u1.id}-${u2.id}`) || usedPairs.has(pairKey)) {
        continue
      }
      
      const result = calculateMatchScore(u1, u2)
      
      if (result.score >= autoConfig.minScore) {
        potentialMatches.push({
          user1: u1,
          user2: u2,
          score: result.score,
          reasons: result.reasons,
          warnings: result.warnings
        })
        usedPairs.add(pairKey)
      }
    }
  }
  
  // Sort by score descending
  potentialMatches.sort((a, b) => b.score - a.score)
  
  // Take top 50 suggestions
  autoMatches.value = potentialMatches.slice(0, 50)
  generatingAuto.value = false
}

const isAutoMatchSelected = (match: any) => {
  return selectedAutoMatches.value.some(
    m => m.user1.id === match.user1.id && m.user2.id === match.user2.id
  )
}

const toggleAutoMatchSelection = (match: any) => {
  const isSelected = selectedAutoMatches.value.some(
    m => m.user1.id === match.user1.id && m.user2.id === match.user2.id
  )
  
  if (isSelected) {
    // Deselect if already selected
    selectedAutoMatches.value = selectedAutoMatches.value.filter(
      m => !(m.user1.id === match.user1.id && m.user2.id === match.user2.id)
    )
  } else {
    // Select this match AND remove any conflicting matches
    // (i.e. if user1 or user2 is already involved in another selected match)
    const u1Id = match.user1.id
    const u2Id = match.user2.id
    
    // Filter out conflicts from existing selection
    const nonConflicting = selectedAutoMatches.value.filter(m => {
       const m1 = m.user1.id
       const m2 = m.user2.id
       // Check if either user in existing match overlaps with new match
       const conflict = (m1 === u1Id || m1 === u2Id || m2 === u1Id || m2 === u2Id)
       return !conflict
    })
    
    // Add new match
    selectedAutoMatches.value = [...nonConflicting, match]
  }
}

const selectAllHigh = () => {
  // Greedy selection: Take highest scoring matches first, skipping any that create conflicts
  const candidates = [...autoMatches.value]
    .filter(m => m.score >= 70 && !m.warnings.length)
    .sort((a, b) => b.score - a.score) 
    
  const selected: any[] = []
  const usedUsers = new Set<string>()
  
  for (const match of candidates) {
    const u1 = match.user1.id
    const u2 = match.user2.id
    
    // Only select if neither user is already taken in this batch
    if (!usedUsers.has(u1) && !usedUsers.has(u2)) {
      selected.push(match)
      usedUsers.add(u1)
      usedUsers.add(u2)
    }
  }
  
  selectedAutoMatches.value = selected
}

const createBulkMatches = async () => {
  if (!selectedAutoMatches.value.length) return
  
  creatingBulk.value = true
  bulkError.value = ''
  bulkSuccess.value = ''
  
  try {
    const matchesToCreate = selectedAutoMatches.value.map(m => ({
      user_1_id: m.user1.id,
      user_2_id: m.user2.id,
      unlock_price: unlockPrice.value,
      created_by: currentUser.value?.id,
      status: 'pending_payment',
      match_score: m.score,
      match_reasons: m.reasons || [],
      match_warnings: m.warnings || []
    }))
    
    const { error } = await supabase
      .from('matches')
      .insert(matchesToCreate as any)
    
    if (error) throw error
    
    // Send SMS notifications to all matched users
    const { sendSMS } = useHubtel()
    const smsPromises: Promise<any>[] = []
    
    for (const match of selectedAutoMatches.value) {
      const msg = `Great news! You've been matched on Minutes 2 Match! Log in to see who it is and unlock their profile. - M2Match`
      if (match.user1.phone) smsPromises.push(sendSMS(match.user1.phone, msg).catch(() => {}))
      if (match.user2.phone) smsPromises.push(sendSMS(match.user2.phone, msg).catch(() => {}))
    }
    
    // Send SMS in background (don't block)
    Promise.all(smsPromises).then(() => console.log('Match SMS notifications sent'))
    
    const count = selectedAutoMatches.value.length
    bulkSuccess.value = `Successfully created ${count} matches! SMS notifications sent.`
    
    // Remove created matches from list
    const createdIds = new Set(selectedAutoMatches.value.map(m => `${m.user1.id}-${m.user2.id}`))
    autoMatches.value = autoMatches.value.filter(m => !createdIds.has(`${m.user1.id}-${m.user2.id}`))
    selectedAutoMatches.value = []
    
    // Refresh existing matches
    await fetchExistingMatches()
  } catch (err: any) {
    if (err.code === '23505') {
      bulkError.value = 'One or more of these matches already exist.'
    } else {
      bulkError.value = 'Failed to create matches: ' + err.message
    }
  } finally {
    creatingBulk.value = false
  }
}

// === MANUAL MATCHMAKER ===
const candidateScores = computed(() => {
  if (!user1.value) return []
  return users.value.map(u => {
    const details = calculateMatchDetails(u)
    return { ...u, matchDetails: details }
  }).sort((a, b) => b.matchDetails.score - a.matchDetails.score)
})

const filteredCandidates = computed(() => {
  let list = user1.value ? candidateScores.value : users.value
  
  // Filter out self and existing matches
  list = list.filter(u => {
    if (user1.value && u.id === user1.value.id) return false
    if (user2.value && u.id === user2.value.id) return false
    if (user1.value) {
      if (existingMatches.value.has(`${user1.value.id}-${u.id}`)) return false
    }
    return true
  })
  
  if (filters.gender) {
    list = list.filter(u => u.gender === filters.gender)
  }
  
  if (filters.genotype) {
    list = list.filter(u => u.genotype === filters.genotype)
  }
  
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(u => 
      u.display_name?.toLowerCase().includes(q) || 
      u.phone?.includes(q)
    )
  }
  
  return list
})

const paginationCandidates = computed(() => {
  return filteredCandidates.value.slice(0, visibleCount.value)
})

// === MANAGE MATCH STATUS ===
const matchData = computed(() => {
  const targetUser2 = user2.value || hoveredUser.value
  if (!user1.value || !targetUser2) return { score: 0, reasons: [], warnings: [] }
  return calculateMatchScore(user1.value, targetUser2)
})

const canCreateMatch = computed(() => {
  return user1.value && user2.value && !creating.value
})

const selectCandidate = (user: any) => {
  if (isDisabled(user)) return
  
  if (selectingSlot.value === 1) {
    user1.value = user
    // Auto switch to slot 2 but check filtering preferences
    selectingSlot.value = 2
    
    // Auto set gender filter
    if (user.interested_in && user.interested_in !== 'everyone') {
      filters.gender = user.interested_in
    } else {
      if (user.gender === 'male') filters.gender = 'female'
      if (user.gender === 'female') filters.gender = 'male'
    }
  } else {
    user2.value = user
  }
}

const isSelected = (user: any) => {
  return (user1.value?.id === user.id) || (user2.value?.id === user.id)
}

const isDisabled = (user: any) => {
  if (user1.value && user.id === user1.value.id) return true
  if (user1.value && existingMatches.value.has(`${user1.value.id}-${user.id}`)) return true
  return false
}

const showSuccessModal = ref(false)
const successModalData = ref({ 
  user1_name: '', 
  user2_name: '', 
  score: 0,
  user1_photo: null as string | null,
  user2_photo: null as string | null
})

const closeSuccessModal = () => {
  showSuccessModal.value = false
  user2.value = null
  matchSuccess.value = ''
}

const createMatch = async () => {
  if (!user1.value || !user2.value) return
  
  creating.value = true
  matchError.value = ''
  matchSuccess.value = ''
  
  try {
    // Calculate score for manual match
    const scoreResult = calculateMatchScore(user1.value, user2.value)
    
    const { error } = await (supabase
      .from('matches') as any)
      .insert({
        user_1_id: user1.value.id,
        user_2_id: user2.value.id,
        unlock_price: unlockPrice.value,
        created_by: currentUser.value?.id,
        status: 'pending_payment',
        match_score: scoreResult.score,
        match_reasons: scoreResult.reasons || [],
        match_warnings: scoreResult.warnings || []
      })
    
    if (error) throw error
    
    // Send SMS Notification via Hubtel
    const { sendSMS } = useHubtel()
    const msg = `Great news! You've been matched on Minutes 2 Match! Log in to see who it is and unlock their profile. - M2Match`
    
    if (user1.value.phone) sendSMS(user1.value.phone, msg)
    if (user2.value.phone) sendSMS(user2.value.phone, msg)
    
    matchSuccess.value = `Match created successfully!`
    
    // Update local existing matches
    existingMatches.value.add(`${user1.value.id}-${user2.value.id}`)
    existingMatches.value.add(`${user2.value.id}-${user1.value.id}`)
    
    // Show Success Modal
    successModalData.value = {
      user1_name: user1.value.display_name,
      user2_name: user2.value.display_name,
      score: scoreResult.score,
      user1_photo: user1.value.photo_url,
      user2_photo: user2.value.photo_url
    }
    showSuccessModal.value = true
    
    // Auto-close after 3 seconds if not interacted
    setTimeout(() => {
      if (showSuccessModal.value) {
        // closeSuccessModal() // Optional: auto close?
        // Let's just reset the form behind the scenes or leave it providing current context?
        // Better to wait for user to close.
      }
    }, 3000)

  } catch (err: any) {
    if (err.code === '23505') {
      matchError.value = 'This match already exists.'
    } else {
      matchError.value = 'Failed to create match: ' + err.message
    }
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
/* Scoped styles */
.matchmaker-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Mode Toggle */
.mode-toggle {
  display: flex;
  background: #F3F4F6;
  padding: 0.25rem;
  border-radius: 999px;
  gap: 0.25rem;
}

.mode-toggle__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle__btn:hover {
  color: #111827;
}

.mode-toggle__btn--active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.stat-card__label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Auto Match Grid */
.auto-match-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.auto-match-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.auto-match-card:hover {
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.auto-match-card--selected {
  border-color: #000;
  background: #F9FAFB;
}

.auto-match-card__score {
  position: absolute;
  top: -8px;
  right: 12px;
  background: #10B981;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.auto-match-card__check {
  position: absolute;
  top: 12px;
  left: 12px;
}

.auto-match-card__check input {
  width: 18px;
  height: 18px;
  accent-color: #000;
}

.auto-match-card__users {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.auto-match-card__user {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auto-match-card__heart {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  padding: 0 0.5rem;
  margin-top: 1rem;
  opacity: 0.5;
}

.auto-match-card__reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.auto-match-card__warnings {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
}

/* THE STAGE layout */
.match-stage {
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  min-height: 280px;
  position: relative;
}

.match-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@media (max-width: 768px) {
  .match-stage {
    flex-direction: column;
    gap: 1rem;
  }
}

.stage-card {
  flex: 1;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  position: relative;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}

.stage-card:hover { 
  transform: translateY(-4px); 
  box-shadow: 0 12px 24px rgba(0,0,0,0.08); 
  border-color: #CBD5E1;
}

.stage-card--active { 
  border-color: #000; 
  box-shadow: 0 0 0 3px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08);
}

.stage-card--filled { 
  border-color: #E5E7EB; 
  background: white;
  align-items: flex-start;
  justify-content: flex-start;
}

/* Empty state for stage cards */
.stage-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  position: relative;
}

.stage-card__avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #94A3B8;
  border: 2px dashed #CBD5E1;
  transition: all 0.3s ease;
}

.stage-card:hover .stage-card__avatar-placeholder {
  border-color: #64748B;
  color: #64748B;
  transform: scale(1.05);
}

.stage-card--active .stage-card__avatar-placeholder {
  border-color: #000;
  border-style: solid;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  color: #000;
}

.stage-card__avatar-placeholder--secondary {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border-color: #FCD34D;
  color: #B45309;
}

.stage-card:hover .stage-card__avatar-placeholder--secondary {
  border-color: #F59E0B;
  color: #92400E;
}

.stage-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 0.25rem;
}

.stage-card__hint {
  font-size: 0.75rem;
  color: #94A3B8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stage-card__hint--ready {
  color: #059669;
  font-weight: 600;
}

.stage-card__pulse {
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  border: 2px solid transparent;
  animation: stage-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes stage-pulse {
  0%, 100% {
    border-color: transparent;
    opacity: 0;
  }
  50% {
    border-color: rgba(0,0,0,0.2);
    opacity: 1;
  }
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  margin-bottom: 1.5rem;
}

.stats-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.stats-bar__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1E293B;
  line-height: 1;
}

.stats-bar__label {
  font-size: 0.625rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-bar__divider {
  width: 1px;
  height: 32px;
  background: #E5E7EB;
}

.stats-bar__item--success .stats-bar__value {
  color: #059669;
}

.stats-bar__item--premium .stats-bar__value {
  color: #7C3AED;
}

.stats-bar__item--accent .stats-bar__value {
  color: #0EA5E9;
}

.connection-bridge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  align-self: center;
  flex-shrink: 0;
}

.connection-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #E5E7EB 0%, #CBD5E1 50%, #E5E7EB 100%);
  z-index: 1;
}

.connection-heart {
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  color: #64748B;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.connection-heart:has(span:not(:empty)) {
  border-color: #10B981;
  color: #10B981;
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
}

/* Candidates Grid */
.candidate-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.candidate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.2s;
}

.candidate-card:hover { 
  border-color: #000; 
  transform: translateY(-2px); 
  box-shadow: 0 8px 16px rgba(0,0,0,0.08); 
}

.candidate-card:hover::before {
  background: #000;
}

.candidate-card--selected {
  border-color: #000;
  background: #FAFAFA;
}

.candidate-card--selected::before {
  background: #10B981;
}

.match-score-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #000;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.375rem 0.625rem;
  border-bottom-left-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 5;
}

.priority-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.375rem 0.625rem;
  border-bottom-right-radius: 10px;
  text-transform: uppercase;
  z-index: 5;
}

.bg-purple-100 { background-color: #F3E8FF; }
.text-purple-700 { color: #7E22CE; }
.text-purple-800 { color: #6B21A8; }
.bg-pink-50 { background-color: #FDF2F8; }
.text-pink-700 { color: #BE185D; }
.text-green-800 { color: #065F46; }
.bg-green-100 { background-color: #D1FAE5; }
.text-green-600 { color: #059669; }
.text-blue-600 { color: #2563EB; }
.text-orange-600 { color: #EA580C; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.min-h-\[20px\] { min-height: 20px; }
.text-\[10px\] { font-size: 10px; }
.max-w-\[100px\] { max-width: 100px; }
.max-w-\[80px\] { max-width: 80px; }


.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Stat Cards (for Auto mode) */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.stat-card__value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.stat-card__label {
  font-size: 0.625rem;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.125rem;
}
/* Filled Stage Card Styles */
.stage-card__filled {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.stage-card__remove-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 50%;
  color: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.stage-card__remove-btn:hover {
  background: #FEF2F2;
  transform: scale(1.1);
  border-color: #FECACA;
}

.stage-card__user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stage-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1F2937 0%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.stage-card__details {
  flex: 1;
  min-width: 0;
}

.stage-card__name {
  font-size: 1.125rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  color: #111827;
}

.stage-card__meta {
  display: flex;
  gap: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
  align-items: center;
}

.stage-card__meta span {
  display: inline-block;
}

.stage-card__badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.stage-card__badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}

.stage-card__persona {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stage-card__persona-icon {
  font-size: 1.25rem;
  color: #4B5563;
}

.stage-card__persona-details {
  display: flex;
  flex-direction: column;
}

.stage-card__persona-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.2;
}

.stage-card__persona-label {
  font-size: 0.625rem;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.stage-card__location-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.stage-card__filled .badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
