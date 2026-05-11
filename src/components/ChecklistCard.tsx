import { BookOpen, Brain, TrendingUp, Dumbbell, Target, Check, Timer, Square, RotateCcw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { CHECKLIST_ITEMS } from '../constants'

interface Props {
  checks: Record<string, boolean>
  onToggle: (id: string) => void
  customLabels?: string[]
}

const ICONS: Record<string, React.ElementType> = {
  c1: BookOpen,
  c2: Brain,
  c3: TrendingUp,
  c4: Dumbbell,
  c5: Target,
}

// Default timer duration per item (seconds)
const DEFAULT_DURATIONS: Record<string, number> = {
  c1: 30 * 60,  // reading: 30 min
  c2: 50 * 60,  // deep work: 50 min
  c3: 45 * 60,  // income action: 45 min
  c4: 40 * 60,  // exercise: 40 min
  c5: 25 * 60,  // focus: 25 min (pomodoro)
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function playDone() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.15, 0.3].forEach((t, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 660 + i * 110
      gain.gain.setValueAtTime(0.25, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.4)
    })
  } catch {}
}

export function ChecklistCard({ checks, onToggle, customLabels = [] }: Props) {
  const items = CHECKLIST_ITEMS.map((item, i) => ({
    ...item,
    label: customLabels[i]?.trim() || item.label,
  }))

  const done  = Object.values(checks).filter(Boolean).length
  const total = items.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  // ── Timer state ───────────────────────────────────────────────────────
  const [timerItemId, setTimerItemId] = useState<string | null>(null)
  const [timerSecs,   setTimerSecs]   = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick
  useEffect(() => {
    if (!timerActive) return
    intervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setTimerActive(false)
          if (timerItemId && !checks[timerItemId]) onToggle(timerItemId)
          playDone()
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏱ הטיימר הסתיים!', { body: 'עבודה מצוינת — פריט הסומן.', icon: '/logo.svg' })
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [timerActive]) // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = (id: string) => {
    if (timerItemId === id && timerActive) {
      // Pause
      clearInterval(intervalRef.current!)
      setTimerActive(false)
      return
    }
    clearInterval(intervalRef.current!)
    setTimerItemId(id)
    setTimerSecs(DEFAULT_DURATIONS[id] ?? 25 * 60)
    setTimerActive(true)
  }

  const stopTimer = () => {
    clearInterval(intervalRef.current!)
    setTimerActive(false)
    setTimerItemId(null)
    setTimerSecs(0)
  }

  const resumeTimer = () => setTimerActive(true)

  const progress = timerItemId ? (timerSecs / (DEFAULT_DURATIONS[timerItemId] ?? 1)) * 100 : 0

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Gold accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.6), transparent)' }}
      />

      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">DAILY PROTOCOL</p>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-lg"
            style={{ background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', color: '#e8a020' }}
          >
            {done}/{total}
          </span>
        </div>
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #e8a020, #f5c435)',
              boxShadow: pct > 0 ? '0 0 8px rgba(245,196,53,0.4)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Active timer bar */}
      {timerItemId && (
        <div
          className="mx-4 mb-3 rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)' }}
        >
          {/* Mini ring */}
          <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
            <svg width="36" height="36" className="-rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="#f5c435"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className="w-3 h-3" style={{ color: '#f5c435' }} strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[8px] tracking-[3px] uppercase font-bold text-muted mb-0.5">
              {items.find(i => i.id === timerItemId)?.label.slice(0, 30)}
            </p>
            <p className="font-display text-xl leading-none" style={{ color: '#f5c435' }}>{fmt(timerSecs)}</p>
          </div>

          <div className="flex gap-1.5">
            {timerActive ? (
              <button
                onClick={() => { clearInterval(intervalRef.current!); setTimerActive(false) }}
                className="px-3 py-1.5 rounded-lg text-[9px] tracking-[2px] uppercase font-bold"
                style={{ background: 'rgba(232,160,32,0.15)', color: '#f5c435', border: '1px solid rgba(232,160,32,0.3)' }}
              >
                השהה
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="px-3 py-1.5 rounded-lg text-[9px] tracking-[2px] uppercase font-bold"
                style={{ background: 'rgba(232,160,32,0.15)', color: '#f5c435', border: '1px solid rgba(232,160,32,0.3)' }}
              >
                המשך
              </button>
            )}
            <button
              onClick={stopTimer}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Square className="w-3 h-3 text-muted" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-1.5 px-4 pb-4">
        {items.map((item) => {
          const isDone      = checks[item.id] ?? false
          const Icon        = ICONS[item.id]
          const isThisTimer = timerItemId === item.id
          const defMins     = Math.round((DEFAULT_DURATIONS[item.id] ?? 1500) / 60)

          return (
            <div key={item.id} className="flex items-center gap-2">
              {/* Main row */}
              <button
                onClick={() => onToggle(item.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 text-right transition-all duration-200"
                style={{
                  background: isDone ? 'rgba(232,160,32,0.07)' : 'rgba(255,255,255,0.02)',
                  border: isDone ? '1px solid rgba(232,160,32,0.2)' : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center border transition-all duration-200"
                  style={
                    isDone
                      ? { background: 'linear-gradient(135deg,#f5c435,#e8a020)', borderColor: 'transparent', boxShadow: '0 0 8px rgba(232,160,32,0.4)' }
                      : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  {isDone && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                </div>
                <span
                  className="flex-1 text-sm font-medium text-right transition-all duration-200"
                  style={{
                    color: isDone ? 'rgba(240,238,255,0.3)' : 'rgba(240,238,255,0.85)',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </span>
                {Icon && (
                  <Icon
                    className="w-3.5 h-3.5 shrink-0 transition-colors duration-200"
                    style={{ color: isDone ? '#e8a020' : 'rgba(255,255,255,0.15)' }}
                    strokeWidth={1.5}
                  />
                )}
              </button>

              {/* Timer button */}
              {!isDone && (
                <button
                  onClick={() => isThisTimer && !timerActive ? resumeTimer() : startTimer(item.id)}
                  title={`טיימר ${defMins} דקות`}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={
                    isThisTimer
                      ? { background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.4)', color: '#f5c435' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a4868' }
                  }
                >
                  {isThisTimer && !timerActive
                    ? <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    : <Timer className="w-3.5 h-3.5" strokeWidth={1.5} />
                  }
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* All done banner */}
      {done === total && (
        <div
          className="border-t py-3 text-center"
          style={{
            borderColor: 'rgba(245,196,53,0.2)',
            background: 'linear-gradient(90deg, rgba(232,160,32,0.06), rgba(245,196,53,0.1), rgba(232,160,32,0.06))',
          }}
        >
          <p className="text-[8px] tracking-[4px] uppercase font-bold" style={{ color: '#f5c435' }}>
            Protocol Complete · Elite Performance
          </p>
        </div>
      )}
    </div>
  )
}
