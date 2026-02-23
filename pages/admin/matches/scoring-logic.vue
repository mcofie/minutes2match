<template>
  <div class="dashboard-page overflow-x-hidden">
    <!-- Welcome Header -->
    <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-stone-900 tracking-tight mb-1 italic">
          Scoring Engine V2 ⚙️
        </h1>
        <p class="text-stone-500">Detailed breakdown of the compatibility calculation algorithm.</p>
      </div>
      
      <NuxtLink to="/admin/matches/matchmaker" class="bg-white px-4 py-2 rounded-xl border border-stone-200 hover:border-stone-300 transition-all font-bold text-stone-700 shadow-sm flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Matchmaker
      </NuxtLink>
    </header>

    <!-- Compatibility Tiers Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <div v-for="t in tiers" :key="t.tier" class="stat-card group cursor-default">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-stone-50 text-stone-600 rounded-xl group-hover:bg-stone-100 transition-colors">
            <span class="text-xl">{{ t.emoji }}</span>
          </div>
          <span class="text-[10px] font-black px-2 py-1 bg-stone-100 text-stone-500 rounded-full uppercase tracking-tighter">
            Tier
          </span>
        </div>
        <div>
          <span class="block text-lg font-black text-stone-900 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{{ t.tier }}</span>
          <span class="text-xs font-bold text-stone-400 font-mono tracking-widest">{{ t.range }}%</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Rules Area (2/3) -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Positive Scoring Section -->
        <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/30">
            <h2 class="text-lg font-bold text-stone-900 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              Positive Alignment (100 Points)
            </h2>
            <span class="text-xs font-black text-stone-400 uppercase tracking-widest">Base Weighting</span>
          </div>
          
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="item in weights" :key="item.category" class="p-5 rounded-2xl border border-stone-100 bg-stone-50/20 hover:border-stone-200 transition-all">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-2xl">{{ item.icon }}</span>
                <div>
                  <h3 class="font-bold text-stone-900 leading-none">{{ item.category }}</h3>
                  <span class="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Max {{ item.max }} Points</span>
                </div>
              </div>
              <p class="text-xs text-stone-500 leading-relaxed mb-4">{{ item.description }}</p>
              <div class="space-y-2">
                <div v-for="bullet in item.bullets" :key="bullet" class="flex items-start gap-2 text-[10px] font-bold text-stone-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                  {{ bullet }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Hard Filters Section -->
        <section class="bg-stone-900 rounded-2xl p-8 relative overflow-hidden shadow-xl">
          <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4">
                <div class="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded uppercase tracking-widest">Hard Filter</div>
                <h2 class="text-xl font-bold text-white italic">The Binary Null Rule</h2>
              </div>
              <p class="text-stone-400 text-sm leading-relaxed mb-6">
                If User A does not match User B's specified gender preference (or vice versa), the system triggers an immediate <span class="text-white font-bold">Hard Lock at 0%</span>. Compatibility is mathematically impossible regardless of other factors.
              </p>
              <div class="flex gap-4">
                <div class="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase">
                  <span class="w-2 h-2 rounded-full bg-red-500"></span>
                  Gender Match Required
                </div>
                <div class="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase">
                  <span class="w-2 h-2 rounded-full bg-red-500"></span>
                  Mutual Interest Required
                </div>
              </div>
            </div>
            <div class="h-32 w-32 shrink-0 bg-stone-800 rounded-full flex items-center justify-center border-4 border-stone-700/50">
              <span class="text-4xl font-black text-stone-600">0%</span>
            </div>
          </div>
          <!-- Decorative SVG -->
          <div class="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="white"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </div>
        </section>
      </div>

      <!-- Sidebar Area (1/3) -->
      <div class="space-y-8">
         
         <!-- Penalties Section -->
         <section class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div class="p-5 border-b border-stone-100 flex items-center gap-3 bg-red-50/30">
               <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               </div>
               <h3 class="text-sm font-bold text-stone-900 uppercase tracking-widest">Deductions</h3>
            </div>
            
            <div class="p-5 space-y-4">
               <div v-for="item in penalties" :key="item.category" class="p-4 rounded-xl border border-red-50 bg-red-50/10">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">{{ item.icon }}</span>
                      <h4 class="text-xs font-bold text-red-900 uppercase tracking-tight">{{ item.category }}</h4>
                    </div>
                    <span class="text-xs font-black px-2 py-0.5 bg-red-100 text-red-600 rounded">-{{ item.malus }}</span>
                  </div>
                  <p class="text-[10px] font-bold text-red-700/60 mb-3 leading-tight">{{ item.description }}</p>
                  <div class="space-y-1.5">
                    <div v-for="bullet in item.bullets" :key="bullet" class="flex items-start gap-2 text-[10px] font-bold text-stone-500 leading-tight">
                      <span class="text-red-400 mt-[-1px]">×</span>
                      {{ bullet }}
                    </div>
                  </div>
               </div>
            </div>
         </section>

         <!-- Dimension Breakdown -->
         <section class="bg-stone-900 rounded-2xl p-6 shadow-xl">
            <h3 class="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em] mb-6">Algorithm Distribution</h3>
            <div class="space-y-5">
               <div v-for="item in weights" :key="item.category">
                  <div class="flex justify-between text-[10px] font-black mb-1.5 uppercase tracking-wider">
                     <span class="text-stone-400">{{ item.category }}</span>
                     <span class="text-white">{{ item.max }}% Influence</span>
                  </div>
                  <div class="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                     <div class="h-full rounded-full" 
                          :class="{
                            'bg-emerald-500': item.max >= 30,
                            'bg-blue-500': item.max >= 20 && item.max < 30,
                            'bg-stone-500': item.max < 20
                          }"
                          :style="{ width: item.max + '%' }"></div>
                  </div>
               </div>
            </div>
            <div class="mt-8 pt-6 border-t border-stone-800">
               <div class="p-4 bg-stone-800/50 rounded-xl border border-stone-700/50">
                  <p class="text-[10px] font-bold text-stone-400 text-center leading-relaxed">
                    Total Potential Weight: 100 Points<br/>
                    Penalty Max: -100%+ (Absolute Zero)
                  </p>
               </div>
            </div>
         </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const tiers = [
  { tier: 'Divine Connection', emoji: '✨', range: '90-100' },
  { tier: 'High Affinity', emoji: '🔥', range: '80-89' },
  { tier: 'Strong Potential', emoji: '🌟', range: '70-79' },
  { tier: 'Good Alignment', emoji: '👍', range: '60-69' },
  { tier: 'Explorable', emoji: '🤝', range: '50-59' },
  { tier: 'Challenging', emoji: '😬', range: '0-49' },
]

