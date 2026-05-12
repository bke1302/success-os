import { useState } from 'react'
import { Trash2, ChevronRight } from 'lucide-react'
import type { FearEntry } from '../types'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  entries:  FearEntry[]
  onSave:   (entry: FearEntry) => void
  onDelete: (id: string)       => void
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
}

export function FearFuelScreen({ entries, onSave, onDelete }: Props) {
  const [fear,    setFear]    = useState('')
  const [reframe, setReframe] = useState('')
  const [step,    setStep]    = useState<1 | 2>(1)
  const [done,    setDone]    = useState(false)

  const handleNext = () => {
    if (fear.trim().length < 3) return
    playCheck()
    setStep(2)
  }

  const handleSave = () => {
    if (reframe.trim().length < 3) return
    const entry: FearEntry = {
      id:      `${Date.now()}`,
      fear:    fear.trim(),
      reframe: reframe.trim(),
      date:    new Date().toISOString().slice(0, 10),
    }
    onSave(entry)
    playComplete()
    setDone(true)
    setTimeout(() => {
      setFear(''); setReframe(''); setStep(1); setDone(false)
    }, 1800)
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#080810', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -60, left: -60,
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div className="shrink-0 px-5 pt-8 pb-5 animate-fade-in" style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[7px] tracking-[5px] uppercase text-muted mb-1">FEAR → FUEL</p>
        <h1 className="text-2xl font-black text-white" dir="rtl">פחד לדלק</h1>
        <p className="text-xs text-sub mt-1" dir="rtl">
          פחד שנכתב מאבד 70% מכוחו. Reframe מהפך אותו לדלק.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ position: 'relative', zIndex: 1 }}>

        {/* Input form */}
        {!done ? (
          <div className="mb-6 animate-slide-up">

            {/* Step 1: Fear */}
            <div
              className="rounded-2xl p-5 mb-3 transition-all duration-300"
              style={{
                background: step === 1 ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${step === 1 ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <p className="text-[8px] tracking-[4px] uppercase font-black mb-3" style={{ color: 'rgba(139,92,246,0.9)' }} dir="rtl">
                שלב 1 — מה הפחד?
              </p>
              <textarea
                value={fear}
                onChange={e => setFear(e.target.value)}
                placeholder="כתוב את הפחד שמעכב אותך עכשיו…"
                dir="rtl" rows={3}
                className="w-full rounded-xl p-3 text-sm font-medium text-white resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              />
              {step === 1 && (
                <button
                  onClick={handleNext}
                  disabled={fear.trim().length < 3}
                  className="mt-3 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: 'rgba(139,92,246,0.9)' }}
                  dir="rtl"
                >
                  המשך לreframe
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step 2: Reframe */}
            {step === 2 && (
              <div
                className="rounded-2xl p-5 animate-slide-up"
                style={{ background: 'rgba(245,196,53,0.06)', border: '1px solid rgba(245,196,53,0.25)' }}
              >
                <p className="text-[8px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#f5c435' }} dir="rtl">
                  שלב 2 — איך הפחד הזה משרת אותך?
                </p>
                <p className="text-xs text-sub mb-3" dir="rtl">
                  הפחד מפני כישלון → הוכחה שאכפת לך. הפחד מדחייה → הוכחה שאתה מחובר. הופך אותו.
                </p>
                <textarea
                  value={reframe}
                  onChange={e => setReframe(e.target.value)}
                  placeholder="הפחד הזה מלמד אותי ש… / הפחד הזה מגן עליי מ… / כשאתמודד עם הפחד הזה אני…"
                  dir="rtl" rows={3}
                  className="w-full rounded-xl p-3 text-sm font-medium text-white resize-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,196,53,0.15)' }}
                />
                <button
                  onClick={handleSave}
                  disabled={reframe.trim().length < 3}
                  className="mt-3 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000' }}
                  dir="rtl"
                >
                  הפוך את הפחד לדלק ⚡
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center mb-6 animate-slide-up" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="text-4xl mb-3">⚡</div>
            <p className="text-lg font-black text-white mb-1" dir="rtl">הפחד הפך לדלק</p>
            <p className="text-sm text-sub" dir="rtl">כל פחד שנכתב הוא צעד לחופש</p>
          </div>
        )}

        {/* History */}
        {entries.length > 0 && (
          <div>
            <p className="text-[8px] tracking-[4px] uppercase text-muted mb-3">היסטוריה — {entries.length} פחדים שהפכת</p>
            <div className="flex flex-col gap-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div style={{ height: 2, background: 'linear-gradient(90deg,rgba(139,92,246,0.6),rgba(245,196,53,0.6))' }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[9px] text-muted">{formatDate(entry.date)}</p>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-sub mb-2" dir="rtl">😨 {entry.fear}</p>
                    <p className="text-sm font-bold text-white" dir="rtl">⚡ {entry.reframe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && !done && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😨→⚡</div>
            <p className="text-sm text-muted" dir="rtl">עדיין אין פחדים שהפכת. הוסף את הראשון.</p>
          </div>
        )}
      </div>
    </div>
  )
}
