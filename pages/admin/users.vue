<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Users</h1>
        <p class="ad-sub">{{ totalUsers.toLocaleString() }} member{{ totalUsers === 1 ? '' : 's' }}{{ filtersActive ? ' match these filters' : '' }}.</p>
      </div>
      <button class="btn-ghost" @click="exportUsers">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export
      </button>
    </header>

    <div class="ad-toolbar">
      <label class="ad-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
        <input v-model="filters.search" type="search" placeholder="Search by name or phone" aria-label="Search users" />
      </label>
      <select v-model="filters.city" class="ad-select" aria-label="City">
        <option value="">All cities</option>
        <option v-for="c in SERVED_CITIES" :key="c.key" :value="c.key">{{ c.label }}</option>
      </select>
      <select v-model="filters.optIn" class="ad-select" aria-label="This week">
        <option value="">Any week status</option>
        <option value="in">Opted in this week</option>
        <option value="out">Not opted in</option>
        <option value="retake">Asked to retake Vibe Check</option>
      </select>
      <select v-model="filters.gender" class="ad-select" aria-label="Gender">
        <option value="">All genders</option>
        <option value="male">Men</option>
        <option value="female">Women</option>
      </select>
      <select v-model="filters.persona" class="ad-select" aria-label="Persona">
        <option value="">All personas</option>
        <option v-for="(persona, key) in personas" :key="key" :value="key">{{ persona.name }}</option>
      </select>
      <select v-model="filters.availability" class="ad-select" aria-label="Availability">
        <option value="">Any availability</option>
        <option value="set">Availability set</option>
        <option value="not_set">No availability</option>
      </select>
    </div>

    <div v-if="selectedIds.length > 0" class="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#393737] py-2 pl-5 pr-2 text-sm text-white">
      <span>{{ selectedIds.length }} selected</span>
      <div class="flex gap-1.5">
        <button class="h-8 rounded-full px-3.5 text-sm font-medium text-white/80 hover:text-white" @click="selectedIds = []">Clear</button>
        <button class="h-8 rounded-full bg-white px-3.5 text-sm font-medium text-[#393737]" @click="bulkVerify">Verify</button>
        <button class="h-8 rounded-full bg-[#ed1c24] px-3.5 text-sm font-medium text-white" @click="bulkDelete">Delete</button>
      </div>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-10 !pr-0">
              <input type="checkbox" :checked="isAllSelected" aria-label="Select all" @change="toggleSelectAll" />
            </th>
            <th>Member</th>
            <th>About</th>
            <th>Status</th>
            <th>Availability</th>
            <th>Joined</th>
            <th class="ad-right"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7"><div class="ad-empty"><span class="ad-spinner"></span></div></td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="7">
              <div class="ad-empty">
                <p class="ad-empty__title">No users</p>
                <p>Nobody matches these filters.</p>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="user in users" :key="user.id" :class="{ '!bg-[#fcfbf9]': selectedIds.includes(user.id) }">
              <td class="!pr-0">
                <input v-model="selectedIds" type="checkbox" :value="user.id" :aria-label="`Select ${user.display_name || 'user'}`" />
              </td>
              <td>
                <button class="ad-person text-left" @click="viewUser(user)">
                  <span class="ad-avatar">
                    <img v-if="user.photo_url" :src="user.photo_url" :alt="user.display_name" />
                    <template v-else>{{ user.display_name?.charAt(0) || '?' }}</template>
                  </span>
                  <span class="min-w-0">
                    <span class="ad-person__name hover:underline">{{ user.display_name || 'Anonymous' }}</span>
                    <span class="ad-person__meta">{{ user.phone }}</span>
                  </span>
                </button>
              </td>
              <td class="ad-muted">
                <span class="whitespace-nowrap">{{ [user.gender ? capitalize(user.gender) : null, getAge(user.birth_date) !== '-' ? getAge(user.birth_date) : null].filter(Boolean).join(' · ') || '—' }}</span>
                <span class="block text-xs ad-faint" :title="user.location">{{ cityLine(user.location) }}</span>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span class="ad-pill" :class="user.is_verified ? 'ad-pill--green' : 'ad-pill--amber'">{{ user.is_verified ? 'Verified' : 'Pending' }}</span>
                  <span v-if="isOptedIn(user)" class="ad-pill ad-pill--blue" title="Opted in to be matched this week">In this week</span>
                  <span v-if="user.vibe_check_required" class="ad-pill ad-pill--amber" title="Will retake the new Vibe Check next time they open the app">Retake</span>
                  <span v-if="user.is_active === false" class="ad-pill" title="Hidden from matching (incognito)">Paused</span>
                  <NuxtLink v-if="pendingDeletionUserIds.has(user.id)" to="/admin/deletion-requests" class="ad-pill ad-pill--red hover:underline" title="Has asked to delete their account">Deleting</NuxtLink>
                </div>
              </td>
              <td>
                <span v-if="hasAvailability(user)" class="text-sm">Set</span>
                <span v-else class="text-sm ad-faint">Not set</span>
              </td>
              <td class="ad-num ad-muted">{{ formatDate(user.created_at) }}</td>
              <td class="ad-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                  <button class="btn-secondary btn-sm" @click="viewUser(user)">View</button>
                  <button
                    class="btn-ink btn-sm"
                    :disabled="user.is_active === false"
                    :title="user.is_active === false ? 'Paused members can’t be matched' : 'Match this member'"
                    @click="selectForMatch(user)"
                  >Match</button>
                  <button class="ad-icon-btn hover:!text-[#b4232a]" title="Delete user" aria-label="Delete user" @click="deleteUser(user)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="ad-pager">
      <span>{{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalUsers) }} of {{ totalUsers.toLocaleString() }}</span>
      <div class="ad-pager__buttons">
        <button class="btn-secondary btn-sm" :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">Previous</button>
        <button class="btn-secondary btn-sm" :disabled="currentPage >= totalPages" @click="handlePageChange(currentPage + 1)">Next</button>
      </div>
    </div>

    <!-- Member profile -->
    <Teleport to="body">
      <div v-if="showModal && selectedUser" class="m2m-app m2m-admin modal-overlay" @click.self="closeModal">
        <div class="modal modal--wide user-modal" role="dialog" aria-modal="true" aria-labelledby="user-title">
          <div class="modal__header !items-start !border-0 !pb-3">
            <div class="flex min-w-0 items-center gap-4">
              <button
                class="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#f1efec] text-xl font-semibold text-[#6c6862]"
                :class="{ 'cursor-zoom-in': selectedUser.photo_url }"
                :aria-label="selectedUser.photo_url ? 'View photo' : undefined"
                @click="selectedUser.photo_url && openImagePreview(selectedUser.photo_url)"
              >
                <img v-if="selectedUser.photo_url" :src="selectedUser.photo_url" :alt="selectedUser.display_name" class="h-full w-full object-cover" />
                <span v-else>{{ selectedUser.display_name?.charAt(0) || '?' }}</span>
              </button>
              <div class="min-w-0">
                <h2 id="user-title" class="modal__title !text-[1.75rem] leading-tight">{{ selectedUser.display_name || 'Anonymous' }}</h2>
                <p class="modal__sub">
                  {{ [capitalize(selectedUser.gender), getAge(selectedUser.birth_date) !== '-' ? getAge(selectedUser.birth_date) : null, cityLine(selectedUser.location), selectedUser.occupation].filter(Boolean).join(' · ') }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-1.5">
                  <span class="ad-pill" :class="selectedUser.is_verified ? 'ad-pill--green' : 'ad-pill--amber'">{{ selectedUser.is_verified ? 'Verified' : 'Pending' }}</span>
                  <span v-if="selectedUser.is_active === false" class="ad-pill">Incognito</span>
                  <span v-if="isOptedIn(selectedUser)" class="ad-pill ad-pill--blue">In this week</span>
                  <span v-if="selectedUser.dating_persona" class="ad-pill ad-pill--plain">{{ getPersona(selectedUser.dating_persona)?.name }}</span>
                  <ProfileBadges :profile="selectedUser" size="sm" :max-display="4" />
                </div>
              </div>
            </div>
            <button class="modal__close" aria-label="Close" @click="closeModal">×</button>
          </div>

          <div class="px-6 pb-3">
            <div class="ad-tabs" role="tablist">
              <button
                v-for="tab in userTabs"
                :key="tab.key"
                role="tab"
                :aria-selected="activeTab === tab.key"
                class="ad-tab"
                :class="{ 'is-active': activeTab === tab.key }"
                @click="activeTab = tab.key"
              >{{ tab.label }}</button>
            </div>
          </div>

          <div class="modal__content border-t border-[#ece8e3]">
            <!-- Profile -->
            <div v-if="activeTab === 'profile'" class="space-y-8">
              <div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                <section>
                  <h3 class="ad-label">Basics</h3>
                  <div class="ad-kv"><span>Phone</span><span class="ad-num">{{ selectedUser.phone }}</span></div>
                  <div class="ad-kv"><span>Birthday</span><span>{{ selectedUser.birth_date ? formatDate(selectedUser.birth_date) : '—' }}</span></div>
                  <div class="ad-kv"><span>Height</span><span>{{ selectedUser.height_cm ? `${selectedUser.height_cm}cm (${cmToFeet(selectedUser.height_cm)})` : '—' }}</span></div>
                  <div class="ad-kv"><span>Religion</span><span>{{ capitalize(selectedUser.religion) || '—' }}</span></div>
                  <div class="ad-kv">
                    <span>Genotype</span>
                    <span>
                      <span v-if="selectedUser.genotype" class="ad-pill ad-pill--plain" :class="selectedUser.genotype === 'AA' ? 'ad-pill--green' : ''">{{ selectedUser.genotype }}</span>
                      <template v-else>—</template>
                    </span>
                  </div>
                </section>

                <section>
                  <h3 class="ad-label">Looking for</h3>
                  <div class="ad-kv"><span>Interested in</span><span>{{ formatInterestedIn(selectedUser.interested_in) }}</span></div>
                  <div class="ad-kv"><span>Intent</span><span>{{ formatIntent(selectedUser.intent) }}</span></div>
                  <div class="ad-kv"><span>Age range</span><span>{{ selectedUser.min_age || selectedUser.max_age ? `${selectedUser.min_age || 18}–${selectedUser.max_age || 50}` : '—' }}</span></div>
                  <div class="ad-kv">
                    <span>Persona</span>
                    <span :title="getPersona(selectedUser.dating_persona)?.description">{{ selectedUser.dating_persona ? getPersona(selectedUser.dating_persona)?.name : '—' }}</span>
                  </div>
                </section>

                <section>
                  <h3 class="ad-label">Account</h3>
                  <div class="ad-kv"><span>City</span><span>{{ memberCityLabel(selectedUser.location) }}<span v-if="selectedUser.location" class="block text-xs ad-faint">{{ selectedUser.location }}</span></span></div>
                  <div class="ad-kv">
                    <span>This week</span>
                    <span>{{ isOptedIn(selectedUser) ? 'Opted in' : 'Not opted in' }}<span v-if="isOptedIn(selectedUser)" class="block text-xs ad-faint">until {{ formatDate(selectedUser.weekly_opt_in_until) }}</span></span>
                  </div>
                  <div class="ad-kv">
                    <span>Vibe Check</span>
                    <span>
                      {{ vibeVersionLabel }}
                      <span v-if="selectedUser.vibe_check_required" class="block text-xs text-[#9a5b0f]">Retake requested</span>
                      <button
                        v-if="vibeVersion !== 'new' || selectedUser.vibe_check_required"
                        class="mt-1 block text-xs font-medium underline underline-offset-2 ad-muted hover:text-[#393737] disabled:opacity-50"
                        :disabled="updatingRetake"
                        @click="setRetake(!selectedUser.vibe_check_required)"
                      >{{ selectedUser.vibe_check_required ? 'Cancel request' : 'Ask to retake' }}</button>
                    </span>
                  </div>
                  <div class="ad-kv"><span>Visibility</span><span>{{ selectedUser.is_active !== false ? 'Public' : 'Incognito' }}</span></div>
                  <div class="ad-kv"><span>Joined</span><span>{{ formatDate(selectedUser.created_at) }}</span></div>
                  <div class="ad-kv"><span>Last updated</span><span>{{ selectedUser.updated_at ? formatDate(selectedUser.updated_at) : '—' }}</span></div>
                  <div class="ad-kv"><span>Referral code</span><span class="font-mono text-xs">{{ selectedUser.referral_code || '—' }}</span></div>
                  <div class="ad-kv"><span>Referred by</span><span>{{ referrerName || 'Organic' }}</span></div>
                </section>

                <section>
                  <h3 class="ad-label">Engagement</h3>
                  <div class="ad-kv"><span>Trust score</span><span class="font-semibold" :class="getTrustScoreColor(selectedUser.trust_score)">{{ selectedUser.trust_score || 60 }}%</span></div>
                  <div class="ad-kv"><span>Events attended</span><span>{{ selectedUser.events_attended || 0 }}</span></div>
                  <div class="ad-kv"><span>Avg. response</span><span>{{ selectedUser.avg_response_time_hours ? selectedUser.avg_response_time_hours + 'h' : '—' }}</span></div>
                  <div class="ad-kv"><span>Free unlock</span><span>{{ selectedUser.has_used_free_unlock ? 'Used' : 'Available' }}</span></div>
                  <div class="ad-kv"><span>Contact reveal</span><span class="capitalize">{{ selectedUser.preferred_contact_method || 'Phone' }}</span></div>
                  <div v-if="selectedUser.instagram_handle" class="ad-kv"><span>Instagram</span><span>@{{ selectedUser.instagram_handle }}</span></div>
                  <div v-if="selectedUser.snapchat_handle" class="ad-kv"><span>Snapchat</span><span>{{ selectedUser.snapchat_handle }}</span></div>
                </section>
              </div>

              <!-- Bio and AI read of it -->
              <section>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <h3 class="ad-label !mb-0">About</h3>
                  <button class="btn-ghost btn-sm" :disabled="extractingAi" @click="extractAiPreferences">
                    {{ extractingAi ? 'Analysing…' : 'Refresh AI analysis' }}
                  </button>
                </div>
                <p v-if="selectedUser.about_me" class="ad-callout whitespace-pre-line">{{ selectedUser.about_me }}</p>
                <p v-else class="text-sm ad-faint">No bio yet.</p>

                <div v-if="selectedUser.preferences_extracted && Object.keys(selectedUser.preferences_extracted).length > 0" class="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div class="space-y-3">
                    <p class="text-xs font-semibold ad-muted">They're looking for</p>
                    <div v-for="group in [
                      { label: 'Traits', items: selectedUser.preferences_extracted.seeking?.attributes },
                      { label: 'Lifestyle', items: selectedUser.preferences_extracted.seeking?.lifestyle },
                      { label: 'Dealbreakers', items: selectedUser.preferences_extracted.seeking?.dealbreakers, alert: true }
                    ].filter(g => g.items?.length)" :key="group.label">
                      <p class="mb-1 text-xs ad-faint">{{ group.label }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="item in group.items" :key="item" class="chip" :class="{ 'chip--red': group.alert }">{{ item }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <p class="text-xs font-semibold ad-muted">How they describe themselves</p>
                    <div v-for="group in [
                      { label: 'Personality', items: selectedUser.preferences_extracted.self?.personality },
                      { label: 'Values', items: selectedUser.preferences_extracted.self?.values },
                      { label: 'Lifestyle', items: selectedUser.preferences_extracted.self?.lifestyle }
                    ].filter(g => g.items?.length)" :key="group.label">
                      <p class="mb-1 text-xs ad-faint">{{ group.label }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="item in group.items" :key="item" class="chip">{{ item }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else-if="!selectedUser.about_me || selectedUser.about_me.length < 10" class="mt-2 text-xs ad-faint">Bio is too short for AI analysis (10 characters minimum).</p>
                <p v-else-if="extractError" class="mt-2 text-xs font-semibold text-[#b4232a]">{{ extractError }}</p>
              </section>

              <div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                <section>
                  <h3 class="ad-label">Interests</h3>
                  <div v-if="selectedUser.interests?.length" class="flex flex-wrap gap-1.5">
                    <span v-for="interest in selectedUser.interests" :key="interest" class="chip">{{ getInterestLabel(interest) }}</span>
                  </div>
                  <p v-else class="text-sm ad-faint">None selected.</p>
                </section>

                <section>
                  <h3 class="ad-label">Dealbreakers</h3>
                  <div v-if="hasDealbreakers" class="space-y-2">
                    <div v-for="(values, category) in selectedUser.dealbreakers" :key="category">
                      <p class="mb-1 text-xs ad-faint">{{ formatKey(category as string) }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="val in values" :key="val" class="chip chip--red">{{ val }}</span>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-sm ad-faint">None set.</p>
                </section>
              </div>

              <section>
                <h3 class="ad-label">Availability</h3>
                <div v-if="hasAvailability(selectedUser)" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div
                    v-for="day in ['weekdays', 'friday', 'saturday', 'sunday']"
                    :key="day"
                    class="rounded-2xl bg-[#f6f4f1] p-3"
                    :class="{ 'opacity-50': !parseAvailability(selectedUser.availability)[day]?.length }"
                  >
                    <p class="text-xs font-semibold capitalize">{{ day }}</p>
                    <p class="mt-1 text-xs ad-muted">
                      {{ parseAvailability(selectedUser.availability)[day]?.length ? parseAvailability(selectedUser.availability)[day].map((s: string) => capitalize(s)).join(', ') : 'Not free' }}
                    </p>
                  </div>
                </div>
                <p v-else class="text-sm ad-faint">Not set.</p>
              </section>

              <section>
                <h3 class="ad-label">Badges</h3>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="badge in allBadges"
                    :key="badge.id"
                    class="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors"
                    :class="userHasBadge(badge.id) ? 'border-transparent' : 'border-[#ded9d2] text-[#6c6862] hover:border-[#393737]'"
                    :style="userHasBadge(badge.id) ? { backgroundColor: badge.color, color: badge.textColor } : {}"
                    :aria-pressed="userHasBadge(badge.id)"
                    @click="toggleBadge(badge.id)"
                  >
                    <span class="badge-icon" v-html="badge.icon"></span>
                    {{ badge.name }}
                  </button>
                </div>
                <div class="mt-3 flex items-center gap-3">
                  <button class="btn-ink btn-sm" :disabled="savingBadges" @click="saveBadges">{{ savingBadges ? 'Saving…' : 'Save badges' }}</button>
                  <span v-if="badgeSaveSuccess" class="text-xs font-semibold text-[#1f7a4d]">Saved</span>
                </div>
              </section>

              <!-- Profile completion reminder -->
              <section>
                <h3 class="ad-label">Profile reminder</h3>
                <div v-if="reminderPreview" class="ad-panel ad-panel--flat space-y-3 !p-4">
                  <div>
                    <label class="mb-1 block text-xs ad-muted" for="reminder-sms">SMS to {{ reminderPreview.phoneNumber }}</label>
                    <textarea id="reminder-sms" v-model="reminderPreview.smsMessage" rows="3" class="form-input resize-none !text-sm"></textarea>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs ad-muted" for="reminder-note">In-app notification</label>
                    <textarea id="reminder-note" v-model="reminderPreview.notificationMessage" rows="2" class="form-input resize-none !text-sm"></textarea>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-ghost btn-sm" @click="reminderPreview = null">Cancel</button>
                    <button class="btn-primary btn-sm" :disabled="sendingReminder" @click="confirmSendReminder">{{ sendingReminder ? 'Sending…' : 'Send now' }}</button>
                  </div>
                </div>
                <div v-else class="flex items-center gap-3">
                  <button class="btn-secondary btn-sm" :disabled="fetchingPreview" @click="fetchReminderPreview">
                    {{ fetchingPreview ? 'Checking profile…' : 'Draft a reminder' }}
                  </button>
                  <span v-if="reminderSent" class="text-xs font-semibold text-[#1f7a4d]">Sent by SMS and notification</span>
                  <span v-else class="text-xs ad-faint">Nudges them to finish missing parts of their profile.</span>
                </div>
              </section>


              <section>
                <label class="ad-label" for="admin-notes">Admin notes</label>
                <textarea
                  id="admin-notes"
                  v-model="adminNotes"
                  class="form-input min-h-[100px] resize-y"
                  placeholder="Private notes about this member. Saved when you click away."
                  @blur="saveAdminNotes"
                ></textarea>
                <p v-if="notesSaved" class="mt-1 text-xs font-semibold text-[#1f7a4d]">Saved</p>
              </section>
            </div>

            <!-- Activity -->
            <div v-if="activeTab === 'activity'">
              <UserActivityTimeline :userId="selectedUser.id" :user="selectedUser" />
            </div>

            <!-- Wallet -->
            <div v-if="activeTab === 'wallet'" class="mx-auto max-w-md space-y-6">
              <div class="text-center">
                <p class="text-sm ad-muted">Available balance</p>
                <p class="font-display mt-1 text-[2.75rem] leading-none tracking-tight">
                  <span class="mr-1 text-lg ad-faint">GH₵</span>
                  <span v-if="loadingWallet" class="animate-pulse">…</span>
                  <span v-else class="ad-num">{{ userBalance.toFixed(2) }}</span>
                </p>
              </div>

              <div class="ad-panel ad-panel--flat space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="ad-label !mb-0">Adjust balance</h3>
                  <div class="ad-tabs !bg-white">
                    <button class="ad-tab !h-8" :class="{ 'is-active !bg-[#393737] !text-white': walletType === 'credit' }" @click="walletType = 'credit'">Add</button>
                    <button class="ad-tab !h-8" :class="{ 'is-active !bg-[#393737] !text-white': walletType === 'debit' }" @click="walletType = 'debit'">Deduct</button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="form-label" for="wallet-amount">Amount (GH₵)</label>
                    <input id="wallet-amount" v-model.number="walletAmount" type="number" min="1" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label" for="wallet-reason">Reason</label>
                    <select id="wallet-reason" v-model="walletReason" class="ad-select w-full !h-[44px]">
                      <option value="reward">Reward or promo</option>
                      <option value="refund">Refund</option>
                      <option value="compensation">Compensation</option>
                      <option value="adjustment">Correction</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="form-label" for="wallet-note">Internal note</label>
                  <input id="wallet-note" v-model="walletDescription" placeholder="e.g. Compensation for a match bug" class="form-input" />
                </div>
                <button class="w-full" :class="walletType === 'credit' ? 'btn-ink' : 'btn-danger'" :disabled="adjustingWallet || !walletAmount" @click="adjustWallet">
                  {{ adjustingWallet ? 'Saving…' : walletType === 'credit' ? `Add GH₵${walletAmount || 0}` : `Deduct GH₵${walletAmount || 0}` }}
                </button>
              </div>

              <p class="text-center text-xs ad-faint">Every adjustment is recorded in the credit ledger.</p>
            </div>

            <!-- Vibe check -->
            <div v-if="activeTab === 'vibes'">
              <div v-if="loadingAnswers" class="ad-empty"><span class="ad-spinner"></span></div>
              <div v-else-if="userAnswers.length === 0" class="ad-empty">
                <p class="ad-empty__title">No Vibe Check yet</p>
                <p>They haven't answered the questions.</p>
              </div>
              <ol v-else class="divide-y divide-[#ece8e3]">
                <li v-for="(item, idx) in userAnswers" :key="idx" class="flex gap-4 py-3.5">
                  <span class="ad-num w-6 shrink-0 pt-0.5 text-xs ad-faint">{{ idx + 1 }}</span>
                  <div class="min-w-0">
                    <p class="text-sm ad-muted">{{ item.question }}</p>
                    <p class="mt-0.5 font-medium">{{ item.answer }}</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div class="modal__footer">
            <button class="btn-secondary" @click="closeModal">Close</button>
            <button class="btn-primary" @click="selectForMatch(selectedUser)">Select for match</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Photo preview -->
    <Teleport to="body">
      <div v-if="showImagePreview" class="fixed inset-0 z-[110] flex items-center justify-center bg-[#393737]/80 p-6 backdrop-blur-sm" @click="closeImagePreview">
        <img :src="previewImageUrl" alt="" class="max-h-[85vh] max-w-full rounded-3xl object-contain shadow-2xl" @click.stop />
        <button class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-[#393737]" aria-label="Close" @click="closeImagePreview">×</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { personas } from '~/composables/usePersona'

useHead({ title: 'Users' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const toast = useToast()

// State
const loading = ref(true)
const users = ref<any[]>([])
const selectedIds = ref<string[]>([])
const filters = reactive({
  city: '' as '' | ServedCity,
  optIn: '' as '' | 'in' | 'out' | 'retake',
  gender: '',
  persona: '',
  verified: '',
  availability: '',
  search: ''
})

// Pagination State
const currentPage = ref(1)
const pageSize = ref(15)
const totalUsers = ref(0) // Will be set by fetch
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))
const filtersActive = computed(() => !!(filters.city || filters.optIn || filters.gender || filters.persona || filters.availability || filters.search))

const isOptedIn = (user: any) => user?.is_active !== false && isOptedInThisWeek(user?.weekly_opt_in_until)

// "Accra · East Legon", "Nairobi", or the raw location for anywhere else
const cityLine = (location?: string | null) => {
  if (!location) return 'No location'
  const city = memberCity(location)
  if (city === 'other') return location
  const area = location.split(',').map(x => x.trim()).find(x => x.toLowerCase() !== city)
  return area ? `${memberCityLabel(location)} · ${area}` : memberCityLabel(location)
}

// Modal State
const showModal = ref(false)
const selectedUser = ref<any>(null)
// Image Preview State
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const adminNotes = ref('')
const notesSaved = ref(false)

// Badge Management
const { badges: badgeDefinitions } = useBadges()
const allBadges = computed(() => Object.values(badgeDefinitions))
const userBadges = ref<string[]>([])
const savingBadges = ref(false)
const badgeSaveSuccess = ref(false)

const fetchingPreview = ref(false)
const sendingReminder = ref(false)
const reminderSent = ref(false)
const reminderPreview = ref<any>(null)
const extractingAi = ref(false)
const extractError = ref('')

const userAnswers = ref<any[]>([])
const loadingAnswers = ref(false)
const questionsMap = ref<Record<string, string>>({})
const activeTab = ref<'profile' | 'activity' | 'vibes' | 'wallet'>('profile')
const userTabs: { key: 'profile' | 'activity' | 'vibes' | 'wallet'; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'vibes', label: 'Vibe Check' },
  { key: 'activity', label: 'Activity' },
  { key: 'wallet', label: 'Wallet' }
]
const loadingActivity = ref(false)
const referrerName = ref('')
const userActivity = reactive({
  totalMatches: 0,
  unlockedMatches: 0,
  eventsAttended: 0,
  totalSpent: 0,
  matches: [] as any[],
  events: [] as any[],
  payments: [] as any[]
})

const pendingDeletionUserIds = ref<Set<string>>(new Set())

// Fetch users with Server-Side Filtering & Pagination
const fetchUsers = async () => {
  loading.value = true
  
  let query = supabase
    .from('profiles')
    .select('*, telegram_id', { count: 'exact' })
  
  // Apply Filters
  if (filters.city) {
    // A city covers its neighbourhoods too ("East Legon" is Accra)
    query = query.or(cityAreaTerms(filters.city).map(term => `location.ilike.%${term}%`).join(','))
  }

  const nowIso = new Date().toISOString()
  if (filters.optIn === 'in') {
    query = query.gte('weekly_opt_in_until', nowIso).not('is_active', 'is', false)
  } else if (filters.optIn === 'out') {
    query = query.or(`weekly_opt_in_until.is.null,weekly_opt_in_until.lt.${nowIso}`)
  } else if (filters.optIn === 'retake') {
    query = query.eq('vibe_check_required', true)
  }

  if (filters.gender) {
    query = query.eq('gender', filters.gender)
  }
  
  if (filters.persona) {
    query = query.eq('dating_persona', filters.persona)
  }
  
  if (filters.verified) {
    query = query.eq('is_verified', filters.verified === 'true')
  }

  if (filters.availability === 'set') {
    query = query.not('availability', 'is', null)
  } else if (filters.availability === 'not_set') {
    query = query.is('availability', null)
  }
  
  if (filters.search) {
    // Simple search on display_name or phone
    const searchTerm = `%${filters.search}%`
    query = query.or(`display_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
  }
  
  // Apply Pagination
  const from = (currentPage.value - 1) * pageSize.value
  const to = from + pageSize.value - 1
  
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching users:', error)
  }

  users.value = data || []
  totalUsers.value = count || 0

  // Fetch pending deletion requests for loaded users
  if (data && data.length > 0) {
    try {
      const userIds = data.map((u: any) => u.id)
      let { data: delReqs, error: delErr } = await (supabase as any)
        .schema('m2m')
        .from('account_deletion_requests')
        .select('user_id')
        .in('user_id', userIds)
        .eq('status', 'pending')

      if (delErr) {
        const { data: pubDelReqs } = await (supabase as any)
          .from('account_deletion_requests')
          .select('user_id')
          .in('user_id', userIds)
          .eq('status', 'pending')
        delReqs = pubDelReqs
      }

      const pendingSet = new Set<string>()
      if (delReqs) {
        delReqs.forEach((r: any) => pendingSet.add(r.user_id))
      }
      pendingDeletionUserIds.value = pendingSet
    } catch (err) {
      console.error('Error fetching pending deletion requests for users:', err)
    }
  }

  loading.value = false
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers()
}

const hasAvailability = (user: any) => {
  if (!user?.availability) return false
  if (typeof user.availability === 'string') {
    try {
      const parsed = JSON.parse(user.availability)
      return Object.values(parsed).some((slots: any) => slots?.length > 0)
    } catch (e) {
      return false
    }
  }
  return Object.values(user.availability).some((slots: any) => slots?.length > 0)
}

const parseAvailability = (avail: any) => {
  if (!avail) return {}
  if (typeof avail === 'string') {
    try {
      return JSON.parse(avail)
    } catch (e) {
      return {}
    }
  }
  return avail
}

// Watch filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
  fetchUsers()
}, { deep: true })

// Bulk Actions
const isAllSelected = computed(() => {
  return users.value.length > 0 && selectedIds.value.length === users.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = users.value.map(u => u.id)
  }
}

const bulkVerify = async () => {
  if (!selectedIds.value.length) return
  if (!confirm(`Verify ${selectedIds.value.length} users and run JIT matching?`)) return
  
  try {
    const response = await $fetch('/api/admin/users/verify', {
      method: 'POST',
      body: { userIds: selectedIds.value }
    }) as any
    
    if (response.success) {
      toast.success('Users Verified', `Successfully verified ${selectedIds.value.length} users and ran automated matching.`)
      fetchUsers()
      selectedIds.value = []
    }
  } catch (err: any) {
    console.error('Bulk Verify Error:', err)
    alert(`Failed to verify: ${err.data?.message || 'Server error'}`)
  }
}

const bulkDelete = async () => {
  if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedIds.value.length} users?`)) return
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .in('id', selectedIds.value)

  if (!error) {
    fetchUsers()
    selectedIds.value = []
  }
}

const deleteUser = async (user: any) => {
  if (!confirm(`Are you sure you want to permanently delete user "${user.display_name || 'Anonymous'}"? This action cannot be undone.`)) return

  try {
    await $fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    
    // Remove from local list
    users.value = users.value.filter(u => u.id !== user.id)
    totalUsers.value--
    
    // If deleted from modal, close modal
    if (selectedUser.value && selectedUser.value.id === user.id) {
      closeModal()
    }
  } catch (err: any) {
    console.error('Failed to delete user:', err)
    alert(`Failed to delete user: ${err.message || 'Unknown error'}`)
  }
}

const exportUsers = () => {
  const data = users.value.map(u => ({
    name: u.display_name,
    phone: u.phone,
    gender: u.gender,
    age: getAge(u.birth_date),
    location: u.location,
    is_verified: u.is_verified ? 'Yes' : 'No',
    joined: new Date(u.created_at).toLocaleDateString()
  }))
  
  downloadCSV(data, `users_export_${new Date().toISOString().split('T')[0]}.csv`)
}

// Fetch helper: Questions map
const fetchQuestionsMap = async () => {
  const { data } = await supabase
    .from('questions')
    .select('key, question')
  
  if (data) {
    data.forEach((q: any) => {
      questionsMap.value[q.key] = q.question
    })
  }
}

// Fetch user activity data
const fetchUserActivity = async (userId: string) => {
  loadingActivity.value = true
  
  // Reset activity data
  userActivity.totalMatches = 0
  userActivity.unlockedMatches = 0
  userActivity.eventsAttended = 0
  userActivity.totalSpent = 0
  userActivity.matches = []
  userActivity.events = []
  userActivity.payments = []

  try {
    // Fetch matches where user is either user_1 or user_2
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id, status, created_at, unlock_price,
        user_1:profiles!matches_user_1_id_fkey(id, display_name, photo_url),
        user_2:profiles!matches_user_2_id_fkey(id, display_name, photo_url)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawMatches = matches as any[] || []
    if (rawMatches.length) {
      userActivity.totalMatches = rawMatches.length
      userActivity.unlockedMatches = rawMatches.filter(m => m.status === 'unlocked').length
      userActivity.matches = rawMatches.map(m => ({
        ...m,
        matchedWith: m.user_1?.id === userId ? m.user_2 : m.user_1
      }))
    }

    // Fetch event bookings
    const { data: bookings } = await supabase
      .from('event_bookings')
      .select(`
        id, status, created_at,
        event:events(id, title, venue, event_date)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawBookings = bookings as any[] || []
    if (rawBookings.length) {
      userActivity.events = rawBookings
      userActivity.eventsAttended = rawBookings.filter(b => b.status === 'checked_in').length
    }

    // Fetch payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const rawPayments = payments as any[] || []
    if (rawPayments.length) {
      userActivity.payments = rawPayments
      userActivity.totalSpent = rawPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    }
  } catch (e) {
    console.error('Error fetching user activity:', e)
  } finally {
    loadingActivity.value = false
  }
}

// Actions
// Which Vibe Check the open member has answered: v2 keys start with "v2_"
const vibeVersion = ref<'new' | 'old' | 'none' | 'loading'>('loading')
const vibeVersionLabel = computed(() => ({ new: 'New version', old: 'Old version', none: 'Not taken', loading: '…' })[vibeVersion.value])

const loadVibeVersion = async (userId: string) => {
  vibeVersion.value = 'loading'
  const countAnswers = () => (supabase as any).schema('m2m').from('vibe_answers').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  const [{ count: v2 }, { count: any }] = await Promise.all([
    countAnswers().like('question_key', 'v2_%'),
    countAnswers()
  ])
  if (selectedUser.value?.id !== userId) return
  vibeVersion.value = v2 ? 'new' : any ? 'old' : 'none'
}

const updatingRetake = ref(false)
const setRetake = async (required: boolean) => {
  if (!selectedUser.value) return
  updatingRetake.value = true
  try {
    await $fetch('/api/admin/vibe-check/retake', {
      method: 'POST',
      body: { userIds: [selectedUser.value.id], clear: !required }
    })
    selectedUser.value = { ...selectedUser.value, vibe_check_required: required }
    const row = users.value.find((u: any) => u.id === selectedUser.value.id)
    if (row) row.vibe_check_required = required
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Could not update. Please try again.')
  } finally {
    updatingRetake.value = false
  }
}

const viewUser = async (user: any) => {
  selectedUser.value = user
  loadVibeVersion(user.id)
  showModal.value = true
  activeTab.value = 'profile'
  loadingAnswers.value = true
  userAnswers.value = []
  
  // Set Notes
  adminNotes.value = user.admin_notes || ''
  notesSaved.value = false
  
  // Set Badges
  userBadges.value = [...(user.badges || [])]
  badgeSaveSuccess.value = false
  
  // Set Referrer
  referrerName.value = ''
  if (user.referred_by) {
    supabase.from('profiles').select('display_name').eq('id', user.referred_by).single().then(({ data }: any) => {
      if (data) referrerName.value = data.display_name || 'Anonymous'
    })
  }


  // Wallet State Reset & Fetch
  userBalance.value = 0
  walletAmount.value = 15
  walletType.value = 'credit'
  walletReason.value = 'reward'
  walletDescription.value = ''
  fetchUserBalance(user.id)

  // Fetch answers and activity in parallel
  try {
    const [answersResult] = await Promise.all([
      supabase
        .from('vibe_answers')
        .select('question_key, answer_value')
        .eq('user_id', user.id),
      fetchUserActivity(user.id)
    ])

    if (answersResult.data) {
      userAnswers.value = answersResult.data.map((a: any) => ({
        question: questionsMap.value[a.question_key] || formatKey(a.question_key),
        answer: a.answer_value
      }))
    }
  } catch (e) {
    console.error('Error fetching user data:', e)
  } finally {
    loadingAnswers.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  activeTab.value = 'profile'
  reminderSent.value = false
  reminderPreview.value = null
  extractingAi.value = false
  extractError.value = ''
}

const extractAiPreferences = async () => {
  if (!selectedUser.value) return
  
  extractingAi.value = true
  extractError.value = ''
  
  try {
    const response = await $fetch('/api/ai/extract-preferences', {
      method: 'POST',
      body: { userId: selectedUser.value.id }
    }) as any
    
    if (response.success && response.data) {
      selectedUser.value.preferences_extracted = response.data
      // Also update in the main list so it persists if modal reopens
      const index = users.value.findIndex(u => u.id === selectedUser.value.id)
      if (index !== -1) {
        users.value[index].preferences_extracted = response.data
      }
    } else {
      extractError.value = response.message || 'AI failed to extract preferences'
    }
  } catch (err: any) {
    console.error('AI Extraction Error:', err)
    extractError.value = err.data?.message || 'Failed to connect to AI service'
  } finally {
    extractingAi.value = false
  }
}

const fetchReminderPreview = async () => {
  if (!selectedUser.value) return
  
  fetchingPreview.value = true
  try {
    const response = await $fetch('/api/admin/notify-user-missing-details', {
      method: 'POST',
      body: { userId: selectedUser.value.id, dryRun: true }
    }) as any
    
    if (response.success) {
      if (response.missingFields?.length === 0) {
        alert('Profile is already complete!')
      } else {
        reminderPreview.value = response
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch preview:', err)
    alert(err.data?.message || 'Failed to analyze profile')
  } finally {
    fetchingPreview.value = false
  }
}

const confirmSendReminder = async () => {
  if (!selectedUser.value) return
  
  sendingReminder.value = true
  try {
    const response = await $fetch('/api/admin/notify-user-missing-details', {
      method: 'POST',
      body: { 
        userId: selectedUser.value.id,
        customSms: reminderPreview.value.smsMessage,
        customNotification: reminderPreview.value.notificationMessage
      }
    })
    
    if (response.success) {
      reminderSent.value = true
      reminderPreview.value = null
      setTimeout(() => { reminderSent.value = false }, 5000)
    }
  } catch (err: any) {
    console.error('Failed to send reminder:', err)
    alert(err.data?.message || 'Failed to send reminder')
  } finally {
    sendingReminder.value = false
  }
}

const selectForMatch = (user: any) => {
  sessionStorage.setItem('matchUser1', JSON.stringify(user))
  navigateTo('/admin/matches')
}

// Image Preview Actions
const openImagePreview = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
  previewImageUrl.value = ''
}



// Admin Notes
const saveAdminNotes = async () => {
  if (!selectedUser.value) return
  
  // Optimistic update
  selectedUser.value.admin_notes = adminNotes.value
  
  const { error } = await (supabase
    .from('profiles') as any)
    .update({ admin_notes: adminNotes.value })
    .eq('id', selectedUser.value.id)
    
  if (!error) {
    notesSaved.value = true
    setTimeout(() => { notesSaved.value = false }, 2000)
  }
}

// Badge Management Functions
const userHasBadge = (badgeId: string): boolean => {
  return userBadges.value.includes(badgeId)
}

const toggleBadge = (badgeId: string) => {
  if (userHasBadge(badgeId)) {
    userBadges.value = userBadges.value.filter(b => b !== badgeId)
  } else {
    userBadges.value = [...userBadges.value, badgeId]
  }
}

const saveBadges = async () => {
  if (!selectedUser.value) return
  
  savingBadges.value = true
  badgeSaveSuccess.value = false
  
  const oldBadges = selectedUser.value.badges || []
  const newBadges = userBadges.value.filter(b => !oldBadges.includes(b))
  
  try {
    // Update badges in database
    const { error } = await (supabase
      .from('profiles') as any)
      .update({ badges: userBadges.value })
      .eq('id', selectedUser.value.id)
    
    if (error) throw error
    
    // Update local state
    selectedUser.value.badges = [...userBadges.value]
    
    // Create notifications for new badges
    if (newBadges.length > 0) {
      for (const badgeId of newBadges) {
        const badge = badgeDefinitions[badgeId]
        if (badge) {
          await (supabase.from('notifications') as any).insert({
            user_id: selectedUser.value.id,
            type: 'badge_earned',
            title: `You earned a badge! 🏆`,
            message: `Congratulations! You've earned the "${badge.name}" badge: ${badge.description}`,
            data: { badge_id: badgeId },
            read: false
          })
        }
      }
    }
    
    badgeSaveSuccess.value = true
    setTimeout(() => { badgeSaveSuccess.value = false }, 3000)
  } catch (err) {
    console.error('Error saving badges:', err)
  } finally {
    savingBadges.value = false
  }
}

