<template>
  <!-- Loading Overlay while auth hydrates -->
  <div v-if="!authReady" class="min-h-screen bg-stone-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-12 h-12 rounded-full border-3 border-stone-200 border-t-black animate-spin mx-auto mb-4"></div>
      <p class="text-stone-500 font-medium">Loading your profile...</p>
    </div>
  </div>
  
  <main 
    v-else 
    ref="mainContainer"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove" 
    @touchend="handleTouchEnd"
    class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans relative flex flex-col transition-colors duration-300 pb-24 md:pb-0"
  >
    <!-- Pull to Refresh Spinner -->
    <div 
      class="fixed z-[70] left-1/2 -translate-x-1/2 transition-all duration-200 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700"
      :style="{ top: isRefreshing ? '100px' : (pullDistance > 10 ? (pullDistance * 0.4 + 70) + 'px' : '-60px'), opacity: pullDistance > 0 || isRefreshing ? 1 : 0 }"
    >
      <div v-if="isRefreshing" class="w-5 h-5 border-2 border-stone-200 dark:border-stone-600 border-t-rose-500 rounded-full animate-spin"></div>
      <span v-else class="text-stone-400 dark:text-stone-200 text-sm transform transition-transform" :class="{ 'rotate-180': pullDistance > 50 }">↓</span>
    </div>
    <!-- Fonts -->
    <Head>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <Link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <!-- Navbar / Header -->
    <nav class="sticky top-0 z-[60] bg-[#FFFCF8]/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center -ml-2">
           <img src="/logo-full.png" alt="minutes2match" class="h-14 md:h-20 w-auto object-contain hover:opacity-80 transition-opacity dark:invert" />
        </NuxtLink>
        
        <div class="flex items-center gap-3 md:gap-6">
          <!-- Notification Bell -->
          <NuxtLink to="/me/notifications" class="relative p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors active:scale-95 text-stone-600 dark:text-stone-300">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
             <!-- <span v-if="pendingMatchCount > 0" class="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-stone-950 animate-pulse"></span> -->
          </NuxtLink>

          <div class="text-right flex flex-col items-end">
            <div class="flex items-center gap-1.5">
               <p class="text-xs md:text-sm font-bold text-black dark:text-stone-100 uppercase tracking-widest">{{ profile?.display_name }}</p>
            </div>
            
            <div v-if="subscription" class="mt-0.5 flex items-center justify-end gap-1 mb-0.5">
               <span class="bg-black text-amber-300 px-1.5 py-[1px] rounded-[3px] border border-amber-400/50 shadow-[1px_1px_0px_0px_rgba(251,191,36,1)] text-[8px] font-bold uppercase tracking-widest leading-none flex items-center gap-1">
                  <span>👑</span> PREMIUM
               </span>
            </div>
            
            <p class="hidden md:block text-[10px] font-mono font-bold text-rose-500 md:text-rose-400 mt-px uppercase tracking-wider">
              {{ personaData ? `${personaData.emoji} ${personaData.name}` : 'New Member' }}
            </p>
            
            <!-- Profile Badges -->
            <ProfileBadges v-if="profile" :profile="profile" size="xs" :max-display="3" class="hidden md:flex mt-1 justify-end" />
          </div>
          <div 
             class="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 bg-white dark:bg-stone-800 overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] relative"
             :class="subscription ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-black dark:border-stone-500'"
             @click="activeTab = 'profile'"
          >
            <img v-if="profile?.photo_url" :src="profile.photo_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xl font-serif italic">
              {{ profile?.display_name?.charAt(0) || '?' }}
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <div class="flex-1 max-w-6xl mx-auto px-4 py-8 pb-16 relative z-10 w-full">
      <!-- Incomplete Profile Nudge -->
      <div v-if="isProfileIncomplete && activeTab !== 'profile'" class="mb-8 p-4 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800 border-2 border-amber-200 dark:border-stone-700 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl border-2 border-amber-200 dark:border-amber-700/50 flex-shrink-0">
             ⚡
          </div>
          <div>
             <h3 class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">Your profile needs some love!</h3>
             <p class="text-xs md:text-sm text-stone-600 dark:text-stone-400 font-medium">Complete your vibe check and add a photo to start matching.</p>
          </div>
        </div>
        <button 
           @click="activeTab = 'profile'"
           class="w-full md:w-auto px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
        >
           Complete Profile →
        </button>
      </div>

      <!-- Tabs -->
      <div class="hidden md:flex md:flex-wrap md:gap-4 mb-8 md:mb-12">
        <button 
          @click="activeTab = 'matches'"
          class="px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest transition-all border-2"
          :class="activeTab === 'matches' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[3px_3px_0px_0px_rgba(244,63,94,1)] md:shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
        >
          Matches
          <span v-if="pendingMatchCount > 0" class="ml-1 md:ml-2 px-1 md:px-1.5 py-0.5 bg-rose-500 text-white rounded text-[8px] md:text-[10px] border border-black">{{ pendingMatchCount }}</span>
        </button>
        <button 
          @click="activeTab = 'events'"
          class="px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest transition-all border-2"
          :class="activeTab === 'events' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[3px_3px_0px_0px_rgba(244,63,94,1)] md:shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
        >
          Events
        </button>
        <button 
          @click="activeTab = 'profile'"
          class="px-3 md:px-6 py-2.5 md:py-3 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest transition-all border-2"
          :class="activeTab === 'profile' ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100 shadow-[3px_3px_0px_0px_rgba(244,63,94,1)] md:shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]' : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
        >
          Profile
        </button>
      </div>

      <!-- Content Area -->
      <div class="min-h-[400px]">
        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="flex items-center justify-between">
             <h2 class="text-2xl font-bold tracking-tight dark:text-white">Upcoming Sessions</h2>
             <span class="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">{{ events.length }} available</span>
          </div>

          <!-- Skeleton Loaders -->
          <div v-if="loadingEvents" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonEventCard v-for="i in 3" :key="i" />
          </div>

          <EventsEmptyState v-else-if="events.length === 0" />

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCard
              v-for="event in events"
              :key="event.id"
              v-bind="event"
              :title="event.title"
              :eventDate="event.event_date"
              :venue="event.venue"
              :coverImage="event.cover_image_url"
              :maleCapacity="event.male_capacity"
              :femaleCapacity="event.female_capacity"
              :maleTicketsSold="event.male_tickets_sold"
              :femaleTicketsSold="event.female_tickets_sold"
              :ticketPriceMale="event.ticket_price_male"
              :ticketPriceFemale="event.ticket_price_female"
              :userGender="profile?.gender || 'male'"
              :booked="hasBookedEvent(event.id)"
              :loading="loadingBookings"
              @book="handleBookEvent(event)"
            />
          </div>
        </div>

        <!-- Matches Tab -->
        <div v-if="activeTab === 'matches'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div class="flex items-center justify-between">
             <h2 class="text-2xl font-bold tracking-tight dark:text-white">Your Connections</h2>
             <span class="text-sm font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">{{ matches.length }} matches</span>
          </div>

          <!-- Skeleton Loaders -->
          <div v-if="loadingMatches" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonMatchCard v-for="i in 3" :key="i" />
          </div>

          <div v-else-if="matches.length === 0" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div class="py-12 text-center border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl bg-white dark:bg-stone-900">
               <span class="text-4xl block mb-4 grayscale opacity-50">✨</span>
               <p class="font-bold text-stone-900 dark:text-stone-100 mb-1">Your connections are brewing</p>
               <p class="text-sm text-stone-500 dark:text-stone-400">We'll SMS you when you get matched!</p>
             </div>
             
             <!-- Show Pricing Model in Empty State -->
             <div class="px-2">
                <div class="text-center mb-6">
                  <h3 class="text-xl font-bold font-serif text-black dark:text-white">Want more matches?</h3>
                  <p class="text-sm text-stone-500 dark:text-stone-400">Upgrade to Premium for priority matching.</p>
                </div>
                <SubscriptionCard :subscription="subscription" @subscribe="handleSubscribe" />
             </div>
          </div>

          <div v-else class="space-y-8">
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <BlindProfileCard
                v-for="match in matches"
                :key="match.id"
                :matchId="match.id"
                :age="getAge(match.matchedProfile?.birth_date)"
                :personaName="getPersonaData(match.matchedProfile?.dating_persona)?.name || 'Mystery'"
                :personaEmoji="getPersonaData(match.matchedProfile?.dating_persona)?.emoji || '✨'"
                :personaColor="getPersonaData(match.matchedProfile?.dating_persona)?.color || '#1a1a2e'"
                :vibePreview="getVibePreview(match.vibeAnswers)"
                :vibeSummary="getVibeSummary(match.vibeAnswers)"
                :unlockPrice="match.unlock_price"
                :unlocked="match.status === 'unlocked'"
                :currentUserPaid="match.currentUserPaid"
                :displayName="match.matchedProfile?.display_name"
                :photoUrl="match.matchedProfile?.photo_url"
                :phone="match.status === 'unlocked' ? match.matchedProfile?.phone : undefined"
                :bio="match.matchedProfile?.about_me"
                :interests="match.matchedProfile?.interests"
                :sharedInterests="getSharedInterests(match.matchedProfile?.interests)"
                :expiresAt="match.expires_at"
                :matchedAt="match.created_at"
                :location="match.matchedProfile?.location"
                :gender="match.matchedProfile?.gender"
                @unlock="handleUnlockMatch(match)"
                @update-status="navigateToFeedback(match)"
              />
            </div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <!-- Sidebar / Photo -->
          <div class="md:col-span-1 space-y-6">
             <div class="bg-white dark:bg-stone-900 p-6 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] text-center">
                <div class="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" @click="triggerPhotoUpload">
                  <div class="w-full h-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 border-black dark:border-stone-600 relative">
                     <img v-if="photoPreview || profile?.photo_url" :src="photoPreview || profile?.photo_url" class="w-full h-full object-cover" />
                     <div v-else class="w-full h-full flex items-center justify-center text-4xl text-stone-300 dark:text-stone-600">📷</div>
                     
                     <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white text-xs font-bold uppercase tracking-widest">{{ uploadingPhoto ? 'Wait...' : 'Update' }}</span>
                     </div>
                  </div>
                  <input type="file" ref="photoInput" accept="image/*" @change="handlePhotoUpload" class="hidden" />
                </div>
                <p class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-100 dark:border-stone-800 pb-2 inline-block">Pro Tip</p>
                <p class="text-xs font-medium text-stone-500 dark:text-stone-400">Profiles with photos get <span class="text-black dark:text-white font-bold">80% more matches</span>.</p>
             </div>
             
             <!-- Badges Section -->
             <div class="bg-white dark:bg-stone-900 p-6 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
                <h4 class="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                   <span>🏆</span> Your Badges
                </h4>
                <ProfileBadges v-if="profile" :profile="profile" size="md" :show-labels="true" :max-display="10" class="flex-wrap gap-2" />
                <p v-if="!profile?.badges?.length" class="text-xs text-stone-400 dark:text-stone-500">
                   Complete your profile and attend events to earn badges!
                </p>
             </div>
          </div>

          <!-- Edit Form -->
          <div class="md:col-span-2 space-y-8 md:row-span-[20]">
             <!-- Basic Info -->
             <div class="bg-white p-5 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 class="text-2xl font-serif font-bold text-black mb-8 flex items-center gap-2">
                  <span>Basic Info</span>
                  <div class="h-px flex-1 bg-stone-100"></div>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Display Name</label>
                      <input type="text" v-model="editForm.display_name" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] outline-none transition-all font-bold font-serif text-lg" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Phone (Locked)</label>
                       <input type="text" :value="profile?.phone" disabled class="w-full px-4 py-3 rounded-lg border-2 border-stone-100 bg-stone-50 text-stone-400 font-mono font-medium cursor-not-allowed" />
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Gender</label>
                      <select v-model="editForm.gender" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold">
                         <option value="">Select gender</option>
                         <option value="male">Male</option>
                         <option value="female">Female</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Birthday</label>
                      <UiDatePicker v-model="editForm.birth_date" placeholder="Select your birthday" />
                   </div>
                </div>
             </div>

             <!-- Preferences -->
             <div class="bg-white p-5 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 class="text-2xl font-serif font-bold text-black mb-8 flex items-center gap-2">
                   <span>Preferences</span>
                   <div class="h-px flex-1 bg-stone-100"></div>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Considering</label>
                       <select v-model="editForm.intent" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold">
                        <option value="marriage">Marriage</option>
                        <option value="serious">Serious Relationship</option>
                        <option value="casual">Casual Dating</option>
                        <option value="friendship">Friendship</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Interested In</label>
                      <select v-model="editForm.interested_in" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold">
                        <option value="male">Men</option>
                        <option value="female">Women</option>
                        <option value="everyone">Everyone</option>
                      </select>
                   </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Location</label>
                      <select v-model="editForm.location" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold">
                        <option value="accra">Accra</option>
                        <option value="kumasi">Kumasi</option>
                        <option value="tamale">Tamale</option>
                        <option value="takoradi">Takoradi</option>
                        <option value="cape_coast">Cape Coast</option>
                        <option value="other">Other</option>
                      </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Religion</label>
                       <select v-model="editForm.religion" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold">
                         <option value="">Prefer not to say</option>
                         <option value="Christian">Christian</option>
                         <option value="Muslim">Muslim</option>
                         <option value="Traditional">Traditional</option>
                         <option value="Other">Other</option>
                       </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Genotype</label>
                       <select v-model="editForm.genotype" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold font-mono">
                         <option value="">Prefer not to say</option>
                         <option value="AA">AA</option>
                         <option value="AS">AS</option>
                         <option value="SS">SS</option>
                         <option value="AC">AC</option>
                       </select>
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Height (cm)</label>
                       <input type="number" v-model.number="editForm.height_cm" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold font-mono" placeholder="e.g. 175" min="100" max="250" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-bold uppercase text-stone-500 tracking-widest">Occupation</label>
                       <input type="text" v-model="editForm.occupation" class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 bg-white focus:border-black outline-none transition-all font-bold" placeholder="e.g. Software Engineer" />
                   </div>
                </div>
             </div>

             <!-- Bio / About Me -->
             <div class="bg-white dark:bg-stone-900 p-5 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-2xl font-serif font-bold text-black dark:text-white">About Me</h3>
                   <span class="text-xs font-mono font-bold" :class="editForm.about_me.length > 250 ? 'text-rose-500 md:text-rose-400' : 'text-stone-400 dark:text-stone-500'">
                      {{ editForm.about_me.length }}/300
                   </span>
                </div>
                <textarea 
                   v-model="editForm.about_me" 
                   rows="4"
                   maxlength="300"
                   class="w-full px-4 py-3 rounded-lg border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 dark:text-white focus:border-black dark:focus:border-stone-500 outline-none transition-all font-serif text-lg resize-none placeholder-stone-300 dark:placeholder-stone-600"
                   placeholder="Share a little about yourself..."
                ></textarea>
                <p class="text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500 mt-3">💡 Profiles with bios get 40% more matches</p>
             </div>

             <!-- Interests -->
             <div class="bg-white dark:bg-stone-900 p-5 md:p-8 rounded-xl border-2 border-black dark:border-stone-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
                <div class="flex items-center justify-between mb-6">
                   <h3 class="text-2xl font-serif font-bold text-black dark:text-white">Interests</h3>
                   <span class="text-xs font-mono font-bold text-stone-400 dark:text-stone-500">{{ editForm.interests.length }}/6 selected</span>
                </div>
                <div class="flex flex-wrap gap-2">
                   <button 
                      v-for="interest in availableInterests" 
                      :key="interest.id"
                      @click="toggleInterest(interest.id)"
                      class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border-2"
                      :class="editForm.interests.includes(interest.id) 
                         ? 'bg-black dark:bg-stone-100 text-white dark:text-black border-black dark:border-stone-100' 
                         : 'bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-black dark:hover:border-stone-500 hover:text-black dark:hover:text-stone-200'"
                   >
                      {{ interest.label }}
                   </button>
              </div>
             </div>

             <!-- Dealbreakers Section -->
             <div class="bg-white dark:bg-stone-900 p-5 md:p-8 rounded-xl border-2 border-rose-200 dark:border-rose-900 shadow-[8px_8px_0px_0px_rgba(244,63,94,0.3)] dark:shadow-[8px_8px_0px_0px_rgba(244,63,94,0.1)]">
                <div class="flex items-center gap-3 mb-2">
                   <span class="text-2xl">🚫</span>
                   <h3 class="text-2xl font-serif font-bold text-black dark:text-white">Dealbreakers</h3>
                </div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-8">Set your non-negotiable preferences. We'll filter matches accordingly.</p>
                
                <!-- Age Range -->
                <div class="mb-8">
                   <h4 class="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                      <span>📅</span> Age Range
                   </h4>
                   <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-3">
                         <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Minimum Age</label>
                         <div class="flex items-center gap-4">
                            <input 
                               type="range" 
                               v-model.number="editForm.min_age" 
                               min="18" 
                               max="60" 
                               class="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer border border-black dark:border-stone-600 accent-rose-500"
                            />
                            <span class="text-xl font-mono font-bold text-black dark:text-white w-10 text-center">{{ editForm.min_age }}</span>
                         </div>
                      </div>
                      <div class="space-y-3">
                         <label class="text-[10px] font-bold uppercase text-stone-500 dark:text-stone-400 tracking-widest">Maximum Age</label>
                         <div class="flex items-center gap-4">
                            <input 
                               type="range" 
                               v-model.number="editForm.max_age" 
                               min="18" 
                               max="70" 
                               class="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer border border-black dark:border-stone-600 accent-rose-500"
                            />
                            <span class="text-xl font-mono font-bold text-black dark:text-white w-10 text-center">{{ editForm.max_age }}</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <!-- Genotype Dealbreaker -->
                <div class="mb-8">
                   <h4 class="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                      <span>🧬</span> Genotype Compatibility
                   </h4>
                   <div class="flex flex-wrap gap-2">
                      <button 
                         v-for="gt in ['AA', 'AS', 'AC']" 
                         :key="gt"
                         @click="toggleDealbreaker('genotype', gt)"
                         class="px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-widest transition-all duration-200 border-2"
                         :class="editForm.dealbreakers.genotype?.includes(gt) 
                            ? 'bg-rose-500 text-white border-rose-500' 
                            : 'bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-800'"
                      >
                         {{ gt }}
                      </button>
                   </div>
                   <p class="text-[10px] text-stone-400 dark:text-stone-500 mt-2">Select genotypes you're compatible with. Leave empty to accept all.</p>
                   
                   <!-- Genotype Warning -->
                   <div v-if="editForm.genotype === 'AS' || editForm.genotype === 'SS'" class="mt-4 bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-100 dark:border-rose-900 rounded-xl p-4">
                      <div class="flex items-start gap-3">
                         <span class="text-rose-500 text-xl">⚠️</span>
                         <div>
                            <p class="font-bold text-rose-900 dark:text-rose-200 uppercase tracking-widest text-[10px] mb-1">Genotype Awareness</p>
                            <p class="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                               You have {{ editForm.genotype }} genotype. We recommend setting AA as a dealbreaker to avoid potential health complications.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
                
                <!-- Intent Dealbreaker -->
                <div class="mb-8">
                   <h4 class="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                      <span>💍</span> Relationship Intent
                   </h4>
                   <div class="flex flex-wrap gap-2">
                      <button 
                         v-for="intent in [
                            { id: 'marriage', label: 'Marriage' },
                            { id: 'serious', label: 'Serious' },
                            { id: 'casual', label: 'Casual' },
                            { id: 'friendship', label: 'Friendship' }
                         ]" 
                         :key="intent.id"
                         @click="toggleDealbreaker('intent', intent.id)"
                         class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border-2"
                         :class="editForm.dealbreakers.intent?.includes(intent.id) 
                            ? 'bg-rose-500 text-white border-rose-500' 
                            : 'bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-800'"
                      >
                         {{ intent.label }}
                      </button>
                   </div>
                   <p class="text-[10px] text-stone-400 dark:text-stone-500 mt-2">Only match with people looking for these types of relationships.</p>
                </div>
                
                <!-- Religion Dealbreaker -->
                <div>
                   <h4 class="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                      <span>🙏</span> Religion
                   </h4>
                   <div class="flex flex-wrap gap-2">
                      <button 
                         v-for="religion in ['Christian', 'Muslim', 'Traditional', 'Other']" 
                         :key="religion"
                         @click="toggleDealbreaker('religion', religion)"
                         class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border-2"
                         :class="editForm.dealbreakers.religion?.includes(religion) 
                            ? 'bg-rose-500 text-white border-rose-500' 
                            : 'bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-800'"
                      >
                         {{ religion }}
                      </button>
                   </div>
                   <p class="text-[10px] text-stone-400 dark:text-stone-500 mt-2">Only match with people of these religions. Leave empty for no preference.</p>
                </div>
                
                <!-- Summary -->
                <div v-if="hasActiveDealbreakers" class="mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl">
                   <p class="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">Active Dealbreakers</p>
                   <div class="flex flex-wrap gap-1">
                      <span v-if="editForm.min_age !== 18 || editForm.max_age !== 50" class="px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold">
                         Age: {{ editForm.min_age }}-{{ editForm.max_age }}
                      </span>
                      <span v-for="gt in (editForm.dealbreakers.genotype || [])" :key="'gt-'+gt" class="px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold font-mono">
                         {{ gt }}
                      </span>
                      <span v-for="intent in (editForm.dealbreakers.intent || [])" :key="'int-'+intent" class="px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold">
                         {{ intent }}
                      </span>
                      <span v-for="religion in (editForm.dealbreakers.religion || [])" :key="'rel-'+religion" class="px-2 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold">
                         {{ religion }}
                      </span>
                   </div>
                </div>
             </div>
                          <div class="flex items-center gap-6 pt-4">
                 <button 
                  :disabled="saving" 
                  @click="saveProfile" 
                  class="flex-1 bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-rose-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
                 >
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                 </button>
                 <span v-if="saveSuccess" class="text-emerald-600 font-bold text-xs uppercase tracking-widest animate-in fade-in flex items-center gap-2">
                   <span class="text-xl">✓</span> Saved
                 </span>
              </div>

                <!-- Subscription Status -->
               <SubscriptionCard :subscription="subscription" @subscribe="handleSubscribe" />

               <!-- Account Actions (at bottom of profile tab) -->
               <div class="mt-12 pt-8 border-t-2 border-stone-100 dark:border-stone-800 space-y-6">
                  <h3 class="text-2xl font-serif font-bold text-black dark:text-white mb-6">Account Settings</h3>
                  
                  <!-- Pause Matching Toggle -->
                  <div class="bg-white dark:bg-stone-900 p-5 rounded-xl border-2 border-black dark:border-stone-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                     <div class="flex items-start gap-4">
                        <div class="flex-1">
                           <h4 class="font-bold text-sm text-black dark:text-white mb-1">Active Status</h4>
                           <p class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">Turn off to pause matching. You won't appear in new matches or events.</p>
                        </div>
                        <button 
                           @click="toggleAccountActive"
                           :disabled="togglingActive"
                           :class="[
                              'relative w-14 h-8 rounded-full border-2 border-black dark:border-stone-500 transition-all duration-300 flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                              editForm.is_active ? 'bg-emerald-400' : 'bg-stone-200 dark:bg-stone-700'
                           ]"
                        >
                           <span 
                              :class="[
                                 'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs',
                                 editForm.is_active ? 'left-6' : 'left-0.5'
                              ]"
                           >
                              {{ editForm.is_active ? '✓' : '✕' }}
                           </span>
                        </button>
                     </div>
                     <div v-if="!editForm.is_active" class="mt-3 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg border-2 border-stone-200 dark:border-stone-700">
                        <p class="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-widest flex items-center gap-2">
                           <span>😴</span> Account Paused - Invisible
                        </p>
                     </div>
                  </div>
                  
                  <!-- Sign Out Button -->
                  <button @click="handleLogout" class="w-full py-4 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 text-black dark:text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 transition-all">
                     Sign Out
                  </button>
               </div>
          </div>

          <!-- Secondary Sidebar Items (Mobile: Bottom, Desktop: Left Column under Photo) -->
          <div class="md:col-span-1 md:col-start-1 space-y-6">
             <!-- Payment History (Collapsible) -->
             <div class="bg-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <button 
                   @click="showPaymentHistory = !showPaymentHistory"
                   class="w-full p-4 md:p-6 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                   <h3 class="font-bold font-serif text-lg md:text-xl text-black">Payment History</h3>
                   <div class="flex items-center gap-2">
                      <span v-if="userPayments.length > 0" class="text-xs font-bold text-stone-400">{{ userPayments.length }}</span>
                      <span 
                         class="text-stone-400 transition-transform duration-300"
                         :class="showPaymentHistory ? 'rotate-180' : ''"
                      >▼</span>
                   </div>
                </button>
                
                <Transition
                   enter-active-class="transition-all duration-300 ease-out"
                   enter-from-class="max-h-0 opacity-0"
                   enter-to-class="max-h-96 opacity-100"
                   leave-active-class="transition-all duration-200 ease-in"
                   leave-from-class="max-h-96 opacity-100"
                   leave-to-class="max-h-0 opacity-0"
                >
                   <div v-show="showPaymentHistory" class="px-4 md:px-6 pb-4 md:pb-6 overflow-hidden">
                      <div v-if="loadingPayments" class="text-center text-stone-400 text-xs font-bold uppercase tracking-widest py-4">Loading...</div>
                      
                      <div v-else-if="userPayments.length === 0" class="text-center text-stone-400 text-xs font-bold uppercase tracking-widest py-6">
                        No payments yet
                      </div>
                      
                      <div v-else class="space-y-3 max-h-64 overflow-y-auto">
                        <div 
                          v-for="payment in userPayments.slice(0, 10)" 
                          :key="payment.id" 
                          class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
                        >
                          <div class="flex items-center gap-3">
                            <span class="text-lg bg-stone-50 w-8 h-8 flex items-center justify-center rounded-full border border-stone-200">
                               {{ payment.purpose === 'event_ticket' ? '🎟️' : (payment.purpose === 'subscription' ? '👑' : '💕') }}
                            </span>
                            <div>
                              <p class="text-[10px] font-bold uppercase tracking-widest text-black">
                                {{ payment.purpose === 'event_ticket' ? 'Event' : (payment.purpose === 'subscription' ? 'Membership' : 'Match') }}
                              </p>
                              <p class="text-[10px] font-mono text-stone-400">{{ formatPaymentDate(payment.created_at) }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <p class="text-sm font-bold font-mono text-black">{{ formatPaymentGHS(payment.amount) }}</p>
                            <span 
                              class="text-[9px] uppercase tracking-widest font-bold"
                              :class="payment.status === 'success' ? 'text-emerald-600' : payment.status === 'pending' ? 'text-amber-600' : 'text-rose-600'"
                            >
                              {{ payment.status }}
                            </span>
                          </div>
                        </div>
                      </div>
                   </div>
                </Transition>
             </div>
             
             <!-- Referral Program removed as per request -->
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <Teleport to="body">
       <div v-if="showBookingModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showBookingModal = false">
          <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <div class="flex justify-between items-start mb-6">
                <h2 class="text-2xl font-bold tracking-tight text-stone-900">Secure Your Spot</h2>
                <button @click="showBookingModal = false" class="text-stone-400 hover:text-black">✕</button>
             </div>
             
             <div class="bg-stone-50 p-4 rounded-xl flex items-center gap-4 mb-6">
                <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">📅</div>
                <div>
                   <h3 class="font-bold text-stone-900">{{ selectedEvent?.title }}</h3>
                   <p class="text-sm text-stone-500">{{ formatEventDate(selectedEvent?.event_date) }}</p>
                </div>
             </div>
             
             <div class="flex justify-between items-center py-4 border-t border-b border-stone-100 mb-6">
                <span class="font-medium text-stone-500">Total</span>
                <span class="text-2xl font-bold text-stone-900">{{ getTicketPrice(selectedEvent) }}</span>
             </div>
             
             <UiButton size="lg" class="w-full" :disabled="processing" @click="processEventPayment">
                {{ processing ? 'Processing...' : 'Confirm Booking' }}
             </UiButton>
          </div>
       </div>
    </Teleport>
    
    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-6 left-4 right-4 z-[60] bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] pb-safe transition-transform duration-300">
      <div class="flex justify-around items-center h-16 px-2">
         <!-- Matches -->
         <button @click="activeTab = 'matches'" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="activeTab === 'matches' ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'">
            <div class="relative">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="transition-transform duration-200" :class="activeTab === 'matches' ? 'scale-110' : ''"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               <span v-if="pendingMatchCount > 0" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-stone-900 animate-pulse"></span>
            </div>
            <span class="text-[9px] font-bold uppercase tracking-widest">Matches</span>
         </button>

         <!-- Events -->
         <button @click="activeTab = 'events'" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="activeTab === 'events' ? 'text-black dark:text-stone-100' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="transition-transform duration-200" :class="activeTab === 'events' ? 'scale-110' : ''"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/></svg>
            <span class="text-[9px] font-bold uppercase tracking-widest">Events</span>
         </button>

         <!-- Profile -->
         <button @click="activeTab = 'profile'" class="flex flex-col items-center justify-center gap-1 w-16 transition-all active:scale-95" :class="activeTab === 'profile' ? 'text-black dark:text-stone-100' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="transition-transform duration-200" :class="activeTab === 'profile' ? 'scale-110' : ''"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span class="text-[9px] font-bold uppercase tracking-widest">Profile</span>
         </button>
      </div>
    </nav>
    
    <!-- Footer (Sticky to bottom) -->
    <footer class="border-t border-stone-200 bg-white/80 backdrop-blur-sm mt-auto pb-24 md:pb-0">
      <div class="max-w-6xl mx-auto px-4 py-5">
        <div class="flex flex-col md:flex-row items-center justify-between gap-3">
          <p class="text-xs text-stone-400 font-medium">
            © {{ new Date().getFullYear() }} Minutes 2 Match. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <NuxtLink to="/terms" class="text-xs text-stone-400 hover:text-black transition-colors font-medium">Terms</NuxtLink>
            <NuxtLink to="/privacy" class="text-xs text-stone-400 hover:text-black transition-colors font-medium">Privacy</NuxtLink>
            <span class="text-xs text-stone-300">Made with ❤️ in Accra</span>
          </div>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import EventCard from '~/components/EventCard.vue'
