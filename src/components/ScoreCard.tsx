import { DAYS_HE } from '../constants'

interface Props {
  score: number
  done: number
  total: number
  streak: number
  dayCount: number
}

export function ScoreCard({ score, done, total, streak, dayCount }: Props) {
  const scoreColor =
    score >= 80 ? 'text-success' : score >= 40 ? 'text-accent' : 'text-accent2'

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-[10px] tracking-[3px] uppercase text-muted mb-4 font-medium">
        📊 Daily Score
      </p>

      <div className="text-center py-4">
        <div className={`font-display text-[88px] leading-none transition-colors duration-500 ${scoreColor}`}>
          {score}%
        </div>
        <p className="text-[10px] tracking-[3px] uppercase text-muted mt-1">Performance Score</p>

        <div className="mt-4 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${score}%`,
              background: 'linear-gradient(90deg, #ff6b35, #f5c518)',
            }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="mt-4 text-center">
        <p className="text-[10px] tracking-[2px] uppercase text-muted mb-3">7 Day Streak</p>
        <div className="flex gap-2 justify-center">
          {DAYS_HE.map((day, i) => (
            <div
              key={day}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300 ${
                i < streak
                  ? 'bg-accent text-black font-bold'
                  : 'bg-card2 border border-border text-muted'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        {[
          { num: done, label: 'עשיתי' },
          { num: total - done, label: 'נשארו' },
          { num: dayCount, label: 'יום ברצף' },
        ].map(({ num, label }) => (
          <div
            key={label}
            className="bg-card2 border border-border rounded-xl p-3 text-center"
          >
            <div className="font-display text-3xl text-accent leading-none">{num}</div>
            <div className="text-[10px] tracking-[2px] uppercase text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
