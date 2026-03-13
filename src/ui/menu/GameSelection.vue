<script setup>
defineProps({ games: Array })
const emit = defineEmits(['select'])
</script>

<template>
  <div class="game-selection">
    <h2>SPIEL WÄHLEN</h2>
    <div class="game-cards">
      <button
        v-for="game in games" :key="game.id"
        class="game-card"
        @click="emit('select', game)"
      >
        <div class="game-card-emoji">{{ game.emoji }}</div>
        <div class="game-card-body">
          <div class="game-card-title">{{ game.name }}</div>
          <div class="game-card-description">{{ game.description }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
