<template>
  <div class="p-4 md:p-6 max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6 md:mb-8">
      <div>
        <h1 class="text-2xl font-bold text-stone-900 m-0 leading-tight">Match Management</h1>
        <p class="text-stone-500 mt-1">Monitor and manage all user connections and match outcomes.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <button 
          @click="openRequestModal()"
          class="btn-secondary flex-1 md:flex-none justify-center flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all text-sm py-2.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Request Feedback
        </button>
        <NuxtLink to="/admin/matches/matchmaker" class="btn-primary flex-1 md:flex-none justify-center flex items-center gap-2 shadow-lg shadow-stone-200 hover:shadow-xl hover:shadow-stone-200 transition-all text-sm py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Open Matchmaker
        </NuxtLink>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-2">
          <div class="stat-label">Total Unlocked</div>
          <div class="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
          </div>
        </div>
        <div class="stat-value">{{ feedbackStats.total }}</div>
      </div>
      
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-2">
          <div class="stat-label text-yellow-600">Pending Feedback</div>
          <div class="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <div class="stat-value text-stone-900">{{ feedbackStats.pending }}</div>
      </div>
      
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-2">
          <div class="stat-label text-green-600">Connected</div>
          <div class="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <div class="stat-value text-stone-900">{{ feedbackStats.connected }}</div>
      </div>
      
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-2">
          <div class="stat-label text-pink-600">Dating</div>
          <div class="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-pink-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
        </div>
        <div class="stat-value text-stone-900">{{ feedbackStats.dating }}</div>
      </div>
      
      <div class="stat-card group">
        <div class="flex justify-between items-start mb-2">
          <div class="stat-label text-red-600">No Response</div>
          <div class="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </div>
        </div>
        <div class="stat-value text-stone-900">{{ feedbackStats.noResponse }}</div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <!-- Filters Toolbar -->
      <div class="p-4 border-b border-stone-100 bg-stone-50 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
        <div class="flex items-center gap-2 text-stone-500 text-sm font-medium mb-2 md:mb-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Filters:
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 flex-1">
          <select v-model="filters.status" class="form-select user-filter !bg-white !border-stone-200 !text-sm !h-10 md:!h-9 !py-1 w-full sm:w-auto">
            <option value="">All Match Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="partial_payment">Partial Payment</option>
            <option value="unlocked">Unlocked / Paid</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          
          <select v-model="filters.feedbackStatus" class="form-select user-filter !bg-white !border-stone-200 !text-sm !h-10 md:!h-9 !py-1 w-full sm:w-auto">
            <option value="">All Feedback Statuses</option>
            <option value="pending">⏳ Pending Feedback</option>
            <option value="connected">🤝 Connected</option>
            <option value="no_response">📵 No Response</option>
            <option value="unmatched">❌ Unmatched</option>
            <option value="dating">💕 Dating</option>
          </select>
          
          <div class="flex-1 min-w-[200px] relative w-full sm:w-auto">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              v-model="filters.search"
              placeholder="Search matches..."
              class="form-input user-search !pl-9 !bg-white !border-stone-200 !text-sm !h-10 md:!h-9 w-full"
            />
          </div>
        </div>
      </div>

      <!-- Matches Table (Desktop) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white border-b border-stone-100">
              <th class="py-3 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-28">Date</th>
              <th class="py-3 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Match Participants</th>
              <th class="py-3 px-2 text-xs font-semibold text-stone-500 uppercase tracking-wider text-center w-16">Score</th>
              <th class="py-3 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-28">Status</th>
              <th class="py-3 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider w-32">Feedback</th>
              <th class="py-3 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right w-auto">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-if="loading">
              <td colspan="6" class="text-center py-12 text-stone-400">
                <div class="flex flex-col items-center gap-3">
                  <div class="animate-spin h-6 w-6 border-2 border-stone-200 border-t-stone-500 rounded-full"></div>
                  <span>Loading matches...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredMatches.length === 0">
              <td colspan="6" class="text-center py-12 text-stone-400">
                <div class="flex flex-col items-center gap-2">
                  <svg class="text-stone-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <span>No matches found</span>
                </div>
              </td>
            </tr>
            <tr v-for="match in filteredMatches" :key="match.id" class="hover:bg-stone-50/50 transition-colors group">
              <td class="py-4 px-3 text-sm text-stone-500 whitespace-nowrap align-top pt-5">
                {{ formatDate(match.created_at) }}
              </td>
              <td class="py-4 px-3 align-top">
                <div class="flex items-center gap-4">
                  <!-- User 1 -->
                  <div class="flex items-center gap-2 min-w-[120px]">
                    <div class="h-8 w-8 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-600 font-bold border border-white shadow-sm ring-1 ring-stone-100">
                      <img v-if="match.user_1?.photo_url" :src="match.user_1.photo_url" class="h-full w-full rounded-full object-cover" />
                      <span v-else class="text-xs">{{ match.user_1?.display_name?.charAt(0) || '?' }}</span>
                    </div>
                    <div>
                      <div class="font-bold text-stone-900 text-sm truncate max-w-[100px]">{{ match.user_1?.display_name || 'Anonymous' }}</div>
                      <div class="text-[10px] text-stone-500 font-mono mt-0.5">{{ match.user_1?.phone }}</div>
                    </div>
                  </div>
                  
                  <!-- Connector -->
                  <div class="text-stone-300 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>

                  <!-- User 2 -->
                  <div class="flex items-center gap-2 min-w-[120px]">
                    <div class="h-8 w-8 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-600 font-bold border border-white shadow-sm ring-1 ring-stone-100">
                      <img v-if="match.user_2?.photo_url" :src="match.user_2.photo_url" class="h-full w-full rounded-full object-cover" />
                      <span v-else class="text-xs">{{ match.user_2?.display_name?.charAt(0) || '?' }}</span>
                    </div>
                    <div>
                      <div class="font-bold text-stone-900 text-sm truncate max-w-[100px]">{{ match.user_2?.display_name || 'Anonymous' }}</div>
                      <div class="text-[10px] text-stone-500 font-mono mt-0.5">{{ match.user_2?.phone }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <!-- Score Column -->
              <td class="py-4 px-2 align-top pt-5 text-center">
                <button 
                  @click="openCompatibilityModal(match)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                  :class="getScoreClass(match.match_score)"
                  :title="`View compatibility details (${match.match_score || 0}%)`"
                >
                  <span>{{ match.match_score || '—' }}%</span>
                </button>
              </td>
              <td class="py-4 px-3 align-top pt-5">
                <div class="flex items-center gap-2">
                  <span class="badge" :class="getStatusClass(match.status)">
                    {{ formatStatus(match.status) }}
                  </span>
                  <button 
                    @click="openPaymentDetailsModal(match)"
                    class="text-stone-400 hover:text-stone-600 p-1 rounded hover:bg-stone-100 transition-colors"
                    title="View Payment Details"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </button>
                </div>
                <div v-if="match.status === 'pending_payment'" class="text-xs text-stone-400 mt-1 pl-1">
                  GH₵{{ match.unlock_price }}
                </div>
              </td>
              <td class="py-4 px-3 align-top pt-5">
                <span class="badge" :class="getFeedbackClass(match.feedback_status)">
                  {{ formatFeedbackStatus(match.feedback_status) }}
                </span>
                <div v-if="match.feedback_updated_at" class="text-[10px] text-stone-400 mt-1 pl-1">
                  {{ new Date(match.feedback_updated_at).toLocaleDateString() }}
                </div>
              </td>
              <td class="py-4 px-3 text-right align-top pt-4">
                <div class="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <!-- Actions (Compact) -->
                  <button 
                    v-if="match.status === 'unlocked'"
                    class="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded" 
                    @click="openFeedbackModal(match)"
                    title="Collect Feedback"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </button>

                  <button 
                    v-if="match.status === 'unlocked'"
                    class="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded" 
                    @click="openRequestModal(match)"
                    title="Send SMS Request"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </button>
                  
                  <button 
                    v-if="match.status === 'pending_payment'"
                    class="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded" 
                    @click="sendPaymentReminder(match)"
                    :disabled="sendingPaymentReminder"
                    title="Send Payment Reminder SMS"
                  >
                    <span v-if="sendingPaymentReminder" class="animate-spin text-[10px]">⏳</span>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  </button>
                  
                  <button 
                    v-if="match.status !== 'unlocked'"
                    class="btn-primary !py-1 !px-2 !text-xs bg-green-600 hover:bg-green-700 border-none text-white shadow-none" 
                    @click="unlockMatch(match)"
                    title="Mark as Paid/Unlocked"
                  >
                    Unlock
                  </button>
                  
                  <button 
                    class="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                    @click="confirmDelete(match)"
                    title="Delete Match"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Matches Card View (Mobile) -->
      <div class="md:hidden">
        <div v-if="loading" class="text-center py-12 text-stone-400">
           <div class="flex flex-col items-center gap-3">
             <div class="animate-spin h-6 w-6 border-2 border-stone-200 border-t-stone-500 rounded-full"></div>
             <span>Loading matches...</span>
           </div>
        </div>
        <div v-else-if="filteredMatches.length === 0" class="text-center py-12 text-stone-400">
           <div class="flex flex-col items-center gap-2">
             <svg class="text-stone-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
             <span>No matches found</span>
           </div>
        </div>
        <div v-else class="divide-y divide-stone-100">
           <div v-for="match in filteredMatches" :key="match.id" class="p-4 bg-white">
             <!-- Header -->
             <div class="flex justify-between items-start mb-4">
               <div>
                  <div class="text-xs text-stone-500 mb-1">{{ formatDate(match.created_at) }}</div>
                  <span class="badge" :class="getStatusClass(match.status)">{{ formatStatus(match.status) }}</span>
               </div>
               <div class="flex flex-col items-end gap-1">
                  <button 
                    @click="openCompatibilityModal(match)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                    :class="getScoreClass(match.match_score)"
                  >
                    <span>{{ match.match_score || '—' }}</span>
                    <svg v-if="match.match_score" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <span class="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Score</span>
               </div>
             </div>

             <!-- Participants -->
             <div class="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4">
                <!-- User 1 -->
                <div class="flex-1 min-w-0 text-center">
                   <div class="h-10 w-10 mx-auto rounded-full bg-stone-200 flex items-center justify-center overflow-hidden border border-white shadow-sm mb-2">
                      <img v-if="match.user_1?.photo_url" :src="match.user_1.photo_url" class="h-full w-full object-cover" />
                      <span v-else>{{ match.user_1?.display_name?.charAt(0) || '?' }}</span>
                   </div>
                   <div class="text-xs font-bold text-stone-900 truncate px-1">{{ match.user_1?.display_name }}</div>
                </div>

                <!-- Vs/Icon -->
                <div class="text-stone-300">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>

                <!-- User 2 -->
                <div class="flex-1 min-w-0 text-center">
                   <div class="h-10 w-10 mx-auto rounded-full bg-stone-200 flex items-center justify-center overflow-hidden border border-white shadow-sm mb-2">
                      <img v-if="match.user_2?.photo_url" :src="match.user_2.photo_url" class="h-full w-full object-cover" />
                      <span v-else>{{ match.user_2?.display_name?.charAt(0) || '?' }}</span>
                   </div>
                   <div class="text-xs font-bold text-stone-900 truncate px-1">{{ match.user_2?.display_name }}</div>
                </div>
             </div>

             <!-- Feedback Status (if applicable) -->
             <div class="flex items-center justify-between mb-4 px-1">
                <span class="text-xs font-medium text-stone-500">Feedback:</span>
                <span class="badge" :class="getFeedbackClass(match.feedback_status)">
                  {{ formatFeedbackStatus(match.feedback_status) }}
                </span>
             </div>

             <!-- Actions Grid -->
             <div class="grid grid-cols-2 gap-2">
                 <button 
                  v-if="match.status === 'unlocked'"
                  class="btn-secondary justify-center !py-2 !text-xs text-purple-600 bg-purple-50 border-purple-100" 
                  @click="openFeedbackModal(match)"
                 >
                   Feedback
                 </button>

                 <button 
                  v-if="match.status === 'unlocked'"
                  class="btn-secondary justify-center !py-2 !text-xs text-blue-600 bg-blue-50 border-blue-100" 
                  @click="openRequestModal(match)"
                 >
                   SMS Request
                 </button>
                 
                 <button 
                    v-if="match.status === 'pending_payment'"
                    class="btn-secondary justify-center !py-2 !text-xs text-rose-600 bg-rose-50 border-rose-100 w-full col-span-2" 
                    @click="sendPaymentReminder(match)"
                    :disabled="sendingPaymentReminder"
                  >
                    Send Reminder
                  </button>
                  
                  <button 
                    v-if="match.status !== 'unlocked'"
                    class="btn-primary justify-center !py-2 !text-xs bg-green-600 border-none text-white w-full col-span-2" 
                    @click="unlockMatch(match)"
                  >
                    Unlock Match
                  </button>
                  
                  <button 
                    class="btn-secondary justify-center !py-2 !text-xs text-red-600 hover:bg-red-50 border-stone-200 w-full col-span-2" 
                    @click="confirmDelete(match)"
                  >
                    Delete Match
                  </button>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="modal-overlay" @click.self="showFeedbackModal = false">
        <div class="modal animate-in fade-in zoom-in duration-200">
          <div class="modal__header">
            <div>
              <h3 class="modal__title">Collect Match Feedback</h3>
              <p class="text-sm text-stone-500 mt-1">
                {{ selectedMatch?.user_1?.display_name }} × {{ selectedMatch?.user_2?.display_name }}
              </p>
            </div>
            <button class="modal__close" @click="showFeedbackModal = false">×</button>
          </div>
          
          <div class="modal__content">
            <!-- Feedback Status -->
            <div class="mb-6">
              <label class="form-label">Feedback Status</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  v-for="status in feedbackOptions" 
                  :key="status.value"
                  @click="feedbackForm.status = status.value"
                  :class="[
                    'px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left flex items-center gap-2',
                    feedbackForm.status === status.value 
                      ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500' 
                      : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50'
                  ]"
                >
                  <span>{{ status.icon }}</span>
                  <span>{{ status.label }}</span>
                </button>
              </div>
            </div>
            
            <!-- Contact Tracking -->
            <div class="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <label class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 block">Engagement</label>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" v-model="feedbackForm.user1Contacted" class="rounded border-stone-300 text-purple-600 focus:ring-purple-500 h-4 w-4">
                  <span class="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">{{ selectedMatch?.user_1?.display_name }} was contacted</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" v-model="feedbackForm.user2Contacted" class="rounded border-stone-300 text-purple-600 focus:ring-purple-500 h-4 w-4">
                  <span class="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">{{ selectedMatch?.user_2?.display_name }} was contacted</span>
                </label>
                <div class="h-px bg-stone-200 my-2"></div>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" v-model="feedbackForm.contactExchanged" class="rounded border-stone-300 text-purple-600 focus:ring-purple-500 h-4 w-4">
                  <span class="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Contact information was exchanged</span>
                </label>
              </div>
            </div>
            
            <!-- User Notes (Read Only) -->
            <div v-if="selectedMatch?.user_notes" class="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-3">
              <label class="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                <span class="text-lg">👤</span> User Feedback
              </label>
              <p class="text-sm text-stone-700 italic">"{{ selectedMatch.user_notes }}"</p>
            </div>
            
            <!-- Notes -->
            <div class="mb-2">
              <label class="form-label">Notes</label>
              <textarea 
                v-model="feedbackForm.notes"
                placeholder="Add any notes about this match outcome..."
                rows="3"
                class="form-input !h-auto !py-2 resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="modal__footer">
            <button 
              @click="showFeedbackModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              @click="saveFeedback"
              :disabled="savingFeedback"
              class="btn-primary !bg-purple-600 hover:!bg-purple-700 !border-none"
            >
              <span v-if="savingFeedback" class="mr-2 animate-spin">⌛</span>
              Save Feedback
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Request Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackRequestModal" class="modal-overlay" @click.self="showFeedbackRequestModal = false">
        <div class="modal max-w-lg">
          <div class="modal__header">
            <h3 class="modal__title flex items-center gap-2">
              <span class="text-xl">📬</span> Request Match Feedback
            </h3>
            <button @click="showFeedbackRequestModal = false" class="text-stone-400 hover:text-stone-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="modal__content">
            <p class="text-stone-600 text-sm mb-6">Send SMS notifications to matched users requesting feedback on their connections. This helps track success rates.</p>
            
            <!-- Options -->
            <div class="space-y-4">
              <div v-if="targetMatchIds.length === 0">
                <label class="form-label">Days Since Unlock</label>
                <select v-model="feedbackRequestForm.daysSinceUnlock" class="form-select">
                  <option :value="0">0+ days (Immediate / Testing)</option>
                  <option :value="1">1+ days ago</option>
                  <option :value="3">3+ days ago (recommended)</option>
                  <option :value="7">7+ days ago</option>
                  <option :value="14">14+ days ago</option>
                </select>
                <p class="text-xs text-stone-400 mt-1">Only notify users whose matches were unlocked at least this many days ago.</p>
              </div>
              <div v-else class="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                 <div class="text-2xl">🎯</div>
                 <div>
                   <div class="text-xs font-bold text-blue-600 uppercase tracking-wider">Targeted Request</div>
                   <p class="text-sm text-blue-900 font-medium">Sending SMS request to 1 specific match only.</p>
                 </div>
              </div>
              
              <div>
                <label class="form-label">Custom Message (optional)</label>
                <textarea 
                  v-model="feedbackRequestForm.customMessage"
                  placeholder="Leave blank for default message. Use {name} for user name, {partner} for match name."
                  rows="3"
                  class="form-input !h-auto !py-2 resize-none"
                ></textarea>
              </div>
              
              <!-- Preview Default Message -->
              <div class="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div class="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Default Message Preview</div>
                <p class="text-sm text-purple-900 italic">
                  "Hey [Name]! How's it going with [Partner]? Let us know here: minutes2match.com/me/connection/[matchId]"
                </p>
                <p class="text-[10px] text-purple-500 mt-2">Use {name}, {partner}, and {link} in custom messages for personalization.</p>
              </div>
            </div>
            
            <!-- Results Preview -->
            <div v-if="feedbackRequestPreview" class="mt-6 bg-stone-50 rounded-lg p-4 border border-stone-200">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-stone-800">Preview Results</span>
                <span class="text-xs text-stone-500">Dry run completed</span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-stone-900">{{ feedbackRequestPreview.totalMatches }}</div>
                  <div class="text-xs text-stone-500 uppercase tracking-wider">Matches</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-600">{{ feedbackRequestPreview.totalNotifications }}</div>
                  <div class="text-xs text-stone-500 uppercase tracking-wider">SMS to Send</div>
                </div>
              </div>
            </div>
            
            <!-- Send Results -->
            <div v-if="feedbackRequestResult" class="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex items-center gap-2 text-green-800 font-bold mb-2">
                <span>✅</span> Notifications Sent
              </div>
              <div class="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-green-700">{{ feedbackRequestResult.sent }}</div>
                  <div class="text-xs text-green-600 uppercase tracking-wider">Sent</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-red-600">{{ feedbackRequestResult.failed }}</div>
                  <div class="text-xs text-red-500 uppercase tracking-wider">Failed</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal__footer">
            <button 
              @click="previewFeedbackRequest"
              :disabled="sendingFeedbackRequest"
              class="btn-secondary"
            >
              <span v-if="sendingFeedbackRequest && !feedbackRequestPreview" class="mr-2 animate-spin">⌛</span>
              Preview
            </button>
            <button 
              @click="sendFeedbackRequest"
              :disabled="sendingFeedbackRequest || !feedbackRequestPreview"
              class="btn-primary !bg-purple-600 hover:!bg-purple-700 !border-none"
            >
              <span v-if="sendingFeedbackRequest && feedbackRequestPreview" class="mr-2 animate-spin">⌛</span>
              Send {{ feedbackRequestPreview?.totalNotifications || 0 }} SMS
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Payment Details Modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
        <div class="modal max-w-lg animate-in fade-in zoom-in duration-200">
          <div class="modal__header">
            <div>
              <h3 class="modal__title flex items-center gap-2">
                <span class="text-xl">💳</span> Payment & Subscription Details
              </h3>
              <p class="text-sm text-stone-500 mt-1">
                Match created {{ paymentModalMatch ? formatDate(paymentModalMatch.created_at) : '' }}
              </p>
            </div>
            <button @click="showPaymentModal = false" class="text-stone-400 hover:text-stone-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="modal__content" v-if="paymentModalMatch">
            <!-- Match Price -->
            <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-stone-600">Unlock Price</span>
                <span class="text-xl font-bold text-stone-900">GH₵{{ paymentModalMatch.unlock_price || 15 }}</span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-sm font-medium text-stone-600">Status</span>
                <span class="badge" :class="getStatusClass(paymentModalMatch.status)">
                  {{ formatStatus(paymentModalMatch.status) }}
                </span>
              </div>
            </div>

            <!-- User 1 Details -->
            <div class="border border-stone-200 rounded-xl overflow-hidden mb-4">
              <div class="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                  <img v-if="paymentModalMatch.user_1?.photo_url" :src="paymentModalMatch.user_1.photo_url" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-stone-500">{{ paymentModalMatch.user_1?.display_name?.charAt(0) || '?' }}</span>
                </div>
                <div>
                  <div class="font-bold text-stone-900">{{ paymentModalMatch.user_1?.display_name || 'User 1' }}</div>
                  <div class="text-xs text-stone-500 font-mono">{{ paymentModalMatch.user_1?.phone }}</div>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <!-- Subscription Status -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-stone-600">Subscription</span>
                  <span v-if="getSubscriptionStatus(paymentModalMatch.user_1).active" class="badge badge--green flex items-center gap-1">
                    <span>👑</span> {{ getSubscriptionStatus(paymentModalMatch.user_1).plan }}
                  </span>
                  <span v-else class="badge badge--gray">No Subscription</span>
                </div>
                <!-- Free Unlock Status -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-stone-600">Free First Unlock</span>
                  <span v-if="!paymentModalMatch.user_1?.has_used_free_unlock" class="badge badge--blue flex items-center gap-1">
                    <span>🎁</span> Available
                  </span>
                  <span v-else class="badge badge--gray">Used</span>
                </div>
                <!-- Payment Required -->
                <div class="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span class="text-sm font-medium text-stone-900">Payment Required</span>
                  <span v-if="requiresPayment(paymentModalMatch.user_1)" class="text-rose-600 font-bold text-sm">GH₵{{ paymentModalMatch.unlock_price || 15 }}</span>
                  <span v-else class="text-emerald-600 font-bold text-sm flex items-center gap-1">✓ Covered</span>
                </div>
              </div>
            </div>

            <!-- User 2 Details -->
            <div class="border border-stone-200 rounded-xl overflow-hidden">
              <div class="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                  <img v-if="paymentModalMatch.user_2?.photo_url" :src="paymentModalMatch.user_2.photo_url" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-stone-500">{{ paymentModalMatch.user_2?.display_name?.charAt(0) || '?' }}</span>
                </div>
                <div>
                  <div class="font-bold text-stone-900">{{ paymentModalMatch.user_2?.display_name || 'User 2' }}</div>
                  <div class="text-xs text-stone-500 font-mono">{{ paymentModalMatch.user_2?.phone }}</div>
                </div>
              </div>
              <div class="p-4 space-y-3">
                <!-- Subscription Status -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-stone-600">Subscription</span>
                  <span v-if="getSubscriptionStatus(paymentModalMatch.user_2).active" class="badge badge--green flex items-center gap-1">
                    <span>👑</span> {{ getSubscriptionStatus(paymentModalMatch.user_2).plan }}
                  </span>
                  <span v-else class="badge badge--gray">No Subscription</span>
                </div>
                <!-- Free Unlock Status -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-stone-600">Free First Unlock</span>
                  <span v-if="!paymentModalMatch.user_2?.has_used_free_unlock" class="badge badge--blue flex items-center gap-1">
                    <span>🎁</span> Available
                  </span>
                  <span v-else class="badge badge--gray">Used</span>
                </div>
                <!-- Payment Required -->
                <div class="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span class="text-sm font-medium text-stone-900">Payment Required</span>
                  <span v-if="requiresPayment(paymentModalMatch.user_2)" class="text-rose-600 font-bold text-sm">GH₵{{ paymentModalMatch.unlock_price || 15 }}</span>
                  <span v-else class="text-emerald-600 font-bold text-sm flex items-center gap-1">✓ Covered</span>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Summary</div>
              <p class="text-sm text-amber-900">
                <template v-if="paymentModalMatch.status === 'unlocked'">
                  ✅ This match is <strong>already unlocked</strong>. Both users have full access.
                </template>
                <template v-else-if="!requiresPayment(paymentModalMatch.user_1) || !requiresPayment(paymentModalMatch.user_2)">
                  <template v-if="!requiresPayment(paymentModalMatch.user_1) && !requiresPayment(paymentModalMatch.user_2)">
                    Both users have benefits (subscription or free unlock) — match can be unlocked at no cost!
                  </template>
                  <template v-else-if="!requiresPayment(paymentModalMatch.user_1)">
                    <strong>{{ paymentModalMatch.user_1?.display_name }}</strong> has benefits. <strong>{{ paymentModalMatch.user_2?.display_name }}</strong> needs to pay.
                  </template>
                  <template v-else>
                    <strong>{{ paymentModalMatch.user_2?.display_name }}</strong> has benefits. <strong>{{ paymentModalMatch.user_1?.display_name }}</strong> needs to pay.
                  </template>
                </template>
                <template v-else>
                  Both users need to pay GH₵{{ paymentModalMatch.unlock_price || 15 }} each to unlock this match.
                </template>
              </p>
            </div>
          </div>
          
          <div class="modal__footer">
            <button @click="showPaymentModal = false" class="btn-secondary">
              Close
            </button>
            <button 
              v-if="paymentModalMatch?.status !== 'unlocked'"
              @click="unlockMatch(paymentModalMatch); showPaymentModal = false"
              class="btn-primary !bg-green-600 hover:!bg-green-700 !border-none"
            >
              Force Unlock
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Compatibility Breakdown Modal -->
    <Teleport to="body">
      <div v-if="showCompatibilityModal" class="modal-overlay" @click.self="showCompatibilityModal = false">
        <div class="modal max-w-lg animate-in fade-in zoom-in duration-200">
          <div class="modal__header">
            <div>
              <h3 class="modal__title flex items-center gap-2">
                <span class="text-xl">💕</span> Compatibility Breakdown
              </h3>
              <p class="text-sm text-stone-500 mt-1">
                {{ compatibilityMatch?.user_1?.display_name }} × {{ compatibilityMatch?.user_2?.display_name }}
              </p>
            </div>
            <button @click="showCompatibilityModal = false" class="text-stone-400 hover:text-stone-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="modal__content" v-if="compatibilityMatch">
            <!-- Score Display -->
            <div class="text-center mb-6">
              <div 
                class="inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-black"
                :class="getScoreClass(compatibilityMatch.match_score)"
              >
                {{ compatibilityMatch.match_score || '—' }}
              </div>
              <p class="text-stone-500 text-sm mt-2">Compatibility Score</p>
            </div>

            <!-- Positive Reasons -->
            <div v-if="compatibilityMatch.match_reasons?.length" class="mb-6">
              <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>✓</span> Compatibility Strengths
              </div>
              <div class="space-y-2">
                <div 
                  v-for="(reason, idx) in compatibilityMatch.match_reasons" 
                  :key="idx"
                  class="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-emerald-800 text-sm"
                >
                  <span class="text-emerald-500">•</span>
                  {{ reason }}
                </div>
              </div>
            </div>

            <!-- Warnings -->
            <div v-if="compatibilityMatch.match_warnings?.length" class="mb-6">
              <div class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>⚠</span> Potential Concerns
              </div>
              <div class="space-y-2">
                <div 
                  v-for="(warning, idx) in compatibilityMatch.match_warnings" 
                  :key="idx"
                  class="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-amber-800 text-sm"
                >
                  <span class="text-amber-500">•</span>
                  {{ warning }}
                </div>
              </div>
            </div>

            <!-- No Data -->
            <div v-if="!compatibilityMatch.match_reasons?.length && !compatibilityMatch.match_warnings?.length" class="text-center py-6 text-stone-400">
              <p class="text-sm">No compatibility data available for this match.</p>
              <p class="text-xs mt-1">This match may have been created before scoring was implemented.</p>
            </div>

            <!-- Payment Reminder Section (for pending matches) -->
            <div v-if="compatibilityMatch.status === 'pending_payment'" class="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-4">
              <div class="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>💳</span> Payment Pending
              </div>
              <p class="text-sm text-rose-800 mb-3">
                This match is waiting for payment (GH₵{{ compatibilityMatch.unlock_price }}).
              </p>
              <div class="flex items-center gap-3">
                <button 
                  @click="sendPaymentReminder(compatibilityMatch)"
                  :disabled="sendingPaymentReminder"
                  class="btn-primary !bg-rose-600 hover:!bg-rose-700 !border-none !py-2 !text-xs flex items-center gap-2"
                >
                  <span v-if="sendingPaymentReminder" class="animate-spin">⏳</span>
                  <span v-else>📲</span>
                  Send Payment Reminder
                </button>
                <span v-if="paymentReminderSuccess" class="text-emerald-600 text-xs font-bold">
                  ✓ Sent!
                </span>
              </div>
              <p v-if="compatibilityMatch.payment_reminder_count" class="text-[10px] text-rose-500 mt-2">
                {{ compatibilityMatch.payment_reminder_count }} reminder(s) sent • 
                Last: {{ compatibilityMatch.last_payment_reminder_at ? formatDate(compatibilityMatch.last_payment_reminder_at) : 'Never' }}
              </p>
            </div>
          </div>
          
          <div class="modal__footer">
            <button @click="showCompatibilityModal = false" class="btn-secondary">
              Close
            </button>
            <button 
              @click="openPaymentDetailsModal(compatibilityMatch); showCompatibilityModal = false"
              class="btn-primary !bg-stone-800 hover:!bg-stone-900 !border-none"
            >
              View Payment Details
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

