import { X, Check, Timer, Zap } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { CHECKLIST_ITEMS } from '../constants'
import { playCheck, playUncheck, playTimerDone } from '../utils/sounds'

interface Props {
  checks: Record<string, boolean>
  onToggle: (id: string) => void
  onClose: () => void
  customLabels: string[]
  score: number
  done: number
  total: number
}

const DEFAULT_DURATIONS: Record<string, number> = {
  c1: 30 * 60, c2: 50 * 60, c3: 45 * 60, c4: 40 * 60, c5: 25 * 60,
}

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

export function WarMode({ checks, onToggle, onClose, customLabels, score, done, total }: Props) {
  const items = CHECKLIST_ITEMS.map((item, i) => ({
    ...item,
    label: customLabels[i]?.trim() || item.label,
  }))

  const [timerItemId, setTimerItemId] = useState<string | null>(null)
  const [timerSecs,   setTimerSecs]   = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!timerActive) return
    intervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          setTimerActive(false)
          if (timerItemId && !checks[timerItemId]) onToggle(timerItemId)
          playTimerDone()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [timerActive]) // eslint-disable-line react-hooks/exhaustive-deps

  const startTimer = (id: string) => {
    if (timerItemId === id && timerActive) {
      clearInterval(intervalRef.current!); setTimerActive(false); return
    }
    clearInterval(intervalRef.current!)
    setTimerItemId(id)
    setTimerSecs(DEFAULT_DURATIONS[id] ?? 25 * 60)
    setTimerActive(true)
  }

  const pct = score
  const circumference = 2 * Math.PI * 70
  const offset = circumference - (pct / 100) * circumference

  const gradeColor = score >= 80 ? '#f5c435' : score >= 60 ? '#e8a020' : score >= 40 ? '#8a88aa' : '#5a5878'
  const gradeLabel = score >= 80 ? 'ELITE' : score >= 60 ? 'SOLID' : score >= 40 ? 'GRIND' : 'START'

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#03030a' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 md:px-10 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#f5c435' }} strokeWidth={1.5} />
          <span className="text-[9px] tracking-[5px] uppercase font-bold" style={{ color: '#f5c435' }}>WAR MODE</span>
        </div>

        {timerItemId && (
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            <span
              className="font-display text-xl"
              style={{ color: timerActive ? '#f5c435' : '#4a4868' }}
            >
              {fmt(timerSecs)}
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <X className="w-4 h-4 text-muted" strokeWidth={1.5} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-16 py-8 overflow-y-auto">

        {/* Score ring */}
        <div className="shrink-0 flex flex-col items-center gap-4">
          <div className="relative">
            <svg width="160" height="160" className="-rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle
                cx="80" cy="80" r="70"
                fill="none"
                stroke={gradeColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                  filter: score > 0 ? `drop-shadow(0 0 12px ${gradeColor}80)` : 'none',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display leading-none" style={{ fontSize: '64px', color: gradeColor }}>{score}</span>
              <span className="text-[9px] tracking-[4px] font-bold text-muted uppercase mt-1">{gradeLabel}</span>
            </div>
          </div>
          <p className="text-[8px] tracking-[3px] uppercase font-bold text-muted">{done}/{total} COMPLETE</p>
        </div>

        {/* Checklist */}
        <div className="w-full max-w-lg flex flex-col gap-3">
          {items.map(item => {
            const isDone      = checks[item.id] ?? false
            const isThisTimer = timerItemId === item.id

            return (
              <div key={item.id} className="flex gap-2">
                <button
                  onClick={() => {
                    isDone ? playUncheck() : playCheck()
                    onToggle(item.id)
                  }}
                  className="flex-1 flex items-center gap-4 px-5 py-4 rounded-2xl text-right transition-all duration-300"
                  style={{
                    background: isDone
                      ? 'linear-gradient(135deg, rgba(232,160,32,0.12), rgba(245,196,53,0.06))'
                      : 'rgba(255,255,255,0.03)',
                    border: isDone ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    transform: isDone ? 'none' : 'none',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border-2 transition-all duration-300"
                    style={
                      isDone
                        ? { background: 'linear-gradient(135deg,#f5c435,#e8a020)', borderColor: 'transparent', boxShadow: '0 0 16px rgba(232,160,32,0.5)' }
                        : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)' }
                    }
                  >
                    {isDone && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                  </div>
                  <span
                    className="flex-1 text-base font-semibold text-right transition-all duration-300"
                    style={{
                      color: isDone ? 'rgba(240,238,255,0.25)' : 'rgba(240,238,255,0.9)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                </button>

                {!isDone && (
                  <button
                    onClick={() => startTimer(item.id)}
                    className="shrink-0 w-12 h-full min-h-[60px] rounded-2xl flex items-center justify-center transition-all duration-200"
                    style={
                      isThisTimer
                        ? { background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.4)', color: '#f5c435' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a4868' }
                    }
                  >
                    <Timer className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="shrink-0 h-1 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #e8a020, #f5c435)`,
            boxShadow: pct > 0 ? '0 0 8px rgba(245,196,53,0.6)' : 'none',
          }}
        />
      </div>
    </div>
  )
}
