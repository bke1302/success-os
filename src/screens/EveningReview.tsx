import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
import type { EveningEntry } from '../types'
import { playComplete, playCheck } from '../utils/sounds'

interface Props {
  commitment: string
  identity?:  string
  onComplete: (data: EveningEntry) => void
}

export function EveningReview({ commitment, identity, onComplete }: Props) {
  const [commitmentDone, setCommitmentDone] = useState<boolean | null>(null)
  const [given,  setGiven]  = useState('')
  const [lesson, setLesson] = useState('')
  const [score,  setScore]  = useState(7)

  const canSubmit = given.trim().length >= 3 && commitmentDone !== null

  const submit = () => {
    if (!canSubmit) return
    playComplete()
    onComplete({
      given: given.trim(), win: given.trim(),
      lesson: lesson.trim(), commitmentDone: commitmentDone!,
      score, completedAt: new Date().toISOString(),
    })
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>

      {/* Header */}
      <div className="shrink-0" style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="label-xs mb-2">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }} dir="rtl">
          סיכום היום
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }} dir="rtl">
          3 דקות שמשנות הכל.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 16px' }}>

        {/* Identity */}
        {identity && (
          <div className="mx-5 mt-5" style={{ borderLeft: '3px solid rgba(245,196,53,0.5)', paddingLeft: 14 }}>
            <p className="label-xs mb-1" style={{ color: 'rgba(245,196,53,0.5)' }}>תוכנית השבוע</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#f5c435' }} dir="rtl">{identity}</p>
          </div>
        )}

        {/* Commitment review */}
        <div className="mx-5 mt-5">
          <p className="label-xs mb-3" style={{ color: '#ef4444' }}>ההתחייבות שלך</p>
          <div style={{ background: '#111', borderLeft: '3px solid rgba(239,68,68,0.4)', padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.5 }} dir="rtl">{commitment}</p>
          </div>

          <p className="label-xs mb-3">עמדת בה?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => { setCommitmentDone(true); playCheck() }}
              className="flex items-center justify-center gap-2"
              style={{
                padding: '18px', fontWeight: 900, fontSize: 15,
                background: commitmentDone === true ? '#ef4444' : 'transparent',
                border: `2px solid ${commitmentDone === true ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                color: commitmentDone === true ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', borderRadius: 0,
              }} dir="rtl">
              <Check className="w-5 h-5" strokeWidth={2.5} /> עשיתי!
            </button>
            <button
              onClick={() => setCommitmentDone(false)}
              className="flex items-center justify-center gap-2"
              style={{
                padding: '18px', fontWeight: 900, fontSize: 15,
                background: commitmentDone === false ? 'rgba(239,68,68,0.1)' : 'transparent',
                border: `2px solid ${commitmentDone === false ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                color: commitmentDone === false ? '#ef4444' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', borderRadius: 0,
              }} dir="rtl">
              <X className="w-5 h-5" strokeWidth={2.5} /> לא הצלחתי
            </button>
          </div>
          {commitmentDone === false && (
            <p style={{ fontSize: 12, color: 'rgba(239,68,68,0.65)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }} dir="rtl">
              הכנות האמיתית מתגלה כשאתה נכשל ועדיין מגיע מחר בבוקר.
            </p>
          )}
        </div>

        <div style={{ margin: '20px', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* Q1 */}
        <div className="mx-5">
          <p className="label-xs mb-1" style={{ color: '#f5c435' }}>שאלה 1 — מה נתת היום? ⚡</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">
            לא מה קיבלת — מה נתת. ערך, נוכחות, תמיכה, מאמץ.
          </p>
          <textarea
            value={given}
            onChange={e => setGiven(e.target.value)}
            placeholder="כתוב מה נתת לעולם היום…"
            dir="rtl" rows={4}
            style={{
              width: '100%', padding: '14px 16px',
              background: given.trim().length >= 3 ? 'rgba(245,196,53,0.04)' : '#111',
              border: `1px solid ${given.trim().length >= 3 ? 'rgba(245,196,53,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.6,
              resize: 'none', outline: 'none', borderRadius: 0,
            }}
          />
        </div>

        <div style={{ margin: '16px 20px', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* Q2 */}
        <div className="mx-5">
          <p className="label-xs mb-1">שאלה 2 — מה למדת היום?</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">
            תובנה, שיעור, טעות שלימדה.
          </p>
          <textarea
            value={lesson}
            onChange={e => setLesson(e.target.value)}
            placeholder="מה שיעור אחד שתיקח מהיום?"
            dir="rtl" rows={3}
            style={{
              width: '100%', padding: '13px 16px',
              background: '#111', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 14, fontWeight: 500, lineHeight: 1.6,
              resize: 'none', outline: 'none', borderRadius: 0,
            }}
          />
        </div>

        <div style={{ margin: '16px 20px 0' }}>
          <p className="label-xs mb-3">שאלה 3 — כמה גדלת היום?</p>
          <EnergySlider value={score} onChange={setScore} label="ציון גדילה יומי" size="lg" />
        </div>

      </div>

      {/* Submit */}
      <div className="shrink-0" style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: '2px solid rgba(255,255,255,0.12)', background: '#0a0a0a' }}>
        <button onClick={submit} disabled={!canSubmit}
          className="btn-red w-full"
          style={{ padding: '18px', fontSize: 15, borderRadius: 0 }} dir="rtl">
          סגור את היום בכבוד 🏆
        </button>
      </div>
    </div>
  )
}
