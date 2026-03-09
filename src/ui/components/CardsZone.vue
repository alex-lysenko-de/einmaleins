<script setup>
defineProps({
  cards: { type: Array, required: true },
})
defineEmits(['selectCard'])
</script>

<template>
  <div class="cards-zone">
    <button
      v-for="card in cards" :key="card.id"
      class="card-btn"
      :class="{ correct: card.state === 'correct', wrong: card.state === 'wrong', solved: card.solved }"
      @click="$emit('selectCard', card)"
    >
      <span class="card-eq">{{ card.a }} × {{ card.b }}</span>
    </button>
  </div>
</template>