// State
const matches = ref<any[]>([])
const loading = ref(true)
const filters = reactive({
  status: '',
  feedbackStatus: '',
  search: ''
})

// Feedback Modal State
const showFeedbackModal = ref(false)
const selectedMatch = ref<any>(null)
const savingFeedback = ref(false)
const feedbackForm = reactive({
  status: 'pending' as string,
  user1Contacted: false,
  user2Contacted: false,
  contactExchanged: false,
  notes: ''
})

const feedbackOptions = [
  { value: 'pending', label: 'Pending', icon: '⏳' },
  { value: 'connected', label: 'Connected', icon: '🤝' },
  { value: 'no_response', label: 'No Response', icon: '📵' },
  { value: 'unmatched', label: 'Unmatched', icon: '❌' },
  { value: 'dating', label: 'Dating', icon: '💕' }
]

// Request Feedback Modal State
const showFeedbackRequestModal = ref(false)
const sendingFeedbackRequest = ref(false)
const feedbackRequestPreview = ref<{ totalMatches: number; totalNotifications: number; users?: any[] } | null>(null)
const feedbackRequestResult = ref<{ sent: number; failed: number } | null>(null)
const targetMatchIds = ref<string[]>([]) // For targeting specific matches
const feedbackRequestForm = reactive({
  daysSinceUnlock: 3,
  customMessage: ''
})

