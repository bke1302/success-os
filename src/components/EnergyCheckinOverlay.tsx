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
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', padding: '0 0 32px' }}>
      <div className="w-full animate-slide-up" style={{ maxWidth: 420, background: '#0a0a0a', borderTop: `3px solid ${color}` }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div dir="rtl">
            <p className="label-xs mb-1" style={{ color }}>צ׳ק-אין {LABEL_TEXT[label]}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>איפה אתה עכשיו?</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 8px', cursor: 'pointer', borderRadius: 0 }}>
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>

          {/* Big score */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '5rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
            <div className="label-xs mt-1">/ 10</div>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="range" min={1} max={10} value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: color }}
            />
            <div className="flex justify-between mt-1">
              <span className="label-xs">💀 שרוף</span>
              <span className="label-xs">🔥 שיא</span>
            </div>
          </div>

          {/* Quick labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
            {[
              { range: [1,3] as [number,number], label: 'צריך לקום', color: '#ef4444' },
              { range: [4,6] as [number,number], label: 'בסדר', color: '#f97316' },
              { range: [7,8] as [number,number], label: 'ממוקד', color: '#f5c435' },
              { range: [9,10] as [number,number], label: 'PEAK 🔥', color: '#22c55e' },
            ].map(opt => {
              const active = score >= opt.range[0] && score <= opt.range[1]
              return (
                <div key={opt.label}
                  onClick={() => setScore(Math.round((opt.range[0] + opt.range[1]) / 2))}
                  style={{
                    padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                    background: active ? `${opt.color}15` : 'transparent',
                    border: `1px solid ${active ? opt.color + '50' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 0,
                  }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: opt.color }}>{opt.label}</p>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSave}
            className="btn-red w-full"
            style={{ padding: '16px', fontSize: 15, borderRadius: 0, background: color, color: score < 7 ? '#fff' : '#000' }}
            dir="rtl"
          >
            שמור צ׳ק-אין
          </button>
        </div>
      </div>
    </div>
  )
}
