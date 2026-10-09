<template>
  <!--
    A small airbrushed scene in a feathered oval, in the style of the Popcorn manifesto illustrations:
    pale, low-contrast, grainy, and fading into the page (#f7f7f7) with no visible edge.
  -->
  <div aria-hidden="true">
    <svg viewBox="0 0 240 320" class="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- long feather so the oval dissolves into the page -->
        <radialGradient :id="`${uid}-fade`" cx="50%" cy="48%" r="50%">
          <stop offset="0.56" stop-color="#fff" />
          <stop offset="0.84" stop-color="#fff" stop-opacity="0.5" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <!-- and a softer floor, like mist rolling out of the bottom -->
        <linearGradient :id="`${uid}-floor`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.8" stop-color="#000" />
          <stop offset="1" stop-color="#fff" />
        </linearGradient>
        <mask :id="`${uid}-oval`">
          <rect width="240" height="320" fill="#000" />
          <ellipse cx="120" cy="156" rx="116" ry="152" :fill="`url(#${uid}-fade)`" />
        </mask>
        <mask :id="`${uid}-mist`">
          <rect width="240" height="320" :fill="`url(#${uid}-floor)`" />
        </mask>

        <!-- airbrush: wobble the edges a little, then blur them -->
        <filter :id="`${uid}-paint`" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="5" xChannelSelector="R" yChannelSelector="G" result="moved" />
          <feGaussianBlur in="moved" stdDeviation="1.3" />
        </filter>
        <filter :id="`${uid}-haze`" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12" /></filter>
        <!-- paper grain, the speckle you see in the Popcorn clouds -->
        <filter :id="`${uid}-grain`" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.46  0 0 0 0 0.55  0 0 0 0.16 0" />
        </filter>
        <!-- keep everything as quiet as the reference: less saturation overall -->
        <filter :id="`${uid}-mute`"><feColorMatrix type="saturate" values="0.9" /></filter>

        <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
          <stop v-for="stop in palette.sky" :key="stop[0]" :offset="stop[0]" :stop-color="stop[1]" />
        </linearGradient>
        <linearGradient :id="`${uid}-peak`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#bdd0e5" />
          <stop offset="0.55" stop-color="#d7e2ee" />
          <stop offset="1" stop-color="#eef2f7" />
        </linearGradient>
        <linearGradient :id="`${uid}-sea`" x1="0" y1="0" x2="0" y2="1">
          <stop v-for="stop in palette.sea" :key="stop[0]" :offset="stop[0]" :stop-color="stop[1]" />
        </linearGradient>
        <mask :id="`${uid}-moon`">
          <circle cx="152" cy="92" r="14" fill="#fff" />
          <circle cx="159" cy="87" r="12.5" fill="#000" />
        </mask>
      </defs>

      <g :mask="`url(#${uid}-oval)`">
        <g :filter="`url(#${uid}-mute)`">
          <rect width="240" height="320" :fill="`url(#${uid}-sky)`" />
          <!-- soft cloud banding in the sky -->
          <g fill="#fff" :filter="`url(#${uid}-haze)`" :opacity="scene === 'night' ? 0.18 : 0.55">
            <ellipse cx="70" cy="70" rx="70" ry="10" />
            <ellipse cx="170" cy="104" rx="80" ry="9" />
          </g>

          <!-- Why we think it works: mountains at first light -->
          <g v-if="scene === 'dawn'">
            <ellipse cx="128" cy="226" rx="116" ry="34" fill="#f8cc98" :filter="`url(#${uid}-haze)`" />
            <g :filter="`url(#${uid}-paint)`">
              <path d="M-10 268 C18 256 36 242 52 244 C68 246 88 212 104 194 C112 185 119 174 125 172 C133 175 145 194 159 210 C167 219 175 222 185 217 C199 210 218 226 250 242 V320 H-10 Z" :fill="`url(#${uid}-peak)`" />
              <path d="M125 172 C119 196 112 228 116 262 L156 282 C151 256 146 228 159 210 C145 194 133 175 125 172 Z" fill="#a9c2de" opacity="0.55" />
              <path d="M125 172 C129 181 132 189 134 195 C130 192 126 188 121 185 Z" fill="#fff" opacity="0.75" />
              <path d="M52 244 C47 258 46 272 52 284 L78 280 C70 268 64 256 52 244 Z" fill="#a9c2de" opacity="0.35" />
              <path d="M185 217 C181 232 181 246 189 260 L214 258 C204 246 194 232 185 217 Z" fill="#a9c2de" opacity="0.35" />
            </g>
          </g>

          <!-- Where you line up: a path running straight to the sun -->
          <g v-else-if="scene === 'meadow'">
            <circle cx="120" cy="196" r="46" fill="#fde1bd" :filter="`url(#${uid}-haze)`" />
            <circle cx="120" cy="196" r="18" fill="#fbdcb4" :filter="`url(#${uid}-paint)`" />
            <g :filter="`url(#${uid}-paint)`">
              <path d="M-10 214 Q60 190 120 206 T250 202 V320 H-10 Z" fill="#d6e2d2" />
              <path d="M-10 244 Q80 214 150 236 T250 230 V320 H-10 Z" fill="#c2d6be" />
              <path d="M108 320 Q116 252 120 212 Q124 252 136 320 Z" fill="#f6ead6" opacity="0.95" />
            </g>
          </g>

          <!-- What you share: one tree, plenty of shade -->
          <g v-else-if="scene === 'tree'">
            <circle cx="168" cy="124" r="34" fill="#fde0bd" :filter="`url(#${uid}-haze)`" />
            <g :filter="`url(#${uid}-paint)`">
              <path d="M-10 246 Q120 196 250 246 V320 H-10 Z" fill="#cfdfcb" />
              <rect x="117" y="182" width="6" height="40" rx="2" fill="#b3a593" />
              <ellipse cx="120" cy="170" rx="30" ry="25" fill="#adc6b0" />
              <ellipse cx="101" cy="182" rx="19" ry="15" fill="#adc6b0" />
              <ellipse cx="140" cy="183" rx="19" ry="15" fill="#adc6b0" />
              <ellipse cx="111" cy="160" rx="13" ry="10" fill="#c7d9c8" />
              <ellipse cx="120" cy="226" rx="34" ry="5" fill="#b9cdb5" opacity="0.7" />
            </g>
          </g>

          <!-- In your own words: a still evening by the sea -->
          <g v-else-if="scene === 'night'">
            <circle cx="152" cy="92" r="34" fill="#fff4dc" opacity="0.5" :filter="`url(#${uid}-haze)`" />
            <rect width="240" height="320" fill="#fff6e2" :mask="`url(#${uid}-moon)`" />
            <g fill="#fff">
              <circle v-for="(star, i) in STARS" :key="i" :cx="star[0]" :cy="star[1]" :r="star[2]" :opacity="star[3]" />
            </g>
            <g :filter="`url(#${uid}-paint)`">
              <rect x="-10" y="210" width="260" height="110" :fill="`url(#${uid}-sea)`" />
              <ellipse cx="152" cy="242" rx="8" ry="28" fill="#fff4dc" opacity="0.45" />
            </g>
          </g>

          <!-- Worth talking about: two clouds in conversation over a sunset -->
          <g v-else-if="scene === 'sunset'">
            <circle cx="120" cy="214" r="50" fill="#fbd5ae" :filter="`url(#${uid}-haze)`" />
            <circle cx="120" cy="214" r="22" fill="#fcdfba" :filter="`url(#${uid}-paint)`" />
            <g :filter="`url(#${uid}-paint)`">
              <rect x="-10" y="214" width="260" height="106" :fill="`url(#${uid}-sea)`" />
              <rect x="104" y="226" width="32" height="2" rx="1" fill="#fde9cc" />
              <rect x="110" y="238" width="20" height="2" rx="1" fill="#fde9cc" opacity="0.8" />
              <g fill="#fff">
                <ellipse cx="72" cy="128" rx="30" ry="11" />
                <ellipse cx="62" cy="120" rx="14" ry="10" />
                <ellipse cx="81" cy="117" rx="16" ry="12" />
                <ellipse cx="168" cy="112" rx="30" ry="11" />
                <ellipse cx="160" cy="102" rx="16" ry="12" />
                <ellipse cx="178" cy="104" rx="14" ry="10" />
              </g>
            </g>
          </g>

          <!-- meet.: two hills leaning in, the sun coming up between them -->
          <g v-else>
            <circle cx="120" cy="214" r="46" fill="#fcdbb5" :filter="`url(#${uid}-haze)`" />
            <circle cx="120" cy="214" r="17" fill="#fbd6a8" :filter="`url(#${uid}-paint)`" />
            <g :filter="`url(#${uid}-paint)`">
              <path d="M250 192 Q168 184 114 248 V320 H250 Z" fill="#d3deeb" />
              <path d="M-10 186 Q76 180 126 246 V320 H-10 Z" fill="#bccfe3" />
            </g>
          </g>
        </g>

        <!-- mist rising from the bottom, then a light wash toward the page colour -->
        <rect width="240" height="320" fill="#f7f7f7" :opacity="scene === 'night' ? 0.5 : 0.75" :mask="`url(#${uid}-mist)`" />
        <rect width="240" height="320" :filter="`url(#${uid}-grain)`" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
type Scene = 'dawn' | 'meadow' | 'tree' | 'night' | 'sunset' | 'meet'

const props = withDefaults(defineProps<{ scene?: Scene }>(), { scene: 'meet' })

// SVG ids are global to the page, so each vignette needs its own
const uid = `vg-${useId()}`

const STARS: [number, number, number, number][] = [
  [52, 58, 1.1, 0.85], [78, 92, 0.8, 0.6], [100, 46, 1.2, 0.75], [118, 124, 0.7, 0.5], [188, 60, 1, 0.75],
  [200, 128, 0.8, 0.55], [64, 146, 0.9, 0.45], [128, 74, 0.8, 0.6],
]

const palette = computed(() => {
  switch (props.scene) {
    case 'night':
      // dusk rather than midnight, so it sits with the rest of the set
      return {
        sky: [['0', '#8796c0'], ['0.45', '#b3b9d6'], ['0.62', '#e2d3dc'], ['0.7', '#f3dfd2'], ['1', '#f3dfd2']],
        sea: [['0', '#a7b2d0'], ['1', '#c7cfe2']],
      }
    case 'sunset':
      return {
        sky: [['0', '#cfdbec'], ['0.38', '#efe3e6'], ['0.6', '#f8dcc4'], ['0.7', '#f6c9a2'], ['1', '#f6c9a2']],
        sea: [['0', '#ccd7e6'], ['1', '#e8edf3']],
      }
    case 'meadow':
    case 'tree':
      return {
        sky: [['0', '#cddcec'], ['0.45', '#edf1f4'], ['0.64', '#fbf1e2'], ['1', '#f8e2c4']],
        sea: [['0', '#ccd7e6'], ['1', '#e8edf3']],
      }
    default:
      return {
        sky: [['0', '#c6d7ea'], ['0.38', '#e9eff4'], ['0.54', '#f9f0e2'], ['0.66', '#f8d6ac'], ['1', '#f5c897']],
        sea: [['0', '#ccd7e6'], ['1', '#e8edf3']],
      }
  }
})
</script>
