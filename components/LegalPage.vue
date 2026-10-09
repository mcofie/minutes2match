<template>
  <main class="m2m-app letter-page min-h-screen min-h-dvh bg-[#f7f7f7] text-[#393737]">
    <Head>
      <Title>{{ title }} | Minutes 2 Match</Title>
    </Head>

    <!-- Header: back on the left, logo centred (same as the rest of the app) -->
    <header class="sticky top-0 z-50 border-b border-black/[0.04] bg-white/85 backdrop-blur-md">
      <div class="relative mx-auto flex h-14 max-w-6xl items-center px-4 sm:h-16 sm:px-6">
        <NuxtLink to="/" aria-label="Back to home" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#393737] ring-1 ring-black/10 transition-colors hover:bg-[#fafafa]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </NuxtLink>
        <NuxtLink to="/" aria-label="Minutes 2 Match home" class="absolute left-1/2 top-1/2 block h-7 w-[124px] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity hover:opacity-80 sm:h-8 sm:w-[140px]">
          <NuxtImg format="webp" src="/logo-full.png" alt="Minutes 2 Match" class="absolute left-1/2 top-1/2 h-[90px] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none sm:h-[102px]" />
        </NuxtLink>
      </div>
    </header>

    <!-- Title -->
    <section class="px-4 pb-8 pt-12 text-center sm:px-6 sm:pb-12 sm:pt-16">
      <nav aria-label="Legal" class="inline-flex items-center gap-1 rounded-full bg-[#ecebe8] p-1">
        <NuxtLink
          v-for="doc in DOCS"
          :key="doc.to"
          :to="doc.to"
          class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="route.path === doc.to ? 'bg-white text-[#393737] shadow-[0_2px_8px_rgba(52,38,25,0.08)]' : 'text-[#6c6862] hover:text-[#393737]'"
        >{{ doc.label }}</NuxtLink>
      </nav>
      <h1 class="font-display mx-auto mt-6 max-w-2xl text-[2.5rem] leading-[1.05] tracking-tight text-[#393737] sm:text-[3.75rem]">{{ title }}</h1>
      <p class="mt-3 text-sm text-[#9b9690]">Last updated {{ updated }}</p>
      <p v-if="intro" class="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#6c6862] sm:text-lg">{{ intro }}</p>
    </section>

    <!-- The document -->
    <article class="legal-body mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24">
      <slot />
    </article>

    <!-- Footer: one quiet line -->
    <footer class="border-t border-black/[0.05] px-4 py-6 sm:px-6">
      <p class="text-center text-xs text-[#b5b0aa]">
        <a href="mailto:hello@minutes2match.com" class="transition-colors hover:text-[#393737]">Help</a>
        <span class="mx-2" aria-hidden="true">·</span>
        <NuxtLink to="/terms" class="transition-colors hover:text-[#393737]">Terms</NuxtLink>
        <span class="mx-2" aria-hidden="true">·</span>
        <NuxtLink to="/privacy" class="transition-colors hover:text-[#393737]">Privacy</NuxtLink>
        <span class="mx-2" aria-hidden="true">·</span>
        © {{ new Date().getFullYear() }} Minutes 2 Match
      </p>
    </footer>
  </main>
</template>

<script setup lang="ts">
defineProps<{ title: string; updated: string; intro?: string }>()
const route = useRoute()
const DOCS = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
]
</script>

<style scoped>
/* Reading styles for the document, same type as the match letter */
.legal-body {
  font-weight: 500;
  letter-spacing: -0.025em;
}
.legal-body :deep(section) {
  padding-top: 2.25rem;
  margin-top: 2.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.legal-body :deep(section:first-child) {
  padding-top: 0;
  margin-top: 0;
  border-top: 0;
}
.legal-body :deep(h2) {
  font-family: 'Untitled Serif', 'Source Serif 4', Georgia, serif;
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 1.2;
  letter-spacing: -0.025em;
  color: #393737;
  margin: 0 0 1rem;
  padding: 0;
  border: 0;
}
.legal-body :deep(h3),
.legal-body :deep(p.font-bold) {
  font-size: 1rem;
  font-weight: 600;
  color: #393737;
  margin-top: 1.25rem;
}
.legal-body :deep(p),
.legal-body :deep(li) {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #4c4a4a;
}
.legal-body :deep(ul) {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}
.legal-body :deep(ul > li) {
  position: relative;
  padding-left: 1.4rem;
  margin-top: 0.5rem;
}
.legal-body :deep(ul > li)::before {
  content: '';
  position: absolute;
  left: 0.2rem;
  top: 0.78em;
  width: 0.45rem;
  height: 1px;
  background: #ed1c24;
}
.legal-body :deep(a) {
  color: #393737;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(57, 55, 55, 0.3);
}
/* Contact box */
.legal-body :deep(.legal-contact) {
  margin-top: 1rem;
  border-radius: 1.25rem;
  background: #fff;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}
.legal-body :deep(.legal-contact p) {
  margin: 0;
  font-size: 0.95rem;
}
.legal-body :deep(.legal-contact p:first-child) {
  font-weight: 600;
  color: #393737;
}
@media (min-width: 640px) {
  .legal-body :deep(h2) { font-size: 1.85rem; }
}
</style>
