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
  const color = score >= 8 ? '#30D158' : score >= 6 ? '#FFD60A' : score >= 4 ? '#FF9F0A' : '#FF375F'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.85)', padding: '0 16px 32px' }}>
      <div className="w-full animate-slide-up" style={{ maxWidth: 420, background: '#0c0c0c', border: '1px solid rgba(255,255,255,.09)', borderRadius: 20, borderTop: `3px solid ${color}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.09)' }}>
          <div dir="rtl">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color, textTransform: 'uppercase', marginBottom: 4 }}>צ׳ק-אין {LABEL_TEXT[label]}</p>
            <p style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 20, fontWeight: 700, color: '#f2f2f7' }}>איפה אתה עכשיו?</p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: '5rem', color, lineHeight: 1 }}>{score}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', marginTop: 4 }}>/ 10</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full" style={{ accentColor: color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase' }}>שרוף</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase' }}>שיא</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
            {[
              { range: [1,3] as [number,number], label: 'שרוף',   color: '#FF375F'   },
              { range: [4,6] as [number,number], label: 'בסדר',   color: '#FF9F0A'  },
              { range: [7,8] as [number,number], label: 'ממוקד',  color: '#FFD60A'  },
              { range: [9,10] as [number,number],label: 'PEAK',   color: '#30D158' },
            ].map(opt => {
              const active = score >= opt.range[0] && score <= opt.range[1]
              return (
                <div key={opt.label} onClick={() => setScore(Math.round((opt.range[0]+opt.range[1])/2))}
                  style={{ padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                    background: active ? `${opt.color}15` : 'rgba(255,255,255,.04)',
                    border: `1px solid ${active ? opt.color+'50' : 'rgba(255,255,255,.09)'}`,
                    borderRadius: 8 }}>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, color: opt.color }}>{opt.label}</p>
                </div>
              )
            })}
          </div>
          <button onClick={handleSave} className="btn-red w-full"
            style={{ padding: '16px', fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 15, background: color, color: score < 7 ? '#fff' : '#000' }} dir="rtl">
            שמור
          </button>
        </div>
      </div>
    </div>
  )
}
