import { useState } from 'react'
import { Settings, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { ScoreTrendChart } from '../components/ScoreTrendChart'
import { HeatmapChart } from '../components/HeatmapChart'
import { EnergySlider } from '../components/EnergySlider'
import { getReminderTime, setReminderTime } from '../utils/reminder'
import { generateCoachReport } from '../utils/aiCoach'
import { shareWinCard } from '../utils/shareCard'
import type { DayEntry } from '../types'

interface Props { entries: DayEntry[]; streak: number; totalDays: number }

function scoreColor(s: number) {
  if (s >= 9) return '#FFD60A'; if (s >= 7) return '#30D158'
  if (s >= 5) return '#FF9F0A'; return '#FF375F'
}
function scoreLabel(s: number) {
  if (s >= 9) return 'PEAK'; if (s >= 7) return 'SOLID'
  if (s >= 5) return 'GRIND'; return 'START'
}
function formatDate(iso: string) {
  const [y,m,d] = iso.split('-').map(Number)
  return new Date(y,m-1,d).toLocaleDateString('he-IL',{weekday:'short',day:'numeric',month:'short'})
}

function CoachCard({ entries, streak }: { entries: DayEntry[]; streak: number }) {
  const [open, setOpen] = useState(false)
  const r = generateCoachReport(entries, streak)
  const c = r.tone === 'fire' ? '#FF375F' : r.tone === 'green' ? '#30D158' : '#FFD60A'
  return (
    <div className="card" style={{ borderRight: `3px solid ${c}` }}>
      <button className="w-full" onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div dir="rtl">
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:c, textTransform:'uppercase', marginBottom:4 }}>AI COACH</p>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:17, fontWeight:700, color:'#f2f2f7' }}>{r.headline}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color:'rgba(255,255,255,.38)', marginRight:12 }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color:'rgba(255,255,255,.38)', marginRight:12 }} />}
        </div>
      </button>
      {open && (
        <div style={{ marginTop:16 }} className="animate-slide-up">
          {r.insights.map((ins, i) => (
            <p key={i} style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, color:'rgba(242,242,247,.55)', lineHeight:1.6, marginBottom:8 }} dir="rtl">{ins}</p>
          ))}
          <div style={{ background:'rgba(255,255,255,.04)', borderRight:`2px solid ${c}`, padding:'12px 14px', borderRadius:10, marginTop:12 }}>
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:c, textTransform:'uppercase', marginBottom:6 }}>אתגר השבוע</p>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:14, fontWeight:700, color:'#f2f2f7', lineHeight:1.5 }} dir="rtl">{r.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountabilityCard({ streak, totalDays, avgScore }: { streak: number; totalDays: number; avgScore: number }) {
  const [copied, setCopied] = useState(false)
  const shareData = btoa(JSON.stringify({ streak, totalDays, avgScore: avgScore.toFixed(1), date: new Date().toISOString().slice(0,10) }))
  const url = `${window.location.origin}${window.location.pathname}?partner=${shareData}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch { /**/ }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="card">
      <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:'rgba(255,255,255,.38)', textTransform:'uppercase', marginBottom:10 }}>ACCOUNTABILITY PARTNER</p>
      <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color:'rgba(255,255,255,.38)', lineHeight:1.5, marginBottom:12 }} dir="rtl">שתף קישור עם חבר — הוא יראה את ה-streak שלך.</p>
      <button onClick={copy} className="btn-ghost w-full" style={{ padding:'12px', fontFamily:"'Heebo', sans-serif", fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} dir="rtl">
        {copied ? 'הועתק' : 'העתק לינק'}
      </button>
    </div>
  )
}

export function WinsWall({ entries, streak, totalDays }: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const [reminderTime, setRT]           = useState(getReminderTime)
  const [sharingEntry, setSharingEntry] = useState<string | null>(null)

  const withEvening = entries.filter(e => e.evening).sort((a,b) => b.date.localeCompare(a.date))
  const avgScore    = withEvening.length > 0 ? Math.round(withEvening.reduce((s,e) => s+e.evening!.score,0)/withEvening.length*10)/10 : 0
  const commitRate  = withEvening.length > 0 ? Math.round(withEvening.filter(e => e.evening!.commitmentDone).length/withEvening.length*100) : 0
  const peakDays    = withEvening.filter(e => e.evening!.score >= 9).length

  const handleShare = async (entry: DayEntry) => {
    setSharingEntry(entry.date)
    try { await shareWinCard({ win: entry.evening!.given ?? entry.evening!.win, score: entry.evening!.score, date: formatDate(entry.date), streak }) }
    finally { setSharingEntry(null) }
  }

  return (
    <div style={{ height:'100%', overflow:'hidden', background:'#000', display:'flex', flexDirection:'column' }}>
      <div className="shrink-0" style={{ padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,.09)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:26, fontWeight:900, color:'#f2f2f7' }} dir="rtl">קיר הגדילה</h1>
            <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color:'rgba(255,255,255,.38)', marginTop:3 }} dir="rtl">כל יום שסגרת הוא הוכחה.</p>
          </div>
          <button onClick={() => setShowSettings(s=>!s)} className="btn-ghost" style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Settings className="w-4 h-4" strokeWidth={1.5} style={{ color: showSettings ? '#FFD60A' : 'rgba(255,255,255,.38)' }} />
          </button>
        </div>
        {showSettings && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)', borderRadius:12, padding:'12px 14px' }}>
            <span style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, fontWeight:600, color:'#f2f2f7' }} dir="rtl">תזכורת בוקר</span>
            <input type="time" value={reminderTime} onChange={e => { setRT(e.target.value); setReminderTime(e.target.value) }}
              style={{ background:'transparent', border:'1px solid rgba(255,214,10,.3)', color:'#FFD60A', padding:'6px 10px', fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, outline:'none', borderRadius:8, colorScheme:'dark' }} />
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { v: streak,           l:'STREAK', c:'#FFD60A' },
            { v: totalDays,        l:'ימים',   c:'#f2f2f7' },
            { v: String(avgScore), l:'ממוצע',  c:'#f2f2f7' },
            { v: `${commitRate}%`, l:'עמדתי', c:'#30D158' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ textAlign:'center', padding:'12px 8px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)', borderTop:`2px solid ${c === '#FFD60A' ? '#FFD60A' : 'rgba(255,255,255,.09)'}`, borderRadius:12 }}>
              <div style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:'1.8rem', color:c, lineHeight:1 }}>{v}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:8, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(255,255,255,.38)', marginTop:5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding:'20px 20px 32px' }}>
        {withEvening.length >= 3 && <div className="mb-4"><CoachCard entries={entries} streak={streak} /></div>}
        {peakDays > 0 && (
          <div className="card mb-4" style={{ borderRight:'3px solid #FFD60A' }}>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:14, fontWeight:700, color:'#FFD60A' }} dir="rtl">{peakDays} ימי PEAK — הגעת ל-9 ומעלה.</p>
          </div>
        )}
        {withEvening.length >= 2 && <div className="card mb-4"><ScoreTrendChart entries={entries} /><HeatmapChart entries={entries} /></div>}
        {totalDays >= 1 && <div className="mb-4"><AccountabilityCard streak={streak} totalDays={totalDays} avgScore={avgScore} /></div>}
        <div className="divider mb-5" />

        {withEvening.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:22, fontWeight:700, color:'#f2f2f7', marginBottom:10 }} dir="rtl">עדיין אין ימים סגורים</p>
            <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, color:'rgba(255,255,255,.38)', lineHeight:1.6 }} dir="rtl">סיים יום ראשון עם סיכום ערב.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {withEvening.map(entry => {
              const ev = entry.evening!
              const c  = scoreColor(ev.score)
              return (
                <div key={entry.date} className="card" style={{ borderRight:`3px solid ${c}` }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                    <div>
                      <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:'rgba(255,255,255,.38)', textTransform:'uppercase', marginBottom:4 }}>{formatDate(entry.date)}</p>
                      {entry.morning?.identity && <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, color:'rgba(255,214,10,.6)', letterSpacing:'1px' }} dir="rtl">{entry.morning.identity}</p>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:'2.2rem', lineHeight:1, color:c }}>{ev.score}</div>
                        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:7, letterSpacing:2, textTransform:'uppercase', color:c, marginTop:2 }}>{scoreLabel(ev.score)}</div>
                      </div>
                      <button onClick={() => handleShare(entry)} disabled={sharingEntry === entry.date}
                        className="btn-ghost" style={{ padding:'6px 10px', fontFamily:"'Heebo', sans-serif", fontSize:11, display:'flex', alignItems:'center', gap:5, opacity: sharingEntry===entry.date?0.5:1 }}>
                        <Share2 className="w-3 h-3" />{sharingEntry === entry.date ? '...' : 'שתף'}
                      </button>
                    </div>
                  </div>
                  <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:14, fontWeight:500, color:'#f2f2f7', lineHeight:1.5, marginBottom:6 }} dir="rtl">{ev.given ?? ev.win}</p>
                  {ev.lesson && <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color:'rgba(255,255,255,.38)', lineHeight:1.5, marginBottom:6 }} dir="rtl">{ev.lesson}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background: ev.commitmentDone ? '#30D158' : '#FF375F', flexShrink:0 }} />
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'1px', color: ev.commitmentDone ? '#30D158' : '#FF375F' }} dir="rtl">{ev.commitmentDone ? 'עמדתי' : 'לא הצלחתי'}</span>
                    {entry.morning?.oneThing && <span style={{ fontFamily:"'Heebo', sans-serif", fontSize:11, color:'rgba(255,255,255,.38)' }} dir="rtl">· {entry.morning.oneThing}</span>}
                  </div>
                  {entry.morning && <div style={{ marginTop:10 }}><EnergySlider value={entry.morning.energyLevel} onChange={() => {}} size="sm" readonly /></div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
