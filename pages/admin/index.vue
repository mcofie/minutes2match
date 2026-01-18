<template>
  <div>
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="admin-card stat-card stat-card--users">
        <div class="stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-5.341"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-value">{{ stats.totalUsers }}</span>
          <span class="stat-label">Total Users</span>
        </div>
        <div class="stat-card__trend stat-card__trend--up" v-if="stats.newUsersThisWeek > 0">
          +{{ stats.newUsersThisWeek }} this week
        </div>
      </div>
      
      <div class="admin-card stat-card stat-card--verified">
        <div class="stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-value">{{ stats.verifiedUsers }}</span>
          <span class="stat-label">Verified</span>
        </div>
        <div class="stat-card__rate">
          {{ verificationRate }}% rate
        </div>
      </div>
      
      <div class="admin-card stat-card stat-card--matches">
        <div class="stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-value">{{ stats.totalMatches }}</span>
          <span class="stat-label">Total Matches</span>
        </div>
        <div class="stat-card__breakdown">
          <span class="text-green-600">{{ stats.unlockedMatches }} unlocked</span>
        </div>
      </div>
      
      <div class="admin-card stat-card stat-card--revenue">
        <div class="stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-dollar-sign"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="stat-card__content">
          <span class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</span>
          <span class="stat-label">Total Revenue</span>
        </div>
        <div class="stat-card__breakdown">
          <span class="text-blue-600">{{ stats.totalPayments }} payments</span>
        </div>
      </div>
    </div>

    <!-- Revenue Breakdown & Match Funnel -->
    <div class="analytics-grid">
      <!-- Revenue Breakdown -->
      <section class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title">Revenue Breakdown</h2>
        </div>
        
        <div class="revenue-breakdown">
          <div class="revenue-item">
            <div class="revenue-item__header">
              <span class="revenue-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-tag"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
              </span>
              <span class="revenue-item__label">Event Tickets</span>
            </div>
            <div class="revenue-item__value">{{ formatCurrency(stats.eventRevenue) }}</div>
            <div class="revenue-item__bar">
              <div class="revenue-item__fill revenue-item__fill--events" :style="{ width: eventRevenuePercent + '%' }"></div>
            </div>
          </div>
          
          <div class="revenue-item">
            <div class="revenue-item__header">
              <span class="revenue-item__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-unlock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
              </span>
              <span class="revenue-item__label">Match Unlocks</span>
            </div>
            <div class="revenue-item__value">{{ formatCurrency(stats.matchRevenue) }}</div>
            <div class="revenue-item__bar">
              <div class="revenue-item__fill revenue-item__fill--matches" :style="{ width: matchRevenuePercent + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Weekly Revenue Chart (Simple) -->
        <div class="weekly-chart">
          <h4 class="text-sm font-bold text-muted mb-3">Last 7 Days</h4>
          <div class="chart-bars">
            <div v-for="day in weeklyRevenue" :key="day.date" class="chart-bar-wrapper">
              <div class="chart-bar" :style="{ height: day.height + '%' }">
                <span class="chart-bar__value" v-if="day.amount > 0">{{ day.amount }}</span>
              </div>
              <span class="chart-bar__label">{{ day.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Match Funnel -->
      <section class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title">Match Funnel</h2>
        </div>
        
        <div class="match-funnel">
          <div class="funnel-stage">
            <div class="funnel-stage__bar funnel-stage__bar--created" :style="{ width: '100%' }"></div>
            <div class="funnel-stage__info">
              <span class="funnel-stage__value">{{ stats.totalMatches }}</span>
              <span class="funnel-stage__label">Matches Created</span>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="funnel-stage__bar funnel-stage__bar--partial" :style="{ width: partialPaymentPercent + '%' }"></div>
            <div class="funnel-stage__info">
              <span class="funnel-stage__value">{{ stats.partialPaymentMatches }}</span>
              <span class="funnel-stage__label">Partial Payment</span>
            </div>
          </div>
          
          <div class="funnel-stage">
            <div class="funnel-stage__bar funnel-stage__bar--unlocked" :style="{ width: unlockedPercent + '%' }"></div>
            <div class="funnel-stage__info">
              <span class="funnel-stage__value">{{ stats.unlockedMatches }}</span>
              <span class="funnel-stage__label">Fully Unlocked</span>
            </div>
          </div>
        </div>

        <div class="funnel-conversion">
          <div class="conversion-stat">
            <span class="conversion-stat__value">{{ conversionRate }}%</span>
            <span class="conversion-stat__label">Conversion Rate</span>
          </div>
          <div class="conversion-stat">
            <span class="conversion-stat__value">{{ avgUnlockPrice }}</span>
            <span class="conversion-stat__label">Avg. Unlock Price</span>
          </div>
        </div>
      </section>
    </div>

    <div class="dashboard-grid">
      <!-- Recent Activity -->
      <section class="admin-card">
        <div class="admin-card__header">
          <h2 class="admin-card__title flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Recent Activity
          </h2>
        </div>
        
        <div class="activity-list">
          <div v-if="loading" class="state-loading py-8">Loading...</div>
          
          <div v-else-if="recentActivity.length === 0" class="state-empty py-8">
            No recent activity
          </div>
          
          <div v-else class="activity-items">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <span class="activity-icon" :class="`activity-icon--${activity.type}`">
                <!-- Signup Icon -->
                <svg v-if="activity.type === 'signup'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                <!-- Payment Icon -->
                <svg v-else-if="activity.type === 'payment'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-dollar-sign"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <!-- Match Icon -->
                <svg v-else-if="activity.type === 'match'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <!-- Event Icon -->
                <svg v-else-if="activity.type === 'event'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <!-- Default Icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bell"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </span>
              <div class="activity-content">
                <p class="activity-text">{{ activity.message }}</p>
                <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="admin-card h-fit">
        <div class="admin-card__header">
          <h2 class="admin-card__title flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Quick Actions
          </h2>
        </div>
        
        <div class="actions-grid">
          <NuxtLink to="/admin/matches/matchmaker" class="quick-action quick-action--primary">
            <span class="quick-action-icon">
              <!-- Auto Matchmaker Icon (CPU/Bot) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-cpu"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </span>
            <div>
              <span class="quick-action-text">Auto Matchmaker</span>
              <span class="quick-action-desc">AI-powered matching</span>
            </div>
          </NuxtLink>
          <NuxtLink to="/admin/matches/matchmaker" class="quick-action">
            <span class="quick-action-icon">
             <!-- Manual Match Icon (Target/Crosshair) -->
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-crosshair"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
            </span>
            <span class="quick-action-text">Manual Match</span>
          </NuxtLink>
          <NuxtLink to="/admin/matches" class="quick-action">
            <span class="quick-action-icon">
              <!-- All Matches Icon (List) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-list"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </span>
            <span class="quick-action-text">View All Matches</span>
          </NuxtLink>
          <NuxtLink to="/admin/events" class="quick-action">
            <span class="quick-action-icon">
              <!-- Events Icon (Calendar) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </span>
            <span class="quick-action-text">Manage Events</span>
          </NuxtLink>
          <NuxtLink to="/admin/users" class="quick-action">
            <span class="quick-action-icon">
              <!-- Users Icon (Users) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-3-5H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-5.341"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <span class="quick-action-text">Browse Users</span>
          </NuxtLink>
        </div>

        <!-- Users Waiting -->
        <div class="waiting-users" v-if="waitingUsers.length > 0">
          <h4 class="text-sm font-bold text-muted mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Waiting for Matches
          </h4>
          <div class="waiting-list">
            <div v-for="user in waitingUsers.slice(0, 5)" :key="user.id" class="waiting-user">
              <div class="waiting-user__avatar">{{ user.display_name?.charAt(0) }}</div>
              <div class="waiting-user__info">
                <span class="waiting-user__name">{{ user.display_name }}</span>
                <span class="waiting-user__days">{{ getWaitingDays(user.created_at) }} days</span>
              </div>
            </div>
          </div>
          <NuxtLink to="/admin/matches/matchmaker" class="text-sm text-brand font-bold mt-3 block">
            Match them now →
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const supabase = useSupabaseClient()

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
  avgUnlockPrice: 0
})
const recentActivity = ref<any[]>([])
const waitingUsers = ref<any[]>([])
const weeklyRevenue = ref<any[]>([])

