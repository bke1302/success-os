import { useState } from 'react'
import type { DayEntry, WeeklyPlan } from '../types'
import { getLastMondayDate, isSunday } from '../utils/aiCoach'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props { entries: DayEntry[]; plans: WeeklyPlan[]; onSave: (p: WeeklyPlan) => void }

function avg(nums: number[]) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0 }

function getThisWeekWins(entries: DayEntry[], weekStart: string): string[] {
  return entries
    .filter(e => e.date >= weekStart && e.evening?.given)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3).map(e => e.evening!.given ?? e.evening!.win)
}

export function WeeklyWarRoom({ entries, plans, onSave }: Props) {
  const T = useTheme()
  const weekStart  = getLastMondayDate()
  const existing   = plans.find(p => p.weekStart === weekStart)
  const autoWins   = getThisWeekWins(entries, weekStart)

  const [wins,  setWins]  = useState<[string, string, string]>(existing?.wins  ?? [autoWins[0] ?? '', autoWins[1] ?? '', autoWins[2] ?? ''])
  const [goals, setGoals] = useState<[string, string, string]>(existing?.goals ?? ['', '', ''])
  const [saved, setSaved] = useState(!!existing)

  const updateWin  = (i: number, v: string) => setWins(w  => { const n = [...w]  as [string, string, string]; n[i] = v; return n })
  const updateGoal = (i: number, v: string) => setGoals(g => { const n = [...g] as [string, string, string]; n[i] = v; return n })

  const canSave = goals.some(g => g.trim().length > 2)
  const handleSave = () => {
    if (!canSave) return
    onSave({ weekStart, wins, goals, createdAt: new Date().toISOString() })
    playComplete(); setSaved(true)
  }

  // Week stats
  const weekEntries      = entries.filter(e => e.date >= weekStart)
  const weekWithEvening  = weekEntries.filter(e => e.evening)
  const weekAvgScore     = weekWithEvening.length ? avg(weekWithEvening.map(e => e.evening!.score)) : 0
  const weekHabitsTotal  = weekEntries.reduce((s, e) => s + (e.habits?.length ?? 0), 0)
  const weekDays         = weekWithEvening.length
  const weekLabel        = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
  const isTriggerDay     = isSunday()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

          {/* ── Hero ── */}
          <div style={{ padding: '16px 16px 14px' }}>
            <div className="today-hero" style={{
              background: T.isDark
                ? 'linear-gradient(135deg, rgba(255,159,10,.85) 0%, rgba(251,191,36,.65) 45%, rgba(91,140,255,.25) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
                : 'linear-gradient(135deg, rgba(234,136,0,.9) 0%, rgba(251,191,36,.8) 45%, rgba(59,111,239,.25) 100%), linear-gradient(180deg, #fff8e6 0%, #fffbf0 100%)',
              border: '1px solid rgba(251,191,36,.28)',
              boxShadow: '0 8px 32px rgba(251,191,36,.14)',
            }}>
              {/* Watermark */}
              <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '6.5rem', opacity: .045, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>⚔</div>

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative', zIndex: 1 }}>
                <div dir="rtl">
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>WAR ROOM</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>שבוע {weekLabel}</p>
                </div>
                {isTriggerDay && (
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(251,191,36,.2)', border: '1px solid rgba(251,191,36,.4)', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#FFD60A' }}>יום סיכום ✓</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.6rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.25)' }} dir="rtl">
                חדר המלחמה
              </p>

              {/* Stats row */}
              <div style={{ position: 'relative', zIndex: 1, marginTop: 18, display: 'flex', gap: 16 }} dir="rtl">
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{weekDays}/7</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', margin: '3px 0 0', textTransform: 'uppercase' }}>ימים</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{weekAvgScore > 0 ? weekAvgScore.toFixed(1) : '—'}</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', margin: '3px 0 0', textTransform: 'uppercase' }}>ממוצע</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{weekHabitsTotal}</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', margin: '3px 0 0', textTransform: 'uppercase' }}>פעולות</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Wins card ── */}
          <div style={{ padding: '0 16px', marginBottom: 12 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid #30D158', borderRadius: 18, padding: '16px 18px' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#30D158', textTransform: 'uppercase', marginBottom: 16 }}>3 ניצחונות השבוע שעבר</p>
              {([0, 1, 2] as const).map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 900, color: '#30D158', minWidth: 16 }}>{i + 1}</span>
                  <input value={wins[i]} onChange={e => { updateWin(i, e.target.value); if (e.target.value.length === 1) playCheck() }}
                    placeholder={`ניצחון ${i + 1}…`} dir="rtl"
                    style={{ flex: 1, padding: '11px 14px', fontFamily: 'Inter, sans-serif', background: T.tagBg, border: `1px solid ${wins[i].trim() ? 'rgba(48,209,88,.3)' : T.border}`, color: T.text, fontSize: 14, fontWeight: 500, outline: 'none', borderRadius: 10 }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Goals card ── */}
          <div style={{ padding: '0 16px', marginBottom: 12 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid #FBBF24', borderRadius: 18, padding: '16px 18px' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? '#FFD60A' : '#8B6800', textTransform: 'uppercase', marginBottom: 6 }}>3 מטרות לשבוע הבא</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, marginBottom: 16, lineHeight: 1.5 }} dir="rtl">מה 3 הדברים שאם תעשה אותם — השבוע הזה יהיה ניצחון?</p>
              {([0, 1, 2] as const).map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 900, color: T.isDark ? '#FFD60A' : '#8B6800', minWidth: 16 }}>{i + 1}</span>
                  <input value={goals[i]} onChange={e => { updateGoal(i, e.target.value); if (e.target.value.length === 1) playCheck() }}
                    placeholder={`מטרה ${i + 1}…`} dir="rtl"
                    style={{ flex: 1, padding: '11px 14px', fontFamily: 'Inter, sans-serif', background: T.tagBg, border: `1px solid ${goals[i].trim() ? 'rgba(255,214,10,.3)' : T.border}`, color: T.text, fontSize: 14, fontWeight: 500, outline: 'none', borderRadius: 10 }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Past weeks ── */}
          {plans.filter(p => p.weekStart !== weekStart).length > 0 && (
            <div style={{ padding: '0 16px' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>שבועות קודמים</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plans.filter(p => p.weekStart !== weekStart).slice(0, 3).map(plan => (
                  <div key={plan.weekStart} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 18px' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>{plan.weekStart}</p>
                    {plan.goals.filter(g => g.trim()).map((g, i) => (
                      <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 4 }} dir="rtl">· {g}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.border}`, transition: 'background .3s' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px' }}>
          {saved ? (
            <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: '#30D158', background: 'rgba(48,209,88,.06)', border: '1px solid rgba(48,209,88,.2)', borderRadius: 14 }} dir="rtl">
              נעול — יאללה לשבוע! ✓
            </div>
          ) : (
            <button onClick={handleSave} disabled={!canSave} className="btn-gold w-full"
              style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800 }} dir="rtl">
              נעל את השבוע
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
