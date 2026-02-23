<template>
  <div class="max-w-2xl mx-auto py-8">
    <Head>
      <Title>Inbox | Minutes 2 Match</Title>
    </Head>

    <div class="flex items-center justify-between mb-8">
       <div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight dark:text-white">Your Inbox</h2>
          <p class="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1">Updates, match reveals, and event alerts.</p>
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
                <div class="flex items-center justify-between gap-4 mb-0.5">
                   <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{{ formatDateRelative(notification.created_at) }}</p>
                   <span v-if="!notification.read" class="w-2 h-2 bg-rose-500 rounded-full"></span>
                </div>
                <h4 class="font-bold text-black dark:text-white truncate">{{ notification.title }}</h4>
                <p class="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">{{ notification.message }}</p>
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
    if (!notification.read) markAsRead(notification.id)
    
    // Logic to navigate if notification has a target
    if (notification.data?.match_id) navigateTo(`/me/connection/${notification.data.match_id}`)
    else if (notification.data?.event_id) navigateTo('/events')
    else if (notification.type === 'profile_reminder') navigateTo('/me')
}
</script>
