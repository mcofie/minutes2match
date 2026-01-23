<template>
  <div class="min-h-screen bg-[#FFFCF8] text-stone-900 font-sans flex flex-col">
    <!-- Fonts -->
    <Head>
      <title>Page Not Found | Minutes 2 Match</title>
      <Link rel="preconnect" href="https://fonts.googleapis.com" />
      <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <Link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </Head>

    <!-- Dot Pattern Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"></div>

    <!-- Navigation -->
    <nav class="relative z-10 border-b border-black bg-[#FFFCF8]">
      <div class="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo-full.png" alt="minutes2match" class="h-16 w-auto object-contain hover:opacity-80 transition-opacity" />
        </NuxtLink>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
      <div class="text-center max-w-2xl mx-auto">
        <!-- 404 Visual -->
        <div class="relative inline-block mb-8">
          <div class="text-[12rem] md:text-[16rem] font-serif font-bold leading-none text-stone-100 select-none">
            404
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-6">
              <span class="text-6xl">💔</span>
            </div>
          </div>
        </div>

        <!-- Text -->
        <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">
          No match <span class="italic text-rose-500">here.</span>
        </h1>
        <p class="text-lg text-stone-500 mb-10 max-w-md mx-auto leading-relaxed">
          The page you're looking for has moved on. Maybe it found someone better. Let's get you back on track.
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink 
            to="/" 
            class="bg-black text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-stone-800 transition-all shadow-[4px_4px_0px_0px_rgba(244,63,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border border-black"
          >
            Go Home
          </NuxtLink>
          <NuxtLink 
            to="/vibe-check" 
            class="text-black font-bold uppercase tracking-widest text-sm hover:text-rose-500 transition-colors flex items-center gap-2"
          >
            Take the Vibe Check
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </NuxtLink>
        </div>

        <!-- Fun Stats -->
        <div class="mt-16 pt-8 border-t border-stone-100">
          <p class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">While you're here...</p>
          <div class="flex items-center justify-center gap-8 text-center">
            <div>
              <div class="text-2xl font-bold font-serif text-rose-500">94%</div>
              <div class="text-xs text-stone-400">Match Rate</div>
            </div>
            <div class="w-px h-8 bg-stone-200"></div>
            <div>
              <div class="text-2xl font-bold font-serif text-rose-500">350+</div>
              <div class="text-xs text-stone-400">Connections</div>
            </div>
            <div class="w-px h-8 bg-stone-200"></div>
            <div>
              <div class="text-2xl font-bold font-serif text-rose-500">0</div>
              <div class="text-xs text-stone-400">Catfish</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-stone-200 bg-white/50">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between text-xs text-stone-400">
          <span>© {{ new Date().getFullYear() }} Minutes 2 Match</span>
          <span>Made with ❤️ in Accra</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
