<script setup>
import VisualizationRows    from './VisualizationRows.vue'
import VisualizationBuckets from './VisualizationBuckets.vue'

defineProps({
  currentTask: { type: Object,  default: null },
  visualMode:  { type: String,  required: true },
  rows:        { type: Number,  required: true },
  cols:        { type: Number,  required: true },
  buckets:     { type: Array,   required: true },
})
defineEmits(['switchMode'])
</script>

<template>
  <div class="task-zone">
    <div class="task-number">{{ currentTask ? currentTask.result : '?' }}</div>

    <div class="vis-mode-switcher">
      <button class="vis-btn" :class="{ active: visualMode === 'rows' }"
              @click="$emit('switchMode', 'rows')">🍎 Rows</button>
      <button class="vis-btn" :class="{ active: visualMode === 'bucket' }"
              @click="$emit('switchMode', 'bucket')">🪣 Bucket</button>
    </div>

    <div class="visualization">
      <VisualizationRows
        v-if="visualMode === 'rows' && currentTask"
        :rows="rows" :cols="cols"
      />
      <VisualizationBuckets
        v-if="visualMode !== 'rows' && currentTask"
        :buckets="buckets"
      />
    </div>
  </div>
</template>
