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
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
      <p className="label-xs mb-3" dir="rtl">🎙 הצהרה בקולך</p>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button onClick={startRec}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            style={{ borderRadius: 4 }} dir="rtl">
            <Mic className="w-3.5 h-3.5" /> {saved ? 'הקלט שוב' : 'הקלט'}
          </button>
        ) : (
          <button onClick={stopRec}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold animate-pulse-red"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 4 }}
            dir="rtl">
            <Square className="w-3.5 h-3.5" fill="#ef4444" /> עצור
          </button>
        )}
        {saved && !recording && (
          <button onClick={playRec}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', borderRadius: 4 }}
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

  const accentColor = coach.tone === 'fire' ? '#ef4444' : coach.tone === 'green' ? '#22c55e' : '#f5c435'

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
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="shrink-0 animate-fade-in" style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-start justify-between">

          {/* Left: day + week */}
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, color: accentColor }}>{dayCount}</span>
              <div>
                <p className="label-xs">יום</p>
                <p className="label-xs" style={{ color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>ש׳ {weekNum}/4</p>
              </div>
            </div>
            {/* Week dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ width: i < dayInWeek ? 16 : 6, height: 3, background: i < dayInWeek ? accentColor : 'rgba(255,255,255,0.12)', transition: 'width 0.3s' }} />
              ))}
            </div>
          </div>

          {/* Right: power word + rank */}
          <div style={{ textAlign: 'left' }}>
            <p className="label-xs mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>מילת הכוח</p>
            <h1 dir="rtl" style={{
              fontSize: 'clamp(2rem, 7vw, 3.5rem)',
              fontWeight: 900, lineHeight: 1,
              color: accentColor, letterSpacing: '-0.02em',
            }}>{powerWord}</h1>
            <div className="flex items-center gap-1.5 mt-2" style={{ justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.9rem' }}>{rank.emoji}</span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: rank.color, letterSpacing: '1px' }}>{rank.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCROLL AREA ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 120px' }}>

        {/* Yesterday win */}
        {lastWin && (
          <div className="animate-slide-up mx-5 mt-5" style={{ borderLeft: '3px solid #22c55e', paddingLeft: 14 }}>
            <p className="label-xs mb-1" style={{ color: '#22c55e' }}>אתמול ניצחת</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }} dir="rtl">{lastWin}</p>
          </div>
        )}

        {/* ── COACH ─────────────────────────────────────────────── */}
        <div className="animate-slide-up delay-1 mx-5 mt-5">
          <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 14 }}>
            <p className="label-xs mb-2" style={{ color: accentColor }}>
              {coach.tone === 'fire' ? '🔥' : coach.tone === 'green' ? '⚡' : '💎'} הודעה מהמאמן
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 6 }} dir="rtl">
              {coach.title}
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }} dir="rtl">
              {coach.body}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mt-5 divider" />

        {/* ── MISSIONS ──────────────────────────────────────────── */}
        <div className="animate-slide-up delay-2 mx-5 mt-5">
          <p className="label-xs mb-4" style={{ color: accentColor }}>{theme.title} — משימות חובה</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {requiredHabits.map((habit, i) => (
              <div key={habit.id} className="animate-slide-up"
                style={{
                  animationDelay: `${200 + i * 60}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', background: '#111',
                  borderLeft: `3px solid ${accentColor}`,
                }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: accentColor, minWidth: 16, textAlign: 'center' }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '1.3rem' }}>{habit.emoji}</span>
                <div dir="rtl" style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{habit.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{habit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-5 mt-5 divider" />

        {/* ── THE ONE THING ─────────────────────────────────────── */}
        <div className="animate-slide-up delay-3 mx-5 mt-5">
          <p className="label-xs mb-1" style={{ color: '#f5c435' }}>⭐ THE ONE THING</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.5 }} dir="rtl">
            מה הדבר האחד שאם תעשה אותו — הכל אחר יהיה קל יותר?
          </p>
          <input
            value={oneThing}
            onChange={e => { setOneThing(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="הדבר האחד…"
            dir="rtl"
            style={{
              width: '100%', padding: '13px 16px',
              background: oneThing.trim() ? 'rgba(245,196,53,0.06)' : '#111',
              border: `1px solid ${oneThing.trim() ? 'rgba(245,196,53,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none',
              borderRadius: 0,
            }}
          />
        </div>

        {/* ── EXTRA COMMITMENT ──────────────────────────────────── */}
        <div className="animate-slide-up delay-4 mx-5 mt-4">
          <p className="label-xs mb-2" dir="rtl" style={{ color: 'rgba(255,255,255,0.25)' }}>פעולה נוספת שלך</p>
          <input
            value={commitment}
            onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="התחייבות נוספת…"
            dir="rtl"
            style={{
              width: '100%', padding: '13px 16px',
              background: '#111', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none',
              borderRadius: 0,
            }}
          />
        </div>

        {/* ── INCANTATION RECORDER ─────────────────────────────── */}
        <div className="animate-slide-up delay-5 mx-5 mt-5">
          <IncantationRecorder saved={incantationB64} onSave={onSaveIncantation} />
        </div>

      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="shrink-0" style={{
        padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        borderTop: '2px solid rgba(255,255,255,0.12)',
        background: '#0a0a0a',
      }}>
        <button onClick={handleStart} dir="rtl"
          className="btn-red w-full flex items-center justify-center gap-3"
          style={{ padding: '18px', fontSize: 16, borderRadius: 0 }}>
          יוצא לדרך — יאללה
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