// Payment Details Modal State
const showPaymentModal = ref(false)
const paymentModalMatch = ref<any>(null)

const openPaymentDetailsModal = (match: any) => {
  paymentModalMatch.value = match
  showPaymentModal.value = true
}

const getSubscriptionStatus = (user: any): { active: boolean; plan: string } => {
  if (!user) return { active: false, plan: '' }
  
  const now = new Date()
  const subEnd = user.subscription_ends_at ? new Date(user.subscription_ends_at) : null
  
  if (subEnd && subEnd > now) {
    // Determine plan name based on subscription type
    const planMap: Record<string, string> = {
      'monthly_unlimited': 'Monthly Unlimited',
      'weekly_unlimited': 'Weekly Unlimited',
      'premium': 'Premium'
    }
    return { 
      active: true, 
      plan: planMap[user.subscription_type] || user.subscription_type || 'Active' 
    }
  }
  
  return { active: false, plan: '' }
}

const requiresPayment = (user: any): boolean => {
  if (!user) return true
  
  // User has free unlock available
  if (!user.has_used_free_unlock) return false
  
  // User has active subscription
  if (getSubscriptionStatus(user).active) return false
  
  // User needs to pay
  return true
}

// Compatibility Modal State
const showCompatibilityModal = ref(false)
const compatibilityMatch = ref<any>(null)

