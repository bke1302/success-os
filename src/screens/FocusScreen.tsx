import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { playComplete, playCheck } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'
import { todayKey } from '../hooks/useAppData'

const SESSIONS_KEY = () => `focus_sessions_${todayKey()}`

export function getTodayFocusSessions(): number {
  return Number(localStorage.getItem(SESSIONS_KEY()) ?? 0)
}

type Phase = 'work' | 'short-break' | 'long-break'

const PHASES: Record<Phase, { label: string; duration: number; color: string; sub: string }> = {
  'work':        { label: 'ריכוז',       duration: 25 * 60, color: '#5B8CFF', sub: 'הפסקות אחר כך. עכשיו — מיקוד מלא.' },
  'short-break': { label: 'הפסקה קצרה', duration:  5 * 60, color: '#4ADE80', sub: 'נשום. שתה מים. תחזור חזק.' },
  'long-break':  { label: 'הפסקה ארוכה', duration: 15 * 60, color: '#BF5AF2', sub: 'סיימת 4 סשנים. מגיע לך לנוח.' },
}

const MOTIVATIONAL: Record<Phase, string[]> = {
  'work': [
    'הסחות הדעת הן בחירה. הריכוז גם.',
    'כל דקה שאתה נשאר — אתה מנצח.',
    'מי שמתמקד מנצח את מי שעובד קשה.',
    'הסשן הזה יקבע את השעה הבאה שלך.',
  ],
  'short-break': [
    'הפסקה קצרה היא חלק מהעבודה.',
    'הטוב ביותר עוד לפניך.',
  ],
  'long-break': [
    'אלוף.',
    '4 סשנים. לא כולם מגיעים לכאן.',
  ],
}