// Helpers
const formatKey = (key: string) => {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const getAge = (birthDate: string | null): string => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return String(age)
}

const getPersona = (personaId: string) => personas[personaId] || null

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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const hasDealbreakers = computed(() => {
  if (!selectedUser.value?.dealbreakers) return false
  return Object.values(selectedUser.value.dealbreakers).some((v: any) => v && v.length > 0)
})

const getTrustScoreColor = (score: number) => {
  if (!score || score < 50) return 'text-red-500'
  if (score < 80) return 'text-yellow-600'
  return 'text-green-600'
}

// Height converter
const cmToFeet = (cm: number): string => {
  if (!cm) return ''
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

// Format interested_in field
const formatInterestedIn = (value: string) => {
  const map: Record<string, string> = {
    'male': 'Men',
    'female': 'Women',
    'everyone': 'Everyone'
  }
  return map[value] || 'Not specified'
}

// Format intent field
const formatIntent = (value: string) => {
  const map: Record<string, string> = {
    'marriage': 'Marriage',
    'serious': 'Serious Relationship',
    'casual': 'Casual Dating',
    'friendship': 'Friendship'
  }
  return map[value] || 'Not specified'
}

// Format match status
const formatMatchStatus = (status: string) => {
  const map: Record<string, string> = {
    'pending_payment': 'Pending',
    'unlocked': 'Unlocked',
    'rejected': 'Rejected',
    'expired': 'Expired'
  }
  return map[status] || status
}

// Format payment purpose
const formatPurpose = (purpose: string) => {
  const map: Record<string, string> = {
    'match_unlock': 'Match Unlock',
    'event_ticket': 'Event Ticket'
  }
  return map[purpose] || purpose
}

// Get event day for display
const getEventDay = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).getDate()
}