const openCompatibilityModal = (match: any) => {
  compatibilityMatch.value = match
  showCompatibilityModal.value = true
}

const getScoreClass = (score: number | null | undefined): string => {
  if (!score) return 'bg-stone-100 text-stone-500'
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
  if (score >= 60) return 'bg-green-100 text-green-700 hover:bg-green-200'
  if (score >= 40) return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
  return 'bg-red-100 text-red-700 hover:bg-red-200'
}

// Payment Reminder
const sendingPaymentReminder = ref(false)
const paymentReminderSuccess = ref(false)

const sendPaymentReminder = async (match: any) => {
  if (!match || sendingPaymentReminder.value) return
  
  sendingPaymentReminder.value = true
  paymentReminderSuccess.value = false
  
  try {
    const { sendSMS } = useHubtel()
    const promises: Promise<any>[] = []
    
    // Helper to generate personalized message based on user status
    const getPersonalizedMessage = (user: any, partner: any): string => {
      const partnerName = partner?.display_name || 'your match'
      
      // Check if user has free unlock available
      if (!user?.has_used_free_unlock) {
        return `Great news! 🎁 Your first match unlock is FREE! Log in to Minutes 2 Match to unlock ${partnerName}'s profile and start connecting. 💕 - M2Match`
      }
      
      // Check if user has active subscription
      const subStatus = getSubscriptionStatus(user)
      if (subStatus.active) {
        return `Reminder: You've been matched with ${partnerName} on Minutes 2 Match! As a ${subStatus.plan} subscriber, you can unlock their profile for free. Log in now! 💕 - M2Match`
      }
      
      // User needs to pay
      return `Reminder: You've been matched on Minutes 2 Match! Pay GH₵${match.unlock_price} to unlock ${partnerName}'s profile and start connecting. 💕 - M2Match`
    }
    
    // Send personalized message to users who haven't paid
    if (!match.user_1_paid && match.user_1?.phone) {
      const msg = getPersonalizedMessage(match.user_1, match.user_2)
      promises.push(sendSMS(match.user_1.phone, msg))
    }
    if (!match.user_2_paid && match.user_2?.phone) {
      const msg = getPersonalizedMessage(match.user_2, match.user_1)
      promises.push(sendSMS(match.user_2.phone, msg))
    }
    
    if (promises.length === 0) {
      alert('No users to remind - both have already paid or no phone numbers available.')
      sendingPaymentReminder.value = false
      return
    }
    
    await Promise.all(promises)
    
    // Update reminder tracking in database
    await (supabase
      .from('matches') as any)
      .update({ 
        last_payment_reminder_at: new Date().toISOString(),
        payment_reminder_count: (match.payment_reminder_count || 0) + 1
      } as any)
      .eq('id', match.id)
    
    // Update local state
    const index = matches.value.findIndex(m => m.id === match.id)
    if (index !== -1) {
      matches.value[index].last_payment_reminder_at = new Date().toISOString()
      matches.value[index].payment_reminder_count = (match.payment_reminder_count || 0) + 1
    }
    
    paymentReminderSuccess.value = true
    setTimeout(() => { paymentReminderSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Failed to send payment reminder:', err)
    alert('Failed to send reminder SMS')
  } finally {
    sendingPaymentReminder.value = false
  }
}

const openRequestModal = (match?: any) => {
  if (match) {
    targetMatchIds.value = [match.id]
  } else {
    targetMatchIds.value = []
  }
  feedbackRequestPreview.value = null
  feedbackRequestResult.value = null
  showFeedbackRequestModal.value = true
}

const previewFeedbackRequest = async () => {
  sendingFeedbackRequest.value = true
  feedbackRequestPreview.value = null
  feedbackRequestResult.value = null
  
  try {
    const result = await $fetch('/api/admin/request-match-feedback', {
      method: 'POST',
      body: {
        dryRun: true,
        daysSinceUnlock: feedbackRequestForm.daysSinceUnlock,
        matchIds: targetMatchIds.value.length ? targetMatchIds.value : undefined,
        message: feedbackRequestForm.customMessage || undefined
      }
    })
    
    feedbackRequestPreview.value = {
      totalMatches: (result as any).totalMatches,
      totalNotifications: (result as any).totalNotifications,
      users: (result as any).users
    }
  } catch (error) {
    console.error('Preview failed:', error)
    alert('Failed to preview. Please try again.')
  } finally {
    sendingFeedbackRequest.value = false
  }
}

const sendFeedbackRequest = async () => {
  if (!feedbackRequestPreview.value) return
  
  sendingFeedbackRequest.value = true
  feedbackRequestResult.value = null
  
  try {
    const result = await $fetch('/api/admin/request-match-feedback', {
      method: 'POST',
      body: {
        dryRun: false,
        daysSinceUnlock: feedbackRequestForm.daysSinceUnlock,
        matchIds: targetMatchIds.value.length ? targetMatchIds.value : undefined,
        message: feedbackRequestForm.customMessage || undefined
      }
    })
    
    feedbackRequestResult.value = {
      sent: (result as any).sent,
      failed: (result as any).failed
    }
    
    // Reset preview after successful send
    feedbackRequestPreview.value = null
  } catch (error) {
    console.error('Send failed:', error)
    alert('Failed to send notifications. Please try again.')
  } finally {
    sendingFeedbackRequest.value = false
  }
}

// Fetch matches
const fetchMatches = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_1:profiles!matches_user_1_id_fkey(*),
        user_2:profiles!matches_user_2_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    matches.value = data || []
  } catch (e) {
    console.error('Error fetching matches:', e)
  } finally {
    loading.value = false
  }
}

