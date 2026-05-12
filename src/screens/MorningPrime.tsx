import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause } from 'lucide-react'
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

// ── Incantation Recorder ───────────────────────────────────────────────────────
function IncantationRecorder({ saved, onSave }: { saved?: string; onSave: (b64: string) => void }) {
  const [recording, setRecording]   = useState(false)
  const [playing,   setPlaying]     = useState(false)
  const [hasNew,    setHasNew]      = useState(false)
  const stopRef  = useRef<(() => void) | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!isRecordingSupported()) return null

  const startRec = async () => {
    setRecording(true)
    stopRef.current = await startRecording(b64 => {
      onSave(b64)
      setHasNew(true)
      setRecording(false)
    })
  }

  const stopRec = () => {
    stopRef.current?.()
    stopRef.current = null
  }

  const playRec = () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return }
    if (!saved)  return
    const audio = playBase64Audio(saved)
    audioRef.current = audio
    setPlaying(true)
    audio.onended = () => setPlaying(false)
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.22)' }}>
      <p className="text-[7px] tracking-[4px] uppercase font-black mb-2" style={{ color: 'rgba(139,92,246,0.9)' }} dir="rtl">
        🎙 הקלט את ההצהרה בקולך
      </p>
      <p className="text-xs text-sub mb-3" dir="rtl">
        הקול שלך על עצמך הוא הכלי החזק ביותר. שמע את עצמך אומר מי אתה.
      </p>
      <div className="flex items-center gap-2">
        {!recording ? (
          <button
            onClick={startRec}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: 'rgba(139,92,246,0.9)' }}
            dir="rtl"
          >
            <Mic className="w-3.5 h-3.5" />
            {saved || hasNew ? 'הקלט שוב' : 'הקלט'}
          </button>
        ) : (
          <button
            onClick={stopRec}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs animate-pulse"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
            dir="rtl"
          >
            <Square className="w-3.5 h-3.5" fill="#ef4444" />
            עצור הקלטה
          </button>
        )}
        {(saved || hasNew) && !recording && (
          <button
            onClick={playRec}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}
            dir="rtl"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'עצור' : 'נגן'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
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

  const toneColor = coach.tone === 'fire' ? '#ef4444' : coach.tone === 'green' ? '#22c55e' : '#f5c435'
  const toneGlow  = coach.tone === 'fire' ? 'rgba(239,68,68,0.35)' : coach.tone === 'green' ? 'rgba(34,197,94,0.3)' : 'rgba(245,196,53,0.35)'

  const handleStart = () => {
    playComplete()
    onComplete({
      gratitudes: ['', '', ''], vision: ['', '', ''],
      identity: theme.title, purpose: theme.desc,
      commitment: commitment.trim() || 'ביצוע תוכנית היום',
      oneThing:   oneThing.trim() || undefined,
      incantation: '', energyLevel: 7,
      completedAt: new Date().toISOString(),
    })
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#080810', position: 'relative' }}>

      {/* Ambient orbs */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${toneGlow} 0%, transparent 70%)`,
          filter: 'blur(40px)', animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '-12%',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)', animation: 'float 8s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Top bar */}
      <div className="shrink-0 animate-fade-in" style={{ position: 'relative', zIndex: 1, padding: '28px 20px 16px' }}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-black leading-none" style={{ fontSize: '2rem', color: toneColor, lineHeight: 1 }}>{dayCount}</span>
              <span className="text-[8px] tracking-[4px] uppercase text-muted font-bold">יום</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-[7px] tracking-[2px] uppercase text-muted mr-1">ש׳ {weekNum}/4</span>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ height: 4, borderRadius: 2, width: i < dayInWeek ? 14 : 5, background: i < dayInWeek ? theme.color : 'rgba(255,255,255,0.1)', transition: 'width 0.4s ease' }} />
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p className="text-[7px] tracking-[4px] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>מילת הכוח</p>
            <h1 dir="rtl" className="font-black" style={{
              fontSize: 'clamp(1.6rem, 6vw, 2.8rem)', lineHeight: 1,
              background: `linear-gradient(135deg, ${toneColor} 0%, ${toneColor}66 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: `drop-shadow(0 0 20px ${toneGlow})`,
            }}>
              {powerWord}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-2" style={{ background: `${rank.color}14`, border: `1px solid ${rank.color}28` }}>
            <span style={{ fontSize: '1.1rem' }}>{rank.emoji}</span>
            <span className="text-xs font-black" style={{ color: rank.color }}>{rank.rank}</span>
          </div>
        </div>
        <div style={{ height: 1, marginTop: 14, background: `linear-gradient(to right, ${toneColor}50, transparent 60%)` }} />
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto" style={{ position: 'relative', zIndex: 1, padding: '12px 20px 140px' }}>

        {/* Yesterday win */}
        {lastWin && (
          <div className="animate-slide-up delay-1 rounded-2xl p-4 flex gap-3 mb-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <span className="text-xl shrink-0">🏆</span>
            <div dir="rtl">
              <p className="text-[7px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#22c55e' }}>אתמול ניצחת</p>
              <p className="text-sm text-white leading-relaxed">{lastWin}</p>
            </div>
          </div>
        )}

        {/* Coach card */}
        <div className="animate-slide-up delay-2 rounded-3xl overflow-hidden mb-4" style={{
          background: `linear-gradient(145deg, ${toneColor}0f, rgba(13,13,26,0.98))`,
          border: `1px solid ${toneColor}28`,
          boxShadow: `0 4px 40px ${toneGlow}40, inset 0 1px 0 ${toneColor}15`,
        }}>
          <div style={{ height: 2, background: `linear-gradient(90deg, ${toneColor}, ${toneColor}00)` }} />
          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl animate-float shrink-0">{coach.tone === 'fire' ? '🔥' : coach.tone === 'green' ? '⚡' : '💎'}</span>
              <div dir="rtl" className="flex-1">
                <p className="text-[7px] tracking-[5px] uppercase font-black mb-2" style={{ color: toneColor }}>הודעה מהמאמן</p>
                <p className="text-lg font-black text-white leading-snug mb-1.5">{coach.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{coach.body}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Missions */}
        <div className="animate-slide-up delay-3 mb-4">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div style={{ width: 3, height: 16, borderRadius: 2, background: theme.color, flexShrink: 0 }} />
            <p className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: theme.color }}>{theme.title} — משימות חובה</p>
          </div>
          <div className="flex flex-col gap-2">
            {requiredHabits.map((habit, i) => (
              <div key={habit.id} className="animate-slide-up flex items-center gap-3.5 rounded-2xl px-4 py-3.5 relative overflow-hidden"
                style={{ animationDelay: `${280 + i * 70}ms`, animationFillMode: 'both', background: 'rgba(255,255,255,0.025)', border: `1px solid ${theme.color}20`, borderLeft: `3px solid ${theme.color}` }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 100% 50%, ${theme.color}08, transparent 70%)`, pointerEvents: 'none' }} />
                <span className="text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${theme.color}22`, color: theme.color }}>{i + 1}</span>
                <span className="text-xl shrink-0">{habit.emoji}</span>
                <div dir="rtl" className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{habit.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{habit.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THE ONE THING */}
        <div className="animate-slide-up delay-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(245,196,53,0.05)', border: '1px solid rgba(245,196,53,0.18)' }}>
            <p className="text-[7px] tracking-[4px] uppercase font-black mb-1" style={{ color: '#f5c435' }} dir="rtl">⭐ THE ONE THING</p>
            <p className="text-xs text-sub mb-3" dir="rtl">
              מה הדבר האחד שאם תעשה אותו היום — הכל אחר יהיה קל יותר?
            </p>
            <input
              value={oneThing}
              onChange={e => { setOneThing(e.target.value); if (e.target.value.length === 1) playCheck() }}
              placeholder="הדבר האחד שחייב לקרות היום…"
              dir="rtl"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none transition-all"
              style={{
                background: oneThing.trim() ? 'rgba(245,196,53,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${oneThing.trim() ? 'rgba(245,196,53,0.35)' : 'rgba(255,255,255,0.07)'}`,
              }}
            />
          </div>
        </div>

        {/* Extra commitment */}
        <div className="animate-slide-up delay-5 mb-4">
          <p className="text-[8px] tracking-[4px] uppercase font-bold mb-2 px-1" style={{ color: 'rgba(255,255,255,0.3)' }} dir="rtl">מה אתה מוסיף מעצמך?</p>
          <input
            value={commitment}
            onChange={e => { setCommitment(e.target.value); if (e.target.value.length === 1) playCheck() }}
            placeholder="פעולה נוספת שאתה לוקח על עצמך..."
            dir="rtl"
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-white outline-none transition-all"
            style={{
              background: commitment.trim() ? 'rgba(245,196,53,0.06)' : 'rgba(255,255,255,0.03)',
              border: commitment.trim() ? '1px solid rgba(245,196,53,0.35)' : '1px solid rgba(255,255,255,0.07)',
            }}
          />
        </div>

        {/* Incantation recorder */}
        <div className="animate-slide-up delay-6 mb-4">
          <IncantationRecorder saved={incantationB64} onSave={onSaveIncantation} />
        </div>

      </div>

      {/* CTA */}
      <div className="shrink-0" style={{
        position: 'relative', zIndex: 2,
        padding: '12px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, rgba(8,8,16,1) 0%, rgba(8,8,16,0.97) 80%, transparent 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={handleStart} dir="rtl"
          className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${toneColor}, ${toneColor}cc)`,
            color: coach.tone === 'gold' ? '#000' : '#fff',
            boxShadow: `0 0 32px ${toneGlow}, 0 4px 16px rgba(0,0,0,0.4)`,
          }}>
          יוצא לדרך — יאללה 🚀
        </button>
      </div>
    </div>
  )
}
