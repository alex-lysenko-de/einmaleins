<script setup>
import { useGame }      from '../../composables/useGame.js'
import MonsterZone      from '../components/MonsterZone.vue'
import TaskZone         from '../components/TaskZone.vue'
import ProgressZone     from '../components/ProgressZone.vue'
import CardsZone        from '../components/CardsZone.vue'

const {
  state,
  currentMonster,
  monsterShaking,
  playerShaking,
  goMenu,
  selectCard,
  switchVisualMode,
} = useGame()
</script>

<template>
  <div class="game-screen">
    <div class="game-header">
      <button class="menu-back-btn" @click="goMenu">← Menü</button>
      <div class="level-badge">Level ×{{ state.level }}</div>
    </div>

    <MonsterZone
      :monster="currentMonster"
      :monsterHP="state.monsterHP"
      :playerHP="state.playerHP"
      :monsterShaking="monsterShaking"
      :playerShaking="playerShaking"
    />

    <TaskZone
      :currentTask="state.currentTask"
      :visualMode="state.visualMode"
      :rows="state.rows"
      :cols="state.cols"
      :buckets="state.buckets"
      @switchMode="switchVisualMode"
    />

    <ProgressZone :progress="state.progress" />

    <CardsZone :cards="state.cards" @selectCard="selectCard" />
  </div>
</template>
