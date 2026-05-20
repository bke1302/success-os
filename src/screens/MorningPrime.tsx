import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, ChevronRight, ChevronLeft, Target } from 'lucide-react'
import { HABITS, getTodayPowerWord, getCommanderRank } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds, getProgramWeekNumber } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete, playCheck } from '../utils/sounds'
import { isRecordingSupported, startRecording, playBase64Audio } from '../utils/recorder'
import type { MorningEntry, UserGoal } from '../types'
import { useTheme } from '../contexts/ThemeContext'

const GOAL_COLORS: Record<UserGoal['category'], string> = {
  'עסקי':   '#FFD60A',
  'כספי':   '#30D158',
  'בריאות': '#FF375F',
  'קשרים':  '#BF5AF2',
  'אישי':   '#FF9F0A',
}

interface Props {
  onComplete:         (data: MorningEntry) => void
  dayCount:           number
  streak:             number
  lastWin?:           string
  yesterdayHabitsPct: number
  incantationB64?:    string
  onSaveIncantation:  (b64: string) => void
  userGoals?:         UserGoal[]
  onGoToProfile:      () => void
}

function StepDots({ step, total }: { step: number; total: number }) {
  const T = useTheme()
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i + 1 === step ? 20 : 6, height: 6, borderRadius: 3,
          background: i + 1 < step ? '#4ADE80' : i + 1 === step ? '#5B8CFF' : T.border2,
          transition: 'all .3s cubic-bezier(.16,1,.3,1)',
        }} />
      ))}
    </div>
  )
}

function IncantationRecorder({ saved, onSave }: { saved?: string; onSave: (b64: string) => void }) {
  const T = useTheme()
  const [recording, setRecording] = useState(false)
  const [playing,   setPlaying]   = useState(false)
  const stopRef  = useRef<(() => void) | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!isRecordingSupported()) return null

  const startRec = async () => {
    setRecording(true)
    stopRef.current = await startRecording(b64 => { onSave(b64); setRecording(false) })
  }
  const stopRec = () => { stopRef.current?.(); stopRef.current = null }
  const playRec = () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return }
    if (!saved)  return
    const a = playBase64Audio(saved); audioRef.current = a; setPlaying(true)
    a.onended = () => setPlaying(false)
  }

  return (
    <div>
      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>הצהרה בקולך</p>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button onClick={startRec}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            dir="rtl">
            <Mic className="w-3.5 h-3.5" /> {saved ? 'הקלט שוב' : 'הקלט'}
          </button>
        ) : (
          <button onClick={stopRec}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold animate-pulse-red"
            style={{ background: 'rgba(255,92,92,0.12)', border: '1px solid #FF5C5C', color: '#FF5C5C', borderRadius: 12 }}
            dir="rtl">
            <Square className="w-3.5 h-3.5" fill="#FF5C5C" /> עצור
          </button>
        )}
        {saved && !recording && (
          <button onClick={playRec}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: T.isDark ? '#FFD60A' : '#8B6800', borderRadius: 12 }}
            dir="rtl">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'עצור' : 'נגן'}
          </button>
        )}
      </div>
    </div>
  )
}

