<script setup>
defineProps({
  progress: { type: Number, required: true },
})
</script>

<template>
  <div class="progress-zone">
    <div class="progress-label">Fortschritt:</div>
    <div class="progress-dots">
      <div v-for="i in 9" :key="i"
           class="progress-dot" :class="{ filled: i <= progress }" />
    </div>
    <div class="progress-count">{{ progress }} / 9</div>
  </div>
</template>