// Computed
const filteredMatches = computed(() => {
  return matches.value.filter(m => {
    // Filter by status
    if (filters.status && m.status !== filters.status) return false
    
    // Filter by feedback status
    if (filters.feedbackStatus && (m.feedback_status || 'pending') !== filters.feedbackStatus) return false
    
    // Filter by search (name of either user)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const u1Name = (m.user_1?.display_name || '').toLowerCase()
      const u2Name = (m.user_2?.display_name || '').toLowerCase()
      const u1Phone = (m.user_1?.phone || '')
      const u2Phone = (m.user_2?.phone || '')
      
      if (!u1Name.includes(q) && !u2Name.includes(q) && !u1Phone.includes(q) && !u2Phone.includes(q)) {
        return false
      }
    }
    
    return true
  })
})

// Feedback stats for unlocked matches
const feedbackStats = computed(() => {
  const unlockedMatches = matches.value.filter(m => m.status === 'unlocked')
  return {
    total: unlockedMatches.length,
    pending: unlockedMatches.filter(m => !m.feedback_status || m.feedback_status === 'pending').length,
    connected: unlockedMatches.filter(m => m.feedback_status === 'connected').length,
    dating: unlockedMatches.filter(m => m.feedback_status === 'dating').length,
    noResponse: unlockedMatches.filter(m => m.feedback_status === 'no_response').length
  }
})

