<script setup>
import { computed } from 'vue'
import { bucketSceneLayout } from '../../game/mechanics/buckets.js'

const props = defineProps({
  buckets: { type: Array, required: true },
})

const bucketRows = computed(() => {
  const sizes = bucketSceneLayout(props.buckets.length)
  const rows  = []
  let idx     = 0
  for (let i = sizes.length - 1; i >= 0; i--) {
    rows.push(props.buckets.slice(idx, idx + sizes[i]))
    idx += sizes[i]
  }
  return rows
})
</script>

<template>
  <div class="bucket-scene">
    <div class="bucket-row" v-for="(row, ri) in bucketRows" :key="ri">
      <div class="bucket-svg-wrap" v-for="bucket in row" :key="bucket.id">
        <svg :width="bucket.svgW" :height="bucket.svgW + bucket.heapH"
             style="overflow:visible; display:block;">
          <defs>
            <clipPath :id="'clip-' + bucket.id">
              <polygon :points="bucket.innerPoly" />
            </clipPath>
          </defs>
          <g :clip-path="'url(#clip-' + bucket.id + ')'">
            <text v-for="ap in bucket.innerApples" :key="ap.k"
                  :x="ap.x" :y="ap.y + ap.R + (ap.R * 0.15)"
                  :font-size="ap.R * 2"
                  text-anchor="middle" dominant-baseline="auto"
                  style="user-select:none">🍎</text>
          </g>
          <polygon :points="bucket.outerPoly"
                   fill="#1d4ed8" fill-opacity="0.45"
                   stroke="#60a5fa" stroke-width="2.5" />
          <line :x1="bucket.rimX0" :y1="bucket.rimY"
                :x2="bucket.rimX1" :y2="bucket.rimY"
                stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round" />
          <text v-for="ap in bucket.heapApples" :key="ap.k"
                :x="ap.x" :y="ap.y + ap.R + (ap.R * 0.15)"
                :font-size="ap.R * 2"
                text-anchor="middle" dominant-baseline="auto"
                style="user-select:none">🍎</text>
        </svg>
      </div>
    </div>
  </div>
</template>
