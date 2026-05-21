import { useState } from 'react'
import { Check, X, Zap, Crown, Star } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

// ── Config — replace with your WhatsApp number ────────────────────────────────
const WHATSAPP_NUMBER = '972501234567'   // TODO: replace with real number
const MONTHLY_PRICE   = 39
const ANNUAL_PRICE    = 299             // ~₪25/month

interface Props {
  onClose:     () => void
  onActivate:  () => void   // called after "purchase" (demo mode activates instantly)
  daysLeft?:   number
  triggerSrc?: 'trial_end' | 'feature' | 'milestone' | 'manual'
}

const PRO_FEATURES = [
  { icon: '∞',  text: 'הרגלים אישיים ללא הגבלה'        },
  { icon: '🧊', text: 'הקפאות Streak ללא הגבלה'         },
  { icon: '📊', text: 'תובנות קורלציה מלאות'            },
  { icon: '📅', text: 'דוח שבועי 9:16 לשיתוף'           },
  { icon: '🤖', text: 'AI Coach עמוק — 4 תובנות/שבוע'   },
  { icon: '📈', text: 'Trend Charts + Heatmap מלאים'    },
  { icon: '🔔', text: 'תזכורות חכמות + Energy check-ins' },
  { icon: '💾', text: 'גיבוי ענן + סנכרון בין מכשירים'  },
]

const FREE_LIMITS = [
  '14 ימים ניסיון מלא',
  'עד 3 הרגלים אישיים',
  'CoachCard בסיסי',
  'הקפאת Streak אחת',
]

export function UpgradeScreen({ onClose, onActivate, daysLeft, triggerSrc }: Props) {
  const T    = useTheme()
  const [plan, setPlan]   = useState<'monthly' | 'annual'>('annual')
  const [loading, setLoading] = useState(false)

  const headline =
    triggerSrc === 'trial_end'  ? 'הניסיון הסתיים — המשך לגדול' :
    triggerSrc === 'milestone'  ? 'הגעת לאבן דרך — זמן לשדרג'    :
    triggerSrc === 'feature'    ? 'פיצ\'ר PRO — שדרג להמשיך'     :
    'SUCCESS OS Pro'

  const handlePurchase = () => {
    setLoading(true)
    const msg = encodeURIComponent(
      `היי! אני רוצה לרכוש SUCCESS OS Pro\n` +
      `תוכנית: ${plan === 'monthly' ? `חודשי ₪${MONTHLY_PRICE}/חודש` : `שנתי ₪${ANNUAL_PRICE}/שנה`}\n` +
      `שלח לי קישור תשלום 🙏`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')

    // Demo mode: activate Pro immediately after WhatsApp opens
    // In production: replace with webhook/payment confirmation
    setTimeout(() => { onActivate(); setLoading(false) }, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom, 0px)',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{
        width: '100%', maxWidth: 480,
        background: T.isDark ? '#12141c' : '#fff',
        borderRadius: '28px 28px 0 0',
        border: `1px solid ${T.isDark ? 'rgba(255,214,10,.15)' : 'rgba(0,0,0,.08)'}`,
        boxShadow: '0 -16px 64px rgba(0,0,0,.5)',
        maxHeight: '92dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.isDark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)' }} />
        </div>

        {/* Close button */}
        <button onClick={onClose} style={{ position: 'absolute', top: 20, left: 20, background: T.isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X style={{ width: 14, height: 14, color: T.textMuted }} strokeWidth={2} />
        </button>

        <div style={{ padding: '8px 24px 32px' }}>

          {/* Crown hero */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F0A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(255,214,10,.35)',
            }}>
              <Crown style={{ width: 28, height: 28, color: '#000' }} strokeWidth={2.5} />
            </div>
            <h2 dir="rtl" style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: '1.8rem', fontWeight: 900, color: T.text, margin: 0, lineHeight: 1.1 }}>{headline}</h2>
            {daysLeft !== undefined && daysLeft > 0 && (
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, marginTop: 6 }}>
                {daysLeft} ימים נותרו בניסיון החינמי
              </p>
            )}
          </div>

          {/* Plan toggle */}
          <div style={{ display: 'flex', background: T.isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', borderRadius: 14, padding: 4, marginBottom: 16, position: 'relative' }}>
            {(['monthly', 'annual'] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)} style={{
                flex: 1, padding: '10px 8px', border: 'none', borderRadius: 10, cursor: 'pointer',
                background: plan === p ? (T.isDark ? '#1e2030' : '#fff') : 'transparent',
                boxShadow: plan === p ? '0 2px 8px rgba(0,0,0,.18)' : 'none',
                transition: 'all .2s',
              }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: plan === p ? T.text : T.textMuted, textTransform: 'uppercase', margin: 0 }}>
                  {p === 'monthly' ? 'חודשי' : 'שנתי'}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 900, color: plan === p ? '#FFD60A' : T.textMuted, margin: '2px 0 0' }}>
                  {p === 'monthly' ? `₪${MONTHLY_PRICE}` : `₪${ANNUAL_PRICE}`}
                  <span style={{ fontSize: 11, fontWeight: 500, color: T.textMuted }}>{p === 'monthly' ? '/חודש' : '/שנה'}</span>
                </p>
                {p === 'annual' && (
                  <div style={{ display: 'inline-block', background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 999, padding: '1px 8px', marginTop: 3 }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: '#4ADE80', textTransform: 'uppercase' }}>חסוך 36%</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Pro features */}
          <div style={{ background: T.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.03)', border: `1px solid ${T.border}`, borderRadius: 18, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FFD60A', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star style={{ width: 10, height: 10 }} /> PRO כולל
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                  <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                  <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, fontWeight: 600, color: T.textSub, margin: 0, lineHeight: 1.35 }}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Free limits */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>חינמי תמיד</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FREE_LIMITS.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: T.tagBg, border: `1px solid ${T.border}`, borderRadius: 999 }}>
                  <Check style={{ width: 9, height: 9, color: T.textMuted }} strokeWidth={2.5} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: T.textMuted }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button onClick={handlePurchase} disabled={loading}
            dir="rtl"
            style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F0A 100%)',
              border: 'none', borderRadius: 16, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 900,
              color: '#000', letterSpacing: '-.3px',
              boxShadow: '0 8px 24px rgba(255,214,10,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity .2s',
              opacity: loading ? 0.7 : 1,
            }}>
            <Zap style={{ width: 18, height: 18 }} fill="#000" strokeWidth={0} />
            {loading ? 'מעבד…' : `שדרג ל-PRO — ₪${plan === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE}${plan === 'monthly' ? '/חודש' : '/שנה'}`}
          </button>

          <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textFaint, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
            רכישה דרך WhatsApp · ביטול בכל עת · ללא התחייבות
          </p>
        </div>
      </div>
    </div>
  )
}
