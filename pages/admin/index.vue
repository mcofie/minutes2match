<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
        Good {{ timeOfDay }}, Admin 👋
      </h1>
      <p class="text-stone-500">Here's what's happening today at minutes2match.</p>
    </header>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total Users -->
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-5.341"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <span class="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full" v-if="stats.newUsersThisWeek > 0">
            +{{ stats.newUsersThisWeek }} this week
          </span>
        </div>
        <div>
          <span class="block text-3xl font-black text-stone-900 mb-1">{{ stats.totalUsers }}</span>
          <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Total Users</span>
        </div>
      </div>

      <!-- Verified Users -->
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <span class="text-xs font-bold px-2 py-1 bg-stone-100 text-stone-600 rounded-full">
            {{ verificationRate }}% rate
          </span>
        </div>
        <div>
          <span class="block text-3xl font-black text-stone-900 mb-1">{{ stats.verifiedUsers }}</span>
          <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Verified Users</span>
        </div>
      </div>

      <!-- Total Matches -->
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <span class="text-xs font-bold px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
            {{ stats.unlockedMatches }} unlocked
          </span>
        </div>
        <div>
          <span class="block text-3xl font-black text-stone-900 mb-1">{{ stats.totalMatches }}</span>
          <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Matches Made</span>
        </div>
      </div>

      <!-- Revenue -->
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="feather feather-dollar-sign"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <span class="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
            {{ stats.totalPayments }} txns
          </span>
        </div>
        <div>
          <span class="block text-3xl font-black text-stone-900 mb-1">{{ formatCurrency(stats.totalRevenue) }}</span>
          <span class="text-sm font-medium text-stone-500 uppercase tracking-wider">Total Revenue</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content Area (2/3) -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Live Activity Feed -->
        <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center">
            <h2 class="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live Activity
            </h2>
          </div>
          
          <div class="divide-y divide-stone-100">
             <div v-if="loading" class="p-8 text-center text-stone-400">
                <span class="animate-pulse">Loading feed...</span>
             </div>
             <div v-else-if="recentActivity.length === 0" class="p-8 text-center text-stone-400">
                No recent activity
             </div>
             <div v-else v-for="activity in recentActivity" :key="activity.id" class="p-4 hover:bg-stone-50 transition-colors flex items-center gap-4">
                <!-- Icons based on type -->
                <div class="h-10 w-10 rounded-full flex items-center justify-center shrink-0" 
                     :class="{
                       'bg-blue-100 text-blue-600': activity.type === 'signup',
                       'bg-green-100 text-green-600': activity.type === 'payment',
                       'bg-pink-100 text-pink-600': activity.type === 'match',
                       'bg-purple-100 text-purple-600': activity.type === 'event'
                     }">
                   <svg v-if="activity.type === 'signup'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                   <svg v-else-if="activity.type === 'payment'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                   <svg v-else-if="activity.type === 'match'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                   <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                
                <div class="flex-1">
                   <p class="text-sm font-medium text-stone-900">{{ activity.message }}</p>
                   <p class="text-xs text-stone-500">{{ formatTime(activity.created_at) }}</p>
                </div>
             </div>
          </div>
        </section>
        <!-- Demographics Breakdown -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <!-- Gender Split -->
          <div class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">User Gender Ratio</h2>
            <div class="flex items-center gap-6">
              <div class="relative w-32 h-32 flex-shrink-0">
                <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" class="stroke-stone-100" stroke-width="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" class="stroke-blue-500" stroke-width="3" :stroke-dasharray="`${genderSplit.male}, 100`" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" class="stroke-rose-500" stroke-width="3" :stroke-dasharray="`${genderSplit.female}, 100`" :stroke-dashoffset="`-${genderSplit.male}`" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center flex-col leading-none">
                  <span class="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Ratio</span>
                  <span class="text-lg font-black text-stone-900">{{ genderSplit.male }}:{{ genderSplit.female }}</span>
                </div>
              </div>
              <div class="space-y-4 flex-1">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span class="text-sm font-bold text-stone-600">Men</span>
                  </div>
                  <span class="text-sm font-black text-stone-900">{{ stats.maleUsers }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span class="text-sm font-bold text-stone-600">Women</span>
                  </div>
                  <span class="text-sm font-black text-stone-900">{{ stats.femaleUsers }}</span>
                </div>
                <div class="pt-2 border-t border-stone-50 text-[10px] text-stone-400 font-medium">
                  {{ stats.unspecifiedGender }} users unspecified
                </div>
              </div>
            </div>
          </div>

          <!-- Age Distribution -->
          <div class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Age Distribution</h2>
            <div class="space-y-3">
              <div v-for="(count, range) in ageDistribution" :key="range">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="font-bold text-stone-600 uppercase tracking-wide">{{ range }} yrs</span>
                  <span class="font-black text-stone-900">{{ count }} users</span>
                </div>
                <div class="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div class="h-full bg-stone-900 rounded-full bg-gradient-to-r from-stone-800 to-stone-500" :style="{ width: (count / stats.totalUsers * 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Insights Grid -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          <!-- Dating Intent -->
          <div class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Dating Intent</h2>
            <div class="space-y-4">
              <div v-for="(count, intent) in intentDistribution" :key="intent" class="flex items-center gap-3">
                <div class="w-24 text-xs font-bold text-stone-500 uppercase tracking-tight truncate">{{ intent }}</div>
                <div class="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                   <div class="h-full bg-rose-500 rounded-full" :style="{ width: (count / stats.totalUsers * 100) + '%' }"></div>
                </div>
                <div class="text-xs font-black text-stone-900 w-8 text-right">{{ count }}</div>
              </div>
            </div>
          </div>

          <!-- Match Conversion -->
          <div class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
            <div class="flex justify-between items-start mb-6">
               <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest">Match Success Rate</h2>
               <div class="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold">LIVE</div>
            </div>
            <div class="flex items-end justify-between">
               <div>
                  <div class="text-3xl font-black text-rose-500 leading-none mb-1">{{ matchSuccessRate }}%</div>
                  <div class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Unlocked Conversion</div>
               </div>
               <div class="flex gap-1 h-12 items-end">
                  <div v-for="i in 7" :key="i" class="w-2 bg-rose-100 rounded-t-sm" :style="{ height: (20 + (Math.random() * 80)) + '%' }"></div>
               </div>
            </div>
            <div class="mt-6 pt-6 border-t border-stone-50 flex gap-4">
               <div>
                  <div class="text-sm font-bold text-stone-900">{{ stats.unlockedMatches }}</div>
                  <div class="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Unlocked</div>
               </div>
               <div>
                  <div class="text-sm font-bold text-stone-900">{{ stats.pendingMatches }}</div>
                  <div class="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Pending</div>
               </div>
            </div>
          </div>
        </section>

        <!-- Product Clusters -->
        <section class="grid grid-cols-1 gap-6 pb-6">
          <div class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 class="text-sm font-bold text-stone-900 uppercase tracking-widest mb-6">Personality Type Distribution</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div v-for="(count, personaId) in personaDistribution" :key="personaId" class="flex flex-col items-center p-3 rounded-xl border border-stone-50 bg-stone-50/50">
                <span class="text-2xl mb-2">{{ getPersonaEmoji(personaId) }}</span>
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-tighter text-center h-8 flex items-center">{{ getPersonaName(personaId) }}</span>
                <span class="text-lg font-black text-stone-900 mt-1">{{ count }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Revenue Breakdown -->

      </div>

      <!-- Sidebar Area (1/3) -->
      <div class="space-y-8">
         
         <!-- Quick Actions Grid -->
         <section>
            <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-3">
               <NuxtLink to="/admin/matches/matchmaker" class="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group text-center flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                  </div>
                  <span class="text-sm font-bold text-stone-700">Manual Match</span>
               </NuxtLink>

               <NuxtLink to="/admin/events" class="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group text-center flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <span class="text-sm font-bold text-stone-700">Manage Events</span>
               </NuxtLink>
               
               <NuxtLink to="/admin/reports" class="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group text-center flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <span class="text-sm font-bold text-stone-700">View Reports</span>
               </NuxtLink>

               <NuxtLink to="/admin/users" class="bg-white p-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all group text-center flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-5.341"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span class="text-sm font-bold text-stone-700">All Users</span>
               </NuxtLink>
            </div>
         </section>

         <!-- Waitlist / Waiting for Match -->
         <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <div>Waiting for Match</div>
              <span class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">{{ waitingUsers.length }}</span>
            </h3>
            
            <div class="space-y-4">
               <div v-if="waitingUsers.length === 0" class="text-sm text-stone-400 italic">No users waiting</div>
               
               <div v-for="user in waitingUsers.slice(0, 5)" :key="user.id" class="flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-xs border border-stone-200">
                    {{ user.display_name?.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                     <p class="text-sm font-medium text-stone-900 truncate">{{ user.display_name }}</p>
                     <p class="text-xs text-stone-500">{{ getWaitingDays(user.created_at) }} days waiting</p>
                  </div>
                  <NuxtLink :to="`/admin/matches/matchmaker?user=${user.id}`" class="text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                    Match →
                  </NuxtLink>
               </div>
               
               <NuxtLink to="/admin/matches/matchmaker" class="block w-full py-2 text-center text-sm font-medium text-stone-500 hover:text-stone-800 border-t border-stone-100 mt-2">
                 View all waiting users
               </NuxtLink>
            </div>
         </section>

         <!-- Incomplete Profiles -->
         <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <div>Incomplete Profiles</div>
              <span class="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">{{ incompleteProfiles.length }}</span>
            </h3>
            
            <div class="space-y-4">
               <div v-if="loadingIncomplete" class="text-sm text-stone-400 text-center py-4">
                  <span class="animate-pulse">Checking profiles...</span>
               </div>
               
               <div v-else-if="incompleteProfiles.length === 0" class="text-sm text-stone-400 italic">
                  All profiles are complete! 🎉
               </div>
               
               <template v-else>
                  <div v-for="profile in incompleteProfiles.slice(0, 3)" :key="profile.id" class="flex items-center gap-3">
                     <div class="h-8 w-8 rounded-full bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-xs border border-orange-200">
                       {{ profile.displayName?.charAt(0) || '?' }}
                     </div>
                     <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-stone-900 truncate">{{ profile.displayName || 'Unknown' }}</p>
                        <p class="text-xs text-stone-500">Missing: {{ profile.missingFields.slice(0, 2).join(', ') }}{{ profile.missingFields.length > 2 ? '...' : '' }}</p>
                     </div>
                     <div class="text-xs font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                       {{ profile.completenessPercent }}%
                     </div>
                  </div>

                  <div class="pt-4 border-t border-stone-100 space-y-3">
                     <button 
                        @click="openSmsModal('incomplete')"
                        :disabled="sendingReminders"
                        class="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                        <svg v-if="sendingReminders" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        {{ sendingReminders ? 'Sending...' : `Send Reminders (${incompleteProfiles.length})` }}
                     </button>
                     <p class="text-xs text-stone-400 text-center">
                        Sends SMS to users missing 2+ profile fields
                     </p>
                  </div>
               </template>
            </div>
         </section>

          <!-- Missing Details Profiles -->
          <section class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mt-6">
             <h3 class="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center justify-between">
               <div>Missing Details</div>
               <span class="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">{{ missingDetailsProfiles.length }}</span>
             </h3>
             
             <div class="space-y-4">
                <div v-if="loadingMissingDetails" class="text-sm text-stone-400 text-center py-4">
                   <span class="animate-pulse">Checking details...</span>
                </div>
                
                <div v-else-if="missingDetailsProfiles.length === 0" class="text-sm text-stone-400 italic">
                   All profiles have full details! ✨
                </div>
                
                <template v-else>
                   <div v-for="profile in missingDetailsProfiles.slice(0, 3)" :key="profile.id" class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-full bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs border border-purple-200">
                        {{ profile.displayName?.charAt(0) || '?' }}
                      </div>
                      <div class="flex-1 min-w-0">
                         <p class="text-sm font-medium text-stone-900 truncate">{{ profile.displayName || 'Unknown' }}</p>
                         <p class="text-xs text-stone-500">Missing: {{ profile.missingFields.slice(0, 2).join(', ') }}{{ profile.missingFields.length > 2 ? '...' : '' }}</p>
                      </div>
                   </div>

                   <div class="pt-4 border-t border-stone-100 space-y-3">
                      <button 
                         @click="openSmsModal('missing')"
                         :disabled="sendingMissingDetailsReminders"
                         class="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                         <svg v-if="sendingMissingDetailsReminders" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                         <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                         {{ sendingMissingDetailsReminders ? 'Sending...' : `Send Reminders (${missingDetailsProfiles.length})` }}
                      </button>
                      <p class="text-xs text-stone-400 text-center">
                         Notify users missing secondary details
                      </p>
                   </div>
                </template>
             </div>
          </section>

      </div>
    </div>
    <!-- SMS Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showSmsModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showSmsModal = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          <h3 class="text-lg font-bold text-stone-900 mb-2">Confirm SMS Blast</h3>
          <p class="text-stone-500 mb-4">
            You are about to send an SMS to <span class="font-bold text-stone-900">{{ smsModalType === 'incomplete' ? incompleteProfiles.length : missingDetailsProfiles.length }}</span> users.
          </p>
          
          <div class="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
            <p class="text-xs text-stone-400 uppercase tracking-wider font-bold mb-2">Message Preview</p>
            <p class="text-sm text-stone-800 font-mono whitespace-pre-wrap">{{ smsModalMessage }}</p>
          </div>
          
          <div class="flex gap-3 justify-end">
            <button 
              @click="showSmsModal = false"
              class="px-4 py-2 text-stone-500 hover:text-stone-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="confirmSendSms"
              :disabled="sendingReminders || sendingMissingDetailsReminders"
              class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span v-if="sendingReminders || sendingMissingDetailsReminders" class="animate-pulse">Sending...</span>
              <span v-else>Send Now</span>
              <svg v-if="!sendingReminders && !sendingMissingDetailsReminders" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'

useHead({ title: 'Dashboard' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

import type { M2MDatabase } from '~/types/database.types'

const supabase = useSupabaseClient<M2MDatabase>()

// State
const loading = ref(true)
const stats = reactive({
  totalUsers: 0,
  verifiedUsers: 0,
  newUsersThisWeek: 0,
  totalMatches: 0,
  unlockedMatches: 0,
  partialPaymentMatches: 0,
  pendingMatches: 0,
  totalRevenue: 0,
  eventRevenue: 0,
  matchRevenue: 0,
  totalPayments: 0,
  avgUnlockPrice: 0,
  maleUsers: 0,
  femaleUsers: 0,
  unspecifiedGender: 0,
  ageData: [] as string[],
  intentData: [] as string[],
  personaData: [] as string[]
})
const recentActivity = ref<any[]>([])
const waitingUsers = ref<any[]>([])

// Incomplete profiles state
interface IncompleteProfile {
  id: string
  phone: string
  displayName: string
  missingFields: string[]
  completenessPercent: number
}
const incompleteProfiles = ref<IncompleteProfile[]>([])
const loadingIncomplete = ref(false)
const sendingReminders = ref(false)

// Missing details profiles state
const missingDetailsProfiles = ref<IncompleteProfile[]>([])
const loadingMissingDetails = ref(false)
const sendingMissingDetailsReminders = ref(false)

// Computed
const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
})

const verificationRate = computed(() => {
  if (!stats.totalUsers) return 0
  return Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
})

const eventRevenuePercent = computed(() => {
  if (!stats.totalRevenue) return 0
  return Math.round((stats.eventRevenue / stats.totalRevenue) * 100)
})

const matchRevenuePercent = computed(() => {
  if (!stats.totalRevenue) return 0
  return Math.round((stats.matchRevenue / stats.totalRevenue) * 100)
})

const genderSplit = computed(() => {
  const total = stats.maleUsers + stats.femaleUsers
  if (!total) return { male: 50, female: 50 }
  return {
    male: Math.round((stats.maleUsers / total) * 100),
    female: Math.round((stats.femaleUsers / total) * 100)
  }
})

const ageDistribution = computed(() => {
  const ranges = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45+': 0
  }
  
  stats.ageData.forEach(dateStr => {
    if (!dateStr) return
    const birthDate = new Date(dateStr)
    const age = new Date().getFullYear() - birthDate.getFullYear()
    
    if (age < 25) ranges['18-24']++
    else if (age < 35) ranges['25-34']++
    else if (age < 45) ranges['35-44']++
    else ranges['45+']++
  })
  
  return ranges
})

const intentDistribution = computed(() => {
  const counts: Record<string, number> = {
    'marriage': 0,
    'serious': 0,
    'casual': 0,
    'friendship': 0,
    'other': 0
  }
  stats.intentData.forEach(intent => {
    if (intent && counts[intent] !== undefined) counts[intent]++
    else counts['other']++
  })
  return counts
})

const matchSuccessRate = computed(() => {
  if (!stats.totalMatches) return 0
  return Math.round((stats.unlockedMatches / stats.totalMatches) * 100)
})

const personaDistribution = computed(() => {
  const counts: Record<string, number> = {}
  stats.personaData.forEach(p => {
    if (!p) return
    counts[p] = (counts[p] || 0) + 1
  })
  return counts
})

const getPersonaEmoji = (id: string) => {
  return (personas as any)[id]?.emoji || '✨'
}

const getPersonaName = (id: string) => {
  return (personas as any)[id]?.name || 'Mystery'
}

// Fetch stats
const fetchStats = async () => {
  // Total users
  const { count: totalUsers } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  stats.totalUsers = totalUsers || 0

  // Profile Specific Stats
  const { data: profileStats } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('gender, birth_date, is_verified, intent, dating_persona')
  
  if (profileStats) {
    stats.maleUsers = profileStats.filter((p: any) => p.gender === 'male').length
    stats.femaleUsers = profileStats.filter((p: any) => p.gender === 'female').length
    stats.unspecifiedGender = profileStats.filter((p: any) => !p.gender).length
    stats.verifiedUsers = profileStats.filter((p: any) => p.is_verified).length
    stats.ageData = profileStats.map((p: any) => p.birth_date).filter(Boolean) as string[]
    stats.intentData = profileStats.map((p: any) => p.intent).filter(Boolean) as string[]
    stats.personaData = profileStats.map((p: any) => p.dating_persona).filter(Boolean) as string[]
  }

  // New users this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newUsers } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo)
  
  stats.newUsersThisWeek = newUsers || 0

  // Match stats
  const { data: rawMatches } = await supabase.schema('m2m').from('matches').select('status, unlock_price')
  
  const matches = rawMatches as any[] || []
  if (matches.length) {
    stats.totalMatches = matches.length
    stats.unlockedMatches = matches.filter(m => m.status === 'unlocked').length
    stats.partialPaymentMatches = matches.filter(m => m.status === 'partial_payment').length
    stats.pendingMatches = matches.filter(m => m.status === 'pending_payment').length
    
    const totalPrice = matches.reduce((sum, m) => sum + parseFloat(m.unlock_price || 0), 0)
    stats.avgUnlockPrice = matches.length ? totalPrice / matches.length : 0
  }

  // Revenue
  const { data: rawPayments } = await supabase
    .schema('m2m')
    .from('payments')
    .select('amount, purpose, created_at')
    .eq('status', 'success')
  
  const payments = rawPayments as any[] || []
  if (payments.length) {
    stats.totalPayments = payments.length
    stats.totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.eventRevenue = payments.filter(p => p.purpose === 'event_ticket').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.matchRevenue = payments.filter(p => p.purpose === 'match_unlock').reduce((sum, p) => sum + parseFloat(p.amount), 0)
  }
}

// Fetch recent activity
const fetchRecentActivity = async () => {
  loading.value = true
  
  const { data: profiles } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: payments } = await supabase
    .schema('m2m')
    .from('payments')
    .select('id, amount, purpose, created_at')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: matchesCreated } = await supabase
    .schema('m2m')
    .from('matches')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const activities = [
    ...(profiles as any[] || []).map(p => ({
      id: `profile-${p.id}`,
      type: 'signup',
      message: `${p.display_name || 'New user'} signed up`,
      created_at: p.created_at
    })),
    ...(payments as any[] || []).map(p => ({
      id: `payment-${p.id}`,
      type: 'payment',
      message: `Payment of GH₵${p.amount} for ${p.purpose.replace('_', ' ')}`,
      created_at: p.created_at
    })),
    ...(matchesCreated as any[] || []).map(m => ({
      id: `match-${m.id}`,
      type: 'match',
      message: 'New match created',
      created_at: m.created_at
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
   .slice(0, 7)

  recentActivity.value = activities
  loading.value = false
}

// Fetch users waiting for matches
const fetchWaitingUsers = async () => {
  const { data: users } = await supabase
    .schema('m2m')
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('is_verified', true)
    .order('created_at', { ascending: true })
    .limit(10)
  
  // Filter out users who already have matches
  const { data: rawMatches } = await supabase.schema('m2m').from('matches').select('user_1_id, user_2_id')
  
  const matches = rawMatches as any[] || []
  const matchedUserIds = new Set<string>()
  matches.forEach(m => {
    if (m.user_1_id) matchedUserIds.add(m.user_1_id)
    if (m.user_2_id) matchedUserIds.add(m.user_2_id)
  })
  
  waitingUsers.value = (users || []).filter((u: any) => !matchedUserIds.has(u.id))
}

// Helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const getWaitingDays = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Fetch incomplete profiles (dry run)
const fetchIncompleteProfiles = async () => {
  loadingIncomplete.value = true
  try {
    const response = await $fetch('/api/admin/notify-incomplete-profiles', {
      method: 'POST',
      body: { dryRun: true }
    }) as { profiles: IncompleteProfile[] }
    
    incompleteProfiles.value = response.profiles || []
  } catch (error) {
    console.error('Error fetching incomplete profiles:', error)
  } finally {
    loadingIncomplete.value = false
  }
}

// Modal state
const showSmsModal = ref(false)
const smsModalType = ref<'incomplete' | 'missing'>('incomplete')
const smsModalMessage = ref('')

const openSmsModal = (type: 'incomplete' | 'missing') => {
  smsModalType.value = type
  if (type === 'incomplete') {
    smsModalMessage.value = `Hi! Your Minutes 2 Match profile is incomplete. Complete it to unlock better matches! Visit: minutes2match.com/me`
  } else {
    smsModalMessage.value = `Hi! Please complete your profile details (Occupation, Genotype, Interests, etc.) to get better matches on Minutes 2 Match. Update here: minutes2match.com/me`
  }
  showSmsModal.value = true
}

const confirmSendSms = async () => {
  if (smsModalType.value === 'incomplete') {
    await sendProfileReminders()
  } else {
    await sendMissingDetailsReminders()
  }
  showSmsModal.value = false
}

// Send SMS reminders to users with incomplete profiles
const sendProfileReminders = async () => {
  sendingReminders.value = true
  try {
    const response = await $fetch('/api/admin/notify-incomplete-profiles', {
      method: 'POST',
      body: { 
        dryRun: false,
        message: smsModalMessage.value
      }
    }) as { sent: number; failed: number }
    
    alert(`✅ Sent ${response.sent} reminders!${response.failed > 0 ? ` (${response.failed} failed)` : ''}`)
    
    // Refresh the list
    await fetchIncompleteProfiles()
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    alert('Failed to send reminders: ' + (error.message || 'Unknown error'))
  } finally {
    sendingReminders.value = false
  }
}

// Fetch missing details profiles (dry run)
const fetchMissingDetailsProfiles = async () => {
  loadingMissingDetails.value = true
  try {
    const response = await $fetch('/api/admin/notify-missing-details', {
      method: 'POST',
      body: { dryRun: true }
    }) as { profiles: IncompleteProfile[] }
    
    missingDetailsProfiles.value = response.profiles || []
  } catch (error) {
    console.error('Error fetching missing details profiles:', error)
  } finally {
    loadingMissingDetails.value = false
  }
}

// Send SMS reminders to users with missing details
const sendMissingDetailsReminders = async () => {
  sendingMissingDetailsReminders.value = true
  try {
    const response = await $fetch('/api/admin/notify-missing-details', {
      method: 'POST',
      body: { 
        dryRun: false, 
        message: smsModalMessage.value
      }
    }) as { sent: number; failed: number }
    
    alert(`✅ Sent ${response.sent} reminders!${response.failed > 0 ? ` (${response.failed} failed)` : ''}`)
    
    // Refresh the list
    await fetchMissingDetailsProfiles()
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    alert('Failed to send reminders: ' + (error.message || 'Unknown error'))
  } finally {
    sendingMissingDetailsReminders.value = false
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentActivity(),
    fetchWaitingUsers(),
    fetchIncompleteProfiles(),
    fetchMissingDetailsProfiles()
  ])
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
