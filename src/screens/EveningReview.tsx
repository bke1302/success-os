import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
import type { EveningEntry } from '../types'
import { playComplete, playCheck } from '../utils/sounds'

interface Props {
  commitment: string
  onComplete: (data: EveningEntry) => void
}

export function EveningReview({ commitment, onComplete }: Props) {
  const [win,             setWin]             = useState('')
  const [lesson,          setLesson]          = useState('')
  const [commitmentDone,  setCommitmentDone]  = useState<boolean | null>(null)
  const [score,           setScore]           = useState(7)

  const canSubmit = win.trim().length >= 3 && commitmentDone !== null

  const submit = () => {
    if (!canSubmit) return
    playComplete()
    onComplete({
      win:            win.trim(),
      lesson:         lesson.trim(),
      commitmentDone: commitmentDone!,
      score,
      completedAt:    new Date().toISOString(),
    })
  }

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: 'radial-gradient(ellipse at 50% 0%, #0d0d1a 0%, #02020a 60%)' }}
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
          3 דקות. תהיה כנה עם עצמך.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

        {/* Commitment reminder */}
        <div
          className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <span className="text-[8px] tracking-[3px] uppercase font-bold mt-0.5 shrink-0" style={{ color: '#ef4444' }}>
            התחייבת
          </span>
          <p className="text-sm font-medium text-white leading-relaxed" dir="rtl">{commitment}</p>
        </div>

        {/* Commitment done — YES / NO */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-3" dir="rtl">
            עשית את זה?
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
              לא הספקתי
            </button>
          </div>
        </div>

        {/* WIN */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold mb-3" style={{ color: '#f5c435' }} dir="rtl">
            מה היה הניצחון שלך היום? ⚡
          </p>
          <textarea
            value={win}
            onChange={e => setWin(e.target.value)}
            placeholder="אפילו ניצחון קטן — כתוב אותו. הוא חשוב."
            dir="rtl"
            rows={4}
            className="w-full rounded-2xl p-5 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
            style={{
              background: win.trim().length >= 3 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
              border: win.trim().length >= 3 ? '1px solid rgba(245,196,53,0.25)' : '1px solid rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Lesson */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted mb-3" dir="rtl">
            מה למדת היום? (אופציונלי)
          </p>
          <textarea
            value={lesson}
            onChange={e => setLesson(e.target.value)}
            placeholder="תובנה, שיעור, או משהו שהפתיע אותך…"
            dir="rtl"
            rows={3}
            className="w-full rounded-2xl p-4 text-sm font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </div>

        {/* Self score */}
        <div>
          <EnergySlider
            value={score}
            onChange={setScore}
            label="תן לעצמך ציון על היום"
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
          שמור וסיים את היום 🏆
        </button>
      </div>
    </div>
  )
}
