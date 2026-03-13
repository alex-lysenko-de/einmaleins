<script setup>
import StandardLevelPicker from './StandardLevelPicker.vue'
const emit = defineEmits(['select'])
</script>

<template>
  <StandardLevelPicker @select="emit('select', $event)" />
</template>