// Helpers
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: 'Pending Payment',
    partial_payment: 'Partial Payment',
    unlocked: 'Unlocked',
    rejected: 'Rejected',
    expired: 'Expired'
  }
  return map[status] || status.replace('_', ' ')
}

const formatFeedbackStatus = (status: string | null) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    connected: 'Connected',
    no_response: 'No Response',
    unmatched: 'Unmatched',
    dating: 'Dating 💕'
  }
  return map[status || 'pending'] || status || 'Pending'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'unlocked': return 'badge--green'
    case 'partial_payment': return 'badge--blue'
    case 'pending_payment': return 'badge--yellow'
    case 'rejected': return 'badge--red'
    default: return 'badge--gray'
  }
}

const getFeedbackClass = (status: string | null) => {
  switch (status) {
    case 'connected': return 'badge--green'
    case 'dating': return 'badge--pink'
    case 'no_response': return 'badge--red'
    case 'unmatched': return 'badge--gray'
    default: return 'badge--yellow'
  }
}

// Actions
const openFeedbackModal = (match: any) => {
  selectedMatch.value = match
  feedbackForm.status = match.feedback_status || 'pending'
  feedbackForm.user1Contacted = match.user_1_contacted || false
  feedbackForm.user2Contacted = match.user_2_contacted || false
  feedbackForm.contactExchanged = match.contact_exchanged || false
  feedbackForm.notes = match.feedback_notes || ''
  showFeedbackModal.value = true
}

