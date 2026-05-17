import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { getTodayFocusSessions } from './FocusScreen'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  userName:   string
  entries:    DayEntry[]
  onStart:    () => void
  onNavigate: (v: 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly' | 'focus') => void
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

function ProgressSection({ entries, streak, onNavigate }: {
  entries: DayEntry[]
  streak: number
  onNavigate: Props['onNavigate']
}) {
  const T = useTheme()
  const last7       = entries.filter(e => e.evening).slice(-7)
  const avg7        = last7.length
    ? Math.round(last7.reduce((s, e) => s + (e.evening?.score ?? 0), 0) / last7.length * 10) / 10
    : null
  const totalDays   = entries.length
  const peakDays    = entries.filter(e => e.evening && e.evening.score >= 9).length
  const focusSessions = getTodayFocusSessions()

  if (totalDays === 0) return null

  const avgColor  = !avg7 ? '#FFD60A' : avg7 >= 7 ? '#FFD60A' : avg7 >= 5 ? '#FF9F0A' : '#FF375F'
  const r         = 36
  const circ      = 2 * Math.PI * r
  const pct       = avg7 ? avg7 / 10 : 0

  return (
    <div
      onClick={() => onNavigate('wins')}
      style={{
        cursor: 'pointer',
        borderRadius: 18,
        padding: '18px 20px',
        background: T.isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,.065) 0%, rgba(255,255,255,.03) 100%)'
          : '#FFFFFF',
        border: `1px solid ${T.border}`,
        boxShadow: T.cardShadow,
        transition: 'border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,214,10,.35)'; e.currentTarget.style.boxShadow = `${T.cardShadow}, 0 0 0 1px rgba(255,214,10,.1)` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = T.cardShadow }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', color: T.isDark ? 'rgba(255,214,10,.65)' : '#8B6800', textTransform: 'uppercase' }}>
          ההתקדמות שלך
        </p>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: T.textFaint, textTransform: 'uppercase' }}>
          פרטים ←
        </p>
      </div>

      {/* Ring + stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* Score ring */}
        {avg7 !== null ? (
          <div style={{ position: 'relative', flexShrink: 0, width: 88, height: 88 }}>
            <svg width={88} height={88} viewBox="0 0 88 88">
              <circle cx={44} cy={44} r={r} fill="none"
                stroke={T.isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}
                strokeWidth={5} />
              <circle cx={44} cy={44} r={r} fill="none"
                stroke={avgColor} strokeWidth={5} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 6px ${avgColor}66)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 22, fontWeight: 900, lineHeight: 1, color: avgColor }}>{avg7}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '1.5px', color: T.textDim, marginTop: 2 }}>AVG</span>
            </div>
          </div>
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: T.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${T.border2}` }}>
            <span style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 20, fontWeight: 900, color: T.textDim }}>—</span>
          </div>
        )}

        {/* Side stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { v: streak,         l: 'ימי רצף',    c: T.isDark ? '#FFD60A' : '#8B6800' },
            { v: totalDays,      l: 'ימים סה״כ',  c: T.text },
            { v: peakDays,       l: 'ימי שיא',    c: '#30D158' },
            { v: focusSessions,  l: 'סשני פוקוס', c: '#0A84FF' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: T.textMuted }} dir="rtl">{l}</span>
              <span style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 20, fontWeight: 900, color: c, lineHeight: 1 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HomeScreen({ streak, today, userName, entries, onNavigate }: Props) {
  const T = useTheme()
  const hasMorning = !!today?.morning
  const sentences = getSet(streak, hasMorning)
  const date = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{
      height: '100%',
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background .3s',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw', height: '90vw',
        background: 'radial-gradient(circle, rgba(255,214,10,.05) 0%, transparent 62%)',
        pointerEvents: 'none',
      }} />

      {/* Date + greeting */}
      <div style={{ marginBottom: 28, position: 'relative' }}>
        <p style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: 9, fontWeight: 700, letterSpacing: '3px',
          color: T.textFaint, textTransform: 'uppercase',
          marginBottom: 10,
        }}>{date}</p>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div dir="rtl" style={{ flex: 1 }}>
            <p style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(1.5rem, 6vw, 2rem)',
              fontWeight: 900, lineHeight: 1.1,
              color: T.text, letterSpacing: '-.3px',
            }}>
              {(() => {
                const h = new Date().getHours()
                if (h < 12) return `בוקר טוב, ${userName}.`
                if (h < 17) return `צהריים טובים, ${userName}.`
                return `ערב טוב, ${userName}.`
              })()}
            </p>
          </div>
          {streak > 0 && (
            <span className={streak >= 7 ? 'streak-pulse' : ''} style={{
              flexShrink: 0,
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 11, fontWeight: 800, letterSpacing: '1px',
              color: T.isDark ? '#FFD60A' : '#8B6800',
              border: `1px solid ${T.isDark ? 'rgba(255,214,10,.35)' : 'rgba(139,104,0,.3)'}`,
              borderRadius: 999, padding: '4px 14px',
              background: T.isDark ? 'rgba(255,214,10,.08)' : 'rgba(139,104,0,.07)',
              marginTop: 4,
            }}>{streak} STREAK</span>
          )}
        </div>
      </div>

      {/* ONE THING hero — when morning done */}
      {hasMorning && today?.morning?.oneThing ? (
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <p style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9, fontWeight: 700, letterSpacing: '3px',
            color: T.isDark ? 'rgba(255,214,10,.5)' : '#8B6800',
            textTransform: 'uppercase', marginBottom: 16,
          }}>המשימה שלך היום</p>

          <h2 dir="rtl" style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 'clamp(2rem, 8vw, 3.2rem)',
            fontWeight: 900, lineHeight: 1.1,
            color: T.text, letterSpacing: '-1px',
            marginBottom: 16,
            animation: 'sentenceIn .5s cubic-bezier(.16,1,.3,1) both',
          }}>{today.morning.oneThing}</h2>

          {today.morning.commitment && (
            <p dir="rtl" style={{
              fontFamily: 'Heebo, sans-serif',
              fontSize: 14, color: T.textMuted, lineHeight: 1.6,
              animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .12s both',
            }}>{today.morning.commitment}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
            {[
              { label: 'בוקר', done: true },
              { label: 'פעולות', done: !!(today.habits?.length) },
              { label: 'ערב', done: !!today.evening },
            ].map(({ label, done }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <div style={{ width: 20, height: 1, background: T.border }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: done ? '#30D158' : T.border2,
                    boxShadow: done ? '0 0 6px rgba(48,209,88,.5)' : 'none',
                    transition: 'all .3s',
                  }} />
                  <span style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 9, fontWeight: 700, letterSpacing: '1px',
                    color: done ? '#30D158' : T.textFaint,
                    textTransform: 'uppercase',
                  }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Generic motivational sentences */
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
              color: s.color === 'y' ? (T.isDark ? '#FFD60A' : '#8B6800') : T.text,
            }}>{s.text}</p>
          ))}
        </div>
      )}

      {/* Progress section */}
      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <ProgressSection entries={entries} streak={streak} onNavigate={onNavigate} />
      </div>

      {/* Quick actions */}
      <div className="animate-slide-up" style={{ display: 'flex', gap: 8, marginTop: 12, animationDelay: '500ms' }}>
        {([
          { label: 'פעולות', view: 'actions', color: '#FF375F' },
          { label: 'פוקוס',  view: 'focus',   color: '#0A84FF' },
          { label: 'גדילה',  view: 'wins',    color: T.isDark ? '#FFD60A' : '#8B6800' },
        ] as const).map(({ label, view, color }) => (
          <button key={view} onClick={() => onNavigate(view)}
            style={{
              flex: 1, padding: '10px 0',
              background: 'transparent',
              border: `1px solid ${T.border}`,
              borderRadius: 12, cursor: 'pointer',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
              color: T.textMuted,
              transition: 'border-color .2s, color .2s, background .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.color = color; e.currentTarget.style.background = color + '0d' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent' }}
            dir="rtl">{label}</button>
        ))}
      </div>
    </div>
  )
}
