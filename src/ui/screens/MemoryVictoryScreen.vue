<script setup>
import { useMemory } from '../../composables/useMemory.js'
const { state, startMemory, goMenu } = useMemory()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-4 py-8 gap-5">
    <div class="text-8xl leading-none animate-bounce-in drop-shadow-[0_0_20px_rgba(255,209,102,0.6)]">🏆</div>
    <div class="font-fredoka text-4xl sm:text-5xl text-accent2 drop-shadow-[0_0_40px_rgba(255,209,102,0.5)]">
      Alle Paare gefunden!
    </div>
    <div class="text-lg font-bold text-muted">Level ×{{ state.level }} gemeistert! 🎉</div>
    <div v-if="state.monstersKilled > 0" class="bg-surface border border-surface2 rounded-2xl px-6 py-3 flex items-center gap-3">
      <span class="text-3xl">💀</span>
      <div class="text-left">
        <div class="font-fredoka text-2xl text-accent">{{ state.monstersKilled }} Monster zerstört</div>

      </div>
    </div>
    <div class="flex flex-col gap-2.5 w-full max-w-xs sm:max-w-sm">
      <button
        class="bg-gradient-to-br from-green to-[#04a87d] border-none rounded-2xl py-4 px-6 font-fredoka text-2xl text-white cursor-pointer transition-all shadow-[0_6px_24px_rgba(6,214,160,0.4)] hover:-translate-y-0.5 hover:scale-[1.02]"
        @click="startMemory(state.level)"
      >↺ Nochmal</button>
      <button
        v-if="state.level < 9"
        class="bg-gradient-to-br from-green to-[#04a87d] border-none rounded-2xl py-4 px-6 font-fredoka text-2xl text-white cursor-pointer transition-all shadow-[0_6px_24px_rgba(6,214,160,0.4)] hover:-translate-y-0.5 hover:scale-[1.02]"
        @click="startMemory(state.level + 1)"
      >Nächstes Level →</button>
      <button
        class="bg-transparent border-2 border-surface2 rounded-xl py-3 px-5 font-nunito text-base font-bold text-muted cursor-pointer transition-all hover:border-accent hover:text-white"
        @click="goMenu"
      >← Zurück zum Menü</button>
    </div>
  </div>
</template>
