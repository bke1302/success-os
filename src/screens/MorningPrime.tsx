import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, ChevronRight, ChevronLeft, Target } from 'lucide-react'
import { HABITS, getTodayPowerWord, getCommanderRank } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds, getProgramWeekNumber } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete, playCheck } from '../utils/sounds'
import { isRecordingSupported, startRecording, playBase64Audio } from '../utils/recorder'
import type { MorningEntry, UserGoal, DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { StepDots } from '../components/StepDots'

const GOAL_COLORS: Record<UserGoal['category'], string> = {
  'עסקי':   '#FBBF24',
  'כספי':   '#4ADE80',
  'בריאות': '#FF5C5C',
  'קשרים':  '#A78BFA',
  'אישי':   '#FB923C',
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
  entries?:           DayEntry[]
  onGoToProfile:      () => void
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
      <div style={{ display: 'flex', gap: 8 }}>
        {!recording ? (
          <button onClick={startRec}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: T.textSub }}
            dir="rtl">
            <Mic style={{ width: 14, height: 14 }} /> {saved ? 'הקלט שוב' : 'הקלט'}
          </button>
        ) : (
          <button onClick={stopRec}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,92,92,.1)', border: '1px solid #FF5C5C', borderRadius: 12, cursor: 'pointer', color: '#FF5C5C', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
            dir="rtl">
            <Square style={{ width: 14, height: 14 }} fill="#FF5C5C" /> עצור
          </button>
        )}
        {saved && !recording && (
          <button onClick={playRec}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 12, cursor: 'pointer', color: '#4ADE80', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700 }}
            dir="rtl">
            {playing ? <Pause style={{ width: 14, height: 14 }} /> : <Play style={{ width: 14, height: 14 }} />}
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

  const STEP_LABELS = ['הכנה', 'משימות', 'ONE THING', 'יוצאים']

  const next = () => { playCheck(); setStep(s => Math.min(s + 1, 4) as 1|2|3|4) }
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

  // Hero gradient per step
  const STEP_GRADIENTS = [
    'linear-gradient(135deg, rgba(251,191,36,.85) 0%, rgba(251,146,60,.7) 55%, rgba(91,140,255,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)',
    'linear-gradient(135deg, rgba(91,140,255,.85) 0%, rgba(139,92,246,.65) 55%, rgba(74,222,128,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)',
    'linear-gradient(135deg, rgba(74,222,128,.8) 0%, rgba(16,185,129,.6) 55%, rgba(91,140,255,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)',
    'linear-gradient(135deg, rgba(167,139,250,.85) 0%, rgba(91,140,255,.65) 55%, rgba(74,222,128,.15) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)',
  ]
  const STEP_BORDERS = [
    'rgba(251,191,36,.25)', 'rgba(91,140,255,.25)', 'rgba(74,222,128,.25)', 'rgba(167,139,250,.25)'
  ]
  const STEP_SHADOWS = [
    '0 8px 32px rgba(251,191,36,.12)', '0 8px 32px rgba(91,140,255,.12)', '0 8px 32px rgba(74,222,128,.1)', '0 8px 32px rgba(167,139,250,.12)'
  ]
  const STEP_WATERMARKS = ['⚡', '📋', '🎯', '🚀']

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── Scrollable: hero + step content ── */}
      <div key={step} className="animate-slide-up" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

        {/* Hero */}
        <div style={{ padding: '16px 16px 14px' }}>
        <div className="today-hero" style={{
          background: T.isDark ? STEP_GRADIENTS[step - 1] : STEP_GRADIENTS[step - 1].replace('180deg, #111318 0%, #1a1c24', '180deg, #f8f9ff 0%, #f0f4ff'),
          border: `1px solid ${STEP_BORDERS[step - 1]}`,
          boxShadow: STEP_SHADOWS[step - 1],
          transition: 'background .4s, border-color .4s, box-shadow .4s',
        }}>
          {/* Watermark */}
          <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '6.5rem', opacity: .045, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>{STEP_WATERMARKS[step - 1]}</div>

          {/* Top row: back + step label + rank */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {step > 1 && (
                <button onClick={back} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft style={{ width: 16, height: 16, color: '#fff' }} strokeWidth={2} />
                </button>
              )}
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', margin: 0 }}>
                {step}/{4} — {STEP_LABELS[step - 1]}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,.5)' }}>יום {dayCount}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: '#FBBF24', letterSpacing: '1px', border: '1px solid rgba(251,191,36,.3)', borderRadius: 999, padding: '2px 8px' }}>{rank.rank}</span>
            </div>
          </div>

          {/* Step title */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.6rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.25)' }} dir="rtl">
            {step === 1 && powerWord}
            {step === 2 && 'המשימות שלך'}
            {step === 3 && 'הדבר האחד'}
            {step === 4 && 'ההתחייבות'}
          </p>

          {/* Progress bar + step dots */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: 14 }}>
            <StepDots step={step} total={4} activeWidth={24} />
            <div style={{ height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(step / 4) * 100}%`, background: 'rgba(255,255,255,.8)', borderRadius: 2, transition: 'width .4s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 8px rgba(255,255,255,.3)' }} />
            </div>
          </div>
        </div>
        </div>

        {/* ── Step content ── */}
        <div style={{ padding: '0 16px' }}>

        {/* STEP 1: הכנה */}
        {step === 1 && (
          <>
            {/* Week progress */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', marginBottom: 12, animation: 'cardStagger .38s var(--ease-out) .05s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }} dir="rtl">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>{theme.title}</p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: '1px' }}>שבוע {weekNum}/4 · יום {dayInWeek}/7</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < dayInWeek ? '#FBBF24' : T.border2, transition: 'background .3s' }} />
                ))}
              </div>
            </div>

            {/* Coach message */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid #FBBF24', borderRadius: 18, padding: '16px 18px', marginBottom: 12, animation: 'cardStagger .38s var(--ease-out) .1s both' }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FBBF24', textTransform: 'uppercase', marginBottom: 8 }}>הודעה מהמאמן</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 800, color: T.text, lineHeight: 1.25, marginBottom: 8, letterSpacing: '-.3px' }} dir="rtl">{coach.title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65 }} dir="rtl">{coach.body}</p>
            </div>

            {/* Last win */}
            {lastWin && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid rgba(251,191,36,.4)', borderRadius: 18, padding: '16px 18px', animation: 'cardStagger .38s var(--ease-out) .15s both' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(251,191,36,.6)', textTransform: 'uppercase', marginBottom: 8 }}>אתמול ניצחת</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.textSub, lineHeight: 1.6 }} dir="rtl">{lastWin}</p>
              </div>
            )}
          </>
        )}

        {/* STEP 2: משימות */}
        {step === 2 && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 16 }} dir="rtl">{theme.desc}</p>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
              {requiredHabits.map((habit, i) => (
                <div key={habit.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '15px 18px',
                  borderBottom: i < requiredHabits.length - 1 ? `1px solid ${T.divider}` : 'none',
                  borderRight: '3px solid #5B8CFF',
                  direction: 'rtl',
                  animation: `sentenceIn .35s cubic-bezier(.16,1,.3,1) ${i * 60}ms both`,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(91,140,255,.12)', border: '1px solid rgba(91,140,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 900, color: '#5B8CFF' }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>{habit.title}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, marginTop: 3, lineHeight: 1.4, margin: '3px 0 0' }}>{habit.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* STEP 3: ONE THING */}
        {step === 3 && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 16 }} dir="rtl">
              מה הדבר האחד שאם תעשה אותו היום — הכל אחר יהיה קל יותר?
            </p>

            {userGoals.length > 0 ? (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>לקראת מה אתה עובד?</p>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
                  {userGoals.slice(0, 3).map((g, i) => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < Math.min(userGoals.length, 3) - 1 ? `1px solid ${T.divider}` : 'none', direction: 'rtl' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOAL_COLORS[g.category], flexShrink: 0 }} />
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textSub, margin: 0 }} dir="rtl">{g.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={onGoToProfile}
                style={{ width: '100%', marginBottom: 14, padding: '12px 16px', background: 'rgba(251,191,36,.05)', border: '1px dashed rgba(251,191,36,.22)', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: T.textMuted, fontFamily: 'Inter, sans-serif', fontSize: 13 }}
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
                width: '100%', padding: '16px',
                fontFamily: 'Inter, sans-serif',
                background: oneThing.trim() ? 'rgba(91,140,255,.05)' : T.tagBg,
                border: `1.5px solid ${oneThing.trim() ? 'rgba(91,140,255,.5)' : T.border}`,
                color: T.text, fontSize: 17, fontWeight: 700, lineHeight: 1.6,
                resize: 'none', outline: 'none', borderRadius: 14,
                transition: 'border-color .2s',
              }}
            />
          </>
        )}

        {/* STEP 4: יוצאים */}
        {step === 4 && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textMuted, lineHeight: 1.65, marginBottom: 16 }} dir="rtl">
              מה ההתחייבות הנוספת שלך להיום?
            </p>
            <input
              value={commitment}
              onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
              placeholder="התחייבות נוספת…"
              dir="rtl"
              className="input-field"
              style={{ fontSize: 16, padding: '16px', marginBottom: 16, borderColor: commitment.trim() ? 'rgba(167,139,250,.45)' : T.border }}
            />
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px' }}>
              <IncantationRecorder saved={incantationB64} onSave={onSaveIncantation} />
            </div>
          </>
        )}
        </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px' }}>
        {step < 4 ? (
          <button onClick={next} dir="rtl" className="btn-gold w-full"
            style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '-.1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            המשך
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </button>
        ) : (
          <button onClick={handleStart} dir="rtl" className="btn-blue w-full"
            style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '-.1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            יוצא לדרך
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          </button>
        )}
        </div>
      </div>
    </div>
  )
}
