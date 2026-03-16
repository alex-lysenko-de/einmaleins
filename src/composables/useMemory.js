import { reactive, computed, ref } from 'vue'
import { createMemoryCards }              from '../game/modes/memoryMode.js'
import { monsterForLevel }                from '../game/data/monsters.js'
import { playSuccess, playError, playVictory } from '../game/audio/audioEngine.js'
import { useAppleAnimation, spawnApple }  from './useAppleAnimation.js'
import { useConfetti }                    from './useConfetti.js'
import { router }                         from '../router/index.js'

const MAX_PLAYER_HP    = 9
const EXPLOSION_DELAY  = 550   // ms — block "explodes" before vanishing
const GRAVITY_DELAY    = 700   // ms — delay between each gravity step
const MONSTER_TIMEOUT  = 6000  // ms — monster escapes after 6 s
const FALLING_BOUNCE   = 150   // ms — duration of the bounce animation when a block lands
const MONSTER_SHAKE    = 300   // ms — duration of monster shake when hit
const PLAYER_SHAKE     = 300   // ms — duration of player shake when hit
const CONFETTI_DURATION = 2000  // ms — how long the confetti should fly after victory
const VICTORY_DELAY    = 1800  // ms — delay between killing monster and showing victory state#
const MONSTER_ESCAPE_DURATION = 800 // ms — duration of the monster escape animation
const MONSTER_DEATH_DURATION = 1800 // ms — duration of the monster death animation
const MONSTER_APPEAR_DURATION = 600 // ms — duration of the monster appear animation
const MONSTER_SQUASH_DURATION = 500 // ms — duration of the monster squash animation
const PLAYER_HIT_DURATION = 500 // ms — duration of the player hit animation
const GAME_OVER_DELAY = 1500 // ms — delay between player HP reaching 0 and showing game over screen
const ANSWER_REVEAL_DURATION = 1300 // ms — how long a wrong answer stays revealed
const QUESTION_ACTIVE_DURATION = 2000 // ms — how long a question stays active before auto-resetting
const ANSWER_EXPLOSION_DURATION = 550 // ms — how long the answer explosion animation lasts
const MONSTER_ESCAPE_DELAY = 800 // ms — delay between monster starting escape and actually escaping
const MONSTER_SPAWN_DELAY = 1000 // ms — delay between monster disappearing and respawning after being killed or escaping
const MAX_MONSTER_TIME = 6000 // ms — maximum time the monster can stay in the appeared state before escaping
const MIN_MONSTER_TIME = 3000 // ms — minimum time the monster stays in the appeared state before it can start escaping
const MONSTER_ESCAPE_CHANCE = 0.5 // probability that the monster will try to escape when its time is up, instead of just escaping off-screen
const MONSTER_ESCAPE_REFUGE_CHANCE = 0.7 // probability that the escaping monster will choose a refuge card to hide behind, if any are available

// ── Singleton state ───────────────────────────────────────────────────────────
const state = reactive({
  level:          2,
  questions:      [],
  answers:        [],       // flat list of all 9 answer cards
  grid:           [],       // 3-row × 3-col live grid; grid[r][c] = card | null
  activeQuestion: null,
  playerHP:       MAX_PLAYER_HP,
  locked:         false,
  monstersKilled: 0,

  monster: {
    status:          'hidden',  // 'hidden' | 'appeared' | 'escaping' | 'dead' | 'escaped'
    col:             null,      // column index 0-2 in the bottom row (row 2)
    hiddenBehindId:  null,      // id of the answer card currently hiding the monster
    timeLeft:        0,         // seconds remaining in appeared state
    appearCount:     0,         // increments each time monster appears → CSS key
    escapeDir:       0,         // -1 left, +1 right  (for CSS animation)
    _timer:          null,
    _interval:       null,
  },
})

// Track which card ids just "landed" after a fall (for bounce animation)
const fallingIds = ref({})

const currentMonster = computed(() => monsterForLevel(state.level))
// TODO: don't throw the apples in this game
const monsterShaking = computed(() => state.monster.status === 'appeared' && state.monster.timeLeft <= 2)
const playerShaking = computed(() => state.playerHP <= 2)   
const { launchConfetti } = useConfetti()

// ── Grid helpers ──────────────────────────────────────────────────────────────

