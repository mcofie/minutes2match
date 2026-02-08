<template>
  <div class="min-h-screen bg-[#FFFCF8] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-300">
    <Head>
      <Title>Notifications | Minutes 2 Match</Title>
    </Head>

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-[#FFFCF8]/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <NuxtLink to="/me" class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 transition-colors shadow-sm">
          <svg class="w-5 h-5 text-stone-600 dark:text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <h1 class="text-xl font-bold tracking-tight">Notifications</h1>
      </div>
      
      <!-- Mark All Read -->
      <button 
        v-if="hasUnread" 
        @click="markAllRead"
        class="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest"
      >
        Mark All Read
      </button>
    </header>

    <main class="max-w-2xl mx-auto px-6 py-8">
      <!-- Loading State -->
      <div v-if="pending" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white dark:bg-stone-900 rounded-xl p-4 border border-stone-200 dark:border-stone-800 animate-pulse">
          <div class="h-4 bg-stone-100 dark:bg-stone-800 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-stone-50 dark:bg-stone-800 rounded w-1/4"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!messages || messages.length === 0" class="text-center py-20">
        <div class="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          📭
        </div>
        <h3 class="text-lg font-bold text-stone-900 dark:text-stone-100">No notifications yet</h3>
        <p class="text-stone-500 dark:text-stone-400 mt-2 text-sm">You'll see updates about matches, badges, and events here.</p>
      </div>

      <!-- Notification List -->
      <div v-else class="space-y-4">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          class="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-black dark:hover:border-stone-600 transition-colors group"
          :class="{ 'border-l-4 border-l-rose-500': !msg.read }"
          @click="markAsRead(msg)"
        >
          <div class="flex items-start gap-4">
            <div 
              class="mt-1 w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 border"
              :class="getNotificationStyle(msg.type)"
            >
              {{ getNotificationIcon(msg.type) }}
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm text-stone-900 dark:text-stone-100 mb-1">{{ msg.title }}</p>
              <p class="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">{{ msg.message }}</p>
              <div class="flex items-center gap-2 mt-3 text-xs font-medium text-stone-400 font-mono tracking-wide">
                <span>{{ formatDate(msg.created_at) }}</span>
                <span v-if="!msg.read" class="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold uppercase">New</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const { data: messages, pending, refresh } = await useFetch('/api/me/notifications')

const hasUnread = computed(() => {
  return messages.value?.some((m: any) => !m.read) || false
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'badge_earned': return '🏆'
    case 'match_created': return '💕'
    case 'match_unlocked': return '🔓'
    case 'event_reminder': return '📅'
    case 'sms': return '💬'
    default: return '🔔'
  }
}

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'badge_earned': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30'
    case 'match_created': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'
    case 'match_unlocked': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30'
    case 'event_reminder': return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30'
    default: return 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return new Intl.DateTimeFormat('en-GH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

const markAsRead = async (msg: any) => {
  if (msg.read || msg.type === 'sms') return
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', msg.id)
  
  msg.read = true
}

const markAllRead = async () => {
  const unreadIds = messages.value?.filter((m: any) => !m.read && m.type !== 'sms').map((m: any) => m.id) || []
  
  if (unreadIds.length === 0) return
  
  await supabase
    .from('notifications')
    .update({ read: true })
    .in('id', unreadIds)
  
  messages.value?.forEach((m: any) => {
    if (!m.read) m.read = true
  })
}
</script>
