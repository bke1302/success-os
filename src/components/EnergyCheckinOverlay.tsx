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
  morning: 'בוקר', midday: 'צהריים', afternoon: 'אחה"צ',
}

export function EnergyCheckinOverlay({ label, onSave, onClose }: Props) {
  const [score, setScore] = useState(7)
  const handleSave = () => { onSave({ score, label, time: new Date().toISOString() }); playCheck(); onClose() }
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f5c435' : score >= 4 ? '#f97316' : '#ef4444'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)', padding: '0 16px 32px' }}>
      <div className="w-full animate-slide-up" style={{ maxWidth: 420, background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 20, borderTop: `3px solid ${color}`, overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2a2a3d' }}>
          <div dir="rtl">
            <p className="label-xs mb-1" style={{ color }}>צ׳ק-אין {LABEL_TEXT[label]}</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#e8e8f0' }}>איפה אתה עכשיו?</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="font-display" style={{ fontSize: '5rem', color, lineHeight: 1 }}>{score}</div>
            <div className="label-xs mt-1">/ 10</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full" style={{ accentColor: color }} />
            <div className="flex justify-between mt-1">
              <span className="label-xs">💀 שרוף</span>
              <span className="label-xs">🔥 שיא</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
            {[
              { range: [1,3] as [number,number], label: 'צריך לקום', color: '#ef4444' },
              { range: [4,6] as [number,number], label: 'בסדר', color: '#f97316' },
              { range: [7,8] as [number,number], label: 'ממוקד', color: '#f5c435' },
              { range: [9,10] as [number,number], label: 'PEAK 🔥', color: '#22c55e' },
            ].map(opt => {
              const active = score >= opt.range[0] && score <= opt.range[1]
              return (
                <div key={opt.label} onClick={() => setScore(Math.round((opt.range[0]+opt.range[1])/2))}
                  style={{ padding: '8px 4px', textAlign: 'center', cursor: 'pointer', background: active ? `${opt.color}15` : '#1a1a28', border: `1px solid ${active ? opt.color+'50' : '#2a2a3d'}`, borderRadius: 8 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: opt.color }}>{opt.label}</p>
                </div>
              )
            })}
          </div>
          <button onClick={handleSave} className="btn-red w-full" style={{ padding: '16px', fontSize: 15, background: color, color: score < 7 ? '#fff' : '#000' }} dir="rtl">
            שמור צ׳ק-אין
          </button>
        </div>
      </div>
    </div>
  )
}
