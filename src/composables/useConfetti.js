import { ref } from 'vue'

const showConfetti   = ref(false)
const confettiPieces = ref([])

const COLORS = ['#ff6b35', '#ffd166', '#06d6a0', '#ef476f', '#7c3aed', '#00b4d8']

export function useConfetti() {
  function launchConfetti() {
    confettiPieces.value = Array.from({ length: 60 }, (_, i) => ({
      id:       i,
      x:        Math.random() * 100,
      size:     6 + Math.random() * 8,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 2 + Math.random() * 2,
      delay:    Math.random() * 1,
    }))
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value   = false
      confettiPieces.value = []
    }, 5000)
  }

  return { showConfetti, confettiPieces, launchConfetti }
}
