import { useState } from 'react'
import { HABITS, getTodayPowerWord, getCommanderRank } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds, getProgramWeekNumber } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete, playCheck } from '../utils/sounds'
import type { MorningEntry } from '../types'

interface Props {
  onComplete:         (data: MorningEntry) => void
  dayCount:           number
  streak:             number
  lastWin?:           string
  yesterdayHabitsPct: number
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

  const coach     = getCoachMessage({ streak, dayCount, yesterdayHabitsPct, currentHour: new Date().getHours() })
  const powerWord = getTodayPowerWord()
  const rank      = getCommanderRank(streak)

  const toneColor = coach.tone === 'fire' ? '#ef4444' : coach.tone === 'green' ? '#22c55e' : '#f5c435'
  const toneGlow  = coach.tone === 'fire' ? 'rgba(239,68,68,0.35)' : coach.tone === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(245,196,53,0.35)'

  const handleStart = () => {
    playComplete()
    onComplete({
      gratitudes: ['', '', ''], vision: ['', '', ''],
      identity: theme.title, purpose: theme.desc,
      commitment: commitment.trim() || 'ביצוע תוכנית היום',
      incantation: '', energyLevel: 7,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#080810',
        position: 'relative',
      }}
    >
      {/* ── Ambient orbs ──────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${toneGlow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '-12%',
          width: 260, height: 260, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)`,
          filter: 'blur(50px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 animate-fade-in"
        style={{ position: 'relative', zIndex: 1, padding: '28px 20px 16px' }}
      >
        <div className="flex items-center justify-between">

          {/* Left: day + week progress */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span
                className="font-black leading-none"
                style={{ fontSize: '2rem', color: toneColor, lineHeight: 1 }}
              >
                {dayCount}
              </span>
              <span className="text-[8px] tracking-[4px] uppercase text-muted font-bold">יום</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-[7px] tracking-[2px] uppercase text-muted mr-1">ש׳ {weekNum}/4</span>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i}
                  style={{
                    height: 4, borderRadius: 2,
                    width: i < dayInWeek ? 14 : 5,
                    background: i < dayInWeek ? theme.color : 'rgba(255,255,255,0.1)',
                    transition: 'width 0.4s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Center: Power word */}
          <div style={{ textAlign: 'center' }}>
            <p className="text-[7px] tracking-[4px] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              מילת הכוח
            </p>
            <h1
              dir="rtl"
              className="font-black"
              style={{
                fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
                lineHeight: 1,
                background: `linear-gradient(135deg, ${toneColor} 0%, ${toneColor}66 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                filter: `drop-shadow(0 0 20px ${toneGlow})`,
              }}
            >
              {powerWord}
            </h1>
          </div>

          {/* Right: Rank */}
          <div
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2"
            style={{ background: `${rank.color}14`, border: `1px solid ${rank.color}28` }}
          >
            <span style={{ fontSize: '1.1rem' }}>{rank.emoji}</span>
            <span className="text-xs font-black" style={{ color: rank.color }}>{rank.rank}</span>
          </div>
        </div>

        {/* Thin separator */}
        <div style={{ height: 1, marginTop: 14, background: `linear-gradient(to right, ${toneColor}50, transparent 60%)` }} />
      </div>

      {/* ── SCROLL AREA ─────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ position: 'relative', zIndex: 1, padding: '12px 20px 140px' }}
      >

        {/* Yesterday win */}
        {lastWin && (
          <div
            className="animate-slide-up delay-1 rounded-2xl p-4 flex gap-3 mb-4"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}
          >
            <span className="text-xl shrink-0">🏆</span>
            <div dir="rtl">
              <p className="text-[7px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#22c55e' }}>
                אתמול ניצחת
              </p>
              <p className="text-sm text-white leading-relaxed">{lastWin}</p>
            </div>
          </div>
        )}

        {/* ── COACH CARD ──────────────────────────────────────────────────── */}
        <div
          className="animate-slide-up delay-2 rounded-3xl overflow-hidden mb-4"
          style={{
            background: `linear-gradient(145deg, ${toneColor}0f, rgba(13,13,26,0.98))`,
            border: `1px solid ${toneColor}28`,
            boxShadow: `0 4px 40px ${toneGlow}40, inset 0 1px 0 ${toneColor}15`,
          }}
        >
          {/* Top accent stripe */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${toneColor}, ${toneColor}00)` }} />

          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl animate-float shrink-0">
                {coach.tone === 'fire' ? '🔥' : coach.tone === 'green' ? '⚡' : '💎'}
              </span>
              <div dir="rtl" className="flex-1">
                <p
                  className="text-[7px] tracking-[5px] uppercase font-black mb-2"
                  style={{ color: toneColor }}
                >
                  הודעה מהמאמן
                </p>
                <p className="text-lg font-black text-white leading-snug mb-1.5">{coach.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{coach.body}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MISSIONS ─────────────────────────────────────────────────── */}
        <div className="animate-slide-up delay-3 mb-4">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div style={{ width: 3, height: 16, borderRadius: 2, background: theme.color, flexShrink: 0 }} />
            <p className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: theme.color }}>
              {theme.title} — משימות חובה
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {requiredHabits.map((habit, i) => (
              <div
                key={habit.id}
                className="animate-slide-up"
                style={{
                  animationDelay: `${280 + i * 70}ms`,
                  animationFillMode: 'both',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  borderRadius: 16,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${theme.color}20`,
                  borderLeft: `3px solid ${theme.color}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background shimmer */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 100% 50%, ${theme.color}08, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                <span
                  className="text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${theme.color}22`, color: theme.color, aspectRatio: '1' }}
                >
                  {i + 1}
                </span>
                <span className="text-xl shrink-0">{habit.emoji}</span>
                <div dir="rtl" className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{habit.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{habit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── EXTRA COMMITMENT ─────────────────────────────────────────── */}
        <div className="animate-slide-up delay-5">
          <p className="text-[8px] tracking-[4px] uppercase font-bold mb-2 px-1" style={{ color: 'rgba(255,255,255,0.3)' }} dir="rtl">
            מה אתה מוסיף מעצמך?
          </p>
          <div style={{ position: 'relative' }}>
            <input
              value={commitment}
              onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
              placeholder="פעולה נוספת שאתה לוקח על עצמך..."
              dir="rtl"
              className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white outline-none transition-all"
              style={{
                background: commitment.trim() ? 'rgba(245,196,53,0.06)' : 'rgba(255,255,255,0.03)',
                border: commitment.trim() ? '1px solid rgba(245,196,53,0.35)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: commitment.trim() ? '0 0 16px rgba(245,196,53,0.08)' : 'none',
              }}
            />
          </div>
        </div>

      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div
        className="shrink-0"
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '12px 20px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(8,8,16,1) 0%, rgba(8,8,16,0.97) 80%, transparent 100%)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <button
          onClick={handleStart}
          dir="rtl"
          className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${toneColor}, ${toneColor}cc)`,
            color: coach.tone === 'gold' ? '#000' : '#fff',
            letterSpacing: '0.05em',
            boxShadow: `0 0 32px ${toneGlow}, 0 4px 16px rgba(0,0,0,0.4)`,
          }}
        >
          יוצא לדרך — יאללה 🚀
        </button>
      </div>

    </div>
  )
}
