<template>
  <div class="w-full relative container px-2 mx-auto max-w-7xl min-h-screen">
    <!-- Hero Section -->
    <div class="mt-6 bg-stone-50 rounded-2xl relative">
      <!-- Header -->
      <header class="flex items-center">
        <div class="w-full md:w-2/3 lg:w-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-2">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
            <span class="font-bold text-lg tracking-tight">minutes2match</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center justify-between w-full ml-8">
            <button 
              v-for="item in navigation" 
              :key="item.name"
              class="px-3 py-2 text-sm font-medium text-stone-600 hover:text-black transition-colors"
            >
              {{ item.name }}
            </button>
            <button class="p-2 text-stone-500 hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
            <button class="p-2 text-stone-500 hover:text-black transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h2l.4 2M7 13h10l4-8H5.4"/><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              </svg>
            </button>
          </nav>

          <!-- Mobile Menu Button -->
          <button 
            @click="mobileMenuOpen = true"
            class="lg:hidden ml-auto p-2 text-stone-500 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:flex w-1/2 justify-end items-center pr-4 gap-4 ml-auto">
          <NuxtLink 
            to="/login"
            class="flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <span class="pl-4 py-2 text-sm font-medium">Log In</span>
            <div class="rounded-full flex items-center justify-center bg-stone-100 w-10 h-10 ml-2 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
              </svg>
            </div>
          </NuxtLink>
        </div>
      </header>

      <!-- Hero Content -->
      <section class="w-full px-4 py-24 animate-fade-in-up">
        <div class="mx-auto text-center">
          <h1 class="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span class="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Curate your products
            </span>
            <br />
            <span class="text-stone-900">
              into simple collections.
            </span>
          </h1>
          <p class="text-base md:text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
            Use this page to group your products into themed collections,
            making it easy for customers to explore.
          </p>
        </div>
      </section>
    </div>

    <!-- Category Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mt-12">
      <div
        v-for="(category, index) in categories"
        :key="category.title"
        class="group relative bg-stone-100 rounded-3xl p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] w-full overflow-hidden transition-all duration-500 hover:shadow-xl animate-fade-in-up"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <NuxtLink :to="category.href" class="absolute inset-0 z-20">
          <h2 class="text-center text-2xl sm:text-3xl md:text-4xl font-bold relative z-10 text-stone-900 my-2 sm:my-4 group-hover:text-orange-600 transition-colors duration-300">
            {{ category.title }}
          </h2>
          <div class="absolute inset-0 flex items-center justify-center p-4">
            <img
              :src="category.image"
              :alt="category.title"
              class="w-full max-w-[min(40vw,200px)] sm:max-w-[min(30vw,180px)] md:max-w-[min(25vw,160px)] lg:max-w-[min(20vw,140px)] h-auto object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
            />
          </div>
          <div class="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white rounded-tl-xl flex items-center justify-center z-10 border-l border-t border-stone-200">
            <div class="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-stone-200 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile Menu Sheet -->
    <UiSheet v-model="mobileMenuOpen" side="left">
      <div class="p-6">
        <!-- Logo in Sheet -->
        <div class="flex items-center gap-2 mb-8">
          <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">m</div>
          <span class="font-bold text-lg tracking-tight">minutes2match</span>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col space-y-1 mb-6">
          <button 
            v-for="item in navigation"
            :key="item.name"
            class="text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-100 hover:text-black rounded-lg transition-colors"
          >
            {{ item.name }}
          </button>
        </nav>

        <UiSeparator class="my-6" />

        <!-- Actions -->
        <div class="flex flex-col gap-4">
          <button class="flex items-center gap-3 px-3 py-3 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            Search
          </button>
          <button class="flex items-center gap-3 px-3 py-3 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h2l.4 2M7 13h10l4-8H5.4"/><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            </svg>
            Cart
            <span class="ml-auto w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        <UiSeparator class="my-6" />

        <!-- Login Button -->
        <NuxtLink 
          to="/login"
          class="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          Log In
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
          </svg>
        </NuxtLink>
      </div>
    </UiSheet>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '#' },
  { name: 'Collections', href: '#' },
  { name: 'Blog', href: '#' },
]

const categories = [
  {
    title: 'Home',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop&auto=format',
    href: '#',
  },
  {
    title: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format',
    href: '#',
  },
  {
    title: 'Technology',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format',
    href: '#',
  },
  {
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format',
    href: '#',
  },
]
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>
