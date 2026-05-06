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
  const done = Object.values(checks).filter(Boolean).length

  return (
    <div className="bg-surface rounded-card p-6 border border-border h-full relative overflow-hidden">
      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Daily Protocol</p>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
          style={{
            color: '#d4a43a',
            borderColor: 'rgba(212,164,58,0.4)',
            background: 'rgba(212,164,58,0.08)',
          }}
        >
          {done}/{CHECKLIST_ITEMS.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = checks[item.id] ?? false
          const Icon   = ICONS[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-3 w-full p-4 rounded-xl text-right transition-all duration-200 border ${
                isDone
                  ? 'border-gold/30 opacity-60'
                  : 'bg-surface2 border-border/50 hover:border-border hover:bg-surface2/80'
              }`}
              style={isDone ? { background: 'rgba(212,164,58,0.10)' } : undefined}
            >
              {/* Checkbox on left (RTL = right side visually) */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isDone ? 'border-gold' : 'border-border'
                }`}
                style={isDone ? { background: 'linear-gradient(135deg, #f5c842, #d4a43a)' } : undefined}
              >
                {isDone && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
              </div>

              {/* Label */}
              <span
                className={`flex-1 text-base font-semibold text-right ${
                  isDone ? 'line-through text-sub' : 'text-white'
                }`}
              >
                {item.label}
              </span>

              {/* Icon on right (RTL = left side visually) */}
              <Icon
                className={`w-4 h-4 shrink-0 ${isDone ? 'text-gold' : 'text-muted'}`}
                strokeWidth={1.5}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
