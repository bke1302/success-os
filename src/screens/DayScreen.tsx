import { useState, useEffect } from 'react'
import { Sunset, ChevronLeft } from 'lucide-react'
import { QUOTES } from '../constants'
import type { EveningEntry } from '../types'

interface Props {
  commitment: string
  onFinishDay: () => void
  evening?: EveningEntry
  streak: number
  dayCount: number
}

function getSunsetMinutes(): number {
  const m = new Date().getMonth()
  // Approximate Israel sunset (minutes since midnight)
  const SUNSET = [17*60, 17*60+30, 18*60, 19*60, 19*60+30, 20*60+15,
                  20*60+30, 20*60, 19*60+30, 18*60+30, 17*60+30, 17*60]
  return SUNSET[m]
}

function timeLeft(): string {
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const sunset  = getSunsetMinutes()
  const diff    = sunset - nowMins
  if (diff <= 0) return 'השמש שקעה'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h} שעות ${m} דקות` : `${m} דקות`
}

function scoreColor(s: number) {
  if (s >= 9) return '#f5c435'
  if (s >= 7) return '#e8a020'
  if (s >= 5) return '#f97316'
  return '#ef4444'
}

export function DayScreen({ commitment, onFinishDay, evening, streak, dayCount }: Props) {
  const [quoteIdx,     setQuoteIdx]     = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [remaining,    setRemaining]    = useState(timeLeft)

  useEffect(() => {
    const qid = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVisible(true) }, 500)
    }, 4 * 60 * 1000)
    const tid = setInterval(() => setRemaining(timeLeft()), 60_000)
    return () => { clearInterval(qid); clearInterval(tid) }
  }, [])

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: '#02020a' }}
    >
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div>
          <p className="text-[8px] tracking-[4px] uppercase font-bold text-muted">יום {dayCount}</p>
          <p className="text-sm font-semibold text-white mt-0.5" dir="rtl">
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(245,196,53,0.08)', border: '1px solid rgba(245,196,53,0.2)' }}
          >
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold" style={{ color: '#f5c435' }}>{streak}</span>
            <span className="text-[8px] tracking-[2px] uppercase text-muted">STREAK</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

        {/* Commitment card */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.12) 0%, rgba(2,2,10,0.8) 70%)',
            border: '1px solid rgba(239,68,68,0.25)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.8), transparent)' }}
          />
          <p className="text-[9px] tracking-[5px] uppercase font-bold mb-3" style={{ color: '#ef4444' }}>
            ההתחייבות שלך להיום
          </p>
          <p
            className="text-xl md:text-2xl font-bold text-white leading-relaxed"
            dir="rtl"
            style={{ textShadow: '0 0 40px rgba(239,68,68,0.2)' }}
          >
            {commitment}
          </p>
          {evening && (
            <div className="mt-4 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: evening.commitmentDone ? '#22c55e' : '#ef4444' }}
              />
              <span className="text-xs font-semibold" style={{ color: evening.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">
                {evening.commitmentDone ? 'עשית את זה!' : 'לא הושלם — מחר מחדש'}
              </span>
            </div>
          )}
        </div>

        {/* Evening summary (if done) */}
        {evening && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted">הניצחון שלך היום</p>
              <div
                className="font-display text-2xl"
                style={{ color: scoreColor(evening.score) }}
              >
                {evening.score}/10
              </div>
            </div>
            <p className="text-base font-medium text-white leading-relaxed" dir="rtl">{evening.win}</p>
            {evening.lesson && (
              <p className="text-sm text-sub mt-2 leading-relaxed" dir="rtl">📖 {evening.lesson}</p>
            )}
          </div>
        )}

        {/* Quote */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden flex flex-col items-center text-center gap-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[8px] tracking-[4px] uppercase text-muted">DAILY WISDOM</p>
          <p
            className="text-base font-semibold leading-relaxed transition-opacity duration-500"
            style={{ color: 'rgba(245,196,53,0.85)', opacity: quoteVisible ? 1 : 0 }}
            dir="rtl"
          >
            "{QUOTES[quoteIdx]}"
          </p>
        </div>

        {/* Sunset timer */}
        {!evening && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Sunset className="w-5 h-5 shrink-0 text-muted" strokeWidth={1.5} />
            <div dir="rtl">
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-0.5">עד שקיעה</p>
              <p className="text-base font-bold text-white">{remaining}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {!evening && (
        <div
          className="shrink-0 px-6 py-5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(2,2,10,0.9)',
            backdropFilter: 'blur(20px)',
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          }}
        >
          <button
            onClick={onFinishDay}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(239,68,68,0.3)',
            }}
            dir="rtl"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            סיים את היום — מה הניצחון שלך?
          </button>
        </div>
      )}
    </div>
  )
}
