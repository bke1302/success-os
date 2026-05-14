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
  if (streak <= 1) return { title: 'יום ראשון.', sub: 'הרצף נולד. אל תשבור אותו.' }
  if (streak < 7)  return { title: `${streak} ימים ברצף.`, sub: 'הרגלים נבנים עכשיו, לא כשנוח.' }
  if (streak < 14) return { title: 'שבוע שלם.', sub: 'אתה כבר לא אותו אדם שהתחיל.' }
  if (streak < 30) return { title: `${streak} ימים. הגוף זוכר.`, sub: 'זה כבר לא רצון — זה מי שאתה.' }
  return { title: `${streak} יום רצף.`, sub: 'מעטים מגיעים לכאן. אתה אחד מהם.' }
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
      <div style={{ padding: '28px 24px 0' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '2px',
          color: 'rgba(255,255,255,.28)', textTransform: 'uppercase',
          fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 8,
        }}>{date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.35)', fontFamily: 'Heebo, sans-serif' }}>יום {dayCount}</span>
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '3px 12px',
              background: 'rgba(255,214,10,.07)',
              border: '1px solid rgba(255,214,10,.18)',
              borderRadius: 999,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 800,
                fontFamily: 'Barlow Condensed, sans-serif',
                color: '#FFD60A', letterSpacing: 0,
              }}>{streak} STREAK</span>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>

        {/* Headline — Frank Ruhl Libre serif */}
        <h1 dir="rtl" style={{
          fontFamily: '"Frank Ruhl Libre", Georgia, serif',
          fontSize: 'clamp(2.8rem, 11vw, 4.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-.5px',
          color: '#f2f2f7',
          marginBottom: 14,
        }}>
          {title}
        </h1>
        <p dir="rtl" style={{
          fontFamily: 'Heebo, sans-serif',
          fontSize: 15, fontWeight: 400,
          color: 'rgba(255,255,255,.42)',
          lineHeight: 1.75,
          marginBottom: 40,
        }}>
          {sub}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 26 }} />

        {/* Commitment or teaser */}
        {commitment ? (
          <div style={{
            background: 'rgba(255,55,95,.05)',
            border: '1px solid rgba(255,55,95,.15)',
            borderRight: '3px solid #FF375F',
            borderRadius: 14,
            padding: '18px 20px',
          }}>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '2.5px',
              color: '#FF375F', textTransform: 'uppercase',
              fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 10,
            }}>ההתחייבות שלך היום</p>
            <p dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 18, fontWeight: 700,
              color: '#f2f2f7', lineHeight: 1.45,
            }}>{commitment}</p>
            {hasEvening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: today!.evening!.commitmentDone ? '#30D158' : 'rgba(255,255,255,.25)',
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: today!.evening!.commitmentDone ? '#30D158' : 'rgba(255,255,255,.35)',
                  fontFamily: 'Heebo, sans-serif',
                }} dir="rtl">
                  {today!.evening!.commitmentDone ? 'עמדת בה' : 'טרם הושלם'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['הכן את היום', 'קבע התחייבות', 'צא לדרך'].map((text, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 12,
              }}>
                <p dir="rtl" style={{
                  fontFamily: 'Heebo, sans-serif',
                  fontSize: 13, fontWeight: 500,
                  color: 'rgba(255,255,255,.3)',
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
              fontSize: 17,
              fontWeight: 700,
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              background: hasMorning
                ? 'linear-gradient(135deg, #FFD60A, #FF9F0A)'
                : 'linear-gradient(135deg, #FF375F, #BF5AF2)',
              color: hasMorning ? '#000' : '#fff',
              border: 'none',
              borderRadius: 14,
              cursor: 'pointer',
              boxShadow: hasMorning
                ? '0 4px 28px rgba(255,214,10,.18)'
                : '0 4px 28px rgba(255,55,95,.22)',
              transition: 'opacity .15s, transform .1s',
              letterSpacing: '-.2px',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {!hasMorning ? 'התחל את הבוקר' : 'סגור את היום'}
          </button>
        ) : (
          <div style={{
            textAlign: 'center', padding: '18px 20px',
            background: 'rgba(48,209,88,.05)',
            border: '1px solid rgba(48,209,88,.15)',
            borderRadius: 14,
          }}>
            <p style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 17, fontWeight: 700,
              color: '#30D158',
            }} dir="rtl">היום נסגר בהצלחה</p>
            <p style={{
              fontFamily: 'Heebo, sans-serif',
              fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 5,
            }} dir="rtl">ציון: {today!.evening!.score}/10</p>
          </div>
        )}
      </div>
    </div>
  )
}
