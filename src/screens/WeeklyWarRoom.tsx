import { useState } from 'react'
import type { DayEntry, WeeklyPlan } from '../types'
import { getLastMondayDate } from '../utils/aiCoach'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props { entries: DayEntry[]; plans: WeeklyPlan[]; onSave: (p: WeeklyPlan) => void }

function getThisWeekWins(entries: DayEntry[]): string[] {
  const monday = getLastMondayDate()
  return entries
    .filter(e => e.date >= monday && e.evening?.given)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0,3).map(e => e.evening!.given ?? e.evening!.win)
}

export function WeeklyWarRoom({ entries, plans, onSave }: Props) {
  const T = useTheme()
  const weekStart = getLastMondayDate()
  const existing  = plans.find(p => p.weekStart === weekStart)
  const autoWins  = getThisWeekWins(entries)

  const [wins,  setWins]  = useState<[string,string,string]>(existing?.wins  ?? [autoWins[0]??'',autoWins[1]??'',autoWins[2]??''])
  const [goals, setGoals] = useState<[string,string,string]>(existing?.goals ?? ['','',''])
  const [saved, setSaved] = useState(!!existing)

  const updateWin  = (i:number,v:string) => setWins(w  => { const n=[...w] as [string,string,string]; n[i]=v; return n })
  const updateGoal = (i:number,v:string) => setGoals(g => { const n=[...g] as [string,string,string]; n[i]=v; return n })

  const canSave = goals.some(g => g.trim().length > 2)
  const handleSave = () => {
    if (!canSave) return
    onSave({ weekStart, wins, goals, createdAt: new Date().toISOString() })
    playComplete(); setSaved(true)
  }

  const weekLabel = new Date().toLocaleDateString('he-IL',{day:'numeric',month:'long'})

  return (
    <div style={{ height:'100%', overflow:'hidden', background: T.bg, display:'flex', flexDirection:'column', transition: 'background .3s' }}>
      <div className="shrink-0" style={{ padding:'24px 20px 20px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:'rgba(255,159,10,.7)', textTransform:'uppercase', marginBottom:6 }}>חדר מלחמה שבועי</p>
        <h1 style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:26, fontWeight:900, color: T.text }} dir="rtl">חדר המלחמה</h1>
        <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color: T.textMuted, marginTop:4 }} dir="rtl">שבוע {weekLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding:'20px 20px 32px' }}>
        <div className="card mb-4" style={{ borderRight:'3px solid #30D158' }}>
          <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:'#30D158', textTransform:'uppercase', marginBottom:16 }}>3 ניצחונות השבוע שעבר</p>
          {([0,1,2] as const).map(i => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, fontWeight:900, color:'#30D158', minWidth:16 }}>{i+1}</span>
              <input value={wins[i]} onChange={e => { updateWin(i,e.target.value); if(e.target.value.length===1) playCheck() }}
                placeholder={`ניצחון ${i+1}…`} dir="rtl"
                style={{ flex:1, padding:'11px 14px', fontFamily:"'Heebo', sans-serif", background: T.tagBg,
                  border:`1px solid ${wins[i].trim()?'rgba(48,209,88,.3)': T.border}`,
                  color: T.text, fontSize:14, fontWeight:500, outline:'none', borderRadius:10 }} />
            </div>
          ))}
        </div>

        <div className="card mb-4" style={{ borderRight:'3px solid #FFD60A' }}>
          <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:'#FFD60A', textTransform:'uppercase', marginBottom:6 }}>3 מטרות לשבוע הבא</p>
          <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color: T.textMuted, marginBottom:16, lineHeight:1.5 }} dir="rtl">מה 3 הדברים שאם תעשה אותם — השבוע הזה יהיה ניצחון?</p>
          {([0,1,2] as const).map(i => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
              <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:11, fontWeight:900, color:'#FFD60A', minWidth:16 }}>{i+1}</span>
              <input value={goals[i]} onChange={e => { updateGoal(i,e.target.value); if(e.target.value.length===1) playCheck() }}
                placeholder={`מטרה ${i+1}…`} dir="rtl"
                style={{ flex:1, padding:'11px 14px', fontFamily:"'Heebo', sans-serif", background: T.tagBg,
                  border:`1px solid ${goals[i].trim()?'rgba(255,214,10,.3)': T.border}`,
                  color: T.text, fontSize:14, fontWeight:500, outline:'none', borderRadius:10 }} />
            </div>
          ))}
        </div>

        {plans.filter(p=>p.weekStart!==weekStart).length > 0 && (
          <>
            <div className="divider mb-4" />
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color: T.textMuted, textTransform:'uppercase', marginBottom:16 }}>שבועות קודמים</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {plans.filter(p=>p.weekStart!==weekStart).slice(0,3).map(plan => (
                <div key={plan.weekStart} className="card">
                  <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color: T.textMuted, textTransform:'uppercase', marginBottom:10 }}>{plan.weekStart}</p>
                  {plan.goals.filter(g=>g.trim()).map((g,i) => (
                    <p key={i} style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, color: T.textMuted, lineHeight:1.5, marginBottom:4 }} dir="rtl">{g}</p>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0" style={{ padding:'16px 20px', paddingBottom:'max(16px, env(safe-area-inset-bottom))', borderTop: `1px solid ${T.border}`, background: T.bgRaised, transition: 'background .3s' }}>
        {saved ? (
          <div style={{ padding:'18px', textAlign:'center', fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontWeight:700, fontSize:16, color:'#30D158', background:'rgba(48,209,88,.06)', border:'1px solid rgba(48,209,88,.2)', borderRadius:12 }} dir="rtl">
            נעול — יאללה לשבוע!
          </div>
        ) : (
          <button onClick={handleSave} disabled={!canSave} className="btn-gold w-full" style={{ padding:'18px', fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:16, fontWeight:900 }} dir="rtl">
            נעל את השבוע
          </button>
        )}
      </div>
    </div>
  )
}
