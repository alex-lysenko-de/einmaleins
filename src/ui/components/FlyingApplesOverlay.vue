<script setup>
import { useGame } from '../../composables/useGame.js'

const { flyingApples, splatFragments } = useGame()
</script>

<template>
  <div class="flying-apples-overlay">
    <div
      v-for="fa in flyingApples" :key="fa.id"
      class="flying-apple"
      :style="{
        left:    fa.x + 'px',
        top:     fa.y + 'px',
        '--dx':  fa.dx + 'px',
        '--dy':  fa.dy + 'px',
        '--rot': fa.rot + 'deg',
        '--dur': '0.48s',
      }"
    >🍎</div>
    <div
      v-for="sf in splatFragments" :key="sf.id"
      class="splat-fragment"
      :style="{
        left:   sf.x + 'px',
        top:    sf.y + 'px',
        '--fx': sf.fx + 'px',
        '--fy': sf.fy + 'px',
        '--sd': sf.dur + 's',
      }"
    >{{ sf.emoji }}</div>
  </div>
</template>
