import { useState } from 'react'
import { StepWizard }   from '../components/StepWizard'
import { EnergySlider } from '../components/EnergySlider'
import { IDENTITY_ARCHETYPES } from '../constants'
import type { MorningEntry }   from '../types'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  onComplete: (data: MorningEntry) => void
  dayCount:   number
  lastWin?:   string   // yesterday's win, if exists
}

export function MorningPrime({ onComplete, dayCount, lastWin }: Props) {
  const [archetypeIdx, setArchetypeIdx] = useState<number | null>(null)
  const [customId,     setCustomId]     = useState('')
  const [commitment,   setCommitment]   = useState('')
  const [purpose,      setPurpose]      = useState('')
  const [energy,       setEnergy]       = useState(7)
  const [gratitude,    setGratitude]    = useState('')

  const identityLabel = archetypeIdx !== null
    ? IDENTITY_ARCHETYPES[archetypeIdx].label
    : customId.trim()

  const steps = [

    // ── STEP 1: מי אתה היום? ─────────────────────────────────────────────
    {
      title:    'מי אתה היום?',
      subtitle: 'בחר זהות אחת שתנחה את כל ההחלטות שלך היום.',
      canAdvance: identityLabel.length >= 2,
      content: (
        <div className="flex flex-col gap-5">

          {lastWin && (
            <div
              className="rounded-2xl px-4 py-3 flex items-start gap-3"
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <span className="text-lg shrink-0">🏆</span>
              <div dir="rtl">
                <p className="text-[9px] tracking-widest uppercase font-bold mb-0.5" style={{ color: '#22c55e' }}>
                  הניצחון של אתמול
                </p>
                <p className="text-sm font-medium text-white leading-relaxed">{lastWin}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {IDENTITY_ARCHETYPES.map((arch, i) => (
              <button
                key={i}
                onClick={() => { setArchetypeIdx(i); setCustomId(''); playCheck() }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all duration-200"
                style={
                  archetypeIdx === i
                    ? { background: 'linear-gradient(135deg,rgba(245,196,53,0.15),rgba(232,160,32,0.1))', border: '1px solid rgba(245,196,53,0.5)' }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                <span className="text-2xl">{arch.emoji}</span>
                <span className="text-xs font-bold" dir="rtl"
                  style={{ color: archetypeIdx === i ? '#f5c435' : 'rgba(255,255,255,0.6)' }}>
                  {arch.label}
                </span>
                <span className="text-[9px] text-muted text-center px-1 leading-tight" dir="rtl">
                  {arch.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[10px] uppercase tracking-widest text-muted">או</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <input
            value={customId}
            onChange={e => { setCustomId(e.target.value); setArchetypeIdx(null) }}
            placeholder='כתוב זהות משלך: "אני ה___"'
            dir="rtl"
            className="w-full rounded-2xl px-4 py-4 text-base font-semibold text-white outline-none transition-all placeholder:text-muted placeholder:font-normal"
            style={{
              background: customId.trim().length >= 2 ? 'rgba(245,196,53,0.05)' : 'rgba(255,255,255,0.03)',
              border: customId.trim().length >= 2 ? '1px solid rgba(245,196,53,0.3)' : '1px solid rgba(255,255,255,0.07)',
            }}
          />

          {identityLabel && (
            <div className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(245,196,53,0.06)', border: '1px solid rgba(245,196,53,0.2)' }}>
              <p className="text-[9px] tracking-widest uppercase text-muted mb-1">אתה היום</p>
              <p className="font-bold text-2xl" style={{ color: '#f5c435' }} dir="rtl">
                אני {identityLabel}
              </p>
            </div>
          )}
        </div>
      ),
    },

    // ── STEP 2: המשימה של היום ───────────────────────────────────────────
    {
      title:    'המשימה של היום',
      subtitle: 'דבר אחד. הדבר הכי חשוב שאם תעשה אותו — היום ניצח.',
      canAdvance: commitment.trim().length >= 5 && purpose.trim().length >= 5,
      content: (
        <div className="flex flex-col gap-5">

          {/* Commitment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000' }}>
                1
              </span>
              <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: '#f5c435' }}>
                מה המשימה?
              </p>
            </div>
            <textarea
              value={commitment}
              onChange={e => setCommitment(e.target.value)}
              placeholder="כתוב בדיוק מה תעשה היום — פעולה ספציפית, לא מטרה."
              dir="rtl"
              rows={3}
              className="w-full rounded-2xl p-4 text-base font-semibold text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted placeholder:font-normal"
              style={{
                background: commitment.trim().length >= 5 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
                border: commitment.trim().length >= 5 ? '1px solid rgba(245,196,53,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>

          {/* Purpose */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}>
                2
              </span>
              <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: '#ef4444' }}>
                למה זה חשוב לך?
              </p>
            </div>
            <textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="כי אם לא אעשה את זה, אז... / כי זה מקדם אותי ל..."
              dir="rtl"
              rows={3}
              className="w-full rounded-2xl p-4 text-sm font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
              style={{
                background: purpose.trim().length >= 5 ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)',
                border: purpose.trim().length >= 5 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>

          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-muted text-center" dir="rtl">
              אנשים שכותבים את המשימה שלהם ואת הסיבה לה — מגיעים אליה פי 3 יותר.
            </p>
          </div>
        </div>
      ),
    },

    // ── STEP 3: אנרגיה + תודה ────────────────────────────────────────────
    {
      title:    'אנרגיה ומיקוד',
      subtitle: 'בדק את עצמך — ותן לעצמך דבר אחד שיפתח לך את היום.',
      canAdvance: gratitude.trim().length >= 3,
      content: (
        <div className="flex flex-col gap-6">

          <EnergySlider
            value={energy}
            onChange={setEnergy}
            label="רמת האנרגיה שלך עכשיו"
            size="lg"
          />

          <div>
            <p className="text-[9px] tracking-[4px] uppercase font-bold mb-1" style={{ color: '#f5c435' }} dir="rtl">
              דבר אחד שאתה אסיר תודה עליו היום ⚡
            </p>
            <p className="text-xs text-sub mb-3" dir="rtl">
              משהו קטן, גדול — לא משנה. רק תרגיש אותו.
            </p>
            <textarea
              value={gratitude}
              onChange={e => { setGratitude(e.target.value); if (e.target.value.trim().length === 3) playCheck() }}
              placeholder="אני אסיר תודה על..."
              dir="rtl"
              rows={3}
              className="w-full rounded-2xl p-4 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
              style={{
                background: gratitude.trim().length >= 3 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
                border: gratitude.trim().length >= 3 ? '1px solid rgba(245,196,53,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>

          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs text-muted text-center" dir="rtl">
              {energy <= 4
                ? '🔴 אנרגיה נמוכה? שתה מים, קום, זוז — 60 שניות מספיקות לשנות הכל.'
                : energy <= 7
                ? '🟡 טוב. עכשיו תחליט להיכנס למשחק. האנרגיה היא בחירה.'
                : '🟢 אתה במצב הנכון. תשמור על זה לאורך כל היום.'}
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100dvh', background: 'radial-gradient(ellipse at 30% 20%, #1a0808 0%, #02020a 60%)' }}>
      <div
        className="w-full px-6 py-3 text-center"
        style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-[9px] tracking-[5px] uppercase font-bold" style={{ color: '#ef4444' }}>
          יום {dayCount} ·{' '}
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <StepWizard
        steps={steps}
        onComplete={() => {
          playComplete()
          onComplete({
            gratitudes:  [gratitude.trim(), '', ''],
            vision:      ['', '', ''],
            identity:    identityLabel,
            purpose:     purpose.trim(),
            commitment:  commitment.trim(),
            incantation: '',
            energyLevel: energy,
            completedAt: new Date().toISOString(),
          })
        }}
        completeLabel="יצאתי לדרך ⚡"
      />
    </div>
  )
}
