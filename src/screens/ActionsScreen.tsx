import { useState, useEffect, useRef } from 'react'
import { X, Timer, Zap } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'

interface Props {
  completedHabits:  string[]
  onToggle:         (ids: string[]) => void
  requiredHabitIds: string[]
}

// ─── Timer Overlay ────────────────────────────────────────────────────────────
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

  const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60
  const pct = 1 - timeLeft / total, circ = 2 * Math.PI * 54
  const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(20px)' }}>
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center glass">
        <X className="w-4 h-4 text-muted" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <span className="text-6xl">{habit.emoji}</span>
          <h2 className="text-2xl font-black text-white mt-3" dir="rtl">{habit.title}</h2>
          <p className="text-sm text-sub mt-1" dir="rtl">{habit.subtitle}</p>
        </div>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
          <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${color}80)` }} />
          <text x={70} y={65} textAnchor="middle" fill="white" fontSize={done ? 30 : 34} fontWeight={800} fontFamily="sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
          {!done && <text x={70} y={85} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="sans-serif">
            {started ? 'נותר' : 'מוכן?'}
          </text>}
        </svg>
        {!done && !started && (
          <button onClick={() => setStarted(true)} className="w-full py-4 rounded-2xl font-bold text-lg"
            style={{ background: `linear-gradient(135deg,${color},${color}bb)`, color: '#000', boxShadow: `0 0 28px ${color}40` }} dir="rtl">
            התחל {habit.title}
          </button>
        )}
        {started && !done && (
          <div className="w-full py-4 rounded-2xl text-center font-bold"
            style={{ background: `${color}12`, border: `1px solid ${color}40`, color }} dir="rtl">⏱ רץ... תישאר עם זה</div>
        )}
        {done && (
          <div className="w-full py-4 rounded-2xl text-center font-bold text-lg"
            style={{ background: `${color}18`, border: `1px solid ${color}60`, color }} dir="rtl">✓ מושלם!</div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds }: Props) {
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)

  const toggle = (id: string) => {
    const already = completedHabits.includes(id)
    const next = already ? completedHabits.filter(h => h !== id) : [...completedHabits, id]
    if (already) { playUncheck() } else { playCheck() }
    if (next.length === HABITS.length) playComplete()
    onToggle(next)
  }

  const reqDone   = requiredHabitIds.filter(id => completedHabits.includes(id)).length
  const totalDone = completedHabits.length
  const reqPct    = Math.round((reqDone / requiredHabitIds.length) * 100)

  const required = requiredHabitIds.map(id => HABITS.find(h => h.id === id)).filter((h): h is Habit => !!h)
  const bonus    = HABITS.filter(h => !requiredHabitIds.includes(h.id))

  return (
    <div style={{ minHeight: '100dvh', background: '#080810', display: 'flex', flexDirection: 'column' }}>

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }} />
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-10 pb-5 animate-fade-in"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[8px] tracking-[5px] uppercase text-muted mb-1">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl font-black text-white" dir="rtl">פעולות היום</h1>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black" style={{ color: reqPct === 100 ? '#22c55e' : '#ef4444' }}>
              {reqDone}<span className="text-xl text-muted">/{requiredHabitIds.length}</span>
            </p>
            <p className="text-[8px] tracking-[2px] uppercase text-muted">חובה</p>
          </div>
        </div>

        {/* Required progress bar */}
        <div className="mb-2">
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${reqPct}%`,
                background: reqPct === 100
                  ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                  : 'linear-gradient(90deg,#ef4444,#f97316)',
                boxShadow: reqDone > 0 ? `0 0 14px ${reqPct === 100 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.5)'}` : 'none',
              }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[9px] text-muted">
            {totalDone}/{HABITS.length} סה״כ
          </p>
          {reqPct === 100 && (
            <p className="text-[9px] font-black" style={{ color: '#22c55e' }}>✓ כל משימות החובה הושלמו!</p>
          )}
        </div>
      </div>

      {/* ── LIST ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* REQUIRED */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5" style={{ color: '#ef4444' }} strokeWidth={2.5} />
            <span className="text-[9px] tracking-[4px] uppercase font-black" style={{ color: '#ef4444' }}>
              חובה — אסור לדלג
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {required.map((habit, i) => {
              const done = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
              return (
                <div key={habit.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.99] animate-slide-up"
                  style={{
                    animationDelay: `${i * 60}ms`, animationFillMode: 'both',
                    background: done ? `${color}0f` : 'rgba(255,255,255,0.035)',
                    border: `1px solid ${done ? color + '40' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  {/* Top accent line */}
                  <div style={{ height: 2, background: done ? color : 'rgba(239,68,68,0.5)' }} />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    {/* Check */}
                    <button onClick={() => toggle(habit.id)}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: done ? color : 'transparent',
                        border: `2px solid ${done ? color : 'rgba(255,255,255,0.2)'}`,
                        boxShadow: done ? `0 0 14px ${color}60` : 'none',
                      }}>
                      {done && <span style={{ color: '#000', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </button>
                    <span className="text-2xl shrink-0">{habit.emoji}</span>
                    <div className="flex-1" dir="rtl">
                      <p className={`text-sm font-bold ${done ? 'line-through' : 'text-white'}`}
                        style={{ color: done ? 'rgba(255,255,255,0.3)' : 'white' }}>
                        {habit.title}
                      </p>
                      {!done && <p className="text-[10px] text-muted mt-0.5">{habit.subtitle}</p>}
                    </div>
                    {habit.timerSec && !done && (
                      <button onClick={() => setTimerHabit(habit)}
                        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                        <Timer className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* BONUS */}
        <div className="px-5 pt-2 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#f5c435', opacity: 0.6 }} />
            <span className="text-[9px] tracking-[4px] uppercase font-black" style={{ color: 'rgba(245,196,53,0.5)' }}>
              בונוס — כל אחת ששווה
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {bonus.map((habit, i) => {
              const done = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
              return (
                <div key={habit.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 animate-slide-up"
                  style={{
                    animationDelay: `${(required.length + i) * 40}ms`, animationFillMode: 'both',
                    background: done ? `${color}08` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${done ? color + '30' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                  <button onClick={() => toggle(habit.id)}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: done ? color : 'transparent',
                      border: `1.5px solid ${done ? color : 'rgba(255,255,255,0.15)'}`,
                    }}>
                    {done && <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>✓</span>}
                  </button>
                  <span className="text-lg shrink-0">{habit.emoji}</span>
                  <p className={`text-sm flex-1 ${done ? 'line-through' : 'font-semibold'}`}
                    dir="rtl"
                    style={{ color: done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }}>
                    {habit.title}
                  </p>
                  {habit.timerSec && !done && (
                    <button onClick={() => setTimerHabit(habit)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                      <Timer className="w-3 h-3" style={{ color }} strokeWidth={2} />
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
