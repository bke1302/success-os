import { History } from 'lucide-react'

interface Props {
  score: number
  done: number
  total: number
  streak: number
  dayCount: number
  onResetDay: () => void
  compact?: boolean
}

function getGrade(s: number) {
  if (s >= 80) return { label: 'ELITE', he: 'אתה בשיא.',      color: '#f5c435', glow: 'rgba(245,196,53,0.35)' }
  if (s >= 60) return { label: 'SOLID', he: 'מחזיק חזק.',     color: '#e8a020', glow: 'rgba(232,160,32,0.25)' }
  if (s >= 40) return { label: 'GRIND', he: 'תמשיך לדחוף.',   color: '#f97316', glow: 'rgba(249,115,22,0.2)'  }
  return             { label: 'START', he: 'הגיע הזמן לקום.', color: '#94a3b8', glow: 'rgba(148,163,184,0.1)' }
}

/* ─── Mobile compact strip ─────────────────────────────── */
export function ScoreBanner({ score, done, total, streak, onResetDay }: Omit<Props, 'compact'>) {
  const grade = getGrade(score)
  const r = 26
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div
      className="w-full flex items-center gap-4 px-5 py-4"
      style={{
        background: `radial-gradient(ellipse at 20% 50%, ${grade.glow} 0%, transparent 70%), #0a0916`,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Mini ring */}
      <div className="relative shrink-0">
        <svg width="60" height="60" className="-rotate-90">
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle
            cx="30" cy="30" r={r}
            fill="none"
            stroke={grade.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 5px ${grade.color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display leading-none text-xl" style={{ color: grade.color }}>{score}</span>
        </div>
      </div>

      {/* Grade + Hebrew */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[9px] tracking-[4px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ background: `${grade.color}18`, border: `1px solid ${grade.color}40`, color: grade.color }}
          >
            {grade.label}
          </span>
          <span className="text-[9px] font-bold text-muted">
            {done}/{total}
          </span>
        </div>
        <p className="text-sm font-semibold text-text/80" dir="rtl">{grade.he}</p>
      </div>

      {/* Streak dots */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <p className="text-[7px] tracking-[3px] uppercase font-bold text-muted">STREAK</p>
        <div className="flex gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-sm"
              style={{
                background: i < streak ? grade.color : 'rgba(255,255,255,0.05)',
                border: i < streak ? 'none' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: i < streak ? `0 0 4px ${grade.glow}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* End day (icon only on mobile) */}
      <button
        onClick={onResetDay}
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        title="End Day"
      >
        <History className="w-4 h-4 text-muted" strokeWidth={1.5} />
      </button>
    </div>
  )
}

/* ─── Desktop full panel ────────────────────────────────── */
export function ScorePanel({ score, done, total, streak, dayCount, onResetDay }: Props) {
  const grade = getGrade(score)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden select-none"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${grade.glow} 0%, transparent 70%), #0a0916`,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Vertical accent line */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: `linear-gradient(to bottom, transparent, ${grade.color}40, transparent)` }}
      />

      {/* Day counter */}
      <div className="px-8 pt-8 pb-0 shrink-0">
        <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">DAY {dayCount}</p>
      </div>

      {/* Score centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-2">
        <div className="relative mb-2">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={grade.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.6s ease', filter: `drop-shadow(0 0 8px ${grade.color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display leading-none"
              style={{ fontSize: '52px', color: grade.color, filter: `drop-shadow(0 0 20px ${grade.glow})`, transition: 'color 0.6s ease' }}
            >
              {score}
            </span>
            <span className="text-[9px] tracking-[4px] font-bold text-muted uppercase mt-0.5">SCORE</span>
          </div>
        </div>

        <div
          className="px-5 py-1.5 rounded-full text-[10px] tracking-[5px] font-bold uppercase"
          style={{ background: `${grade.color}15`, border: `1px solid ${grade.color}40`, color: grade.color }}
        >
          {grade.label}
        </div>

        <p className="text-xl font-semibold text-center mt-1" style={{ color: 'rgba(240,238,255,0.8)', direction: 'rtl' }}>
          {grade.he}
        </p>

        <div className="flex items-center gap-6 mt-4">
          <div className="text-center">
            <div className="font-display text-3xl leading-none" style={{ color: grade.color }}>{done}</div>
            <div className="text-[8px] tracking-[3px] uppercase font-bold text-muted mt-1">DONE</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="font-display text-3xl leading-none text-muted">{total - done}</div>
            <div className="text-[8px] tracking-[3px] uppercase font-bold text-muted mt-1">LEFT</div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <p className="text-[8px] tracking-[4px] uppercase font-bold text-muted mb-2.5 text-center">
            STREAK · {streak} DAYS
          </p>
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="h-6 rounded-sm transition-all duration-500"
                style={{
                  width: '22px',
                  background: i < streak ? `linear-gradient(135deg, ${grade.color}, ${grade.color}99)` : 'rgba(255,255,255,0.04)',
                  border: i < streak ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: i < streak ? `0 0 6px ${grade.glow}` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* End Day */}
      <div className="px-8 pb-8 pt-4 shrink-0">
        <button
          onClick={onResetDay}
          className="w-full py-3.5 rounded-2xl text-[10px] tracking-[4px] uppercase font-bold transition-all duration-200 flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a4868' }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = `${grade.color}50`
            el.style.color = grade.color
            el.style.background = `${grade.color}08`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'rgba(255,255,255,0.08)'
            el.style.color = '#4a4868'
            el.style.background = 'rgba(255,255,255,0.04)'
          }}
        >
          <History className="w-3.5 h-3.5" strokeWidth={1.5} />
          END DAY
        </button>
      </div>
    </div>
  )
}
