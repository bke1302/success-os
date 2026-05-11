import { Flame, Trophy, TrendingUp } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
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
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function WinsWall({ entries, streak, totalDays }: Props) {
  const withEvening = entries
    .filter(e => e.evening)
    .sort((a, b) => b.date.localeCompare(a.date))

  const avgScore = withEvening.length > 0
    ? Math.round(withEvening.reduce((s, e) => s + e.evening!.score, 0) / withEvening.length * 10) / 10
    : 0

  const committed    = withEvening.filter(e => e.evening!.commitmentDone).length
  const commitRate   = withEvening.length > 0 ? Math.round(committed / withEvening.length * 100) : 0
  const peakDays     = withEvening.filter(e => e.evening!.score >= 9).length

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h1 className="font-display text-3xl md:text-4xl gold-text mb-1" dir="rtl">
          קיר הגדילה
        </h1>
        <p className="text-sm text-sub mb-5" dir="rtl">
          כל יום שסגרת הוא הוכחה שאתה לא מוותר.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Flame className="w-4 h-4" style={{ color: '#f5c435' }} />, value: streak,       label: 'STREAK'  },
            { icon: <Trophy className="w-4 h-4 text-muted" />,                  value: totalDays,    label: 'ימים'    },
            { icon: <TrendingUp className="w-4 h-4 text-muted" />,              value: `${avgScore}`, label: 'ממוצע'  },
            { icon: <span className="text-sm">🎯</span>,                         value: `${commitRate}%`, label: 'עמדתי' },
          ].map(({ icon, value, label }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="font-display text-2xl leading-none" style={{ color: '#f5c435' }}>{value}</div>
              <div className="text-[7px] tracking-[2px] uppercase text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Peak days call-out */}
        {peakDays > 0 && (
          <div
            className="mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(245,196,53,0.05)', border: '1px solid rgba(245,196,53,0.15)' }}
          >
            <span className="text-base">⚡</span>
            <p className="text-xs font-semibold" style={{ color: '#f5c435' }} dir="rtl">
              {peakDays} ימי PEAK — כשהגעת ל-9 ומעלה. זה הבסיס של הגדולה.
            </p>
          </div>
        )}
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {withEvening.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <div className="text-5xl">⚡</div>
            <p className="text-lg font-bold text-white" dir="rtl">עדיין אין ימים סגורים</p>
            <p className="text-sm text-muted max-w-xs leading-relaxed" dir="rtl">
              סיים יום ראשון עם סיכום ערב — ותראה כאן את הגדילה שלך.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
            {withEvening.map(entry => {
              const ev    = entry.evening!
              const color = scoreColor(ev.score)

              return (
                <div
                  key={entry.date}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: '#0a0a15', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }}
                  />

                  {/* Score + date row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col items-center" style={{ minWidth: '52px' }}>
                      <span className="font-display text-3xl leading-none" style={{ color }}>{ev.score}</span>
                      <span className="text-[7px] tracking-[2px] uppercase font-bold mt-0.5" style={{ color }}>
                        {scoreLabel(ev.score)}
                      </span>
                    </div>
                    <div className="text-right flex-1 pl-3">
                      <p className="text-[9px] tracking-[2px] uppercase text-muted">{formatDate(entry.date)}</p>

                      {/* Identity badge */}
                      {entry.morning?.identity && (
                        <p className="text-[10px] font-bold mt-1" style={{ color: 'rgba(245,196,53,0.7)' }} dir="rtl">
                          👑 {entry.morning.identity}
                        </p>
                      )}

                      {/* Commitment status */}
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: ev.commitmentDone ? '#22c55e' : '#ef4444' }}
                        />
                        <span
                          className="text-[9px] font-semibold"
                          style={{ color: ev.commitmentDone ? '#22c55e' : '#ef4444' }}
                          dir="rtl"
                        >
                          {ev.commitmentDone ? 'עמדתי' : 'לא הצלחתי'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* What I gave */}
                  <div className="mb-2">
                    <p className="text-[8px] tracking-[2px] uppercase text-muted mb-1">מה נתתי</p>
                    <p className="text-sm font-semibold text-white leading-relaxed line-clamp-3" dir="rtl">
                      {ev.given ?? ev.win}
                    </p>
                  </div>

                  {/* Lesson */}
                  {ev.lesson && (
                    <p className="text-xs text-sub leading-relaxed line-clamp-2 mb-3" dir="rtl">
                      📖 {ev.lesson}
                    </p>
                  )}

                  {/* Morning energy */}
                  {entry.morning && (
                    <div className="mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <EnergySlider
                        value={entry.morning.energyLevel}
                        onChange={() => {}}
                        size="sm"
                        readonly
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
