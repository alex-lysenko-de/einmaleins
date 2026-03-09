<script setup>
import { useConfetti } from '../../composables/useConfetti.js'

const { showConfetti, confettiPieces } = useConfetti()
</script>

<template>
  <div class="confetti-overlay" v-if="showConfetti">
    <div
      v-for="p in confettiPieces" :key="p.id"
      class="confetti-piece"
      :style="{
        left:                  p.x + '%',
        width:                 p.size + 'px',
        height:                p.size + 'px',
        background:            p.color,
        animationName:         'confettiFall',
        animationDuration:     p.duration + 's',
        animationDelay:        p.delay + 's',
        animationTimingFunction: 'linear',
        animationFillMode:     'forwards',
      }"
    />
  </div>
</template>