// Computed
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

const partialPaymentPercent = computed(() => {
  if (!stats.totalMatches) return 0
  return Math.round((stats.partialPaymentMatches / stats.totalMatches) * 100)
})

const unlockedPercent = computed(() => {
  if (!stats.totalMatches) return 0
  return Math.round((stats.unlockedMatches / stats.totalMatches) * 100)
})

const conversionRate = computed(() => {
  if (!stats.totalMatches) return 0
  return Math.round((stats.unlockedMatches / stats.totalMatches) * 100)
})

const avgUnlockPrice = computed(() => {
  return formatCurrency(stats.avgUnlockPrice)
})

// Fetch stats
const fetchStats = async () => {
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  stats.totalUsers = totalUsers || 0

  // Verified users
  const { count: verifiedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)
  
  stats.verifiedUsers = verifiedUsers || 0

  // New users this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo)
  
  stats.newUsersThisWeek = newUsers || 0

  // Match stats
  const { data: rawMatches } = await supabase
    .from('matches')
    .select('status, unlock_price')
  
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
    .from('payments')
    .select('amount, purpose, created_at')
    .eq('status', 'success')
  
  const payments = rawPayments as any[] || []
  if (payments.length) {
    stats.totalPayments = payments.length
    stats.totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.eventRevenue = payments.filter(p => p.purpose === 'event_ticket').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    stats.matchRevenue = payments.filter(p => p.purpose === 'match_unlock').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    
    // Weekly revenue
    const days: Record<string, number> = {}
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = date.toISOString().split('T')[0]
      days[key] = 0
    }
    
    payments.forEach(p => {
      const key = new Date(p.created_at).toISOString().split('T')[0]
      if (days[key] !== undefined) {
        days[key] += parseFloat(p.amount)
      }
    })
    
    const maxAmount = Math.max(...Object.values(days), 1)
    weeklyRevenue.value = Object.entries(days).map(([date, amount]) => ({
      date,
      amount: Math.round(amount),
      height: (amount / maxAmount) * 100,
      label: dayLabels[new Date(date).getDay()]
    }))
  }
}

