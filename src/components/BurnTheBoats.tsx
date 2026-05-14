import { useState } from 'react'
import { Flame, X, Lock } from 'lucide-react'
import type { BurnTheBoats as BurnTheBoatsType } from '../types'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  current?: BurnTheBoatsType
  onSave:   (btb: BurnTheBoatsType) => void
  onClear:  () => void
}

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

export function BurnTheBoats({ current, onSave, onClear }: Props) {
  const [open,        setOpen]        = useState(false)
  const [commitment,  setCommitment]  = useState('')
  const [consequence, setConsequence] = useState('')
  const [deadline,    setDeadline]    = useState('')

  const canSave = commitment.trim().length > 5 && consequence.trim().length > 5 && deadline

  const handleSave = () => {
    if (!canSave) return
    onSave({ commitment: commitment.trim(), consequence: consequence.trim(), deadline, createdAt: new Date().toISOString() })
    playComplete(); setOpen(false)
    setCommitment(''); setConsequence(''); setDeadline('')
  }

  if (!current && !open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full flex items-center justify-center gap-2"
        style={{ padding: '13px 16px', fontWeight: 900, fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', cursor: 'pointer', borderRadius: 12 }} dir="rtl">
        <Flame className="w-4 h-4" />שרוף את הספינות — התחייב
      </button>
    )
  }

  if (open && !current) {
    return (
      <div className="animate-slide-up card" style={{ borderLeft: '3px solid #ef4444', background: '#12121a' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" style={{ color: '#ef4444' }} />
            <p className="label-xs" style={{ color: '#ef4444' }}>BURN THE BOATS</p>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X className="w-4 h-4" style={{ color: '#6b6b8a' }} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={commitment} onChange={e => { setCommitment(e.target.value); if(e.target.value.length===1) playCheck() }}
            placeholder="מה אתה מתחייב להשיג?" dir="rtl"
            style={{ width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 600, background: '#1a1a28', border: '1px solid rgba(239,68,68,0.2)', color: '#e8e8f0', outline: 'none', borderRadius: 10 }} />
          <input value={consequence} onChange={e => setConsequence(e.target.value)}
            placeholder="מה יקרה אם לא תעמוד? (תרומה, עונש, הכרזה)" dir="rtl"
            style={{ width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 600, background: '#1a1a28', border: '1px solid rgba(239,68,68,0.2)', color: '#e8e8f0', outline: 'none', borderRadius: 10 }} />
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 600, background: '#1a1a28', border: '1px solid rgba(239,68,68,0.2)', color: '#e8e8f0', outline: 'none', borderRadius: 10, colorScheme: 'dark' }} />
        </div>
        <button onClick={handleSave} disabled={!canSave} className="btn-red w-full mt-4" style={{ padding: '15px', fontSize: 14 }} dir="rtl">
          🔥 שורפים את הספינות — אין חזרה
        </button>
      </div>
    )
  }

  if (current) {
    const days = daysLeft(current.deadline)
    const urgent = days <= 7
    return (
      <div className="animate-slide-up card" style={{ borderLeft: `3px solid ${urgent ? '#ef4444' : 'rgba(239,68,68,0.4)'}`, background: urgent ? 'rgba(239,68,68,0.06)' : '#12121a' }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
            <p className="label-xs" style={{ color: '#ef4444' }}>BURN THE BOATS</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="label-xs" style={{ color: urgent ? '#ef4444' : '#6b6b8a', fontWeight: 900 }}>{days} ימים</span>
            <button onClick={onClear} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X className="w-3.5 h-3.5" style={{ color: '#6b6b8a' }} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 900, color: '#e8e8f0', lineHeight: 1.4, marginBottom: 6 }} dir="rtl">{current.commitment}</p>
        <p style={{ fontSize: 12, color: '#6b6b8a', lineHeight: 1.5 }} dir="rtl">⚠️ אחרת: {current.consequence}</p>
        {urgent && <p style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', marginTop: 8 }} dir="rtl">⏰ {days === 0 ? 'היום!' : `נשארו ${days} ימים`}</p>}
      </div>
    )
  }
  return null
}
