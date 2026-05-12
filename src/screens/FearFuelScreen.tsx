import { useState } from 'react'
import { Trash2, ChevronRight } from 'lucide-react'
import type { FearEntry } from '../types'
import { playCheck, playComplete } from '../utils/sounds'

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
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      <div className="shrink-0" style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="label-xs mb-2" style={{ color: 'rgba(139,92,246,0.7)' }}>FEAR → FUEL</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }} dir="rtl">פחד לדלק</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4, lineHeight: 1.5 }} dir="rtl">
          פחד שנכתב מאבד 70% מכוחו.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 32px' }}>

        {!done ? (
          <div className="mx-5 mt-5">

            {/* Step 1 */}
            <div style={{ borderLeft: `3px solid ${step === 1 ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.1)'}`, paddingLeft: 14, marginBottom: 20 }}>
              <p className="label-xs mb-3" style={{ color: step===1 ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.25)' }}>
                שלב 1 — מה הפחד?
              </p>
              <textarea value={fear} onChange={e => setFear(e.target.value)}
                placeholder="כתוב את הפחד שמעכב אותך עכשיו…"
                dir="rtl" rows={3}
                style={{ width:'100%', padding:'13px 16px', background:'#111', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, fontWeight:500, lineHeight:1.6, resize:'none', outline:'none', borderRadius:0 }} />
              {step === 1 && (
                <button onClick={handleNext} disabled={fear.trim().length<3}
                  className="btn-ghost flex items-center gap-2 mt-3"
                  style={{ padding:'11px 16px', fontSize:13, borderRadius:0 }} dir="rtl">
                  המשך לreframe <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step 2 */}
            {step === 2 && (
              <div className="animate-slide-up" style={{ borderLeft: '3px solid #f5c435', paddingLeft: 14 }}>
                <p className="label-xs mb-1" style={{ color: '#f5c435' }}>שלב 2 — איך הפחד הזה משרת אותך?</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">
                  הפחד מפני כישלון → הוכחה שאכפת לך. הופך אותו.
                </p>
                <textarea value={reframe} onChange={e => setReframe(e.target.value)}
                  placeholder="הפחד הזה מלמד אותי ש… / כשאתמודד עם הפחד הזה אני…"
                  dir="rtl" rows={3}
                  style={{ width:'100%', padding:'13px 16px', background:'#111', border:'1px solid rgba(245,196,53,0.2)', color:'#fff', fontSize:14, fontWeight:500, lineHeight:1.6, resize:'none', outline:'none', borderRadius:0 }} />
                <button onClick={handleSave} disabled={reframe.trim().length<3}
                  className="btn-red w-full mt-3"
                  style={{ padding:'14px', fontSize:14, borderRadius:0 }} dir="rtl">
                  הפוך את הפחד לדלק ⚡
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-5 mt-5 animate-slide-up" style={{ borderLeft: '3px solid #22c55e', paddingLeft: 14, padding: '16px 14px' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }} dir="rtl">⚡ הפחד הפך לדלק</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }} dir="rtl">כל פחד שנכתב הוא צעד לחופש</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="mx-5 mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
            <p className="label-xs mb-4">{entries.length} פחדים שהפכת</p>
            {entries.map(entry => (
              <div key={entry.id} style={{ borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: 12, marginBottom: 16 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="label-xs">{formatDate(entry.date)}</p>
                  <button onClick={() => onDelete(entry.id)}
                    style={{ background:'transparent', border:'none', cursor:'pointer', padding:2 }}>
                    <Trash2 className="w-3.5 h-3.5" style={{ color:'rgba(239,68,68,0.5)' }} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, lineHeight: 1.5 }} dir="rtl">😨 {entry.fear}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.5 }} dir="rtl">⚡ {entry.reframe}</p>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && !done && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>😨→⚡</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} dir="rtl">עדיין אין פחדים שהפכת. הוסף את הראשון.</p>
          </div>
        )}
      </div>
    </div>
  )
}
