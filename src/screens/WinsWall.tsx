import { useState } from 'react'
import { Settings, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { ScoreTrendChart } from '../components/ScoreTrendChart'
import { HeatmapChart } from '../components/HeatmapChart'
import { EnergySlider } from '../components/EnergySlider'
import { getReminderTime, setReminderTime } from '../utils/reminder'
import { generateCoachReport } from '../utils/aiCoach'
import { shareWinCard } from '../utils/shareCard'
import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface Props { entries: DayEntry[]; streak: number; totalDays: number }

function scoreColor(s: number) {
  if (s >= 9) return '#FFD60A'; if (s >= 7) return '#4ADE80'
  if (s >= 5) return '#FF9F0A'; return '#FF5C5C'
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
  const T = useTheme()
  const [open, setOpen] = useState(false)
  const r = generateCoachReport(entries, streak)
  const c = r.tone === 'fire' ? '#FF5C5C' : r.tone === 'green' ? '#4ADE80' : '#FFD60A'
  return (
    <div className="card" style={{ borderRight: `3px solid ${c}` }}>
      <button className="w-full" onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div dir="rtl">
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:c, textTransform:'uppercase', marginBottom:4 }}>מאמן AI</p>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:17, fontWeight:700, color: T.text }}>{r.headline}</p>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: T.textMuted, marginRight:12 }} />
            : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: T.textMuted, marginRight:12 }} />}
        </div>
      </button>
      {open && (
        <div style={{ marginTop:16 }} className="animate-slide-up">
          {r.insights.map((ins, i) => (
            <p key={i} style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, color: T.textSub, lineHeight:1.6, marginBottom:8 }} dir="rtl">{ins}</p>
          ))}
          <div style={{ background: T.tagBg, borderRight:`2px solid ${c}`, padding:'12px 14px', borderRadius:10, marginTop:12 }}>
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color:c, textTransform:'uppercase', marginBottom:6 }}>אתגר השבוע</p>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:14, fontWeight:700, color: T.text, lineHeight:1.5 }} dir="rtl">{r.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountabilityCard({ streak, totalDays, avgScore }: { streak: number; totalDays: number; avgScore: number }) {
  const T = useTheme()
  const [copied, setCopied] = useState(false)
  const shareData = btoa(JSON.stringify({ streak, totalDays, avgScore: avgScore.toFixed(1), date: new Date().toISOString().slice(0,10) }))
  const url = `${window.location.origin}${window.location.pathname}?partner=${shareData}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(url) } catch { /**/ }
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="card">
      <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color: T.textMuted, textTransform:'uppercase', marginBottom:10 }}>שותף לאחריות</p>
      <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color: T.textMuted, lineHeight:1.5, marginBottom:12 }} dir="rtl">שתף קישור עם חבר — הוא יראה את ה-streak שלך.</p>
      <button onClick={copy} className="btn-ghost w-full" style={{ padding:'12px', fontFamily:"'Heebo', sans-serif", fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} dir="rtl">
        {copied ? 'הועתק' : 'העתק לינק'}
      </button>
    </div>
  )
}

export function WinsWall({ entries, streak, totalDays }: Props) {
  const T = useTheme()
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
    <div style={{ height:'100%', overflow:'hidden', background: T.bg, display:'flex', flexDirection:'column', transition: 'background .3s' }}>
      <div className="shrink-0" style={{ padding:'24px 20px 20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:26, fontWeight:900, color: T.text }} dir="rtl">קיר הגדילה</h1>
            <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color: T.textMuted, marginTop:3 }} dir="rtl">כל יום שסגרת הוא הוכחה.</p>
          </div>
          <button onClick={() => setShowSettings(s=>!s)} className="btn-ghost" style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Settings className="w-4 h-4" strokeWidth={1.5} style={{ color: showSettings ? '#FFD60A' : T.textMuted }} />
          </button>
        </div>
        {showSettings && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, background: T.tagBg, border:`1px solid ${T.border}`, borderRadius:12, padding:'12px 14px' }}>
            <span style={{ fontFamily:"'Heebo', sans-serif", fontSize:13, fontWeight:600, color: T.text }} dir="rtl">תזכורת בוקר</span>
            <input type="time" value={reminderTime} onChange={e => { setRT(e.target.value); setReminderTime(e.target.value) }}
              style={{ background:'transparent', border:'1px solid rgba(255,214,10,.3)', color:'#FFD60A', padding:'6px 10px', fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:700, outline:'none', borderRadius:8, colorScheme: T.isDark ? 'dark' : 'light' }} />
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          <div className="stat-box sm gold">
            <div className="stat-val">{streak}</div>
            <div className="stat-lbl">STREAK</div>
          </div>
          <div className="stat-box sm blue">
            <div className="stat-val">{totalDays}</div>
            <div className="stat-lbl">ימים</div>
          </div>
          <div className="stat-box sm green">
            <div className="stat-val">{avgScore}</div>
            <div className="stat-lbl">ממוצע</div>
          </div>
          <div className="stat-box sm green">
            <div className="stat-val">{commitRate}%</div>
            <div className="stat-lbl">עמדתי</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding:'16px 16px 68px' }}>
        {withEvening.length >= 3 && <div className="mb-4"><CoachCard entries={entries} streak={streak} /></div>}
        {peakDays > 0 && (
          <div className="card mb-4" style={{ borderRight:'3px solid #FFD60A' }}>
            <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', textTransform:'uppercase', marginBottom:6 }}>PEAK DAYS</p>
            <p style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:18, fontWeight:700, color: T.isDark ? '#FFD60A' : '#8B6800' }} dir="rtl">{peakDays} ימי PEAK — הגעת ל-9 ומעלה.</p>
          </div>
        )}
        {withEvening.length >= 2 && <div className="card mb-4"><ScoreTrendChart entries={entries} /><HeatmapChart entries={entries} /></div>}
        {totalDays >= 1 && <div className="mb-4"><AccountabilityCard streak={streak} totalDays={totalDays} avgScore={avgScore} /></div>}
        <div className="divider mb-5" />

        {withEvening.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center' }}>
            <div style={{ fontSize:52, marginBottom:20 }}>🏆</div>
            <h2 dir="rtl" style={{ fontFamily:"'Frank Ruhl Libre', Georgia, serif", fontSize:26, fontWeight:900, color: T.text, marginBottom:12, lineHeight:1.1 }}>הניצחון הראשון ממתין לך</h2>
            <p dir="rtl" style={{ fontFamily:"'Heebo', sans-serif", fontSize:14, color: T.textMuted, lineHeight:1.7 }}>סיים את היום הראשון שלך ותראה כאן את כל ההתקדמות שלך.</p>
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
                      <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, letterSpacing:'2px', color: T.textMuted, textTransform:'uppercase', marginBottom:4 }}>{formatDate(entry.date)}</p>
                      {entry.morning?.identity && <p style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:9, fontWeight:700, color: T.isDark ? 'rgba(255,214,10,.6)' : '#8B6800', letterSpacing:'1px' }} dir="rtl">{entry.morning.identity}</p>}
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
                  <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:14, fontWeight:500, color: T.text, lineHeight:1.5, marginBottom:6 }} dir="rtl">{ev.given ?? ev.win}</p>
                  {ev.lesson && <p style={{ fontFamily:"'Heebo', sans-serif", fontSize:12, color: T.textMuted, lineHeight:1.5, marginBottom:6 }} dir="rtl">{ev.lesson}</p>}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background: ev.commitmentDone ? '#4ADE80' : '#FF5C5C', flexShrink:0 }} />
                    <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:10, fontWeight:700, letterSpacing:'1px', color: ev.commitmentDone ? '#4ADE80' : '#FF5C5C' }} dir="rtl">{ev.commitmentDone ? 'עמדתי' : 'לא הספקתי'}</span>
                    {entry.morning?.oneThing && <span style={{ fontFamily:"'Heebo', sans-serif", fontSize:11, color: T.textMuted }} dir="rtl">· {entry.morning.oneThing}</span>}
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
