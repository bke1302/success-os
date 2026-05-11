import { useState, useEffect } from 'react'
import { Sunset, ChevronLeft, Zap } from 'lucide-react'
import { QUOTES } from '../constants'
import type { EveningEntry } from '../types'

interface Props {
  commitment: string
  identity?:  string
  purpose?:   string
  onFinishDay: () => void
  evening?:   EveningEntry
  streak:     number
  dayCount:   number
}

function getSunsetMinutes(): number {
  const m = new Date().getMonth()
  const SUNSET = [17*60, 17*60+30, 18*60, 19*60, 19*60+30, 20*60+15,
                  20*60+30, 20*60, 19*60+30, 18*60+30, 17*60+30, 17*60]
  return SUNSET[m]
}

function timeLeft(): string {
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const diff    = getSunsetMinutes() - nowMins
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

const STATE_TIPS = [
  'עמוד. כתפיים אחורה. ראש למעלה. 3 נשימות כוח. 10 שניות.',
  'קום ותזוז — 60 שניות של תנועה משנה הכל. הגוף קובע את הנפש.',
  'חייך — גם מלאכותי. המוח לא מבדיל. דופמין משתחרר בכל מקרה.',
  'צעק בשקט: "YES!" — ולחץ יד לשמים. עשה את זה עכשיו.',
  'שב ישר. נשום עמוק. הגוף שלך הוא ה-remote control של הנפש.',
]

export function DayScreen({ commitment, identity, purpose, onFinishDay, evening, streak, dayCount }: Props) {
  const [quoteIdx,     setQuoteIdx]     = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [remaining,    setRemaining]    = useState(timeLeft)
  const [stateTip,     setStateTip]     = useState<string | null>(null)

  useEffect(() => {
    const qid = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVisible(true) }, 500)
    }, 4 * 60 * 1000)
    const tid = setInterval(() => setRemaining(timeLeft()), 60_000)
    return () => { clearInterval(qid); clearInterval(tid) }
  }, [])

  const raiseState = () => {
    setStateTip(STATE_TIPS[Math.floor(Math.random() * STATE_TIPS.length)])
    setTimeout(() => setStateTip(null), 8000)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

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

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* Identity banner */}
        {identity && (
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{ background: 'rgba(245,196,53,0.05)', border: '1px solid rgba(245,196,53,0.18)' }}
          >
            <span className="text-2xl">👑</span>
            <div dir="rtl">
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-0.5">הזהות שלך היום</p>
              <p className="text-lg font-black" style={{ color: '#f5c435' }}>אני {identity}</p>
            </div>
          </div>
        )}

        {/* Commitment card */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.12) 0%, rgba(2,2,10,0.8) 70%)',
            border: '1px solid rgba(239,68,68,0.25)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right,transparent,rgba(239,68,68,0.8),transparent)' }} />
          <p className="text-[9px] tracking-[5px] uppercase font-bold mb-2" style={{ color: '#ef4444' }}>
            הפעולה המסיבית שלך היום
          </p>
          <p className="text-xl font-bold text-white leading-relaxed" dir="rtl"
            style={{ textShadow: '0 0 40px rgba(239,68,68,0.2)' }}>
            {commitment}
          </p>

          {/* Purpose */}
          {purpose && (
            <p className="text-sm text-sub mt-3 leading-relaxed" dir="rtl">
              💎 {purpose}
            </p>
          )}

          {evening && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                style={{ background: evening.commitmentDone ? '#22c55e' : '#ef4444' }} />
              <span className="text-xs font-semibold"
                style={{ color: evening.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">
                {evening.commitmentDone ? 'עשית את זה!' : 'לא הושלם — מחר מחדש'}
              </span>
            </div>
          )}
        </div>

        {/* Evening summary */}
        {evening && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted">מה נתת היום</p>
              <div className="font-display text-2xl" style={{ color: scoreColor(evening.score) }}>
                {evening.score}/10
              </div>
            </div>
            <p className="text-base font-medium text-white leading-relaxed" dir="rtl">{evening.given ?? evening.win}</p>
            {evening.lesson && (
              <p className="text-sm text-sub mt-2 leading-relaxed" dir="rtl">📖 {evening.lesson}</p>
            )}
          </div>
        )}

        {/* RAISE YOUR STATE button */}
        {!evening && (
          <button
            onClick={raiseState}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
            style={{ background: 'rgba(245,196,53,0.07)', border: '1px solid rgba(245,196,53,0.2)', color: '#f5c435' }}
            dir="rtl"
          >
            <Zap className="w-4 h-4" strokeWidth={2} />
            RAISE YOUR STATE — קום לשנייה
          </button>
        )}

        {/* State tip */}
        {stateTip && (
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: 'rgba(245,196,53,0.08)',
              border: '1px solid rgba(245,196,53,0.3)',
              animation: 'primeIn 0.3s ease forwards',
            }}
          >
            <p className="text-sm font-semibold text-white text-center leading-relaxed" dir="rtl">
              ⚡ {stateTip}
            </p>
          </div>
        )}

        {/* Quote */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center text-center gap-3"
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
            סגור את היום — סיכום 3 דקות
          </button>
        </div>
      )}
    </div>
  )
}
