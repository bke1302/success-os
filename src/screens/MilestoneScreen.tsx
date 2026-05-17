import { useEffect } from 'react'
import { playComplete } from '../utils/sounds'

interface Props {
  streak: number
  onDone: () => void
}

const MILESTONES: Record<number, { label: string; title: string; sub: string }> = {
  7:   { label: '7 DAYS',   title: 'שבוע שלם.',       sub: 'רוב האנשים מפסיקים ביום 3. אתה ביום 7.' },
  14:  { label: '14 DAYS',  title: 'שבועיים.',         sub: 'המוח מתחיל לבנות מסלול עצבי חדש. ממש עכשיו.' },
  21:  { label: '21 DAYS',  title: 'הרגל חדש נולד.',  sub: '21 יום. מחקרים אומרים — זה הנקודה. אתה שם.' },
  30:  { label: '30 DAYS',  title: 'חודש.',            sub: 'חודש של התחייבות. אתה לא אותו אדם שהתחיל.' },
  60:  { label: '60 DAYS',  title: 'רמה אחרת.',       sub: '60 יום זה לא עקביות — זה זהות.' },
  100: { label: '100 DAYS', title: 'מאה יום.',        sub: 'רוב האנשים לא מגיעים לכאן. אתה כבר שם.' },
}

export function MilestoneScreen({ streak, onDone }: Props) {
  const milestone = MILESTONES[streak]
  if (!milestone) return null

  const { label, title, sub } = milestone

  useEffect(() => {
    playComplete()
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      onClick={onDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 36px',
        animation: 'screenIn .35s cubic-bezier(.16,1,.3,1) both',
        cursor: 'pointer',
      }}
    >
      {/* Ambient gold glow */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw', height: '80vw',
        background: 'radial-gradient(circle, rgba(255,214,10,.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Streak number */}
      <div className="glow-number" style={{
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
        fontSize: 'clamp(6rem, 28vw, 11rem)',
        fontWeight: 900, lineHeight: 1,
        color: '#FFD60A',
        animation: 'sentenceIn .5s cubic-bezier(.16,1,.3,1) .1s both',
        letterSpacing: '-4px',
      }}>{streak}</div>

      {/* Label */}
      <p style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 12, fontWeight: 800, letterSpacing: '4px',
        color: 'rgba(255,214,10,.6)',
        textTransform: 'uppercase',
        marginBottom: 28, marginTop: 8,
        animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .25s both',
      }}>{label}</p>

      {/* Title */}
      <h2 dir="rtl" style={{
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
        fontSize: 'clamp(2rem, 9vw, 3.5rem)',
        fontWeight: 900, lineHeight: 1.05,
        color: '#fff', textAlign: 'center',
        marginBottom: 16,
        animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .35s both',
      }}>{title}</h2>

      {/* Sub */}
      <p dir="rtl" style={{
        fontFamily: 'Heebo, sans-serif',
        fontSize: 15, fontWeight: 400,
        color: 'rgba(255,255,255,.40)',
        lineHeight: 1.7, textAlign: 'center',
        animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .45s both',
      }}>{sub}</p>

      {/* Tap hint */}
      <p style={{
        position: 'absolute', bottom: 48,
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 9, fontWeight: 700, letterSpacing: '2px',
        color: 'rgba(255,255,255,.15)', textTransform: 'uppercase',
        animation: 'sentenceIn .4s ease .9s both',
      }}>לחץ להמשך</p>
    </div>
  )
}
