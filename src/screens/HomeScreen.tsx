import type { DayEntry } from '../types'

type View = 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  onStart:    () => void
  onNavigate: (v: View) => void
}

const QUOTES: { title: string; sub: string }[] = [
  { title: 'הכאב הוא זמני.', sub: 'הוויתור הוא לנצח.' },
  { title: 'אל תנהל את זמנך —', sub: 'נהל את עצמך.' },
  { title: 'ההחלטה שינתה הכל.', sub: 'לא הגורל. הבחירה.' },
  { title: 'מה שאתה עושה היום', sub: 'קובע מי שתהיה מחר.' },
  { title: 'אתה לא מחפש מוטיבציה.', sub: 'אתה בונה משמעת.' },
  { title: 'העולם שייך לאלה', sub: 'שלא מחכים לרגע הנכון.' },
  { title: 'ללא פחד אין גדולה.', sub: 'הפחד הוא הדלק.' },
  { title: 'כל אלוף בעולם', sub: 'עשה מה שלא רצה לעשות.' },
  { title: 'אנרגיה היא הכל.', sub: 'שמור עליה. הגן עליה. תדלק אותה.' },
  { title: 'לא מה שקרה —', sub: 'אלא מה שתעשה עכשיו.' },
]

function getQuote(streak: number, hasMorning: boolean): { title: string; sub: string } {
  const h = new Date().getHours()
  const d = new Date().getDay()

  if (!hasMorning) {
    if (h < 9)  return { title: 'הבוקר הוא שלך.', sub: 'כל גדול בעולם קם לפני שהוא רוצה.' }
    if (h < 12) return { title: 'עדיין יש זמן.', sub: 'לא איחרת. רק תתחיל.' }
    if (h < 17) return { title: 'אחה"צ זה לא מאוחר.', sub: 'מי שמחכה לבוקר המושלם — לא מתחיל לעולם.' }
    return { title: 'הערב הוא גם התחלה.', sub: 'לא מה שקרה — אלא מה שתעשה עכשיו.' }
  }
  if (streak >= 30) return { title: `${streak} יום.`, sub: 'מעטים מגיעים לכאן. אתה אחד מהם.' }
  if (streak >= 14) return { title: `${streak} ימים.`, sub: 'זה כבר לא רצון — זה מי שאתה.' }
  if (streak >= 7)  return { title: 'שבוע שלם.', sub: 'אתה כבר לא אותו אדם שהתחיל.' }

  return QUOTES[(d * 3 + Math.floor(h / 8)) % QUOTES.length]
}

const TILES: { id: View; he: string; label: string }[] = [
  { id: 'prime',   he: 'הכנת הבוקר',  label: 'PRIME'   },
  { id: 'actions', he: 'פעולות יומיות', label: 'ACTIONS' },
  { id: 'inspire', he: 'השראה',        label: 'INSPIRE' },
  { id: 'wins',    he: 'קיר הגדילה',  label: 'GROWTH'  },
  { id: 'fear',    he: 'פחד לדלק',    label: 'FEAR'    },
  { id: 'weekly',  he: 'חדר המלחמה',  label: 'WAR'     },
]

export function HomeScreen({ dayCount, streak, today, onStart, onNavigate }: Props) {
  const hasMorning = !!today?.morning
  const hasEvening = !!today?.evening
  const { title, sub } = getQuote(streak, hasMorning)
  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100%', overflow: 'hidden',
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{ padding: '32px 24px 0', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
          color: 'rgba(255,255,255,.2)', textTransform: 'uppercase',
          marginBottom: 10,
        }}>{date}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 13, fontWeight: 600, letterSpacing: '1px',
            color: 'rgba(255,255,255,.28)',
          }}>DAY {dayCount}</span>

          {streak > 0 && (
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 13, fontWeight: 800, letterSpacing: '1px',
              color: '#FFD60A',
              border: '1px solid rgba(255,214,10,.35)',
              borderRadius: 999, padding: '2px 12px',
            }}>{streak} STREAK</span>
          )}
        </div>
      </div>

      {/* Quote — hero */}
      <div style={{ padding: '40px 24px 36px', flexShrink: 0 }}>
        <h1 dir="rtl" style={{
          fontFamily: '"Frank Ruhl Libre", Georgia, serif',
          fontSize: 'clamp(2.8rem, 11vw, 4.6rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-.5px',
          color: '#ffffff',
          marginBottom: 14,
        }}>{title}</h1>
        <p dir="rtl" style={{
          fontFamily: 'Heebo, sans-serif',
          fontSize: 16, fontWeight: 400,
          color: 'rgba(255,255,255,.38)',
          lineHeight: 1.7,
        }}>{sub}</p>
      </div>

      {/* Dashboard label */}
      <div style={{
        padding: '0 24px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 10, fontWeight: 800, letterSpacing: '2.5px',
          color: '#FFD60A', textTransform: 'uppercase',
        }}>לוח בקרה</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
      </div>

      {/* Tiles */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        alignContent: 'start',
      }}>
        {TILES.map(({ id, he, label }) => {
          const done =
            (id === 'prime'   && hasMorning) ||
            (id === 'actions' && (today?.habits?.length ?? 0) > 0)
          return (
            <button
              key={id}
              onClick={() => id === 'prime' ? onStart() : onNavigate(id)}
              dir="rtl"
              style={{
                background: done ? 'rgba(255,214,10,.05)' : 'transparent',
                border: `1px solid ${done ? 'rgba(255,214,10,.3)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 14,
                padding: '18px 16px',
                cursor: 'pointer',
                textAlign: 'right',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
                  color: done ? '#FFD60A' : 'rgba(255,255,255,.25)',
                  textTransform: 'uppercase',
                }}>{label}</span>
                {done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD60A' }} />}
              </div>
              <p style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 15, fontWeight: 700,
                color: done ? '#fff' : 'rgba(255,255,255,.6)',
                lineHeight: 1.2,
              }}>{he}</p>
            </button>
          )
        })}

        {/* Morning/Evening action tile — full width */}
        {!hasEvening && (
          <button
            onClick={onStart}
            dir="rtl"
            style={{
              gridColumn: '1 / -1',
              background: hasMorning ? '#FFD60A' : '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '18px 24px',
              cursor: 'pointer',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            <p style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 17, fontWeight: 900,
              color: '#000',
              letterSpacing: '-.2px',
            }}>{!hasMorning ? 'התחל את הבוקר' : 'סגור את היום'}</p>
          </button>
        )}

        {hasEvening && (
          <div
            dir="rtl"
            style={{
              gridColumn: '1 / -1',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: '16px 20px',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            <p style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 16, fontWeight: 700,
              color: '#fff',
            }}>היום נסגר</p>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 12, fontWeight: 700, letterSpacing: '1px',
              color: '#FFD60A', marginTop: 4,
            }}>ציון {today!.evening!.score}/10</p>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
