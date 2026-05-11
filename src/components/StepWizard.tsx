import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Step {
  title: string
  subtitle?: string
  content: React.ReactNode
  canAdvance: boolean
  onAdvance?: () => void
}

interface Props {
  steps: Step[]
  onComplete: () => void
  completeLabel?: string
}

export function StepWizard({ steps, onComplete, completeLabel = 'בוא נתחיל ⚡' }: Props) {
  const [current, setCurrent] = useState(0)
  const step = steps[current]
  const isLast = current === steps.length - 1

  const advance = () => {
    step.onAdvance?.()
    if (isLast) { onComplete(); return }
    setCurrent(c => c + 1)
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }}>

      {/* Header */}
      <div
        className="shrink-0 px-6 pt-8 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Step dots */}
        <div className="flex items-center gap-2 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width:      i === current ? '24px' : '6px',
                height:     '6px',
                background: i < current
                  ? 'rgba(245,196,53,0.4)'
                  : i === current
                  ? 'linear-gradient(90deg,#f5c435,#e8a020)'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
          <span className="text-[8px] tracking-[3px] uppercase text-muted mr-2">
            {current + 1}/{steps.length}
          </span>
        </div>

        <h1
          className="font-display text-3xl md:text-4xl leading-tight gold-text"
          dir="rtl"
        >
          {step.title}
        </h1>
        {step.subtitle && (
          <p className="text-sm text-sub mt-1.5 leading-relaxed" dir="rtl">
            {step.subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div
        key={current}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ animation: 'primeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        {step.content}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-6 py-5 flex items-center gap-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(2,2,10,0.9)',
          backdropFilter: 'blur(20px)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {current > 0 && (
          <button
            onClick={() => setCurrent(c => c - 1)}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronRight className="w-5 h-5 text-muted" strokeWidth={1.5} />
          </button>
        )}

        <button
          onClick={advance}
          disabled={!step.canAdvance}
          className="flex-1 py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={
            step.canAdvance
              ? {
                  background: isLast
                    ? 'linear-gradient(135deg,#f5c435,#e8a020)'
                    : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#000',
                  boxShadow: isLast
                    ? '0 0 30px rgba(245,196,53,0.35)'
                    : '0 0 30px rgba(239,68,68,0.35)',
                }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
          }
          dir="rtl"
        >
          {isLast ? completeLabel : 'המשך'}
        </button>
      </div>
    </div>
  )
}