export function MorningPrime({ onComplete, dayCount, streak, lastWin, yesterdayHabitsPct, incantationB64, onSaveIncantation, userGoals = [], onGoToProfile }: Props) {
  const T = useTheme()
  const [step,       setStep]       = useState<1|2|3|4>(1)
  const [commitment, setCommitment] = useState('')
  const [oneThing,   setOneThing]   = useState('')

  const theme          = getCurrentWeekTheme(dayCount)
  const weekNum        = getProgramWeekNumber(dayCount)
  const dayInWeek      = ((dayCount - 1) % 7) + 1
  const requiredIds    = getTodayRequiredHabitIds(dayCount)
  const requiredHabits = requiredIds
    .map(id => HABITS.find(h => h.id === id))
    .filter((h): h is typeof HABITS[number] => h !== undefined)

  const coach     = getCoachMessage({ streak, dayCount, yesterdayHabitsPct, currentHour: new Date().getHours() })
  const powerWord = getTodayPowerWord()
  const rank      = getCommanderRank(streak)
  const accentColor = T.isDark ? '#FFD60A' : '#8B6800'

  const next = () => {
    playCheck()
    setStep(s => Math.min(s + 1, 4) as 1|2|3|4)
  }
  const back = () => setStep(s => Math.max(s - 1, 1) as 1|2|3|4)

  const handleStart = () => {
    playComplete()
    onComplete({
      gratitudes: ['','',''], vision: ['','',''],
      identity: theme.title, purpose: theme.desc,
      commitment: commitment.trim() || 'ביצוע תוכנית היום',
      oneThing:   oneThing.trim() || undefined,
      incantation: '', energyLevel: 7,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="shrink-0" style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step > 1 && (
              <button onClick={back} style={{ background: T.tagBg, border: `1px solid ${T.border}`, borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textMuted }}>
                <ChevronLeft style={{ width: 16, height: 16 }} strokeWidth={2} />
              </button>
            )}
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>
              {step === 1 && 'הכנה'}
              {step === 2 && 'המשימות'}
              {step === 3 && 'ONE THING'}
              {step === 4 && 'יוצאים'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: accentColor, letterSpacing: 1, border: '1px solid rgba(255,214,10,.3)', borderRadius: 999, padding: '2px 8px', fontFamily: 'Barlow Condensed, sans-serif' }}>{rank.rank}</span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, color: T.textDim }}>יום {dayCount}</span>
          </div>
        </div>
        <StepDots step={step} total={4} />
        {/* Progress bar */}
        <div style={{ height: 3, background: T.border, borderRadius: 2, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: '#5B8CFF', borderRadius: 2, transition: 'width .4s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 8px rgba(91,140,255,.4)' }} />
        </div>
      </div>

      {/* ── STEP CONTENT ─────────────────────────────────────────── */}
      <div key={step} className="flex-1 overflow-y-auto animate-slide-up" style={{ padding: '24px 20px 68px' }}>

        {/* STEP 1: הכנה */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', textTransform: 'uppercase', marginBottom: 8 }}>מילת הכוח של היום</p>
              <h1 className="power-word-in power-word-pulse" style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 'clamp(3rem, 14vw, 5rem)', fontWeight: 900, lineHeight: 1, color: accentColor, letterSpacing: '-2px' }} dir="rtl">{powerWord}</h1>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: '1.5px', marginTop: 8 }}>
                שבוע {weekNum}/4 · יום {dayInWeek}/7
              </p>
              <div className="flex gap-1.5" style={{ justifyContent: 'center', marginTop: 10 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} style={{
                    width: i < dayInWeek ? 18 : 6, height: 4, borderRadius: 2,
                    background: i < dayInWeek ? accentColor : T.border2,
                    transition: 'width 0.3s',
                  }} />
                ))}
              </div>
            </div>

            <div className="card mb-4" style={{ borderRight: `3px solid ${accentColor}` }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>הודעה מהמאמן</p>
              <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 19, fontWeight: 900, color: T.text, lineHeight: 1.25, marginBottom: 8 }} dir="rtl">{coach.title}</p>
              <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65 }} dir="rtl">{coach.body}</p>
            </div>

            {lastWin && (
              <div className="card" style={{ borderRight: '3px solid rgba(255,214,10,.4)' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>אתמול ניצחת</p>
                <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }} dir="rtl">{lastWin}</p>
              </div>
            )}
          </>
        )}

        {/* STEP 2: המשימות */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 6 }}>{theme.title}</p>
              <h2 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 'clamp(1.8rem, 7vw, 2.8rem)', fontWeight: 900, color: T.text, lineHeight: 1.1, marginBottom: 4 }} dir="rtl">המשימות שלך היום</h2>
              <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, color: T.textMuted, lineHeight: 1.5 }} dir="rtl">{theme.desc}</p>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
              {requiredHabits.map((habit, i) => (
                <div key={habit.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '15px 16px',
                    borderBottom: i < requiredHabits.length - 1 ? `1px solid ${T.divider}` : 'none',
                    borderRight: `3px solid ${accentColor}`,
                    animation: `sentenceIn .35s cubic-bezier(.16,1,.3,1) ${i * 60}ms both`,
                    direction: 'rtl',
                  }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: accentColor, minWidth: 20, textAlign: 'center', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '1px' }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{habit.title}</p>
                    <p style={{ fontSize: 12, color: T.textMuted, marginTop: 3, lineHeight: 1.4 }}>{habit.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: ONE THING */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>THE ONE THING</p>
              <h2 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 'clamp(1.8rem, 7vw, 2.8rem)', fontWeight: 900, color: T.text, lineHeight: 1.15, marginBottom: 10 }} dir="rtl">מה הדבר האחד?</h2>
              <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65 }} dir="rtl">
                מה הדבר האחד שאם תעשה אותו היום — הכל אחר יהיה קל יותר?
              </p>
            </div>

            {userGoals.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>לקראת מה אתה עובד?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {userGoals.slice(0, 3).map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${GOAL_COLORS[g.category]}0d`, border: `1px solid ${GOAL_COLORS[g.category]}28`, borderRadius: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOAL_COLORS[g.category], flexShrink: 0 }} />
                      <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textSub }} dir="rtl">{g.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={onGoToProfile}
                style={{ width: '100%', marginBottom: 16, padding: '12px 16px', background: 'rgba(255,214,10,.06)', border: '1px dashed rgba(255,214,10,.25)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', fontFamily: 'Heebo, sans-serif', fontSize: 13 }}
                dir="rtl">
                <Target style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.5} />
                טרם הגדרת יעדים — לחץ להגדרה בפרופיל
              </button>
            )}

            <textarea
              value={oneThing}
              onChange={e => { setOneThing(e.target.value); if (e.target.value.length === 1) playCheck() }}
              placeholder="הדבר האחד שלי היום…"
              dir="rtl"
              rows={4}
              autoFocus
              style={{
                width: '100%', padding: '16px', fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                background: oneThing.trim() ? 'rgba(91,140,255,.05)' : T.tagBg,
                border: `1.5px solid ${oneThing.trim() ? 'rgba(91,140,255,.5)' : T.border}`,
                color: T.text, fontSize: 18, fontWeight: 700, lineHeight: 1.6, resize: 'none', outline: 'none', borderRadius: 14,
                transition: 'border-color .2s',
              }}
            />
          </>
        )}

        {/* STEP 4: יוצאים */}
        {step === 4 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>פעולה נוספת</p>
              <h2 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 'clamp(1.8rem, 7vw, 2.8rem)', fontWeight: 900, color: T.text, lineHeight: 1.1, marginBottom: 12 }} dir="rtl">ההתחייבות שלך</h2>
              <input
                value={commitment}
                onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
                placeholder="התחייבות נוספת…"
                dir="rtl"
                className="input-field"
                style={{ fontSize: 16, padding: '16px', borderColor: commitment.trim() ? 'rgba(255,214,10,.35)' : T.border }}
              />
            </div>
            <div className="card">
              <IncantationRecorder saved={incantationB64} onSave={onSaveIncantation} />
            </div>
          </>
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="shrink-0" style={{
        padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: `1px solid ${T.border}`, background: T.bgRaised, transition: 'background .3s',
      }}>
        {step < 4 ? (
          <button onClick={next} dir="rtl"
            className="btn-gold w-full"
            style={{ padding: '18px', fontSize: 17, fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 900, letterSpacing: '-.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            המשך
            <ChevronRight style={{ width: 20, height: 20 }} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={handleStart} dir="rtl"
            className="btn-blue w-full"
            style={{ padding: '18px', fontSize: 17, fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 900, letterSpacing: '-.2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            יוצא לדרך
            <ChevronRight style={{ width: 20, height: 20 }} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
