<template>
  <!--
    One of the painted lovebirds with a small inked prop for each personality type. The art is
    pre-rendered to a transparent WebP (public/lovebirds/persona-*.webp) so phones never have to
    run watercolour SVG filters, which are very slow on iOS Safari.
  -->
  <div class="persona-bird" aria-hidden="true">
    <img :src="personaArtSrc(type)" alt="" width="640" height="842" decoding="async" class="block h-auto w-full" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ type: string }>()
</script>
