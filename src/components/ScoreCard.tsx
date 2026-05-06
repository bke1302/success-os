import { DAYS_HE } from '../constants'

interface Props {
  score: number
  done: number
  total: number
  streak: number
  dayCount: number
}

const grade = (s: number) =>
  s >= 80 ? 'ELITE' : s >= 60 ? 'SOLID' : s >= 40 ? 'GRIND' : 'ZERO'

const gradeColor = (s: number) =>
  s >= 80 ? '#f5c842' : s >= 60 ? '#d4a43a' : s >= 40 ? '#8a8aaa' : '#545470'

export function ScoreCard({ score, done, total, streak, dayCount }: Props) {
  const radius           = 80
  const strokeWidth      = 8
  const normalizedRadius = radius - strokeWidth / 2
  const circumference    = normalizedRadius * 2 * Math.PI
  const offset           = circumference - (score / 100) * circumference

  return (
    <div className="bg-surface rounded-card p-6 border border-border relative overflow-hidden">
      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

      <div className="flex items-center gap-8 flex-wrap">

        {/* Circular progress ring */}
        <div className="relative shrink-0 flex items-center justify-center" style={{ width: 176, height: 176 }}>
          <svg
            width={176}
            height={176}
            style={score > 0 ? { filter: 'drop-shadow(0 0 16px rgba(212,164,58,0.4))' } : undefined}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#f5c842" />
                <stop offset="100%" stopColor="#d4a43a" />
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle
              cx={88}
              cy={88}
              r={normalizedRadius}
              fill="none"
              stroke="#26263a"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx={88}
              cy={88}
              r={normalizedRadius}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 88 88)"
              style={{ transition: 'stroke-dashoffset 1000ms ease' }}
            />
          </svg>
          {/* Score centered inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-7xl leading-none" style={{ color: gradeColor(score) }}>
              {score}
            </span>
            <span
              className="text-[10px] tracking-[4px] uppercase font-bold mt-1"
              style={{ color: gradeColor(score) }}
            >
              {grade(score)}
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px self-stretch bg-border" />

        {/* Stats column */}
        <div className="flex flex-col gap-5">
          {[
            { n: done,         l: 'Done'  },
            { n: total - done, l: 'Left'  },
            { n: dayCount,     l: 'Day #' },
          ].map(({ n, l }) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl text-text leading-none">{n}</div>
              <div className="text-[9px] tracking-[3px] uppercase font-semibold text-muted mt-1">{l}</div>
            </div>
          ))}
        </div>

        {/* Horizontal divider */}
        <div className="h-px w-full bg-border hidden" />

        {/* Vertical divider 2 */}
        <div className="w-px self-stretch bg-border" />

        {/* Streak */}
        <div>
          <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted mb-3">Streak</p>
          <div className="flex gap-1.5">
            {DAYS_HE.map((d, i) => (
              <div
                key={d}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  i < streak
                    ? 'text-black'
                    : 'bg-surface2 border border-border text-muted'
                }`}
                style={i < streak ? {
                  background: 'linear-gradient(135deg, #f5c842, #d4a43a)',
                } : undefined}
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
