import { useState, useEffect } from 'react'
import { Sunset, Zap, ChevronLeft } from 'lucide-react'
import { QUOTES } from '../constants'
import type { EveningEntry } from '../types'
import { requestAndScheduleReminder, getReminderTime } from '../utils/reminder'
import { useTheme } from '../contexts/ThemeContext'
import { scoreColor } from '../utils/colorUtils'

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

const STATE_TIPS = [
  'עמוד. כתפיים אחורה. ראש למעלה. 3 נשימות כוח. 10 שניות.',
  'קום ותזוז — 60 שניות של תנועה משנה הכל. הגוף קובע את הנפש.',
  'חייך — גם מלאכותי. המוח לא מבדיל. דופמין משתחרר בכל מקרה.',
  'צעק בשקט: YES ולחץ יד לשמים. עשה את זה עכשיו.',
  'שב ישר. נשום עמוק. הגוף שלך הוא ה-remote control של הנפש.',
]

export function DayScreen({ commitment, identity, purpose, onFinishDay, evening, streak, dayCount }: Props) {
  const T = useTheme()
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
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>
      <div className="shrink-0 animate-fade-in" style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 20, fontWeight: 700, color: T.text }} dir="rtl">יום {dayCount}</p>
          </div>
          {streak > 0 && (
            <div className={streak >= 7 ? 'streak-pulse' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,214,10,.07)', border: '1px solid rgba(255,214,10,.18)', borderRadius: 12 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 18, fontWeight: 900, color: T.isDark ? '#FFD60A' : '#8B6800', lineHeight: 1 }}>{streak}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800' }}>STREAK</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 68px' }}>
        {identity && (
          <div className="card mb-4" style={{ borderRight: '3px solid rgba(255,214,10,.5)' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? 'rgba(255,214,10,.7)' : '#8B6800', textTransform: 'uppercase', marginBottom: 6 }}>תוכנית השבוע</p>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 16, fontWeight: 700, color: T.isDark ? '#FFD60A' : '#8B6800' }} dir="rtl">{identity}</p>
          </div>
        )}

        <div className="card mb-4" style={{ borderRight: '4px solid #FF375F' }}>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FF375F', textTransform: 'uppercase', marginBottom: 10 }}>הפעולה המסיבית שלך היום</p>
          <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 19, fontWeight: 700, color: T.text, lineHeight: 1.35 }} dir="rtl">{commitment}</p>
          {purpose && (
            <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13, color: T.textMuted, marginTop: 10, lineHeight: 1.5 }} dir="rtl">{purpose}</p>
          )}
          {evening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: evening.commitmentDone ? '#30D158' : '#FF375F' }} />
              <span style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, fontWeight: 600, color: evening.commitmentDone ? '#30D158' : '#FF375F' }} dir="rtl">
                {evening.commitmentDone ? 'עשית את זה.' : 'לא הושלם — מחר מחדש.'}
              </span>
            </div>
          )}
        </div>

        {evening && (
          <div className="card mb-4" style={{ borderRight: `3px solid ${scoreColor(evening.score)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>מה נתת היום</p>
              <span style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: '2.4rem', color: scoreColor(evening.score), lineHeight: 1 }}>{evening.score}/10</span>
            </div>
            <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 14, fontWeight: 500, color: T.text, lineHeight: 1.6 }} dir="rtl">{evening.given ?? evening.win}</p>
            {evening.lesson && (
              <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: T.textMuted, marginTop: 8, lineHeight: 1.5 }} dir="rtl">{evening.lesson}</p>
            )}
          </div>
        )}

        {evening && reminderStatus === 'idle' && (
          <button onClick={async () => setReminderStatus(await requestAndScheduleReminder())}
            className="btn-ghost w-full mb-4"
            style={{ padding: '13px', fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13 }} dir="rtl">
            תזכיר לי מחר בבוקר
          </button>
        )}
        {evening && reminderStatus === 'scheduled' && (
          <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: T.textMuted, textAlign: 'center', marginBottom: 16 }} dir="rtl">
            תזכורת נקבעה ל-{getReminderTime()} — השאר את הטאב פתוח
          </p>
        )}

        {!evening && (
          <button onClick={raiseState}
            className="btn-ghost w-full mb-4"
            style={{ padding: '14px', fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} dir="rtl">
            <Zap className="w-4 h-4" style={{ color: '#FFD60A' }} />
            שנה מצב — קום לשנייה
          </button>
        )}

        {stateTip && (
          <div className="card animate-slide-up mb-4" style={{ borderRight: '3px solid #FFD60A' }}>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.6 }} dir="rtl">{stateTip}</p>
          </div>
        )}

        <div className="card">
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>חוכמת היום</p>
          <p style={{
            fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 16, fontWeight: 400, color: T.isDark ? 'rgba(255,214,10,.85)' : 'rgba(130,100,0,.85)', lineHeight: 1.75,
            opacity: quoteVisible ? 1 : 0, transition: 'opacity 0.4s',
          }} dir="rtl">"{QUOTES[quoteIdx]}"</p>
        </div>

        {!evening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, padding: '14px 0' }}>
            <Sunset className="w-4 h-4" strokeWidth={1.5} style={{ color: T.textMuted, flexShrink: 0 }} />
            <div dir="rtl">
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 3 }}>עד שקיעה</p>
              <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 20, fontWeight: 700, color: T.text }}>{remaining}</p>
            </div>
          </div>
        )}
      </div>

      {!evening && (
        <div className="shrink-0" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: `1px solid ${T.border}`, background: T.bgRaised, transition: 'background .3s' }}>
          {/* Evening nudge — show after 20:00 */}
          {new Date().getHours() >= 20 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '8px 20px', background: 'rgba(255,214,10,.08)',
              borderBottom: '1px solid rgba(255,214,10,.15)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD60A', animation: 'pulse-red 1.5s ease-in-out infinite' }} />
              <span dir="rtl" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.85)', textTransform: 'uppercase' }}>
                כבר ערב — סיים את היום
              </span>
            </div>
          )}
          <div style={{ padding: '12px 20px' }}>
            <button onClick={onFinishDay}
              className="btn-blue w-full"
              style={{ padding: '18px', fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }} dir="rtl">
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              סגור את היום — סיכום 3 דקות
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
