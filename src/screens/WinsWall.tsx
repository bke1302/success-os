import { useState } from 'react'
import { Flame, Trophy, TrendingUp, Settings, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
import { ScoreTrendChart } from '../components/ScoreTrendChart'
import { HeatmapChart } from '../components/HeatmapChart'
import { getReminderTime, setReminderTime } from '../utils/reminder'
import { generateCoachReport } from '../utils/aiCoach'
import { shareWinCard } from '../utils/shareCard'
import type { DayEntry } from '../types'

interface Props {
  entries:   DayEntry[]
  streak:    number
  totalDays: number
}

function scoreColor(s: number) {
  if (s >= 9) return '#f5c435'
  if (s >= 7) return '#e8a020'
  if (s >= 5) return '#f97316'
  return '#ef4444'
}

function scoreLabel(s: number) {
  if (s >= 9) return 'PEAK'
  if (s >= 7) return 'SOLID'
  if (s >= 5) return 'GRIND'
  return 'START'
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ── AI Coach Report card ───────────────────────────────────────────────────────
function CoachReportCard({ entries, streak }: { entries: DayEntry[]; streak: number }) {
  const [expanded, setExpanded] = useState(false)
  const report = generateCoachReport(entries, streak)

  const toneColor =
    report.tone === 'fire' ? '#ef4444' :
    report.tone === 'green' ? '#22c55e' : '#f5c435'
  const toneGlow =
    report.tone === 'fire' ? 'rgba(239,68,68,0.25)' :
    report.tone === 'green' ? 'rgba(34,197,94,0.2)' : 'rgba(245,196,53,0.25)'

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: `linear-gradient(145deg, ${toneColor}0c, rgba(8,8,16,0.98))`,
      border: `1px solid ${toneColor}25`,
      boxShadow: `0 4px 32px ${toneGlow}`,
    }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${toneColor},transparent)` }} />
      <div className="p-4">
        <button className="w-full text-left" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{report.tone === 'fire' ? '🔥' : report.tone === 'green' ? '⚡' : '💎'}</span>
              <div dir="rtl">
                <p className="text-[7px] tracking-[4px] uppercase font-black" style={{ color: toneColor }}>AI COACH — דוח שבועי</p>
                <p className="text-sm font-black text-white mt-0.5">{report.headline}</p>
              </div>
            </div>
            {expanded
              ? <ChevronUp className="w-4 h-4 text-muted shrink-0" />
              : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
            }
          </div>
        </button>

        {expanded && (
          <div className="mt-4 animate-slide-up">
            <div className="flex flex-col gap-2 mb-4">
              {report.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: toneColor }} />
                  <p className="text-sm text-white leading-relaxed" dir="rtl">{insight}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3" style={{ background: `${toneColor}0d`, border: `1px solid ${toneColor}20` }}>
              <p className="text-[7px] tracking-[3px] uppercase font-black mb-1" style={{ color: toneColor }} dir="rtl">אתגר השבוע</p>
              <p className="text-sm font-bold text-white" dir="rtl">{report.challenge}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Accountability link ────────────────────────────────────────────────────────
function AccountabilityCard({ streak, totalDays, avgScore }: { streak: number; totalDays: number; avgScore: number }) {
  const [copied, setCopied] = useState(false)

  const shareData = btoa(JSON.stringify({ streak, totalDays, avgScore: avgScore.toFixed(1), date: new Date().toISOString().slice(0,10) }))
  const url = `${window.location.origin}${window.location.pathname}?partner=${shareData}`

  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)' }}>
      <p className="text-[7px] tracking-[4px] uppercase font-black mb-1" style={{ color: 'rgba(167,170,255,0.9)' }} dir="rtl">
        👥 ACCOUNTABILITY PARTNER
      </p>
      <p className="text-xs text-sub mb-3" dir="rtl">שתף קישור עם חבר — הוא יראה את ה-streak שלך. לחץ חברתי חיובי = x3 completion.</p>
      <button
        onClick={copy}
        className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
        style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)', border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'rgba(99,102,241,0.3)'}`, color: copied ? '#22c55e' : 'rgba(167,170,255,0.9)' }}
        dir="rtl"
      >
        {copied ? '✓ הועתק לקליפבורד!' : '🔗 העתק לינק לשיתוף'}
      </button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export function WinsWall({ entries, streak, totalDays }: Props) {
  const [showSettings,      setShowSettings]      = useState(false)
  const [reminderTime,      setReminderTimeState] = useState(getReminderTime)
  const [sharingEntry,      setSharingEntry]      = useState<string | null>(null)

  const withEvening = entries.filter(e => e.evening).sort((a, b) => b.date.localeCompare(a.date))

  const avgScore   = withEvening.length > 0
    ? Math.round(withEvening.reduce((s, e) => s + e.evening!.score, 0) / withEvening.length * 10) / 10
    : 0
  const committed  = withEvening.filter(e => e.evening!.commitmentDone).length
  const commitRate = withEvening.length > 0 ? Math.round(committed / withEvening.length * 100) : 0
  const peakDays   = withEvening.filter(e => e.evening!.score >= 9).length

  const handleShare = async (entry: DayEntry) => {
    setSharingEntry(entry.date)
    try {
      await shareWinCard({
        win:    entry.evening!.given ?? entry.evening!.win,
        score:  entry.evening!.score,
        date:   formatDate(entry.date),
        streak,
      })
    } finally {
      setSharingEntry(null)
    }
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#02020a', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div className="shrink-0 px-5 pt-8 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start justify-between mb-1">
          <h1 className="font-display text-2xl font-black gold-text" dir="rtl">קיר הגדילה</h1>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={showSettings
              ? { background: 'rgba(245,196,53,0.1)', border: '1px solid rgba(245,196,53,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} style={{ color: showSettings ? '#f5c435' : 'rgba(255,255,255,0.3)' }} />
          </button>
        </div>
        <p className="text-xs text-sub mb-4" dir="rtl">כל יום שסגרת הוא הוכחה שאתה לא מוותר.</p>

        {showSettings && (
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xs font-semibold text-white shrink-0" dir="rtl">תזכורת בוקר</span>
            <input
              type="time" value={reminderTime}
              onChange={e => { setReminderTimeState(e.target.value); setReminderTime(e.target.value) }}
              className="rounded-lg px-3 py-1.5 text-sm font-bold outline-none"
              style={{ background: 'rgba(245,196,53,0.08)', border: '1px solid rgba(245,196,53,0.25)', color: '#f5c435', colorScheme: 'dark' }}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Flame className="w-4 h-4" style={{ color: '#f5c435' }} />, value: streak, label: 'STREAK' },
            { icon: <Trophy className="w-4 h-4 text-muted" />, value: totalDays, label: 'ימים' },
            { icon: <TrendingUp className="w-4 h-4 text-muted" />, value: `${avgScore}`, label: 'ממוצע' },
            { icon: <span className="text-sm">🎯</span>, value: `${commitRate}%`, label: 'עמדתי' },
          ].map(({ icon, value, label }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="font-display text-xl leading-none" style={{ color: '#f5c435' }}>{value}</div>
              <div className="text-[7px] tracking-[2px] uppercase text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

        {/* AI Coach Report */}
        {withEvening.length >= 3 && (
          <CoachReportCard entries={entries} streak={streak} />
        )}

        {/* Heatmap */}
        {withEvening.length >= 2 && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[7px] tracking-[4px] uppercase text-muted mb-1">מפת גדילה שנתית</p>
            <HeatmapChart entries={entries} />
          </div>
        )}

        {/* Score trend */}
        {withEvening.length >= 2 && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ScoreTrendChart entries={entries} />
          </div>
        )}

        {/* Peak days */}
        {peakDays > 0 && (
          <div className="rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: 'rgba(245,196,53,0.05)', border: '1px solid rgba(245,196,53,0.15)' }}>
            <span className="text-base">⚡</span>
            <p className="text-xs font-semibold" style={{ color: '#f5c435' }} dir="rtl">
              {peakDays} ימי PEAK — הגעת ל-9 ומעלה. זה הבסיס של הגדולה.
            </p>
          </div>
        )}

        {/* Accountability */}
        {totalDays >= 1 && (
          <AccountabilityCard streak={streak} totalDays={totalDays} avgScore={avgScore} />
        )}

        {/* Entry list */}
        {withEvening.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="text-5xl">⚡</div>
            <p className="text-lg font-bold text-white" dir="rtl">עדיין אין ימים סגורים</p>
            <p className="text-sm text-muted max-w-xs leading-relaxed" dir="rtl">סיים יום ראשון עם סיכום ערב — ותראה כאן את הגדילה שלך.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {withEvening.map(entry => {
              const ev    = entry.evening!
              const color = scoreColor(ev.score)

              return (
                <div key={entry.date} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#0a0a15', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }} />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
                      <span className="font-display text-3xl leading-none" style={{ color }}>{ev.score}</span>
                      <span className="text-[7px] tracking-[2px] uppercase font-bold mt-0.5" style={{ color }}>{scoreLabel(ev.score)}</span>
                    </div>
                    <div className="text-right flex-1 pl-3">
                      <p className="text-[9px] tracking-[2px] uppercase text-muted">{formatDate(entry.date)}</p>
                      {entry.morning?.identity && (
                        <p className="text-[10px] font-bold mt-1" style={{ color: 'rgba(245,196,53,0.7)' }} dir="rtl">📅 {entry.morning.identity}</p>
                      )}
                      {entry.morning?.oneThing && (
                        <p className="text-[10px] mt-1 text-sub" dir="rtl">⭐ {entry.morning.oneThing}</p>
                      )}
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: ev.commitmentDone ? '#22c55e' : '#ef4444' }} />
                        <span className="text-[9px] font-semibold" style={{ color: ev.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">
                          {ev.commitmentDone ? 'עמדתי' : 'לא הצלחתי'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-[8px] tracking-[2px] uppercase text-muted mb-1">מה נתתי</p>
                    <p className="text-sm font-semibold text-white leading-relaxed line-clamp-3" dir="rtl">{ev.given ?? ev.win}</p>
                  </div>

                  {ev.lesson && <p className="text-xs text-sub leading-relaxed line-clamp-2 mb-3" dir="rtl">📖 {ev.lesson}</p>}

                  <div className="flex items-center justify-between mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                    {entry.morning && (
                      <EnergySlider value={entry.morning.energyLevel} onChange={() => {}} size="sm" readonly />
                    )}
                    <button
                      onClick={() => handleShare(entry)}
                      disabled={sharingEntry === entry.date}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      style={{ background: `${color}0d`, border: `1px solid ${color}28`, color }}
                      dir="rtl"
                    >
                      <Share2 className="w-3 h-3" />
                      {sharingEntry === entry.date ? 'מייצר…' : 'שתף'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
