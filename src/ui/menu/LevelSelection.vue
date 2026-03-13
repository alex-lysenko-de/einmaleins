<script setup>
import { ref } from 'vue'

const props = defineProps({ game: Object })
const emit  = defineEmits(['back', 'start'])

const selectedLevel = ref(null)
</script>

<template>
  <div class="level-selection">
    <button class="back-btn" @click="emit('back')">← Zurück</button>
    <h2>{{ game.name }}</h2>
    <p class="level-subtitle">Wähle dein Level:</p>

    <!-- Each game supplies its own picker; it only needs to emit('select', level) -->
    <component :is="game.LevelPicker" @select="selectedLevel = $event" />

    <button
      class="start-btn"
      :disabled="selectedLevel === null"
      @click="emit('start', selectedLevel)"
    >
      START
    </button>
  </div>
</template>
