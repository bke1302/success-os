import { useState, useEffect, useRef } from 'react'
import { X, Timer, Zap, CheckCircle2 } from 'lucide-react'
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
      style={{ background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(24px)' }}>
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center glass">
        <X className="w-4 h-4 text-muted" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <span className="text-6xl">{habit.emoji}</span>
          <h2 className="text-2xl font-black text-white mt-3" dir="rtl">{habit.title}</h2>
          <p className="text-sm text-sub mt-1" dir="rtl">{habit.subtitle}</p>
        </div>
        <div style={{ position: 'relative' }}>
          <svg width={140} height={140} viewBox="0 0 140 140">
            <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
            <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 14px ${color}90)` }} />
            <text x={70} y={65} textAnchor="middle" fill="white" fontSize={done ? 30 : 34} fontWeight={800} fontFamily="sans-serif">
              {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
            </text>
            {!done && <text x={70} y={85} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="sans-serif">
              {started ? 'נותר' : 'מוכן?'}
            </text>}
          </svg>
        </div>
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
  const allReqDone = reqPct === 100

  const required = requiredHabitIds.map(id => HABITS.find(h => h.id === id)).filter((h): h is Habit => !!h)
  const bonus    = HABITS.filter(h => !requiredHabitIds.includes(h.id))

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#080810', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Ambient orb */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, right: -60,
        width: 300, height: 300, borderRadius: '50%',
        background: allReqDone
          ? 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.8s ease',
      }} />

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }} />
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 animate-fade-in"
        style={{ position: 'relative', zIndex: 1, padding: '36px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[7px] tracking-[5px] uppercase text-muted mb-1">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl font-black text-white" dir="rtl">פעולות היום</h1>
          </div>

          {/* Score ring */}
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg width={64} height={64} viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
              <circle
                cx={32} cy={32} r={26} fill="none"
                stroke={allReqDone ? '#22c55e' : '#ef4444'}
                strokeWidth={5} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - reqPct / 100)}
                style={{
                  transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease',
                  filter: `drop-shadow(0 0 8px ${allReqDone ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.6)'})`,
                }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-black" style={{ fontSize: '1.1rem', color: allReqDone ? '#22c55e' : '#ef4444', lineHeight: 1 }}>
                {reqDone}
              </span>
              <span className="text-[8px] text-muted">/{requiredHabitIds.length}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${reqPct}%`,
              background: allReqDone
                ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                : 'linear-gradient(90deg,#ef4444,#f97316)',
              boxShadow: reqDone > 0 ? `0 0 12px ${allReqDone ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.5)'}` : 'none',
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[8px] text-muted">{totalDone}/{HABITS.length} סה״כ</p>
          {allReqDone && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" style={{ color: '#22c55e' }} />
              <p className="text-[8px] font-black" style={{ color: '#22c55e' }}>כל משימות החובה הושלמו!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── LIST ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>

        {/* REQUIRED */}
        <div style={{ padding: '16px 16px 8px' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3 h-3" style={{ color: '#ef4444' }} strokeWidth={2.5} />
            <span className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: '#ef4444' }}>
              חובה — אסור לדלג
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {required.map((habit, i) => {
              const done  = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
              return (
                <div
                  key={habit.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300 animate-slide-up"
                  style={{
                    animationDelay: `${i * 60}ms`, animationFillMode: 'both',
                    background: done ? `${color}0d` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${done ? color + '35' : 'rgba(239,68,68,0.18)'}`,
                    transform: done ? 'scale(0.99)' : 'scale(1)',
                    boxShadow: done ? `0 0 20px ${color}18` : 'none',
                  }}
                >
                  <div style={{ height: 2, background: done ? color : 'rgba(239,68,68,0.45)', transition: 'background 0.3s' }} />
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ position: 'relative' }}>
                    {done && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(ellipse at 0% 50%, ${color}08, transparent 60%)`,
                        pointerEvents: 'none',
                      }} />
                    )}
                    <button
                      onClick={() => toggle(habit.id)}
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{
                        background: done ? color : 'transparent',
                        border: `2px solid ${done ? color : 'rgba(255,255,255,0.18)'}`,
                        boxShadow: done ? `0 0 16px ${color}70` : 'none',
                      }}
                    >
                      {done && <span style={{ color: '#000', fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </button>
                    <span className="text-2xl shrink-0">{habit.emoji}</span>
                    <div className="flex-1 min-w-0" dir="rtl">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: done ? 'rgba(255,255,255,0.28)' : 'white', textDecoration: done ? 'line-through' : 'none' }}
                      >
                        {habit.title}
                      </p>
                      {!done && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{habit.subtitle}</p>}
                    </div>
                    {habit.timerSec && !done && (
                      <button
                        onClick={() => setTimerHabit(habit)}
                        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}14`, border: `1px solid ${color}28` }}
                      >
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
        <div style={{ padding: '4px 16px 32px' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f5c435', opacity: 0.45 }} />
            <span className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: 'rgba(245,196,53,0.45)' }}>
              בונוס — כל אחת ששווה
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {bonus.map((habit, i) => {
              const done  = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 animate-slide-up"
                  style={{
                    animationDelay: `${(required.length + i) * 40}ms`, animationFillMode: 'both',
                    background: done ? `${color}07` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${done ? color + '28' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <button
                    onClick={() => toggle(habit.id)}
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: done ? color : 'transparent',
                      border: `1.5px solid ${done ? color : 'rgba(255,255,255,0.14)'}`,
                    }}
                  >
                    {done && <span style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>✓</span>}
                  </button>
                  <span className="text-lg shrink-0">{habit.emoji}</span>
                  <p
                    className="text-sm flex-1 min-w-0 truncate"
                    dir="rtl"
                    style={{
                      color: done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                      fontWeight: done ? 400 : 600,
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {habit.title}
                  </p>
                  {habit.timerSec && !done && (
                    <button
                      onClick={() => setTimerHabit(habit)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}11`, border: `1px solid ${color}22` }}
                    >
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
