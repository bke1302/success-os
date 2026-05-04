import { CheckCircle2, Circle } from 'lucide-react'
import { CHECKLIST_ITEMS } from '../constants'

interface Props {
  checks: Record<string, boolean>
  onToggle: (id: string) => void
}

export function ChecklistCard({ checks, onToggle }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-[10px] tracking-[3px] uppercase text-muted mb-4 font-medium">
        ✅ צ'קליסט יומי
      </p>
      <div className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const done = checks[item.id] ?? false
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-right transition-all duration-200 border ${
                done
                  ? 'bg-[#0d2818] border-success/30 text-success'
                  : 'bg-card2 border-transparent hover:border-border text-text'
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted shrink-0" />
              )}
              <span className={`text-sm ${done ? 'line-through opacity-70' : ''}`}>
                {item.emoji} {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