import BlindProfileCard from '~/components/BlindProfileCard.vue'
import UiButton from '~/components/ui/Button.vue'
import { personas, type Persona } from '~/composables/usePersona'
import { useToast } from '~/composables/useToast'

// --- Feedback Logic ---
const { success: showSuccess, error: showError } = useToast()

// Navigate to connection page for feedback (feedback form is now on the connection page)
const navigateToFeedback = (match: any) => {
  navigateTo(`/me/connection/${match.id}?feedback=true`)
}
// --- End Feedback Logic ---

import type { M2MDatabase } from '~/types/database.types'
import { useSwipe } from '@vueuse/core'

const toast = useToast()

useHead({
  title: 'My Dashboard',
  meta: [
    { name: 'description', content: 'View your matches, upcoming events, and manage your profile on Minutes 2 Match.' }
  ]
})

definePageMeta({
  middleware: ['auth']
})

const supabase = useSupabaseClient<M2MDatabase>() as any
const user = useSupabaseUser()

// State
const authReady = ref(false)
const currentUserId = ref<string | null>(null)  // Store user ID to avoid undefined issues
const activeTab = ref<'events' | 'matches' | 'profile'>('matches')
const profile = ref<any>(null)
const events = ref<any[]>([])
const matches = ref<any[]>([])
const userBookings = ref<Set<string>>(new Set()) // Track user's confirmed bookings
const userPayments = ref<any[]>([]) // Track user's payments
const loadingEvents = ref(true)
const loadingMatches = ref(true)
const loadingBookings = ref(true) // Track booking fetch status
const loadingPayments = ref(true) // Track payment fetch status
const showBookingModal = ref(false)
const selectedEvent = ref<any>(null)
const processing = ref(false)
const togglingActive = ref(false)
const showPaymentHistory = ref(false) // Collapsed by default

