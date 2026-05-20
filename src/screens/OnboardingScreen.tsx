import { useState } from 'react'
import { Bell } from 'lucide-react'
import { setReminderTime, requestAndScheduleReminder } from '../utils/reminder'

interface Props {
  onComplete: (name: string) => void
}

const STEP_META = [
  { tag: 'ברוך הבא', cta: 'בואו נתחיל' },
  { tag: 'שלב 1 מתוך 3', cta: 'המשך' },
  { tag: 'שלב 2 מתוך 3', cta: 'הפעל תזכורת' },
  { tag: 'שלב 3 מתוך 3', cta: 'כניסה למערכת' },
]

export function OnboardingScreen({ onComplete }: Props) {
  const [step,         setStep]         = useState(0)
  const [name,         setName]         = useState('')
  const [reminderTime, setReminderTimeS] = useState('07:00')
  const [notifStatus,  setNotifStatus]  = useState<'idle' | 'done' | 'denied'>('idle')

  const canAdvance = step !== 1 || name.trim().length > 0

  const handleNotif = async () => {
    setReminderTime(reminderTime)
    const result = await requestAndScheduleReminder()
    setNotifStatus(result === 'scheduled' ? 'done' : 'denied')
    setTimeout(() => setStep(3), 600)
  }

  const advance = () => {
    if (step === 2) { handleNotif(); return }
    if (step < 3) { setStep(s => s + 1); return }
    onComplete(name.trim() || 'אלוף')
  }

  const skip = () => {
    if (step === 2) { setStep(3); return }
  }

  const { tag, cta } = STEP_META[step]

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
        {STEP_META.map((_, i) => (
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
      }} className="animate-fade-in">{tag}</p>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <>
          <h1 dir="rtl" style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 'clamp(3.5rem, 15vw, 6rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.5px',
            color: '#fff', marginBottom: 20,
          }} className="animate-slide-up">SUCCESS OS</h1>
          <p dir="rtl" style={{
            fontFamily: 'Heebo, sans-serif', fontSize: 16, fontWeight: 400,
            color: 'rgba(255,255,255,.38)', lineHeight: 1.75,
            marginBottom: 56, maxWidth: 340,
          }}>מערכת ההפעלה של הגדולה שלך.</p>
        </>
      )}

      {/* Step 1: Name */}
      {step === 1 && (
        <>
          <h1 dir="rtl" style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 'clamp(2.8rem, 12vw, 5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.5px',
            color: '#fff', marginBottom: 20,
          }} className="animate-slide-up">מה שמך?</h1>
          <input
            autoFocus dir="rtl" type="text"
            placeholder="הכנס שם..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${name ? '#FFD60A' : 'rgba(255,255,255,.2)'}`,
              outline: 'none',
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(1.8rem, 8vw, 3rem)', fontWeight: 700,
              color: '#fff', paddingBottom: 10, marginBottom: 32,
              transition: 'border-color .2s',
            }}
          />
          <p dir="rtl" style={{
            fontFamily: 'Heebo, sans-serif', fontSize: 16, fontWeight: 400,
            color: 'rgba(255,255,255,.38)', lineHeight: 1.75,
            marginBottom: 56, maxWidth: 340,
          }}>כדי שנוכל לדבר אליך ישירות.</p>
        </>
      )}

      {/* Step 2: Notification */}
      {step === 2 && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: notifStatus === 'done' ? 'rgba(74,222,128,.18)' : 'rgba(255,214,10,.12)',
              border: `1px solid ${notifStatus === 'done' ? 'rgba(74,222,128,.35)' : 'rgba(255,214,10,.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bell style={{ width: 20, height: 20, color: notifStatus === 'done' ? '#4ADE80' : '#FFD60A' }} strokeWidth={1.8} />
            </div>
            <h1 dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(2rem, 9vw, 3.5rem)',
              fontWeight: 900, lineHeight: 1.0, color: '#fff', margin: 0,
            }} className="animate-slide-up">תזכורת בוקר</h1>
          </div>

          <p dir="rtl" style={{
            fontFamily: 'Heebo, sans-serif', fontSize: 14, fontWeight: 400,
            color: 'rgba(255,255,255,.45)', lineHeight: 1.75,
            marginBottom: 28, maxWidth: 340,
          }}>כל יום בשעה שתבחר — נזכיר לך להתחיל את הפריים שלך.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40, width: '100%' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase' }}>שעה</span>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTimeS(e.target.value)}
              style={{
                background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 12, padding: '10px 16px', outline: 'none',
                fontFamily: 'Barlow Condensed, sans-serif', fontSize: 22, fontWeight: 900,
                color: '#fff', letterSpacing: '2px', colorScheme: 'dark',
              }}
            />
          </div>

          {notifStatus === 'denied' && (
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,92,92,.7)', marginBottom: 16 }}>
              ההרשאה נדחתה — תוכל להפעיל בהגדרות
            </p>
          )}
        </>
      )}

      {/* Step 3: Ready */}
      {step === 3 && (
        <>
          <h1 dir="rtl" style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 'clamp(2.8rem, 12vw, 5rem)',
            fontWeight: 900, lineHeight: 1.0, letterSpacing: '-.5px',
            color: '#fff', marginBottom: 20,
          }} className="animate-slide-up">הרצף מתחיל היום.</h1>
          <p dir="rtl" style={{
            fontFamily: 'Heebo, sans-serif', fontSize: 15, fontWeight: 400,
            color: 'rgba(255,255,255,.38)', lineHeight: 1.75,
            marginBottom: 12, maxWidth: 340,
          }}>3 שלבים ביום:</p>
          {[['🌅', 'פריים בוקר', 'הגדרת כוונה, מחויבות ופעולה אחת'], ['⚡', 'יום פעולה', 'עקוב אחרי הרגלים, סשני פוקוס ומשימות'], ['🌙', 'סיכום ערב', 'ציון יומי, ניצחון ולקח — 3 דקות']].map(([icon, title, desc]) => (
            <div key={title} dir="rtl" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</p>
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.38)', margin: '3px 0 0', lineHeight: 1.4 }}>{desc}</p>
              </div>
            </div>
          ))}
          <div style={{ marginBottom: 32 }} />
        </>
      )}

      {/* CTA */}
      <button
        onClick={advance}
        disabled={!canAdvance}
        className="btn-gold"
        style={{ padding: '18px 40px', fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 18, letterSpacing: '-.2px' }}
      >{cta}</button>

      {/* Skip for notification step */}
      {step === 2 && (
        <button onClick={skip}
          style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontSize: 13, color: 'rgba(255,255,255,.28)' }}>
          דלג על שלב זה
        </button>
      )}

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
