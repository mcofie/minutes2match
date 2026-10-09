<template>
  <!-- Flags drawn in SVG (emoji flags don't render on Windows), with a soft fabric sheen -->
  <svg
    :viewBox="shape === 'circle' ? '75 0 300 300' : '0 0 450 300'"
    :class="shape === 'circle' ? 'rounded-full' : 'rounded-[0.3rem]'"
    class="block shrink-0 overflow-hidden shadow-[0_1px_3px_rgba(57,55,55,0.18)]"
    role="img"
    :aria-label="code === 'gh' ? 'Flag of Ghana' : 'Flag of Kenya'"
  >
    <defs>
      <clipPath :id="`${uid}-clip`">
        <circle v-if="shape === 'circle'" cx="225" cy="150" r="150" />
        <rect v-else width="450" height="300" />
      </clipPath>
      <linearGradient :id="`${uid}-sheen`" x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0" stop-color="#fff" stop-opacity="0.22" />
        <stop offset="0.28" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.5" stop-color="#000" stop-opacity="0.08" />
        <stop offset="0.72" stop-color="#fff" stop-opacity="0.14" />
        <stop offset="1" stop-color="#000" stop-opacity="0.1" />
      </linearGradient>
    </defs>

    <g :clip-path="`url(#${uid}-clip)`">
      <!-- Ghana: red, gold and green with the black star -->
      <template v-if="code === 'gh'">
        <rect width="450" height="100" fill="#ce1126" />
        <rect y="100" width="450" height="100" fill="#fcd116" />
        <rect y="200" width="450" height="100" fill="#006b3f" />
        <polygon points="225.0,102.0 236.2,136.5 272.6,136.5 243.2,157.9 254.4,192.5 225.0,171.1 195.6,192.5 206.8,157.9 177.4,136.5 213.8,136.5" fill="#000" />
      </template>

      <!-- Kenya: black, red and green with white edges, the Maasai shield and spears -->
      <template v-else>
        <rect width="450" height="300" fill="#fff" />
        <rect width="450" height="90" fill="#000" />
        <rect y="105" width="450" height="90" fill="#bb0000" />
        <rect y="210" width="450" height="90" fill="#006600" />
        <g stroke="#fff" stroke-width="7" stroke-linecap="round">
          <line x1="178" y1="44" x2="272" y2="262" />
          <line x1="272" y1="44" x2="178" y2="262" />
        </g>
        <g fill="#fff">
          <path d="M172 30 Q170 52 186 62 Q186 42 172 30Z" />
          <path d="M278 30 Q280 52 264 62 Q264 42 278 30Z" />
        </g>
        <path d="M225 52 C 282 96, 282 204, 225 248 C 168 204, 168 96, 225 52Z" fill="#000" />
        <path d="M225 58 C 260 104, 260 196, 225 242 C 190 196, 190 104, 225 58Z" fill="#bb0000" />
        <path d="M225 104 C 236 126, 236 174, 225 196 C 214 174, 214 126, 225 104Z" fill="#fff" />
        <path d="M225 116 C 231 132, 231 168, 225 184 C 219 168, 219 132, 225 116Z" fill="#000" />
        <g fill="#fff">
          <path d="M201 92 Q209 106 205 122 Q197 108 201 92Z" />
          <path d="M249 92 Q241 106 245 122 Q253 108 249 92Z" />
          <path d="M201 208 Q209 194 205 178 Q197 192 201 208Z" />
          <path d="M249 208 Q241 194 245 178 Q253 192 249 208Z" />
        </g>
      </template>

      <rect width="450" height="300" :fill="`url(#${uid}-sheen)`" />
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ code: 'gh' | 'ke'; shape?: 'rect' | 'circle' }>(), { shape: 'rect' })
const uid = `flag-${useId()}`
</script>
