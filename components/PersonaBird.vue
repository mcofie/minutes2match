<template>
  <!--
    One of the painted lovebirds (lifted from the landing-page painting) with a small hand-inked prop
    for each personality type. Props use a wobbly ink line and a soft wash so they sit with the paint.
  -->
  <div class="persona-bird" aria-hidden="true">
    <svg viewBox="-40 -300 760 1000" class="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter :id="`${uid}-ink`" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter :id="`${uid}-wash`" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.2" result="b" />
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="5" result="pig" />
          <feColorMatrix in="pig" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.1 0 0 0 0.2" result="pigA" />
          <feComposite in="b" in2="pigA" operator="in" />
        </filter>
      </defs>

      <!-- The bird: pink for the warm types, blue for the rest; the blue one is turned to face right -->
      <image v-if="pink" href="/lovebirds/pink.webp" x="0" y="0" width="532" height="735" />
      <g v-else transform="translate(529 0) scale(-1 1)">
        <image href="/lovebirds/blue.webp" x="0" y="0" width="529" height="735" />
      </g>

      <!-- Power Player: a little gold crown -->
      <g v-if="type === 'power_player'" transform="translate(300 -120) rotate(10)">
        <path :filter="`url(#${uid}-wash)`" d="M0 90 L 12 10 L 55 55 L 90 0 L 125 55 L 168 10 L 180 90 Z" fill="#f2c46b" opacity="0.85" />
        <g :filter="`url(#${uid}-ink)`" fill="none" stroke="#1f2a31" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M0 90 L 12 10 L 55 55 L 90 0 L 125 55 L 168 10 L 180 90 Z" />
          <path d="M4 112 L 176 112 M2 90 L 4 112 M178 90 L 176 112" />
        </g>
        <circle cx="90" cy="70" r="11" fill="#d9615c" :filter="`url(#${uid}-wash)`" />
      </g>

      <!-- Romantic: a cloud of the painting's own hearts -->
      <g v-else-if="type === 'romantic'">
        <image href="/lovebirds/heart1.webp" x="430" y="-250" width="200" height="178" />
        <image href="/lovebirds/heart4.webp" x="560" y="-60" width="120" height="131" opacity="0.9" />
        <image href="/lovebirds/heart2.webp" x="330" y="-110" width="95" height="87" opacity="0.85" />
      </g>

      <!-- Adventurer: a paper plane looping off on a dotted trail -->
      <g v-else-if="type === 'adventurer'">
        <path :filter="`url(#${uid}-ink)`" d="M300 -40 C 360 -170 470 -150 450 -80 C 435 -30 360 -60 420 -150 C 460 -210 540 -230 600 -220" fill="none" stroke="#1f2a31" stroke-width="4" stroke-dasharray="4 16" stroke-linecap="round" opacity="0.7" />
        <g transform="translate(600 -230) rotate(-12)">
          <path :filter="`url(#${uid}-wash)`" d="M0 0 L 110 -40 L 50 40 Z" fill="#b7c8c6" opacity="0.9" />
          <g :filter="`url(#${uid}-ink)`" fill="none" stroke="#1f2a31" stroke-width="5" stroke-linejoin="round">
            <path d="M0 0 L 110 -40 L 50 40 Z" />
            <path d="M110 -40 L 32 16 L 50 40" />
          </g>
        </g>
      </g>

      <!-- Intellectual: a small stack of books with reading glasses on top -->
      <g v-else-if="type === 'intellectual'" transform="translate(520 300)">
        <rect :filter="`url(#${uid}-wash)`" x="0" y="80" width="170" height="44" rx="6" fill="#7d97a0" opacity="0.85" />
        <rect :filter="`url(#${uid}-wash)`" x="14" y="38" width="146" height="42" rx="6" fill="#ef9f98" opacity="0.8" />
        <rect :filter="`url(#${uid}-wash)`" x="4" y="0" width="158" height="38" rx="6" fill="#e9d9b6" opacity="0.9" />
        <g :filter="`url(#${uid}-ink)`" fill="none" stroke="#1f2a31" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="0" y="80" width="170" height="44" rx="6" />
          <rect x="14" y="38" width="146" height="42" rx="6" />
          <rect x="4" y="0" width="158" height="38" rx="6" />
          <path d="M150 84 v 36 M30 42 v 34 M140 4 v 30" stroke-width="3" opacity="0.7" />
          <circle cx="58" cy="-22" r="20" /><circle cx="112" cy="-22" r="20" /><path d="M78 -24 c 6 -6 10 -6 14 0" />
        </g>
      </g>

      <!-- Social Butterfly: watercolour butterflies -->
      <g v-else-if="type === 'social_butterfly'">
        <g v-for="b in BUTTERFLIES" :key="b.x" :transform="`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`">
          <path :filter="`url(#${uid}-wash)`" d="M0 0 C -40 -60 -90 -30 -60 10 C -80 40 -40 60 0 10 Z" :fill="b.c" opacity="0.85" />
          <path :filter="`url(#${uid}-wash)`" d="M0 0 C 40 -60 90 -30 60 10 C 80 40 40 60 0 10 Z" :fill="b.c" opacity="0.85" />
          <g :filter="`url(#${uid}-ink)`" fill="none" stroke="#1f2a31" stroke-width="4" stroke-linecap="round">
            <path d="M0 -14 L 0 26" stroke-width="6" />
            <path d="M0 -14 c -8 -20 -16 -26 -24 -30 M0 -14 c 8 -20 16 -26 24 -30" stroke-width="3" />
          </g>
        </g>
      </g>

      <!-- Homebody: a cup of tea and a little steam -->
      <g v-else-if="type === 'homebody'" transform="translate(560 330)">
        <path :filter="`url(#${uid}-wash)`" d="M0 0 L 130 0 C 128 60 100 92 65 92 C 30 92 2 60 0 0 Z" fill="#efd9c9" opacity="0.95" />
        <g :filter="`url(#${uid}-ink)`" fill="none" stroke="#1f2a31" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 0 L 130 0 C 128 60 100 92 65 92 C 30 92 2 60 0 0 Z" />
          <path d="M128 18 C 170 14 172 60 120 62" />
          <path d="M-20 104 C 40 116 110 116 160 104" />
          <path d="M40 -24 c -14 -24 14 -36 0 -62 M80 -24 c -14 -24 14 -36 0 -62" stroke-width="3.5" opacity="0.6" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ type: string }>()
const uid = `pbird-${useId()}`
// Warm types get the pink bird, the others the blue one
const pink = computed(() => ['romantic', 'social_butterfly', 'homebody'].includes(props.type))
const BUTTERFLIES = [
  { x: 520, y: -150, r: -14, s: 1, c: '#f2b3ab' },
  { x: 640, y: -10, r: 12, s: 0.7, c: '#b7c8c6' },
  { x: 380, y: -230, r: 8, s: 0.6, c: '#f2c46b' },
]
</script>

<style scoped>
/* Tail and branch trail off into the card */
.persona-bird {
  -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
}
</style>
