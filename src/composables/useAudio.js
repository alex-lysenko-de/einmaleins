import { playSuccess, playError, playVictory } from '../game/audio/audioEngine.js'

export function useAudio() {
  return { playSuccess, playError, playVictory }
}
