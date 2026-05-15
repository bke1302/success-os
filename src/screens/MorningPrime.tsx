import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, ChevronRight } from 'lucide-react'
import { HABITS, getTodayPowerWord, getCommanderRank } from '../constants'
import { getCurrentWeekTheme, getTodayRequiredHabitIds, getProgramWeekNumber } from '../data/program'
import { getCoachMessage } from '../utils/coach'
import { playComplete, playCheck } from '../utils/sounds'
import { isRecordingSupported, startRecording, playBase64Audio } from '../utils/recorder'
import type { MorningEntry } from '../types'

interface Props {
  onComplete:         (data: MorningEntry) => void
  dayCount:           number
  streak:             number
  lastWin?:           string
  yesterdayHabitsPct: number
  incantationB64?:    string
  onSaveIncantation:  (b64: string) => void
}

function IncantationRecorder({ saved, onSave }: { saved?: string; onSave: (b64: string) => void }) {
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
      <p className="label-xs mb-3" dir="rtl">הצהרה בקולך</p>
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
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 12 }}
            dir="rtl">
            <Square className="w-3.5 h-3.5" fill="#ef4444" /> עצור
          </button>
        )}
        {saved && !recording && (
          <button onClick={playRec}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 12 }}
            dir="rtl">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'עצור' : 'נגן'}
          </button>
        )}
      </div>
    </div>
  )
}

export function MorningPrime({ onComplete, dayCount, streak, lastWin, yesterdayHabitsPct, incantationB64, onSaveIncantation }: Props) {
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

  const accentColor = '#FFD60A'

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
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#000' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
        <div className="flex items-start justify-between">

          {/* Left: day + week dots */}
          <div>
            <p className="label-xs mb-2">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display" style={{ fontSize: '3.5rem', lineHeight: 1, color: accentColor }}>{dayCount}</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e8e8f0' }}>יום</p>
                <p className="label-xs" style={{ marginTop: 2 }}>שבוע {weekNum}/4</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{
                  width: i < dayInWeek ? 18 : 6, height: 4, borderRadius: 2,
                  background: i < dayInWeek ? accentColor : '#2a2a3d',
                  transition: 'width 0.3s',
                }} />
              ))}
            </div>
          </div>

          {/* Right: power word + rank */}
          <div style={{ textAlign: 'right' }}>
            <p className="label-xs mb-1">מילת הכוח</p>
            <h1 dir="rtl" className="font-display" style={{
              fontSize: 'clamp(2.2rem, 8vw, 4rem)', lineHeight: 1, color: accentColor,
            }}>{powerWord}</h1>
            <div className="flex items-center gap-1.5 mt-2" style={{ justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#FFD60A', letterSpacing: 1, border: '1px solid rgba(255,214,10,.3)', borderRadius: 999, padding: '2px 8px' }}>{rank.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLL AREA ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 120px' }}>

        {/* Yesterday win */}
        {lastWin && (
          <div className="animate-slide-up card mb-4" style={{ borderRight: '3px solid #FFD60A' }}>
            <p className="label-xs mb-2" style={{ color: '#FFD60A' }}>אתמול ניצחת</p>
            <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.7)', lineHeight: 1.6 }} dir="rtl">{lastWin}</p>
          </div>
        )}

        {/* Coach */}
        <div className="animate-slide-up delay-1 card mb-4" style={{ borderRight: `3px solid ${accentColor}` }}>
          <p className="label-xs mb-2" style={{ color: accentColor }}>
            הודעה מהמאמן
          </p>
          <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 19, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 8 }} dir="rtl">
            {coach.title}
          </p>
          <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.65 }} dir="rtl">
            {coach.body}
          </p>
        </div>

        {/* Missions */}
        <div className="animate-slide-up delay-2 card mb-4">
          <p className="label-xs mb-4" style={{ color: accentColor }}>{theme.title} — משימות חובה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {requiredHabits.map((habit, i) => (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${200 + i * 60}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.09)', borderRadius: 10,
                  borderRight: `3px solid ${accentColor}`,
                }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: accentColor, minWidth: 16, textAlign: 'center', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '1px' }}>{i + 1}</span>
                <div dir="rtl" style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0' }}>{habit.title}</p>
                  <p style={{ fontSize: 11, color: '#6b6b8a', marginTop: 2 }}>{habit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THE ONE THING */}
        <div className="animate-slide-up delay-3 card mb-4">
          <p className="label-xs mb-1" style={{ color: '#f5c435' }}>THE ONE THING</p>
          <p style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 12, lineHeight: 1.5 }} dir="rtl">
            מה הדבר האחד שאם תעשה אותו — הכל אחר יהיה קל יותר?
          </p>
          <input
            value={oneThing}
            onChange={e => { setOneThing(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="הדבר האחד…"
            dir="rtl"
            className="input-field"
            style={{ borderColor: oneThing.trim() ? 'rgba(245,196,53,0.4)' : '#2a2a3d' }}
          />
        </div>

        {/* Extra commitment */}
        <div className="animate-slide-up delay-4 card mb-4">
          <p className="label-xs mb-2" dir="rtl">פעולה נוספת שלך</p>
          <input
            value={commitment}
            onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="התחייבות נוספת…"
            dir="rtl"
            className="input-field"
          />
        </div>

        {/* Incantation recorder */}
        <div className="animate-slide-up delay-5 card">
          <IncantationRecorder saved={incantationB64} onSave={onSaveIncantation} />
        </div>

      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="shrink-0" style={{
        padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: '1px solid rgba(255,255,255,.09)', background: '#000',
      }}>
        <button onClick={handleStart} dir="rtl"
          style={{
            width: '100%', padding: '18px', fontSize: 17,
            fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 900,
            background: '#FFD60A', color: '#000',
            border: 'none', borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            letterSpacing: '-.2px',
          }}>
          יוצא לדרך
          <ChevronRight style={{ width: 20, height: 20 }} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
