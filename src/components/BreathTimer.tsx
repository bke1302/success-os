import { useState, useEffect, useRef, useCallback } from 'react'
import { playBreathTone } from '../utils/sounds'

interface Props {
  onComplete: () => void
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'done'

// Tony Robbins 4-2-6 pattern
const PATTERN: Record<Exclude<Phase, 'idle' | 'done'>, number> = {
  inhale: 4,
  hold:   2,
  exhale: 6,
}
const PHASES: Array<Exclude<Phase, 'idle' | 'done'>> = ['inhale', 'hold', 'exhale']
const TOTAL_ROUNDS = 3

const PHASE_COLORS: Record<Exclude<Phase, 'idle' | 'done'>, string> = {
  inhale: '#ef4444',
  hold:   '#f5c435',
  exhale: 'rgba(99,102,241,0.85)',
}

const PHASE_LABELS: Record<Exclude<Phase, 'idle' | 'done'>, string> = {
  inhale: 'שאף',
  hold:   'החזק',
  exhale: 'נשוף',
}

export function BreathTimer({ onComplete }: Props) {
  const [phase,       setPhase]       = useState<Phase>('idle')
  const [round,       setRound]       = useState(1)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running,     setRunning]     = useState(false)

  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseRef      = useRef<Phase>('idle')
  const roundRef      = useRef(1)
  const secondsRef    = useRef(0)
  const phaseIdxRef   = useRef(0)

  // Sync refs with state so the interval closure always has current values
  phaseRef.current   = phase
  roundRef.current   = round
  secondsRef.current = secondsLeft

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const advancePhase = useCallback(() => {
    const nextIdx = (phaseIdxRef.current + 1) % PHASES.length
    const isNewRound = nextIdx === 0
    const nextRound = roundRef.current + (isNewRound ? 1 : 0)

    if (isNewRound && nextRound > TOTAL_ROUNDS) {
      clearTimer()
      setPhase('done')
      setRunning(false)
      setTimeout(onComplete, 600)
      return
    }

    phaseIdxRef.current = nextIdx
    const nextPhase = PHASES[nextIdx]
    if (isNewRound) setRound(nextRound)
    setPhase(nextPhase)
    setSecondsLeft(PATTERN[nextPhase])
    playBreathTone(nextPhase)
  }, [onComplete])

  useEffect(() => {
    if (!running) return
    clearTimer()
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          advancePhase()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return clearTimer
  }, [running, advancePhase])

  useEffect(() => () => clearTimer(), [])

  const start = () => {
    phaseIdxRef.current = 0
    roundRef.current = 1
    const firstPhase: Exclude<Phase,'idle'|'done'> = 'inhale'
    setRound(1)
    setPhase(firstPhase)
    setSecondsLeft(PATTERN[firstPhase])
    setRunning(true)
    playBreathTone(firstPhase)
  }

  const stop = () => {
    clearTimer()
    setRunning(false)
    setPhase('idle')
    setSecondsLeft(0)
  }

  // Circle scale interpolation
  const getScale = () => {
    if (phase === 'idle' || phase === 'done') return 0.75
    const total = PATTERN[phase as Exclude<Phase,'idle'|'done'>]
    const elapsed = total - secondsLeft
    const progress = total > 0 ? elapsed / total : 0
    if (phase === 'inhale') return 0.55 + progress * 0.45   // 0.55 → 1.0
    if (phase === 'exhale') return 1.0 - progress * 0.45    // 1.0 → 0.55
    return 0.9                                               // hold: steady
  }

  const activeColor = phase !== 'idle' && phase !== 'done'
    ? PHASE_COLORS[phase]
    : 'rgba(255,255,255,0.1)'

  const scale = getScale()

  return (
    <div className="flex flex-col items-center gap-7 py-2">

      {/* Round dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i + 1 < round ? 8 : i + 1 === round && running ? 10 : 8,
              height: i + 1 < round ? 8 : i + 1 === round && running ? 10 : 8,
              background: i + 1 < round
                ? '#f5c435'
                : i + 1 === round && running
                  ? activeColor
                  : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
        <span className="text-[10px] tracking-widest uppercase text-muted ml-1">
          {round}/{TOTAL_ROUNDS}
        </span>
      </div>

      {/* Animated circle */}
      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width:  180, height: 180,
            background: 'transparent',
            border: `2px solid ${activeColor}`,
            opacity: running ? 0.3 : 0.1,
            transform: `scale(${scale + 0.08})`,
          }}
        />
        {/* Main circle */}
        <div
          className="rounded-full transition-all duration-700 flex flex-col items-center justify-center"
          style={{
            width:  140, height: 140,
            background: phase !== 'idle' && phase !== 'done'
              ? `radial-gradient(circle, ${activeColor}30 0%, ${activeColor}10 70%)`
              : 'rgba(255,255,255,0.03)',
            border: `2px solid ${activeColor}`,
            transform: `scale(${scale})`,
            boxShadow: running ? `0 0 40px ${activeColor}40` : 'none',
          }}
        >
          {phase === 'idle' && (
            <span className="text-4xl">🫁</span>
          )}
          {phase === 'done' && (
            <span className="text-4xl">✓</span>
          )}
          {phase !== 'idle' && phase !== 'done' && (
            <>
              <span
                className="text-3xl font-black leading-none"
                style={{ color: activeColor }}
              >
                {secondsLeft}
              </span>
              <span
                className="text-[10px] tracking-widest uppercase font-bold mt-1"
                style={{ color: activeColor }}
                dir="rtl"
              >
                {PHASE_LABELS[phase]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Phase description */}
      <div className="text-center" style={{ minHeight: 36 }}>
        {phase === 'idle' && (
          <p className="text-sm text-sub" dir="rtl">
            4 שניות שאיפה · 2 שניות עצירה · 6 שניות נשיפה
          </p>
        )}
        {phase !== 'idle' && phase !== 'done' && (
          <p className="text-sm font-semibold" style={{ color: activeColor }} dir="rtl">
            {phase === 'inhale' && 'שאף עמוק — מלא את הריאות'}
            {phase === 'hold'   && 'החזק — תן לחמצן להיספג'}
            {phase === 'exhale' && 'נשוף לאט לאט — שחרר הכל'}
          </p>
        )}
        {phase === 'done' && (
          <p className="text-sm font-bold" style={{ color: '#f5c435' }} dir="rtl">
            ✓ המצב שלך השתנה. הגוף קובע את הנפש.
          </p>
        )}
      </div>

      {/* Buttons */}
      {phase === 'idle' && (
        <button
          onClick={start}
          className="w-full py-5 rounded-2xl font-bold text-lg transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff',
            boxShadow: '0 0 25px rgba(239,68,68,0.3)',
          }}
          dir="rtl"
        >
          התחל את הנשימה
        </button>
      )}

      {running && (
        <button
          onClick={stop}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.4)',
          }}
          dir="rtl"
        >
          נעצור
        </button>
      )}

      {phase === 'done' && (
        <div
          className="w-full py-4 rounded-2xl text-center font-bold text-base"
          style={{
            background: 'linear-gradient(135deg,rgba(245,196,53,0.15),rgba(232,160,32,0.1))',
            border: '1px solid rgba(245,196,53,0.4)',
            color: '#f5c435',
          }}
          dir="rtl"
        >
          ✓ 3 סבבים הושלמו — לחץ הבא להמשיך
        </div>
      )}

      <p className="text-[10px] text-muted tracking-widest uppercase text-center">
        MOTION CREATES EMOTION · TONY ROBBINS
      </p>
    </div>
  )
}
