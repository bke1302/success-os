import { useState } from 'react'
import { HABITS } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete } from '../utils/sounds'
import type { MorningEntry } from '../types'

interface Props {
  onComplete:          (data: MorningEntry) => void
  dayCount:            number
  streak:              number
  lastWin?:            string
  yesterdayHabitsPct:  number   // 0–1
}

export function MorningPrime({ onComplete, dayCount, streak, lastWin, yesterdayHabitsPct }: Props) {
  const [commitment, setCommitment] = useState('')

  const theme         = getCurrentWeekTheme(dayCount)
  const requiredIds   = getTodayRequiredHabitIds(dayCount)
  const requiredHabits = requiredIds
    .map(id => HABITS.find(h => h.id === id))
    .filter((h): h is typeof HABITS[number] => h !== undefined)

  const coach = getCoachMessage({
    streak,
    dayCount,
    yesterdayHabitsPct,
    currentHour: new Date().getHours(),
  })

  const toneColor = coach.tone === 'fire' ? '#ef4444'
                  : coach.tone === 'green' ? '#22c55e'
                  : '#f5c435'

  const handleStart = () => {
    playComplete()
    onComplete({
      gratitudes:  ['', '', ''],
      vision:      ['', '', ''],
      identity:    theme.title,
      purpose:     theme.desc,
      commitment:  commitment.trim() || 'ביצוע תוכנית היום',
      incantation: '',
      energyLevel: 7,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#02020a', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-6 pt-8 pb-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[9px] tracking-[5px] uppercase font-bold"
            style={{ color: toneColor }}
          >
            יום {dayCount} ·{' '}
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          {streak > 0 && (
            <span className="text-sm font-black" style={{ color: '#f5c435' }}>
              🔥 {streak} ימים
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-white mb-0.5" dir="rtl">{theme.title}</h1>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }} dir="rtl">{theme.desc}</p>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5" style={{ paddingBottom: '120px' }}>

        {/* Yesterday's win */}
        {lastWin && (
          <div
            className="rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <span className="text-lg shrink-0">🏆</span>
            <div dir="rtl">
              <p className="text-[9px] tracking-widest uppercase font-bold mb-0.5" style={{ color: '#22c55e' }}>
                הניצחון של אתמול
              </p>
              <p className="text-sm font-medium text-white leading-relaxed">{lastWin}</p>
            </div>
          </div>
        )}

        {/* Coach message */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${toneColor}12 0%, rgba(2,2,10,0.9) 85%)`,
            border: `1px solid ${toneColor}28`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${toneColor}60, transparent)` }}
          />
          <p className="text-[8px] tracking-[4px] uppercase mb-3 font-bold" style={{ color: toneColor }}>
            המאמן אומר
          </p>
          <p className="text-xl font-black text-white mb-2 leading-snug" dir="rtl">
            {coach.title}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }} dir="rtl">
            {coach.body}
          </p>
        </div>

        {/* Today's mandatory program */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[8px] tracking-[4px] uppercase font-bold" style={{ color: theme.color }}>
              חובה היום
            </p>
            <span
              className="text-[8px] px-2 py-0.5 rounded-full font-black"
              style={{ background: `${theme.color}18`, color: theme.color }}
            >
              3 משימות
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {requiredHabits.map((habit, i) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-4"
                style={{ background: `${theme.color}08`, border: `1px solid ${theme.color}35` }}
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: theme.color, color: '#000' }}
                >
                  {i + 1}
                </span>
                <span className="text-2xl shrink-0">{habit.emoji}</span>
                <div dir="rtl" className="flex-1">
                  <p className="text-sm font-bold text-white">{habit.title}</p>
                  <p
                    className="text-[10px] leading-relaxed mt-0.5"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {habit.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional extra commitment */}
        <div>
          <p className="text-[8px] tracking-[4px] uppercase font-bold mb-2" style={{ color: '#f5c435' }} dir="rtl">
            מה אתה מוסיף מעצמך? (לא חובה)
          </p>
          <input
            value={commitment}
            onChange={e => setCommitment(e.target.value)}
            placeholder="פעולה נוספת שאתה מתחייב עליה..."
            dir="rtl"
            className="w-full rounded-2xl px-4 py-4 text-base font-semibold text-white outline-none transition-all placeholder:text-muted placeholder:font-normal"
            style={{
              background: commitment.trim() ? 'rgba(245,196,53,0.05)' : 'rgba(255,255,255,0.03)',
              border:     commitment.trim() ? '1px solid rgba(245,196,53,0.3)' : '1px solid rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Quote to pump up */}
        <div
          className="rounded-xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }} dir="rtl">
            "המשמעת היא הגשר בין מטרות להישגים."
          </p>
        </div>

      </div>

      {/* ── Sticky CTA ────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-16 left-0 right-0 px-6 pb-4 pt-5"
        style={{ background: 'linear-gradient(to top, #02020a 70%, transparent)' }}
      >
        <button
          onClick={handleStart}
          className="w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95"
          style={{
            background:  'linear-gradient(135deg, #ef4444, #dc2626)',
            color:       '#fff',
            boxShadow:   '0 0 32px rgba(239,68,68,0.4)',
            letterSpacing: '0.02em',
          }}
          dir="rtl"
        >
          יאללה! מתחיל היום 🔥
        </button>
      </div>

    </div>
  )
}
