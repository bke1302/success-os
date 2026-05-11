import { Flame, Trophy, Zap } from 'lucide-react'
import { EnergySlider } from '../components/EnergySlider'
import type { DayEntry } from '../types'

interface Props {
  entries: DayEntry[]
  streak: number
  totalDays: number
}

function scoreColor(s: number) {
  if (s >= 9) return '#f5c435'
  if (s >= 7) return '#e8a020'
  if (s >= 5) return '#f97316'
  return '#ef4444'
}

function scoreLabel(s: number) {
  if (s >= 9) return 'ELITE'
  if (s >= 7) return 'SOLID'
  if (s >= 5) return 'GRIND'
  return 'START'
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

export function WinsWall({ entries, streak, totalDays }: Props) {
  const withEvening = entries.filter(e => e.evening).sort((a, b) => b.date.localeCompare(a.date))

  const avgScore = withEvening.length > 0
    ? Math.round(withEvening.reduce((s, e) => s + e.evening!.score, 0) / withEvening.length * 10) / 10
    : 0

  const committed = withEvening.filter(e => e.evening!.commitmentDone).length
  const commitRate = withEvening.length > 0 ? Math.round(committed / withEvening.length * 100) : 0

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh', background: '#02020a' }}>

      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <h1 className="font-display text-3xl md:text-4xl gold-text mb-5" dir="rtl">
          קיר הניצחונות
        </h1>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Flame className="w-4 h-4" style={{ color: '#f5c435' }} />, value: streak, label: 'STREAK' },
            { icon: <Trophy className="w-4 h-4 text-muted" />, value: totalDays, label: 'ימים' },
            { icon: <Zap className="w-4 h-4 text-muted" />, value: `${avgScore}`, label: 'ממוצע' },
            { icon: <span className="text-sm">🎯</span>, value: `${commitRate}%`, label: 'ביצע' },
          ].map(({ icon, value, label }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-center mb-1">{icon}</div>
              <div className="font-display text-2xl leading-none" style={{ color: '#f5c435' }}>{value}</div>
              <div className="text-[7px] tracking-[2px] uppercase text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wins grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {withEvening.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <div className="text-5xl">⚡</div>
            <p className="text-lg font-bold text-white" dir="rtl">עדיין אין ניצחונות</p>
            <p className="text-sm text-muted max-w-xs" dir="rtl">
              סיים את היום הראשון שלך ותראה כאן את ה-WIN הראשון שלך.
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
                  style={{ background: '#0a0a15', border: `1px solid rgba(255,255,255,0.07)` }}
                >
                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${color}60, transparent)` }}
                  />

                  {/* Date + score */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="flex flex-col items-center"
                      style={{ minWidth: '48px' }}
                    >
                      <span className="font-display text-3xl leading-none" style={{ color }}>{ev.score}</span>
                      <span className="text-[7px] tracking-[2px] uppercase font-bold mt-0.5" style={{ color }}>
                        {scoreLabel(ev.score)}
                      </span>
                    </div>
                    <div className="text-right flex-1 pl-3">
                      <p className="text-[9px] tracking-[2px] uppercase text-muted">{formatDate(entry.date)}</p>
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
                          {ev.commitmentDone ? 'ביצע' : 'לא ביצע'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Win */}
                  <p
                    className="text-sm font-semibold text-white leading-relaxed line-clamp-3 mb-3"
                    dir="rtl"
                  >
                    {ev.win}
                  </p>

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
