import type { DayLog } from '../types'

interface Props { history: DayLog[] }

const grade = (s: number) =>
  s >= 80 ? 'Elite' : s >= 60 ? 'Solid' : s >= 40 ? 'Grind' : 'Zero'

export function HistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-card bg-surface flex items-center justify-center mb-6">
          <span className="font-display text-3xl text-muted">0</span>
        </div>
        <p className="text-sm font-semibold text-sub">No Records Yet</p>
        <p className="text-xs text-muted mt-2 max-w-xs leading-relaxed">
          השתמש כל יום — ותראה את ההתקדמות שלך כאן
        </p>
      </div>
    )
  }

  const avg = Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)

  return (
    <div className="max-w-2xl">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { n: history.length,                              l: 'Days'        },
          { n: `${avg}%`,                                   l: 'Avg Score'   },
          { n: history.filter((d) => d.score >= 80).length, l: 'Elite Days'  },
        ].map(({ n, l }) => (
          <div key={l} className="bg-surface rounded-card p-5 text-center">
            <div className="font-display text-4xl text-white leading-none">{n}</div>
            <div className="text-[9px] tracking-[3px] uppercase font-semibold text-muted mt-2">{l}</div>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-2">
        {[...history].reverse().map((log) => (
          <div key={log.date} className="bg-surface rounded-card p-5 flex gap-5 items-start">
            <div className="shrink-0 text-center w-14">
              <div className="font-display text-4xl text-white leading-none">{log.score}</div>
              <div className="text-[9px] tracking-[2px] uppercase font-semibold text-muted mt-1">{grade(log.score)}</div>
            </div>
            <div className="w-px bg-border self-stretch" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[2px] uppercase font-semibold text-muted mb-2">{log.date}</p>
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
