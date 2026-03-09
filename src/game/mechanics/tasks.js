export function generateTask(state) {
  const unsolved = state.cards.filter(c => !c.solved)
  if (!unsolved.length) return null
  const pick = unsolved[Math.floor(Math.random() * unsolved.length)]
  state.currentTask = { a: pick.a, b: pick.b, result: pick.a * pick.b }
  state.rows = pick.a
  state.cols = pick.b
  return state.currentTask
}

export function isCorrectCard(card, currentTask) {
  return card.a * card.b === currentTask.result
}
