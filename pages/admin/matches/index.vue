<template>
  <div class="ad-page ad-page--wide">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">Matches</h1>
        <p class="ad-sub">Members opt in each week and are matched automatically every Sunday at noon (Accra time, 3pm Nairobi). Matching is free and introductions stay open.</p>
      </div>
      <div class="ad-actions">
        <div class="ad-tabs" role="tablist" aria-label="City">
          <button v-for="c in cityTabs" :key="c.key" role="tab" :aria-selected="city === c.key" class="ad-tab" :class="{ 'is-active': city === c.key }" @click="city = c.key">{{ c.label }}</button>
        </div>
        <button class="btn-secondary" @click="openRequestModal()">Request feedback</button>
        <NuxtLink to="/admin/matches/matchmaker" class="btn-primary">Open matchmaker</NuxtLink>
      </div>
    </header>

    <!-- This week -->
    <section class="mb-7">
      <div class="mb-2 flex items-baseline justify-between gap-3">
        <h2 class="ad-label !mb-0">This week{{ cityName ? ` in ${cityName}` : '' }}</h2>
        <span class="text-xs ad-faint">{{ weekRangeLabel(stats?.thisWeek) }}</span>
      </div>
      <div class="ad-stats !mb-0">
        <div class="ad-stat">
          <div class="ad-stat__label">Opted in</div>
          <div class="ad-stat__value">{{ statsLoading ? '…' : pool.optedIn }}</div>
          <div class="ad-stat__hint">of {{ pool.members }} members</div>
        </div>
        <div class="ad-stat">
          <div class="ad-stat__label">Matched</div>
          <div class="ad-stat__value">{{ statsLoading ? '…' : pool.matched }}</div>
          <div class="ad-stat__hint">{{ thisWeekRow?.matches ?? 0 }} introductions</div>
        </div>
        <NuxtLink to="/admin/matches/matchmaker" class="ad-stat hover:!bg-[#fcfbf9]" :class="{ 'ad-stat--alert': pool.waiting > 0 }">
          <div class="ad-stat__label">Still waiting</div>
          <div class="ad-stat__value">{{ statsLoading ? '…' : pool.waiting }}</div>
          <div class="ad-stat__hint">opted in, no match yet</div>
        </NuxtLink>
        <div class="ad-stat">
          <div class="ad-stat__label">Match rate</div>
          <div class="ad-stat__value">{{ thisWeekRow?.matchRate ?? '—' }}<template v-if="thisWeekRow?.matchRate != null">%</template></div>
          <div class="ad-stat__hint">of opted-in members</div>
        </div>
        <div class="ad-stat">
          <div class="ad-stat__label">Connected</div>
          <div class="ad-stat__value">{{ thisWeekRow?.connected ?? 0 }}</div>
          <div class="ad-stat__hint">said they connected or are dating</div>
        </div>
      </div>
    </section>

    <div class="mb-7 space-y-6">
      <!-- Week on week -->
      <section class="ad-panel !p-0">
        <div class="flex flex-wrap items-baseline justify-between gap-2 px-6 pb-3 pt-5">
          <h2 class="ad-label !mb-0">Week on week</h2>
          <span class="text-xs ad-faint">
            <template v-if="stats && !stats.historyAvailable">Opt-in history needs migration 075</template>
            <template v-else-if="stats?.historyStartsWeek">Opt-in history since {{ shortDate(stats.historyStartsWeek) }}</template>
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Week of</th>
                <th class="ad-right">Opted in</th>
                <th class="ad-right">First time</th>
                <th class="ad-right">Skipped</th>
                <th class="ad-right">Matches</th>
                <th class="ad-right">People matched</th>
                <th>Match rate</th>
                <th class="ad-right">Connected</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="statsLoading"><td colspan="8"><div class="ad-empty !py-10"><span class="ad-spinner"></span></div></td></tr>
              <tr v-else-if="statsError"><td colspan="8"><p class="ad-empty !py-10">{{ statsError }}</p></td></tr>
              <tr v-for="(row, i) in weekRows" v-else :key="row.weekStart" :class="{ '!bg-[#fcfbf9]': i === 0 }">
                <td class="whitespace-nowrap">
                  {{ shortDate(row.weekStart) }}
                  <span v-if="i === 0" class="ml-1 text-xs ad-faint">this week</span>
                </td>
                <td class="ad-right ad-num">
                  <template v-if="hasOptInData(row.weekStart)">
                    {{ row.optedIn }}
                    <span v-if="i < weekRows.length - 1 && hasOptInData(weekRows[i + 1].weekStart)" class="ml-1 text-xs" :class="trendClass(row.optedIn, weekRows[i + 1].optedIn)">{{ trend(row.optedIn, weekRows[i + 1].optedIn) }}</span>
                  </template>
                  <span v-else class="ad-faint">—</span>
                </td>
                <td class="ad-right ad-num">{{ hasOptInData(row.weekStart) ? row.firstTime : '—' }}</td>
                <td class="ad-right ad-num">{{ hasOptInData(row.weekStart) ? row.skipped : '—' }}</td>
                <td class="ad-right ad-num font-medium">{{ row.matches }}</td>
                <td class="ad-right ad-num">{{ row.peopleMatched }}</td>
                <td>
                  <div v-if="row.matchRate != null && hasOptInData(row.weekStart)" class="flex items-center gap-2" :title="`${row.matchRate}% of opted-in members were matched`">
                    <span class="h-1.5 w-20 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: row.matchRate + '%' }"></span></span>
                    <span class="ad-num text-xs">{{ row.matchRate }}%</span>
                  </div>
                  <span v-else class="ad-faint">—</span>
                </td>
                <td class="ad-right ad-num">{{ row.connected }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Vibe Check v2 -->
      <section class="ad-panel">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div class="min-w-0 flex-1">
            <h2 class="ad-label">New Vibe Check</h2>
            <template v-if="stats">
              <div class="mb-1 flex items-baseline gap-2">
                <span class="font-display text-3xl leading-none">{{ pct(stats.vibe.onNew, vibeTotal) }}%</span>
                <span class="text-sm ad-muted">of members have taken it</span>
              </div>
              <div class="mb-3 flex h-2 max-w-md overflow-hidden rounded-full bg-[#f1efec]" :title="`${stats.vibe.onNew} of ${vibeTotal} on the new Vibe Check`">
                <span class="h-full bg-[#393737]" :style="{ width: pct(stats.vibe.onNew, vibeTotal) + '%' }"></span>
              </div>
              <p class="text-sm ad-muted">
                <span class="ad-num font-medium text-[#393737]">{{ stats.vibe.onNew }}</span> taken ·
                <span class="ad-num font-medium text-[#393737]">{{ stats.vibe.onOld }}</span> still on the old one ·
                <span class="ad-num font-medium text-[#393737]">{{ stats.vibe.notStarted }}</span> never finished ·
                <span class="ad-num font-medium text-[#393737]">{{ stats.retakeAvailable ? stats.vibe.retakeRequired : '—' }}</span> asked to retake
              </p>
            </template>
            <div v-else-if="statsLoading" class="py-4"><span class="ad-spinner"></span></div>
          </div>

          <div v-if="stats" class="w-full max-w-xs">
            <button
              class="btn-ink w-full"
              :disabled="!stats.retakeAvailable || requestingRetake || stats.vibe.onOld + stats.vibe.notStarted === 0"
              @click="requestRetakeForAll"
            >
              {{ requestingRetake ? 'Updating…' : `Ask ${stats.vibe.onOld + stats.vibe.notStarted} to retake` }}
            </button>
            <p v-if="!stats.retakeAvailable" class="mt-2 text-xs text-[#9a5b0f]">Run migration 075 to turn this on.</p>
            <p v-else-if="retakeMessage" class="mt-2 text-xs text-[#1f7a4d]">{{ retakeMessage }}</p>
            <p v-else class="mt-2 text-xs leading-relaxed ad-faint">Profiles and earlier answers are kept. They take the new Vibe Check next time they open the app or log in.</p>
          </div>
        </div>
      </section>
    </div>

    <div class="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Do higher scores lead to better outcomes? -->
      <section class="ad-panel !p-0">
        <div class="px-6 pb-3 pt-5">
          <h2 class="ad-label !mb-1">Outcomes by score</h2>
          <p class="text-xs ad-faint">
            {{ outcomeTotals.answered }} of {{ outcomeTotals.matches }} introductions have feedback.
            <template v-if="outcomeTotals.answered < 30">Worth tuning the scoring once there are about 30.</template>
          </p>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Score</th>
              <th class="ad-right">Introduced</th>
              <th class="ad-right">Feedback</th>
              <th>Connected</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="band in outcomeBands" :key="band.label">
              <td>{{ band.label }}</td>
              <td class="ad-right ad-num">{{ band.matches }}</td>
              <td class="ad-right ad-num">{{ band.answered }}</td>
              <td>
                <div v-if="band.answered" class="flex items-center gap-2" :title="`${band.good} of ${band.answered} with feedback connected or are dating`">
                  <span class="h-1.5 w-16 overflow-hidden rounded-full bg-[#f1efec]"><span class="block h-full rounded-full bg-[#393737]" :style="{ width: band.rate + '%' }"></span></span>
                  <span class="ad-num text-xs">{{ band.rate }}%</span>
                </div>
                <span v-else class="ad-faint">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- AI reading of bios -->
      <section class="ad-panel">
        <h2 class="ad-label">Bios read by AI</h2>
        <div class="mb-1 flex items-baseline gap-2">
          <span class="font-display text-3xl leading-none">{{ bioStats.analysed }}</span>
          <span class="text-sm ad-muted">of {{ bioStats.withBio }} bios</span>
        </div>
        <div class="mb-3 flex h-2 max-w-md overflow-hidden rounded-full bg-[#f1efec]">
          <span class="h-full bg-[#393737]" :style="{ width: pct(bioStats.analysed, bioStats.withBio) + '%' }"></span>
        </div>
        <p class="text-xs leading-relaxed ad-muted">
          AI reads each bio for what the member is looking for and how they describe themselves, and the scorer
          compares those by meaning (up to 10 points). New bios are read automatically when saved.
        </p>
        <button class="btn-ink mt-4" :disabled="readingBios || bioStats.analysed >= bioStats.withBio" @click="readRemainingBios">
          {{ readingBios ? `Reading… ${bioProgress}` : `Read ${Math.max(0, bioStats.withBio - bioStats.analysed)} remaining` }}
        </button>
        <p v-if="bioMessage" class="mt-2 text-xs ad-muted">{{ bioMessage }}</p>
      </section>
    </div>

    <!-- All matches -->
    <div class="mb-3 flex items-baseline justify-between">
      <h2 class="ad-label !mb-0">Introductions</h2>
      <span class="text-xs ad-faint">{{ filteredMatches.length }} shown</span>
    </div>
    <div class="ad-toolbar">
      <label class="ad-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>
        <input v-model="filters.search" type="search" placeholder="Search by name or phone" aria-label="Search matches" />
      </label>
      <select v-model="filters.week" class="ad-select" aria-label="Week">
        <option value="">All weeks</option>
        <option v-for="(w, i) in weekRows" :key="w.weekStart" :value="w.weekStart">{{ i === 0 ? 'This week' : `Week of ${shortDate(w.weekStart)}` }}</option>
      </select>
      <select v-model="filters.feedbackStatus" class="ad-select" aria-label="Feedback">
        <option value="">All feedback</option>
        <option value="pending">No feedback yet</option>
        <option value="connected">Connected</option>
        <option value="dating">Dating</option>
        <option value="no_response">No response</option>
        <option value="unmatched">Unmatched</option>
      </select>
      <button v-if="filters.week || filters.feedbackStatus || filters.search" class="btn-ghost btn-sm" @click="filters.week = ''; filters.feedbackStatus = ''; filters.search = ''">Clear</button>
    </div>

    <div class="data-table-container">
      <div v-if="loading" class="ad-empty"><span class="ad-spinner"></span></div>
      <div v-else-if="filteredMatches.length === 0" class="ad-empty">
        <p class="ad-empty__title">No introductions</p>
        <p>Nothing fits these filters.</p>
      </div>

      <template v-else>
        <!-- Desktop -->
        <table class="data-table hidden md:table">
          <thead>
            <tr>
              <th>Introduced</th>
              <th>Pair</th>
              <th>Score</th>
              <th>Feedback</th>
              <th class="ad-right"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in paginatedMatches" :key="match.id" class="align-top">
              <td class="whitespace-nowrap">
                <span class="ad-num">{{ shortDate(match.created_at) }}</span>
                <span class="block text-xs ad-faint">{{ match.created_by === 'admin' ? 'By hand' : 'Automatic' }}</span>
              </td>
              <td>
                <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <div v-for="side in pairOf(match)" :key="side.key" class="ad-person">
                    <span class="ad-avatar">
                      <img v-if="side.user?.photo_url" :src="side.user.photo_url" alt="" />
                      <template v-else>{{ side.user?.display_name?.charAt(0) || '?' }}</template>
                    </span>
                    <div class="min-w-0">
                      <span class="ad-person__name max-w-[10rem]">{{ side.user?.display_name || 'Anonymous' }}</span>
                      <span class="ad-person__meta">{{ memberCityLabel(side.user?.location) }} · {{ side.user?.phone }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <button class="ad-pill ad-pill--plain cursor-pointer" :class="getScoreClass(match.match_score)" title="Compatibility details" @click="openCompatibilityModal(match)">
                  {{ match.match_score ? match.match_score + '%' : '—' }}
                </button>
              </td>
              <td>
                <span class="ad-pill" :class="getFeedbackClass(match.feedback_status)">{{ formatFeedbackStatus(match.feedback_status) }}</span>
                <span v-if="match.user_1_feedback || match.user_2_feedback" class="mt-1 block text-xs ad-muted">
                  {{ firstName(match.user_1) }}: {{ memberAnswerLabel(match.user_1_feedback) }} · {{ firstName(match.user_2) }}: {{ memberAnswerLabel(match.user_2_feedback) }}
                </span>
                <span v-else-if="match.feedback_requested_at" class="mt-1 block text-xs ad-faint">Asked {{ shortDate(match.feedback_requested_at) }}</span>
                <span v-if="match.selection_note" class="mt-1 block max-w-[16rem] text-xs text-[#2f5d9e]" :title="match.selection_note">AI pick</span>
              </td>
              <td class="ad-right whitespace-nowrap">
                <div class="inline-flex items-center gap-0.5">
                  <button class="ad-icon-btn" title="Log feedback" aria-label="Log feedback" @click="openFeedbackModal(match)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <button class="ad-icon-btn" title="Ask for feedback by SMS" aria-label="Ask for feedback by SMS" @click="openRequestModal(match)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </button>
                  <button class="ad-icon-btn hover:!text-[#b4232a]" title="Delete match" aria-label="Delete match" @click="confirmDelete(match)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile -->
        <ul class="divide-y divide-[#f3f1ee] md:hidden">
          <li v-for="match in paginatedMatches" :key="match.id" class="space-y-3 p-4">
            <div class="flex items-center justify-between gap-2 text-xs ad-muted">
              <span>{{ shortDate(match.created_at) }}</span>
              <button class="ad-pill ad-pill--plain" :class="getScoreClass(match.match_score)" @click="openCompatibilityModal(match)">
                {{ match.match_score ? match.match_score + '%' : '—' }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="side in pairOf(match)" :key="side.key" class="ad-person">
                <span class="ad-avatar">
                  <img v-if="side.user?.photo_url" :src="side.user.photo_url" alt="" />
                  <template v-else>{{ side.user?.display_name?.charAt(0) || '?' }}</template>
                </span>
                <span class="min-w-0">
                  <span class="ad-person__name text-sm">{{ side.user?.display_name || 'Anonymous' }}</span>
                  <span class="ad-person__meta">{{ memberCityLabel(side.user?.location) }}</span>
                </span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="ad-pill" :class="getFeedbackClass(match.feedback_status)">{{ formatFeedbackStatus(match.feedback_status) }}</span>
              <button class="btn-secondary btn-sm" @click="openFeedbackModal(match)">Log feedback</button>
              <button class="btn-secondary btn-sm" @click="openRequestModal(match)">Ask by SMS</button>
              <button class="btn-ghost btn-sm !text-[#b4232a]" @click="confirmDelete(match)">Delete</button>
            </div>
          </li>
        </ul>
      </template>
    </div>

    <div v-if="totalPages > 1" class="ad-pager">
      <span>{{ Math.min(filteredMatches.length, (currentPage - 1) * itemsPerPage + 1) }}–{{ Math.min(filteredMatches.length, currentPage * itemsPerPage) }} of {{ filteredMatches.length }}</span>
      <div class="ad-pager__buttons items-center">
        <button class="ad-icon-btn" :disabled="currentPage === 1" aria-label="Previous page" @click="currentPage--">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <template v-for="page in totalPages" :key="page">
          <button
            v-if="shouldShowPage(page)"
            class="h-9 min-w-9 rounded-full px-2 text-sm font-medium transition-colors"
            :class="currentPage === page ? 'bg-[#393737] text-white' : 'text-[#6c6862] hover:bg-[#f1efec]'"
            @click="currentPage = page"
          >{{ page }}</button>
          <span v-else-if="shouldShowEllipsis(page)" class="px-1 ad-faint">…</span>
        </template>
        <button class="ad-icon-btn" :disabled="currentPage === totalPages" aria-label="Next page" @click="currentPage++">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Log feedback -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="m2m-app m2m-admin modal-overlay" @click.self="showFeedbackModal = false">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
          <div class="modal__header">
            <div>
              <h3 id="feedback-title" class="modal__title">Log feedback</h3>
              <p class="modal__sub">{{ selectedMatch?.user_1?.display_name }} &amp; {{ selectedMatch?.user_2?.display_name }}</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="showFeedbackModal = false">×</button>
          </div>

          <div class="modal__content space-y-5">
            <div>
              <span class="ad-label">Outcome</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in feedbackOptions"
                  :key="status.value"
                  class="h-9 rounded-full border px-4 text-sm font-medium transition-colors"
                  :class="feedbackForm.status === status.value ? 'border-[#393737] bg-[#393737] text-white' : 'border-[#ded9d2] text-[#6c6862] hover:border-[#393737] hover:text-[#393737]'"
                  @click="feedbackForm.status = status.value"
                >{{ status.label }}</button>
              </div>
            </div>

            <div>
              <span class="ad-label">Engagement</span>
              <div class="ad-panel ad-panel--flat !p-4 space-y-3 text-sm">
                <label class="flex cursor-pointer items-center gap-3">
                  <input v-model="feedbackForm.user1Contacted" type="checkbox" class="h-4 w-4" />
                  {{ selectedMatch?.user_1?.display_name }} was contacted
                </label>
                <label class="flex cursor-pointer items-center gap-3">
                  <input v-model="feedbackForm.user2Contacted" type="checkbox" class="h-4 w-4" />
                  {{ selectedMatch?.user_2?.display_name }} was contacted
                </label>
                <label class="flex cursor-pointer items-center gap-3 border-t border-[#ece8e3] pt-3 font-medium">
                  <input v-model="feedbackForm.contactExchanged" type="checkbox" class="h-4 w-4" />
                  They exchanged contact details
                </label>
              </div>
            </div>

            <div v-if="selectedMatch?.user_notes">
              <span class="ad-label">What the member said</span>
              <p class="ad-callout italic">"{{ selectedMatch.user_notes }}"</p>
            </div>

            <div>
              <label class="ad-label" for="feedback-notes">Notes</label>
              <textarea id="feedback-notes" v-model="feedbackForm.notes" rows="3" placeholder="Anything worth remembering about this match" class="form-input resize-none"></textarea>
            </div>
          </div>

          <div class="modal__footer">
            <button class="btn-secondary" @click="showFeedbackModal = false">Cancel</button>
            <button class="btn-primary" :disabled="savingFeedback" @click="saveFeedback">{{ savingFeedback ? 'Saving…' : 'Save feedback' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Ask for feedback by SMS -->
    <Teleport to="body">
      <div v-if="showFeedbackRequestModal" class="m2m-app m2m-admin modal-overlay" @click.self="showFeedbackRequestModal = false">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="request-title">
          <div class="modal__header">
            <div>
              <h3 id="request-title" class="modal__title">Request feedback</h3>
              <p class="modal__sub">{{ targetMatchIds.length ? 'One match' : 'Matched members' }} get an SMS asking how it's going.</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="showFeedbackRequestModal = false">×</button>
          </div>

          <div class="modal__content space-y-5">
            <div v-if="targetMatchIds.length === 0">
              <label class="ad-label" for="request-days">Matched at least</label>
              <select id="request-days" v-model="feedbackRequestForm.daysSinceUnlock" class="ad-select w-full">
                <option :value="0">Any time (testing)</option>
                <option :value="1">1 day ago</option>
                <option :value="3">3 days ago (recommended)</option>
                <option :value="7">7 days ago</option>
                <option :value="14">14 days ago</option>
              </select>
            </div>

            <div>
              <label class="ad-label" for="request-message">Custom message <span class="normal-case tracking-normal font-normal">(optional)</span></label>
              <textarea id="request-message" v-model="feedbackRequestForm.customMessage" rows="3" placeholder="Leave blank to use the default" class="form-input resize-none"></textarea>
              <p class="mt-1.5 text-xs ad-faint">Use {name}, {partner} and {link} to personalise.</p>
            </div>

            <div class="ad-callout">
              <span class="ad-label">Default message</span>
              <p class="italic">"Hey [Name]! How's it going with [Partner]? Let us know here: minutes2match.com/me/connection/[matchId]"</p>
            </div>

            <div v-if="feedbackRequestPreview && !feedbackRequestResult" class="ad-stats !mb-0 !shadow-none">
              <div class="ad-stat">
                <div class="ad-stat__label">Matches</div>
                <div class="ad-stat__value">{{ feedbackRequestPreview.totalMatches }}</div>
              </div>
              <div class="ad-stat">
                <div class="ad-stat__label">SMS to send</div>
                <div class="ad-stat__value">{{ feedbackRequestPreview.totalNotifications }}</div>
              </div>
            </div>

            <div v-if="feedbackRequestResult" class="ad-stats !mb-0 !shadow-none">
              <div class="ad-stat">
                <div class="ad-stat__label">Sent</div>
                <div class="ad-stat__value text-[#1f7a4d]">{{ feedbackRequestResult.sent }}</div>
              </div>
              <div class="ad-stat">
                <div class="ad-stat__label">Failed</div>
                <div class="ad-stat__value" :class="feedbackRequestResult.failed ? 'text-[#b4232a]' : ''">{{ feedbackRequestResult.failed }}</div>
              </div>
            </div>
          </div>

          <div class="modal__footer">
            <button class="btn-secondary" :disabled="sendingFeedbackRequest" @click="previewFeedbackRequest">
              {{ sendingFeedbackRequest && !feedbackRequestPreview ? 'Checking…' : 'Preview' }}
            </button>
            <button class="btn-primary" :disabled="sendingFeedbackRequest || !feedbackRequestPreview" @click="sendFeedbackRequest">
              {{ sendingFeedbackRequest && feedbackRequestPreview ? 'Sending…' : `Send ${feedbackRequestPreview?.totalNotifications || 0} SMS` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Compatibility -->
    <Teleport to="body">
      <div v-if="showCompatibilityModal" class="m2m-app m2m-admin modal-overlay" @click.self="showCompatibilityModal = false">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="compat-title">
          <div class="modal__header">
            <div>
              <h3 id="compat-title" class="modal__title">Compatibility</h3>
              <p class="modal__sub">{{ compatibilityMatch?.user_1?.display_name }} &amp; {{ compatibilityMatch?.user_2?.display_name }}</p>
            </div>
            <button class="modal__close" aria-label="Close" @click="showCompatibilityModal = false">×</button>
          </div>

          <div v-if="compatibilityMatch" class="modal__content space-y-6">
            <div class="text-center">
              <p class="font-display text-[3.25rem] leading-none tracking-tight">{{ compatibilityMatch.match_score ? compatibilityMatch.match_score + '%' : '—' }}</p>
              <p class="mt-2 text-sm ad-muted">{{ compatibilityMatch.created_by === 'system_jit' ? 'Matched on demand' : 'Matched by the system' }}</p>
            </div>

            <div v-if="compatibilityMatch.ai_analysis">
              <span class="ad-label">Why they fit</span>
              <p class="ad-callout italic leading-relaxed">"{{ compatibilityMatch.ai_analysis }}"</p>
            </div>

            <div v-if="compatibilityMatch.match_reasons?.length">
              <span class="ad-label">Strengths</span>
              <ul class="space-y-1.5 text-sm">
                <li v-for="(reason, idx) in compatibilityMatch.match_reasons" :key="idx" class="flex gap-2.5">
                  <span class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f7a4d]"></span>{{ reason }}
                </li>
              </ul>
            </div>

            <div v-if="compatibilityMatch.match_warnings?.length">
              <span class="ad-label">Watch-outs</span>
              <ul class="space-y-1.5 text-sm">
                <li v-for="(warning, idx) in compatibilityMatch.match_warnings" :key="idx" class="flex gap-2.5">
                  <span class="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d08a1e]"></span>{{ warning }}
                </li>
              </ul>
            </div>

            <p v-if="!compatibilityMatch.match_reasons?.length && !compatibilityMatch.match_warnings?.length" class="text-center text-sm ad-faint">
              No scoring details. This match may predate compatibility scoring.
            </p>
          </div>

          <div class="modal__footer">
            <button class="btn-secondary" @click="showCompatibilityModal = false">Close</button>
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

// ---------- Weekly figures (server-side, see /api/admin/weekly-stats) ----------
interface WeekRow {
  weekStart: string
  optedIn: number
  firstTime: number
  skipped: number
  matches: number
  peopleMatched: number
  matchRate: number | null
  connected: number
}
interface PoolRow { members: number; optedIn: number; matched: number; waiting: number }
interface WeeklyStats {
  thisWeek: string
  historyAvailable: boolean
  historyStartsWeek: string | null
  retakeAvailable: boolean
  weeks: Record<'all' | 'accra' | 'nairobi', WeekRow[]>
  pool: Record<'accra' | 'nairobi' | 'other', PoolRow>
  totals: { members: number; optedIn: number; matched: number; waiting: number }
  vibe: { onNew: number; onOld: number; notStarted: number; retakeRequired: number }
}

const stats = ref<WeeklyStats | null>(null)
const statsLoading = ref(true)
const statsError = ref('')

const city = ref<'all' | 'accra' | 'nairobi'>('all')
const cityTabs = [
  { key: 'all' as const, label: 'All cities' },
  ...SERVED_CITIES.map(c => ({ key: c.key, label: c.label }))
]
const cityName = computed(() => SERVED_CITIES.find(c => c.key === city.value)?.label || '')

const fetchStats = async () => {
  statsLoading.value = true
  statsError.value = ''
  try {
    stats.value = await $fetch<WeeklyStats>('/api/admin/weekly-stats', { query: { weeks: 8 } })
  } catch (e: any) {
    console.error('Error fetching weekly stats:', e)
    statsError.value = e?.data?.statusMessage || "Couldn't load the weekly figures."
  } finally {
    statsLoading.value = false
  }
}

const weekRows = computed<WeekRow[]>(() => stats.value?.weeks[city.value] || [])
const thisWeekRow = computed(() => weekRows.value[0])
const pool = computed<PoolRow>(() => {
  if (!stats.value) return { members: 0, optedIn: 0, matched: 0, waiting: 0 }
  return city.value === 'all' ? { ...stats.value.totals } : stats.value.pool[city.value]
})

// Weeks before the opt-in log existed only have match figures
const hasOptInData = (week: string) =>
  !!stats.value && (week === stats.value.thisWeek || (stats.value.historyAvailable && !!stats.value.historyStartsWeek && week >= stats.value.historyStartsWeek))

const vibeTotal = computed(() => (stats.value ? stats.value.vibe.onNew + stats.value.vibe.onOld + stats.value.vibe.notStarted : 0))
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)
const trend = (now: number, before: number) => (now === before ? '' : now > before ? `+${now - before}` : `${now - before}`)
const trendClass = (now: number, before: number) => (now > before ? 'text-[#1f7a4d]' : 'text-[#b4232a]')

const shortDate = (date?: string | null) =>
  date ? new Date(date.length === 10 ? `${date}T00:00:00Z` : date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : ''
const weekRangeLabel = (start?: string) => {
  if (!start) return ''
  const end = new Date(Date.parse(`${start}T00:00:00Z`) + 6 * 86400000).toISOString().slice(0, 10)
  return `${shortDate(start)} – ${shortDate(end)}`
}

// ---------- Vibe Check retake ----------
const requestingRetake = ref(false)
const retakeMessage = ref('')
const requestRetakeForAll = async () => {
  if (!stats.value) return
  const count = stats.value.vibe.onOld + stats.value.vibe.notStarted
  if (!confirm(`Ask ${count} members without the new Vibe Check to take it? Their profiles and earlier answers stay; they'll be taken to the Vibe Check next time they open the app.`)) return
  requestingRetake.value = true
  retakeMessage.value = ''
  try {
    const res = await $fetch<{ updated: number }>('/api/admin/vibe-check/retake', { method: 'POST', body: { scope: 'missing_v2' } })
    retakeMessage.value = `${res.updated} members will retake it next time they open the app.`
    await fetchStats()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Could not update members. Please try again.')
  } finally {
    requestingRetake.value = false
  }
}

// ---------- Outcomes by score ----------
const GOOD_OUTCOMES = ['connected', 'dating']
const outcomeBands = computed(() => {
  const bands = [
    { label: '90 and up', min: 90, max: 101 },
    { label: '80–89', min: 80, max: 90 },
    { label: '70–79', min: 70, max: 80 },
    { label: '60–69', min: 60, max: 70 },
    { label: 'Under 60', min: -1, max: 60 }
  ]
  return bands.map(b => {
    const inBand = matches.value.filter(m => (m.match_score ?? -1) >= b.min && (m.match_score ?? -1) < b.max)
    const answered = inBand.filter(m => m.feedback_status && m.feedback_status !== 'pending')
    const good = answered.filter(m => GOOD_OUTCOMES.includes(m.feedback_status)).length
    return { label: b.label, matches: inBand.length, answered: answered.length, good, rate: pct(good, answered.length) }
  })
})
const outcomeTotals = computed(() => ({
  matches: matches.value.length,
  answered: matches.value.filter(m => m.feedback_status && m.feedback_status !== 'pending').length
}))

const MEMBER_ANSWERS: Record<string, string> = {
  going_well: 'going well',
  chatting: 'chatting',
  no_reply: 'no reply',
  not_a_fit: 'not a fit'
}
const memberAnswerLabel = (answer?: string | null) => (answer ? MEMBER_ANSWERS[answer] || answer : 'no answer')
const firstName = (user: any) => (user?.display_name || 'Member').split(' ')[0]

// ---------- Bios read by AI ----------
const bioStats = reactive({ withBio: 0, analysed: 0 })
const readingBios = ref(false)
const bioProgress = ref('')
const bioMessage = ref('')

const fetchBioStats = async () => {
  const profiles = (supabase as any).schema('m2m').from('profiles')
  const [withBio, analysed] = await Promise.all([
    profiles.select('id', { count: 'exact', head: true }).not('about_me', 'is', null).neq('about_me', ''),
    (supabase as any).schema('m2m').from('profiles').select('id', { count: 'exact', head: true }).not('bio_embeddings', 'is', null)
  ])
  bioStats.withBio = withBio.count || 0
  bioStats.analysed = analysed.error ? 0 : analysed.count || 0
}

// The server reads a batch per request (to stay inside time limits); keep going until none are left
const readRemainingBios = async () => {
  readingBios.value = true
  bioMessage.value = ''
  let processed = 0
  let failed = 0
  try {
    for (let round = 0; round < 30; round++) {
      const res = await $fetch<{ results: { processed: number; failed: number; remaining: number; quotaReached?: boolean } }>('/api/admin/ai/bulk-extract-preferences', { method: 'POST', body: { limit: 10 } })
      processed += res.results.processed
      failed += res.results.failed
      bioProgress.value = `${processed} done`
      if (res.results.quotaReached) {
        bioMessage.value = `Read ${processed}. Gemini's quota is used up for now; try again later to continue.`
        return
      }
      if (res.results.remaining === 0 || res.results.processed === 0) break
    }
    bioMessage.value = `Read ${processed} bio${processed === 1 ? '' : 's'}${failed ? `, ${failed} couldn't be read` : ''}.`
  } catch (e: any) {
    bioMessage.value = e?.data?.statusMessage || 'Stopped early. Try again to continue where it left off.'
  } finally {
    readingBios.value = false
    bioProgress.value = ''
    fetchBioStats()
  }
}

// ---------- Introductions list ----------
const matches = ref<any[]>([])
const loading = ref(true)
const filters = reactive({
  week: '',
  feedbackStatus: '',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = ref(10)
watch([() => filters.week, () => filters.feedbackStatus, () => filters.search, city], () => {
  currentPage.value = 1
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
  { value: 'pending', label: 'Pending' },
  { value: 'connected', label: 'Connected' },
  { value: 'no_response', label: 'No response' },
  { value: 'unmatched', label: 'Unmatched' },
  { value: 'dating', label: 'Dating' }
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

// Compatibility Modal State
const showCompatibilityModal = ref(false)
const compatibilityMatch = ref<any>(null)

const openCompatibilityModal = (match: any) => {
  compatibilityMatch.value = match
  showCompatibilityModal.value = true
}

const getScoreClass = (score: number | null | undefined): string => {
  if (!score) return ''
  if (score >= 60) return 'ad-pill--green'
  if (score >= 40) return 'ad-pill--amber'
  return 'ad-pill--red'
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

// Through the server: members can't read the private feedback and note columns (migration 077),
// and admins use the same browser client, so the full rows come from /api/admin/matches
const fetchMatches = async () => {
  loading.value = true
  try {
    const res = await $fetch<{ matches: any[] }>('/api/admin/matches')
    matches.value = res.matches || []
  } catch (e) {
    console.error('Error fetching matches:', e)
  } finally {
    loading.value = false
  }
}

const filteredMatches = computed(() => {
  const q = filters.search.trim().toLowerCase()
  return matches.value.filter(m => {
    if (city.value !== 'all' && memberCity(m.user_1?.location) !== city.value && memberCity(m.user_2?.location) !== city.value) return false
    if (filters.week && matchWeekKey(m.created_at) !== filters.week) return false
    if (filters.feedbackStatus && (m.feedback_status || 'pending') !== filters.feedbackStatus) return false
    if (q) {
      const haystack = [m.user_1?.display_name, m.user_2?.display_name, m.user_1?.phone, m.user_2?.phone].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

const paginatedMatches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMatches.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredMatches.value.length / itemsPerPage.value))

// Pagination Helpers
const shouldShowPage = (page: number) => {
  if (totalPages.value <= 7) return true
  if (page === 1 || page === totalPages.value) return true
  if (Math.abs(page - currentPage.value) <= 1) return true
  return false
}

const shouldShowEllipsis = (page: number) => {
  if (totalPages.value <= 7) return false
  if (page === 2 && currentPage.value > 4) return true
  if (page === totalPages.value - 1 && currentPage.value < totalPages.value - 3) return true
  return false
}

const formatFeedbackStatus = (status: string | null) => {
  const map: Record<string, string> = {
    pending: 'Pending',
    connected: 'Connected',
    no_response: 'No response',
    unmatched: 'Unmatched',
    dating: 'Dating'
  }
  return map[status || 'pending'] || status || 'Pending'
}

const pairOf = (match: any) => [
  { key: 'u1', user: match.user_1 },
  { key: 'u2', user: match.user_2 }
]

const getFeedbackClass = (status: string | null) => {
  switch (status) {
    case 'connected': return 'ad-pill--green'
    case 'dating': return 'ad-pill--violet'
    case 'no_response': return 'ad-pill--red'
    case 'unmatched': return ''
    default: return 'ad-pill--amber'
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

const confirmDelete = async (match: any) => {
  if (!confirm('Are you sure you want to delete this match? This cannot be undone.')) return
  
  try {
    const { error } = await supabase
      .schema('m2m')
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
  fetchStats()
  fetchMatches()
  fetchBioStats()
})
</script>
