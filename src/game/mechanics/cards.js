export function createCards(level) {
  return Array.from({ length: 9 }, (_, i) => ({
    id:     i + 1,
    a:      level,
    b:      i + 2,
    solved: false,
    state:  null,  // null | 'correct' | 'wrong'
  }))
}
