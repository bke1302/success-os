import { useState } from 'react'
import { X } from 'lucide-react'
import type { EnergyCheckin } from '../types'
import { playCheck } from '../utils/sounds'

interface Props {
  label:   EnergyCheckin['label']
  onSave:  (c: EnergyCheckin) => void
  onClose: () => void
}

const LABEL_TEXT: Record<EnergyCheckin['label'], string> = {
  morning:   'בוקר',
  midday:    'צהריים',
  afternoon: 'אחה"צ',
}

export function EnergyCheckinOverlay({ label, onSave, onClose }: Props) {
  const [score, setScore] = useState(7)

  const handleSave = () => {
    onSave({ score, label, time: new Date().toISOString() })
    playCheck()
    onClose()
  }

  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f5c435' : score >= 4 ? '#f97316' : '#ef4444'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-up" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${color},transparent)` }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div dir="rtl">
              <p className="text-[7px] tracking-[4px] uppercase text-muted">צ׳ק-אין {LABEL_TEXT[label]}</p>
              <p className="text-xl font-black text-white mt-0.5">איפה אתה עכשיו?</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>

          {/* Big score display */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div
              className="text-8xl font-black transition-all duration-200"
              style={{ color, lineHeight: 1, filter: `drop-shadow(0 0 20px ${color}80)` }}
            >
              {score}
            </div>
            <p className="text-xs text-muted">/ 10</p>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <input
              type="range" min={1} max={10} value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: color }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted">💀 שרוף</span>
              <span className="text-[9px] text-muted">🔥 שיא</span>
            </div>
          </div>

          {/* Labels */}
          <div className="grid grid-cols-4 gap-1.5 mb-6">
            {[
              { range: [1,3], label: 'צריך לקום', color: '#ef4444' },
              { range: [4,6], label: 'בסדר', color: '#f97316' },
              { range: [7,8], label: 'ממוקד', color: '#f5c435' },
              { range: [9,10], label: 'PEAK 🔥', color: '#22c55e' },
            ].map(opt => (
              <div key={opt.label}
                className="rounded-lg py-2 text-center cursor-pointer transition-all"
                style={{
                  background: score >= opt.range[0] && score <= opt.range[1] ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${score >= opt.range[0] && score <= opt.range[1] ? opt.color + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
                onClick={() => setScore(Math.round((opt.range[0] + opt.range[1]) / 2))}
              >
                <p className="text-[9px] font-bold" style={{ color: opt.color }}>{opt.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl font-black text-base transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${color},${color}bb)`, color: score < 7 ? '#fff' : '#000' }}
            dir="rtl"
          >
            שמור צ׳ק-אין
          </button>
        </div>
      </div>
    </div>
  )
}
