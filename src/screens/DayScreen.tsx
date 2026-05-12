import { useState, useEffect } from 'react'
import { Sunset, Zap, ChevronLeft } from 'lucide-react'
import { QUOTES } from '../constants'
import type { EveningEntry } from '../types'
import { requestAndScheduleReminder, getReminderTime } from '../utils/reminder'

interface Props {
  commitment:  string
  identity?:   string
  purpose?:    string
  onFinishDay: () => void
  evening?:    EveningEntry
  streak:      number
  dayCount:    number
}

function getSunsetMinutes(): number {
  const m = new Date().getMonth()
  const S = [17*60,17*60+30,18*60,19*60,19*60+30,20*60+15,20*60+30,20*60,19*60+30,18*60+30,17*60+30,17*60]
  return S[m]
}
function timeLeft(): string {
  const now = new Date(), nowMins = now.getHours()*60+now.getMinutes()
  const diff = getSunsetMinutes() - nowMins
  if (diff <= 0) return 'השמש שקעה'
  const h = Math.floor(diff/60), m = diff%60
  return h > 0 ? `${h}ש׳ ${m}ד׳` : `${m} דקות`
}
function scoreColor(s: number) {
  if (s >= 9) return '#f5c435'; if (s >= 7) return '#e8a020'
  if (s >= 5) return '#f97316'; return '#ef4444'
}

const STATE_TIPS = [
  'עמוד. כתפיים אחורה. ראש למעלה. 3 נשימות כוח. 10 שניות.',
  'קום ותזוז — 60 שניות של תנועה משנה הכל. הגוף קובע את הנפש.',
  'חייך — גם מלאכותי. המוח לא מבדיל. דופמין משתחרר בכל מקרה.',
  'צעק בשקט: "YES!" ולחץ יד לשמים. עשה את זה עכשיו.',
  'שב ישר. נשום עמוק. הגוף שלך הוא ה-remote control של הנפש.',
]

export function DayScreen({ commitment, identity, purpose, onFinishDay, evening, streak, dayCount }: Props) {
  const [quoteIdx,     setQuoteIdx]     = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [remaining,    setRemaining]    = useState(timeLeft)
  const [stateTip,     setStateTip]     = useState<string | null>(null)
  const [reminderStatus, setReminderStatus] = useState<'idle'|'scheduled'|'denied'|'unsupported'>('idle')

  useEffect(() => {
    const qid = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => { setQuoteIdx(i => (i+1) % QUOTES.length); setQuoteVisible(true) }, 400)
    }, 4*60*1000)
    const tid = setInterval(() => setRemaining(timeLeft()), 60_000)
    return () => { clearInterval(qid); clearInterval(tid) }
  }, [])

  const raiseState = () => {
    setStateTip(STATE_TIPS[Math.floor(Math.random()*STATE_TIPS.length)])
    setTimeout(() => setStateTip(null), 8000)
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>

      {/* TOP BAR */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="label-xs mb-1">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }} dir="rtl">יום {dayCount}</p>
          </div>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(245,196,53,0.08)', border: '1px solid rgba(245,196,53,0.2)' }}>
              <span style={{ fontSize: '1rem' }}>🔥</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#f5c435' }}>{streak}</span>
              <span className="label-xs" style={{ color: 'rgba(245,196,53,0.6)' }}>STREAK</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 32px' }}>

        {/* Identity */}
        {identity && (
          <div className="mx-5 mt-5" style={{ borderLeft: '3px solid rgba(245,196,53,0.6)', paddingLeft: 14 }}>
            <p className="label-xs mb-1" style={{ color: 'rgba(245,196,53,0.5)' }}>תוכנית השבוע</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#f5c435' }} dir="rtl">{identity}</p>
          </div>
        )}

        {/* Commitment */}
        <div className="mx-5 mt-5" style={{ background: '#111', borderLeft: '4px solid #ef4444', padding: '18px 16px' }}>
          <p className="label-xs mb-2" style={{ color: '#ef4444' }}>הפעולה המסיבית שלך היום</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.35 }} dir="rtl">{commitment}</p>
          {purpose && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10, lineHeight: 1.5 }} dir="rtl">
              💎 {purpose}
            </p>
          )}
          {evening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: evening.commitmentDone ? '#22c55e' : '#ef4444' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: evening.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">
                {evening.commitmentDone ? 'עשית את זה!' : 'לא הושלם — מחר מחדש'}
              </span>
            </div>
          )}
        </div>

        {/* Evening summary */}
        {evening && (
          <div className="mx-5 mt-4" style={{ background: '#111', padding: '16px', borderLeft: `3px solid ${scoreColor(evening.score)}` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="label-xs">מה נתת היום</p>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: scoreColor(evening.score) }}>{evening.score}/10</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.5 }} dir="rtl">{evening.given ?? evening.win}</p>
            {evening.lesson && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 8, lineHeight: 1.5 }} dir="rtl">📖 {evening.lesson}</p>
            )}
          </div>
        )}

        {/* Reminder */}
        {evening && reminderStatus === 'idle' && (
          <div className="mx-5 mt-4">
            <button onClick={async () => setReminderStatus(await requestAndScheduleReminder())}
              className="w-full btn-ghost flex items-center justify-center gap-2"
              style={{ padding: '13px', fontSize: 13, borderRadius: 0 }} dir="rtl">
              🔔 תזכיר לי מחר בבוקר
            </button>
          </div>
        )}
        {evening && reminderStatus === 'scheduled' && (
          <div className="mx-5 mt-3">
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }} dir="rtl">
              ✓ תזכורת נקבעה ל-{getReminderTime()} — השאר את הטאב פתוח
            </p>
          </div>
        )}

        {/* Raise State */}
        {!evening && (
          <div className="mx-5 mt-4">
            <button onClick={raiseState}
              className="w-full btn-ghost flex items-center justify-center gap-2"
              style={{ padding: '14px', fontSize: 13, borderRadius: 0 }} dir="rtl">
              <Zap className="w-4 h-4" style={{ color: '#f5c435' }} />
              RAISE YOUR STATE — קום לשנייה
            </button>
          </div>
        )}

        {stateTip && (
          <div className="mx-5 mt-3 animate-slide-up" style={{ background: '#111', borderLeft: '3px solid #f5c435', padding: '14px 16px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.5 }} dir="rtl">⚡ {stateTip}</p>
          </div>
        )}

        {/* Quote */}
        <div className="mx-5 mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
          <p className="label-xs mb-3">DAILY WISDOM</p>
          <p style={{
            fontSize: 15, fontWeight: 600, color: 'rgba(245,196,53,0.8)', lineHeight: 1.7,
            opacity: quoteVisible ? 1 : 0, transition: 'opacity 0.4s',
          }} dir="rtl">"{QUOTES[quoteIdx]}"</p>
        </div>

        {/* Sunset */}
        {!evening && (
          <div className="mx-5 mt-5" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Sunset className="w-4 h-4 text-muted" strokeWidth={1.5} />
            <div dir="rtl">
              <p className="label-xs mb-0.5">עד שקיעה</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{remaining}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      {!evening && (
        <div className="shrink-0" style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: '2px solid rgba(255,255,255,0.12)', background: '#0a0a0a' }}>
          <button onClick={onFinishDay}
            className="btn-red w-full flex items-center justify-center gap-3"
            style={{ padding: '18px', fontSize: 15, borderRadius: 0 }} dir="rtl">
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            סגור את היום — סיכום 3 דקות
          </button>
        </div>
      )}
    </div>
  )
}
