<script setup>
defineProps({
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
})
</script>

<template>
  <div class="apple-grid">
    <div class="apple-row" v-for="r in rows" :key="r">
      <span class="apple" v-for="c in cols" :key="c">🍎</span>
    </div>
  </div>
</template>
