import { useState, useEffect, useRef } from 'react'
import { X, Timer } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'

interface Props {
  completedHabits:  string[]
  onToggle:         (ids: string[]) => void
  requiredHabitIds: string[]   // today's 3 mandatory habits from the program
}

// ─── Habit Timer Overlay ─────────────────────────────────────────────────────
function HabitTimerOverlay({ habit, onClose, onDone }: {
  habit:   Habit
  onClose: () => void
  onDone:  () => void
}) {
  const [started,  setStarted]  = useState(false)
  const [timeLeft, setTimeLeft] = useState(habit.timerSec ?? 0)
  const [done,     setDone]     = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = habit.timerSec ?? 1

  useEffect(() => {
    if (!started) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setDone(true)
          playTimerDone()
          setTimeout(onDone, 800)
          return 0
        }
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
  const color = CATEGORY_COLORS[habit.category] ?? '#f5c435'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(2,2,10,0.97)', backdropFilter: 'blur(20px)' }}>

      <button onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <X className="w-4 h-4 text-muted" />
      </button>

      <div className="flex flex-col items-center gap-8 w-full max-w-xs">
        <div className="text-center">
          <span className="text-6xl">{habit.emoji}</span>
          <h2 className="text-2xl font-black text-white mt-3" dir="rtl">{habit.title}</h2>
          <p className="text-sm text-sub mt-1" dir="rtl">{habit.subtitle}</p>
        </div>

        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7} />
          <circle cx={70} cy={70} r={54} fill="none"
            stroke={color} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${color}70)` }}
          />
          <text x={70} y={65} textAnchor="middle" fill="white"
            fontSize={done ? 30 : 34} fontWeight={800} fontFamily="sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
          </text>
          {!done && (
            <text x={70} y={85} textAnchor="middle" fill="rgba(255,255,255,0.3)"
              fontSize={11} fontFamily="sans-serif">
              {started ? 'נותר' : 'מוכן?'}
            </text>
          )}
        </svg>

        {!done && !started && (
          <button
            onClick={() => setStarted(true)}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all"
            style={{ background: `linear-gradient(135deg,${color},${color}bb)`, color: '#000', boxShadow: `0 0 28px ${color}40` }}
            dir="rtl"
          >
            התחל {habit.title}
          </button>
        )}

        {started && !done && (
          <div
            className="w-full py-4 rounded-2xl text-center font-bold text-base"
            style={{ background: `${color}12`, border: `1px solid ${color}40`, color }}
            dir="rtl"
          >
            ⏱ רץ... תישאר עם זה
          </div>
        )}

        {done && (
          <div
            className="w-full py-4 rounded-2xl text-center font-bold text-lg"
            style={{ background: `${color}18`, border: `1px solid ${color}60`, color }}
            dir="rtl"
          >
            ✓ מושלם! {habit.title} בוצע
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Single Habit Row ─────────────────────────────────────────────────────────
function HabitRow({ habit, done, required, onToggle, onTimer }: {
  habit:    Habit
  done:     boolean
  required: boolean
  onToggle: () => void
  onTimer:  () => void
}) {
  const color = required
    ? (CATEGORY_COLORS[habit.category] ?? '#f5c435')
    : (done ? (CATEGORY_COLORS[habit.category] ?? '#f5c435') : 'rgba(255,255,255,0.25)')

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200"
      style={{
        background: done
          ? `${CATEGORY_COLORS[habit.category] ?? '#f5c435'}10`
          : required
          ? `${CATEGORY_COLORS[habit.category] ?? '#f5c435'}06`
          : 'rgba(255,255,255,0.02)',
        border: done
          ? `1px solid ${CATEGORY_COLORS[habit.category] ?? '#f5c435'}40`
          : required
          ? `1px solid ${CATEGORY_COLORS[habit.category] ?? '#f5c435'}30`
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Required badge */}
      {required && !done && (
        <span
          className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest shrink-0"
          style={{ background: `${CATEGORY_COLORS[habit.category] ?? '#f5c435'}20`, color: CATEGORY_COLORS[habit.category] ?? '#f5c435' }}
        >
          חובה
        </span>
      )}

      {/* Check button */}
      <button
        onClick={onToggle}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background:  done ? (CATEGORY_COLORS[habit.category] ?? '#f5c435') : 'transparent',
          border:      `2px solid ${done ? (CATEGORY_COLORS[habit.category] ?? '#f5c435') : 'rgba(255,255,255,0.2)'}`,
          boxShadow:   done ? `0 0 10px ${CATEGORY_COLORS[habit.category] ?? '#f5c435'}60` : 'none',
        }}
      >
        {done && <span style={{ color: '#000', fontSize: 11, fontWeight: 900 }}>✓</span>}
      </button>

      {/* Content */}
      <span className="text-xl shrink-0">{habit.emoji}</span>
      <div className="flex-1 min-w-0" dir="rtl">
        <p
          className={`text-sm font-bold leading-tight ${done ? 'line-through' : ''}`}
          style={{ color: done ? 'rgba(255,255,255,0.35)' : 'white' }}
        >
          {habit.title}
        </p>
        {!done && (
          <p className="text-[10px] text-muted leading-relaxed mt-0.5">{habit.subtitle}</p>
        )}
      </div>

      {/* Timer button */}
      {habit.timerSec && !done && (
        <button
          onClick={onTimer}
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: `${color}15`, border: `1px solid ${color}35` }}
        >
          <Timer className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ─── Main ActionsScreen ───────────────────────────────────────────────────────
export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds }: Props) {
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)

  const toggle = (id: string) => {
    const already = completedHabits.includes(id)
    const next = already
      ? completedHabits.filter(h => h !== id)
      : [...completedHabits, id]
    if (already) { playUncheck() } else { playCheck() }
    if (next.length === HABITS.length) playComplete()
    onToggle(next)
  }

  const requiredDone  = requiredHabitIds.filter(id => completedHabits.includes(id)).length
  const totalDone     = completedHabits.length
  const donePct       = Math.round((totalDone / HABITS.length) * 100)
  const requiredPct   = Math.round((requiredDone / requiredHabitIds.length) * 100)

  const requiredHabits = requiredHabitIds
    .map(id => HABITS.find(h => h.id === id))
    .filter((h): h is Habit => h !== undefined)

  const bonusHabits = HABITS.filter(h => !requiredHabitIds.includes(h.id))

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

      {timerHabit && (
        <HabitTimerOverlay
          habit={timerHabit}
          onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }}
        />
      )}

      {/* Header */}
      <div className="shrink-0 px-6 pt-8 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[9px] tracking-[5px] uppercase text-muted mb-1">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-3xl md:text-4xl gold-text mb-4" dir="rtl">
          המשימות שלי
        </h1>

        {/* Required progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#ef4444' }}>
              חובה
            </span>
            <span className="text-sm font-black" style={{ color: requiredPct === 100 ? '#22c55e' : '#ef4444' }}>
              {requiredDone}/{requiredHabitIds.length}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:      `${requiredPct}%`,
                background: requiredPct === 100
                  ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                  : 'linear-gradient(90deg,#ef4444,#dc2626)',
                boxShadow:  requiredDone > 0 ? '0 0 10px rgba(239,68,68,0.4)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Total progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:      `${donePct}%`,
                background: 'linear-gradient(90deg,#f5c435,#e8a020)',
              }}
            />
          </div>
          <span className="text-xs font-bold shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {totalDone}/{HABITS.length} סה״כ
          </span>
        </div>

        {requiredPct === 100 && (
          <p className="text-xs font-bold mt-2" style={{ color: '#22c55e' }} dir="rtl">
            ✓ השלמת את כל משימות החובה! המשך לבונוס.
          </p>
        )}
        {donePct === 100 && (
          <p className="text-xs font-bold mt-1" style={{ color: '#22c55e' }} dir="rtl">
            🔥 יום מושלם — עשית הכל!
          </p>
        )}
      </div>

      {/* Habits */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

        {/* ── REQUIRED ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[8px] tracking-[3px] uppercase font-bold" style={{ color: '#ef4444' }}>
              חובה היום
            </p>
            <span
              className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              אסור לדלג
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {requiredHabits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                done={completedHabits.includes(habit.id)}
                required
                onToggle={() => toggle(habit.id)}
                onTimer={() => setTimerHabit(habit)}
              />
            ))}
          </div>
        </div>

        {/* ── BONUS ────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[8px] tracking-[3px] uppercase font-bold" style={{ color: '#f5c435' }}>
              בונוס
            </p>
            <span
              className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest"
              style={{ background: 'rgba(245,196,53,0.12)', color: '#f5c435' }}
            >
              כל אחת ששווה זהב
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {bonusHabits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                done={completedHabits.includes(habit.id)}
                required={false}
                onToggle={() => toggle(habit.id)}
                onTimer={() => setTimerHabit(habit)}
              />
            ))}
          </div>
        </div>

        <p className="text-[9px] text-muted text-center leading-relaxed pb-2" dir="rtl">
          לחץ על ✓ לסימון ידני · לחץ על ⏱ להפעלת טיימר מונחה
        </p>
      </div>
    </div>
  )
}
