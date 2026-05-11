import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DayLog } from '../types'

interface Props { history: DayLog[] }

function grade(s: number): string {
  if (s >= 80) return 'ELITE'
  if (s >= 60) return 'SOLID'
  if (s >= 40) return 'GRIND'
  return 'START'
}

function scoreColor(s: number): string {
  if (s >= 80) return '#f5c435'
  if (s >= 60) return '#e8a020'
  if (s >= 40) return '#8a88aa'
  return '#3d3b55'
}

/* ─── Bar Chart ────────────────────────────────────────────── */
function ScoreChart({ history }: { history: DayLog[] }) {
  const data = history.slice(-30)
  if (data.length < 2) return null

  const H    = 64
  const barW = 10
  const gap  = 4
  const totalW = data.length * (barW + gap) - gap

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.4), transparent)' }}
      />
      <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted mb-4">
        {data.length} DAYS TREND
      </p>
      <svg
        viewBox={`0 0 ${totalW} ${H}`}
        className="w-full"
        style={{ height: `${H}px`, overflow: 'visible' }}
        preserveAspectRatio="none"
      >
        {data.map((day, i) => {
          const barH  = Math.max(3, (day.score / 100) * H)
          const x     = i * (barW + gap)
          const y     = H - barH
          const color = scoreColor(day.score)
          return (
            <g key={day.date}>
              {day.score >= 80 && (
                <rect x={x} y={y} width={barW} height={barH} rx={2}
                  fill={color} opacity={0.15} style={{ filter: 'blur(4px)' }} />
              )}
              <rect x={x} y={y} width={barW} height={barH} rx={2} fill={color} opacity={0.85} />
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between mt-2">
        <span className="text-[8px] text-muted">{data[0]?.date}</span>
        <span className="text-[8px] text-muted">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

/* ─── Weekly Review ────────────────────────────────────────── */
function weekKey(dateStr: string): string {
  const [d, m, y] = dateStr.split('.').map(Number)
  const date = new Date(y, m - 1, d)
  const dayOfWeek = date.getDay()
  const sunday = new Date(date)
  sunday.setDate(date.getDate() - dayOfWeek)
  return sunday.toLocaleDateString('he-IL')
}

function parseHeDate(s: string): number {
  const [d, m, y] = s.split('.').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function WeeklyReview({ history }: { history: DayLog[] }) {
  if (history.length < 3) return null

  const weeks: Record<string, DayLog[]> = {}
  for (const log of history) {
    const key = weekKey(log.date)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(log)
  }

  const weekEntries = Object.entries(weeks)
    .sort((a, b) => parseHeDate(b[0]) - parseHeDate(a[0]))
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">WEEKLY BREAKDOWN</p>
      {weekEntries.map(([weekStart, logs], idx) => {
        const avg   = Math.round(logs.reduce((s, d) => s + d.score, 0) / logs.length)
        const best  = Math.max(...logs.map(l => l.score))
        const elite = logs.filter(l => l.score >= 80).length
        const color = scoreColor(avg)

        const prevLogs  = idx < weekEntries.length - 1 ? weekEntries[idx + 1][1] : null
        const prevAvg   = prevLogs ? Math.round(prevLogs.reduce((s, d) => s + d.score, 0) / prevLogs.length) : null
        const delta     = prevAvg !== null ? avg - prevAvg : null

        return (
          <div
            key={weekStart}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: '#131220', border: '1px solid #252336' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(to right, transparent, ${color}50, transparent)` }}
            />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[8px] tracking-[3px] uppercase font-bold text-muted">
                שבוע {weekStart}
              </p>
              {delta !== null && (
                <div className="flex items-center gap-1">
                  {delta > 0
                    ? <TrendingUp className="w-3 h-3" style={{ color: '#f5c435' }} strokeWidth={1.5} />
                    : delta < 0
                    ? <TrendingDown className="w-3 h-3 text-red-400" strokeWidth={1.5} />
                    : <Minus className="w-3 h-3 text-muted" strokeWidth={1.5} />
                  }
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: delta > 0 ? '#f5c435' : delta < 0 ? '#f87171' : '#6b6985' }}
                  >
                    {delta > 0 ? '+' : ''}{delta}%
                  </span>
                </div>
              )}
            </div>

            {/* Mini bars */}
            <div className="flex items-end gap-1.5 mb-3" style={{ height: '32px' }}>
              {logs.map(log => {
                const h = Math.max(3, (log.score / 100) * 32)
                return (
                  <div
                    key={log.date}
                    className="flex-1 rounded-sm"
                    title={`${log.date}: ${log.score}%`}
                    style={{ height: `${h}px`, background: scoreColor(log.score), opacity: 0.8 }}
                  />
                )
              })}
            </div>

            <div className="flex gap-4">
              <div>
                <div className="font-display text-2xl leading-none" style={{ color }}>{avg}%</div>
                <div className="text-[7px] tracking-[2px] uppercase text-muted mt-0.5">ממוצע</div>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <div className="font-display text-2xl leading-none" style={{ color: scoreColor(best) }}>{best}%</div>
                <div className="text-[7px] tracking-[2px] uppercase text-muted mt-0.5">שיא</div>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <div className="font-display text-2xl leading-none" style={{ color: '#f5c435' }}>{elite}</div>
                <div className="text-[7px] tracking-[2px] uppercase text-muted mt-0.5">ELITE</div>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <div className="font-display text-2xl leading-none text-text">{logs.length}</div>
                <div className="text-[7px] tracking-[2px] uppercase text-muted mt-0.5">ימים</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main ─────────────────────────────────────────────────── */
export function HistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div
          className="w-12 h-12 rounded-card flex items-center justify-center mb-5"
          style={{ background: '#131220', border: '1px solid #252336' }}
        >
          <BarChart2 className="w-5 h-5 text-muted" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-sub">No Records Yet</p>
        <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed" dir="rtl">
          השתמש כל יום — ותראה את ההתקדמות שלך כאן
        </p>
      </div>
    )
  }

  const avg       = Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)
  const eliteDays = history.filter((d) => d.score >= 80).length
  const bestScore = Math.max(...history.map(d => d.score))

  const stats = [
    { n: String(history.length), l: 'DAYS'      },
    { n: `${avg}%`,              l: 'AVG'       },
    { n: String(eliteDays),      l: 'ELITE'     },
    { n: `${bestScore}%`,        l: 'BEST'      },
  ]

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ n, l }) => (
          <div
            key={l}
            className="rounded-card p-4 text-center relative overflow-hidden"
            style={{ background: '#131220', border: '1px solid #252336' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, #e8a020, transparent)', opacity: 0.6 }}
            />
            <div className="font-display text-3xl leading-none" style={{ color: '#f5c435' }}>{n}</div>
            <div className="text-[7px] tracking-[2px] uppercase font-bold text-muted mt-2">{l}</div>
          </div>
        ))}
      </div>

      <ScoreChart history={history} />
      <WeeklyReview history={history} />

      {/* Daily log */}
      <div className="flex flex-col gap-2">
        <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">DAILY LOG</p>
        {[...history].reverse().map((log) => (
          <div
            key={log.date}
            className="rounded-card p-5 flex gap-5 items-start relative overflow-hidden"
            style={{ background: '#131220', border: '1px solid #252336' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.3), transparent)' }}
            />
            <div className="shrink-0 text-center w-14">
              <div className="font-display text-4xl leading-none" style={{ color: scoreColor(log.score) }}>
                {log.score}
              </div>
              <div className="text-[8px] tracking-[2px] uppercase font-bold text-muted mt-1">
                {grade(log.score)}
              </div>
              {log.mainTaskDone && (
                <div
                  className="mt-1.5 text-[7px] tracking-[1px] uppercase font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(245,196,53,0.1)', color: '#f5c435', border: '1px solid rgba(245,196,53,0.2)' }}
                >
                  ✓ MISSION
                </div>
              )}
            </div>
            <div className="w-px bg-border self-stretch" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[3px] uppercase font-bold text-muted mb-2">{log.date}</p>
              {log.mainTask && (
                <p className="text-sm text-text font-medium mb-1 truncate" dir="rtl">{log.mainTask}</p>
              )}
              {log.journal && (
                <p className="text-xs text-sub line-clamp-2 leading-relaxed" dir="rtl">{log.journal}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
