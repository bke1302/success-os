import { MoreVertical } from 'lucide-react'
import type { DayEntry } from '../types'

interface Props {
  dayCount:    number
  streak:      number
  today?:      DayEntry
  onStart:     () => void
  onOpenMenu:  () => void
}

function getOpeningLine(streak: number, _dayCount: number, hasMorning: boolean): { title: string; sub: string } {
  const h = new Date().getHours()

  if (!hasMorning) {
    if (h >= 5 && h < 9)  return { title: 'הבוקר הוא שלך.', sub: 'כל אלוף בעולם עשה מה שעשה כשלא רצה. זה ההבדל.' }
    if (h >= 9 && h < 12) return { title: 'עדיין יש זמן.', sub: 'לא איחרת. רק התחל.' }
    if (h >= 12 && h < 17) return { title: 'אחה"צ זה לא מאוחר מדי.', sub: 'מי שמחכה לבוקר המושלם — לא מתחיל לעולם.' }
    return { title: 'הערב הוא גם התחלה.', sub: 'לא מה שקרה, אלא מה שתעשה עכשיו.' }
  }

  if (streak === 0) return { title: 'יום 1 מתחיל היום.', sub: 'כל ענק התחיל מיום ראשון.' }
  if (streak === 1) return { title: 'יום ראשון — ✓', sub: 'הרצף נולד. אל תשבור אותו.' }
  if (streak < 7)   return { title: `${streak} ימים ברצף.`, sub: 'הרגלים נבנים עכשיו, לא כשנוח.' }
  if (streak < 14)  return { title: 'שבוע שלם. 🔥', sub: 'אתה כבר לא אותו אדם שהתחיל.' }
  if (streak < 30)  return { title: `${streak} ימים. הגוף זוכר.`, sub: 'זה כבר לא רצון — זה מי שאתה.' }
  return { title: `${streak} יום רצף. 💎`, sub: 'מעטים מגיעים לכאן. אתה אחד מהם.' }
}

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'בוקר טוב'
  if (h >= 12 && h < 17) return 'צהריים טובים'
  if (h >= 17 && h < 21) return 'ערב טוב'
  return 'לילה טוב'
}

export function HomeScreen({ dayCount, streak, today, onStart, onOpenMenu }: Props) {
  const hasMorning  = !!today?.morning
  const hasEvening  = !!today?.evening
  const commitment  = today?.morning?.commitment
  const { title, sub } = getOpeningLine(streak, dayCount, hasMorning)

  const dateLabel = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ padding: '24px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="label-xs mb-1">{dateLabel}</p>
          <div className="flex items-center gap-3">
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }} dir="rtl">יום {dayCount}</p>
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(245,196,53,0.1)', border: '1px solid rgba(245,196,53,0.2)', borderRadius: 20 }}>
                <span style={{ fontSize: '0.85rem' }}>🔥</span>
                <span className="font-display" style={{ fontSize: 16, color: '#f5c435', lineHeight: 1 }}>{streak}</span>
                <span className="label-xs" style={{ color: 'rgba(245,196,53,0.7)' }}>STREAK</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={onOpenMenu}
          style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <MoreVertical className="w-5 h-5" style={{ color: '#6b6b8a' }} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center" style={{ padding: '0 24px' }}>

        {/* Greeting */}
        <p className="label-xs mb-3" style={{ color: '#6b6b8a' }}>{getTimeGreeting()}</p>

        {/* Opening line */}
        <h1 dir="rtl" style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          fontWeight: 900, lineHeight: 1.15,
          color: '#e8e8f0', marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        <p dir="rtl" style={{ fontSize: 15, color: '#6b6b8a', lineHeight: 1.65, marginBottom: 40 }}>
          {sub}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: '#2a2a3d', marginBottom: 32 }} />

        {/* Today's commitment — if morning done */}
        {commitment ? (
          <div style={{ marginBottom: 28 }}>
            <p className="label-xs mb-3" style={{ color: '#ef4444' }}>המשימה שלך היום</p>
            <div style={{ background: '#12121a', border: '1px solid #2a2a3d', borderLeft: '4px solid #ef4444', borderRadius: 14, padding: '16px 18px' }}>
              <p dir="rtl" style={{ fontSize: 17, fontWeight: 900, color: '#e8e8f0', lineHeight: 1.35 }}>{commitment}</p>
              {hasEvening && (
                <div className="flex items-center gap-2 mt-3">
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: today!.evening!.commitmentDone ? '#22c55e' : '#ef4444' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: today!.evening!.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">
                    {today!.evening!.commitmentDone ? 'עמדת בה ✓' : 'לא הושלם'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            <p className="label-xs mb-3">מה מחכה לך</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['🧠 הכן את היום', '⚡ קבע התחייבות', '🔥 צא לדרך'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 10 }}>
                  <p dir="rtl" style={{ fontSize: 13, color: '#6b6b8a', fontWeight: 600 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 32px', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
        {!hasEvening ? (
          <button onClick={onStart}
            className="btn-red w-full"
            style={{ padding: '20px', fontSize: 17, letterSpacing: '-0.01em' }}
            dir="rtl">
            {!hasMorning ? 'התחל את הבוקר →' : 'סגור את היום →'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#22c55e' }} dir="rtl">✓ היום נסגר בהצלחה</p>
            <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 4 }} dir="rtl">ציון: {today!.evening!.score}/10</p>
          </div>
        )}
      </div>
    </div>
  )
}
