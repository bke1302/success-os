import type { DayEntry } from '../types'

interface Props {
  dayCount: number
  streak:   number
  today?:   DayEntry
  onStart:  () => void
}

function getLine(streak: number, hasMorning: boolean): string {
  const h = new Date().getHours()
  if (!hasMorning) {
    if (h < 9)  return 'הבוקר הוא שלך.'
    if (h < 12) return 'עדיין יש זמן.'
    if (h < 17) return 'אחה"צ זה לא מאוחר מדי.'
    return 'הערב הוא גם התחלה.'
  }
  if (streak < 7)  return 'הרצף בנוי. אל תשבור אותו.'
  if (streak < 14) return 'שבוע שלם. אתה כבר לא אותו אדם.'
  if (streak < 30) return 'הגוף זוכר. זה כבר לא רצון — זה מי שאתה.'
  return 'מעטים מגיעים לכאן. אתה אחד מהם.'
}

export function HomeScreen({ dayCount, streak, today, onStart }: Props) {
  const hasMorning = !!today?.morning
  const hasEvening = !!today?.evening
  const commitment = today?.morning?.commitment
  const line       = getLine(streak, hasMorning)
  const date       = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column', paddingRight: 62 }}>

      {/* Date + day */}
      <div style={{ padding: '32px 28px 0' }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', marginBottom: 8 }}>{date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.3)' }}>יום {dayCount}</span>
          {streak > 0 && (
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 800, letterSpacing: '1px', color: '#FFD60A', background: 'rgba(255,214,10,.07)', border: '1px solid rgba(255,214,10,.18)', borderRadius: 999, padding: '2px 10px' }}>
              {streak} STREAK
            </span>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>

        {/* Big serif headline */}
        <h1 dir="rtl" style={{
          fontFamily: 'Frank Ruhl Libre, Georgia, serif',
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-.5px',
          color: '#f2f2f7',
          marginBottom: 20,
        }}>
          {hasMorning ? (streak >= 7 ? 'ממשיך לנצח.' : 'יום טוב.') : 'הצלחה מתחילה כאן.'}
        </h1>

        <p dir="rtl" style={{
          fontFamily: 'Heebo, system-ui, sans-serif',
          fontSize: 15,
          fontWeight: 400,
          color: 'rgba(255,255,255,.4)',
          lineHeight: 1.8,
          marginBottom: 36,
        }}>{line}</p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 28 }} />

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { v: String(dayCount), l: 'ימים' },
            { v: String(streak),   l: 'רצף' },
            { v: hasMorning ? 'V' : '-', l: 'בוקר' },
            { v: hasEvening ? 'V' : '-', l: 'ערב' },
          ].map(({ v, l }) => (
            <div key={l} style={{
              flex: 1, textAlign: 'center',
              padding: '12px 4px',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.09)',
              borderRadius: 12,
            }}>
              <div style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 20, fontWeight: 900, color: '#f2f2f7', lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.38)', marginTop: 5, textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Commitment */}
        {commitment ? (
          <div style={{ background: 'rgba(255,55,95,.05)', border: '1px solid rgba(255,55,95,.14)', borderRight: `3px solid #FF375F`, borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', color: '#FF375F', textTransform: 'uppercase', marginBottom: 8 }}>ההתחייבות שלך</p>
            <p dir="rtl" style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#f2f2f7', lineHeight: 1.45 }}>{commitment}</p>
            {hasEvening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: today!.evening!.commitmentDone ? '#30D158' : 'rgba(255,255,255,.2)' }} />
                <span style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 11, color: today!.evening!.commitmentDone ? '#30D158' : 'rgba(255,255,255,.38)' }} dir="rtl">
                  {today!.evening!.commitmentDone ? 'עמדת בה' : 'לא הושלם'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {['הכן את היום', 'קבע התחייבות', 'צא לדרך'].map((t, i) => (
              <div key={i} style={{ padding: '11px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 10 }}>
                <p dir="rtl" style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.25)' }}>{t}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 28px', paddingBottom: 'max(36px, env(safe-area-inset-bottom))' }}>
        {!hasEvening ? (
          <button onClick={onStart} dir="rtl" style={{
            width: '100%', padding: '19px 24px',
            fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 18, fontWeight: 700,
            background: hasMorning ? 'linear-gradient(135deg, #FFD60A, #FF9F0A)' : 'linear-gradient(135deg, #FF375F, #BF5AF2)',
            color: hasMorning ? '#000' : '#fff',
            border: 'none', borderRadius: 14, cursor: 'pointer',
            boxShadow: hasMorning ? '0 4px 28px rgba(255,214,10,.18)' : '0 4px 28px rgba(255,55,95,.22)',
            letterSpacing: '-.3px',
          }}>
            {!hasMorning ? 'התחל את הבוקר' : 'סגור את היום'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '18px', background: 'rgba(48,209,88,.05)', border: '1px solid rgba(48,209,88,.15)', borderRadius: 14 }}>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#30D158' }} dir="rtl">היום נסגר בהצלחה</p>
            <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.38)', marginTop: 5 }} dir="rtl">ציון: {today!.evening!.score}/10</p>
          </div>
        )}
      </div>
    </div>
  )
}
