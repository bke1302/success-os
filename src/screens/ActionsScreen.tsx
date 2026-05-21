import { useState, useEffect, useRef } from 'react'
import { X, Timer } from 'lucide-react'
import { HABITS, CATEGORY_COLORS, type Habit } from '../constants'
import { playCheck, playUncheck, playComplete, playTimerDone } from '../utils/sounds'
import { haptic } from '../utils/haptic'
import type { UserGoal, UserHabit } from '../types'
import { useTheme } from '../contexts/ThemeContext'

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
  userHabits?:      UserHabit[]
  onGoToProfile?:   () => void
}

function HabitTimerOverlay({ habit, onClose, onDone, userGoals = [], onGoToProfile }: { habit: Habit; onClose: () => void; onDone: () => void; userGoals?: UserGoal[]; onGoToProfile?: () => void }) {
  const T = useTheme()
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ background: T.bg, transition: 'background .3s' }}>
      <button onClick={onClose} className="absolute top-6 right-6 btn-ghost" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-8 w-full max-w-xs animate-slide-up">
        <div className="text-center">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}99` }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginTop: 12 }} dir="rtl">{habit.title}</h2>
        </div>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={54} fill="none" stroke={T.border2} strokeWidth={6} />
          <circle cx={70} cy={70} r={54} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x={70} y={65} textAnchor="middle" fill={T.text} fontSize={done ? 30 : 36} fontWeight={900} fontFamily="'Barlow Condensed',sans-serif">
            {done ? '✓' : `${mins}:${String(secs).padStart(2,'0')}`}
          </text>
          {!done && <text x={70} y={85} textAnchor="middle" fill={T.textMuted} fontSize={11} fontFamily="sans-serif">
            {started ? 'נותר' : 'מוכן?'}
          </text>}
        </svg>

        {habit.id === 'goals' && !done && (
          <div style={{ width: '100%' }}>
            {userGoals.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>היעדים שלך</p>
                {userGoals.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${GOAL_COLORS[g.category]}0d`, border: `1px solid ${GOAL_COLORS[g.category]}28`, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOAL_COLORS[g.category], flexShrink: 0, boxShadow: `0 0 6px ${GOAL_COLORS[g.category]}88` }} />
                    <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, fontWeight: 600, color: T.text }} dir="rtl">{g.title}</p>
                  </div>
                ))}
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: T.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }} dir="rtl">
                  האם הפעולות של היום מכוונות ליעדים האלה?
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: 16, padding: '14px', background: 'rgba(255,214,10,.06)', border: '1px dashed rgba(255,214,10,.25)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.isDark ? 'rgba(255,214,10,.7)' : '#8B6800', marginBottom: 10 }} dir="rtl">טרם הגדרת יעדים</p>
                <button onClick={() => { onClose(); onGoToProfile?.() }}
                  style={{ background: 'rgba(255,214,10,.1)', border: '1px solid rgba(255,214,10,.3)', borderRadius: 8, padding: '8px 16px', color: T.isDark ? '#FFD60A' : '#8B6800', fontFamily: 'Heebo, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }} dir="rtl">
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

export function ActionsScreen({ completedHabits, onToggle, requiredHabitIds, userGoals = [], userHabits = [], onGoToProfile }: Props) {
  const T = useTheme()
  const [timerHabit, setTimerHabit] = useState<Habit | null>(null)
  const [burstKey,   setBurstKey]   = useState(0)
  const prevAllDone = useRef<boolean | null>(null)

  const totalHabits = HABITS.length + userHabits.length

  const toggle = (id: string) => {
    const already = completedHabits.includes(id)
    const next = already ? completedHabits.filter(h => h !== id) : [...completedHabits, id]
    if (already) { haptic('uncheck'); playUncheck() } else { haptic('check'); playCheck() }
    if (next.length === totalHabits) { haptic('success'); playComplete() }
    onToggle(next)
  }

  const reqDone   = requiredHabitIds.filter(id => completedHabits.includes(id)).length
  const totalDone = completedHabits.length
  const reqPct    = Math.round((reqDone / requiredHabitIds.length) * 100)
  const allDone   = reqPct === 100

  useEffect(() => {
    if (prevAllDone.current === null) {
      prevAllDone.current = allDone  // skip first render
      return
    }
    if (allDone && !prevAllDone.current) {
      setBurstKey(k => k + 1)
      playComplete()
    }
    prevAllDone.current = allDone
  }, [allDone])

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
    <div style={{ height: '100%', overflow: 'hidden', background: T.bg, display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>

      {timerHabit && (
        <HabitTimerOverlay habit={timerHabit} onClose={() => setTimerHabit(null)}
          onDone={() => { toggle(timerHabit.id); setTimerHabit(null) }}
          userGoals={userGoals} onGoToProfile={onGoToProfile} />
      )}

      {/* Header */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 dir="rtl" style={{ fontSize: 24, fontWeight: 900, color: T.text, fontFamily: '"Frank Ruhl Libre", Georgia, serif', margin: 0 }}>פעולות היום</h1>
          <div key={burstKey} style={{ textAlign: 'center', position: 'relative' }}>
            <div className={burstKey > 0 && allDone ? 'burst-animate' : ''}
              style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: '2.6rem', lineHeight: 1, color: allDone ? (T.isDark ? '#FFD60A' : '#8B6800') : T.text, position: 'relative' }}>
              {reqDone}
              {burstKey > 0 && allDone && (
                <div key={`ring-${burstKey}`} className="ring-expand" style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: '2px solid rgba(255,214,10,.5)', pointerEvents: 'none',
                }} />
              )}
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: T.textDim, textTransform: 'uppercase', marginTop: 1 }}>/ {requiredHabitIds.length} חובה</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: T.isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${reqPct}%`, borderRadius: 3,
            background: allDone ? 'linear-gradient(90deg, #FFD60A, #FF9F0A)' : 'linear-gradient(90deg, #4F7DFF, rgba(79,125,255,.5))',
            transition: 'width 0.5s cubic-bezier(.16,1,.3,1)',
            boxShadow: allDone ? '0 0 8px rgba(255,214,10,.4)' : '0 0 8px rgba(79,125,255,.3)',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: T.textDim, textTransform: 'uppercase' }}>{totalDone}/{totalHabits} סה״כ</span>
          {allDone && <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 900, color: '#30D158', letterSpacing: '1px' }}>✓ כל החובה הושלמו</span>}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 68px' }}>

        {/* Required */}
        <p className="label-xs mb-3" style={{ color: '#FF375F', paddingRight: 4 }}>— חובה. אסור לדלג</p>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
          {required.map((habit, i) => {
            const done  = completedHabits.includes(habit.id)
            const color = CATEGORY_COLORS[habit.category] ?? '#FF375F'
            return (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i < required.length - 1 ? `1px solid ${T.divider}` : 'none',
                  direction: 'rtl',
                  transition: 'background .15s',
                }}>
                {/* Category dot */}
                <div style={{ width: 36, height: 36, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}99` }} />
                </div>
                <div dir="rtl" style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: done ? T.textMuted : T.text, textDecoration: done ? 'line-through' : 'none', margin: 0, lineHeight: 1.3 }}>{habit.title}</p>
                  {!done && <p style={{ fontSize: 11.5, color: T.textDim, marginTop: 2, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.subtitle}</p>}
                </div>
                {habit.timerSec && !done && (
                  <button onClick={() => setTimerHabit(habit)}
                    aria-label={`התחל טיימר — ${habit.title}`}
                    style={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.tagBg, border: `1px solid ${T.border}`, cursor: 'pointer', borderRadius: 9 }}>
                    <Timer className="w-3.5 h-3.5" style={{ color: T.textMuted }} />
                  </button>
                )}
                <button onClick={() => toggle(habit.id)}
                  aria-label={done ? `בטל — ${habit.title}` : `סמן כהושלם — ${habit.title}`}
                  aria-pressed={done}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: done ? '#4F7DFF' : 'transparent',
                    border: `2px solid ${done ? '#4F7DFF' : T.border2}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.18s',
                    boxShadow: done ? '0 0 10px rgba(79,125,255,.45)' : 'none',
                  }}>
                  {done && <span className="check-bounce" style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                </button>
              </div>
            )
          })}
        </div>

        {/* Bonus — grouped by category */}
        <p className="label-xs mb-3" style={{ paddingRight: 4, color: T.textMuted }}>— בונוס. כל אחת ששווה</p>
        {Object.entries(bonusByCategory).map(([cat, habits]) => {
          const catColor = CATEGORY_COLORS[cat] ?? '#FFD60A'
          const catDone  = habits.filter(h => completedHabits.includes(h.id)).length
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                <div style={{ height: 1, flex: 1, background: `${catColor}25` }} />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: `${catColor}80`, textTransform: 'uppercase' }}>
                  {CATEGORY_LABELS[cat] ?? cat}{catDone > 0 ? ` · ${catDone}/${habits.length}` : ''}
                </span>
                <div style={{ height: 1, flex: 1, background: `${catColor}25` }} />
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
                {habits.map((habit, i) => {
                  const done = completedHabits.includes(habit.id)
                  return (
                    <div key={habit.id} className="animate-slide-up"
                      style={{
                        animationDelay: `${i * 35}ms`, animationFillMode: 'both',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px',
                        borderBottom: i < habits.length - 1 ? `1px solid ${T.divider}` : 'none',
                        direction: 'rtl',
                        opacity: done ? 0.5 : 1,
                        transition: 'opacity .2s',
                      }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: done ? T.textMuted : T.textSub, textDecoration: done ? 'line-through' : 'none', margin: 0 }}>{habit.title}</p>
                        {!done && habit.subtitle && <p style={{ fontSize: 11, color: T.textDim, marginTop: 2, lineHeight: 1.4 }}>{habit.subtitle}</p>}
                      </div>
                      {habit.timerSec && !done && (
                        <button onClick={() => setTimerHabit(habit)}
                          aria-label={`התחל טיימר — ${habit.title}`}
                          style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${catColor}12`, border: `1px solid ${catColor}30`, cursor: 'pointer', borderRadius: 8 }}>
                          <Timer className="w-3 h-3" style={{ color: catColor }} />
                        </button>
                      )}
                      <button onClick={() => toggle(habit.id)}
                        aria-label={done ? `בטל — ${habit.title}` : `סמן כהושלם — ${habit.title}`}
                        aria-pressed={done}
                        style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: done ? '#4F7DFF' : 'transparent',
                          border: `2px solid ${done ? '#4F7DFF' : T.border2}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all .15s',
                        }}>
                        {done && <span className="check-bounce" style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Personal (user-defined) habits */}
        {userHabits.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '0 4px' }}>
              <div style={{ height: 1, flex: 1, background: 'rgba(191,90,242,.25)' }} />
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(191,90,242,.7)', textTransform: 'uppercase' }}>אישי</span>
              <div style={{ height: 1, flex: 1, background: 'rgba(191,90,242,.25)' }} />
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
              {userHabits.map((habit, i) => {
                const done = completedHabits.includes(habit.id)
                return (
                  <div key={habit.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      borderBottom: i < userHabits.length - 1 ? `1px solid ${T.divider}` : 'none',
                      direction: 'rtl', opacity: done ? 0.5 : 1, transition: 'opacity .2s',
                    }}>
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{habit.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: done ? T.textMuted : T.textSub, textDecoration: done ? 'line-through' : 'none', margin: 0 }}>{habit.title}</p>
                      {!done && habit.subtitle && <p style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{habit.subtitle}</p>}
                    </div>
                    <button onClick={() => toggle(habit.id)}
                      aria-label={done ? `בטל — ${habit.title}` : `סמן כהושלם — ${habit.title}`}
                      aria-pressed={done}
                      style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: done ? '#BF5AF2' : 'transparent',
                        border: `2px solid ${done ? '#BF5AF2' : T.border2}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all .15s',
                      }}>
                      {done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