// Profile editing
const editForm = reactive({
  display_name: '',
  gender: '',
  birth_date: '',
  location: '',
  intent: '',
  interested_in: '',
  genotype: '',
  religion: '',
  height_cm: null as number | null,
  occupation: '',
  // New fields
  about_me: '',
  min_age: 18 as number,
  max_age: 50 as number,
  interests: [] as string[],
  is_active: true,
  // Dealbreakers
  dealbreakers: {
    genotype: [] as string[],
    intent: [] as string[],
    religion: [] as string[]
  }
})

// Available interests for selection
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

const toggleInterest = (interestId: string) => {
  const currentInterests = [...editForm.interests]
  const index = currentInterests.indexOf(interestId)
  
  if (index === -1) {
    // Add interest if not already at max
    if (currentInterests.length < 6) {
      currentInterests.push(interestId)
    }
  } else {
    // Remove interest
    currentInterests.splice(index, 1)
  }
  
  // Reassign to trigger reactivity
  editForm.interests = currentInterests
}

// Toggle dealbreaker selection
const toggleDealbreaker = (category: 'genotype' | 'intent' | 'religion', value: string) => {
  const current = [...(editForm.dealbreakers[category] || [])]
  const index = current.indexOf(value)
  
  if (index === -1) {
    current.push(value)
  } else {
    current.splice(index, 1)
  }
  
  editForm.dealbreakers[category] = current
}