export function FocusScreen() {
  const T = useTheme()
  const [phase,      setPhase]      = useState<Phase>('work')
  const [sessionNum, setSessionNum] = useState(1)           // 1-4 in current set
  const [timeLeft,   setTimeLeft]   = useState(PHASES['work'].duration)
  const [running,    setRunning]    = useState(false)
  const [todaySessions, setTodaySessions] = useState(getTodayFocusSessions)
  const [quoteIdx,   setQuoteIdx]   = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { label, duration, color, sub } = PHASES[phase]
  const pct  = 1 - timeLeft / duration
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  // SVG ring
  const r    = 80
  const circ = 2 * Math.PI * r

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          handlePhaseEnd()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate motivational quote every 90s during work
  useEffect(() => {
    if (phase !== 'work' || !running) return
    const id = setInterval(() => {
      setQuoteIdx(i => (i + 1) % MOTIVATIONAL['work'].length)
    }, 90_000)
    return () => clearInterval(id)
  }, [phase, running])

  function handlePhaseEnd() {
    playComplete()
    setRunning(false)

    if (phase === 'work') {
      // Completed a work session
      const next = sessionNum + 1
      const newTotal = getTodayFocusSessions() + 1
      localStorage.setItem(SESSIONS_KEY(), String(newTotal))
      setTodaySessions(newTotal)

      if (sessionNum >= 4) {
        setSessionNum(1)
        setPhase('long-break')
        setTimeLeft(PHASES['long-break'].duration)
      } else {
        setSessionNum(next)
        setPhase('short-break')
        setTimeLeft(PHASES['short-break'].duration)
      }
    } else {
      // Break ended → back to work
      setPhase('work')
      setTimeLeft(PHASES['work'].duration)
      setQuoteIdx(0)
    }
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setPhase('work')
    setSessionNum(1)
    setTimeLeft(PHASES['work'].duration)
    setQuoteIdx(0)
  }

  function toggle() {
    if (timeLeft === 0) return
    if (!running) playCheck()
    setRunning(r => !r)
  }

  return (
    <div style={{
      height: '100%', overflow: 'hidden',
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 28px 68px',
      transition: 'background .3s',
      position: 'relative',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw', height: '80vw',
        background: `radial-gradient(circle, ${color}18 0%, transparent 65%)`,
        pointerEvents: 'none',
        transition: 'background 1s',
      }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 24, right: 0, left: 0, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: T.textFaint, textTransform: 'uppercase' }}>
          FOCUS MODE
        </p>
        <button onClick={reset} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
          <RotateCcw style={{ width: 14, height: 14, color: T.textDim }} strokeWidth={2} />
        </button>
      </div>

      {/* Phase tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, position: 'relative', zIndex: 1 }}>
        {(['work', 'short-break', 'long-break'] as Phase[]).map(p => (
          <button key={p} onClick={() => { if (!running) { setPhase(p); setTimeLeft(PHASES[p].duration); setQuoteIdx(0) } }}
            style={{
              padding: '5px 14px', borderRadius: 999,
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.5px',
              border: `1px solid ${phase === p ? PHASES[p].color : T.border2}`,
              background: phase === p ? `${PHASES[p].color}20` : 'transparent',
              color: phase === p ? PHASES[p].color : T.textDim,
              cursor: running ? 'default' : 'pointer',
              transition: 'all .2s',
            }}>
            {PHASES[p].label}
          </button>
        ))}
      </div>

      {/* Session dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        {Array.from({ length: 4 }, (_, i) => {
          const done   = phase === 'work' ? i < sessionNum - 1 : i < sessionNum - (phase === 'long-break' ? 0 : 1)
          const active = phase === 'work' && i === sessionNum - 1
          return (
            <div key={i} style={{
              width: active ? 28 : 8, height: 8,
              borderRadius: 4,
              background: done ? color : active ? color : T.border2,
              boxShadow: active ? `0 0 10px ${color}80` : 'none',
              opacity: done ? 0.6 : 1,
              transition: 'all .4s cubic-bezier(.16,1,.3,1)',
            }} />
          )
        })}
      </div>

      {/* Ring timer */}
      <div style={{ position: 'relative', marginBottom: 36, zIndex: 1 }}>
        <svg width={200} height={200} viewBox="0 0 200 200">
          {/* Track */}
          <circle cx={100} cy={100} r={r} fill="none"
            stroke={T.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'}
            strokeWidth={8} />
          {/* Progress */}
          <circle cx={100} cy={100} r={r} fill="none"
            stroke={color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            transform="rotate(-90 100 100)"
            style={{
              transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset .4s ease',
              filter: `drop-shadow(0 0 8px ${color}66)`,
            }} />
        </svg>

        {/* Time display */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 'clamp(2.8rem, 12vw, 3.8rem)',
            fontWeight: 900, lineHeight: 1,
            color: T.text,
            letterSpacing: '-2px',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 9, fontWeight: 700, letterSpacing: '2px',
            color,
            textTransform: 'uppercase',
            marginTop: 6,
          }}>{label}</span>
        </div>
      </div>

      {/* Sub label */}
      <p dir="rtl" style={{
        fontFamily: 'Heebo, sans-serif',
        fontSize: 13, color: T.textMuted, lineHeight: 1.6,
        textAlign: 'center', marginBottom: 32,
        maxWidth: 260,
        position: 'relative', zIndex: 1,
        minHeight: 20,
        transition: 'opacity .3s',
      }}>
        {running && phase === 'work' ? MOTIVATIONAL['work'][quoteIdx] : sub}
      </p>

      {/* Start / Pause */}
      <button onClick={toggle}
        style={{
          width: 140, height: 52,
          background: running ? 'transparent' : color,
          border: `2px solid ${color}`,
          borderRadius: 999, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: '"Frank Ruhl Libre", Georgia, serif',
          fontSize: 16, fontWeight: 900,
          color: running ? color : '#fff',
          transition: 'all .25s',
          position: 'relative', zIndex: 1,
          boxShadow: running ? 'none' : `0 0 20px ${color}40`,
        }}
        dir="rtl">
        {running
          ? <><Pause style={{ width: 16, height: 16 }} strokeWidth={2.5} />הפסק</>
          : <><Play  style={{ width: 16, height: 16 }} fill="currentColor" strokeWidth={0} />התחל</>
        }
      </button>

      {/* Today's sessions — stat boxes */}
      {todaySessions > 0 && (
        <div style={{ position: 'absolute', bottom: 84, display: 'flex', gap: 10, zIndex: 1 }}>
          <div className="stat-box sm gold" style={{ minWidth: 88 }}>
            <div className="stat-val">{todaySessions}</div>
            <div className="stat-lbl">סשנים</div>
          </div>
          <div className="stat-box sm" style={{ minWidth: 88 }}>
            <div className="stat-val">{todaySessions * 25}</div>
            <div className="stat-lbl">דקות</div>
          </div>
        </div>
      )}
    </div>
  )
}
