import { useState } from 'react'
import type { DayEntry, WeeklyPlan } from '../types'
import { getLastMondayDate } from '../utils/aiCoach'
import { playCheck, playComplete } from '../utils/sounds'

interface Props { entries: DayEntry[]; plans: WeeklyPlan[]; onSave: (p: WeeklyPlan) => void }

function getThisWeekWins(entries: DayEntry[]): string[] {
  const monday = getLastMondayDate()
  return entries
    .filter(e => e.date >= monday && e.evening?.given)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0,3).map(e => e.evening!.given ?? e.evening!.win)
}

export function WeeklyWarRoom({ entries, plans, onSave }: Props) {
  const weekStart = getLastMondayDate()
  const existing  = plans.find(p => p.weekStart === weekStart)
  const autoWins  = getThisWeekWins(entries)

  const [wins,  setWins]  = useState<[string,string,string]>(existing?.wins  ?? [autoWins[0]??'',autoWins[1]??'',autoWins[2]??''])
  const [goals, setGoals] = useState<[string,string,string]>(existing?.goals ?? ['','',''])
  const [saved, setSaved] = useState(!!existing)

  const updateWin  = (i:number,v:string) => setWins(w  => { const n=[...w]  as [string,string,string]; n[i]=v; return n })
  const updateGoal = (i:number,v:string) => setGoals(g => { const n=[...g]  as [string,string,string]; n[i]=v; return n })

  const canSave = goals.some(g => g.trim().length > 2)

  const handleSave = () => {
    if (!canSave) return
    onSave({ weekStart, wins, goals, createdAt: new Date().toISOString() })
    playComplete(); setSaved(true)
  }

  const weekLabel = new Date().toLocaleDateString('he-IL',{day:'numeric',month:'long'})

  return (
    <div style={{ height:'100dvh', overflow:'hidden', background:'#0a0a0a', display:'flex', flexDirection:'column' }}>

      <div className="shrink-0" style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
        <p className="label-xs mb-2" style={{ color:'rgba(249,115,22,0.7)' }}>WEEKLY WAR ROOM</p>
        <h1 style={{ fontSize:28, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }} dir="rtl">חדר המלחמה</h1>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:4 }} dir="rtl">שבוע {weekLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding:'0 0 32px' }}>

        {/* Wins */}
        <div className="mx-5 mt-5">
          <div style={{ borderLeft:'3px solid #22c55e', paddingLeft:14, marginBottom:20 }}>
            <p className="label-xs mb-4" style={{ color:'#22c55e' }}>3 ניצחונות השבוע שעבר</p>
            {([0,1,2] as const).map(i => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span style={{ fontSize:11, fontWeight:900, color:'#22c55e', minWidth:16 }}>{i+1}</span>
                <input value={wins[i]} onChange={e => { updateWin(i,e.target.value); if(e.target.value.length===1) playCheck() }}
                  placeholder={`ניצחון ${i+1}…`} dir="rtl"
                  style={{ flex:1, padding:'12px 14px', background:'#111', border:`1px solid ${wins[i].trim()?'rgba(34,197,94,0.25)':'rgba(255,255,255,0.1)'}`, color:'#fff', fontSize:14, fontWeight:600, outline:'none', borderRadius:0 }} />
              </div>
            ))}
          </div>

          {/* Goals */}
          <div style={{ borderLeft:'3px solid #f5c435', paddingLeft:14 }}>
            <p className="label-xs mb-2" style={{ color:'#f5c435' }}>3 מטרות לשבוע הבא</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:16, lineHeight:1.5 }} dir="rtl">
              מה 3 הדברים שאם תעשה אותם — השבוע הזה יהיה ניצחון?
            </p>
            {([0,1,2] as const).map(i => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <span style={{ fontSize:11, fontWeight:900, color:'#f5c435', minWidth:16 }}>{i+1}</span>
                <input value={goals[i]} onChange={e => { updateGoal(i,e.target.value); if(e.target.value.length===1) playCheck() }}
                  placeholder={`מטרה ${i+1}…`} dir="rtl"
                  style={{ flex:1, padding:'12px 14px', background:'#111', border:`1px solid ${goals[i].trim()?'rgba(245,196,53,0.3)':'rgba(255,255,255,0.1)'}`, color:'#fff', fontSize:14, fontWeight:600, outline:'none', borderRadius:0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Past plans */}
        {plans.filter(p=>p.weekStart!==weekStart).length > 0 && (
          <div className="mx-5 mt-6" style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:16 }}>
            <p className="label-xs mb-4">שבועות קודמים</p>
            {plans.filter(p=>p.weekStart!==weekStart).slice(0,3).map(plan => (
              <div key={plan.weekStart} style={{ borderLeft:'2px solid rgba(255,255,255,0.1)', paddingLeft:12, marginBottom:14 }}>
                <p className="label-xs mb-2">{plan.weekStart}</p>
                {plan.goals.filter(g=>g.trim()).map((g,i) => (
                  <p key={i} style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5 }} dir="rtl">→ {g}</p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0" style={{ padding:'16px 20px', paddingBottom:'max(16px, env(safe-area-inset-bottom))', borderTop:'2px solid rgba(255,255,255,0.12)', background:'#0a0a0a' }}>
        {saved ? (
          <div style={{ padding:'18px', textAlign:'center', fontWeight:900, fontSize:14, color:'#22c55e', border:'2px solid rgba(34,197,94,0.3)' }} dir="rtl">
            ✓ נעול — יאללה לשבוע!
          </div>
        ) : (
          <button onClick={handleSave} disabled={!canSave}
            className="btn-red w-full"
            style={{ padding:'18px', fontSize:15, borderRadius:0 }} dir="rtl">
            נעל את השבוע 🔒
          </button>
        )}
      </div>
    </div>
  )
}
