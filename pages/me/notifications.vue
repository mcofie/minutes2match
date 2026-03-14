<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-0">
    <Head>
      <Title>Inbox | Minutes 2 Match</Title>
    </Head>

    <NuxtLink 
      to="/me"
      class="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-black dark:hover:text-white transition-colors py-2 mb-2 w-fit"
    >
      ← Back
    </NuxtLink>

    <div class="flex items-center justify-between mb-8">
       <div>
          <h2 class="text-2xl font-bold tracking-tight dark:text-white leading-none">Your Inbox</h2>
          <p class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-300 mt-1.5 flex items-center gap-2">
            <span>Updates</span>
            <span class="w-1 h-1 bg-stone-200 rounded-full"></span>
            <span>Match Reveals</span>
            <span class="w-1 h-1 bg-stone-200 rounded-full"></span>
            <span>Alerts</span>
          </p>
       </div>
       <button 
         v-if="unreadCount > 0"
         @click="markAllAsRead"
         class="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
       >
         Mark all as read
       </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && notifications.length === 0" class="space-y-6">
       <div v-for="i in 5" :key="i" class="h-28 bg-white dark:bg-stone-900 border-2 border-black dark:border-stone-700 rounded-xl animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="text-center py-20 bg-white dark:bg-stone-900 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl">
       <div class="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
       <h3 class="text-lg font-bold text-black dark:text-white">Your inbox is clear</h3>
       <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">We'll let you know when the magic happens.</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
       <div 
         v-for="notification in notifications" 
         :key="notification.id"
         @click="handleNotificationClick(notification)"
         class="group bg-white dark:bg-stone-900 p-4 rounded-xl border transition-all cursor-pointer"
         :class="[
           notification.read 
             ? 'border-stone-100 dark:border-stone-800 opacity-60' 
             : 'border-stone-200 dark:border-stone-700 shadow-sm hover:border-black dark:hover:border-stone-500'
         ]"
       >
          <div class="flex gap-4">
             <div 
               class="w-10 h-10 rounded-lg border flex items-center justify-center text-xl shrink-0"
               :class="getIconContainerClass(notification.type)"
             >
                {{ getIcon(notification.type) }}
             </div>
             <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-4 mb-1">
                   <p class="text-[9px] font-bold text-stone-400 dark:text-stone-300 uppercase tracking-widest">{{ formatDateRelative(notification.created_at) }}</p>
                   <span v-if="!notification.read" class="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                </div>
                <h4 class="text-sm font-bold text-black dark:text-white mb-0.5">{{ notification.title }}</h4>
                <p 
                  class="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed transition-all duration-300"
                  :class="{ 'line-clamp-2': !isExpanded(notification.id) }"
                >
                  {{ notification.message }}
                </p>
                <div v-if="isTruncated(notification.message) && !isExpanded(notification.id)" class="mt-2 text-[9px] font-bold text-stone-400 dark:text-stone-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span class="w-4 h-px bg-stone-100 dark:bg-stone-800"></span>
                  Read more
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'me',
  middleware: ['auth']
})

const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

// Local state for expanded messages
const expandedIds = ref<Set<string>>(new Set())

const toggleExpand = (id: string) => {
    if (expandedIds.value.has(id)) {
        expandedIds.value.delete(id)
    } else {
        expandedIds.value.add(id)
    }
}

const isExpanded = (id: string) => expandedIds.value.has(id)

const isTruncated = (msg: string) => msg && msg.length > 80 // Simple heuristic for truncation UI hint

onMounted(async () => {
    const { initDashboard } = useDashboard()
    await initDashboard()
    fetchNotifications()
})

const getIcon = (type: string) => {
    switch (type) {
        case 'badge_earned': return '🏆'
        case 'match_created': return '💕'
        case 'match_unlocked': return '🔓'
        case 'event_reminder': return '📅'
        case 'profile_reminder': return '✍️'
        case 'sms': return '💬'
        default: return '🔔'
    }
}

const getIconContainerClass = (type: string) => {
    switch (type) {
        case 'badge_earned': return 'bg-amber-100 border-amber-300'
        case 'match_created': return 'bg-rose-100 border-rose-300'
        case 'match_unlocked': return 'bg-emerald-100 border-emerald-300'
        case 'event_reminder': return 'bg-indigo-100 border-indigo-300'
        case 'profile_reminder': return 'bg-orange-100 border-orange-300'
        default: return 'bg-stone-100 border-stone-300 dark:bg-stone-800 dark:border-stone-700'
    }
}

const formatDateRelative = (dateString: string) => {
    const date = new Date(dateString)
    const diff = Date.now() - date.getTime()
    const diffMins = Math.floor(diff / (1000 * 60))
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const handleNotificationClick = (notification: any) => {
    // 1. Mark as read
    if (!notification.read) markAsRead(notification.id)
    
    // 2. Toggle expand if it's potentially long
    if (isTruncated(notification.message)) {
        toggleExpand(notification.id)
    }
    
    // 3. Navigate if it's meant to take you somewhere
    if (notification.data?.match_id) navigateTo(`/me/connection/${notification.data.match_id}`)
    else if (notification.data?.event_id) navigateTo('/events')
    else if (notification.type === 'profile_reminder') navigateTo('/me')
}
</script>
