import { DAYS_HE } from '../constants'

interface Props {
  score: number
  done: number
  total: number
  streak: number
  dayCount: number
}

const grade = (s: number) =>
  s >= 80 ? 'Elite' : s >= 60 ? 'Solid' : s >= 40 ? 'Grind' : 'Zero'

export function ScoreCard({ score, done, total, streak, dayCount }: Props) {
  return (
    <div className="bg-surface rounded-card p-6">
      <div className="flex items-center justify-between">

        {/* Score number */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-1">Daily Score</p>
          <div className="flex items-end gap-3">
            <span className="font-display text-[72px] leading-none text-white">{score}</span>
            <span className="text-sm text-sub mb-2 font-medium">{grade(score)}</span>
          </div>
          {/* Bar */}
          <div className="w-40 h-0.5 bg-border rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-16 bg-border" />

        {/* Stats */}
        <div className="flex gap-6">
          {[
            { n: done,         l: 'Done'  },
            { n: total - done, l: 'Left'  },
            { n: dayCount,     l: 'Day #' },
          ].map(({ n, l }) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl text-white leading-none">{n}</div>
              <div className="text-[9px] tracking-[3px] uppercase font-semibold text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-16 bg-border" />

        {/* Streak */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-3">Streak</p>
          <div className="flex gap-1.5">
            {DAYS_HE.map((d, i) => (
              <div
                key={d}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  i < streak
                    ? 'bg-white text-black'
                    : 'bg-surface2 text-muted'
                }`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
