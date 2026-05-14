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
  if (s >= 9) return '#f5c435'; if (s >= 7) return '#22c55e'
  if (s >= 5) return '#f97316'; return '#ef4444'
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
  const c = r.tone === 'fire' ? '#ef4444' : r.tone === 'green' ? '#22c55e' : '#f5c435'
  return (
    <div className="card" style={{ borderLeft: `3px solid ${c}` }}>
      <button className="w-full text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center justify-between">
          <div dir="rtl">
            <p className="label-xs mb-1" style={{ color: c }}>{r.tone === 'fire' ? '🔥' : r.tone === 'green' ? '⚡' : '💎'} AI COACH</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: '#e8e8f0' }}>{r.headline}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted shrink-0 ml-3" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0 ml-3" />}
        </div>
      </button>
      {open && (
        <div className="mt-4 animate-slide-up">
          {r.insights.map((ins, i) => (
            <p key={i} style={{ fontSize: 13, color: 'rgba(232,232,240,0.65)', lineHeight: 1.6, marginBottom: 8 }} dir="rtl">{ins}</p>
          ))}
          <div style={{ background: '#1a1a28', borderLeft: `2px solid ${c}`, padding: '12px 14px', borderRadius: 10, marginTop: 12 }}>
            <p className="label-xs mb-1" style={{ color: c }}>אתגר השבוע</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0', lineHeight: 1.5 }} dir="rtl">{r.challenge}</p>
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
      <p className="label-xs mb-3">👥 ACCOUNTABILITY PARTNER</p>
      <p style={{ fontSize: 12, color: '#6b6b8a', lineHeight: 1.5, marginBottom: 12 }} dir="rtl">שתף קישור עם חבר — הוא יראה את ה-streak שלך.</p>
      <button onClick={copy} className="btn-ghost w-full flex items-center justify-center gap-2" style={{ padding: '12px', fontSize: 13 }} dir="rtl">
        {copied ? '✓ הועתק!' : '🔗 העתק לינק'}
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
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2a2a3d' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e8e8f0' }} dir="rtl">קיר הגדילה</h1>
            <p style={{ fontSize: 12, color: '#6b6b8a', marginTop: 3 }} dir="rtl">כל יום שסגרת הוא הוכחה.</p>
          </div>
          <button onClick={() => setShowSettings(s=>!s)} className="btn-ghost flex items-center justify-center" style={{ width: 38, height: 38 }}>
            <Settings className="w-4 h-4" strokeWidth={1.5} style={{ color: showSettings ? '#f5c435' : '#6b6b8a' }} />
          </button>
        </div>
        {showSettings && (
          <div className="flex items-center justify-between mb-4" style={{ background: '#12121a', border: '1px solid #2a2a3d', borderRadius: 12, padding: '12px 14px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }} dir="rtl">תזכורת בוקר</span>
            <input type="time" value={reminderTime} onChange={e => { setRT(e.target.value); setReminderTime(e.target.value) }}
              style={{ background: 'transparent', border: '1px solid rgba(245,196,53,0.3)', color: '#f5c435', padding: '6px 10px', fontSize: 13, fontWeight: 700, outline: 'none', borderRadius: 8, colorScheme: 'dark' }} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {[
            { v: streak, l: 'STREAK', c: '#f5c435' },
            { v: totalDays, l: 'ימים', c: '#e8e8f0' },
            { v: String(avgScore), l: 'ממוצע', c: '#e8e8f0' },
            { v: `${commitRate}%`, l: 'עמדתי', c: '#22c55e' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ textAlign: 'center', padding: '12px 8px', background: '#12121a', border: '1px solid #2a2a3d', borderTop: `2px solid ${c === '#f5c435' ? '#f5c435' : '#2a2a3d'}`, borderRadius: 12 }}>
              <div className="font-display" style={{ fontSize: '1.8rem', color: c, lineHeight: 1 }}>{v}</div>
              <div className="label-xs" style={{ marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>
        {withEvening.length >= 3 && <div className="mb-4"><CoachCard entries={entries} streak={streak} /></div>}
        {peakDays > 0 && (
          <div className="card mb-4" style={{ borderLeft: '3px solid #f5c435' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#f5c435' }} dir="rtl">{peakDays} ימי PEAK — הגעת ל-9 ומעלה.</p>
          </div>
        )}
        {withEvening.length >= 2 && <div className="card mb-4"><ScoreTrendChart entries={entries} /><HeatmapChart entries={entries} /></div>}
        {totalDays >= 1 && <div className="mb-4"><AccountabilityCard streak={streak} totalDays={totalDays} avgScore={avgScore} /></div>}
        <div className="divider mb-5" />
        {withEvening.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>⚡</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#e8e8f0', marginBottom: 8 }} dir="rtl">עדיין אין ימים סגורים</p>
            <p style={{ fontSize: 13, color: '#6b6b8a', lineHeight: 1.6 }} dir="rtl">סיים יום ראשון עם סיכום ערב.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {withEvening.map(entry => {
              const ev = entry.evening!
              const c  = scoreColor(ev.score)
              return (
                <div key={entry.date} className="card" style={{ borderLeft: `3px solid ${c}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="label-xs mb-1">{formatDate(entry.date)}</p>
                      {entry.morning?.identity && <p style={{ fontSize: 10, color: 'rgba(245,196,53,0.6)', fontWeight: 700 }} dir="rtl">{entry.morning.identity}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div className="font-display" style={{ fontSize: '2.2rem', lineHeight: 1, color: c }}>{ev.score}</div>
                        <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: c }}>{scoreLabel(ev.score)}</div>
                      </div>
                      <button onClick={() => handleShare(entry)} disabled={sharingEntry === entry.date}
                        className="btn-ghost flex items-center gap-1.5" style={{ padding: '6px 10px', fontSize: 11, opacity: sharingEntry===entry.date?0.5:1 }}>
                        <Share2 className="w-3 h-3" />{sharingEntry === entry.date ? '...' : 'שתף'}
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', lineHeight: 1.5, marginBottom: 6 }} dir="rtl">{ev.given ?? ev.win}</p>
                  {ev.lesson && <p style={{ fontSize: 12, color: '#6b6b8a', lineHeight: 1.5, marginBottom: 6 }} dir="rtl">📖 {ev.lesson}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.commitmentDone ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: ev.commitmentDone ? '#22c55e' : '#ef4444' }} dir="rtl">{ev.commitmentDone ? 'עמדתי' : 'לא הצלחתי'}</span>
                    {entry.morning?.oneThing && <span style={{ fontSize: 11, color: '#6b6b8a' }} dir="rtl">· ⭐ {entry.morning.oneThing}</span>}
                  </div>
                  {entry.morning && <div style={{ marginTop: 10 }}><EnergySlider value={entry.morning.energyLevel} onChange={() => {}} size="sm" readonly /></div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
