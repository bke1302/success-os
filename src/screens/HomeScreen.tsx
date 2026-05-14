import type { DayEntry } from '../types'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  onStart:    () => void
  onNavigate: (v: 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly') => void
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

export function HomeScreen({ streak, today }: Props) {
  const hasMorning = !!today?.morning
  const { title, sub } = getQuote(streak, hasMorning)
  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100%',
      background: '#000',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 32px',
    }}>

      {/* Date */}
      <p style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
        color: 'rgba(255,255,255,.2)', textTransform: 'uppercase',
        marginBottom: 12,
      }}>{date}</p>

      {/* Streak */}
      {streak > 0 && (
        <span style={{
          display: 'inline-block',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 12, fontWeight: 800, letterSpacing: '1px',
          color: '#FFD60A',
          border: '1px solid rgba(255,214,10,.3)',
          borderRadius: 999, padding: '2px 12px',
          marginBottom: 36,
          alignSelf: 'flex-start',
        }}>{streak} STREAK</span>
      )}

      {!streak && <div style={{ marginBottom: 36 }} />}

      {/* Quote */}
      <h1 dir="rtl" style={{
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
        fontSize: 'clamp(3rem, 13vw, 5.5rem)',
        fontWeight: 900,
        lineHeight: 1.02,
        letterSpacing: '-.5px',
        color: '#ffffff',
        marginBottom: 20,
      }}>{title}</h1>

      <p dir="rtl" style={{
        fontFamily: 'Heebo, sans-serif',
        fontSize: 17, fontWeight: 400,
        color: 'rgba(255,255,255,.35)',
        lineHeight: 1.7,
      }}>{sub}</p>

    </div>
  )
}
