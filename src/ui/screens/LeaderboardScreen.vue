<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchLeaderboard } from '../../services/leaderboard.js'
import { getOrCreateGuid, getPlayerName, getHistory } from '../../services/playerStore.js'
import { router } from '../../router/index.js'
import { useRoute } from 'vue-router'

const route       = useRoute()
const userId      = getOrCreateGuid()
const playerName  = getPlayerName()

// view: 'global' | 'local' | null (both)
const view = computed(() => route.query.view || null)

const loading     = ref(true)
const error       = ref('')
const top10       = ref([])
const myEntry     = ref(null)
const myRank      = ref(null)

// Local history
const history     = ref(getHistory().slice(0, 10))

const pageTitle = computed(() => {
  if (view.value === 'global') return '🌍 Globale Tabelle'
  if (view.value === 'local')  return '📋 Meine letzten Spiele'
  return '🏆 Bestenliste'
})

onMounted(async () => {
  if (view.value !== 'local') {
    const result = await fetchLeaderboard(userId)
    if (result.error) error.value = 'Verbindung fehlgeschlagen'
    top10.value   = result.top10
    myEntry.value = result.myEntry
    myRank.value  = result.myRank
  }
  loading.value = false
})

function medalFor(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank
}
</script>

<template>
  <div class="flex flex-col py-4 pb-8 min-h-screen gap-4">

    <!-- Header -->
    <div class="flex justify-between items-center">
      <button
        class="bg-surface border border-surface2 rounded-xl px-3.5 py-2 text-muted font-nunito text-sm font-bold transition-all hover:text-white hover:border-accent"
        @click="router.push({ name: 'menu' })"
      >← Menü</button>
      <div class="font-fredoka text-base text-accent2">{{ pageTitle }}</div>
    </div>

    <!-- Global leaderboard: shown when view is 'global' or null -->
    <div
      v-if="view !== 'local'"
      class="bg-surface border border-surface2 rounded-2xl p-4 flex flex-col gap-3"
    >
      <h2 class="font-fredoka text-lg text-white">🌍 Globale Tabelle</h2>

      <div v-if="loading" class="flex justify-center py-6">
        <div class="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>

      <p v-else-if="error" class="text-red font-nunito text-sm text-center py-4">{{ error }}</p>

      <template v-else>
        <!-- Top 10 -->
        <div
          v-for="(entry, i) in top10" :key="entry.userId"
          class="flex items-center gap-3 rounded-xl px-3 py-2 transition-all"
          :class="entry.userId === userId
            ? 'bg-accent/20 border border-accent/40'
            : 'bg-surface2'"
        >
          <div class="w-7 text-center font-fredoka text-lg flex-shrink-0">
            {{ medalFor(i + 1) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-fredoka text-base text-white truncate">
              {{ entry.name }}
              <span v-if="entry.userId === userId" class="text-accent text-xs ml-1">(du)</span>
            </div>
          </div>
          <div class="font-fredoka text-xl text-accent2 flex-shrink-0">{{ entry.bestScore }}</div>
        </div>

        <!-- Current player if outside top 10 -->
        <template v-if="myEntry && myRank > 10">
          <div class="text-center text-muted font-nunito text-xs">···</div>
          <div class="flex items-center gap-3 bg-accent/20 border border-accent/40 rounded-xl px-3 py-2">
            <div class="w-7 text-center font-fredoka text-base flex-shrink-0 text-muted">{{ myRank }}</div>
            <div class="flex-1 font-fredoka text-base text-white truncate">
              {{ myEntry.name }} <span class="text-accent text-xs">(du)</span>
            </div>
            <div class="font-fredoka text-xl text-accent2">{{ myEntry.bestScore }}</div>
          </div>
        </template>

        <p v-if="!top10.length" class="text-muted font-nunito text-sm text-center py-2">
          Noch keine Einträge. Sei der Erste!
        </p>
      </template>
    </div>

    <!-- Local history: shown when view is 'local' or null -->
    <div
      v-if="view !== 'global'"
      class="bg-surface border border-surface2 rounded-2xl p-4 flex flex-col gap-3"
    >
      <h2 class="font-fredoka text-lg text-white">📋 Meine letzten Spiele</h2>

      <p v-if="!history.length" class="text-muted font-nunito text-sm text-center py-2">
        Noch keine Spiele gespielt.
      </p>

      <div
        v-for="(entry, i) in history" :key="i"
        class="flex items-center gap-3 bg-surface2 rounded-xl px-3 py-2"
      >
        <div class="flex-1">
          <div class="font-fredoka text-base text-white">{{ entry.level }}</div>
          <div class="font-nunito text-xs text-muted">
            {{ entry.correctAnswers }}/{{ entry.total }} richtig ·
            {{ new Date(entry.date).toLocaleDateString('de-DE') }}
          </div>
        </div>
        <div class="font-fredoka text-xl text-accent2">{{ entry.score }}</div>
      </div>
    </div>

  </div>
</template>
