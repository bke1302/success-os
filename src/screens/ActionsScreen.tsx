import { useState, useEffect, useRef } from 'react'
import { X, Timer } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'

interface Props {
  completedHabits:  string[]
  onToggle:         (ids: string[]) => void
  requiredHabitIds: string[]
}

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: '#0a0a0f' }}>
      <button onClick={onClose} className="absolute top-6 right-6 btn-ghost" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <span style={{ fontSize: '3.5rem' }}>{habit.emoji}</span>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#e8e8f0', marginTop: 12 }} dir="rtl">{habit.title}</h2>
        </div>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke="#2a2a3d" strokeWidth={6} />
          <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x={70} y={65} textAnchor="middle" fill="#e8e8f0" fontSize={done ? 30 : 36} fontWeight={900} fontFamily="'Bebas Neue',sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2,'0')}`}
          </text>
          {!done && <text x={70} y={85} textAnchor="middle" fill="#6b6b8a" fontSize={11} fontFamily="sans-serif">
            {started ? 'נותר' : 'מוכן?'}
          </text>}
        </svg>
        {!done && !started && (
          <button onClick={() => setStarted(true)} className="btn-red w-full" style={{ padding: '16px', fontSize: 15 }} dir="rtl">
            התחל {habit.title}
          </button>
        )}
        {started && !done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 12 }} dir="rtl">
            ⏱ רץ... תישאר עם זה
          </div>
        )}
        {done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 900, fontSize: 16, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12 }} dir="rtl">
            ✓ מושלם!
          </div>
        )}
      </div>
    </div>
  )
}

export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds }: Props) {
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)

  const toggle = (id: string) => {
    const already = completedHabits.includes(id)
    const next = already ? completedHabits.filter(h => h !== id) : [...completedHabits, id]
    if (already) playUncheck(); else playCheck()
    if (next.length === HABITS.length) playComplete()
    onToggle(next)
  }

  const reqDone   = requiredHabitIds.filter(id => completedHabits.includes(id)).length
  const totalDone = completedHabits.length
  const reqPct    = Math.round((reqDone / requiredHabitIds.length) * 100)
  const allDone   = reqPct === 100

  const required = requiredHabitIds.map(id => HABITS.find(h => h.id === id)).filter((h): h is Habit => !!h)
  const bonus    = HABITS.filter(h => !requiredHabitIds.includes(h.id))

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }} />
      )}

      {/* Header */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '28px 20px 20px', borderBottom: '1px solid #2a2a3d' }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-xs mb-2">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e8e8f0' }} dir="rtl">פעולות היום</h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: '3.5rem', lineHeight: 1, color: allDone ? '#22c55e' : '#ef4444' }}>
              {reqDone}
            </div>
            <div style={{ fontSize: 12, color: '#6b6b8a', fontWeight: 700 }}>/ {requiredHabitIds.length}</div>
            <div className="label-xs" style={{ marginTop: 2 }}>חובה</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: '#2a2a3d', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${reqPct}%`, borderRadius: 3,
            background: allDone ? '#22c55e' : 'linear-gradient(90deg, #f5c435, #ef4444)',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="label-xs">{totalDone}/{HABITS.length} סה״כ</span>
          {allDone && <span style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', letterSpacing: 1 }}>✓ כל החובה הושלמו</span>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>

        {/* Required */}
        <p className="label-xs mb-4" style={{ color: '#ef4444' }}>— חובה. אסור לדלג</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {required.map((habit, i) => {
            const done  = completedHabits.includes(habit.id)
            const color = CATEGORY_COLORS[habit.category] ?? '#ef4444'
            return (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: done ? 'rgba(255,255,255,0.02)' : '#12121a',
                  border: `1px solid ${done ? '#2a2a3d' : color + '40'}`,
                  borderRadius: 12,
                  opacity: done ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}>
                <button onClick={() => toggle(habit.id)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: done ? color : 'transparent',
                    border: `2px solid ${done ? color : '#2a2a3d'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {done && <span style={{ color: '#000', fontSize: 10, fontWeight: 900 }}>✓</span>}
                </button>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{habit.emoji}</span>
                <div dir="rtl" style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: done ? '#6b6b8a' : '#e8e8f0', textDecoration: done ? 'line-through' : 'none' }}>{habit.title}</p>
                  {!done && <p style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{habit.subtitle}</p>}
                </div>
                {habit.timerSec && !done && (
                  <button onClick={() => setTimerHabit(habit)}
                    style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a28', border: '1px solid #2a2a3d', cursor: 'pointer', borderRadius: 8 }}>
                    <Timer className="w-3.5 h-3.5" style={{ color: '#6b6b8a' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="divider mb-6" />

        {/* Bonus */}
        <p className="label-xs mb-4" style={{ color: '#6b6b8a' }}>— בונוס. כל אחת ששווה</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bonus.map((habit, i) => {
            const done  = completedHabits.includes(habit.id)
            const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
            return (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${(required.length + i) * 35}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px',
                  background: 'transparent',
                  border: '1px solid #2a2a3d',
                  borderRadius: 10,
                  opacity: done ? 0.45 : 1,
                }}>
                <button onClick={() => toggle(habit.id)}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: done ? color : 'transparent',
                    border: `1.5px solid ${done ? color : '#2a2a3d'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                  {done && <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>✓</span>}
                </button>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{habit.emoji}</span>
                <p dir="rtl" style={{
                  fontSize: 13, flex: 1, fontWeight: done ? 400 : 600,
                  color: done ? '#6b6b8a' : 'rgba(232,232,240,0.75)',
                  textDecoration: done ? 'line-through' : 'none',
                }}>{habit.title}</p>
                {habit.timerSec && !done && (
                  <button onClick={() => setTimerHabit(habit)}
                    style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #2a2a3d', cursor: 'pointer', borderRadius: 6 }}>
                    <Timer className="w-3 h-3" style={{ color: '#6b6b8a' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
