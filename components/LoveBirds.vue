<template>
  <!--
    The lovebirds painting, rearranged per section of the match letter. Each bird (with its half of the
    branch) and each heart was lifted off the paper, so they can be moved, turned and regrouped while
    keeping the original ink and watercolour.
  -->
  <div class="lovebirds-art" aria-hidden="true">
    <svg :viewBox="VIEW" class="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
      <!-- 1. Why we think it works: facing each other across the gap, one heart rising between them -->
      <g v-if="scene === 'why'">
        <image href="/lovebirds/heart1.webp" x="440" y="-190" width="225" height="200" />
        <image href="/lovebirds/heart2.webp" x="330" y="-60" width="85" height="78" opacity="0.8" />
        <image href="/lovebirds/pink.webp" x="-10" y="0" :width="P.w" :height="P.h" />
        <image href="/lovebirds/blue.webp" x="600" y="0" :width="B.w" :height="B.h" />
      </g>

      <!-- 2. Where you line up: side by side, facing the same way -->
      <g v-else-if="scene === 'lineup'">
        <image href="/lovebirds/heart4.webp" x="900" y="-150" width="150" height="163" opacity="0.85" />
        <image href="/lovebirds/pink.webp" x="0" y="0" :width="P.w" :height="P.h" />
        <g transform="translate(1100 0) scale(-1 1)">
          <image href="/lovebirds/blue.webp" x="0" y="0" :width="B.w" :height="B.h" />
        </g>
      </g>

      <!-- 3. What you share: together again, under one big heart -->
      <g v-else-if="scene === 'share'">
        <image href="/lovebirds/heart3.webp" x="405" y="-250" width="250" height="288" opacity="0.9" />
        <image href="/lovebirds/blue.webp" :x="KISS_X" y="0" :width="B.w" :height="B.h" />
        <image href="/lovebirds/pink.webp" x="0" y="0" :width="P.w" :height="P.h" />
      </g>

      <!-- 4. In your own words: each says something, in hearts -->
      <g v-else-if="scene === 'words'">
        <image href="/lovebirds/heart2.webp" x="440" y="-30" width="110" height="101" />
        <image href="/lovebirds/heart4.webp" x="560" y="-150" width="130" height="141" opacity="0.9" />
        <image href="/lovebirds/heart1.webp" x="430" y="-190" width="90" height="80" opacity="0.7" />
        <image href="/lovebirds/pink.webp" x="-20" y="0" :width="P.w" :height="P.h" />
        <image href="/lovebirds/blue.webp" x="610" y="0" :width="B.w" :height="B.h" />
      </g>

      <!-- 5. Worth talking about: looking different ways, a small heart still between them -->
      <g v-else-if="scene === 'talk'">
        <image href="/lovebirds/heart2.webp" x="495" y="-110" width="110" height="101" opacity="0.85" />
        <g transform="translate(532 0) scale(-1 1)">
          <image href="/lovebirds/pink.webp" x="0" y="0" :width="P.w" :height="P.h" />
        </g>
        <g transform="translate(1100 0) scale(-1 1)">
          <image href="/lovebirds/blue.webp" x="0" y="0" :width="B.w" :height="B.h" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ scene?: 'why' | 'lineup' | 'share' | 'words' | 'talk' }>(), { scene: 'why' })

// Cut-out sizes (px) and the offset that puts the blue bird back beak-to-beak with the pink one
const P = { w: 532, h: 735 }
const B = { w: 529, h: 735 }
const KISS_X = 465
const VIEW = '-20 -260 1140 1000'
</script>

<style scoped>
/* Same soft edges as the full painting: tails and branch ends trail off into the page */
.lovebirds-art {
  -webkit-mask-image: linear-gradient(to bottom, #000 68%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image: linear-gradient(to bottom, #000 68%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);
  mask-composite: intersect;
}
</style>
