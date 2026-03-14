<script setup>
import { ref } from 'vue'
import { useGames }    from '../menu/games.js'
import GameSelection   from '../menu/GameSelection.vue'
import LevelSelection  from '../menu/LevelSelection.vue'
import { getPlayerName, savePlayerName } from '../../services/playerStore.js'
import { router } from '../../router/index.js'

const games        = useGames()
const selectedGame = ref(null)
const playerName   = ref(getPlayerName())

// Settings modal state
const showSettings   = ref(false)
const renamingPlayer = ref(false)
const newName        = ref('')
const renameError    = ref('')

function onGameSelected(game) { selectedGame.value = game }
function onBack()             { selectedGame.value = null }
function onStart(level)       { selectedGame.value.start(level) }

function openSettings() {
  showSettings.value   = true
  renamingPlayer.value = false
  renameError.value    = ''
}
function closeSettings() {
  showSettings.value   = false
  renamingPlayer.value = false
  renameError.value    = ''
}

function startRename() {
  newName.value        = playerName.value || ''
  renameError.value    = ''
  renamingPlayer.value = true
}
function confirmRename() {
  const trimmed = newName.value.trim()
  if (!trimmed) { renameError.value = 'Name darf nicht leer sein.'; return }
  savePlayerName(trimmed)
  playerName.value     = trimmed
  renamingPlayer.value = false
  renameError.value    = ''
}
function cancelRename() {
  renamingPlayer.value = false
  renameError.value    = ''
}

// Share
const shareCopied = ref(false)
async function shareApp() {
  const shareData = {
    title: 'EinMalEins',
    text: '🎮 Lerne das Einmaleins mit diesem coolen Spiel!',
    url: window.location.origin + window.location.pathname,
  }
  if (navigator.share) {
    try { await navigator.share(shareData) } catch {}
  } else {
    await navigator.clipboard.writeText(shareData.url)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2000)
  }
}

function goGlobalTable() {
  closeSettings()
  router.push({ name: 'leaderboard', query: { view: 'global' } })
}
function goMyGames() {
  closeSettings()
  router.push({ name: 'leaderboard', query: { view: 'local' } })
}
</script>

<template>
  <div class="flex flex-col items-center pt-6 pb-8 min-h-screen">

    <!-- Settings Modal Overlay -->
    <Transition name="fade">
      <div
        v-if="showSettings"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="closeSettings"
      >
        <div class="bg-surface border border-surface2 rounded-2xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-2xl">

          <!-- Modal Header -->
          <div class="flex justify-between items-center">
            <span class="font-fredoka text-xl text-white">⚙️ Einstellungen</span>
            <button
              class="text-muted hover:text-white text-xl leading-none transition-colors"
              @click="closeSettings"
            >✕</button>
          </div>

          <!-- Rename Player -->
          <div class="flex flex-col gap-2">
            <div v-if="!renamingPlayer" class="flex items-center justify-between bg-surface2 rounded-xl px-4 py-3">
              <div class="flex flex-col">
                <span class="font-nunito text-xs text-muted">Spielername</span>
                <span class="font-fredoka text-base text-white">{{ playerName }}</span>
              </div>
              <button
                class="bg-accent/20 border border-accent/40 hover:bg-accent/30 text-accent font-nunito text-sm font-bold px-3 py-1.5 rounded-lg transition-all"
                @click="startRename"
              >✏️ Namen ändern</button>
            </div>

            <div v-else class="flex flex-col gap-2">
              <input
                v-model="newName"
                class="bg-surface2 border border-surface2 focus:border-accent text-white font-nunito text-base rounded-xl px-4 py-2 outline-none w-full transition-colors"
                placeholder="Neuer Name…"
                maxlength="30"
                @keyup.enter="confirmRename"
                @keyup.escape="cancelRename"
                autofocus
              />
              <p v-if="renameError" class="font-nunito text-xs text-red-400">{{ renameError }}</p>
              <div class="flex gap-2">
                <button
                  class="flex-1 bg-accent hover:bg-accent/80 text-black font-nunito font-bold text-sm rounded-xl py-2 transition-all"
                  @click="confirmRename"
                >✓ Speichern</button>
                <button
                  class="flex-1 bg-surface2 hover:bg-surface border border-surface2 text-muted hover:text-white font-nunito text-sm rounded-xl py-2 transition-all"
                  @click="cancelRename"
                >Abbrechen</button>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-surface2" />

          <!-- Globale Tabelle -->
          <button
            class="flex items-center gap-3 bg-surface2 hover:bg-accent/10 hover:border-accent/40 border border-transparent rounded-xl px-4 py-3 transition-all text-left"
            @click="goGlobalTable"
          >
            <span class="text-2xl">🌍</span>
            <div class="flex flex-col">
              <span class="font-fredoka text-base text-white">Globale Tabelle</span>
              <span class="font-nunito text-xs text-muted">Weltrangliste anzeigen</span>
            </div>
          </button>

          <!-- Meine letzten Spiele -->
          <button
            class="flex items-center gap-3 bg-surface2 hover:bg-accent/10 hover:border-accent/40 border border-transparent rounded-xl px-4 py-3 transition-all text-left"
            @click="goMyGames"
          >
            <span class="text-2xl">📋</span>
            <div class="flex flex-col">
              <span class="font-fredoka text-base text-white">Meine letzten Spiele</span>
              <span class="font-nunito text-xs text-muted">Lokale Spielhistorie</span>
            </div>
          </button>

        </div>
      </div>
    </Transition>

    <!-- Top bar: player name + settings button -->
    <div class="flex justify-between items-center w-full mb-2 px-4">
      <button
        class="flex items-center gap-1.5 bg-surface border border-surface2 rounded-xl px-3 py-1.5 font-nunito text-sm font-bold text-muted transition-all hover:text-white hover:border-accent2"
        @click="openSettings"
      >⚙️ Einstellungen</button>
      <div class="font-nunito text-sm text-muted">
         <span class="text-white font-bold">{{ playerName }}</span>
      </div>
    </div>

    <!-- Characters -->
    <div class="flex justify-between items-end w-full mb-2 px-2">
      <div class="text-7xl leading-none animate-float-ud drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]">👾</div>
      <div class="text-6xl leading-none animate-float-ud-rev drop-shadow-[0_0_16px_rgba(6,214,160,0.4)]">🧒</div>
    </div>

    <!-- Logo -->
    <div class="text-center mb-5">
      <h1 class="font-fredoka text-3xl sm:text-4xl text-accent2 drop-shadow-[0_0_30px_rgba(255,209,102,0.5)] leading-tight">
        EinMalEins
      </h1>
    </div>

    <!-- Share button -->
    <button
      class="flex items-center gap-1.5 mb-5 bg-surface border border-surface2 rounded-xl px-4 py-1.5 font-nunito text-sm font-bold text-muted transition-all hover:text-white hover:border-accent2"
      @click="shareApp"
    >
      <span>{{ shareCopied ? '✅' : '🔗' }}</span>
      <span>{{ shareCopied ? 'Link kopiert!' : 'Spiel teilen' }}</span>
    </button>

    <GameSelection
      v-if="!selectedGame"
      :games="games"
      @select="onGameSelected"
    />
    <LevelSelection
      v-else
      :game="selectedGame"
      @back="onBack"
      @start="onStart"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
