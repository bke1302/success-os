import { useState } from 'react'
import { Shield, Target } from 'lucide-react'
import type { DayEntry, WeeklyPlan } from '../types'
import { getLastMondayDate } from '../utils/aiCoach'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  entries:    DayEntry[]
  plans:      WeeklyPlan[]
  onSave:     (plan: WeeklyPlan) => void
}

function getThisWeekWins(entries: DayEntry[]): string[] {
  const monday = getLastMondayDate()
  return entries
    .filter(e => e.date >= monday && e.evening?.given)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map(e => e.evening!.given ?? e.evening!.win)
}

export function WeeklyWarRoom({ entries, plans, onSave }: Props) {
  const weekStart = getLastMondayDate()
  const existing  = plans.find(p => p.weekStart === weekStart)

  const autoWins = getThisWeekWins(entries)
  const [wins, setWins]   = useState<[string,string,string]>(
    existing?.wins ?? [autoWins[0]??'', autoWins[1]??'', autoWins[2]??'']
  )
  const [goals, setGoals] = useState<[string,string,string]>(existing?.goals ?? ['','',''])
  const [saved, setSaved] = useState(!!existing)

  const updateWin  = (i: number, v: string) => setWins(w  => { const n=[...w]  as [string,string,string]; n[i]=v; return n })
  const updateGoal = (i: number, v: string) => setGoals(g => { const n=[...g]  as [string,string,string]; n[i]=v; return n })

  const canSave = goals.some(g => g.trim().length > 2)

  const handleSave = () => {
    if (!canSave) return
    onSave({ weekStart, wins, goals, createdAt: new Date().toISOString() })
    playComplete()
    setSaved(true)
  }

  const today = new Date()
  const weekLabel = today.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#080810', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Ambient */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, right: -50,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,196,53,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div className="shrink-0 px-5 pt-8 pb-5" style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[7px] tracking-[5px] uppercase text-muted mb-1">WEEKLY WAR ROOM</p>
        <h1 className="text-2xl font-black gold-text" dir="rtl">חדר המלחמה השבועי</h1>
        <p className="text-xs text-sub mt-1" dir="rtl">שבוע {weekLabel} — סקירה ותכנון</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ position: 'relative', zIndex: 1 }}>

        {/* Section 1: Wins */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4" style={{ color: '#22c55e' }} />
            <p className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: '#22c55e' }}>
              3 ניצחונות השבוע שעבר
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {([0,1,2] as const).map(i => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-black w-5 text-center shrink-0" style={{ color: '#22c55e' }}>{i+1}</span>
                <input
                  value={wins[i]}
                  onChange={e => { updateWin(i, e.target.value); if(e.target.value.length===1) playCheck() }}
                  placeholder={`ניצחון ${i+1}…`}
                  dir="rtl"
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
                  style={{
                    background: wins[i].trim() ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${wins[i].trim() ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5" style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(245,196,53,0.3), transparent)' }} />

        {/* Section 2: Goals */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" style={{ color: '#f5c435' }} />
            <p className="text-[8px] tracking-[4px] uppercase font-black" style={{ color: '#f5c435' }}>
              3 מטרות לשבוע הבא
            </p>
          </div>
          <p className="text-xs text-sub mb-3" dir="rtl">
            מה 3 הדברים שאם תעשה אותם — השבוע הזה יהיה ניצחון? לא רשימה. מטרות.
          </p>
          <div className="flex flex-col gap-2">
            {([0,1,2] as const).map(i => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-black w-5 text-center shrink-0" style={{ color: '#f5c435' }}>{i+1}</span>
                <input
                  value={goals[i]}
                  onChange={e => { updateGoal(i, e.target.value); if(e.target.value.length===1) playCheck() }}
                  placeholder={`מטרה ${i+1}…`}
                  dir="rtl"
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none"
                  style={{
                    background: goals[i].trim() ? 'rgba(245,196,53,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${goals[i].trim() ? 'rgba(245,196,53,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Past plans */}
        {plans.filter(p => p.weekStart !== weekStart).length > 0 && (
          <div>
            <p className="text-[8px] tracking-[4px] uppercase text-muted mb-3">שבועות קודמים</p>
            <div className="flex flex-col gap-2">
              {plans.filter(p => p.weekStart !== weekStart).slice(0,3).map(plan => (
                <div key={plan.weekStart} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] text-muted mb-2">{plan.weekStart}</p>
                  <div className="flex flex-col gap-1">
                    {plan.goals.filter(g=>g.trim()).map((g,i) => (
                      <p key={i} className="text-xs text-white" dir="rtl">🎯 {g}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="shrink-0 px-5 pb-5 pt-3" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,16,0.95)' }}>
        {saved ? (
          <div className="w-full py-4 rounded-2xl text-center font-bold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }} dir="rtl">
            ✓ חדר המלחמה נשמר — יאללה לשבוע!
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg,#f5c435,#e8a020)', color: '#000' }}
            dir="rtl"
          >
            נעל את השבוע 🔒
          </button>
        )}
      </div>
    </div>
  )
}
