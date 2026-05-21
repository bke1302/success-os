import { useState } from 'react'
import { Bell, ChevronRight } from 'lucide-react'
import { setReminderTime, requestAndScheduleReminder } from '../utils/reminder'
import { haptic } from '../utils/haptic'

interface Props {
  onComplete: (name: string) => void
}

const ARCHETYPES = [
  { id: 'entrepreneur', emoji: '🚀', label: 'יזם',      sub: 'בונה עסק, חולם גדול' },
  { id: 'athlete',      emoji: '🏋️', label: 'ספורטאי',  sub: 'גוף הוא כלי ההצלחה' },
  { id: 'creator',      emoji: '🎨', label: 'יוצר',     sub: 'תוכן, אמנות, רעיונות' },
  { id: 'executive',    emoji: '💼', label: 'מנהיג',    sub: 'מוביל אנשים ותוצאות' },
  { id: 'learner',      emoji: '📚', label: 'לומד',     sub: 'ידע הוא הנשק שלי' },
]

const STEPS = ['welcome', 'name', 'archetype', 'notify', 'ready'] as const
type Step = typeof STEPS[number]

export function OnboardingScreen({ onComplete }: Props) {
  const [step,         setStep]         = useState<Step>('welcome')
  const [stepKey,      setStepKey]      = useState(0) // forces re-mount for animation
  const [name,         setName]         = useState('')
  const [archetype,    setArchetype]    = useState('')
  const [reminderTime, setReminderTimeS] = useState('07:00')
  const [notifStatus,  setNotifStatus]  = useState<'idle'|'done'|'denied'>('idle')

  const stepIdx = STEPS.indexOf(step)

  const goTo = (s: Step) => {
    haptic('tap')
    setStep(s)
    setStepKey(k => k + 1)
  }

  const advance = async () => {
    if (step === 'welcome')    { goTo('name');      return }
    if (step === 'name')       { if (!name.trim()) return; goTo('archetype'); return }
    if (step === 'archetype')  { if (!archetype) return; goTo('notify');    return }
    if (step === 'notify') {
      setReminderTime(reminderTime)
      const r = await requestAndScheduleReminder()
      setNotifStatus(r === 'scheduled' ? 'done' : 'denied')
      haptic(r === 'scheduled' ? 'success' : 'tap')
      setTimeout(() => goTo('ready'), 500)
      return
    }
    if (step === 'ready') {
      haptic('success')
      // Store archetype for MorningPrime identity suggestion
      localStorage.setItem('app_archetype', archetype)
      onComplete(name.trim() || 'אלוף')
    }
  }

  const skip = () => {
    if (step === 'notify') goTo('ready')
  }

  const canAdvance =
    (step === 'welcome') ||
    (step === 'name' && name.trim().length > 0) ||
    (step === 'archetype' && !!archetype) ||
    (step === 'notify') ||
    (step === 'ready')

  const CTA: Record<Step, string> = {
    welcome:   'בואו נתחיל',
    name:      'המשך',
    archetype: 'זאת הזהות שלי',
    notify:    notifStatus === 'done' ? '✓ תזכורת נקבעה' : 'הפעל תזכורת',
    ready:     'כניסה למערכת →',
  }

  return (
    <div style={{
      height: '100dvh',
      background: '#090A0E',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Ambient glow (changes per step) ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw', height: '80vw',
        background: step === 'name' ? 'radial-gradient(circle, rgba(91,140,255,.09) 0%, transparent 70%)'
          : step === 'archetype' ? 'radial-gradient(circle, rgba(167,139,250,.09) 0%, transparent 70%)'
          : step === 'notify'    ? 'radial-gradient(circle, rgba(74,222,128,.07) 0%, transparent 70%)'
          : step === 'ready'     ? 'radial-gradient(circle, rgba(255,214,10,.07) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255,214,10,.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'background 1s ease',
      }} />

      {/* ── Progress bar ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,.06)' }}>
        <div style={{
          height: '100%',
          width: `${((stepIdx + 1) / STEPS.length) * 100}%`,
          background: 'linear-gradient(90deg, #FFD60A, #FF9F0A)',
          transition: 'width .5s cubic-bezier(.16,1,.3,1)',
          boxShadow: '0 0 8px rgba(255,214,10,.5)',
        }} />
      </div>

      {/* ── Step dots ── */}
      <div style={{
        position: 'absolute', top: 24, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            width: i === stepIdx ? 20 : 5, height: 5,
            borderRadius: 3,
            background: i <= stepIdx ? '#FFD60A' : 'rgba(255,255,255,.12)',
            transition: 'all .35s cubic-bezier(.16,1,.3,1)',
            boxShadow: i === stepIdx ? '0 0 6px rgba(255,214,10,.5)' : 'none',
          }} />
        ))}
      </div>

      {/* ── Content ── */}
      <div
        key={stepKey}
        className="ob-step"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 36px',
          paddingTop: 64,
          paddingBottom: 180,
        }}
      >

        {/* WELCOME */}
        {step === 'welcome' && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '4px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase', margin: '0 0 24px' }}>
              ברוך הבא
            </p>
            <h1 style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(4rem, 18vw, 7rem)',
              fontWeight: 900, lineHeight: .95, letterSpacing: '-2px',
              color: '#fff', margin: '0 0 6px',
            }}>
              SUCCESS
            </h1>
            <h1 style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(4rem, 18vw, 7rem)',
              fontWeight: 900, lineHeight: .95, letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F0A 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', margin: '0 0 32px',
            }}>
              OS
            </h1>
            <p dir="rtl" style={{
              fontFamily: 'Heebo, sans-serif', fontSize: 18, fontWeight: 400,
              color: 'rgba(255,255,255,.35)', lineHeight: 1.7, maxWidth: 320, margin: 0,
            }}>
              מערכת ההפעלה של הגדולה שלך.<br />
              בנויה על ביצוע יומיומי ועקביות.
            </p>
          </>
        )}

        {/* NAME */}
        {step === 'name' && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '4px', color: 'rgba(91,140,255,.7)', textTransform: 'uppercase', margin: '0 0 20px' }}>
              שלב 1 מתוך 4
            </p>
            <h2 dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(2.8rem, 12vw, 5rem)',
              fontWeight: 900, lineHeight: 1, color: '#fff', margin: '0 0 36px',
            }}>מה שמך?</h2>
            <input
              autoFocus dir="rtl" type="text"
              placeholder="הכנס שם..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdvance && advance()}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${name ? '#5B8CFF' : 'rgba(255,255,255,.15)'}`,
                outline: 'none',
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 'clamp(2rem, 9vw, 3.2rem)', fontWeight: 700,
                color: '#fff', paddingBottom: 12, marginBottom: 16,
                transition: 'border-color .25s',
              }}
            />
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, color: 'rgba(255,255,255,.28)', margin: 0 }}>
              נפנה אליך ישירות — כאל אלוף.
            </p>
          </>
        )}

        {/* ARCHETYPE */}
        {step === 'archetype' && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '4px', color: 'rgba(167,139,250,.7)', textTransform: 'uppercase', margin: '0 0 20px' }}>
              שלב 2 מתוך 4
            </p>
            <h2 dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(2.2rem, 10vw, 4rem)',
              fontWeight: 900, lineHeight: 1.05, color: '#fff', margin: '0 0 8px',
            }}>מי אתה?</h2>
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, color: 'rgba(255,255,255,.3)', margin: '0 0 28px' }}>
              בחר את הזהות הקרובה ביותר אליך
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ARCHETYPES.map(a => {
                const selected = archetype === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => { haptic('tap'); setArchetype(a.id) }}
                    dir="rtl"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px',
                      background: selected ? 'rgba(167,139,250,.12)' : 'rgba(255,255,255,.04)',
                      border: `1.5px solid ${selected ? 'rgba(167,139,250,.5)' : 'rgba(255,255,255,.08)'}`,
                      borderRadius: 16, cursor: 'pointer',
                      transition: 'all .2s cubic-bezier(.16,1,.3,1)',
                      transform: selected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{a.emoji}</span>
                    <div dir="rtl" style={{ textAlign: 'right', flex: 1 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: selected ? '#A78BFA' : '#fff', margin: 0 }}>{a.label}</p>
                      <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.35)', margin: '2px 0 0' }}>{a.sub}</p>
                    </div>
                    {selected && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px rgba(167,139,250,.8)', flexShrink: 0 }} />
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* NOTIFY */}
        {step === 'notify' && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '4px', color: 'rgba(74,222,128,.7)', textTransform: 'uppercase', margin: '0 0 20px' }}>
              שלב 3 מתוך 4
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: notifStatus === 'done' ? 'rgba(74,222,128,.15)' : 'rgba(255,214,10,.1)',
                border: `1px solid ${notifStatus === 'done' ? 'rgba(74,222,128,.3)' : 'rgba(255,214,10,.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell style={{ width: 22, height: 22, color: notifStatus === 'done' ? '#4ADE80' : '#FFD60A' }} strokeWidth={1.8} />
              </div>
              <h2 dir="rtl" style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 'clamp(2rem, 9vw, 3.5rem)',
                fontWeight: 900, lineHeight: 1, color: '#fff', margin: 0,
              }}>תזכורת בוקר</h2>
            </div>
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, color: 'rgba(255,255,255,.38)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 320 }}>
              כל יום בשעה שתבחר — תזכורת להתחיל את הפריים שלך.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>שעה</span>
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTimeS(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 14, padding: '12px 20px', outline: 'none',
                  fontFamily: 'Barlow Condensed, sans-serif', fontSize: 26, fontWeight: 900,
                  color: '#fff', letterSpacing: '3px', colorScheme: 'dark',
                }}
              />
            </div>
            {notifStatus === 'denied' && (
              <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,92,92,.7)', marginTop: 14 }}>
                ההרשאה נדחתה — תוכל להפעיל בהגדרות
              </p>
            )}
          </>
        )}

        {/* READY */}
        {step === 'ready' && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '4px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase', margin: '0 0 20px' }}>
              שלב 4 מתוך 4
            </p>
            <h2 dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 'clamp(2.8rem, 12vw, 5rem)',
              fontWeight: 900, lineHeight: 1, color: '#fff', margin: '0 0 8px',
            }}>הרצף מתחיל היום.</h2>
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 14, color: 'rgba(255,255,255,.35)', margin: '0 0 36px' }}>
              3 שלבים. כל יום. ללא יוצא מהכלל.
            </p>
            {[
              { emoji: '🌅', title: 'פריים בוקר', desc: 'כוונה, מחויבות, פעולה אחת — 5 דקות' },
              { emoji: '⚡', title: 'יום פעולה',  desc: 'הרגלים, פוקוס, משימות' },
              { emoji: '🌙', title: 'סיכום ערב',  desc: 'ציון, ניצחון, לקח — 3 דקות' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} dir="rtl" style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18,
                padding: '14px 18px',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 16,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</p>
                  <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.35)', margin: '3px 0 0', lineHeight: 1.4 }}>{desc}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Fixed Bottom CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '20px 36px calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(to top, #090A0E 60%, transparent)',
      }}>
        <button
          onClick={advance}
          disabled={!canAdvance}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '18px 28px',
            background: canAdvance
              ? 'linear-gradient(135deg, #FFD60A 0%, #FF9F0A 100%)'
              : 'rgba(255,255,255,.07)',
            border: 'none', borderRadius: 18, cursor: canAdvance ? 'pointer' : 'not-allowed',
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 18, fontWeight: 900, letterSpacing: '-.3px',
            color: canAdvance ? '#000' : 'rgba(255,255,255,.25)',
            boxShadow: canAdvance ? '0 6px 28px rgba(255,214,10,.35)' : 'none',
            transition: 'all .25s cubic-bezier(.16,1,.3,1)',
          }}
          dir="rtl"
        >
          {CTA[step]}
          {canAdvance && step !== 'ready' && <ChevronRight style={{ width: 18, height: 18 }} strokeWidth={2.5} />}
        </button>

        {step === 'notify' && (
          <button onClick={skip} style={{
            display: 'block', margin: '12px auto 0', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontSize: 13,
            color: 'rgba(255,255,255,.22)',
          }}>
            דלג על שלב זה
          </button>
        )}
      </div>

      {/* ── Brand watermark ── */}
      <p style={{
        position: 'absolute', bottom: 8, left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: 8, fontWeight: 700, letterSpacing: '2.5px',
        color: 'rgba(255,255,255,.1)', textTransform: 'uppercase',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>SUCCESS OS</p>
    </div>
  )
}
