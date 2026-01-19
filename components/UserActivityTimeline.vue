<template>
  <div class="user-timeline">
    <div class="timeline-header">
      <h3 class="text-lg font-bold text-stone-900">Activity Timeline</h3>
      <p class="text-sm text-stone-500">{{ user?.display_name }}'s journey</p>
    </div>

    <div v-if="loading" class="py-8 text-center">
      <div class="w-6 h-6 border-2 border-stone-200 border-t-black rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-stone-500 mt-2">Loading timeline...</p>
    </div>

    <div v-else class="timeline-content">
      <!-- Timeline Items -->
      <div class="timeline-track">
        <div 
          v-for="(item, index) in timeline" 
          :key="item.id"
          class="timeline-item"
          :class="{ 'timeline-item--last': index === timeline.length - 1 }"
        >
          <div class="timeline-dot" :class="`timeline-dot--${item.type}`">
            <!-- Signup -->
            <svg v-if="item.type === 'signup'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <!-- Verified -->
            <svg v-else-if="item.type === 'verified'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <!-- Match -->
            <svg v-else-if="item.type === 'match_created' || item.type === 'match_unlocked'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <!-- Event -->
            <svg v-else-if="item.type === 'event_registered' || item.type === 'event_attended'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <!-- Payment -->
            <svg v-else-if="item.type === 'payment_made'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <!-- SMS -->
            <svg v-else-if="item.type === 'sms_received'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <!-- Profile Update -->
            <svg v-else-if="item.type === 'profile_updated'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <!-- Default -->
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>

          <div class="timeline-line" v-if="index !== timeline.length - 1"></div>

          <div class="timeline-content-item">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="timeline-title">{{ item.title }}</p>
                <p v-if="item.description" class="timeline-desc">{{ item.description }}</p>
              </div>
              <span class="timeline-time">{{ formatTime(item.timestamp) }}</span>
            </div>

            <!-- Extra data based on type -->
            <div v-if="item.data" class="timeline-data">
              <template v-if="item.type === 'match_created' || item.type === 'match_unlocked'">
                <div class="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs font-medium">
                  <span>Matched with {{ item.data.partnerName }}</span>
                </div>
              </template>
              <template v-else-if="item.type === 'event_registered'">
                <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  <span>{{ item.data.eventName }}</span>
                </div>
              </template>
              <template v-else-if="item.type === 'payment_made'">
                <div class="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  <span>GH₵{{ item.data.amount }} - {{ item.data.purpose }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="timeline.length === 0" class="text-center py-8">
        <div class="text-4xl mb-2">📭</div>
        <p class="text-stone-500">No activity recorded yet</p>
      </div>

      <!-- Summary Stats -->
      <div v-if="stats" class="timeline-stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalMatches }}</span>
          <span class="stat-label">Matches</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalEvents }}</span>
          <span class="stat-label">Events</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalPayments }}</span>
          <span class="stat-label">Payments</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.daysSinceJoin }}</span>
          <span class="stat-label">Days Active</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimelineItem {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  data?: any
}

const props = defineProps<{
  userId: string
  user?: any
}>()

const supabase = useSupabaseClient()

const loading = ref(true)
const timeline = ref<TimelineItem[]>([])
const stats = ref<any>(null)

