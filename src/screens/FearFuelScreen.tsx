import { useState } from 'react'
import { Trash2, ChevronRight } from 'lucide-react'
import type { FearEntry } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  entries:  FearEntry[]
  onSave:   (e: FearEntry) => void
  onDelete: (id: string)   => void
}

function formatDate(iso: string) {
  const [y,m,d] = iso.split('-').map(Number)
  return new Date(y,m-1,d).toLocaleDateString('he-IL',{day:'numeric',month:'short'})
}

export function FearFuelScreen({ entries, onSave, onDelete }: Props) {
  const T = useTheme()
  const [fear,    setFear]    = useState('')
  const [reframe, setReframe] = useState('')
  const [step,    setStep]    = useState<1|2>(1)
  const [done,    setDone]    = useState(false)

  const handleNext = () => { if (fear.trim().length < 3) return; playCheck(); setStep(2) }
  const handleSave = () => {
    if (reframe.trim().length < 3) return
    onSave({ id: `${Date.now()}`, fear: fear.trim(), reframe: reframe.trim(), date: new Date().toISOString().slice(0,10) })
    playComplete(); setDone(true)
    setTimeout(() => { setFear(''); setReframe(''); setStep(1); setDone(false) }, 1800)
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: T.bg, display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(191,90,242,.7)', textTransform: 'uppercase', marginBottom: 6 }}>FEAR → FUEL</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 26, fontWeight: 900, color: T.text }} dir="rtl">פחד לדלק</h1>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: T.textMuted, marginTop: 4 }} dir="rtl">פחד שנכתב מאבד 70% מכוחו.</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 68px' }}>
        {!done ? (
          <>
            <div className="card mb-4" style={{ borderRight: `3px solid ${step === 1 ? 'rgba(191,90,242,.8)' : T.border}` }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: step===1 ? 'rgba(191,90,242,.8)' : T.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>שלב 1 — מה הפחד?</p>
              <textarea value={fear} onChange={e => setFear(e.target.value)}
                placeholder="כתוב את הפחד שמעכב אותך עכשיו…" dir="rtl" rows={3}
                style={{ width: '100%', padding: '13px 16px', fontFamily: "'Heebo', sans-serif", background: T.tagBg, border: `1px solid ${T.border}`, color: T.text, fontSize: 14, fontWeight: 400, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
              {step === 1 && (
                <button onClick={handleNext} disabled={fear.trim().length<3}
                  className="btn-ghost mt-3"
                  style={{ padding: '11px 16px', fontFamily: "'Heebo', sans-serif", fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} dir="rtl">
                  המשך לreframe <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {step === 2 && (
              <div className="card animate-slide-up" style={{ borderRight: '3px solid #FFD60A' }}>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? '#FFD60A' : '#8B6800', textTransform: 'uppercase', marginBottom: 6 }}>שלב 2 — איך הפחד הזה משרת אותך?</p>
                <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: T.textMuted, marginBottom: 10, lineHeight: 1.5 }} dir="rtl">הפחד מפני כישלון הוא הוכחה שאכפת לך. הופך אותו.</p>
                <textarea value={reframe} onChange={e => setReframe(e.target.value)}
                  placeholder="הפחד הזה מלמד אותי ש…" dir="rtl" rows={3}
                  style={{ width: '100%', padding: '13px 16px', fontFamily: "'Heebo', sans-serif", background: T.tagBg, border: '1px solid rgba(255,214,10,.2)', color: T.text, fontSize: 14, fontWeight: 400, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
                <button onClick={handleSave} disabled={reframe.trim().length<3}
                  className="btn-red w-full mt-3" style={{ padding: '14px', fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 15 }} dir="rtl">
                  הפוך את הפחד לדלק
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card animate-slide-up" style={{ borderRight: '3px solid #30D158' }}>
            <p style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 18, fontWeight: 700, color: T.text }} dir="rtl">הפחד הפך לדלק</p>
            <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 13, color: T.textMuted, marginTop: 4 }} dir="rtl">כל פחד שנכתב הוא צעד לחופש</p>
          </div>
        )}

        {entries.length > 0 && (
          <>
            <div className="divider my-5" />
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 16 }}>{entries.length} פחדים שהפכת</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map(entry => (
                <div key={entry.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>{formatDate(entry.date)}</p>
                    <button onClick={() => onDelete(entry.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(255,55,95,.4)' }} />
                    </button>
                  </div>
                  <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: T.textMuted, marginBottom: 6, lineHeight: 1.5 }} dir="rtl">{entry.fear}</p>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.5 }} dir="rtl">{entry.reframe}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {entries.length === 0 && !done && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 24px', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔥</div>
            <h2 dir="rtl" style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:22, fontWeight:900, color: T.text, marginBottom:10, lineHeight:1.1 }}>הפחד שלך הוא הדלק שלך</h2>
            <p dir="rtl" style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, color: T.textMuted, lineHeight:1.7 }}>תעד את מה שמפחיד אותך — ותהפוך אותו לכוח.</p>
          </div>
        )}
      </div>
    </div>
  )
}
