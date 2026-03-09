<script setup>
import { useGame } from '../../composables/useGame.js'

const { state, starShow, nextLevel, goMenu } = useGame()
</script>

<template>
  <div class="victory-screen">
    <div class="victory-skull">💀</div>

    <div class="victory-stars">
      <span class="victory-star" :class="{ show: starShow[0] }">⭐</span>
      <span class="victory-star" :class="{ show: starShow[1] }">⭐</span>
      <span class="victory-star" :class="{ show: starShow[2] }">⭐</span>
    </div>

    <div class="victory-title">Monster besiegt!</div>
    <div class="victory-subtitle">Level ×{{ state.level }} geschafft! 🎉</div>

    <div class="victory-btns">
      <button v-if="state.level < 9" class="next-level-btn" @click="nextLevel">
        Nächstes Level →
      </button>
      <button v-else class="next-level-btn" @click="goMenu">
        🏆 Alle Level! Menü
      </button>
      <button class="back-menu-btn" @click="goMenu">← Zurück zum Menü</button>
    </div>
  </div>
</template>
