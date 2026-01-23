<template>
  <Teleport to="body">
    <div 
      v-if="isActive" 
      class="fixed inset-0 pointer-events-none z-[500] overflow-hidden"
    >
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute"
        :style="{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          transform: `rotate(${particle.rotation}deg)`,
          opacity: particle.opacity,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px'
        }"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfetti } from '~/composables/useConfetti'

const { particles, isActive } = useConfetti()
</script>
