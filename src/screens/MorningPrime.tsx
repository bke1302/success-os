import { useState, useEffect } from 'react'
import { StepWizard }    from '../components/StepWizard'
import { EnergySlider }  from '../components/EnergySlider'
import { BreathTimer }   from '../components/BreathTimer'
import {
  getTodayIncantation,
  GRATITUDE_PROMPTS,
  IDENTITY_ARCHETYPES,
} from '../constants'
import type { MorningEntry } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { isSpeechSupported, speakHebrew, stopSpeech } from '../utils/speech'

interface Props {
  onComplete: (data: MorningEntry) => void
  dayCount: number
}

export function MorningPrime({ onComplete, dayCount }: Props) {
  const [breathsDone,  setBreathsDone]  = useState(false)
  const [gratitudes,   setGratitudes]   = useState<[string,string,string]>(['','',''])
  const [vision,       setVision]       = useState<[string,string,string]>(['','',''])
  const [archetypeIdx, setArchetypeIdx] = useState<number | null>(null)
  const [customId,     setCustomId]     = useState('')
  const [purpose,      setPurpose]      = useState('')
  const [commitment,   setCommitment]   = useState('')
  const [energy,       setEnergy]       = useState(7)
  const [isSpeaking,   setIsSpeaking]   = useState(false)
  const incantation = getTodayIncantation()

  // Stop speech on unmount
  useEffect(() => () => stopSpeech(), [])

  const handleSpeak = () => {
    speakHebrew(incantation, () => setIsSpeaking(false))
    setIsSpeaking(true)
  }
  const handleStopSpeak = () => {
    stopSpeech()
    setIsSpeaking(false)
  }

  const setGratitude = (i: number, v: string) => {
    const g = [...gratitudes] as [string,string,string]; g[i] = v; setGratitudes(g)
    if (v.trim().length === 3) playCheck()
  }
  const setVisionItem = (i: number, v: string) => {
    const arr = [...vision] as [string,string,string]; arr[i] = v; setVision(arr)
    if (v.trim().length === 3) playCheck()
  }

  const identityLabel = archetypeIdx !== null
    ? IDENTITY_ARCHETYPES[archetypeIdx].label
    : customId.trim()

  const steps = [
    // ── STEP 1: BREATHWORK ──────────────────────────────────────────────────
    {
      title:    'שנה את הגוף תחילה',
      subtitle: 'עמוד. כתפיים אחורה. 3 סבבי נשימה — ואז אנחנו מתחילים.',
      canAdvance: breathsDone,
      content: (
        <BreathTimer
          onComplete={() => { setBreathsDone(true); playCheck() }}
        />
      ),
    },

    // ── STEP 2: GRATITUDE ───────────────────────────────────────────────────
    {
      title:    'תרגיש אסירות תודה',
      subtitle: 'לא תרגיל — חוויה. אי אפשר להיות מפחד ואסיר תודה בו זמנית.',
      canAdvance: gratitudes.every(g => g.trim().length >= 3),
      content: (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(245,196,53,0.05)', border: '1px solid rgba(245,196,53,0.15)' }}
          >
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f5c435' }}>
              סגור עיניים → חשוב → פתח → כתוב מה הרגשת
            </p>
          </div>

          {GRATITUDE_PROMPTS.map((prompt, i) => (
            <div key={i} className="relative">
              <div
                className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: gratitudes[i].trim().length >= 3
                    ? 'linear-gradient(135deg,#f5c435,#e8a020)' : 'rgba(255,255,255,0.06)',
                  color: gratitudes[i].trim().length >= 3 ? '#000' : 'rgba(255,255,255,0.3)',
                }}
              >
                {i + 1}
              </div>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5 pr-10" dir="rtl">
                {prompt}
              </p>
              <textarea
                value={gratitudes[i]}
                onChange={e => setGratitude(i, e.target.value)}
                placeholder="תכתוב מה עלה לך לראש…"
                dir="rtl"
                rows={3}
                className="w-full rounded-2xl p-4 pr-12 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
                style={{
                  background: gratitudes[i].trim().length >= 3 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
                  border: gratitudes[i].trim().length >= 3 ? '1px solid rgba(245,196,53,0.25)' : '1px solid rgba(255,255,255,0.07)',
                }}
              />
            </div>
          ))}
        </div>
      ),
    },

    // ── STEP 3: VISION ──────────────────────────────────────────────────────
    {
      title:    '3 יעדים — כבר מושגים',
      subtitle: 'לא "אני רוצה" — "זה כבר קורה." ראה זאת בצבעים, בתנועה, עם רגש.',
      canAdvance: vision.every(v => v.trim().length >= 3),
      content: (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p className="text-xs font-semibold text-center leading-relaxed" dir="rtl"
              style={{ color: 'rgba(167,170,255,0.9)' }}>
              הדמיון שלך לא מבדיל בין חוויה אמיתית לחוויה מדומיינת.
              כשאתה מרגיש את הניצחון עכשיו — המוח מתחיל לנווט לכיוונו.
            </p>
          </div>

          {[
            'יעד 1 — בריאות / גוף / אנרגיה',
            'יעד 2 — כסף / קריירה / עסק',
            'יעד 3 — קשרים / משפחה / אהבה',
          ].map((label, i) => (
            <div key={i}>
              <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5" dir="rtl">{label}</p>
              <textarea
                value={vision[i]}
                onChange={e => setVisionItem(i, e.target.value)}
                placeholder='כתוב כאילו זה כבר קרה: "אני כבר…"'
                dir="rtl"
                rows={2}
                className="w-full rounded-2xl p-4 text-base font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
                style={{
                  background: vision[i].trim().length >= 3 ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
                  border: vision[i].trim().length >= 3 ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.07)',
                }}
              />
            </div>
          ))}
        </div>
      ),
    },

    // ── STEP 4: IDENTITY ────────────────────────────────────────────────────
    {
      title:    'מי אתה היום?',
      subtitle: 'אתה לא מקבל מה שאתה רוצה — אתה מקבל מי שאתה. בחר את הזהות שלך.',
      canAdvance: identityLabel.length >= 2,
      content: (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-2">
            {IDENTITY_ARCHETYPES.map((arch, i) => (
              <button
                key={i}
                onClick={() => { setArchetypeIdx(i); setCustomId('') }}
                className="flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all duration-200"
                style={
                  archetypeIdx === i
                    ? { background: 'linear-gradient(135deg,rgba(245,196,53,0.15),rgba(232,160,32,0.1))', border: '1px solid rgba(245,196,53,0.5)' }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                <span className="text-2xl">{arch.emoji}</span>
                <span
                  className="text-xs font-bold tracking-wide"
                  style={{ color: archetypeIdx === i ? '#f5c435' : 'rgba(255,255,255,0.6)' }}
                  dir="rtl"
                >{arch.label}</span>
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
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(245,196,53,0.06)', border: '1px solid rgba(245,196,53,0.2)' }}
            >
              <p className="text-[9px] tracking-widest uppercase text-muted mb-1">הזהות שלך היום</p>
              <p className="font-bold text-xl" style={{ color: '#f5c435' }} dir="rtl">
                אני {identityLabel}
              </p>
            </div>
          )}
        </div>
      ),
    },

    // ── STEP 5: INCANTATION + SPEECH ────────────────────────────────────────
    {
      title:    'ההאמרה שלך — בקול רם',
      subtitle: 'עמוד. ידיים על הלב. אמור את זה עם כל הגוף שלך — לפחות פעמיים.',
      canAdvance: true,
      content: (
        <div className="flex flex-col items-center gap-6 py-2">
          <div
            className="w-full rounded-3xl p-7 relative overflow-hidden"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right,transparent,rgba(239,68,68,0.7),transparent)' }} />
            <p className="text-xl font-bold leading-relaxed text-white text-center" dir="rtl"
              style={{ lineHeight: 1.8 }}>
              {incantation}
            </p>
          </div>

          {/* Speech button */}
          {isSpeechSupported() && (
            <button
              onClick={isSpeaking ? handleStopSpeak : handleSpeak}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={
                isSpeaking
                  ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }
                  : { background: 'rgba(245,196,53,0.08)', border: '1px solid rgba(245,196,53,0.3)', color: '#f5c435' }
              }
              dir="rtl"
            >
              {isSpeaking ? '⏹ עצור' : '🔊 שמע — קרא לי את זה'}
            </button>
          )}

          <div className="w-full rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-col gap-3" dir="rtl">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔊</span>
                <p className="text-sm text-white font-semibold">קרא בקול — לא בשקט</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">💪</span>
                <p className="text-sm text-sub">תן לזה להיכנס לגוף, לא רק למוח</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🔁</span>
                <p className="text-sm text-sub">פעמיים לפחות — עם כוון אמיתי</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted tracking-widest uppercase text-center">
            REPETITION IS THE MOTHER OF SKILL
          </p>
        </div>
      ),
    },

    // ── STEP 6: RPM ─────────────────────────────────────────────────────────
    {
      title:    'RPM — פעולה מסיבית',
      subtitle: 'Result · Purpose · Massive Action. הפורמולה של השינוי האמיתי.',
      canAdvance: purpose.trim().length >= 5 && commitment.trim().length >= 5,
      content: (
        <div className="flex flex-col gap-5">

          {/* R — Result */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000' }}
              >R</span>
              <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: '#f5c435' }}>
                תוצאה — מה בדיוק אתה רוצה להשיג היום?
              </p>
            </div>
            <textarea
              value={commitment}
              onChange={e => setCommitment(e.target.value)}
              placeholder="הדבר האחד שאם תעשה אותו — היום מנוצח."
              dir="rtl"
              rows={3}
              className="w-full rounded-2xl p-4 text-base font-semibold text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted placeholder:font-normal"
              style={{
                background: commitment.trim().length >= 5 ? 'rgba(245,196,53,0.04)' : 'rgba(255,255,255,0.03)',
                border: commitment.trim().length >= 5 ? '1px solid rgba(245,196,53,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>

          {/* P — Purpose */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}
              >P</span>
              <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: '#ef4444' }}>
                מטרה — למה זה חשוב לך בעמקי נשמתך?
              </p>
            </div>
            <textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="לא 'כי כדאי' — אלא 'כי אם לא אעשה את זה, אני...' "
              dir="rtl"
              rows={3}
              className="w-full rounded-2xl p-4 text-sm font-medium text-white resize-none outline-none transition-all leading-relaxed placeholder:text-muted"
              style={{
                background: purpose.trim().length >= 5 ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.03)',
                border: purpose.trim().length >= 5 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}
            />
          </div>

          {/* Energy */}
          <EnergySlider value={energy} onChange={setEnergy} label="רמת האנרגיה שלך עכשיו" size="lg" />
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
            gratitudes,
            vision,
            identity: identityLabel,
            purpose:  purpose.trim(),
            commitment: commitment.trim(),
            incantation,
            energyLevel: energy,
            completedAt: new Date().toISOString(),
          })
        }}
        completeLabel="יצאתי לדרך ⚡"
      />
    </div>
  )
}
