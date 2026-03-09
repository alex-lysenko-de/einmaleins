import { reactive, computed, ref } from 'vue'
import { GameEngine }      from '../game/engine/GameEngine.js'
import { createGameState } from '../game/state/gameState.js'
import { monsterForLevel } from '../game/data/monsters.js'
import { playSuccess, playError, playVictory } from '../game/audio/audioEngine.js'
import { useConfetti }     from './useConfetti.js'
import { router }          from '../router/index.js'

// ── Singleton — created once at module level ──────────────────────────────────
const engine = new GameEngine()

const state = reactive(createGameState(2))
engine.init(state)

const currentMonster  = computed(() => monsterForLevel(state.level))
const monsterShaking  = ref(false)
const playerShaking   = ref(false)
const flyingApples    = ref([])
const splatFragments  = ref([])
const starShow        = ref([false, false, false])

let flyAppleId = 0
let splatId    = 0

const SPLAT_EMOJIS = ['🍎', '🍏', '💥', '🌿', '🌱']

// ── Flying apple helpers ──────────────────────────────────────────────────────
function getCharCenter(elemId) {
  const el = document.getElementById(elemId)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

function spawnSplat(x, y) {
  const count = 6
  const frags = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
    const dist  = 28 + Math.random() * 32
    return {
      id:    ++splatId,
      x:     x - 8,
      y:     y - 8,
      fx:    Math.cos(angle) * dist,
      fy:    Math.sin(angle) * dist,
      dur:   0.3 + Math.random() * 0.2,
      emoji: SPLAT_EMOJIS[Math.floor(Math.random() * SPLAT_EMOJIS.length)],
    }
  })
  splatFragments.value.push(...frags)
  setTimeout(() => {
    const ids = new Set(frags.map(f => f.id))
    splatFragments.value = splatFragments.value.filter(f => !ids.has(f.id))
  }, 700)
}

function spawnApple(toMonster) {
  const monsterPos = getCharCenter('char-monster')
  const playerPos  = getCharCenter('char-player')

  const startX = toMonster
    ? (playerPos?.x  ?? window.innerWidth  * 0.82)
    : (monsterPos?.x ?? window.innerWidth  * 0.18)
  const startY = toMonster
    ? (playerPos?.y  ?? window.innerHeight * 0.22)
    : (monsterPos?.y ?? window.innerHeight * 0.22)
  const endX = toMonster
    ? (monsterPos?.x ?? window.innerWidth  * 0.18)
    : (playerPos?.x  ?? window.innerWidth  * 0.82)
  const endY = toMonster
    ? (monsterPos?.y ?? window.innerHeight * 0.22)
    : (playerPos?.y  ?? window.innerHeight * 0.22)

  const id  = ++flyAppleId
  const rot = toMonster ? -300 : 300
  flyingApples.value.push({ id, x: startX - 14, y: startY - 14, dx: endX - startX, dy: endY - startY, rot })

  setTimeout(() => {
    flyingApples.value = flyingApples.value.filter(a => a.id !== id)
    spawnSplat(endX, endY)
    if (toMonster) {
      monsterShaking.value = true
      setTimeout(() => { monsterShaking.value = false }, 450)
    } else {
      playerShaking.value = true
      setTimeout(() => { playerShaking.value = false }, 450)
    }
  }, 480)
}

// ── Wire engine callbacks once ────────────────────────────────────────────────
engine.onDamage(({ toMonster }) => {
  toMonster ? playSuccess() : playError()
  spawnApple(toMonster)
})

const { launchConfetti } = useConfetti()

engine.onVictory(() => {
  playVictory()
  launchConfetti()
  starShow.value = [false, false, false]
  setTimeout(() => { starShow.value[0] = true }, 300)
  setTimeout(() => { starShow.value[1] = true }, 600)
  setTimeout(() => { starShow.value[2] = true }, 900)
  router.push({ name: 'victory' })
})

// ── Public composable ─────────────────────────────────────────────────────────
export function useGame() {
  function startGame(level) {
    engine.startLevel(level)
    router.push({ name: 'game' })
  }

  function selectCard(card)        { engine.selectCard(card) }
  function switchVisualMode(mode)  { engine.switchVisualMode(mode) }

  function nextLevel() {
    engine.startLevel(Math.min(9, state.level + 1))
    router.push({ name: 'game' })
  }

  function goMenu() {
    router.push({ name: 'menu' })
  }

  return {
    state,
    currentMonster,
    monsterShaking,
    playerShaking,
    flyingApples,
    splatFragments,
    starShow,
    startGame,
    selectCard,
    switchVisualMode,
    nextLevel,
    goMenu,
  }
}
