import { useState } from 'react'
import { Check, ChevronRight, RotateCcw } from 'lucide-react'
import { HABITS } from '../constants'
import type { HabitChallenge, DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  challenge?: HabitChallenge
  entries:    DayEntry[]
  onSave:     (c: HabitChallenge) => void
  onClear:    () => void
}

const MILESTONES = [7, 14, 21, 30]

function getDaysCompleted(habitId: string, startDate: string, entries: DayEntry[]): number {
  return entries.filter(e => e.date >= startDate && e.habits?.includes(habitId)).length
}

function getChallengeStreak(habitId: string, startDate: string, entries: DayEntry[]): number {
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const date = d.toISOString().slice(0, 10)
    if (date < startDate) break
    const entry = entries.find(e => e.date === date)
    if (entry?.habits?.includes(habitId)) streak++
    else if (i > 0) break
  }
  return streak
}

function getDayDots(habitId: string, startDate: string, entries: DayEntry[]) {
  const dots: boolean[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)
    if (date > today) { dots.push(false); continue }
    dots.push(!!(entries.find(e => e.date === date)?.habits?.includes(habitId)))
  }
  return dots
}

export function HabitChallengeScreen({ challenge, entries, onSave, onClear }: Props) {
  const T = useTheme()
  const [step,     setStep]     = useState<1 | 2>(1)
  const [selected, setSelected] = useState<string>(challenge?.habitId ?? '')

  // Active challenge view
  if (challenge) {
    const daysCompleted  = getDaysCompleted(challenge.habitId, challenge.startDate, entries)
    const currentStreak  = getChallengeStreak(challenge.habitId, challenge.startDate, entries)
    const dots           = getDayDots(challenge.habitId, challenge.startDate, entries)
    const habit          = HABITS.find(h => h.id === challenge.habitId)
    const pct            = Math.round((daysCompleted / 30) * 100)
    const isComplete     = daysCompleted >= 30

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

            {/* Hero */}
            <div style={{ padding: '16px 16px 14px' }}>
              <div className="today-hero" style={{
                background: T.isDark
                  ? 'linear-gradient(135deg, rgba(74,222,128,.85) 0%, rgba(16,185,129,.65) 55%, rgba(91,140,255,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
                  : 'linear-gradient(135deg, rgba(22,163,74,.9) 0%, rgba(16,185,129,.8) 55%, rgba(59,111,239,.2) 100%), linear-gradient(180deg, #f0fdf4 0%, #e6ffee 100%)',
                border: '1px solid rgba(74,222,128,.28)',
                boxShadow: '0 8px 32px rgba(74,222,128,.14)',
              }}>
                <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '6.5rem', opacity: .045, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>🏆</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative', zIndex: 1 }}>
                  <div dir="rtl">
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>30 DAY CHALLENGE</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>{habit?.title}</p>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 999, background: isComplete ? 'rgba(251,191,36,.25)' : 'rgba(74,222,128,.18)', border: `1px solid ${isComplete ? 'rgba(251,191,36,.4)' : 'rgba(74,222,128,.35)'}`, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: isComplete ? '#FBBF24' : '#4ADE80' }}>
                      {isComplete ? 'הושלם! 🏆' : `${pct}%`}
                    </span>
                  </div>
                </div>

                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.6rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.25)' }} dir="rtl">
                  {daysCompleted}/30 ימים
                </p>

                <div style={{ position: 'relative', zIndex: 1, marginTop: 18, display: 'flex', gap: 16 }} dir="rtl">
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{currentStreak}</p>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', margin: '3px 0 0', textTransform: 'uppercase' }}>רצף</p>
                  </div>
                  <div style={{ width: 1, background: 'rgba(255,255,255,.15)', alignSelf: 'stretch' }} />
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px' }}>{30 - daysCompleted}</p>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', margin: '3px 0 0', textTransform: 'uppercase' }}>נותרו</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 30-day grid */}
            <div style={{ padding: '0 16px', marginBottom: 12 }}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 14 }}>30 יום — כל נקודה = יום ✓</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
                  {dots.map((done, i) => {
                    const milestone = MILESTONES.includes(i + 1)
                    return (
                      <div key={i} style={{
                        width: '100%', aspectRatio: '1', borderRadius: 5,
                        background: done ? '#4ADE80' : i < dots.filter((_, j) => {
                          const d = new Date(challenge.startDate); d.setDate(d.getDate() + j)
                          return d.toISOString().slice(0, 10) <= new Date().toISOString().slice(0, 10)
                        }).length ? T.isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)' : T.isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)',
                        boxShadow: done ? '0 0 5px rgba(74,222,128,.35)' : 'none',
                        border: milestone ? '1px solid rgba(251,191,36,.4)' : 'none',
                        position: 'relative',
                      }}>
                        {milestone && !done && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 8, color: 'rgba(251,191,36,.5)' }}>{i + 1}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1px', color: T.textMuted, marginTop: 10, textTransform: 'uppercase' }} dir="rtl">
                  מסגרת זהובה = אבן דרך (7 / 14 / 21 / 30)
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div style={{ padding: '0 16px', marginBottom: 12 }}>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 14 }}>אבני דרך</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {MILESTONES.map(m => {
                    const reached = daysCompleted >= m
                    return (
                      <div key={m} style={{
                        flex: 1, textAlign: 'center', padding: '10px 6px',
                        borderRadius: 12,
                        background: reached ? 'rgba(251,191,36,.12)' : T.tagBg,
                        border: `1px solid ${reached ? 'rgba(251,191,36,.3)' : T.border}`,
                      }}>
                        {reached && <Check style={{ width: 12, height: 12, color: '#FBBF24', margin: '0 auto 4px' }} strokeWidth={3} />}
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 900, color: reached ? '#FBBF24' : T.textMuted, margin: 0 }}>{m}</p>
                        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 7, fontWeight: 700, letterSpacing: '1px', color: T.textMuted, margin: '2px 0 0', textTransform: 'uppercase' }}>ימים</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reset CTA */}
        <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.border}`, transition: 'background .3s' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px' }}>
            <button onClick={onClear}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: T.textMuted }}
              dir="rtl">
              <RotateCcw style={{ width: 13, height: 13 }} strokeWidth={2} />
              התחל אתגר חדש
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Wizard
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

          {/* Hero */}
          <div style={{ padding: '16px 16px 14px' }}>
            <div className="today-hero" style={{
              background: T.isDark
                ? 'linear-gradient(135deg, rgba(74,222,128,.8) 0%, rgba(16,185,129,.6) 55%, rgba(91,140,255,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
                : 'linear-gradient(135deg, rgba(22,163,74,.9) 0%, rgba(16,185,129,.8) 55%, rgba(59,111,239,.2) 100%), linear-gradient(180deg, #f0fdf4 0%, #e6ffee 100%)',
              border: '1px solid rgba(74,222,128,.28)',
              boxShadow: '0 8px 32px rgba(74,222,128,.12)',
            }}>
              <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '6.5rem', opacity: .045, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>🎯</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, position: 'relative', zIndex: 1 }} dir="rtl">
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', margin: 0 }}>30 DAY CHALLENGE</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.45)', margin: 0 }}>{step}/2</p>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.3rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.25)' }} dir="rtl">
                {step === 1 ? 'בחר הרגל' : 'קח את האתגר'}
              </p>
              <div style={{ position: 'relative', zIndex: 1, marginTop: 14 }}>
                <div style={{ height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(step / 2) * 100}%`, background: 'rgba(255,255,255,.8)', borderRadius: 2, transition: 'width .4s cubic-bezier(.16,1,.3,1)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: pick habit */}
          {step === 1 && (
            <div style={{ padding: '0 16px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 16 }} dir="rtl">
                בחר הרגל אחד לאתגר 30 יום. רק אחד. כי מיקוד הוא העוצמה.
              </p>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
                {HABITS.map((h, i) => {
                  const isSelected = selected === h.id
                  return (
                    <button key={h.id} onClick={() => { setSelected(h.id); playCheck() }} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', textAlign: 'right',
                      borderBottom: i < HABITS.length - 1 ? `1px solid ${T.divider}` : 'none',
                      background: isSelected ? 'rgba(74,222,128,.07)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      direction: 'rtl',
                      transition: 'background .15s',
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        border: isSelected ? 'none' : `2px solid ${T.border2}`,
                        background: isSelected ? '#4ADE80' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isSelected ? '0 0 8px rgba(74,222,128,.4)' : 'none',
                        transition: 'all .2s',
                      }}>
                        {isSelected && <Check style={{ width: 12, height: 12, color: '#000' }} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: isSelected ? 700 : 500, color: isSelected ? T.text : T.textSub, margin: 0 }}>{h.title}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>{h.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: confirm */}
          {step === 2 && (
            <div style={{ padding: '0 16px' }}>
              {(() => {
                const habit = HABITS.find(h => h.id === selected)
                return (
                  <>
                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid #4ADE80', borderRadius: 18, padding: '18px 20px', marginBottom: 14 }}>
                      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#4ADE80', textTransform: 'uppercase', marginBottom: 8 }}>ההרגל שבחרת</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-.5px' }} dir="rtl">{habit?.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, margin: '6px 0 0', lineHeight: 1.5 }} dir="rtl">{habit?.subtitle}</p>
                    </div>

                    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '18px 20px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1.4, margin: 0 }} dir="rtl">
                        30 ימים. כל יום. אין תירוצים.
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65, margin: '10px 0 0' }} dir="rtl">
                        21 יום בונים הרגל. 30 יום בונים זהות. אתה לא רק עושה את ה{habit?.title} — אתה הופך למישהו שתמיד עושה אותו.
                      </p>
                      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        {MILESTONES.map(m => (
                          <div key={m} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', background: T.tagBg, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 900, color: T.textSub, margin: 0 }}>{m}</p>
                            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 7, fontWeight: 700, letterSpacing: '1px', color: T.textMuted, margin: '2px 0 0', textTransform: 'uppercase' }}>ימים</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.border}`, transition: 'background .3s' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px' }}>
          {step === 1 ? (
            <button onClick={() => { if (selected) { playCheck(); setStep(2) } }} disabled={!selected}
              className="btn-green w-full"
              style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              dir="rtl">
              המשך
              <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={() => {
                playComplete()
                onSave({ habitId: selected, startDate: new Date().toISOString().slice(0, 10) })
              }}
              className="btn-green w-full"
              style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              dir="rtl">
              קח את האתגר
              <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
