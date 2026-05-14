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
  { title: 'רגל יומי אחד.', sub: 'זה כל מה שצריך.' },
  { title: 'אתה לא מחפש מוטיבציה.', sub: 'אתה בונה משמעת.' },
  { title: 'העולם שייך לאלה', sub: 'שלא מחכים לרגע הנכון.' },
  { title: 'מה שאתה עושה היום', sub: 'קובע מי שתהיה מחר.' },
  { title: 'ללא פחד אין גדולה.', sub: 'הפחד הוא הדלק.' },
  { title: 'אתה חזק יותר', sub: 'ממה שאתה חושב.' },
  { title: 'כל אלוף בעולם', sub: 'עשה מה שלא רצה לעשות.' },
  { title: 'אנרגיה היא הכל.', sub: 'שמור עליה. הגן עליה. תדלק אותה.' },
  { title: 'לא מה שקרה —', sub: 'אלא מה שתעשה עכשיו.' },
]

function getQuote(streak: number, hasMorning: boolean): { title: string; sub: string } {
  const h = new Date().getHours()
  const d = new Date().getDay()

  if (!hasMorning) {
    if (h < 6)  return { title: 'השקט של הלילה.', sub: 'מחר בבוקר — תתחיל.' }
    if (h < 9)  return { title: 'הבוקר הוא שלך.', sub: 'כל גדול בעולם קם לפני שהוא רוצה.' }
    if (h < 12) return { title: 'עדיין יש זמן.', sub: 'לא איחרת. רק תתחיל.' }
    if (h < 17) return { title: 'אחה"צ זה לא מאוחר.', sub: 'מי שמחכה לבוקר המושלם — לא מתחיל לעולם.' }
    return { title: 'הערב הוא גם התחלה.', sub: 'לא מה שקרה — אלא מה שתעשה עכשיו.' }
  }

  if (streak >= 30) return { title: `${streak} יום.`, sub: 'מעטים מגיעים לכאן. אתה אחד מהם.' }
  if (streak >= 14) return { title: `${streak} ימים ברצף.`, sub: 'זה כבר לא רצון — זה מי שאתה.' }
  if (streak >= 7)  return { title: 'שבוע שלם.', sub: 'אתה כבר לא אותו אדם שהתחיל.' }

  return QUOTES[(d * 3 + Math.floor(h / 8)) % QUOTES.length]
}

const NAV_TILES: { id: View; he: string; color: string; label: string }[] = [
  { id: 'prime',   he: 'הכנת הבוקר', color: '#f5c435', label: 'PRIME'   },
  { id: 'actions', he: 'פעולות יומיות', color: '#22c55e', label: 'ACTIONS' },
  { id: 'inspire', he: 'השראה',       color: '#ef4444', label: 'INSPIRE' },
  { id: 'wins',    he: 'קיר הגדילה', color: '#f5c435', label: 'GROWTH'  },
  { id: 'fear',    he: 'פחד לדלק',   color: '#8b5cf6', label: 'FEAR'    },
  { id: 'weekly',  he: 'חדר המלחמה', color: '#f97316', label: 'WAR'     },
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
      <div style={{ padding: '28px 24px 0', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 10, fontWeight: 700, letterSpacing: '2px',
          color: 'rgba(255,255,255,.22)', textTransform: 'uppercase',
          marginBottom: 6,
        }}>{date}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'Heebo, sans-serif',
            fontSize: 13, fontWeight: 500,
            color: 'rgba(255,255,255,.3)',
          }}>יום {dayCount}</span>
          {streak > 0 && (
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 12, fontWeight: 800, letterSpacing: '1px',
              color: '#FFD60A',
              background: 'rgba(255,214,10,.07)',
              border: '1px solid rgba(255,214,10,.18)',
              borderRadius: 999, padding: '2px 10px',
            }}>{streak} STREAK</span>
          )}
        </div>
      </div>

      {/* Hero quote */}
      <div style={{ padding: '32px 24px 24px', flexShrink: 0 }}>
        <h1 dir="rtl" style={{
          fontFamily: '"Frank Ruhl Libre", Georgia, serif',
          fontSize: 'clamp(2.6rem, 10vw, 4.2rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-.5px',
          color: '#f2f2f7',
          marginBottom: 12,
        }}>{title}</h1>
        <p dir="rtl" style={{
          fontFamily: 'Heebo, sans-serif',
          fontSize: 16, fontWeight: 400,
          color: 'rgba(255,255,255,.42)',
          lineHeight: 1.7,
        }}>{sub}</p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,.06)', marginBottom: 20, flexShrink: 0 }} />

      {/* Section tiles — scrollable */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(3, auto)',
        gap: 10,
        alignContent: 'start',
      }}>
        {NAV_TILES.map(({ id, he, color, label }) => {
          const isDone =
            (id === 'prime'   && hasMorning) ||
            (id === 'actions' && (today?.habits?.length ?? 0) > 0)
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              dir="rtl"
              style={{
                background: 'rgba(255,255,255,.03)',
                border: `1px solid ${isDone ? color + '30' : 'rgba(255,255,255,.08)'}`,
                borderRadius: 14,
                padding: '16px 14px',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'border-color .15s, background .15s',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.03)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 10, fontWeight: 800, letterSpacing: '1.5px',
                  color: isDone ? color : 'rgba(255,255,255,.22)',
                  textTransform: 'uppercase',
                }}>{label}</span>
                {isDone && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: color, flexShrink: 0,
                  }} />
                )}
              </div>
              <p style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 15, fontWeight: 700,
                color: '#f2f2f7', lineHeight: 1.2,
              }}>{he}</p>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div style={{
        padding: '20px 24px',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
        flexShrink: 0,
      }}>
        {!hasEvening ? (
          <button
            onClick={onStart}
            dir="rtl"
            style={{
              width: '100%',
              padding: '18px 24px',
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 17, fontWeight: 700,
              background: hasMorning
                ? 'linear-gradient(135deg, #FFD60A, #FF9F0A)'
                : 'linear-gradient(135deg, #FF375F, #BF5AF2)',
              color: hasMorning ? '#000' : '#fff',
              border: 'none', borderRadius: 14, cursor: 'pointer',
              boxShadow: hasMorning
                ? '0 4px 24px rgba(255,214,10,.16)'
                : '0 4px 24px rgba(255,55,95,.2)',
              letterSpacing: '-.2px',
              transition: 'opacity .15s, transform .1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {!hasMorning ? 'התחל את הבוקר' : 'סגור את היום'}
          </button>
        ) : (
          <div style={{
            textAlign: 'center', padding: '16px',
            background: 'rgba(48,209,88,.05)',
            border: '1px solid rgba(48,209,88,.15)',
            borderRadius: 14,
          }}>
            <p style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 17, fontWeight: 700, color: '#30D158',
            }} dir="rtl">היום נסגר בהצלחה</p>
            <p style={{
              fontFamily: 'Heebo, sans-serif',
              fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 4,
            }} dir="rtl">ציון: {today!.evening!.score}/10</p>
          </div>
        )}
      </div>
    </div>
  )
}
