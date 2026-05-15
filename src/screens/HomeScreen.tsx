import type { DayEntry } from '../types'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  onStart:    () => void
  onNavigate: (v: 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly') => void
}

// Each set = 4 sentences shown together. Color: 'w'=white, 'y'=yellow
const SETS: { text: string; color: 'w' | 'y'; size: 'lg' | 'md' }[][] = [
  [
    { text: 'הכאב הוא זמני.', color: 'w', size: 'lg' },
    { text: 'הוויתור הוא לנצח.', color: 'y', size: 'lg' },
    { text: 'כל אלוף בעולם עשה', color: 'w', size: 'md' },
    { text: 'מה שלא רצה לעשות.', color: 'w', size: 'md' },
  ],
  [
    { text: 'אל תנהל את זמנך —', color: 'w', size: 'md' },
    { text: 'נהל את עצמך.', color: 'y', size: 'lg' },
    { text: 'ההחלטה שינתה הכל.', color: 'w', size: 'lg' },
    { text: 'לא הגורל. הבחירה.', color: 'w', size: 'md' },
  ],
  [
    { text: 'מה שאתה עושה היום', color: 'w', size: 'md' },
    { text: 'קובע מי שתהיה מחר.', color: 'y', size: 'lg' },
    { text: 'אתה לא מחפש מוטיבציה.', color: 'w', size: 'md' },
    { text: 'אתה בונה משמעת.', color: 'w', size: 'lg' },
  ],
  [
    { text: 'העולם שייך לאלה', color: 'w', size: 'md' },
    { text: 'שלא מחכים לרגע הנכון.', color: 'y', size: 'lg' },
    { text: 'ללא פחד אין גדולה.', color: 'w', size: 'lg' },
    { text: 'הפחד הוא הדלק.', color: 'w', size: 'md' },
  ],
  [
    { text: 'אנרגיה היא הכל.', color: 'y', size: 'lg' },
    { text: 'שמור עליה. הגן עליה.', color: 'w', size: 'md' },
    { text: 'לא מה שקרה —', color: 'w', size: 'md' },
    { text: 'אלא מה שתעשה עכשיו.', color: 'w', size: 'lg' },
  ],
]

const MORNING_SET: { text: string; color: 'w' | 'y'; size: 'lg' | 'md' }[] = [
  { text: 'הבוקר הוא שלך.', color: 'y', size: 'lg' },
  { text: 'כל גדול בעולם', color: 'w', size: 'md' },
  { text: 'קם לפני שהוא רוצה.', color: 'w', size: 'lg' },
  { text: 'עכשיו. לא אחר כך.', color: 'w', size: 'md' },
]

const AFTERNOON_SET: { text: string; color: 'w' | 'y'; size: 'lg' | 'md' }[] = [
  { text: 'עדיין יש זמן.', color: 'y', size: 'lg' },
  { text: 'לא איחרת.', color: 'w', size: 'lg' },
  { text: 'מי שמחכה לרגע המושלם', color: 'w', size: 'md' },
  { text: 'לא מתחיל לעולם.', color: 'w', size: 'md' },
]

function getSet(streak: number, hasMorning: boolean) {
  const h = new Date().getHours()
  const d = new Date().getDay()

  if (!hasMorning && h < 12) return MORNING_SET
  if (!hasMorning && h >= 12) return AFTERNOON_SET

  if (streak >= 7) return [
    { text: `${streak} ימים ברצף.`, color: 'y' as const, size: 'lg' as const },
    { text: 'זה כבר לא רצון —', color: 'w' as const, size: 'md' as const },
    { text: 'זה מי שאתה.', color: 'w' as const, size: 'lg' as const },
    { text: 'מעטים מגיעים לכאן.', color: 'w' as const, size: 'md' as const },
  ]

  return SETS[d % SETS.length]
}

export function HomeScreen({ streak, today }: Props) {
  const hasMorning = !!today?.morning
  const sentences = getSet(streak, hasMorning)
  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100%',
      background: '#000',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 28px',
    }}>

      {/* Date */}
      <p style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
        color: 'rgba(255,255,255,.18)', textTransform: 'uppercase',
        marginBottom: streak > 0 ? 10 : 32,
      }}>{date}</p>

      {/* Streak */}
      {streak > 0 && (
        <span style={{
          display: 'inline-block', alignSelf: 'flex-start',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 11, fontWeight: 800, letterSpacing: '1px',
          color: '#FFD60A',
          border: '1px solid rgba(255,214,10,.28)',
          borderRadius: 999, padding: '2px 12px',
          marginBottom: 32,
        }}>{streak} STREAK</span>
      )}

      {/* Sentences */}
      <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sentences.map((s, i) => (
          <p key={i} style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: s.size === 'lg'
              ? 'clamp(2.2rem, 9vw, 3.8rem)'
              : 'clamp(1.4rem, 6vw, 2.4rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-.3px',
            color: s.color === 'y' ? '#FFD60A' : '#ffffff',
          }}>{s.text}</p>
        ))}
      </div>

    </div>
  )
}
