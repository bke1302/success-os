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
  const glowClass = coach.tone === 'fire' ? 'animate-glow-red' : coach.tone === 'green' ? 'animate-glow-green' : 'animate-glow-gold'

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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#080810' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 pt-8 pb-4 animate-fade-in">

        <div className="flex items-center gap-3">
          {/* Day counter */}
          <div className="flex flex-col">
            <span className="text-[8px] tracking-[4px] uppercase text-muted">יום</span>
            <span className="text-2xl font-black leading-none" style={{ color: toneColor }}>{dayCount}</span>
          </div>

          {/* Week dots */}
          <div className="flex flex-col gap-1">
            <span className="text-[7px] tracking-[3px] uppercase text-muted">שבוע {weekNum}/4</span>
            <div className="flex gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i < dayInWeek ? 12 : 5,
                    background: i < dayInWeek ? theme.color : 'rgba(255,255,255,0.12)',
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: `${rank.color}12`, border: `1px solid ${rank.color}25` }}>
          <span>{rank.emoji}</span>
          <span className="text-sm font-black" style={{ color: rank.color }}>{rank.rank}</span>
        </div>
      </div>

      {/* ── HERO POWER WORD ─────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-2 animate-slide-up delay-1">
        <p className="text-[8px] tracking-[6px] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          מילת הכוח של היום
        </p>
        <div className="relative">
          <h1
            className="font-black leading-[0.85] select-none"
            dir="rtl"
            style={{
              fontSize: 'clamp(4rem, 18vw, 7rem)',
              background: `linear-gradient(135deg, ${toneColor} 0%, ${toneColor}55 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
            }}
          >
            {powerWord}
          </h1>
          {/* Glow under word */}
          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 30% 100%, ${toneColor}20, transparent 70%)`,
            }} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4" style={{ height: 1, background: `linear-gradient(to right, ${toneColor}60, transparent)` }} />

      {/* ── SCROLL CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-5" style={{ paddingBottom: '130px' }}>

        {/* Yesterday win */}
        {lastWin && (
          <div className="animate-slide-up delay-1 rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="text-xl">🏆</span>
            <div dir="rtl">
              <p className="text-[8px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#22c55e' }}>
                אתמול ניצחת
              </p>
              <p className="text-sm text-white leading-relaxed">{lastWin}</p>
            </div>
          </div>
        )}

        {/* ── COACH ───────────────────────────────────────────────────── */}
        <div className={`animate-slide-up delay-2 rounded-3xl overflow-hidden ${glowClass}`}
          style={{ background: `linear-gradient(145deg, ${toneColor}14, #0d0d1a)`, border: `1px solid ${toneColor}30` }}>

          <div style={{ height: 3, background: `linear-gradient(90deg, ${toneColor}, ${toneColor}00)` }} />

          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl animate-float">
                {coach.tone === 'fire' ? '🔥' : coach.tone === 'green' ? '⚡' : '💎'}
              </span>
              <p className="text-[8px] tracking-[5px] uppercase font-black" style={{ color: toneColor }}>
                הודעה מהמאמן
              </p>
            </div>
            <p className="text-xl font-black text-white leading-snug mb-2" dir="rtl">{coach.title}</p>
            <p className="text-sm leading-relaxed text-sub" dir="rtl">{coach.body}</p>
          </div>
        </div>

        {/* ── MISSIONS ─────────────────────────────────────────────────── */}
        <div className="animate-slide-up delay-3">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 3, height: 18, borderRadius: 2, background: theme.color }} />
            <p className="text-[9px] tracking-[4px] uppercase font-black" style={{ color: theme.color }}>
              {theme.title} — 3 משימות חובה
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {requiredHabits.map((habit, i) => (
              <div key={habit.id}
                className="flex items-center gap-4 rounded-2xl px-4 py-4 animate-slide-up"
                style={{
                  animationDelay: `${260 + i * 70}ms`,
                  animationFillMode: 'both',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${theme.color}25`,
                  borderLeft: `3px solid ${theme.color}`,
                }}>
                <span className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${theme.color}25`, color: theme.color }}>
                  {i + 1}
                </span>
                <span className="text-xl shrink-0">{habit.emoji}</span>
                <div dir="rtl" className="flex-1">
                  <p className="text-sm font-bold text-white">{habit.title}</p>
                  <p className="text-[10px] text-muted mt-0.5">{habit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra commitment */}
        <div className="animate-slide-up delay-5">
          <p className="text-[8px] tracking-[4px] uppercase text-muted mb-2" dir="rtl">
            מה אתה מוסיף מעצמך?
          </p>
          <input
            value={commitment}
            onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="פעולה נוספת שאתה לוקח על עצמך..."
            dir="rtl"
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white outline-none transition-all"
            style={{
              background: commitment.trim() ? 'rgba(245,196,53,0.06)' : 'rgba(255,255,255,0.03)',
              border: commitment.trim() ? '1px solid rgba(245,196,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-16 left-0 right-0 px-5 pb-4 pt-6"
        style={{ background: 'linear-gradient(to top, #080810 60%, transparent)' }}>
        <button onClick={handleStart}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.97] ${glowClass}`}
          style={{
            background: `linear-gradient(135deg, ${toneColor}, ${toneColor}cc)`,
            color: coach.tone === 'gold' ? '#000' : '#fff',
            letterSpacing: '0.06em',
          }}
          dir="rtl">
          יוצא לדרך — יאללה 🚀
        </button>
      </div>

    </div>
  )
}
