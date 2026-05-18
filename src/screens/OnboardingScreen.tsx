import { useState } from 'react'

interface Props {
  onComplete: (name: string) => void
}

const STEPS = [
  {
    tag: 'ברוך הבא',
    title: 'SUCCESS OS',
    sub: 'מערכת ההפעלה של הגדולה שלך.',
    cta: 'בואו נתחיל',
    input: false,
  },
  {
    tag: 'שלב 1 מתוך 2',
    title: 'מה שמך?',
    sub: 'כדי שנוכל לדבר אליך ישירות.',
    cta: 'המשך',
    input: true,
  },
  {
    tag: 'שלב 2 מתוך 2',
    title: 'הרצף מתחיל היום.',
    sub: 'כל יום שתפתח את האפליקציה — אתה בונה מי שאתה. לא מחר. עכשיו.',
    cta: 'כניסה למערכת',
    input: false,
  },
]

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  const current = STEPS[step]
  const canAdvance = step !== 1 || name.trim().length > 0

  const advance = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      onComplete(name.trim() || 'אלוף')
    }
  }

  return (
    <div style={{
      height: '100dvh', background: '#0E0F13',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'flex-start',
      padding: '0 36px',
      position: 'relative',
    }}>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', top: 52, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6,
            borderRadius: 3,
            background: i <= step ? '#FFD60A' : 'rgba(255,255,255,.15)',
            transition: 'all .3s cubic-bezier(.16,1,.3,1)',
          }} />
        ))}
      </div>

      {/* Tag */}
      <p style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 10, fontWeight: 800, letterSpacing: '3px',
        color: '#FFD60A', textTransform: 'uppercase',
        marginBottom: 20,
      }} className="animate-fade-in">{current.tag}</p>

      {/* Title */}
      <h1 dir="rtl" style={{
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
        fontSize: step === 0 ? 'clamp(3.5rem, 15vw, 6rem)' : 'clamp(2.8rem, 12vw, 5rem)',
        fontWeight: 900, lineHeight: 1.0,
        letterSpacing: '-.5px',
        color: '#ffffff',
        marginBottom: 20,
      }} className="animate-slide-up">{current.title}</h1>

      {/* Name input */}
      {current.input && (
        <input
          autoFocus
          dir="rtl"
          type="text"
          placeholder="הכנס שם..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${name ? '#FFD60A' : 'rgba(255,255,255,.2)'}`,
            outline: 'none',
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 'clamp(1.8rem, 8vw, 3rem)',
            fontWeight: 700,
            color: '#fff',
            paddingBottom: 10,
            marginBottom: 32,
            transition: 'border-color .2s',
          }}
        />
      )}

      {/* Sub */}
      <p dir="rtl" style={{
        fontFamily: 'Heebo, sans-serif',
        fontSize: 16, fontWeight: 400,
        color: 'rgba(255,255,255,.38)',
        lineHeight: 1.75,
        marginBottom: 56,
        maxWidth: 340,
      }} className="animate-fade-in">{current.sub}</p>

      {/* CTA */}
      <button
        onClick={advance}
        disabled={!canAdvance}
        className="btn-gold"
        style={{ padding: '18px 40px', fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 18, letterSpacing: '-.2px' }}
      >{current.cta}</button>

      {/* Bottom brand */}
      <p style={{
        position: 'absolute', bottom: 36, left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 9, fontWeight: 700, letterSpacing: '2.5px',
        color: 'rgba(255,255,255,.15)', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>SUCCESS OS — מערכת ההפעלה של הגדולה</p>
    </div>
  )
}
