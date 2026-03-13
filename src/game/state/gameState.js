import { MAX_HP } from '../data/levels.js'

export function createGameState(level) {
  return {
    level,
    monsterHP:   MAX_HP,
    playerHP:    MAX_HP,
    progress:    0,
    cards:       [],
    currentTask: null,
    rows:        0,
    cols:        0,
    visualMode:  'bucket', // 'bucket' | 'rows' | 'numbers'
    buckets:     [],
  }
}
