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
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export function BurnTheBoats({ current, onSave, onClear }: Props) {
  const [open,        setOpen]        = useState(false)
  const [commitment,  setCommitment]  = useState('')
  const [consequence, setConsequence] = useState('')
  const [deadline,    setDeadline]    = useState('')

  const canSave = commitment.trim().length > 5 && consequence.trim().length > 5 && deadline

  const handleSave = () => {
    if (!canSave) return
    onSave({
      commitment:  commitment.trim(),
      consequence: consequence.trim(),
      deadline,
      createdAt:   new Date().toISOString(),
    })
    playComplete()
    setOpen(false)
    setCommitment(''); setConsequence(''); setDeadline('')
  }

  if (!current && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.98]"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
        dir="rtl"
      >
        <Flame className="w-4 h-4" />
        שרוף את הספינות — התחייב
      </button>
    )
  }

  if (open && !current) {
    return (
      <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#ef4444,transparent)' }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: '#ef4444' }} />
              <p className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: '#ef4444' }}>BURN THE BOATS</p>
            </div>
            <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted" /></button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-1.5" dir="rtl">ההתחייבות הבלתי הפיכה</p>
              <input
                value={commitment}
                onChange={e => { setCommitment(e.target.value); if(e.target.value.length===1) playCheck() }}
                placeholder="מה אתה מתחייב להשיג?"
                dir="rtl"
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
              />
            </div>
            <div>
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-1.5" dir="rtl">התוצאה אם לא תעמוד בה</p>
              <input
                value={consequence}
                onChange={e => setConsequence(e.target.value)}
                placeholder="מה יקרה אם לא תעמוד? (תרומה, עונש, הכרזה)"
                dir="rtl"
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
              />
            </div>
            <div>
              <p className="text-[8px] tracking-[3px] uppercase text-muted mb-1.5" dir="rtl">דדליין</p>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.15)', colorScheme: 'dark' }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-4 w-full py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}
            dir="rtl"
          >
            🔥 שורפים את הספינות — אין חזרה
          </button>
        </div>
      </div>
    )
  }

  if (current) {
    const days = daysLeft(current.deadline)
    const urgent = days <= 7

    return (
      <div className="rounded-2xl overflow-hidden animate-slide-up" style={{
        background: urgent ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${urgent ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.18)'}`,
        boxShadow: urgent ? '0 0 24px rgba(239,68,68,0.12)' : 'none',
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg,#ef4444,${urgent ? '#f97316' : 'transparent'})` }} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-[7px] tracking-[4px] uppercase font-black" style={{ color: '#ef4444' }}>BURN THE BOATS</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="px-2 py-1 rounded-lg text-[8px] font-black"
                style={{
                  background: urgent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                  color: urgent ? '#ef4444' : 'rgba(255,255,255,0.4)',
                }}
              >
                {days} ימים
              </div>
              <button onClick={onClear} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-3 h-3 text-muted" />
              </button>
            </div>
          </div>
          <p className="text-base font-black text-white mb-1" dir="rtl">{current.commitment}</p>
          <p className="text-xs text-sub" dir="rtl">⚠️ אחרת: {current.consequence}</p>
        </div>
      </div>
    )
  }

  return null
}
