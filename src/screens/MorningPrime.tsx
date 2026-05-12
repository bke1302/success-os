import { useState } from 'react'
import { HABITS, getTodayPowerWord, getCommanderRank } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds, getProgramWeekNumber } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete, playCheck } from '../utils/sounds'
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
  const weekNum        = getProgramWeekNumber(dayCount)
  const dayInWeek      = ((dayCount - 1) % 7) + 1
  const requiredIds    = getTodayRequiredHabitIds(dayCount)
  const requiredHabits = requiredIds
    .map(id => HABITS.find(h => h.id === id))
    .filter((h): h is typeof HABITS[number] => h !== undefined)

  const coach       = getCoachMessage({ streak, dayCount, yesterdayHabitsPct, currentHour: new Date().getHours() })
  const powerWord   = getTodayPowerWord()
  const rank        = getCommanderRank(streak)

  const toneColor = coach.tone === 'fire' ? '#ef4444' : coach.tone === 'green' ? '#22c55e' : '#f5c435'
  const glowAnim  = coach.tone === 'fire' ? 'animate-glow-red' : coach.tone === 'green' ? 'animate-glow-green' : 'animate-glow-gold'

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
          radial-gradient(ellipse at 50% -20%, ${toneColor}11 0%, transparent 60%),
          radial-gradient(ellipse at 100% 100%, ${theme.color}07 0%, transparent 50%)
        `,
      }}
    >

      {/* ── TOP STATUS BAR ────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 pt-8 pb-4 animate-fade-in delay-0"
        style={{ borderBottom: `1px solid ${toneColor}18` }}
      >
        <div className="flex items-center justify-between">

          {/* Left: day + week progress */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] tracking-[4px] uppercase font-black"
                style={{ color: toneColor }}
              >
                יום {dayCount}
              </span>
              <span className="text-muted text-[9px]">·</span>
              <span className="text-[9px] tracking-[2px] uppercase text-muted">
                שבוע {weekNum}/4
              </span>
            </div>
            {/* Week day dots */}
            <div className="flex gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i < dayInWeek ? 14 : 6,
                    height: 6,
                    background: i < dayInWeek ? theme.color : 'rgba(255,255,255,0.1)',
                    boxShadow: i < dayInWeek ? `0 0 6px ${theme.color}60` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: rank badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: `${rank.color}10`,
              border: `1px solid ${rank.color}30`,
            }}
          >
            <span className="text-base leading-none">{rank.emoji}</span>
            <div>
              <p className="text-[7px] tracking-[2px] uppercase text-muted leading-none mb-0.5">דרגה</p>
              <p className="text-xs font-black leading-none" style={{ color: rank.color }}>{rank.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '130px' }}>

        {/* ── POWER WORD ────────────────────────────────────────────────── */}
        <div
          className="px-5 py-6 animate-slide-up delay-1"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-[8px] tracking-[5px] uppercase text-muted mb-2">מילת הכוח של היום</p>
          <h1
            className="font-black leading-none"
            dir="rtl"
            style={{
              fontSize: 'clamp(3.5rem, 15vw, 5.5rem)',
              background: `linear-gradient(135deg, ${toneColor}, ${toneColor}70)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            {powerWord}
          </h1>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* ── Yesterday's win ─────────────────────────────────────────── */}
          {lastWin && (
            <div
              className="rounded-2xl p-4 flex items-start gap-3 animate-slide-up delay-2"
              style={{
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.18)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <span className="text-xl shrink-0">🏆</span>
              <div dir="rtl">
                <p className="text-[8px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#22c55e' }}>
                  הניצחון של אתמול
                </p>
                <p className="text-sm font-semibold text-white leading-relaxed">{lastWin}</p>
              </div>
            </div>
          )}

          {/* ── COACH CARD ──────────────────────────────────────────────── */}
          <div
            className={`rounded-3xl overflow-hidden animate-slide-up delay-2 ${glowAnim}`}
            style={{
              background: `linear-gradient(160deg, ${toneColor}12 0%, rgba(6,6,18,0.97) 55%)`,
              border: `1px solid ${toneColor}28`,
            }}
          >
            {/* Accent top bar */}
            <div style={{ height: 2, background: `linear-gradient(to right, ${toneColor}, ${toneColor}00)` }} />

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p
                    className="text-[8px] tracking-[5px] uppercase font-black mb-1.5"
                    style={{ color: toneColor }}
                  >
                    briefing יומי
                  </p>
                  <p className="text-xl font-black text-white leading-snug" dir="rtl">
                    {coach.title}
                  </p>
                </div>
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-float"
                  style={{ background: `${toneColor}15`, border: `1px solid ${toneColor}30` }}
                >
                  {coach.tone === 'fire' ? '🔥' : coach.tone === 'green' ? '⚡' : '🎯'}
                </div>
              </div>
              <p className="text-sm leading-[1.8]" style={{ color: 'rgba(255,255,255,0.6)' }} dir="rtl">
                {coach.body}
              </p>
            </div>
          </div>

          {/* ── MISSION TARGETS ─────────────────────────────────────────── */}
          <div className="animate-slide-up delay-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-[8px] tracking-[4px] uppercase font-black"
                  style={{ color: theme.color }}
                >
                  מטרות המשימה
                </span>
              </div>
              <span
                className="text-[8px] font-black px-2 py-1 rounded-lg tracking-widest"
                style={{ background: `${theme.color}18`, color: theme.color, border: `1px solid ${theme.color}35` }}
              >
                {theme.title.split(' ')[0]} {theme.title.split(' ')[1]}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {requiredHabits.map((habit, i) => (
                <div
                  key={habit.id}
                  className="rounded-2xl overflow-hidden animate-slide-up"
                  style={{
                    animationDelay: `${0.2 + i * 0.06}s`,
                    animationFillMode: 'both',
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid rgba(255,255,255,0.07)`,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ height: 1, background: `linear-gradient(to right, ${theme.color}80, transparent)` }} />
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <span
                      className="shrink-0 text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${theme.color}20`, color: theme.color, border: `1px solid ${theme.color}40` }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-2xl shrink-0">{habit.emoji}</span>
                    <div dir="rtl" className="flex-1">
                      <p className="text-sm font-bold text-white">{habit.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {habit.subtitle}
                      </p>
                    </div>
                    <div
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ border: `1.5px solid ${theme.color}40` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Extra commitment ─────────────────────────────────────────── */}
          <div className="animate-slide-up delay-5">
            <p
              className="text-[8px] tracking-[4px] uppercase font-black mb-2.5"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              dir="rtl"
            >
              + מה אתה מוסיף מעצמך?
            </p>
            <input
              value={commitment}
              onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
              placeholder="פעולה אחת נוספת..."
              dir="rtl"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white outline-none transition-all duration-200 placeholder:text-muted placeholder:font-normal"
              style={{
                background: commitment.trim() ? 'rgba(245,196,53,0.05)' : 'rgba(255,255,255,0.02)',
                border: commitment.trim() ? '1px solid rgba(245,196,53,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            />
          </div>

        </div>
      </div>

      {/* ── STICKY CTA ────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-16 left-0 right-0 px-5 pb-4 pt-5"
        style={{ background: 'linear-gradient(to top, #02020a 55%, transparent)' }}
      >
        <button
          onClick={handleStart}
          className="w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all active:scale-[0.98] animate-glow-red"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            letterSpacing: '0.08em',
          }}
        >
          יאללה — מתחיל עכשיו 🔥
        </button>
      </div>

    </div>
  )
}
