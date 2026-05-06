interface Props {
  score: number
  done: number
  total: number
  streak: number
  dayCount: number
}

function gradeColor(score: number): string {
  if (score >= 80) return '#f5c435'
  if (score >= 60) return '#e8a020'
  if (score >= 40) return '#8a88aa'
  return '#5a5878'
}

function grade(score: number): string {
  if (score >= 80) return 'ELITE'
  if (score >= 60) return 'SOLID'
  if (score >= 40) return 'GRIND'
  return 'START'
}

function gradeSub(score: number): string {
  if (score >= 80) return 'מצוין. אתה בשיא.'
  if (score >= 60) return 'טוב. עוד קצת.'
  if (score >= 40) return 'מתחמם. אל תעצור.'
  return 'הגיע הזמן. קדימה.'
}

export function ScoreHero({ score, done, total, streak, dayCount }: Props) {
  const left = total - done
  const color = gradeColor(score)

  // SVG ring calculations
  const size = 140
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  // Progress line width: score % of total
  const progressPct = Math.min(score, 100)

  // Build streak squares — last 7 entries ending at current day
  const streakSquares = Array.from({ length: 7 }, (_, i) => i < streak)

  return (
    <div className="shrink-0 border-b border-border relative" style={{ height: '220px' }}>
      {/* Dynamic gold progress line at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-border">
        <div
          className="absolute top-0 right-0 h-full transition-all duration-1000"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(to left, #f5c435, #e8a020)',
          }}
        />
      </div>

      <div className="flex items-center px-10 gap-10 h-full">

        {/* Left: huge score number */}
        <div className="shrink-0">
          <p className="text-[8px] tracking-[6px] uppercase font-bold text-muted mb-1">TODAY'S SCORE</p>
          <div
            className="font-display leading-none"
            style={{ fontSize: '130px', color, lineHeight: 1 }}
          >
            {score}
          </div>
        </div>

        {/* Center: SVG ring */}
        <div className="shrink-0 relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            style={{
              transform: 'rotate(-90deg)',
              filter: score > 0 ? 'drop-shadow(0 0 20px rgba(232,160,32,0.5))' : 'none',
              transition: 'filter 0.5s',
            }}
          >
            <defs>
              <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e8a020" />
                <stop offset="100%" stopColor="#f5c435" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#252336"
              strokeWidth={strokeWidth}
            />
            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#ringGold)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          </svg>
          {/* Grade text centered */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: 'rotate(0deg)' }}
          >
            <span className="font-display text-lg leading-none" style={{ color }}>
              {grade(score)}
            </span>
            <span className="text-[10px] text-muted mt-0.5">{score}%</span>
          </div>
        </div>

        {/* Right: grade label + stats + streak */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Grade label + Hebrew subtitle */}
          <div>
            <div className="font-display text-4xl leading-none" style={{ color }}>
              {grade(score)}
            </div>
            <p className="text-sm text-sub mt-1 font-medium" dir="rtl">
              {gradeSub(score)}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display text-3xl leading-none text-text">{done}</div>
              <div className="text-[8px] tracking-[3px] uppercase text-muted mt-0.5">Done</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="font-display text-3xl leading-none text-text">{left}</div>
              <div className="text-[8px] tracking-[3px] uppercase text-muted mt-0.5">Left</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="font-display text-3xl leading-none text-text">{dayCount}</div>
              <div className="text-[8px] tracking-[3px] uppercase text-muted mt-0.5">Day #</div>
            </div>
          </div>

          {/* Streak squares */}
          <div className="flex gap-1.5">
            {streakSquares.map((active, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #e8a020, #f5c435)',
                        color: '#000',
                      }
                    : {
                        background: '#1c1b2e',
                        border: '1px solid #252336',
                        color: '#5a5878',
                      }
                }
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
