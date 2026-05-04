import type { DayLog } from '../types'

interface Props {
  history: DayLog[]
}

export function HistoryTab({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-20 text-muted">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-sm">עדיין אין היסטוריה</p>
        <p className="text-xs mt-1 opacity-60">תתחיל להשתמש כל יום ותראה את ההתקדמות שלך כאן</p>
      </div>
    )
  }

  const avg = Math.round(history.reduce((s, d) => s + d.score, 0) / history.length)

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { num: history.length, label: 'ימים רשומים' },
          { num: `${avg}%`, label: 'ממוצע ניקוד' },
          {
            num: history.filter((d) => d.score >= 80).length,
            label: 'ימים מצוינים',
          },
        ].map(({ num, label }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="font-display text-3xl text-accent leading-none">{num}</div>
            <div className="text-[10px] tracking-[2px] uppercase text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex flex-col gap-3">
        {[...history].reverse().map((log) => {
          const color =
            log.score >= 80
              ? 'text-success border-success/30'
              : log.score >= 40
                ? 'text-accent border-accent/30'
                : 'text-accent2 border-accent2/30'
          return (
            <div
              key={log.date}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">{log.date}</span>
                <span className={`font-display text-2xl ${color}`}>{log.score}%</span>
              </div>
              {log.mainTask && (
                <p className="text-sm text-text opacity-80 mb-1" dir="rtl">
                  🎯 {log.mainTask}
                </p>
              )}
              {log.journal && (
                <p className="text-xs text-muted line-clamp-2" dir="rtl">
                  {log.journal}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
