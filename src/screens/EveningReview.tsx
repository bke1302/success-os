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
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', marginBottom: 6 }}>
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 28, fontWeight: 900, color: '#f2f2f7' }} dir="rtl">סיכום היום</h1>
        <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 13, color: 'rgba(255,255,255,.38)', marginTop: 4 }} dir="rtl">3 דקות שמשנות הכל.</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 16px' }}>
        {identity && (
          <div className="card mb-4" style={{ borderRight: '3px solid rgba(255,214,10,.5)' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase', marginBottom: 6 }}>תוכנית השבוע</p>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#FFD60A' }} dir="rtl">{identity}</p>
          </div>
        )}

        <div className="card mb-4">
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FF375F', textTransform: 'uppercase', marginBottom: 10 }}>ההתחייבות שלך</p>
          <div style={{ background: 'rgba(255,55,95,.05)', border: '1px solid rgba(255,55,95,.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 15, fontWeight: 700, color: '#f2f2f7', lineHeight: 1.5 }} dir="rtl">{commitment}</p>
          </div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', marginBottom: 12 }}>עמדת בה?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => { setCommitmentDone(true); playCheck() }}
              style={{ padding: '16px', fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontWeight: 700, fontSize: 15,
                background: commitmentDone === true ? '#FF375F' : 'transparent',
                border: `2px solid ${commitmentDone === true ? '#FF375F' : 'rgba(255,255,255,.13)'}`,
                color: commitmentDone === true ? '#fff' : 'rgba(255,255,255,.38)',
                cursor: 'pointer', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} dir="rtl">
              <Check className="w-5 h-5" strokeWidth={2.5} /> עשיתי
            </button>
            <button onClick={() => setCommitmentDone(false)}
              style={{ padding: '16px', fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontWeight: 700, fontSize: 15,
                background: commitmentDone === false ? 'rgba(255,55,95,.08)' : 'transparent',
                border: `2px solid ${commitmentDone === false ? '#FF375F' : 'rgba(255,255,255,.13)'}`,
                color: commitmentDone === false ? '#FF375F' : 'rgba(255,255,255,.38)',
                cursor: 'pointer', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} dir="rtl">
              <X className="w-5 h-5" strokeWidth={2.5} /> לא הצלחתי
            </button>
          </div>
          {commitmentDone === false && (
            <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: 'rgba(255,55,95,.55)', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }} dir="rtl">
              הכנות האמיתית מתגלה כשאתה נכשל ועדיין מגיע מחר בבוקר.
            </p>
          )}
        </div>

        <div className="card mb-4">
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FFD60A', textTransform: 'uppercase', marginBottom: 6 }}>מה נתת היום?</p>
          <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.38)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">לא מה קיבלת — מה נתת. ערך, נוכחות, תמיכה, מאמץ.</p>
          <textarea value={given} onChange={e => setGiven(e.target.value)} placeholder="כתוב מה נתת לעולם היום…" dir="rtl" rows={4}
            style={{ width: '100%', padding: '13px 16px', fontFamily: 'Heebo, system-ui, sans-serif',
              background: given.trim().length >= 3 ? 'rgba(255,214,10,.04)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${given.trim().length >= 3 ? 'rgba(255,214,10,.3)' : 'rgba(255,255,255,.09)'}`,
              color: '#f2f2f7', fontSize: 14, fontWeight: 400, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
        </div>

        <div className="card mb-4">
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', marginBottom: 6 }}>מה למדת היום?</p>
          <p style={{ fontFamily: 'Heebo, system-ui, sans-serif', fontSize: 12, color: 'rgba(255,255,255,.38)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">תובנה, שיעור, טעות שלימדה.</p>
          <textarea value={lesson} onChange={e => setLesson(e.target.value)} placeholder="מה שיעור אחד שתיקח מהיום?" dir="rtl" rows={3}
            style={{ width: '100%', padding: '13px 16px', fontFamily: 'Heebo, system-ui, sans-serif', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', color: '#f2f2f7', fontSize: 14, fontWeight: 400, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 10 }} />
        </div>

        <div className="card mb-4">
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', marginBottom: 12 }}>כמה גדלת היום?</p>
          <EnergySlider value={score} onChange={setScore} label="ציון גדילה יומי" size="lg" />
        </div>
      </div>

      <div className="shrink-0" style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,.09)', background: '#000' }}>
        <button onClick={submit} disabled={!canSubmit} className="btn-red w-full" style={{ padding: '18px', fontFamily: 'Frank Ruhl Libre, Georgia, serif', fontSize: 16 }} dir="rtl">
          סגור את היום בכבוד
        </button>
      </div>
    </div>
  )
}