function buildGrid(answers) {
  // Row 0 = top, row 2 = bottom
  return [
    [answers[0] ?? null, answers[1] ?? null, answers[2] ?? null],
    [answers[3] ?? null, answers[4] ?? null, answers[5] ?? null],
    [answers[6] ?? null, answers[7] ?? null, answers[8] ?? null],
  ]
}

/** Returns a Set of card-ids that are currently supported (won't fall). */
function findSupportedIds(grid) {
  const sup = new Set()

  // Bottom row is always supported
  for (let c = 0; c < 3; c++) {
    if (grid[2][c]) sup.add(grid[2][c].id)
  }

  // Propagate: a card is supported if the card directly below it is supported,
  // OR any horizontal neighbour in the same row is supported.
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c < 3; c++) {
        const card = grid[r][c]
        if (!card || sup.has(card.id)) continue

        // Supported from below?
        if (grid[r + 1][c] && sup.has(grid[r + 1][c].id)) {
          sup.add(card.id); changed = true; continue
        }
        // Supported horizontally?
        for (const dc of [-1, 1]) {
          const nc = c + dc
          if (nc >= 0 && nc < 3 && grid[r][nc] && sup.has(grid[r][nc].id)) {
            sup.add(card.id); changed = true; break
          }
        }
      }
    }
  }
  return sup
}

/**
 * Moves each unsupported card one row down (if the cell below is empty).
 * Returns true if anything moved.
 */
