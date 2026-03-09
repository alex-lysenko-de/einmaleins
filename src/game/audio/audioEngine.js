let audioCtx = null

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

export function playSuccess() {
  try {
    const ctx = getAudio()
    ;[523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'triangle'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3)
      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + 0.35)
    })
  } catch (e) {}
}

export function playError() {
  try {
    const ctx = getAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3)
  } catch (e) {}
}

export function playVictory() {
  try {
    const ctx = getAudio()
    ;[523, 659, 784, 1047, 784, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'triangle'; osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.start(t); osc.stop(t + 0.2)
    })
  } catch (e) {}
}
