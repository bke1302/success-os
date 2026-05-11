import { useState } from 'react'
import { StepWizard }    from '../components/StepWizard'
import { EnergySlider }  from '../components/EnergySlider'
import { getTodayIncantation } from '../constants'
import type { MorningEntry }   from '../types'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  onComplete: (data: MorningEntry) => void
  dayCount: number
}

export function MorningPrime({ onComplete, dayCount }: Props) {
  const [gratitudes, setGratitudes] = useState<[string, string, string]>(['', '', ''])
  const [energy,     setEnergy]     = useState(7)
  const [commitment, setCommitment] = useState('')
  const incantation = getTodayIncantation()

  const setGratitude = (i: number, v: string) => {
    const g = [...gratitudes] as [string, string, string]
    g[i] = v
    setGratitudes(g)
  }

  const allGratitudesFilled = gratitudes.every(g => g.trim().length >= 3)

  const PROMPTS = [
    'דבר ראשון שאתה אסיר תודה עליו…',
    'משהו שקיים בחייך שרוב האנשים לא מעריכים…',
    'אדם, רגע, או יכולת שאתה אסיר תודה עליה…',
  ]

  const steps = [
    {
      title:    'הכרת תודה',
      subtitle: 'תרגיש את זה — לא רק תחשוב עליו. 30 שניות לכל אחד.',
      canAdvance: allGratitudesFilled,
      content: (
        <div className="flex flex-col gap-4">
          {gratitudes.map((g, i) => (
            <div key={i} className="relative">
              <div
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: g.trim().length >= 3 ? 'linear-gradient(135deg,#f5c435,#e8a020)' : 'rgba(255,255,255,0.06)', color: g.trim().length >= 3 ? '#000' : 'rgba(255,255,255,0.3)' }}
              >
                {i + 1}
              </div>
              <textarea
                value={g}
                onChange={e => { setGratitude(i, e.target.value); if (e.target.value.trim().length === 3) playCheck() }}
                placeholder={PROMPTS[i]}
                dir="rtl"
                rows={3}
                className="w-full rounded-2xl p-4 pr-14 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
                style={{
                  background: g.trim().length >= 3 ? 'rgba(232,160,32,0.06)' : 'rgba(255,255,255,0.03)',
                  border: g.trim().length >= 3 ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.07)',
                }}
              />
            </div>
          ))}
          <p className="text-center text-[10px] text-muted tracking-widest uppercase mt-2" dir="rtl">
            הכרת תודה משנה את הכימיה של המוח. זה לא פילוסופיה.
          </p>
        </div>
      ),
    },
    {
      title:    'ההאמרה שלך להיום',
      subtitle: 'קרא את זה בקול רם. תן לזה להיכנס לגוף.',
      canAdvance: true,
      content: (
        <div className="flex flex-col items-center gap-8 py-4">
          <div
            className="w-full rounded-3xl p-7 relative overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.7), transparent)' }}
            />
            <p
              className="text-xl md:text-2xl font-bold leading-relaxed text-white text-center"
              dir="rtl"
              style={{ lineHeight: 1.7 }}
            >
              {incantation}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-4xl">🔊</div>
            <p className="text-sm text-sub" dir="rtl">קרא את זה בקול — לפחות פעמיים</p>
            <p className="text-[10px] text-muted tracking-widest uppercase">הדיבור בקול מחזק את האמונה פי 3</p>
          </div>
        </div>
      ),
    },
    {
      title:    'ההתחייבות שלך',
      subtitle: 'הדבר האחד שאם תעשה אותו — היום מנוצח.',
      canAdvance: commitment.trim().length >= 5,
      content: (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'rgba(232,160,32,0.04)', border: '1px solid rgba(232,160,32,0.15)' }}
          >
            <p className="text-xs text-muted mb-3 text-center tracking-widest uppercase">לא רשימה. לא מטרות. פעולה אחת.</p>
            <textarea
              value={commitment}
              onChange={e => setCommitment(e.target.value)}
              placeholder="היום אני מתחייב ל..."
              dir="rtl"
              rows={4}
              className="w-full rounded-xl p-4 text-lg font-semibold text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted placeholder:font-normal placeholder:text-base"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: commitment.trim().length >= 5 ? '1px solid rgba(232,160,32,0.35)' : '1px solid rgba(255,255,255,0.06)',
              }}
            />
          </div>
          <p className="text-center text-[10px] text-muted tracking-widest uppercase" dir="rtl">
            אנשים שכותבים את המטרות שלהם — מגיעים אליהן פי 4 יותר
          </p>
        </div>
      ),
    },
    {
      title:    'מה רמת האנרגיה שלך?',
      subtitle: 'בדק את עצמך — גוף, מוח, ורגש.',
      canAdvance: true,
      content: (
        <div className="flex flex-col items-center justify-center py-6 gap-8">
          <EnergySlider
            value={energy}
            onChange={setEnergy}
            size="lg"
          />
          <div
            className="w-full rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-muted" dir="rtl">
              {energy <= 5
                ? 'אנרגיה נמוכה? תשתה מים, קום ותזוז — 60 שניות. הגוף משנה את המוח.'
                : energy <= 7
                ? 'טוב. עכשיו תחליט להיכנס למצב שיא. האנרגיה היא בחירה.'
                : 'מושלם. זה המצב שממנו נבנות האימפריות. תשמור על זה.'}
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(ellipse at 30% 20%, #1a0808 0%, #02020a 60%)' }}>
      {/* Day counter banner */}
      <div
        className="w-full px-6 py-3 text-center"
        style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-[9px] tracking-[5px] uppercase font-bold" style={{ color: '#ef4444' }}>
          יום {dayCount} של המסע שלך ·{' '}
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <StepWizard
        steps={steps}
        onComplete={() => {
          playComplete()
          onComplete({
            gratitudes,
            incantation,
            commitment: commitment.trim(),
            energyLevel: energy,
            completedAt: new Date().toISOString(),
          })
        }}
        completeLabel="יצאתי לדרך ⚡"
      />
    </div>
  )
}
