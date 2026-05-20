import { useState } from 'react'
import { Flame, X, Lock } from 'lucide-react'
import type { BurnTheBoats as BurnTheBoatsType } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  current?: BurnTheBoatsType
  onSave:   (btb: BurnTheBoatsType) => void
  onClear:  () => void
}

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
}

export function BurnTheBoats({ current, onSave, onClear }: Props) {
  const T = useTheme()
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
      <button onClick={() => setOpen(true)} aria-label="פתח טופס Burn The Boats — התחייב" className="w-full"
        style={{ padding: '13px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13,
          letterSpacing: '.5px', textTransform: 'uppercase',
          background: 'rgba(255,55,95,.07)', border: '1px solid rgba(255,55,95,.2)',
          color: '#FF375F', cursor: 'pointer', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} dir="rtl">
        <Flame className="w-4 h-4" /> BURN THE BOATS — התחייב
      </button>
    )
  }

  if (open && !current) {
    return (
      <div className="animate-slide-up card" style={{ borderRight: '3px solid #FF375F' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame className="w-4 h-4" style={{ color: '#FF375F' }} />
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#FF375F', textTransform: 'uppercase' }}>BURN THE BOATS</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="סגור טופס" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X className="w-4 h-4" style={{ color: T.textMuted }} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={commitment} onChange={e => { setCommitment(e.target.value); if(e.target.value.length===1) playCheck() }}
            placeholder="מה אתה מתחייב להשיג?" dir="rtl" aria-label="מה אתה מתחייב להשיג"
            style={{ width: '100%', padding: '12px 14px', fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: 500,
              background: T.tagBg, border: '1px solid rgba(255,55,95,.2)', color: T.text, outline: 'none', borderRadius: 10 }} />
          <input value={consequence} onChange={e => setConsequence(e.target.value)}
            placeholder="מה יקרה אם לא תעמוד?" dir="rtl" aria-label="מה יקרה אם לא תעמוד בהתחייבות"
            style={{ width: '100%', padding: '12px 14px', fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: 500,
              background: T.tagBg, border: '1px solid rgba(255,55,95,.2)', color: T.text, outline: 'none', borderRadius: 10 }} />
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} aria-label="תאריך דדליין להתחייבות"
            style={{ width: '100%', padding: '12px 14px', fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: 500,
              background: T.tagBg, border: '1px solid rgba(255,55,95,.2)', color: T.text, outline: 'none', borderRadius: 10, colorScheme: T.isDark ? 'dark' : 'light' }} />
        </div>
        <button onClick={handleSave} disabled={!canSave} className="btn-red w-full mt-4"
          style={{ padding: '15px', fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 15 }} dir="rtl">
          שורפים את הספינות — אין חזרה
        </button>
      </div>
    )
  }

  if (current) {
    const days = daysLeft(current.deadline)
    const urgent = days <= 7
    return (
      <div className="animate-slide-up card" style={{ borderRight: `3px solid ${urgent ? '#FF375F' : 'rgba(255,55,95,.3)'}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF375F' }} />
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: '#FF375F', textTransform: 'uppercase' }}>BURN THE BOATS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 900, color: urgent ? '#FF375F' : T.textMuted }}>{days} ימים</span>
            <button onClick={onClear} aria-label="מחק התחייבות Burn The Boats" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X className="w-3.5 h-3.5" style={{ color: T.textMuted }} />
            </button>
          </div>
        </div>
        <p style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif", fontSize: 16, fontWeight: 700, color: T.text, lineHeight: 1.4, marginBottom: 6 }} dir="rtl">{current.commitment}</p>
        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: 12, color: T.textMuted, lineHeight: 1.5 }} dir="rtl">אחרת: {current.consequence}</p>
        {urgent && <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 900, color: '#FF375F', marginTop: 8, letterSpacing: '.5px' }} dir="rtl">{days === 0 ? 'היום!' : `נשארו ${days} ימים`}</p>}
      </div>
    )
  }
  return null
}