// Get event month for display
const getEventMonth = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short' })
}

// Interest labels map
const interestLabels: Record<string, string> = {
  travel: 'Travel ✈️',
  fitness: 'Fitness 💪',
  cooking: 'Cooking 🍳',
  movies: 'Movies 🎬',
  music: 'Music 🎵',
  gaming: 'Gaming 🎮',
  reading: 'Reading 📚',
  art: 'Art 🎨',
  sports: 'Sports ⚽',
  tech: 'Tech 💻',
  fashion: 'Fashion 👗',
  food: 'Foodie 🍕',
  nature: 'Nature 🌿',
  photography: 'Photography 📸',
  dancing: 'Dancing 💃',
  entrepreneurship: 'Business 💼'
}

const getInterestLabel = (interestId: string): string => {
  return interestLabels[interestId] || interestId
}

// Wallet Management
const adjustingWallet = ref(false)
const walletAmount = ref(15)
const walletType = ref<'credit' | 'debit'>('credit')
const walletReason = ref('reward')
const walletDescription = ref('')
const userBalance = ref(0)
const loadingWallet = ref(false)

const fetchUserBalance = async (userId: string) => {
  loadingWallet.value = true
  try {
    const { data } = await supabase
      .schema('m2m')
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single()
    userBalance.value = data?.balance || 0
  } catch (e) {
    userBalance.value = 0
  } finally {
    loadingWallet.value = false
  }
}

