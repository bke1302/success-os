import { useEffect } from 'react'

interface Props {
  score: number
  onDone: () => void
}

function getMessage(score: number): { label: string; title: string; sub: string } {
  if (score >= 9) return {
    label: 'PEAK DAY',
    title: 'יום שיא.',
    sub: 'ימים כאלה בונים אגדות. זכור את התחושה הזאת.',
  }
  if (score >= 7) return {
    label: 'SOLID DAY',
    title: 'יום חזק.',
    sub: 'עקביות היא הנשק הסודי. אתה בדרך.',
  }
  if (score >= 5) return {
    label: 'GRIND DAY',
    title: 'עשית את זה.',
    sub: 'גם בימים כאלה — אתה מנצח את מי שלא ניסה כלל.',
  }
  return {
    label: 'TOMORROW',
    title: 'מחר אתה חוזר.',
    sub: 'הכנות האמיתית מתגלה כשאתה קם שוב.',
  }
}

export function CompletionScreen({ score, onDone }: Props) {
  const { label, title, sub } = getMessage(score)
  const color = score >= 7 ? '#FFD60A' : score >= 5 ? '#fff' : 'rgba(255,255,255,.5)'

  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      onClick={onDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 36px',
        animation: 'screenIn .35s cubic-bezier(.16,1,.3,1) both',
        cursor: 'pointer',
      }}
    >
      {/* Ambient glow behind score */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75vw', height: '75vw',
        background: `radial-gradient(circle, ${score >= 7 ? 'rgba(255,214,10,.09)' : 'rgba(255,255,255,.04)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Score */}
      <div className={score >= 7 ? 'glow-number' : ''} style={{
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
        fontSize: 'clamp(7rem, 30vw, 12rem)',
        fontWeight: 900, lineHeight: 1,
        color,
        animation: 'sentenceIn .5s cubic-bezier(.16,1,.3,1) .1s both',
        letterSpacing: '-4px',
      }}>{score}</div>

      {/* Label */}
      <p style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 12, fontWeight: 800, letterSpacing: '3px',
        color: color === '#FFD60A' ? '#FFD60A' : 'rgba(255,255,255,.35)',
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
        color: 'rgba(255,255,255,.38)',
        lineHeight: 1.7, textAlign: 'center',
        animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .45s both',
      }}>{sub}</p>

      {/* Tap hint */}
      <p style={{
        position: 'absolute', bottom: 48,
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 9, fontWeight: 700, letterSpacing: '2px',
        color: 'rgba(255,255,255,.15)', textTransform: 'uppercase',
        animation: 'sentenceIn .4s ease .8s both',
      }}>לחץ להמשך</p>
    </div>
  )
}
