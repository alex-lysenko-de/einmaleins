export function applyDamageToMonster(state) {
  if (state.monsterHP > 0) state.monsterHP--
}

export function applyDamageToPlayer(state) {
  if (state.playerHP > 0) state.playerHP--
}

export function isVictory(state) {
  return state.progress >= 9
}
