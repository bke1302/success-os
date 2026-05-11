import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Play, ChevronRight } from 'lucide-react'
import { CHALLENGES, CONTENT_CARDS, type Challenge, type ContentCard } from '../constants'
import { playBreathTone, playComplete, playTimerDone, playCheck } from '../utils/sounds'

// ─── Challenge Timer ─────────────────────────────────────────────────────────

function ChallengeTimer({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [started,    setStarted]    = useState(false)
  const [timeLeft,   setTimeLeft]   = useState(challenge.duration)
  const [done,       setDone]       = useState(false)
  const [stepsDone,  setStepsDone]  = useState<boolean[]>(challenge.steps.map(() => false))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hasTimer = challenge.duration > 0

  useEffect(() => {
    if (!started || !hasTimer) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setDone(true)
          playTimerDone()
          return 0
        }
        // Breath tone every 10 seconds for rhythm
        if ((t - 1) % 10 === 0) playBreathTone('hold')
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [started, hasTimer])

  const toggleStep = (i: number) => {
    const next = [...stepsDone]
    next[i] = !next[i]
    setStepsDone(next)
    if (!next[i] === false) playCheck()
    if (next.every(Boolean) && !hasTimer) { setDone(true); playComplete() }
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const pct  = hasTimer ? (1 - timeLeft / challenge.duration) : (stepsDone.filter(Boolean).length / challenge.steps.length)
  const circ = 2 * Math.PI * 52

  const CATEGORY_COLORS: Record<string, string> = {
    ENERGY: '#ef4444', STATE: '#f5c435', IDENTITY: '#f97316',
    BREAKTHROUGH: '#8b5cf6', MINDSET: '#3b82f6', BODY: '#22c55e',
    PODCAST: '#f59e0b', EVENT: '#ec4899',
  }
  const color = CATEGORY_COLORS[challenge.category] ?? '#f5c435'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#02020a' }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div dir="rtl">
          <p className="text-[9px] tracking-[4px] uppercase font-bold mb-0.5" style={{ color }}>
            {challenge.category}
          </p>
          <h2 className="text-lg font-black text-white leading-tight">{challenge.title}</h2>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-4 h-4 text-muted" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

        {/* Timer ring (if timed) */}
        {hasTimer && (
          <div className="flex flex-col items-center gap-4">
            <svg width={130} height={130} viewBox="0 0 130 130">
              {/* Track */}
              <circle cx={65} cy={65} r={52} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
              {/* Progress */}
              <circle cx={65} cy={65} r={52} fill="none"
                stroke={color} strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${color}80)` }}
              />
              {/* Center */}
              <text x={65} y={60} textAnchor="middle" fill="white"
                fontSize={done ? 28 : 32} fontWeight={800} fontFamily="sans-serif">
                {done ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
              </text>
              {!done && (
                <text x={65} y={78} textAnchor="middle" fill="rgba(255,255,255,0.35)"
                  fontSize={10} fontFamily="sans-serif">
                  {started ? 'שניות' : 'מוכן?'}
                </text>
              )}
            </svg>

            {!done && (
              <button
                onClick={() => { setStarted(true) }}
                disabled={started}
                className="px-8 py-3.5 rounded-2xl font-bold text-base transition-all"
                style={
                  started
                    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' }
                    : { background: `linear-gradient(135deg,${color},${color}aa)`, color: '#000', boxShadow: `0 0 24px ${color}40` }
                }
                dir="rtl"
              >
                {started ? 'רץ...' : 'התחל'}
              </button>
            )}

            {done && (
              <div
                className="w-full py-4 rounded-2xl text-center font-bold"
                style={{ background: `${color}18`, border: `1px solid ${color}50`, color }}
                dir="rtl"
              >
                ✓ האתגר הושלם! כוח אמיתי.
              </div>
            )}
          </div>
        )}

        {/* Quote */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs font-bold italic text-center leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            "{challenge.quote}"
          </p>
          <p className="text-[9px] text-center text-muted mt-1 tracking-widest uppercase">Tony Robbins</p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] tracking-[4px] uppercase font-bold text-muted" dir="rtl">
            {hasTimer ? 'ההוראות' : 'השאלות — רשום תשובות בנפרד'}
          </p>
          {challenge.steps.map((step, i) => (
            <button
              key={i}
              onClick={() => toggleStep(i)}
              className="flex items-start gap-3 text-left transition-all duration-200 w-full"
            >
              <div
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: stepsDone[i] ? `${color}25` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${stepsDone[i] ? color : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {stepsDone[i]
                  ? <span style={{ color, fontSize: 10, fontWeight: 800 }}>✓</span>
                  : <span className="text-muted text-xs font-bold">{i + 1}</span>
                }
              </div>
              <p
                className="text-sm font-medium leading-relaxed text-right flex-1"
                dir="rtl"
                style={{ color: stepsDone[i] ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)' }}
              >
                {step}
              </p>
            </button>
          ))}
        </div>

        {/* No-timer done button */}
        {!hasTimer && (
          <button
            onClick={() => { setDone(true); playComplete() }}
            disabled={done}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all"
            style={
              done
                ? { background: `${color}18`, border: `1px solid ${color}50`, color }
                : { background: `linear-gradient(135deg,${color},${color}aa)`, color: '#000', boxShadow: `0 0 24px ${color}40` }
            }
            dir="rtl"
          >
            {done ? '✓ הושלם! כוח אמיתי.' : 'סיימתי את האתגר'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── YouTube overlay ──────────────────────────────────────────────────────────

function YouTubeOverlay({ card, onClose }: { card: ContentCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
      <div
        className="shrink-0 flex items-center justify-between px-4 py-4"
        style={{ background: 'rgba(2,2,10,0.98)' }}
      >
        <p className="text-sm font-bold text-white truncate flex-1 pr-3" dir="rtl">{card.title}</p>
        <button onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <X className="w-4 h-4 text-muted" strokeWidth={2} />
        </button>
      </div>
      <div className="flex-1 relative">
        <iframe
          src={`https://www.youtube.com/embed/${card.youtubeId}?autoplay=1&rel=0&playsinline=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}

// ─── Main FireScreen ──────────────────────────────────────────────────────────

export function FireScreen() {
  const [tab,              setTab]              = useState<'challenges' | 'inspire'>('challenges')
  const [activeChallenge,  setActiveChallenge]  = useState<Challenge | null>(null)
  const [activeYoutube,    setActiveYoutube]    = useState<ContentCard | null>(null)

  const CATEGORY_COLORS: Record<string, string> = {
    ENERGY: '#ef4444', STATE: '#f5c435', IDENTITY: '#f97316',
    BREAKTHROUGH: '#8b5cf6', MINDSET: '#3b82f6', BODY: '#22c55e',
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

      {/* Overlays */}
      {activeChallenge && (
        <ChallengeTimer challenge={activeChallenge} onClose={() => setActiveChallenge(null)} />
      )}
      {activeYoutube && (
        <YouTubeOverlay card={activeYoutube} onClose={() => setActiveYoutube(null)} />
      )}

      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h1 className="font-display text-3xl md:text-4xl mb-1" dir="rtl"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          מרכז הפעולה
        </h1>
        <p className="text-sm text-sub mb-5" dir="rtl">
          לא מספיק לדעת — אתה חייב לפעול. לא מספיק לרצות — אתה חייב להיות.
        </p>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-0">
          {(['challenges', 'inspire'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-t-xl font-bold text-xs tracking-widest uppercase transition-all"
              style={
                tab === t
                  ? { background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.3)', borderLeft: '1px solid rgba(239,68,68,0.15)', borderRight: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.25)' }
              }
            >
              {t === 'challenges' ? '⚡ אתגרים' : '🎬 השראה'}
            </button>
          ))}
        </div>
      </div>

      {/* CHALLENGES tab */}
      {tab === 'challenges' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          <p className="text-[9px] tracking-[4px] uppercase text-muted" dir="rtl">
            8 טכניקות אמיתיות של טוני רובינס — בחר אחת ועשה אותה עכשיו
          </p>

          {CHALLENGES.map(ch => {
            const color = CATEGORY_COLORS[ch.category] ?? '#f5c435'
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChallenge(ch)}
                className="w-full text-left rounded-2xl p-5 relative overflow-hidden transition-all duration-200 active:scale-[0.98]"
                style={{ background: '#0a0a15', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                  style={{ background: `linear-gradient(to bottom,${color},${color}44)` }}
                />

                <div className="flex items-center gap-4 pl-3">
                  <span className="text-3xl shrink-0">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[8px] tracking-[2px] uppercase font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${color}18`, color }}
                      >
                        {ch.category}
                      </span>
                      {ch.duration > 0 && (
                        <span className="text-[8px] tracking-[2px] uppercase text-muted">
                          {ch.duration >= 60 ? `${ch.duration / 60} דק׳` : `${ch.duration} שנ׳`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white leading-tight" dir="rtl">{ch.title}</p>
                    <p className="text-[10px] text-muted mt-0.5 leading-relaxed italic" dir="rtl">
                      "{ch.quote}"
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted shrink-0" strokeWidth={1.5} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* INSPIRE tab */}
      {tab === 'inspire' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <p className="text-[9px] tracking-[4px] uppercase text-muted" dir="rtl">
            תוכן מקורי של טוני רובינס — צפה, האזן, הצמח
          </p>

          {CONTENT_CARDS.map(card => (
            <div
              key={card.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#0a0a15', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Card top accent */}
              <div
                className="h-px"
                style={{ background: card.category === 'MINDSET' ? 'linear-gradient(to right,transparent,#3b82f680,transparent)'
                  : card.category === 'PODCAST' ? 'linear-gradient(to right,transparent,#f59e0b80,transparent)'
                  : 'linear-gradient(to right,transparent,#ef444480,transparent)' }}
              />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-4xl shrink-0 mt-0.5">{card.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[8px] tracking-[2px] uppercase text-muted font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {card.category}
                      </span>
                      <span className="text-[8px] text-muted">{card.duration}</span>
                    </div>
                    <p className="text-base font-bold text-white leading-tight mb-1" dir="rtl">{card.title}</p>
                    <p className="text-xs text-sub leading-relaxed" dir="rtl">{card.subtitle}</p>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4">
                  {card.type === 'youtube' && card.youtubeId ? (
                    <button
                      onClick={() => setActiveYoutube(card)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(239,68,68,0.25)',
                      }}
                      dir="rtl"
                    >
                      <Play className="w-4 h-4" fill="white" strokeWidth={0} />
                      צפה עכשיו
                    </button>
                  ) : (
                    <a
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all no-underline"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                      }}
                      dir="rtl"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      פתח בדפדפן
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <p className="text-[9px] text-muted text-center leading-relaxed px-4" dir="rtl">
            התוכן שייך לטוני רובינס ולערוצים הרשמיים שלו.
            הצפייה ב-YouTube דורשת חיבור לאינטרנט.
          </p>
        </div>
      )}
    </div>
  )
}
