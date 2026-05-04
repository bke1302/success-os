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
    <div className="bg-surface rounded-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[9px] tracking-[4px] uppercase font-semibold text-muted">Daily Protocol</p>
        <span className="text-[10px] font-semibold text-sub">{done}/{CHECKLIST_ITEMS.length}</span>
      </div>

      <div className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = checks[item.id] ?? false
          const Icon = ICONS[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-3 w-full p-3.5 rounded-xl text-right transition-all duration-150 ${
                isDone
                  ? 'bg-white/5 opacity-50'
                  : 'bg-surface2 hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isDone ? 'text-white' : 'text-muted'}`}
                strokeWidth={1.5}
              />
              <span className={`flex-1 text-sm text-right ${isDone ? 'line-through text-sub' : 'text-text'}`}>
                {item.label}
              </span>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  isDone ? 'bg-white border-white' : 'border-border'
                }`}
              >
                {isDone && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
