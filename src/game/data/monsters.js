export const MONSTERS = [
  { emoji: '👾', name: 'Alien Grumpy' },
  { emoji: '🧟', name: 'Zombie Karl' },
  { emoji: '🐉', name: 'Drachen Zola' },
  { emoji: '👻', name: 'Geist Max' },
  { emoji: '🤖', name: 'Roboter Rex' },
  { emoji: '🦇', name: 'Fledermaus' },
  { emoji: '🧌', name: 'Troll Brunno' },
  { emoji: '🦑', name: 'Kraken Kira' },
]

export function monsterForLevel(level) {
  return MONSTERS[(level - 2) % MONSTERS.length]
}
