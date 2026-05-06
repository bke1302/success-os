import { BarChart2 } from 'lucide-react'
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
  return '#5a5878'
}

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

  const avg        = Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)
  const eliteDays  = history.filter((d) => d.score >= 80).length

  const stats = [
    { n: String(history.length), l: 'DAYS'       },
    { n: `${avg}%`,              l: 'AVG SCORE'  },
    { n: String(eliteDays),      l: 'ELITE DAYS' },
  ]

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ n, l }) => (
          <div
            key={l}
            className="rounded-card p-5 text-center relative overflow-hidden"
            style={{ background: '#131220', border: '1px solid #252336' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, #e8a020, transparent)', opacity: 0.6 }}
            />
            <div className="font-display text-4xl leading-none" style={{ color: '#f5c435' }}>{n}</div>
            <div className="text-[8px] tracking-[3px] uppercase font-bold text-muted mt-2">{l}</div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex flex-col gap-2">
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

            {/* Score */}
            <div className="shrink-0 text-center w-14">
              <div
                className="font-display text-4xl leading-none"
                style={{ color: scoreColor(log.score) }}
              >
                {log.score}
              </div>
              <div className="text-[8px] tracking-[2px] uppercase font-bold text-muted mt-1">
                {grade(log.score)}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border self-stretch" />

            {/* Content */}
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
