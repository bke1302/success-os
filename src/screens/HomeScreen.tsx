import type { DayEntry } from '../types'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  onStart:    () => void
}

function getLine(streak: number, hasMorning: boolean): { title: string; sub: string } {
  const h = new Date().getHours()
  if (!hasMorning) {
    if (h < 9)  return { title: 'הבוקר הוא שלך.', sub: 'כל אלוף בעולם עשה מה שעשה כשלא רצה.' }
    if (h < 12) return { title: 'עדיין יש זמן.', sub: 'לא איחרת. רק התחל.' }
    if (h < 17) return { title: 'אחה"צ זה לא מאוחר מדי.', sub: 'מי שמחכה לבוקר המושלם — לא מתחיל לעולם.' }
    return { title: 'הערב הוא גם התחלה.', sub: 'לא מה שקרה, אלא מה שתעשה עכשיו.' }
  }
  if (streak <= 1) return { title: 'יום ראשון — ✓', sub: 'הרצף נולד. אל תשבור אותו.' }
  if (streak < 7)  return { title: `${streak} ימים ברצף.`, sub: 'הרגלים נבנים עכשיו, לא כשנוח.' }
  if (streak < 14) return { title: 'שבוע שלם. 🔥', sub: 'אתה כבר לא אותו אדם שהתחיל.' }
  if (streak < 30) return { title: `${streak} ימים. הגוף זוכר.`, sub: 'זה כבר לא רצון — זה מי שאתה.' }
  return { title: `${streak} יום רצף. 💎`, sub: 'מעטים מגיעים לכאן. אתה אחד מהם.' }
}

export function HomeScreen({ dayCount, streak, today, onStart }: Props) {
  const hasMorning = !!today?.morning
  const hasEvening = !!today?.evening
  const commitment = today?.morning?.commitment
  const { title, sub } = getLine(streak, hasMorning)

  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100dvh', overflow: 'hidden',
      background: '#000',
      display: 'flex', flexDirection: 'column',
      paddingRight: 62,
    }}>

      {/* Header */}
      <div style={{ padding: '28px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '2px',
            color: 'rgba(255,255,255,.3)', textTransform: 'uppercase',
            fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 6,
          }}>{date}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.38)' }}>יום {dayCount}</span>
            {streak > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 12px',
                background: 'rgba(255,214,10,.08)',
                border: '1px solid rgba(255,214,10,.2)',
                borderRadius: 999,
              }}>
                <span style={{ fontSize: 11 }}>🔥</span>
                <span style={{
                  fontSize: 14, fontWeight: 900,
                  fontFamily: 'Barlow Condensed, sans-serif',
                  color: '#FFD60A', letterSpacing: 0,
                }}>{streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>

        {/* Headline */}
        <h1 dir="rtl" style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 'clamp(2.6rem, 10vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-1px',
          color: '#f2f2f7',
          marginBottom: 12,
        }}>
          {title}
        </h1>
        <p dir="rtl" style={{
          fontSize: 14, fontWeight: 400,
          color: 'rgba(255,255,255,.45)',
          lineHeight: 1.7,
          marginBottom: 40,
        }}>
          {sub}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 28 }} />

        {/* Commitment or teaser */}
        {commitment ? (
          <div style={{
            background: 'rgba(255,55,95,.06)',
            border: '1px solid rgba(255,55,95,.18)',
            borderRight: '3px solid #FF375F',
            borderRadius: 14,
            padding: '18px 20px',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '2px',
              color: '#FF375F', textTransform: 'uppercase',
              fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 10,
            }}>ההתחייבות שלך היום</p>
            <p dir="rtl" style={{
              fontSize: 17, fontWeight: 700,
              color: '#f2f2f7', lineHeight: 1.45,
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '-.3px',
            }}>{commitment}</p>
            {hasEvening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: today!.evening!.commitmentDone ? '#30D158' : '#FF375F',
                  boxShadow: today!.evening!.commitmentDone ? '0 0 8px rgba(48,209,88,.5)' : '0 0 8px rgba(255,55,95,.5)',
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: today!.evening!.commitmentDone ? '#30D158' : 'rgba(255,255,255,.38)',
                  fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '.3px',
                }} dir="rtl">
                  {today!.evening!.commitmentDone ? 'עמדת בה ✓' : 'טרם הושלם'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '⚡', text: 'הכן את היום' },
              { icon: '🎯', text: 'קבע התחייבות' },
              { icon: '🔥', text: 'צא לדרך' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 16px',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 15, opacity: .7 }}>{icon}</span>
                <p dir="rtl" style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,.38)',
                }}>{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px', paddingBottom: 'max(36px, env(safe-area-inset-bottom))' }}>
        {!hasEvening ? (
          <button
            onClick={onStart}
            dir="rtl"
            style={{
              width: '100%',
              padding: '19px 24px',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-.2px',
              fontFamily: 'Barlow Condensed, sans-serif',
              background: hasMorning
                ? 'linear-gradient(135deg, #FFD60A, #FF9F0A)'
                : 'linear-gradient(135deg, #FF375F, #BF5AF2)',
              color: hasMorning ? '#000' : '#fff',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              boxShadow: hasMorning
                ? '0 4px 28px rgba(255,214,10,.2)'
                : '0 4px 28px rgba(255,55,95,.25)',
              transition: 'opacity .15s, transform .1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {!hasMorning ? 'התחל את הבוקר ←' : 'סגור את היום ←'}
          </button>
        ) : (
          <div style={{
            textAlign: 'center', padding: '18px 20px',
            background: 'rgba(48,209,88,.06)',
            border: '1px solid rgba(48,209,88,.18)',
            borderRadius: 14,
          }}>
            <p style={{
              fontSize: 16, fontWeight: 700,
              color: '#30D158',
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '-.2px',
            }} dir="rtl">✓ היום נסגר בהצלחה</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 5, fontWeight: 500 }} dir="rtl">
              ציון: {today!.evening!.score}/10
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