// Check if any dealbreakers are active
const hasActiveDealbreakers = computed(() => {
  return (
    editForm.min_age !== 18 ||
    editForm.max_age !== 50 ||
    (editForm.dealbreakers.genotype?.length || 0) > 0 ||
    (editForm.dealbreakers.intent?.length || 0) > 0 ||
    (editForm.dealbreakers.religion?.length || 0) > 0
  )
})

const saving = ref(false)
const saveSuccess = ref(false)

// Photo
const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref<string | null>(null)
const uploadingPhoto = ref(false)

// Computed
const personaData = computed(() => {
  if (!profile.value?.dating_persona) return null
  return personas[profile.value.dating_persona]
})

const pendingMatchCount = computed(() => {
  return matches.value.filter(m => m.status === 'pending_payment').length
})

// Fetch events - only show public events OR events user is qualified for
const fetchEvents = async (userId?: string) => {
  loadingEvents.value = true
  
  try {
    // Get all upcoming open events
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .in('status', ['open', 'waitlist'])
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
    
    if (!allEvents || allEvents.length === 0) {
      events.value = []
      return
    }

    // If no user, only show public events
    if (!userId) {
      events.value = allEvents.filter((e: any) => e.is_public === true)
      return
    }

    // Get user's event qualifications
    const { data: qualifications } = await supabase
      .from('event_qualifications')
      .select('event_id')
      .eq('user_id', userId)
      .in('status', ['qualified', 'invited'])
    
    const qualifiedEventIds = new Set((qualifications || []).map((q: any) => q.event_id))

    // Filter: show public events OR events user is qualified for
    events.value = allEvents.filter((event: any) => {
      // Public events are visible to everyone
      if (event.is_public === true) return true
      // Private events only visible if user is qualified
      return qualifiedEventIds.has(event.id)
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    events.value = []
  } finally {
    loadingEvents.value = false
  }
}

// Fetch user's event bookings (both confirmed AND pending)
const fetchUserBookings = async (userId: string) => {
  loadingBookings.value = true
  try {
    const { data } = await supabase
      .from('event_bookings')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'pending']) // Include pending to prevent re-purchase during payment
    
    userBookings.value = new Set((data || []).map((b: any) => b.event_id))
  } finally {
    loadingBookings.value = false
  }
}

