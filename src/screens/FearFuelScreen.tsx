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
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2a3d' }}>
        <p className="label-xs mb-2" style={{ color: 'rgba(139,92,246,0.7)' }}>FEAR → FUEL</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e8e8f0' }} dir="rtl">פחד לדלק</h1>
        <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 4 }} dir="rtl">פחד שנכתב מאבד 70% מכוחו.</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>
        {!done ? (
          <>
            <div className="card mb-4" style={{ borderLeft: `3px solid ${step === 1 ? 'rgba(139,92,246,0.8)' : '#2a2a3d'}` }}>
              <p className="label-xs mb-3" style={{ color: step===1 ? 'rgba(139,92,246,0.8)' : '#6b6b8a' }}>שלב 1 — מה הפחד?</p>
              <textarea value={fear} onChange={e => setFear(e.target.value)}
                placeholder="כתוב את הפחד שמעכב אותך עכשיו…" dir="rtl" rows={3}
                style={{ width: '100%', padding: '13px 16px', background: '#1a1a28', border: '1px solid #2a2a3d', color: '#e8e8f0', fontSize: 14, fontWeight: 500, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
              {step === 1 && (
                <button onClick={handleNext} disabled={fear.trim().length<3}
                  className="btn-ghost flex items-center gap-2 mt-3"
                  style={{ padding: '11px 16px', fontSize: 13 }} dir="rtl">
                  המשך לreframe <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            {step === 2 && (
              <div className="card animate-slide-up" style={{ borderLeft: '3px solid #f5c435' }}>
                <p className="label-xs mb-1" style={{ color: '#f5c435' }}>שלב 2 — איך הפחד הזה משרת אותך?</p>
                <p style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">הפחד מפני כישלון → הוכחה שאכפת לך. הופך אותו.</p>
                <textarea value={reframe} onChange={e => setReframe(e.target.value)}
                  placeholder="הפחד הזה מלמד אותי ש… / כשאתמודד עם הפחד הזה אני…" dir="rtl" rows={3}
                  style={{ width: '100%', padding: '13px 16px', background: '#1a1a28', border: '1px solid rgba(245,196,53,0.2)', color: '#e8e8f0', fontSize: 14, fontWeight: 500, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
                <button onClick={handleSave} disabled={reframe.trim().length<3}
                  className="btn-red w-full mt-3" style={{ padding: '14px', fontSize: 14 }} dir="rtl">
                  הפוך את הפחד לדלק ⚡
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card animate-slide-up" style={{ borderLeft: '3px solid #22c55e' }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#e8e8f0' }} dir="rtl">⚡ הפחד הפך לדלק</p>
            <p style={{ fontSize: 13, color: '#6b6b8a', marginTop: 4 }} dir="rtl">כל פחד שנכתב הוא צעד לחופש</p>
          </div>
        )}

        {entries.length > 0 && (
          <>
            <div className="divider my-5" />
            <p className="label-xs mb-4">{entries.length} פחדים שהפכת</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map(entry => (
                <div key={entry.id} className="card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="label-xs">{formatDate(entry.date)}</p>
                    <button onClick={() => onDelete(entry.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <Trash2 className="w-3.5 h-3.5" style={{ color: 'rgba(239,68,68,0.5)' }} />
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 6, lineHeight: 1.5 }} dir="rtl">😨 {entry.fear}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0', lineHeight: 1.5 }} dir="rtl">⚡ {entry.reframe}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {entries.length === 0 && !done && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>😨→⚡</p>
            <p style={{ fontSize: 13, color: '#6b6b8a' }} dir="rtl">עדיין אין פחדים שהפכת. הוסף את הראשון.</p>
          </div>
        )}
      </div>
    </div>
  )
}
