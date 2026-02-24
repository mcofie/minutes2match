<template>
  <div class="min-h-screen bg-[#FFFCF8] text-stone-900">
    <!-- Fonts -->
    <Head>
      <title>Release Notes | Minutes 2 Match</title>
    </Head>

    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-[#FFFCF8] border-b border-black">
      <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo-full.png" alt="minutes2match" class="h-16 w-auto object-contain hover:opacity-80 transition-opacity" />
        </NuxtLink>
        <NuxtLink to="/" class="text-sm font-bold uppercase tracking-widest hover:text-rose-500 transition-colors">
          ← Back to Home
        </NuxtLink>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto px-6 py-16">
      <div class="mb-12">
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">Release Notes</h1>
        <p class="text-stone-500 text-sm uppercase tracking-widest">Tracking the evolution of connection</p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="py-12 text-center text-stone-400 font-medium">
        Loading updates...
      </div>

      <!-- Release Feed -->
      <div v-else class="space-y-16">
        <article v-for="release in releases" :key="release.version" class="border-b border-stone-200 pb-16 last:border-0">
          <header class="mb-8">
            <div class="flex items-center gap-4 mb-2">
              <span class="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-bold uppercase tracking-widest border border-rose-100 rounded">v{{ release.version }}</span>
              <time class="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{{ release.display_date }}</time>
            </div>
            <h2 class="text-3xl font-serif font-bold">Version {{ release.version }} Update</h2>
          </header>

          <div class="space-y-10">
            <!-- What's New -->
            <section v-if="release.whatsNew?.length">
              <h3 class="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                What's New
              </h3>
              <div class="space-y-6">
                <div v-for="(item, i) in release.whatsNew" :key="i" class="flex gap-4">
                  <span class="text-2xl mt-1">{{ item.emoji }}</span>
                  <div>
                    <h4 class="font-bold text-stone-900 mb-1 uppercase text-xs tracking-wider">{{ item.title }}</h4>
                    <p class="text-stone-600 text-sm leading-relaxed">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Improvements -->
            <section v-if="release.improvements?.length">
              <h3 class="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
                Improvements
              </h3>
              <div class="grid md:grid-cols-2 gap-6">
                <div v-for="(item, i) in release.improvements" :key="i" class="p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <h4 class="font-bold text-stone-800 text-xs mb-1 uppercase tracking-wider">{{ item.title }}</h4>
                  <p class="text-stone-500 text-[12px] leading-relaxed">{{ item.description }}</p>
                </div>
              </div>
            </section>

            <!-- Fixes -->
            <section v-if="release.fixes?.length">
              <h3 class="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Fixes & Stability</h3>
              <ul class="space-y-2">
                <li v-for="(item, i) in release.fixes" :key="i" class="flex gap-3 text-sm text-stone-600">
                  <span class="text-stone-300">•</span>
                  {{ item }}
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>

      <!-- No Results -->
      <div v-if="!pending && (!releases || releases.length === 0)" class="py-20 text-center text-stone-400 italic">
        No release notes found.
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-stone-200 bg-white/80 mt-16">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-stone-400 font-medium whitespace-nowrap">
            © {{ new Date().getFullYear() }} Minutes 2 Match. <span class="ml-2 opacity-50">v{{ config.public.appVersion }}</span>
          </p>
          <div class="flex items-center gap-6">
            <a href="https://www.instagram.com/minutes2match" target="_blank" class="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium">Instagram</a>
            <NuxtLink to="/terms" class="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium" active-class="!text-rose-500 !font-bold">Terms</NuxtLink>
            <NuxtLink to="/privacy" class="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium" active-class="!text-rose-500 !font-bold">Privacy</NuxtLink>
            <NuxtLink to="/release-notes" class="text-xs text-stone-400 hover:text-rose-500 transition-colors font-medium" active-class="!text-rose-500 !font-bold">Updates</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { data: releases, pending } = await useAsyncData('release-notes', () => 
  queryCollection('releaseNotes')
    .order('date', 'DESC')
    .all()
)
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