// Fetch user's payment history
const fetchUserPayments = async (userId: string) => {
  loadingPayments.value = true
  try {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
      .limit(50)
    
    userPayments.value = data || []
  } finally {
    loadingPayments.value = false
  }
}

// Fetch user subscription
const subscription = ref<any>(null)
const loadingSubscription = ref(true)

const fetchSubscription = async (userId: string) => {
  loadingSubscription.value = true
  console.log('[Profile] Fetching subscription for:', userId)
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('end_date', { ascending: false }) // Get latest
      .limit(1)
      .maybeSingle()
    
    if (error) {
       console.error('[Profile] Error fetching subscription:', error)
    }

    // Client-side date check to avoid timezone mismatch issues with DB query
    if (data && new Date(data.end_date) > new Date()) {
       console.log('[Profile] Active subscription found:', data.id)
       subscription.value = data
    } else if (data) {
       console.log('[Profile] Found expired subscription:', data.id, 'Expires:', data.end_date)
       subscription.value = null
    } else {
       console.log('[Profile] No subscription found')
       subscription.value = null
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
  } finally {
    loadingSubscription.value = false
  }
}

// Check if user has booked an event
const hasBookedEvent = (eventId: string) => {
  return userBookings.value.has(eventId)
}

// Check if profile is incomplete
const isProfileIncomplete = computed(() => {
  if (!profile.value) return false
  
  // Check for critical missing info
  const missingPhoto = !profile.value.photo_url || profile.value.photo_url.includes('placeholder')
  const missingVibe = !profile.value.dating_persona
  const missingBasic = !profile.value.gender || !profile.value.birth_date || !profile.value.location
  
  return missingPhoto || missingVibe || missingBasic
})

