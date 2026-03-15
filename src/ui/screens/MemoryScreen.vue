<script setup>
import { computed } from 'vue'
import { useMemory } from '../../composables/useMemory.js'

const {
  state,
  fallingIds,
  currentMonster,
  playerShaking,
  selectQuestion,
  selectAnswer,
  goMenu,
} = useMemory()

// Which cell shows the monster overlay?
const monsterVisible = computed(() =>
  state.monster.status === 'appeared' ||
  state.monster.status === 'dead'     ||
  state.monster.status === 'escaping' ||
  state.monster.status === 'escaped'
)

function monsterCellClass(status) {
  if (status === 'appeared')  return 'animate-monster-pop'
  if (status === 'dead')      return 'animate-monster-die'
  if (status === 'escaping')  return state.monster.escapeDir < 0 ? 'animate-monster-escape-left' : 'animate-monster-escape-right'
  if (status === 'escaped')   return 'animate-monster-gone'
  return ''
}
</script>

<template>
  <div class="flex flex-col py-3 pb-5 min-h-screen gap-2.5">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex justify-between items-center">
      <button
        class="bg-surface border border-surface2 rounded-xl px-3.5 py-2 text-muted font-nunito text-sm font-bold transition-all hover:text-white hover:border-accent"
        @click="goMenu"
      >← Menü</button>
      <div class="bg-surface border border-surface2 rounded-xl px-4 py-2 font-fredoka text-base text-accent2">
        Memory ×{{ state.level }}
      </div>
    </div>

    <!-- ── Status bar ─────────────────────────────────────────────────────── -->
    <div class="bg-surface border border-surface2 rounded-2xl px-4 py-2.5 flex items-center justify-between">
      <!-- Monster kills -->
      <div class="flex items-center gap-2">
        <span class="text-2xl">💀</span>
        <div class="flex flex-col leading-none">
          <span class="font-fredoka text-xs text-muted tracking-wide">Monster</span>
          <span class="font-fredoka text-xl text-accent">{{ state.monstersKilled }}</span>
        </div>
      </div>

      <!-- Lives -->
      <div class="flex items-center gap-1.5">
        <span
          v-for="i in 9" :key="i"
          class="text-base transition-all duration-300"
          :class="i <= state.playerHP ? 'opacity-100' : 'opacity-20 grayscale'"
        >❤️</span>
      </div>
    </div>

    <!-- ── Answer grid (physics blocks + monster) ─────────────────────────── -->
    <div class="grid grid-cols-3 gap-2">
      <template v-for="(row, ri) in state.grid" :key="ri">
        <div
          v-for="(card, ci) in row"
          :key="ci"
          class="relative"
          style="min-height: 68px"
        >
          <!-- ── Empty cell placeholder ── -->
          <div
            v-if="!card || card.state === 'matched'"
            class="w-full h-full rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.06)]"
            style="min-height: 68px"
          />

          <!-- ── Answer card block ── -->
          <button
            v-else
            class="w-full h-full bg-surface2 border-2 rounded-xl py-3 px-1.5 text-center cursor-pointer transition-all duration-200 relative overflow-hidden"
            :class="{
              // Normal
              'border-[rgba(255,255,255,0.06)] hover:border-accent hover:-translate-y-0.5':
                card.state === 'idle',
              // Selected
              'border-accent shadow-[0_0_14px_rgba(255,107,53,0.45)] -translate-y-0.5 scale-[1.04]':
                card.state === 'active',
              // Wrong answer briefly revealed
              'border-green bg-[rgba(6,214,160,0.1)]':
                card.state === 'revealed',
              // Block is exploding (correct match countdown)
              'animate-block-explode border-accent bg-[rgba(255,107,53,0.15)]':
                card.state === 'exploding',
              // Just landed after falling
              'animate-block-land':
                fallingIds[card.id],
              // Monster is hiding behind this specific card
              'border-[rgba(255,165,0,0.3)] bg-[rgba(255,165,0,0.05)]':
                ri === 2 && ci === state.monster.col &&
                state.monster.status === 'hidden',
            }"
            @click="selectAnswer(card)"
          >
            <span class="font-fredoka text-xl sm:text-2xl text-accent2">{{ card.value }}</span>

            <!-- Monster peeking eyes (hidden state) -->
            <div
              v-if="ri === 2 && ci === state.monster.col && state.monster.status === 'hidden'"
              class="absolute bottom-0 left-0 right-0 flex justify-center pb-0.5 pointer-events-none"
            >
              <span class="text-[10px] animate-peek-eyes">👀</span>
            </div>
          </button>

          <!-- ── Monster overlay in empty cell ── -->
          <div
            v-if="monsterVisible && ri === 2 && ci === state.monster.col"
            class="absolute inset-0 flex flex-col items-center justify-center rounded-xl pointer-events-none z-10"
            :class="{
              'bg-[rgba(255,107,53,0.08)] border-2 border-[rgba(255,107,53,0.3)]':
                state.monster.status === 'appeared',
              'bg-[rgba(239,71,111,0.1)] border-2 border-[rgba(239,71,111,0.3)]':
                state.monster.status === 'dead',
            }"
          >
            <!-- Timer bar (only when appeared) -->
            <div
              v-if="state.monster.status === 'appeared'"
              class="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl overflow-hidden bg-surface2"
            >
              <div
                :key="state.monster.appearCount"
                class="h-full bg-accent animate-timer-drain"
              />
            </div>

            <!-- Monster emoji -->
            <span
              class="text-4xl sm:text-5xl leading-none"
              :class="monsterCellClass(state.monster.status)"
            >
              <template v-if="state.monster.status === 'dead'">💥</template>
              <template v-else-if="state.monster.status === 'escaped'">💨</template>
              <template v-else>{{ currentMonster.emoji }}</template>
            </span>

            <!-- Countdown number -->
            <span
              v-if="state.monster.status === 'appeared'"
              class="font-fredoka text-xs mt-0.5 transition-all"
              :class="state.monster.timeLeft <= 2 ? 'text-red animate-shake' : 'text-accent'"
            >{{ state.monster.timeLeft }}s</span>
          </div>

        </div>
      </template>
    </div>

    <!-- ── Divider ─────────────────────────────────────────────────────────── -->
    <div class="h-0.5 bg-surface2 rounded my-0.5 relative flex items-center justify-center">
      <span class="bg-surface px-2 font-fredoka text-xs text-muted absolute"></span>
    </div>

    <!-- ── Question cards ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="card in state.questions" :key="card.id"
        class="bg-surface2 border-2 rounded-xl py-3 sm:py-4 px-1.5 text-center cursor-pointer transition-all duration-200"
        :class="{
          'border-[rgba(255,255,255,0.06)] hover:border-accent hover:-translate-y-0.5': card.state === 'idle',
          'border-accent shadow-[0_0_14px_rgba(255,107,53,0.4)] -translate-y-0.5 scale-[1.04]': card.state === 'active',
          'opacity-0 pointer-events-none scale-90 transition-all duration-300': card.state === 'matched',
        }"
        @click="selectQuestion(card)"
      >
        <span class="font-fredoka text-xl sm:text-2xl text-white">{{ card.value }}</span>
      </button>
    </div>

    <!-- ── Hint ────────────────────────────────────────────────────────────── -->
    <p class="text-center text-muted font-nunito text-xs opacity-60 mt-1">
      Wähle eine Frage aus, finde die Antwort in den Blöcken
    </p>

  </div>
</template>
