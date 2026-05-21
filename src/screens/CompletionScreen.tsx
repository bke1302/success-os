import { useEffect, useState } from 'react'
import { callAICoach, getAICoachURL, type CoachContext } from '../utils/aiCoachAPI'

interface Props {
  score:        number
  onDone:       () => void
  win?:         string
  commitment?:  string
  dayCount?:    number
  coachCtx?:    CoachContext
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

export function CompletionScreen({ score, onDone, win, commitment, dayCount, coachCtx }: Props) {
  const { label, title, sub } = getMessage(score)
  const color = score >= 7 ? '#FFD60A' : score >= 5 ? '#fff' : 'rgba(255,255,255,.5)'

  const [shared,      setShared]      = useState(false)
  const [aiInsight,   setAiInsight]   = useState<string | null>(null)
  const [aiLoading,   setAiLoading]   = useState(false)

  const hasAI = !!getAICoachURL() && !!coachCtx

  // Auto-dismiss: wait for AI if configured (up to 8s), else 3.2s
  useEffect(() => {
    if (!hasAI) {
      const t = setTimeout(onDone, 3200)
      return () => clearTimeout(t)
    }
    // With AI: dismiss 3s after insight arrives, or 9s max
    const maxTimer = setTimeout(onDone, 9000)
    return () => clearTimeout(maxTimer)
  }, [onDone, hasAI])

  // Fetch AI insight
  useEffect(() => {
    if (!hasAI || !coachCtx) return
    setAiLoading(true)
    callAICoach(coachCtx).then(insight => {
      setAiInsight(insight)
      setAiLoading(false)
      // Dismiss 3s after insight arrives
      setTimeout(onDone, 3000)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWitness = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const parts = [
      `✅ SUCCESS OS — יום ${dayCount ?? ''}`,
      `ציון: ${score}/10`,
      win        ? `ניצחון: ${win}`          : '',
      commitment ? `התחייבות: ${commitment}` : '',
    ].filter(Boolean)
    const text = parts.join('\n')
    try {
      if (navigator.share) { await navigator.share({ text }); setShared(true) }
      else { await navigator.clipboard.writeText(text); setShared(true) }
    } catch { /* ignore */ }
    setTimeout(() => setShared(false), 2000)
  }

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
      {/* Ambient glow */}
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
        marginBottom: 12,
        animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .35s both',
      }}>{title}</h2>

      {/* Sub — hidden when AI insight shows */}
      {!aiInsight && (
        <p dir="rtl" style={{
          fontFamily: 'Heebo, sans-serif',
          fontSize: 15, fontWeight: 400,
          color: 'rgba(255,255,255,.38)',
          lineHeight: 1.7, textAlign: 'center',
          animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .45s both',
        }}>{sub}</p>
      )}

      {/* AI Coach Insight */}
      {hasAI && (
        <div style={{
          marginTop: 20, maxWidth: 340,
          animation: 'sentenceIn .4s cubic-bezier(.16,1,.3,1) .5s both',
        }}>
          {aiLoading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 16,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#5B8CFF',
                animation: 'pulse-red 1.2s ease-in-out infinite',
              }} />
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(91,140,255,.6)', textTransform: 'uppercase', margin: 0 }}>
                מאמן AI חושב...
              </p>
            </div>
          )}
          {aiInsight && (
            <div style={{
              padding: '16px 20px',
              background: 'rgba(91,140,255,.07)',
              border: '1px solid rgba(91,140,255,.2)',
              borderRadius: 18,
              animation: 'sentenceIn .5s cubic-bezier(.16,1,.3,1) both',
            }} onClick={e => e.stopPropagation()}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '2.5px', color: 'rgba(91,140,255,.6)', textTransform: 'uppercase', margin: '0 0 8px' }}>
                מאמן AI
              </p>
              <p dir="rtl" style={{
                fontFamily: 'Heebo, sans-serif', fontSize: 14, fontWeight: 400,
                color: 'rgba(255,255,255,.75)', lineHeight: 1.65, margin: 0,
              }}>
                {aiInsight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Witness share button */}
      <button onClick={handleWitness} dir="rtl"
        style={{
          position: 'absolute', bottom: 80,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 20px',
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 999, cursor: 'pointer',
          fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
          letterSpacing: '1.5px', color: shared ? '#4ADE80' : 'rgba(255,255,255,.45)',
          textTransform: 'uppercase', transition: 'all .2s',
          animation: 'sentenceIn .4s ease .9s both',
        }}>
        {shared ? '✓ שותף' : 'שתף עם עד'}
      </button>

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