const fetchTimeline = async () => {
  loading.value = true
  const items: TimelineItem[] = []

  // 1. Signup (from profile)
  if (props.user?.created_at) {
    items.push({
      id: 'signup',
      type: 'signup',
      title: 'Joined minutes2match',
      description: 'Account created',
      timestamp: props.user.created_at
    })
  }

  // 2. Verification (if verified)
  if (props.user?.is_verified) {
    items.push({
      id: 'verified',
      type: 'verified',
      title: 'Account verified',
      description: 'Phone number confirmed',
      timestamp: props.user.updated_at || props.user.created_at
    })
  }

  // 3. Matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, created_at, status, unlock_price,
      user_1:user_1_id(display_name),
      user_2:user_2_id(display_name)
    `)
    .or(`user_1_id.eq.${props.userId},user_2_id.eq.${props.userId}`)
    .order('created_at', { ascending: false })

  ;(matches || []).forEach((m: any) => {
    const isUser1 = m.user_1?.display_name === props.user?.display_name
    const partnerName = isUser1 ? m.user_2?.display_name : m.user_1?.display_name

    items.push({
      id: `match-${m.id}`,
      type: 'match_created',
      title: 'New match created',
      description: `Matched for GH₵${m.unlock_price}`,
      timestamp: m.created_at,
      data: { partnerName }
    })

    if (m.status === 'unlocked') {
      items.push({
        id: `match-unlocked-${m.id}`,
        type: 'match_unlocked',
        title: 'Match unlocked!',
        description: 'Both users paid to connect',
        timestamp: m.created_at, // Should be unlock date
        data: { partnerName }
      })
    }
  })

  // 4. Event registrations
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`
      id, created_at,
      event:event_id(title)
    `)
    .eq('user_id', props.userId)
    .order('created_at', { ascending: false })

  ;(registrations || []).forEach((r: any) => {
    items.push({
      id: `event-${r.id}`,
      type: 'event_registered',
      title: 'Registered for event',
      timestamp: r.created_at,
      data: { eventName: r.event?.title }
    })
  })

  // 5. Payments
  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, purpose, created_at')
    .eq('user_id', props.userId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })

  ;(payments || []).forEach((p: any) => {
    items.push({
      id: `payment-${p.id}`,
      type: 'payment_made',
      title: 'Payment successful',
      timestamp: p.created_at,
      data: { amount: p.amount, purpose: p.purpose?.replace('_', ' ') }
    })
  })

  // 6. SMS received
  const { data: smsHistory } = await supabase
    .from('sms_history')
    .select('id, message, created_at')
    .eq('recipient_id', props.userId)
    .order('created_at', { ascending: false })
    .limit(5)

  ;(smsHistory || []).forEach((s: any) => {
    items.push({
      id: `sms-${s.id}`,
      type: 'sms_received',
      title: 'SMS received',
      description: s.message?.substring(0, 50) + (s.message?.length > 50 ? '...' : ''),
      timestamp: s.created_at
    })
  })

  // Sort by timestamp descending
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  timeline.value = items

  // Calculate stats
  const daysSinceJoin = props.user?.created_at
    ? Math.floor((Date.now() - new Date(props.user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  stats.value = {
    totalMatches: (matches || []).length,
    totalEvents: (registrations || []).length,
    totalPayments: (payments || []).length,
    daysSinceJoin
  }

  loading.value = false
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
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  if (props.userId) {
    fetchTimeline()
  }
})

watch(() => props.userId, (newId) => {
  if (newId) {
    fetchTimeline()
  }
})
</script>

<style scoped>
.user-timeline {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
}

.timeline-header {
  margin-bottom: 1.5rem;
}

.timeline-track {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item--last {
  padding-bottom: 0;
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.timeline-dot--signup { background: #DBEAFE; color: #2563EB; }
.timeline-dot--verified { background: #D1FAE5; color: #059669; }
.timeline-dot--match_created,
.timeline-dot--match_unlocked { background: #FCE7F3; color: #DB2777; }
.timeline-dot--event_registered,
.timeline-dot--event_attended { background: #EDE9FE; color: #7C3AED; }
.timeline-dot--payment_made { background: #FEF3C7; color: #D97706; }
.timeline-dot--sms_received { background: #E0E7FF; color: #4F46E5; }
.timeline-dot--profile_updated { background: #F3F4F6; color: #6B7280; }

.timeline-line {
  position: absolute;
  left: 17px;
  top: 36px;
  bottom: 0;
  width: 2px;
  background: #E5E7EB;
  z-index: 1;
}

.timeline-content-item {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #111827;
  margin: 0;
}

.timeline-desc {
  font-size: 0.8125rem;
  color: #6B7280;
  margin: 0.125rem 0 0;
}

.timeline-time {
  font-size: 0.75rem;
  color: #9CA3AF;
  white-space: nowrap;
}

.timeline-data {
  margin-top: 0.5rem;
}

/* Stats */
.timeline-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.stat-label {
  display: block;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}
</style>
