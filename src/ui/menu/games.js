import { markRaw }  from 'vue'
import { useGame }   from '../../composables/useGame.js'
import { useMemory } from '../../composables/useMemory.js'
import { useExam }   from '../../composables/useExam.js'

import BattleLevelPicker from './BattleLevelPicker.vue'
import MemoryLevelPicker from './MemoryLevelPicker.vue'
import ExamLevelPicker   from './ExamLevelPicker.vue'

export function useGames() {
  const { startGame }   = useGame()
  const { startMemory } = useMemory()
  const { startExam }   = useExam()

  return [
    {
      id:          'battle',
      name:        'Kampf gegen Monster',
      description: 'Beantworte Aufgaben um das Monster zu besiegen!',
      emoji:       '👾',
      LevelPicker: markRaw(BattleLevelPicker),
      start:       (level) => startGame(level),
    },
    {
      id:          'memory',
      name:        'Memory Spiel',
      description: 'Finde Paare und trainiere dein Gedächtnis!',
      emoji:       '🃏',
      LevelPicker: markRaw(MemoryLevelPicker),
      start:       (level) => startMemory(level),
    },
    {
      id:          'exam',
      name:        'Schnelltest',
      description: 'Beantworte alle Aufgaben schnell hintereinander!',
      emoji:       '⚡',
      LevelPicker: markRaw(ExamLevelPicker),
      start:       (level) => startExam(level),
    },
  ]
}
