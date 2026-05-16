import { useState, useEffect, useRef } from 'react'
import { X, Timer } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'
import type { UserGoal } from '../types'

const GOAL_COLORS: Record<UserGoal['category'], string> = {
  'עסקי':   '#FFD60A',
  'כספי':   '#30D158',
  'בריאות': '#FF375F',
  'קשרים':  '#BF5AF2',
  'אישי':   '#FF9F0A',
}

interface Props {
  completedHabits:  string[]
  onToggle:         (ids: string[]) => void
  requiredHabitIds: string[]
  userGoals?:       UserGoal[]
  onGoToProfile?:   () => void
}

function HabitTimerOverlay({ habit, onClose, onDone, userGoals = [], onGoToProfile }: { habit: Habit; onClose: () => void; onDone: () => void; userGoals?: UserGoal[]; onGoToProfile?: () => void }) {
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
  const color = CATEGORY_COLORS[habit.category] ?? '#FF375F'

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: '#000' }}>
      <button onClick={onClose} className="absolute top-6 right-6 btn-ghost" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}99` }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f2f2f7', marginTop: 12 }} dir="rtl">{habit.title}</h2>
        </div>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={6} />
          <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x={70} y={65} textAnchor="middle" fill="#f2f2f7" fontSize={done ? 30 : 36} fontWeight={900} fontFamily="'Barlow Condensed',sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2,'0')}`}
          </text>
          {!done && <text x={70} y={85} textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize={11} fontFamily="sans-serif">
            {started ? 'נותר' : 'מוכן?'}
          </text>}
        </svg>
        {/* Goals review content for 'goals' habit */}
        {habit.id === 'goals' && !done && (
          <div style={{ width: '100%' }}>
            {userGoals.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>היעדים שלך</p>
                {userGoals.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${GOAL_COLORS[g.category]}0d`, border: `1px solid ${GOAL_COLORS[g.category]}28`, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOAL_COLORS[g.category], flexShrink: 0, boxShadow: `0 0 6px ${GOAL_COLORS[g.category]}88` }} />
                    <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, fontWeight: 600, color: '#f2f2f7' }} dir="rtl">{g.title}</p>
                  </div>
                ))}
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }} dir="rtl">
                  האם הפעולות של היום מכוונות ליעדים האלה?
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '14px', background: 'rgba(255,214,10,.06)', border: '1px dashed rgba(255,214,10,.25)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: 'rgba(255,214,10,.7)', marginBottom: 10 }} dir="rtl">טרם הגדרת יעדים</p>
                <button onClick={() => { onClose(); onGoToProfile?.() }}
                  style={{ background: 'rgba(255,214,10,.1)', border: '1px solid rgba(255,214,10,.3)', borderRadius: 8, padding: '8px 16px', color: '#FFD60A', fontFamily: 'Heebo, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} dir="rtl">
                  הגדר יעדים בפרופיל
                </button>
              </div>
            )}
          </div>
        )}

        {!done && !started && (
          <button onClick={() => setStarted(true)} className="btn-red w-full" style={{ padding: '16px', fontSize: 15 }} dir="rtl">
            התחל {habit.title}
          </button>
        )}
        {started && !done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 12 }} dir="rtl">
            רץ... תישאר עם זה
          </div>
        )}
        {done && (
          <div style={{ width: '100%', padding: '16px', textAlign: 'center', fontWeight: 900, fontSize: 16, color: '#30D158', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12 }} dir="rtl">
            ✓ מושלם!
          </div>
        )}
      </div>
    </div>
  )
}

export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds, userGoals = [], onGoToProfile }: Props) {
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

  const CATEGORY_LABELS: Record<string, string> = {
    production: 'ייצור',
    learning:   'למידה',
    network:    'קשרים',
    discipline: 'משמעת',
  }

  const bonusByCategory = bonus.reduce<Record<string, Habit[]>>((acc, h) => {
    if (!acc[h.category]) acc[h.category] = []
    acc[h.category].push(h)
    return acc
  }, {})

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column' }}>

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }}
          userGoals={userGoals} onGoToProfile={onGoToProfile} />
      )}

      {/* Header */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="label-xs mb-2">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: '"Frank Ruhl Libre", Georgia, serif' }} dir="rtl">פעולות היום</h1>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: '3.5rem', lineHeight: 1, color: allDone ? '#FFD60A' : '#fff' }}>
              {reqDone}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', fontWeight: 700 }}>/ {requiredHabitIds.length}</div>
            <div className="label-xs" style={{ marginTop: 2 }}>חובה</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,.1)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${reqPct}%`, borderRadius: 3,
            background: allDone ? '#FFD60A' : 'linear-gradient(90deg, #FFD60A, rgba(255,255,255,.4))',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="label-xs">{totalDone}/{HABITS.length} סה״כ</span>
          {allDone && <span style={{ fontSize: 10, fontWeight: 900, color: '#30D158', letterSpacing: 1 }}>✓ כל החובה הושלמו</span>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>

        {/* Required */}
        <p className="label-xs mb-4" style={{ color: '#FF375F' }}>— חובה. אסור לדלג</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {required.map((habit, i) => {
            const done  = completedHabits.includes(habit.id)
            const color = CATEGORY_COLORS[habit.category] ?? '#FF375F'
            return (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${done ? 'rgba(255,255,255,.1)' : color + '40'}`,
                  borderRadius: 12,
                  opacity: done ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}>
                <button onClick={() => toggle(habit.id)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: done ? color : 'transparent',
                    border: `2px solid ${done ? color : 'rgba(255,255,255,.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {done && <span className="check-bounce" style={{ color: '#000', fontSize: 10, fontWeight: 900 }}>✓</span>}
                </button>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}88` }} />
                <div dir="rtl" style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: done ? 'rgba(255,255,255,.35)' : '#f2f2f7', textDecoration: done ? 'line-through' : 'none' }}>{habit.title}</p>
                  {!done && <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>{habit.subtitle}</p>}
                </div>
                {habit.timerSec && !done && (
                  <button onClick={() => setTimerHabit(habit)}
                    style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', borderRadius: 8 }}>
                    <Timer className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,.35)' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="divider mb-6" />

        {/* Bonus — grouped by category */}
        <p className="label-xs mb-4" style={{ color: 'rgba(255,255,255,.35)' }}>— בונוס. כל אחת ששווה</p>
        {Object.entries(bonusByCategory).map(([cat, habits]) => {
          const catColor = CATEGORY_COLORS[cat] ?? '#FFD60A'
          const catDone  = habits.filter(h => completedHabits.includes(h.id)).length
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ height: 1, flex: 1, background: `${catColor}30` }} />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: `${catColor}90`, textTransform: 'uppercase' }}>
                  {CATEGORY_LABELS[cat] ?? cat} {catDone > 0 ? `· ${catDone}/${habits.length}` : ''}
                </span>
                <div style={{ height: 1, flex: 1, background: `${catColor}30` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {habits.map((habit, i) => {
                  const done  = completedHabits.includes(habit.id)
                  const color = catColor
                  return (
                    <div key={habit.id} className="animate-slide-up"
                      style={{
                        animationDelay: `${i * 35}ms`, animationFillMode: 'both',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        background: done ? 'rgba(255,255,255,.02)' : 'transparent',
                        border: `1px solid ${done ? 'rgba(255,255,255,.07)' : `${color}25`}`,
                        borderRadius: 10,
                        opacity: done ? 0.45 : 1,
                        transition: 'opacity .2s',
                      }}>
                      <button onClick={() => toggle(habit.id)}
                        style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: done ? color : 'transparent',
                          border: `1.5px solid ${done ? color : `${color}50`}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all .15s',
                        }}>
                        {done && <span className="check-bounce" style={{ color: '#000', fontSize: 9, fontWeight: 900 }}>✓</span>}
                      </button>
                      <div dir="rtl" style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: done ? 400 : 600, color: done ? 'rgba(255,255,255,.35)' : 'rgba(242,242,247,.85)', textDecoration: done ? 'line-through' : 'none' }}>{habit.title}</p>
                        {!done && habit.subtitle && <p style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 2, lineHeight: 1.4 }}>{habit.subtitle}</p>}
                      </div>
                      {habit.timerSec && !done && (
                        <button onClick={() => setTimerHabit(habit)}
                          style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}12`, border: `1px solid ${color}35`, cursor: 'pointer', borderRadius: 8 }}>
                          <Timer className="w-3 h-3" style={{ color }} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
