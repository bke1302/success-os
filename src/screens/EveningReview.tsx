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
  const [given,          setGiven]          = useState('')   // What did I give?
  const [lesson,         setLesson]         = useState('')   // What did I learn?
  const [score,          setScore]          = useState(7)

  const canSubmit = given.trim().length >= 3 && commitmentDone !== null

  const submit = () => {
    if (!canSubmit) return
    playComplete()
    onComplete({
      given:          given.trim(),
      win:            given.trim(),   // legacy compat for WinsWall display
      lesson:         lesson.trim(),
      commitmentDone: commitmentDone!,
      score,
      completedAt:    new Date().toISOString(),
    })
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 0%, #0d0d1a 0%, #02020a 60%)' }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="text-[9px] tracking-[5px] uppercase font-bold text-muted mb-2">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-3xl md:text-4xl gold-text" dir="rtl">
          סיכום היום
        </h1>
        <p className="text-sm text-sub mt-1.5" dir="rtl">
          הרפלקציה היומית של מנצחים — 3 דקות שמשנות הכל.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">

        {/* Identity reminder */}
        {identity && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(245,196,53,0.06)', border: '1px solid rgba(245,196,53,0.2)' }}
          >
            <span className="text-xl">👑</span>
            <div dir="rtl">
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-0.5">תוכנית השבוע</p>
              <p className="text-sm font-bold" style={{ color: '#f5c435' }}>{identity}</p>
            </div>
          </div>
        )}

        {/* Commitment review */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-3" dir="rtl">
            ההתחייבות שלך
          </p>
          <div
            className="rounded-2xl px-4 py-3 mb-4"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <p className="text-sm font-medium text-white leading-relaxed" dir="rtl">{commitment}</p>
          </div>

          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-3" dir="rtl">
            עמדת בה?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setCommitmentDone(true); playCheck() }}
              className="py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200"
              style={
                commitmentDone === true
                  ? { background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000', boxShadow: '0 0 25px rgba(245,196,53,0.4)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <Check className="w-5 h-5" strokeWidth={2.5} />
              עשיתי!
            </button>
            <button
              onClick={() => setCommitmentDone(false)}
              className="py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200"
              style={
                commitmentDone === false
                  ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
              לא הצלחתי
            </button>
          </div>

          {commitmentDone === false && (
            <p
              className="text-xs font-semibold mt-3 text-center leading-relaxed"
              dir="rtl"
              style={{ color: 'rgba(239,68,68,0.7)' }}
            >
              הכנות האמיתית מתגלה כשאתה נכשל ועדיין מגיע מחר בבוקר. מחר מחדש.
            </p>
          )}
        </div>

        {/* Q1 — מה נתתי היום? */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold mb-1" style={{ color: '#f5c435' }} dir="rtl">
            שאלה 1: מה נתת היום? ⚡
          </p>
          <p className="text-xs text-sub mb-3" dir="rtl">
            לא מה קיבלת — מה נתת. ערך, נוכחות, תמיכה, מאמץ.
          </p>
          <textarea
            value={given}
            onChange={e => setGiven(e.target.value)}
            placeholder="כתוב מה נתת לעולם, לאנשים סביבך, לעצמך היום…"
            dir="rtl"
            rows={4}
            className="w-full rounded-2xl p-5 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
            style={{
              background: given.trim().length >= 3 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
              border: given.trim().length >= 3 ? '1px solid rgba(245,196,53,0.25)' : '1px solid rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Q2 — מה למדתי היום? */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-1" dir="rtl">
            שאלה 2: מה למדת היום?
          </p>
          <p className="text-xs text-sub mb-3" dir="rtl">
            תובנה, שיעור, טעות שלימדה. כל גדילה מגיעה מלקח.
          </p>
          <textarea
            value={lesson}
            onChange={e => setLesson(e.target.value)}
            placeholder="מה שיעור אחד שתיקח מהיום הזה?"
            dir="rtl"
            rows={3}
            className="w-full rounded-2xl p-4 text-sm font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </div>

        {/* Self score */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-3" dir="rtl">
            שאלה 3: כמה גדלת היום?
          </p>
          <EnergySlider
            value={score}
            onChange={setScore}
            label="ציון גדילה יומי"
            size="lg"
          />
        </div>

      </div>

      {/* Submit */}
      <div
        className="shrink-0 px-6 py-5"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(2,2,10,0.9)',
          backdropFilter: 'blur(20px)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={
            canSubmit
              ? { background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000', boxShadow: '0 0 30px rgba(245,196,53,0.35)' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
          }
          dir="rtl"
        >
          סגור את היום בכבוד 🏆
        </button>
      </div>
    </div>
  )
}
