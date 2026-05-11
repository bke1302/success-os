// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AC: typeof AudioContext | null = typeof AudioContext !== 'undefined'
  ? AudioContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  : (typeof (window as any).webkitAudioContext !== 'undefined' ? (window as any).webkitAudioContext : null)

function ctx(): AudioContext | null {
  if (!AC) return null
  try { return new AC() } catch { return null }
}

/** Satisfying "tick" when checking an item */
export function playCheck() {
  const c = ctx(); if (!c) return
  const osc = c.createOscillator(), g = c.createGain()
  osc.connect(g); g.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(900, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1400, c.currentTime + 0.08)
  g.gain.setValueAtTime(0.18, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14)
  osc.start(); osc.stop(c.currentTime + 0.14)
}

/** Soft "pop" when unchecking */
export function playUncheck() {
  const c = ctx(); if (!c) return
  const osc = c.createOscillator(), g = c.createGain()
  osc.connect(g); g.connect(c.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(350, c.currentTime + 0.1)
  g.gain.setValueAtTime(0.07, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
  osc.start(); osc.stop(c.currentTime + 0.12)
}

/** Epic 4-note fanfare when all tasks complete */
export function playComplete() {
  const c = ctx(); if (!c) return
  const notes = [523, 659, 784, 1047] // C E G C (major chord arpeggio)
  notes.forEach((freq, i) => {
    const osc = c.createOscillator(), g = c.createGain()
    osc.connect(g); g.connect(c.destination)
    osc.type = 'sine'
    const t = c.currentTime + i * 0.13
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.28, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
    osc.start(t); osc.stop(t + 0.55)
  })
  // Add a shimmering overtone
  const osc2 = c.createOscillator(), g2 = c.createGain()
  osc2.connect(g2); g2.connect(c.destination)
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(2094, c.currentTime + 0.4) // C7
  g2.gain.setValueAtTime(0.1, c.currentTime + 0.4)
  g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2)
  osc2.start(c.currentTime + 0.4); osc2.stop(c.currentTime + 1.2)
}

/** Triple beep for timer done */
export function playTimerDone() {
  const c = ctx(); if (!c) return
  ;[0, 0.15, 0.3].forEach((t, i) => {
    const osc = c.createOscillator(), g = c.createGain()
    osc.connect(g); g.connect(c.destination)
    osc.frequency.value = 660 + i * 110
    g.gain.setValueAtTime(0.25, c.currentTime + t)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.4)
    osc.start(c.currentTime + t); osc.stop(c.currentTime + t + 0.4)
  })
}

/** Breath phase tone — distinct pitch per phase */
export function playBreathTone(phase: 'inhale' | 'hold' | 'exhale'): void {
  const c = ctx(); if (!c) return
  const osc = c.createOscillator(), g = c.createGain()
  osc.connect(g); g.connect(c.destination)
  osc.type = 'sine'
  if (phase === 'inhale') {
    osc.frequency.setValueAtTime(880, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1100, c.currentTime + 0.25)
    g.gain.setValueAtTime(0.14, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4)
    osc.start(); osc.stop(c.currentTime + 0.4)
  } else if (phase === 'hold') {
    osc.frequency.setValueAtTime(528, c.currentTime)
    g.gain.setValueAtTime(0.10, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
    osc.start(); osc.stop(c.currentTime + 0.3)
  } else {
    osc.frequency.setValueAtTime(330, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.3)
    g.gain.setValueAtTime(0.12, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5)
    osc.start(); osc.stop(c.currentTime + 0.5)
  }
}

/** Short chime for achievement unlock */
export function playAchievement() {
  const c = ctx(); if (!c) return
  ;[784, 988, 1175].forEach((freq, i) => {
    const osc = c.createOscillator(), g = c.createGain()
    osc.connect(g); g.connect(c.destination)
    osc.type = 'sine'
    const t = c.currentTime + i * 0.1
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.2, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.start(t); osc.stop(t + 0.4)
  })
}
