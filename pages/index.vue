<template>
  <main class="w-full mx-auto overflow-x-hidden bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
    
    <!-- Hero Section -->
    <div class="relative w-full min-h-screen flex items-center justify-center p-6">
        <!-- Visual Decor -->
        <div class="absolute inset-0 border-[20px] border-white pointer-events-none z-20 hidden md:block"></div>
        <div class="absolute inset-0 z-0">
             <!-- Elegant, desaturated background image -->
             <img src="/assets/imgs/jumbo_img.png" alt="Connection" class="w-full h-full object-cover opacity-10 grayscale contrast-125" />
        </div>

        <div class="relative z-10 container mx-auto text-center max-w-4xl">
             <div class="mb-10 animate-fade-in-up">
                <span class="inline-block px-4 py-2 border border-[var(--color-text-main)] text-[10px] uppercase tracking-[0.3em] font-bold">
                    Now Accepting Members
                </span>
            </div>
            
            <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif text-[var(--color-text-main)] mb-8 leading-[0.9] tracking-tighter animate-fade-in-up delay-100">
                Minutes<span class="text-[var(--color-brand-primary)] italic pr-2">2</span>Match
            </h1>
            
            <p class="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-lg mx-auto font-sans font-light leading-relaxed animate-fade-in-up delay-200">
                Curated connections for the discerning single. <br/>Where chemistry meets opportunity.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in-up delay-300">
                <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdc9sbS1XMCeaSWcl3MKQ0lNrvzx7sGmIHxafaKZwmnyglyOQ/viewform?usp=header">
                    <UiButton variant="primary" size="lg" :rounded="false" class="min-w-[240px]">
                        Request Invitation
                    </UiButton>
                </a>
                <UiButton variant="outline" size="lg" :rounded="false" @click="scrollToHow" class="min-w-[240px]">
                    The Process
                </UiButton>
            </div>
        </div>
    </div>

    <!-- How it works Section -->
    <div id="how-it-works" class="py-40 bg-white relative">
        <div class="container mx-auto px-6 max-w-6xl">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                 <div>
                    <span class="text-[var(--color-brand-primary)] uppercase tracking-[0.2em] text-xs font-bold mb-4 block">Our Approach</span>
                    <h2 class="text-5xl md:text-6xl font-serif leading-tight">Curated <br/><span class="italic text-gray-400">Simplicity.</span></h2>
                 </div>
                 <div class="text-[var(--color-text-muted)] text-lg leading-loose font-light">
                     <p>We believe in the power of face-to-face connection. No algorithms, no endless swiping. Just a room full of potential, curated by human experts.</p>
                 </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="group relative">
                    <div class="absolute -left-6 -top-6 text-[120px] font-serif text-[var(--color-brand-primary)]/10 font-bold -z-10 group-hover:text-[var(--color-brand-primary)]/20 transition-colors">1</div>
                    <div class="border-t border-[var(--color-text-main)] pt-8">
                        <h3 class="text-2xl font-serif mb-4">Register</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Complete your profile. We value quality over quantity, ensuring every member adds to the community.
                        </p>
                    </div>
                </div>

                 <div class="group relative">
                    <div class="absolute -left-6 -top-6 text-[120px] font-serif text-[var(--color-brand-primary)]/10 font-bold -z-10 group-hover:text-[var(--color-brand-primary)]/20 transition-colors">2</div>
                    <div class="border-t border-[var(--color-text-main)] pt-8">
                        <h3 class="text-2xl font-serif mb-4">Selection</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Our team hand-picks guests for each event to ensure compatibility and balance.
                        </p>
                    </div>
                </div>

                 <div class="group relative">
                    <div class="absolute -left-6 -top-6 text-[120px] font-serif text-[var(--color-brand-primary)]/10 font-bold -z-10 group-hover:text-[var(--color-brand-primary)]/20 transition-colors">3</div>
                    <div class="border-t border-[var(--color-text-main)] pt-8">
                         <h3 class="text-2xl font-serif mb-4">Connect</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Meet in an exclusive setting. meaningful conversations. Real connections.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Video / Experience Section -->
    <div class="py-40 bg-[var(--color-bg-main)]">
        <div class="container mx-auto px-6 max-w-5xl text-center">
            <h2 class="text-4xl md:text-5xl font-serif mb-16">The Event Experience</h2>
            <div class="relative p-4 border border-[var(--color-text-main)]/10 bg-white shadow-elegant">
                <iframe 
                    class="w-full aspect-video grayscale hover:grayscale-0 transition-all duration-700" 
                    src="https://www.youtube.com/embed/I7NAzsnZKXo?si=piV9t82jSUKSTWES" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                ></iframe>
            </div>
             <p class="mt-8 text-xs uppercase tracking-widest text-gray-400">See what awaits you</p>
        </div>
    </div>

    <!-- Final Call to Action -->
    <div class="py-40 bg-[#1a1a1a] text-white text-center relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
            <h2 class="text-5xl md:text-7xl font-serif mb-10 text-white">Your Match Awaits.</h2>
            <div class="w-24 h-1 bg-[var(--color-brand-primary)] mx-auto mb-12"></div>
            <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdc9sbS1XMCeaSWcl3MKQ0lNrvzx7sGmIHxafaKZwmnyglyOQ/viewform?usp=header">
                <UiButton variant="primary" size="lg" :rounded="false" class="px-20 py-6 text-xl bg-white text-black hover:bg-gray-200 hover:text-black">
                    Begin Application
                </UiButton>
            </a>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white text-[var(--color-text-main)] py-20 border-t border-gray-100">
        <div class="container mx-auto px-6 flex flex-col items-center">
            <div class="mb-10 text-center">
                 <h2 class="text-3xl font-serif font-bold tracking-tight mb-2">Minutes<span class="text-[var(--color-brand-primary)]">2</span>Match</h2>
                 <p class="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">Est. 2024</p>
            </div>
            <div class="w-full h-px bg-gray-100 max-w-xs mx-auto mb-8"></div>
            <p class="text-sm text-[var(--color-text-muted)]">&copy; {{ new Date().getFullYear() }} Minutes2Match. All Rights Reserved.</p>
        </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import UiButton from '~/components/ui/Button.vue'

function scrollToHow() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    opacity: 0;
    transform: translateY(40px);
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>