import type { DayEntry } from '../types'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  userName:   string
  entries:    DayEntry[]
  onStart:    () => void
  onNavigate: (v: 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly') => void
}

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

function scoreColor(s: number) {
  if (s >= 9) return '#FFD60A'
  if (s >= 7) return '#e8a020'
  if (s >= 5) return '#FF9F0A'
  return '#FF375F'
}

function ProgressSection({ entries, streak, onNavigate }: {
  entries: DayEntry[]
  streak: number
  onNavigate: Props['onNavigate']
}) {
  const withEvening = entries.filter(e => e.evening).slice(-14)
  const last7 = entries.filter(e => e.evening).slice(-7)
  const avg7 = last7.length
    ? Math.round(last7.reduce((s, e) => s + (e.evening?.score ?? 0), 0) / last7.length * 10) / 10
    : null
  const totalDays = entries.length

  if (totalDays === 0) return null

  return (
    <div
      onClick={() => onNavigate('wins')}
      style={{
        cursor: 'pointer',
        borderRadius: 16,
        padding: '16px 18px',
        background: 'linear-gradient(160deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.05) 100%)',
        border: '1px solid rgba(255,255,255,.12)',
        boxShadow: '0 2px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)',
        transition: 'border-color .2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,214,10,.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)')}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase' }}>
          ההתקדמות שלך
        </p>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase' }}>
          לפרטים ←
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 14, justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: '#FFD60A', lineHeight: 1 }}>{streak}</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px', marginTop: 3 }}>רצף</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: '#f2f2f7', lineHeight: 1 }}>{totalDays}</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px', marginTop: 3 }}>ימים</p>
        </div>
        {avg7 !== null && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: avg7 >= 7 ? '#FFD60A' : avg7 >= 5 ? '#FF9F0A' : '#FF375F', lineHeight: 1 }}>{avg7}</p>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px', marginTop: 3 }}>ממוצע</p>
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: '#f2f2f7', lineHeight: 1 }}>{entries.filter(e => e.evening && e.evening.score >= 9).length}</p>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '1px', marginTop: 3 }}>שיאים</p>
        </div>
      </div>

      {/* Score bars — last 14 days */}
      {withEvening.length > 0 && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32 }}>
          {withEvening.map((e, i) => {
            const s = e.evening!.score
            const h = Math.max(4, (s / 10) * 32)
            const c = scoreColor(s)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{
                  height: h, borderRadius: 3,
                  background: c,
                  boxShadow: `0 0 6px ${c}66`,
                  opacity: i === withEvening.length - 1 ? 1 : 0.55 + (i / withEvening.length) * 0.45,
                }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function HomeScreen({ streak, today, userName, entries, onNavigate }: Props) {
  const hasMorning = !!today?.morning
  const sentences = getSet(streak, hasMorning)
  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100%',
      background: '#000',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw', height: '90vw',
        background: 'radial-gradient(circle, rgba(255,214,10,.04) 0%, transparent 62%)',
        pointerEvents: 'none',
      }} />

      {/* Date + greeting */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
          color: 'rgba(255,255,255,.18)', textTransform: 'uppercase',
          marginBottom: 8,
        }}>{date}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p dir="rtl" style={{
            fontFamily: 'Heebo, sans-serif',
            fontSize: 14, fontWeight: 500,
            color: 'rgba(255,255,255,.32)',
          }}>
            {(() => {
              const h = new Date().getHours()
              if (h < 12) return `בוקר טוב, ${userName}`
              if (h < 17) return `צהריים טובים, ${userName}`
              return `ערב טוב, ${userName}`
            })()}
          </p>
          {streak > 0 && (
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 11, fontWeight: 800, letterSpacing: '1px',
              color: '#FFD60A',
              border: '1px solid rgba(255,214,10,.28)',
              borderRadius: 999, padding: '2px 12px',
            }}>{streak} STREAK</span>
          )}
        </div>
      </div>

      {/* Sentences */}
      <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', marginBottom: 28 }}>
        {sentences.map((s, i) => (
          <p key={i} className={`sentence-in s-delay-${i}`} style={{
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

      {/* Progress section */}
      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <ProgressSection entries={entries} streak={streak} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