const weights = [
  {
    category: 'Vibe Match',
    icon: '🔋',
    max: 40,
    description: 'Core Vibe Check focus on day-to-day energetic compatibility.',
    bullets: [
      'Life Priority: 12pts',
      'Love Language: 10pts',
      'Social Energy: 8pts',
      'Conflict Style: 5pts',
      'Complementary partial credit: 50%'
    ]
  },
  {
    category: 'Goals & Intent',
    icon: '💍',
    max: 20,
    description: 'Measures lifecycle alignment and shared destiny.',
    bullets: [
      'Identical Intent: 12pts',
      'Shared Faith: 8pts',
      'Intent Conflict: -15pt penalty'
    ]
  },
  {
    category: 'Lifestyle Synergy',
    icon: '🍷',
    max: 20,
    description: 'How well habits and careers mesh.',
    bullets: [
      'Dating Persona: 10pts',
      'Professional synergy: 5pts',
      'Local Proximity: 5pts'
    ]
  },
  {
    category: 'Maturity',
    icon: '⏳',
    max: 10,
    description: 'Cultural age dynamic preferences.',
    bullets: [
      'Male Older Dynamic: 8pts',
      'Ideal Gap (1-5y): +2pts',
      'Male Younger: -20pt penalty'
    ]
  },
  {
     category: 'Interests',
     icon: '🎨',
     max: 10,
     description: 'Shared hobbies and surface-level attraction.',
     bullets: [
       '3+ Shared Badges: 10pts',
       '1 Shared Badge: 5pts'
     ]
  }
]

const penalties = [
  {
    category: 'Health Risks',
    icon: '🧬',
    malus: 80,
    description: 'Critical genotype incompatibilities.',
    bullets: ['Both users carry trait (S/C)', 'SS carrier paired with any trait']
  },
  {
    category: 'Dealbreakers',
    icon: '🚫',
    malus: 50,
    description: 'Hits on user\'s list of non-negotiables.',
    bullets: ['Matching a "Won\'t Date" criteria', 'Reciprocal cross-check']
  },
  {
    category: 'Preference Gaps',
    icon: '📏',
    malus: '15-30',
    description: 'Deviation from user parameters.',
    bullets: [
      'Outside Age Range: -30pts',
      'Age Gap > 10yrs: -15pts'
    ]
  }
]
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
  border-color: #D1D5DB;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
}

/* Animations from Dashboard index */
@keyframes in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card, section {
  animation: in 0.4s ease-out forwards;
}

section:nth-child(2) { animation-delay: 0.1s; }
section:nth-child(3) { animation-delay: 0.2s; }
</style>