// Fetch recent activity
const fetchRecentActivity = async () => {
  loading.value = true
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, purpose, created_at')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: matchesCreated } = await supabase
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
   .slice(0, 10)

  recentActivity.value = activities
  loading.value = false
}

// Fetch users waiting for matches
const fetchWaitingUsers = async () => {
  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('is_verified', true)
    .order('created_at', { ascending: true })
    .limit(10)
  
  // Filter out users who already have matches
  const { data: rawMatches } = await supabase
    .from('matches')
    .select('user_1_id, user_2_id')
  
  const matches = rawMatches as any[] || []
  const matchedUserIds = new Set<string>()
  matches.forEach(m => {
    if (m.user_1_id) matchedUserIds.add(m.user_1_id)
    if (m.user_2_id) matchedUserIds.add(m.user_2_id)
  })
  
  waitingUsers.value = (users || []).filter(u => !matchedUserIds.has(u.id))
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

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentActivity(),
    fetchWaitingUsers()
  ])
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.stat-card__icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 12px;
  font-size: 1.5rem;
}

.stat-card--users .stat-card__icon { background: #DBEAFE; }
.stat-card--verified .stat-card__icon { background: #D1FAE5; }
.stat-card--matches .stat-card__icon { background: #FCE7F3; }
.stat-card--revenue .stat-card__icon { background: #FEF3C7; }

.stat-card__content {
  flex: 1;
}

.stat-value {
  display: block;
  font-family: inherit;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  font-weight: 600;
}

.stat-card__trend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
}

.stat-card__trend--up {
  background: #D1FAE5;
  color: #059669;
}

.stat-card__rate,
.stat-card__breakdown {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1024px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

/* Revenue Breakdown */
.revenue-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.revenue-item__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.revenue-item__icon {
  font-size: 1.25rem;
}

.revenue-item__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.revenue-item__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.revenue-item__bar {
  height: 8px;
  background: #F3F4F6;
  border-radius: 99px;
  overflow: hidden;
}

.revenue-item__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.revenue-item__fill--events { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.revenue-item__fill--matches { background: linear-gradient(90deg, #EC4899, #F472B6); }

/* Weekly Chart */
.weekly-chart {
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100px;
  gap: 0.5rem;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(180deg, #000000, #374151);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  position: relative;
  transition: height 0.3s ease;
}

.chart-bar__value {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.chart-bar__label {
  margin-top: 0.5rem;
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Match Funnel */
.match-funnel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.funnel-stage {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.funnel-stage__bar {
  height: 24px;
  border-radius: 4px;
  min-width: 20px;
  transition: width 0.5s ease;
}

.funnel-stage__bar--created { background: #E5E7EB; }
.funnel-stage__bar--partial { background: #FCD34D; }
.funnel-stage__bar--unlocked { background: #10B981; }

.funnel-stage__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.funnel-stage__value {
  font-size: 1.25rem;
  font-weight: 700;
}

.funnel-stage__label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.funnel-conversion {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.conversion-stat__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #10B981;
}

.conversion-stat__label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Activity */
.activity-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
  transition: background 0.2s;
}

.activity-item:hover {
  background: #F3F4F6;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  font-size: 1.25rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #E5E7EB;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-main);
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Quick Actions */
.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  text-decoration: none;
  color: var(--color-text-main);
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.quick-action:hover {
  background: white;
  border-color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.quick-action--primary {
  background: #000;
  color: white;
  border-color: #000;
}

.quick-action--primary:hover {
  background: #111;
  border-color: #000;
}

.quick-action-icon {
  font-size: 1.5rem;
}

.quick-action-text {
  font-weight: 600;
  font-size: 0.9375rem;
}

.quick-action-desc {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Waiting Users */
.waiting-users {
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.waiting-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.waiting-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #FEF3C7;
  border-radius: 8px;
}

.waiting-user__avatar {
  width: 2rem;
  height: 2rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.waiting-user__info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.waiting-user__name {
  font-size: 0.875rem;
  font-weight: 600;
}

.waiting-user__days {
  font-size: 0.75rem;
  color: #B45309;
  font-weight: 700;
}

.text-green-600 { color: #059669; }
.text-blue-600 { color: #2563EB; }
.text-brand { color: var(--color-brand-primary); }
.h-fit { height: fit-content; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mt-3 { margin-top: 0.75rem; }
</style>
