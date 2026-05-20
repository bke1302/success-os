import { useState } from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
import { StepDots } from '../components/StepDots'
import type { EveningEntry } from '../types'
import { playComplete, playCheck } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  commitment: string
  identity?:  string
  onComplete: (data: EveningEntry) => void
}


export function EveningReview({ commitment, identity, onComplete }: Props) {
  const T = useTheme()
  const [step,           setStep]           = useState<1 | 2 | 3>(1)
  const [commitmentDone, setCommitmentDone] = useState<boolean | null>(null)
  const [given,          setGiven]          = useState('')
  const [lesson,         setLesson]         = useState('')
  const [score,          setScore]          = useState(7)

  const next = () => {
    playCheck()
    setStep(s => Math.min(s + 1, 3) as 1 | 2 | 3)
  }

  const submit = () => {
    if (given.trim().length < 3 || commitmentDone === null) return
    playComplete()
    onComplete({
      given: given.trim(), win: given.trim(),
      lesson: lesson.trim(), commitmentDone: commitmentDone!,
      score, completedAt: new Date().toISOString(),
    })
  }

  const canNext1 = commitmentDone !== null
  const canNext2 = given.trim().length >= 3

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* Header */}
      <div className="shrink-0" style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: 4 }}>
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: T.text, lineHeight: 1 }} dir="rtl">סיכום היום</h1>
          </div>
          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, color: T.textFaint, letterSpacing: '1px' }}>{step}/3</p>
        </div>
        <StepDots step={step} total={3} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px 20px 68px' }}>

        {/* STEP 1: Commitment */}
        {step === 1 && (
          <div className="animate-slide-up">
            {identity && (
              <div className="card mb-4" style={{ borderRight: '3px solid rgba(255,214,10,.5)' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', textTransform: 'uppercase', marginBottom: 6 }}>תוכנית השבוע</p>
                <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 15, fontWeight: 700, color: T.isDark ? '#FFD60A' : '#8B6800' }} dir="rtl">{identity}</p>
              </div>
            )}

            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', textTransform: 'uppercase', marginBottom: 12 }}>ההתחייבות שלך</p>

            <div style={{ background: T.isDark ? 'rgba(255,55,95,.05)' : 'rgba(255,55,95,.04)', border: '1px solid rgba(255,55,95,.15)', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
              <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.5 }} dir="rtl">{commitment}</p>
            </div>

            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 16 }}>עמדת בה?</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => { setCommitmentDone(true); playCheck() }}
                aria-label="כן, עמדתי בהתחייבות"
                aria-pressed={commitmentDone === true}
                style={{
                  padding: '20px 16px',
                  fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 700, fontSize: 16,
                  background: commitmentDone === true ? '#FF375F' : 'transparent',
                  border: `2px solid ${commitmentDone === true ? '#FF375F' : T.border2}`,
                  color: commitmentDone === true ? '#fff' : T.textMuted,
                  cursor: 'pointer', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .2s',
                }} dir="rtl">
                <Check className="w-5 h-5" strokeWidth={2.5} /> עשיתי
              </button>
              <button onClick={() => { setCommitmentDone(false) }}
                aria-label="לא, לא הספקתי"
                aria-pressed={commitmentDone === false}
                style={{
                  padding: '20px 16px',
                  fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 700, fontSize: 16,
                  background: commitmentDone === false ? 'rgba(255,55,95,.08)' : 'transparent',
                  border: `2px solid ${commitmentDone === false ? '#FF375F' : T.border2}`,
                  color: commitmentDone === false ? '#FF375F' : T.textMuted,
                  cursor: 'pointer', borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .2s',
                }} dir="rtl">
                <X className="w-5 h-5" strokeWidth={2.5} /> לא הספקתי
              </button>
            </div>

            {commitmentDone === false && (
              <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: 'rgba(255,55,95,.5)', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }} dir="rtl">
                הכנות האמיתית מתגלה כשאתה קם שוב מחר בבוקר.
              </p>
            )}
          </div>
        )}

        {/* STEP 2: Given + Lesson */}
        {step === 2 && (
          <div className="animate-slide-up">
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? '#FFD60A' : '#8B6800', textTransform: 'uppercase', marginBottom: 6 }}>מה נתת היום?</p>
            <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted, marginBottom: 14, lineHeight: 1.5 }} dir="rtl">לא מה קיבלת — מה נתת. ערך, נוכחות, תמיכה, מאמץ.</p>

            <textarea value={given} onChange={e => setGiven(e.target.value)}
              placeholder="כתוב מה נתת לעולם היום…" dir="rtl" rows={4} autoFocus
              aria-label="מה נתת לעולם היום"
              style={{
                width: '100%', padding: '14px 16px', fontFamily: 'Heebo, sans-serif',
                background: given.trim().length >= 3 ? 'rgba(255,214,10,.05)' : T.tagBg,
                border: `1.5px solid ${given.trim().length >= 3 ? 'rgba(255,214,10,.4)' : T.border}`,
                color: T.text, fontSize: 14, fontWeight: 400, lineHeight: 1.6,
                resize: 'none', outline: 'none', borderRadius: 12,
                transition: 'border-color .2s, background .2s',
              }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 24 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, color: given.trim().length >= 3 ? (T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800') : T.textFaint }}>
                {given.trim().length >= 3 ? '✓ ' : ''}{given.trim().length} תווים
              </p>
              {given.trim().length < 3 && (
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, color: T.textFaint }}>מינימום 3 תווים</p>
              )}
            </div>

            <div style={{ height: 1, background: T.divider, marginBottom: 20 }} />

            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>מה למדת היום? <span style={{ fontWeight: 400, letterSpacing: '1px' }}>(רשות)</span></p>
            <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: T.textMuted, marginBottom: 10, lineHeight: 1.5 }} dir="rtl">תובנה, שיעור, טעות שלימדה.</p>
            <textarea value={lesson} onChange={e => setLesson(e.target.value)}
              placeholder="מה שיעור אחד שתיקח מהיום?" dir="rtl" rows={3}
              aria-label="שיעור שלמדת היום (רשות)"
              style={{
                width: '100%', padding: '14px 16px', fontFamily: 'Heebo, sans-serif',
                background: lesson.trim() ? 'rgba(48,209,88,.04)' : T.tagBg,
                border: `1px solid ${lesson.trim() ? 'rgba(48,209,88,.25)' : T.border}`,
                color: T.text, fontSize: 14, fontWeight: 400, lineHeight: 1.6,
                resize: 'none', outline: 'none', borderRadius: 12,
                transition: 'border-color .2s, background .2s',
              }} />
          </div>
        )}

        {/* STEP 3: Score */}
        {step === 3 && (
          <div className="animate-slide-up">
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>ציון גדילה יומי</p>
            <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted, marginBottom: 24, lineHeight: 1.5 }} dir="rtl">לא ציון על ביצועים — ציון על הכוונה והמאמץ שנתת.</p>

            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 'clamp(3.5rem, 18vw, 6rem)',
                fontWeight: 900, lineHeight: 1,
                color: score >= 7 ? (T.isDark ? '#FFD60A' : '#8B6800') : score >= 5 ? T.text : T.textMuted,
                letterSpacing: '-3px',
                transition: 'color .3s',
              }}>{score}</span>
            </div>

            <EnergySlider value={score} onChange={setScore} label="" size="lg" />

            {/* Summary recap */}
            <div style={{ marginTop: 28, padding: '16px', background: T.tagBg, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: 10 }}>סיכום היום שלך</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: commitmentDone ? '#30D158' : '#FF375F', flexShrink: 0 }} />
                <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted }} dir="rtl">
                  ההתחייבות — {commitmentDone ? 'עמדתי ✓' : 'לא הספקתי'}
                </p>
              </div>
              <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.text, lineHeight: 1.5, paddingRight: 14 }} dir="rtl">{given.trim()}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0" style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: `1px solid ${T.border}`, background: T.bgRaised, transition: 'background .3s' }}>
        {step < 3 ? (
          <button onClick={next}
            disabled={step === 1 ? !canNext1 : !canNext2}
            aria-label={`המשך לשלב ${step + 1}`}
            className="btn-blue w-full"
            style={{ padding: '18px', fontSize: 17, fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            dir="rtl">
            המשך
            <ChevronRight style={{ width: 20, height: 20 }} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={submit}
            aria-label="שמור את סיכום היום וסגור"
            className="btn-blue w-full"
            style={{ padding: '18px', fontSize: 17, fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 900 }}
            dir="rtl">
            סגור את היום בכבוד
          </button>
        )}
      </div>
    </div>
  )
}
