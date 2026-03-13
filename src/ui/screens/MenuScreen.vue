<script setup>
import { ref } from 'vue'
import { useGames }   from '../menu/games.js'
import GameSelection  from '../menu/GameSelection.vue'
import LevelSelection from '../menu/LevelSelection.vue'

const games        = useGames()
const selectedGame = ref(null)

function onGameSelected(game) { selectedGame.value = game }
function onBack()             { selectedGame.value = null }
function onStart(level)       { selectedGame.value.start(level) }
</script>

<template>
  <div class="menu-screen">
    <div class="menu-characters">
      <div class="menu-monster">👾</div>
      <div class="menu-person">🧒</div>
    </div>

    <div class="menu-logo">
      <h1>EinMalEins mit Spaß</h1>
      <div class="subtitle">Einfach. Schnell. Gelernt.</div>
    </div>

    <GameSelection
      v-if="!selectedGame"
      :games="games"
      @select="onGameSelected"
    />
    <LevelSelection
      v-else
      :game="selectedGame"
      @back="onBack"
      @start="onStart"
    />
  </div>
</template>
