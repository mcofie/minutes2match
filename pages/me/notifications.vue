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
        <h1 class="text-xl font-bold tracking-tight">Messages</h1>
      </div>
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
        <h3 class="text-lg font-bold text-stone-900 dark:text-stone-100">No messages yet</h3>
        <p class="text-stone-500 dark:text-stone-400 mt-2 text-sm">You haven't received any notifications usually.</p>
      </div>

      <!-- Message List -->
      <div v-else class="space-y-4">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          class="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-black dark:hover:border-stone-600 transition-colors group"
        >
          <div class="flex items-start gap-4">
            <div class="mt-1 w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-xl flex-shrink-0 border border-rose-100 dark:border-rose-900/30">
              💬
            </div>
            <div class="flex-1">
              <p class="text-stone-800 dark:text-stone-200 leading-relaxed text-sm md:text-base">{{ msg.message }}</p>
              <div class="flex items-center gap-2 mt-3 text-xs font-medium text-stone-400 font-mono tracking-wide">
                <span>{{ formatDate(msg.created_at) }}</span>
                <span>•</span>
                <span class="capitalize" :class="{
                  'text-amber-500': msg.status === 'pending',
                  'text-green-500': msg.status === 'sent',
                  'text-red-500': msg.status === 'failed'
                }">{{ msg.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: messages, pending } = await useFetch('/api/me/notifications')

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-GH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}
</script>