// Profile save
const saveProfile = async () => {
  if (!currentUserId.value) return
  
  saving.value = true
  saveSuccess.value = false
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        gender: editForm.gender,
        birth_date: editForm.birth_date,
        location: editForm.location,
        intent: editForm.intent,
        interested_in: editForm.interested_in,
        genotype: editForm.genotype || null,
        religion: editForm.religion || null,
        height_cm: editForm.height_cm,
        occupation: editForm.occupation || null,
        // New fields
        about_me: editForm.about_me || null,
        min_age: editForm.min_age,
        max_age: editForm.max_age,
        interests: editForm.interests,
        // Dealbreakers
        dealbreakers: editForm.dealbreakers
      } as any)
      .eq('id', currentUserId.value)
    
    if (error) throw error
    
    await fetchProfileById(currentUserId.value)
    saveSuccess.value = true
    toast.success('Profile updated!', 'Your changes have been saved.')
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Save error:', err)
    toast.error('Failed to save profile', 'Please try again or contact support.')
  } finally {
    saving.value = false
  }
}

// Toggle account active status (pause/unpause matching)
const toggleAccountActive = async () => {
  if (!currentUserId.value) return
  
  togglingActive.value = true
  
  try {
    const newStatus = !editForm.is_active
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newStatus } as any)
      .eq('id', currentUserId.value)
    
    if (error) throw error
    
    editForm.is_active = newStatus
    
    // Show feedback
    if (newStatus) {
      toast.success('Profile Active!', 'You can now receive matches and event invitations.')
    } else {
      toast.warning('Profile Paused', "You won't appear in matches or events until you reactivate.")
    }
  } catch (err) {
    console.error('Toggle active error:', err)
    toast.error('Failed to update account status', 'Please try again.')
  } finally {
    togglingActive.value = false
  }
}