const saveFeedback = async () => {
  if (!selectedMatch.value) return
  
  savingFeedback.value = true
  try {
    const { error } = await (supabase
      .from('matches') as any)
      .update({
        feedback_status: feedbackForm.status,
        user_1_contacted: feedbackForm.user1Contacted,
        user_2_contacted: feedbackForm.user2Contacted,
        contact_exchanged: feedbackForm.contactExchanged,
        feedback_notes: feedbackForm.notes,
        feedback_updated_at: new Date().toISOString()
      })
      .eq('id', selectedMatch.value.id)

    if (error) throw error

    // Update local state
    const index = matches.value.findIndex(m => m.id === selectedMatch.value.id)
    if (index !== -1) {
      matches.value[index] = {
        ...matches.value[index],
        feedback_status: feedbackForm.status,
        user_1_contacted: feedbackForm.user1Contacted,
        user_2_contacted: feedbackForm.user2Contacted,
        contact_exchanged: feedbackForm.contactExchanged,
        feedback_notes: feedbackForm.notes,
        feedback_updated_at: new Date().toISOString()
      }
    }
    
    showFeedbackModal.value = false
  } catch (e) {
    alert('Failed to save feedback')
    console.error(e)
  } finally {
    savingFeedback.value = false
  }
}

const unlockMatch = async (match: any) => {
  if (!confirm('Are you sure you want to mark this match as UNLOCKED? This grants full access to the users.')) return

  try {
    const { error } = await (supabase
      .from('matches') as any)
      .update({ status: 'unlocked' })
      .eq('id', match.id)

    if (error) throw error

    // Update local state
    const index = matches.value.findIndex(m => m.id === match.id)
    if (index !== -1) {
      matches.value[index].status = 'unlocked'
    }
  } catch (e) {
    alert('Failed to unlock match')
    console.error(e)
  }
}

const confirmDelete = async (match: any) => {
  if (!confirm('Are you sure you want to delete this match? This cannot be undone.')) return
  
  try {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', match.id)
      
    if (error) throw error
    
    matches.value = matches.value.filter(m => m.id !== match.id)
  } catch (e) {
    alert('Failed to delete match')
  }
}

onMounted(() => {
  fetchMatches()
})
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #E5E7EB;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  border-color: #D1D5DB;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  font-family: 'Inter', sans-serif;
}
</style>
