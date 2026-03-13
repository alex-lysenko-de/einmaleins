<script setup>
import { ref } from 'vue'
import { LEVELS } from '../../game/data/levels.js'

const emit = defineEmits(['select'])

const selected = ref(null)

function pick(lvl) {
  selected.value = lvl
  emit('select', lvl)
}
</script>

<template>
  <div class="level-grid">
    <button
      v-for="lvl in LEVELS" :key="lvl"
      class="level-btn"
      :class="{ selected: selected === lvl }"
      @click="pick(lvl)"
    >
      ×{{ lvl }}
      <small>{{ lvl }}er</small>
    </button>
  </div>
</template>