const adjustWallet = async () => {
  if (!selectedUser.value || adjustingWallet.value) return
  
  adjustingWallet.value = true
  try {
    const response = await $fetch('/api/admin/users/credits', {
      method: 'POST',
      body: {
        userId: selectedUser.value.id,
        amount: walletAmount.value,
        type: walletType.value,
        reason: walletReason.value,
        description: walletDescription.value
      }
    }) as any
    
    if (response.success) {
      toast.success('Wallet Updated', `New balance: GHS ${response.newBalance}`)
      userBalance.value = response.newBalance
      walletAmount.value = 15
      walletDescription.value = ''
    }
  } catch (err: any) {
    toast.error('Adjustment Failed', err.data?.message || 'Error updating credits')
  } finally {
    adjustingWallet.value = false
  }
}

// Initialize
onMounted(() => {
  fetchUsers()
  fetchQuestionsMap()
})
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  height: 1.6rem;
  padding: 0 0.65rem;
  border-radius: 9999px;
  background: #f1efec;
  color: #524e4b;
  font-size: 0.75rem;
  font-weight: 500;
}

.chip--red {
  background: #fdecec;
  color: #b4232a;
}

.badge-icon {
  display: inline-flex;
}

.badge-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.user-modal {
  max-width: 920px;
}
</style>