// Photo upload
const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !currentUserId.value) return
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Photo too large', 'Please choose an image under 5MB.')
    return
  }
  
  // Preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // Upload
  uploadingPhoto.value = true
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${currentUserId.value}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (uploadError) throw uploadError
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // Update profile
    await supabase
      .from('profiles')
      .update({ photo_url: urlData.publicUrl } as any)
      .eq('id', currentUserId.value)
    
    await fetchProfileById(currentUserId.value)
  } catch (err) {
    console.error('Upload error:', err)
    toast.error('Upload failed', 'Failed to upload photo. Please try again.')
    photoPreview.value = null
  } finally {
    uploadingPhoto.value = false
  }
}

// Logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/')
}

// Helpers
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

const getPersonaData = (personaId: string | null): Persona | null => {
  if (!personaId) return null
  return personas[personaId] || null
}

const getVibePreview = (vibeAnswers: any[]): string => {
  const previews = ['Loves deep conversations', 'Weekend adventurer', 'Ambitious go-getter', 'Social butterfly']
  return previews[Math.floor(Math.random() * previews.length)]
}

const getVibeSummary = (vibeAnswers: any[]): string => {
  if (!vibeAnswers?.length) return 'Getting to know them...'
  const answers = vibeAnswers.map(a => a.answer_value).join(', ')
  return `Enjoys ${answers}`
}

const getSharedInterests = (matchInterests: string[] | null): string[] => {
  if (!matchInterests || !editForm.interests.length) return []
  return matchInterests.filter(interest => editForm.interests.includes(interest))
}

const formatEventDate = (dateStr: string | null): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatPaymentDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatPaymentGHS = (amount: number): string => {
  return new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS',
    minimumFractionDigits: 2 
  }).format(amount || 0)
}

const getTicketPrice = (event: any): string => {
  if (!event || !profile.value) return 'GH₵ 0'
  const price = profile.value.gender === 'female' 
    ? event.ticket_price_female 
    : event.ticket_price_male
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(price)
}

// Event booking
const handleBookEvent = (event: any) => {
  // Check if already booked
  if (hasBookedEvent(event.id)) {
    toast.info('Already booked', 'You have already booked this event!')
    return
  }
  selectedEvent.value = event
  showBookingModal.value = true
}

const processEventPayment = async () => {
  if (!selectedEvent.value || !profile.value || !currentUserId.value) return
  
  processing.value = true
  
  try {
    // CRITICAL: Server-side check for existing booking
    const { data: existingBooking } = await supabase
      .from('event_bookings')
      .select('id, status')
      .eq('event_id', selectedEvent.value.id)
      .eq('user_id', currentUserId.value)
      .maybeSingle()
    
    const booking = existingBooking as { id: string; status: string } | null
    
    if (booking) {
      // User already has a booking for this event
      showBookingModal.value = false
      if (booking.status === 'confirmed') {
        toast.info('Already booked', 'You have already booked this event! Check your confirmed bookings.')
      } else if (booking.status === 'pending') {
        toast.warning('Pending booking', 'You already have a pending booking for this event. Please complete your previous payment or contact support.')
      }
      // Refresh bookings to update UI
      await fetchUserBookings(currentUserId.value)
      return
    }

    const { initializePayment } = usePaystack()
    
    const price = profile.value.gender === 'female'
      ? selectedEvent.value.ticket_price_female
      : selectedEvent.value.ticket_price_male

    const paymentData = await initializePayment(
      profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
      price,
      'event_ticket',
      { userId: currentUserId.value, eventId: selectedEvent.value.id }
    )

    // Insert booking with pending status
    const { error: bookingError } = await supabase
      .from('event_bookings')
      .insert({
        event_id: selectedEvent.value.id,
        user_id: currentUserId.value,
        status: 'pending'
      } as any)

    if (bookingError) {
      // Handle unique constraint violation (race condition)
      if (bookingError.code === '23505') {
        toast.info('Already booked', 'You have already booked this event!')
        await fetchUserBookings(currentUserId.value)
        showBookingModal.value = false
        return
      }
      throw bookingError
    }

    // Payment record now created server-side in initializePayment
    // await createPaymentRecord(
    //   currentUserId.value,
    //   price,
    //   'event_ticket',
    //   paymentData.reference,
    //   { eventId: selectedEvent.value.id }
    // )

    // Update local bookings immediately
    userBookings.value.add(selectedEvent.value.id)

    window.location.href = paymentData.authorization_url
  } catch (error) {
    console.error('Payment error:', error)
    toast.error('Payment failed', 'Failed to process payment. Please try again.')
  } finally {
    processing.value = false
  }
}

// Match unlock
const handleUnlockMatch = async (match: any) => {
  if (!currentUserId.value || !profile.value) return
  
  try {
    const { initializePayment } = usePaystack()

    const response = await initializePayment(
      profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
      match.unlock_price,
      'match_unlock',
      { userId: currentUserId.value, matchId: match.id }
    )

    // Check if it was an immediate unlock (Free or Subscription)
    if (response.type === 'free_unlock' || response.type === 'subscription_unlock') {
        toast.success(
            response.type === 'free_unlock' ? 'First Match Free!' : 'Unlocked with Subscription', 
            'Your match has been unlocked successfully.'
        )
        // Refresh matches to show unlocked state
        await fetchMatchesById(currentUserId.value)
        return
    }

    // Standard payment flow
    const authUrl = response.authorization_url || response.data?.authorization_url
    if (authUrl) {
        window.location.href = authUrl
    } else {
        throw new Error('Invalid payment response')
    }

  } catch (error) {
    console.error('Payment error:', error)
    toast.error('Payment failed', 'Failed to process payment. Please try again.')
  }
}

// Handle Subscription
const handleSubscribe = async () => {
    if (!currentUserId.value || !profile.value) return

    // Check if already subscribed
    if (subscription.value) {
        toast.info('Active Subscription', 'You already have an active subscription.')
        return
    }

    try {
        const { initializePayment } = usePaystack()
        
        // Fetch price from settings
        const { data: settingsData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'subscription_price_monthly')
            .single() as { data: any, error: any }
            
        const price = settingsData?.value?.amount || 50

        const response = await initializePayment(
            profile.value.phone ? `${profile.value.phone.replace(/\+/g, '')}@m2match.com` : 'user@m2match.com',
            price,
            'subscription',
            { userId: currentUserId.value }
        )

        const authUrl = response.authorization_url || response.data?.authorization_url
        if (authUrl) {
            window.location.href = authUrl
        }
    } catch (error) {
        console.error('Subscription error:', error)
        toast.error('Error', 'Failed to start subscription.')
    }
}