function applyOneStep(grid) {
  const sup = findSupportedIds(grid)
  let moved = false

  // Process bottom-up so a falling card doesn't block another in the same step
  for (let r = 1; r >= 0; r--) {
    for (let c = 0; c < 3; c++) {
      const card = grid[r][c]
      if (!card) continue
      if (!sup.has(card.id) && !grid[r + 1][c]) {
        grid[r + 1][c] = card
        grid[r][c]     = null
        moved = true

        // Mark this card as "just landed" for the bounce animation
        fallingIds.value = { ...fallingIds.value, [card.id]: true }
        setTimeout(() => {
          const copy = { ...fallingIds.value }
          delete copy[card.id]
          fallingIds.value = copy
        }, GRAVITY_DELAY + FALLING_BOUNCE - 50)
      }
    }
  }
  return moved
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ── Monster helpers ───────────────────────────────────────────────────────────

function bottomCards(grid) {
  const result = []
  for (let c = 0; c < 3; c++) {
    if (grid[2][c]) result.push({ card: grid[2][c], col: c })
  }
  return result
}

/** Hides the monster behind a random bottom-row card. */
function spawnMonsterHidden() {
  const m    = state.monster
  const opts = bottomCards(state.grid)
  if (!opts.length) return          // no bottom cards left — skip
  const pick = opts[Math.floor(Math.random() * opts.length)]
  m.status         = 'hidden'
  m.col            = pick.col
  m.hiddenBehindId = pick.card.id
}

/** Called each time an answer card is successfully removed from the grid. */
function onCardRemoved(removedId) {
  const m = state.monster
  if (m.status !== 'hidden') return
  if (m.hiddenBehindId !== removedId) return

  // The block hiding the monster was just blasted away!
  m.status         = 'appeared'
  m.hiddenBehindId = null
  m.timeLeft       = MAX_MONSTER_TIME / 1000
  m.appearCount++

  // Countdown tick
  m._interval = setInterval(() => {
    m.timeLeft = Math.max(0, m.timeLeft - 1)
  }, 1000) 

  // Escape timer
  m._timer = setTimeout(startMonsterEscape, MONSTER_TIMEOUT)
}

/** Check if a block just landed on the monster's cell. */
function checkMonsterSquash() {
  const m = state.monster
  if (m.status !== 'appeared') return
  if (state.grid[2]?.[m.col]) {
    killMonster()
  }
}

function killMonster() {
  const m = state.monster
  clearTimeout(m._timer)
  clearInterval(m._interval)
  m.status = 'dead'
  state.monstersKilled++
  playVictory()
  launchConfetti()

  setTimeout(() => {
    m.status = 'hidden'
    m.col    = null
    spawnMonsterHidden()
  }, MONSTER_DEATH_DURATION + MONSTER_SPAWN_DELAY)
}

function startMonsterEscape() {
  const m    = state.monster
  if (m.status !== 'appeared') return
  clearInterval(m._interval)

  const opts   = bottomCards(state.grid).filter(b => b.col !== m.col)
  if (!opts.length) {
    // No refuge left — monster just escapes off-screen
    m.status    = 'escaped'
    m.escapeDir = 0
    setTimeout(() => { m.status = 'hidden'; m.col = null; spawnMonsterHidden() }, MONSTER_ESCAPE_DURATION)
    return
  }

  const nearest = opts.reduce((best, cur) =>
    Math.abs(cur.col - m.col) < Math.abs(best.col - m.col) ? cur : best
  )

  m.escapeDir      = nearest.col < m.col ? -1 : 1
  m.status         = 'escaping'

  setTimeout(() => {
    m.status         = 'hidden'
    m.col            = nearest.col
    m.hiddenBehindId = nearest.card.id
  }, MONSTER_ESCAPE_DURATION)
}

// ── Physics simulation ────────────────────────────────────────────────────────

async function runGravity(removedCardId) {
  // Reveal monster if it was hiding behind this card
  onCardRemoved(removedCardId)

  await sleep(GRAVITY_DELAY)

  let steps = 0
  while (steps < 10) {  // safety to prevent infinite loops
    const moved = applyOneStep(state.grid)
    if (!moved) break
    checkMonsterSquash()
    steps++
    await sleep(GRAVITY_DELAY)
  }

  state.locked = false
}

// ── Public composable ─────────────────────────────────────────────────────────
export function useMemory() {

  function startMemory(level) {
    // Cancel any ongoing monster timers
    clearTimeout(state.monster._timer)
    clearInterval(state.monster._interval)

    const { questions, answers } = createMemoryCards(level)
    answers.forEach(a => { a.state = 'idle' })
    questions.forEach(q => { q.state = 'idle' })

    Object.assign(state, {
      level,
      questions,
      answers,
      grid:           buildGrid(answers),
      activeQuestion: null,
      playerHP:       MAX_PLAYER_HP,
      locked:         false,
      monstersKilled: 0,
    })

    Object.assign(state.monster, {
      status: 'hidden', col: null, hiddenBehindId: null,
      timeLeft: 0, appearCount: 0, escapeDir: 0,
      _timer: null, _interval: null,
    })

    spawnMonsterHidden()
    router.push({ name: 'memory' })
  }

  function selectQuestion(card) {
    if (state.locked || card.state === 'matched') return
    if (state.activeQuestion?.id === card.id) {
      card.state = 'idle'
      state.activeQuestion = null
      return
    }
    if (state.activeQuestion) state.activeQuestion.state = 'idle'
    card.state = 'active'
    state.activeQuestion = card
  }

  function selectAnswer(card) {
    if (state.locked || card.state === 'matched' || card.state === 'exploding') return
    if (!state.activeQuestion) return

    const q = state.activeQuestion
    state.locked = true
    card.state = 'active'

    if (q.pairId === card.pairId) {
      // ── Correct! ──────────────────────────────────────────────────────────
      playSuccess()
      //spawnApple(true)
      q.state    = 'matched'
      card.state = 'exploding'
      state.activeQuestion = null

      setTimeout(async () => {
        // Remove from grid
        const removedId = card.id
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            if (state.grid[r]?.[c]?.id === removedId) state.grid[r][c] = null
          }
        }
        card.state = 'matched'

        // Run physics (unlocks state when done)
        await runGravity(removedId)

        // Victory check
        if (state.answers.every(a => a.state === 'matched')) {
          await sleep(VICTORY_DELAY)
          playVictory()
          launchConfetti()
          router.push({ name: 'memory-victory' })
        }
      }, EXPLOSION_DELAY)

    } else {
      // ── Wrong ─────────────────────────────────────────────────────────────
      playError()
      //spawnApple(false)
      card.state = 'revealed'

      setTimeout(() => {
        card.state = 'idle'
        q.state    = 'idle'
        state.activeQuestion = null
        state.playerHP--
        state.locked = false
        if (state.playerHP <= 0) router.push({ name: 'memory-gameover' })
      }, ANSWER_REVEAL_DURATION + ANSWER_EXPLOSION_DURATION)
    }
  }

  function goMenu() {
    clearTimeout(state.monster._timer)
    clearInterval(state.monster._interval)
    router.push({ name: 'menu' })
  }

  function retry() { startMemory(state.level) }

  return {
    state,
    fallingIds,
    currentMonster,
    monsterShaking,
    playerShaking,
    startMemory,
    selectQuestion,
    selectAnswer,
    goMenu,
    retry,
  }
}
