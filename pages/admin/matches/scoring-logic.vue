<template>
  <div class="ad-page !max-w-4xl">
    <header class="ad-head">
      <div>
        <h1 class="ad-title">How matching works</h1>
        <p class="ad-sub">The rules behind every introduction: who's eligible, how a pair is scored, and how the week's pairs are chosen.</p>
      </div>
      <NuxtLink to="/admin/matches/matchmaker" class="btn-ghost btn-sm">Back to matchmaker</NuxtLink>
    </header>

    <div class="space-y-6">
      <section class="ad-panel">
        <h2 class="font-display text-2xl">1. Who's in the pool</h2>
        <ul class="mt-3 space-y-2 text-sm leading-relaxed">
          <li v-for="rule in poolRules" :key="rule" class="flex gap-2.5"><span class="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#393737]"></span>{{ rule }}</li>
        </ul>
      </section>

      <section class="ad-panel">
        <h2 class="font-display text-2xl">2. Deal-breakers</h2>
        <p class="mt-1 text-sm ad-muted">Any one of these and the pair is never introduced, whatever the score.</p>
        <ul class="mt-3 space-y-2 text-sm leading-relaxed">
          <li v-for="rule in dealbreakers" :key="rule" class="flex gap-2.5"><span class="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ed1c24]"></span>{{ rule }}</li>
        </ul>
      </section>

      <section class="ad-panel !p-0">
        <div class="px-6 pb-3 pt-5">
          <h2 class="font-display text-2xl">3. The score</h2>
          <p class="mt-1 text-sm ad-muted">Points out of 100, minus penalties. Bios add up to {{ BREAKDOWN_MAX.aiSynergy }} more; the total is capped at 100.</p>
        </div>
        <table class="data-table">
          <thead>
            <tr><th>Part</th><th class="ad-right">Max</th><th>How it's earned</th></tr>
          </thead>
          <tbody>
            <tr v-for="part in parts" :key="part.label" class="align-top">
              <td class="whitespace-nowrap font-medium">{{ part.label }}</td>
              <td class="ad-right ad-num">{{ part.max }}</td>
              <td class="text-sm leading-relaxed ad-muted">{{ part.how }}</td>
            </tr>
          </tbody>
        </table>
        <div class="px-6 py-5">
          <h3 class="ad-label">Penalties</h3>
          <ul class="space-y-1.5 text-sm">
            <li v-for="p in penalties" :key="p" class="flex gap-2.5"><span class="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d08a1e]"></span>{{ p }}</li>
          </ul>
          <h3 class="ad-label mt-5">Confidence</h3>
          <p class="text-sm leading-relaxed">
            Starts at 100 and drops 8 for each missing profile detail (intent, birth date, city, job, faith, hobbies),
            and more when the pair can only be compared on the old Vibe Check. Below {{ MIN_CONFIDENCE }}% the pair isn't introduced.
          </p>
        </div>
      </section>

      <section class="ad-panel">
        <h2 class="font-display text-2xl">4. Choosing the week's pairs</h2>
        <ul class="mt-3 space-y-2 text-sm leading-relaxed">
          <li v-for="rule in pairingRules" :key="rule" class="flex gap-2.5"><span class="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#393737]"></span>{{ rule }}</li>
        </ul>
      </section>

      <section class="ad-panel">
        <h2 class="font-display text-2xl">5. Where AI helps</h2>
        <p class="mt-1 text-sm ad-muted">The rules decide who can be introduced. AI only adds detail inside those limits.</p>
        <ul class="mt-3 space-y-2 text-sm leading-relaxed">
          <li v-for="rule in aiRules" :key="rule" class="flex gap-2.5"><span class="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f5d9e]"></span>{{ rule }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const poolRules = [
  'Verified, active (not incognito) and opted in for the current week.',
  'Not already matched this week: one introduction per person per week.',
  'Never introduced to the same person twice.',
  `Pairs must reach the "Minimum score for auto matches" set in Settings.`
]

const dealbreakers = [
  "Either person isn't interested in the other's gender.",
  'Different cities, or a city we can\'t place.',
  "One wants something long-term (marriage or serious), the other doesn't.",
  'Opposite on having children (5 or more apart on the 1–7 scale).',
  'Faith matters very differently (4 or more apart, with one at 6 or 7).',
  "Either person is outside the other's preferred age range.",
  'Both carry a sickle-cell trait (AS, SS, AC or SC).',
  "Either person's own dealbreakers are hit (religion, intent or genotype).",
  `Not enough Vibe Check answers to compare, or confidence below ${MIN_CONFIDENCE}%.`
]

const parts = [
  { label: 'Vibe', max: BREAKDOWN_MAX.vibeMatch, how: 'New Vibe Check: ten 1–7 statements, each scored by how close the answers are and weighted by importance (kids 12, faith 10, marriage timeline 8, others 4–6), plus shared top-5 values (3 in common earns full marks). Members who only took the old Vibe Check are compared on its five core questions.' },
  { label: 'Goals', max: BREAKDOWN_MAX.goalsMatch, how: 'Same relationship intent 12 (marriage with serious: 7). Same faith 8, however it\'s written ("Christianity" = "Christian").' },
  { label: 'Lifestyle', max: BREAKDOWN_MAX.lifestyleMatch, how: 'Same dating persona 5. Same job 5, or the same field of work 3 (tech, finance and law, health, teaching, marketing, creative).' },
  { label: 'Life stage', max: BREAKDOWN_MAX.maturityMatch, how: 'Age gap: 3 years or less 10, 6 or less 8, 10 or less 6, 15 or less 3.' },
  { label: 'Shared hobbies', max: BREAKDOWN_MAX.interestMatch, how: '3 or more hobbies in common 10, 1–2 in common 5.' },
  { label: 'Bios', max: BREAKDOWN_MAX.aiSynergy, how: 'Does what each person is looking for sound like how the other describes themselves? Compared by meaning once AI has read both bios; by shared words otherwise.' }
]

const penalties = [
  'Different short-term goals (e.g. casual and friendship): −10',
  'Age gap over 12 years: −8',
  'A bio mentions something the other has ruled out: −20'
]

const pairingRules = [
  'The weekly run scores every allowed pair, then picks pairs so the most people get a good match, not just the best pair first.',
  `Members who opted in last week but weren't matched get priority (+${MISSED_LAST_WEEK_BOOST} per person in a pair).`,
  "Someone who finishes or retakes the Vibe Check mid-week is matched on the spot with their best available fit.",
  'Every new match gets a short "why you two" note and both people are messaged. About 4 days later each is asked how it went.'
]

const aiRules = [
  'Reads each bio for what the member is looking for and how they describe themselves, used in the Bios part of the score.',
  'Writes the "why you two" note members see on their match.',
  'Second look: when someone\'s top candidates score within 5 points of each other, it picks the one most likely to work and notes why (shown as "AI pick" on Matches).'
]
</script>
