import { useState, useEffect, useRef } from 'react'
import { X, Timer } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'

interface Props {
  completedHabits:  string[]
  onToggle:         (ids: string[]) => void
  requiredHabitIds: string[]
}

// ─── Timer Overlay ────────────────────────────────────────────────
function HabitTimerOverlay({ habit, onClose, onDone }: { habit: Habit; onClose: () => void; onDone: () => void }) {
  const [started,  setStarted]  = useState(false)
  const [timeLeft, setTimeLeft] = useState(habit.timerSec ?? 0)
  const [done,     setDone]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = habit.timerSec ?? 1

  useEffect(() => {
    if (!started) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current!); setDone(true); playTimerDone(); setTimeout(onDone, 800); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [started, onDone])
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const mins  = Math.floor(timeLeft / 60)
  const secs  = timeLeft % 60
  const pct   = 1 - timeLeft / total
  const circ  = 2 * Math.PI * 54
  const color = CATEGORY_COLORS[habit.category] ?? '#ef4444'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: '#0a0a0a' }}>
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center btn-ghost" style={{ borderRadius: 4 }}>
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <span className="text-6xl">{habit.emoji}</span>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 12 }} dir="rtl">{habit.title}</h2>
        </div>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
          <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={6} strokeLinecap="butt"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x={70} y={65} textAnchor="middle" fill="white" fontSize={done ? 30 : 36} fontWeight={900} fontFamily="sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2,'0')}`}
          </text>
          {!done && <text x={70} y={85} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="sans-serif">
            {started ? 'נותר' : 'מוכן?'}
          </text>}
        </svg>
        {!done && !started && (
          <button onClick={() => setStarted(true)} className="btn-red w-full" style={{ padding: '16px', fontSize: 15, borderRadius: 0 }} dir="rtl">
            התחל {habit.title}
          </button>
        )}
        {started && !done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 700, color, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}40` }} dir="rtl">
            ⏱ רץ... תישאר עם זה
          </div>
        )}
        {done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 900, fontSize: 16, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)' }} dir="rtl">
            ✓ מושלם!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds }: Props) {
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)

  const toggle = (id: string) => {
    const already = completedHabits.includes(id)
    const next = already ? completedHabits.filter(h => h !== id) : [...completedHabits, id]
    if (already) playUncheck(); else playCheck()
    if (next.length === HABITS.length) playComplete()
    onToggle(next)
  }

  const reqDone    = requiredHabitIds.filter(id => completedHabits.includes(id)).length
  const totalDone  = completedHabits.length
  const reqPct     = Math.round((reqDone / requiredHabitIds.length) * 100)
  const allDone    = reqPct === 100

  const required = requiredHabitIds.map(id => HABITS.find(h => h.id === id)).filter((h): h is Habit => !!h)
  const bonus    = HABITS.filter(h => !requiredHabitIds.includes(h.id))

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }} />
      )}

      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '32px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-xs mb-2">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }} dir="rtl">
              פעולות היום
            </h1>
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1, color: allDone ? '#22c55e' : '#ef4444' }}>
              {reqDone}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              / {requiredHabitIds.length}
            </div>
            <div className="label-xs" style={{ marginTop: 2 }}>חובה</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }}>
          <div style={{
            height: '100%', width: `${reqPct}%`,
            background: allDone ? '#22c55e' : '#ef4444',
            transition: 'width 0.5s ease',
          }} />
        </div>

        <div className="flex items-center justify-between">
          <span className="label-xs">{totalDone}/{HABITS.length} סה״כ</span>
          {allDone && <span style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', letterSpacing: 1 }}>✓ כל החובה הושלמו</span>}
        </div>
      </div>

      {/* ── LIST ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 0 32px' }}>

        {/* REQUIRED */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <p className="label-xs mb-4" style={{ color: '#ef4444' }}>— חובה. אסור לדלג</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {required.map((habit, i) => {
              const done  = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#ef4444'
              return (
                <div key={habit.id} className="animate-slide-up"
                  style={{
                    animationDelay: `${i * 50}ms`, animationFillMode: 'both',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', background: done ? 'rgba(255,255,255,0.03)' : '#111',
                    borderLeft: `3px solid ${done ? color : '#ef4444'}`,
                    opacity: done ? 0.55 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                  <button onClick={() => toggle(habit.id)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: done ? color : 'transparent',
                      border: `2px solid ${done ? color : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {done && <span style={{ color: '#000', fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </button>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{habit.emoji}</span>
                  <div dir="rtl" style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: done ? 'rgba(255,255,255,0.4)' : '#fff',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{habit.title}</p>
                    {!done && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{habit.subtitle}</p>}
                  </div>
                  {habit.timerSec && !done && (
                    <button onClick={() => setTimerHabit(habit)}
                      style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', borderRadius: 4 }}>
                      <Timer className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ margin: '0 20px 20px', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* BONUS */}
        <div style={{ padding: '0 20px' }}>
          <p className="label-xs mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>— בונוס. כל אחת ששווה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {bonus.map((habit, i) => {
              const done  = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
              return (
                <div key={habit.id} className="animate-slide-up"
                  style={{
                    animationDelay: `${(required.length + i) * 35}ms`, animationFillMode: 'both',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    opacity: done ? 0.45 : 1,
                  }}>
                  <button onClick={() => toggle(habit.id)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: done ? color : 'transparent',
                      border: `1.5px solid ${done ? color : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                    {done && <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>✓</span>}
                  </button>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{habit.emoji}</span>
                  <p dir="rtl" style={{
                    fontSize: 13, flex: 1, fontWeight: done ? 400 : 600,
                    color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{habit.title}</p>
                  {habit.timerSec && !done && (
                    <button onClick={() => setTimerHabit(habit)}
                      style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: 4 }}>
                      <Timer className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