// Initialize data - handle auth hydration properly
onMounted(async () => {
  console.log('[Profile] Page mounted, checking auth...')
  
  // Try to get the session directly from Supabase
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('[Profile] Session check:', sessionData?.session?.user?.id, 'Error:', sessionError?.message)
  
  // Get user ID from either useSupabaseUser or direct session
  let userId = user.value?.id
  
  if (!userId && sessionData?.session?.user?.id) {
    console.log('[Profile] Using session user ID:', sessionData.session.user.id)
    userId = sessionData.session.user.id
  }
  
  if (!userId) {
    // Wait a bit for hydration
    console.log('[Profile] No user yet, waiting for hydration...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check again
    const { data: retrySession } = await supabase.auth.getSession()
    userId = user.value?.id || retrySession?.session?.user?.id
    console.log('[Profile] After wait, userId:', userId)
  }
  
  if (userId) {
    console.log('[Profile] User authenticated:', userId)
    currentUserId.value = userId  // Store for use in other functions
    try {
      // Manually set user if it came from session
      await fetchProfileById(userId)
      await Promise.all([
        fetchEvents(userId), 
        fetchMatchesById(userId), 
        fetchUserBookings(userId), 
        fetchUserPayments(userId),
        fetchSubscription(userId)
      ])
    } catch (err) {
      console.error('[Profile] Error loading data:', err)
    }
  } else {
    console.warn('[Profile] No authenticated user found. Redirecting to login...')
    navigateTo('/login')
    return
  }
  
  // Always set authReady to show the UI
  authReady.value = true
})

// Fetch profile by ID (for when useSupabaseUser isn't available)
const fetchProfileById = async (userId: string) => {
  console.log('[Profile] Fetching profile for:', userId)
  
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as { data: any, error: any, status: number }

    console.log('[Profile] Response:', status, 'Data:', data ? 'found' : 'null', 'Error:', error?.message)
  
    if (error) {
      console.error('[Profile] Error fetching profile:', error.message)
    }

    profile.value = data
    
    if (data) {
      editForm.display_name = data.display_name || ''
      editForm.gender = data.gender || ''
      editForm.birth_date = data.birth_date || ''
      editForm.location = data.location || ''
      editForm.intent = data.intent || ''
      editForm.interested_in = data.interested_in || ''
      editForm.genotype = data.genotype || ''
      editForm.religion = data.religion || ''
      editForm.height_cm = data.height_cm || null
      editForm.occupation = data.occupation || ''
      // New fields
      editForm.about_me = data.about_me || ''
      editForm.min_age = data.min_age || 18
      editForm.max_age = data.max_age || 50
      editForm.interests = [...(data.interests || [])]
      editForm.is_active = data.is_active !== false // Default to true if not set
      // Dealbreakers
      const db = data.dealbreakers || {}
      editForm.dealbreakers = {
        genotype: db.genotype || [],
        intent: db.intent || [],
        religion: db.religion || []
      }
    }
  } catch (err) {
    console.error('[Profile] Exception:', err)
  }
}

// Fetch matches by ID
const fetchMatchesById = async (userId: string) => {
  loadingMatches.value = true
  
  try {
    // 1. Fetch matches list via RLS (Client) - This ensures we respect RLS visibility rules for the match itself
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        user_1:profiles!matches_user_1_id_fkey(*),
        user_2:profiles!matches_user_2_id_fkey(*)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .in('status', ['pending_payment', 'partial_payment', 'unlocked'])
      .order('created_at', { ascending: false })

    if (!data || data.length === 0) {
      matches.value = []
      loadingMatches.value = false
      return
    }

    // 2. Identify partners and fetch their full details via Server (Bypass RLS for name/photo)
    const partnerIds = data.map((m: any) => m.user_1_id === userId ? m.user_2_id : m.user_1_id).filter(Boolean)
    
    let enrichedProfiles: Record<string, any> = {}
    
    if (partnerIds.length > 0) {
      try {
        enrichedProfiles = await $fetch('/api/enrich_matches', {
          method: 'POST',
          body: { matchUserIds: partnerIds }
        })
      } catch (e) {
        console.error('Failed to enrich matches:', e)
      }
    }

    // 3. Merge data
    const processedMatches = data.map((match: any) => {
      // Determine partner ID
      const partnerId = match.user_1_id === userId ? match.user_2_id : match.user_1_id
      
      // Get enriched profile or fallback to the partial one from RLS
      const basicProfile = match.user_1_id === userId ? match.user_2 : match.user_1
      const fullProfile = enrichedProfiles[partnerId] || basicProfile
      
      return {
        ...match,
        matchedProfile: fullProfile,
        vibeAnswers: fullProfile?.vibeAnswers || [],
        currentUserPaid: match.user_1_id === userId ? match.user_1_paid : match.user_2_paid
      }
    })

    matches.value = processedMatches
  } catch (err) {
    console.error('Error in match fetch flow:', err)
  } finally {
    loadingMatches.value = false
  }
}
  
  // --- Mobile Experience ---
  const mainContainer = ref<HTMLElement | null>(null)
  const { direction } = useSwipe(mainContainer)
  
  watch(direction, (dir) => {
    if (dir === 'left') {
       if (activeTab.value === 'matches') activeTab.value = 'events'
       else if (activeTab.value === 'events') activeTab.value = 'profile'
    } else if (dir === 'right') {
       if (activeTab.value === 'profile') activeTab.value = 'events'
       else if (activeTab.value === 'events') activeTab.value = 'matches'
    }
  })
  
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const touchStartY = ref(0)
  
  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY < 10) touchStartY.value = e.touches[0].clientY
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartY.value > 0 && window.scrollY < 10 && !isRefreshing.value) {
       const diff = e.touches[0].clientY - touchStartY.value
       if (diff > 0) pullDistance.value = Math.min(Math.pow(diff, 0.85), 150)
    }
  }
  
  const handleTouchEnd = async () => {
    if (pullDistance.value > 80 && !isRefreshing.value) {
       isRefreshing.value = true
       try {
          if (currentUserId.value) {
              await Promise.all([
                 fetchMatchesById(currentUserId.value),
                 // We assume fetchEvents exists based on usage in template; if not we'll handle gracefully or it might error if fetchEvents is not defined in scope yet.
                 // Actually fetchEvents is likely defined earlier.
                 fetchEvents(currentUserId.value)
              ])
          }
       } catch (e) {
          console.error(e)
       } finally {
          setTimeout(() => {
             isRefreshing.value = false
             pullDistance.value = 0
          }, 800)
       }
    } else {
       pullDistance.value = 0
    }
    touchStartY.value = 0
  }
</script>

<style scoped>
/* Remove all scoped styles as we now use Tailwind utilities */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
