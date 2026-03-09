<script setup>
defineProps({
  monster:        { type: Object,  required: true },
  monsterHP:      { type: Number,  required: true },
  playerHP:       { type: Number,  required: true },
  monsterShaking: { type: Boolean, default: false },
  playerShaking:  { type: Boolean, default: false },
})
</script>

<template>
  <div class="monster-zone">
    <div class="monster-side">
      <div class="char-hp-bar">
        <div class="char-hp-label">HP</div>
        <div class="char-hp-track">
          <div class="char-hp-fill" :class="{ low: monsterHP <= 3 }"
               :style="{ width: (monsterHP / 9 * 100) + '%' }" />
        </div>
        <div class="char-hp-count" :class="{ low: monsterHP <= 3 }">{{ monsterHP }}/9</div>
      </div>
      <!-- id="char-monster" required — useGame.js reads position via getElementById -->
      <div class="monster-emoji" id="char-monster" :class="{ shaking: monsterShaking }">
        {{ monster.emoji }}
      </div>
      <div class="char-name">{{ monster.name }}</div>
    </div>

    <div class="battle-vs">VS</div>

    <div class="player-side">
      <div class="char-hp-bar">
        <div class="char-hp-label">HP</div>
        <div class="char-hp-track">
          <div class="char-hp-fill" :class="{ low: playerHP <= 3 }"
               :style="{ width: (playerHP / 9 * 100) + '%' }" />
        </div>
        <div class="char-hp-count" :class="{ low: playerHP <= 3 }">{{ playerHP }}/9</div>
      </div>
      <!-- id="char-player" required — useGame.js reads position via getElementById -->
      <div class="player-emoji" id="char-player" :class="{ shaking: playerShaking }">🧒</div>
      <div class="char-name">Spieler</div>
    </div>
  </div>
</template>
