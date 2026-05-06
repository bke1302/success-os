import { BookOpen, Brain, TrendingUp, Dumbbell, Target, Check } from 'lucide-react'
import { CHECKLIST_ITEMS } from '../constants'

interface Props {
  checks: Record<string, boolean>
  onToggle: (id: string) => void
}

const ICONS: Record<string, React.ElementType> = {
  c1: BookOpen,
  c2: Brain,
  c3: TrendingUp,
  c4: Dumbbell,
  c5: Target,
}

export function ChecklistCard({ checks, onToggle }: Props) {
  const done  = Object.values(checks).filter(Boolean).length
  const total = CHECKLIST_ITEMS.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top gold accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(232,160,32,0.6), transparent)' }}
      />

      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[8px] tracking-[5px] uppercase font-bold text-muted">DAILY PROTOCOL</p>
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-lg"
            style={{
              background: 'rgba(232,160,32,0.1)',
              border: '1px solid rgba(232,160,32,0.3)',
              color: '#e8a020',
            }}
          >
            {done}/{total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #e8a020, #f5c435)',
              boxShadow: pct > 0 ? '0 0 8px rgba(245,196,53,0.4)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 px-4 pb-4">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = checks[item.id] ?? false
          const Icon   = ICONS[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-right transition-all duration-200"
              style={{
                background: isDone ? 'rgba(232,160,32,0.07)' : 'rgba(255,255,255,0.02)',
                border: isDone ? '1px solid rgba(232,160,32,0.2)' : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* Checkbox */}
              <div
                className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center border transition-all duration-200"
                style={
                  isDone
                    ? { background: 'linear-gradient(135deg,#f5c435,#e8a020)', borderColor: 'transparent', boxShadow: '0 0 8px rgba(232,160,32,0.4)' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                {isDone && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
              </div>

              {/* Label */}
              <span
                className="flex-1 text-sm font-medium text-right transition-all duration-200"
                style={{
                  color: isDone ? 'rgba(240,238,255,0.3)' : 'rgba(240,238,255,0.85)',
                  textDecoration: isDone ? 'line-through' : 'none',
                }}
              >
                {item.label}
              </span>

              {/* Icon */}
              {Icon && (
                <Icon
                  className="w-3.5 h-3.5 shrink-0 transition-colors duration-200"
                  style={{ color: isDone ? '#e8a020' : 'rgba(255,255,255,0.15)' }}
                  strokeWidth={1.5}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* All done banner */}
      {done === total && (
        <div
          className="border-t py-3 text-center animate-fadeUp"
          style={{
            borderColor: 'rgba(245,196,53,0.2)',
            background: 'linear-gradient(90deg, rgba(232,160,32,0.06), rgba(245,196,53,0.1), rgba(232,160,32,0.06))',
          }}
        >
          <p
            className="text-[8px] tracking-[4px] uppercase font-bold"
            style={{ color: '#f5c435' }}
          >
            Protocol Complete · Elite Performance
          </p>
        </div>
      )}
    </div>
  )
}
