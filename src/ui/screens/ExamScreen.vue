<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useExam } from '../../composables/useExam.js'

const {
  state,
  currentQ,
  progress,
  press,
  del,
  submit,
  handleKeydown,
  goMenu,
} = useExam()

const showApples = ref(false)
watch(() => state.answered, () => { showApples.value = false })

onMounted(()   => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="game-screen exam-screen">
    <div class="game-header">
      <button class="menu-back-btn" @click="goMenu">← Menü</button>
      <div class="level-badge">Exam ×{{ state.level }}</div>
    </div>

    <!-- Progress bar -->
    <div class="exam-progress-wrap">
      <div class="exam-progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Question card -->
    <div class="exam-question-card">
      <div class="exam-q-counter">Frage {{ state.answered + 1 }} / {{ state.queue.length }}</div>

      <div class="exam-question-label">
        <span>{{ currentQ.a }} × {{ currentQ.b }} =</span>
        <div
          class="exam-input-display"
          :class="{
            'has-value': state.input.length > 0,
            'correct':   state.feedback === 'correct',
            'wrong':     state.feedback === 'wrong',
            'shaking':   state.shaking,
          }"
        >
          <span v-if="state.input.length">{{ state.input }}</span>
          <span v-else class="exam-placeholder">?</span>
        </div>
      </div>

      <!-- Apple grid: revealed on demand -->
      <div v-if="showApples" class="exam-apples-viz">
        <div v-for="row in currentQ.a" :key="row" class="exam-apple-row">
          <span
            v-for="col in currentQ.b"
            :key="col"
            class="exam-apple"
            :style="{ animationDelay: ((row - 1) * currentQ.b + (col - 1)) * 25 + 'ms' }"
          >🍎</span>
        </div>
      </div>
      <button v-else class="exam-hint-btn" @click="showApples = true">🍎 Zeigen</button>
    </div>

    <!-- Numpad -->
    <div class="exam-numpad">
      <button class="exam-np-btn" @click="press('7')">7</button>
      <button class="exam-np-btn" @click="press('8')">8</button>
      <button class="exam-np-btn" @click="press('9')">9</button>
      <button class="exam-np-btn" @click="press('4')">4</button>
      <button class="exam-np-btn" @click="press('5')">5</button>
      <button class="exam-np-btn" @click="press('6')">6</button>
      <button class="exam-np-btn" @click="press('1')">1</button>
      <button class="exam-np-btn" @click="press('2')">2</button>
      <button class="exam-np-btn" @click="press('3')">3</button>
      <button class="exam-np-btn exam-np-del" @click="del">⌫</button>
      <button class="exam-np-btn" @click="press('0')">0</button>
      <button class="exam-np-btn exam-np-enter" @click="submit">⏎</button>
    </div>
  </div>
</template>
