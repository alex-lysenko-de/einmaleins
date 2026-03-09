import { createGameState }              from '../state/gameState.js'
import { createCards }                  from '../mechanics/cards.js'
import { generateTask, isCorrectCard }  from '../mechanics/tasks.js'
import { applyDamageToMonster, applyDamageToPlayer, isVictory } from '../mechanics/battle.js'
import { buildBuckets }                 from '../mechanics/buckets.js'

export class GameEngine {
  constructor() {
    this.state      = null  // set to the Vue reactive proxy via init()
    this._onVictory = null
    this._onDamage  = null
  }

  /** Hand in the Vue reactive object once — engine mutates it directly */
  init(reactiveState) {
    this.state = reactiveState
  }

  onVictory(fn) { this._onVictory = fn }
  onDamage(fn)  { this._onDamage  = fn }

  startLevel(level) {
    // Mutate the existing reactive proxy in-place to keep Vue's tracking intact
    Object.assign(this.state, createGameState(level))
    this.state.cards = createCards(level)
    generateTask(this.state)
  }

  selectCard(card) {
    if (card.solved || card.state) return

    const correct = isCorrectCard(card, this.state.currentTask)

    if (correct) {
      card.state = 'correct'
      this._onDamage?.({ toMonster: true })

      setTimeout(() => {
        applyDamageToMonster(this.state)
        card.solved = true
        card.state  = null
        this.state.progress++

        if (isVictory(this.state)) {
          this._onVictory?.()
        } else {
          generateTask(this.state)
          this._rebuildBucketsIfNeeded()
        }
      }, 500)

    } else {
      card.state = 'wrong'
      applyDamageToPlayer(this.state)
      this._onDamage?.({ toMonster: false })

      setTimeout(() => {
        card.state = null
        generateTask(this.state)
        this._rebuildBucketsIfNeeded()
      }, 500)
    }
  }

  switchVisualMode(mode) {
    this.state.visualMode = mode
    if (mode !== 'rows') this._rebuildBucketsIfNeeded()
    else this.state.buckets = []
  }

  _rebuildBucketsIfNeeded() {
    if (this.state.visualMode !== 'rows' && this.state.currentTask) {
      this.state.buckets = buildBuckets(this.state.currentTask.result, this.state.rows)
    }
  }
}
