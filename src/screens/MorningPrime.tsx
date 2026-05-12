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
  yesterdayHabitsPct:  number
}

export function MorningPrime({ onComplete, dayCount, streak, lastWin, yesterdayHabitsPct }: Props) {
  const [commitment, setCommitment] = useState('')

  const theme          = getCurrentWeekTheme(dayCount)
  const requiredIds    = getTodayRequiredHabitIds(dayCount)
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

  const glowClass = coach.tone === 'fire'  ? 'animate-glow-red'
                  : coach.tone === 'green' ? 'animate-glow-green'
                  : 'animate-glow-gold'

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
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(ellipse at 60% -10%, ${toneColor}09 0%, transparent 55%),
          radial-gradient(ellipse at 0% 80%, ${theme.color}05 0%, transparent 50%),
          #02020a
        `,
      }}
    >

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-6 pt-10 pb-5 animate-fade-in delay-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-3">

          {/* Day pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${toneColor}12`,
              border: `1px solid ${toneColor}30`,
            }}
          >
            <span className="text-[10px] font-black tracking-[3px] uppercase" style={{ color: toneColor }}>
              יום {dayCount}
            </span>
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(245,196,53,0.08)',
                border: '1px solid rgba(245,196,53,0.25)',
              }}
            >
              <span className="text-base leading-none">🔥</span>
              <span className="text-sm font-black" style={{ color: '#f5c435' }}>{streak}</span>
              <span className="text-[8px] tracking-[2px] uppercase text-muted">STREAK</span>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-black text-white mb-1 leading-none" dir="rtl">
          {theme.title}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }} dir="rtl">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4" style={{ paddingBottom: '130px' }}>

        {/* Yesterday's win */}
        {lastWin && (
          <div
            className="rounded-2xl px-4 py-3.5 flex items-start gap-3 animate-slide-up delay-1 shimmer-card"
            style={{
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <span className="text-xl shrink-0 mt-0.5">🏆</span>
            <div dir="rtl">
              <p
                className="text-[8px] tracking-[4px] uppercase font-black mb-1"
                style={{ color: '#22c55e' }}
              >
                הניצחון של אתמול
              </p>
              <p className="text-sm font-semibold text-white leading-relaxed">{lastWin}</p>
            </div>
          </div>
        )}

        {/* ── Coach Card (THE focal point) ──────────────────────────────────── */}
        <div
          className={`rounded-3xl relative overflow-hidden animate-slide-up delay-2 shimmer-card ${glowClass}`}
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, ${toneColor}15 0%, rgba(8,8,20,0.95) 65%)
            `,
            border: `1px solid ${toneColor}30`,
          }}
        >
          {/* Top glow line */}
          <div style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${toneColor}, transparent)`,
          }} />

          {/* Spotlight orb */}
          <div
            className="animate-float"
            style={{
              position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
              width: 260, height: 180,
              background: `radial-gradient(ellipse, ${toneColor}14 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div className="p-6 relative">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
                style={{ background: toneColor }}
              />
              <p
                className="text-[8px] tracking-[5px] uppercase font-black"
                style={{ color: toneColor }}
              >
                המאמן אומר
              </p>
            </div>

            <p className="text-2xl font-black text-white mb-3 leading-tight" dir="rtl">
              {coach.title}
            </p>
            <p
              className="text-sm leading-[1.8]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
              dir="rtl"
            >
              {coach.body}
            </p>
          </div>

          {/* Bottom border glow */}
          <div style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${toneColor}40, transparent)`,
          }} />
        </div>

        {/* ── Today's required program ──────────────────────────────────────── */}
        <div className="animate-slide-up delay-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: theme.color }} />
              <span
                className="text-[8px] tracking-[4px] uppercase font-black"
                style={{ color: theme.color }}
              >
                חובה היום
              </span>
            </div>
            <span
              className="text-[8px] px-2 py-1 rounded-full font-black tracking-widest uppercase"
              style={{ background: `${theme.color}15`, color: theme.color }}
            >
              3 / 3
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {requiredHabits.map((habit, i) => (
              <div
                key={habit.id}
                className={`flex items-center rounded-2xl overflow-hidden animate-slide-up`}
                style={{
                  animationDelay: `${0.18 + i * 0.07}s`,
                  animationFillMode: 'both',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                }}
              >
                {/* Left accent strip */}
                <div style={{ width: 3, alignSelf: 'stretch', background: theme.color, flexShrink: 0 }} />

                <div className="flex items-center gap-3.5 px-4 py-4 flex-1">
                  {/* Number badge */}
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: `${theme.color}22`, color: theme.color, border: `1px solid ${theme.color}40` }}
                  >
                    {i + 1}
                  </span>

                  <span className="text-2xl shrink-0">{habit.emoji}</span>

                  <div dir="rtl" className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{habit.title}</p>
                    <p
                      className="text-[10px] mt-0.5 leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                      {habit.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Optional extra ────────────────────────────────────────────────── */}
        <div className="animate-slide-up delay-5">
          <p
            className="text-[8px] tracking-[4px] uppercase font-black mb-2.5 px-1"
            style={{ color: 'rgba(245,196,53,0.6)' }}
            dir="rtl"
          >
            מה אתה מוסיף מעצמך?
          </p>
          <input
            value={commitment}
            onChange={e => setCommitment(e.target.value)}
            placeholder="פעולה נוספת שאתה מתחייב עליה..."
            dir="rtl"
            className="w-full rounded-2xl px-4 py-4 text-base font-semibold text-white outline-none transition-all duration-200 placeholder:text-muted placeholder:font-normal"
            style={{
              background: commitment.trim()
                ? 'rgba(245,196,53,0.06)'
                : 'rgba(255,255,255,0.025)',
              border: commitment.trim()
                ? '1px solid rgba(245,196,53,0.35)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: commitment.trim() ? '0 0 20px rgba(245,196,53,0.08)' : 'none',
            }}
          />
        </div>

        {/* Pull quote */}
        <div className="animate-fade-in delay-6">
          <p
            className="text-[11px] text-center leading-relaxed px-4"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            dir="rtl"
          >
            "המשמעת היא הגשר בין מטרות להישגים."
          </p>
        </div>

      </div>

      {/* ── Sticky CTA ────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-16 left-0 right-0 px-5 pb-4 pt-6"
        style={{ background: 'linear-gradient(to top, #02020a 60%, transparent)' }}
      >
        <button
          onClick={handleStart}
          className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 animate-glow-red`}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%)',
            color: '#fff',
            letterSpacing: '0.04em',
          }}
          dir="rtl"
        >
          יאללה! מתחיל היום 🔥
        </button>
      </div>

    </div>
  )
}
