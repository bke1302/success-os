import { useState } from 'react'
import { Settings, Share2, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react'
import { ScoreTrendChart } from '../components/ScoreTrendChart'
import { HeatmapChart } from '../components/HeatmapChart'
import { HabitStreakGrid } from '../components/HabitStreakGrid'
import { EnergySlider } from '../components/EnergySlider'
import { getReminderTime, setReminderTime } from '../utils/reminder'
import { generateCoachReport, getHabitCorrelations } from '../utils/aiCoach'
import { shareWinCard, shareWeeklyCard } from '../utils/shareCard'
import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { scoreColor, scoreLabel } from '../utils/colorUtils'
import { formatDate } from '../utils/dateUtils'
import { HABITS } from '../constants'
import { getTodayQuote } from '../constants'

interface Props { entries: DayEntry[]; streak: number; totalDays: number }


function CoachCard({ entries, streak }: { entries: DayEntry[]; streak: number }) {
  const T = useTheme()
  const [open, setOpen] = useState(false)
  const r = generateCoachReport(entries, streak)
  const c = r.tone === 'fire' ? '#FF5C5C' : r.tone === 'green' ? '#4ADE80' : '#FBBF24'
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 12, animation: 'cardStagger .38s var(--ease-out) .1s both' }}>
      <button className="w-full" onClick={() => setOpen(v => !v)} style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div dir="rtl">
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: c, textTransform: 'uppercase', marginBottom: 4 }}>מאמן AI</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-.3px' }}>{r.headline}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
            {open ? <ChevronUp style={{ width: 16, height: 16, color: T.textMuted }} /> : <ChevronDown style={{ width: 16, height: 16, color: T.textMuted }} />}
          </div>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${T.divider}` }} className="animate-slide-up">
          {r.insights.map((ins, i) => (
            <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textSub, lineHeight: 1.65, marginBottom: 8, marginTop: i === 0 ? 14 : 0 }} dir="rtl">{ins}</p>
          ))}
          <div style={{ background: `${c}10`, border: `1px solid ${c}30`, padding: '12px 14px', borderRadius: 12, marginTop: 12 }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: c, textTransform: 'uppercase', marginBottom: 6 }}>אתגר השבוע</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5 }} dir="rtl">{r.challenge}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function WinsWall({ entries, streak, totalDays }: Props) {
  const T = useTheme()
  const [showSettings,  setShowSettings]  = useState(false)
  const [reminderTime,  setRT]            = useState(getReminderTime)
  const [sharingEntry,  setSharingEntry]  = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [minScore,      setMinScore]      = useState(0)
  const [sharingWeekly, setSharingWeekly] = useState(false)

  const allWithEvening = entries.filter(e => e.evening).sort((a,b) => b.date.localeCompare(a.date))
  const withEvening = allWithEvening.filter(e => {
    const text = (e.evening!.given ?? e.evening!.win ?? '') + ' ' + (e.evening!.lesson ?? '')
    const matchSearch = !search || text.includes(search) || formatDate(e.date, true).includes(search)
    const matchScore  = e.evening!.score >= minScore
    return matchSearch && matchScore
  })
  const avgScore    = allWithEvening.length > 0
    ? Math.round(allWithEvening.reduce((s,e) => s + e.evening!.score, 0) / allWithEvening.length * 10) / 10
    : 0
  const commitRate  = allWithEvening.length > 0
    ? Math.round(allWithEvening.filter(e => e.evening!.commitmentDone).length / allWithEvening.length * 100)
    : 0
  const peakDays    = allWithEvening.filter(e => e.evening!.score >= 9).length

  const handleShare = async (entry: DayEntry) => {
    setSharingEntry(entry.date)
    try { await shareWinCard({ win: entry.evening!.given ?? entry.evening!.win, score: entry.evening!.score, date: formatDate(entry.date), streak }) }
    finally { setSharingEntry(null) }
  }

  const handleShareWeekly = async () => {
    if (sharingWeekly) return
    setSharingWeekly(true)
    const last7   = allWithEvening.slice(0, 7)
    const avgW    = last7.length ? Math.round(last7.reduce((s, e) => s + e.evening!.score, 0) / last7.length * 10) / 10 : 0
    const bestW   = last7.length ? Math.max(...last7.map(e => e.evening!.score)) : 0
    try {
      await shareWeeklyCard({ avgScore: avgW, streak, totalDays, bestScore: bestW, daysLogged: last7.length, quote: getTodayQuote() })
    } finally { setSharingWeekly(false) }
  }

  const correlations = getHabitCorrelations(entries)

  return (
    <div style={{ height: '100%', overflow: 'hidden', background: T.bg, display: 'flex', flexDirection: 'column', transition: 'background .3s' }}>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 0 80px' }}>
       <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* ── Hero header ── */}
        <div style={{ padding: '0 16px', paddingTop: 16, marginBottom: 14 }}>
          <div className="today-hero" style={{
            background: T.isDark
              ? 'linear-gradient(135deg, rgba(251,191,36,.8) 0%, rgba(74,222,128,.5) 55%, rgba(91,140,255,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
              : 'linear-gradient(135deg, rgba(180,130,0,.9) 0%, rgba(22,160,70,.8) 55%, rgba(59,111,239,.3) 100%), linear-gradient(180deg, #fef9e7 0%, #f0fff4 100%)',
            border: '1px solid rgba(251,191,36,.25)',
            boxShadow: '0 8px 32px rgba(251,191,36,.12)',
          }}>
            {/* Watermark */}
            <div style={{ position:'absolute', right: 14, top: -4, fontSize: '7rem', opacity: .045, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>🏆</div>

            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
              <div dir="rtl">
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>GROWTH WALL</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>כל יום שסגרת הוא הוכחה</p>
              </div>
              <button onClick={() => setShowSettings(s => !s)} style={{ background: showSettings ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Settings style={{ width: 14, height: 14, color: '#fff' }} strokeWidth={1.5} />
              </button>
            </div>

            {/* Bottom row: streak + avg */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div dir="rtl">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>
                  {streak} <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '1px', opacity: .7 }}>ימים</span>
                </p>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.45)', margin: '6px 0 0', textTransform: 'uppercase' }}>STREAK</p>
              </div>
              {avgScore > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#4ADE80', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, textShadow: '0 0 24px rgba(74,222,128,.4)' }}>{avgScore}</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: 'rgba(74,222,128,.6)', textTransform: 'uppercase', margin: '4px 0 0' }}>AVG SCORE</p>
                </div>
              )}
            </div>

            {/* Settings: reminder */}
            {showSettings && (
              <div style={{ position: 'relative', zIndex: 1, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.8)' }} dir="rtl">תזכורת בוקר</span>
                <input type="time" value={reminderTime} onChange={e => { setRT(e.target.value); setReminderTime(e.target.value) }}
                  style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '6px 10px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 700, outline: 'none', borderRadius: 8, colorScheme: 'dark' }} />
              </div>
            )}
          </div>
        </div>

        {/* ── 4-stat grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '0 16px', marginBottom: 14 }}>
          <div className="stat-box sm gold animate-card-stagger stagger-1">
            <div className="stat-val">{streak}</div>
            <div className="stat-lbl">STREAK</div>
          </div>
          <div className="stat-box sm blue animate-card-stagger stagger-2">
            <div className="stat-val">{totalDays}</div>
            <div className="stat-lbl">ימים</div>
          </div>
          <div className="stat-box sm green animate-card-stagger stagger-3">
            <div className="stat-val">{avgScore || '—'}</div>
            <div className="stat-lbl">ממוצע</div>
          </div>
          <div className="stat-box sm animate-card-stagger stagger-4">
            <div className="stat-val" style={{ color: commitRate >= 80 ? '#4ADE80' : commitRate >= 50 ? '#FB923C' : '#FF5C5C' }}>{commitRate}%</div>
            <div className="stat-lbl">עמדתי</div>
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* CoachCard */}
          {withEvening.length >= 3 && <CoachCard entries={entries} streak={streak} />}

          {/* Peak days banner */}
          {peakDays > 0 && (
            <div style={{ background: T.card, border: '1px solid rgba(251,191,36,.2)', borderRadius: 18, padding: '16px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'cardStagger .38s var(--ease-out) .15s both' }}>
              <div dir="rtl">
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FBBF24', textTransform: 'uppercase', marginBottom: 4 }}>PEAK DAYS</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: '-.3px' }} dir="rtl">{peakDays} ימי PEAK — הגעת ל-9+</p>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#FBBF24', lineHeight: 1 }}>{peakDays}</span>
            </div>
          )}

          {/* Weekly Report Card */}
          {allWithEvening.length >= 3 && (
            <button onClick={handleShareWeekly} disabled={sharingWeekly}
              dir="rtl"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(91,140,255,.07)', border: '1px solid rgba(91,140,255,.2)', borderRadius: 16, cursor: 'pointer', marginBottom: 12, transition: 'all .2s', textAlign: 'right' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(91,140,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Share2 style={{ width: 14, height: 14, color: '#5B8CFF' }} strokeWidth={2} />
              </div>
              <div dir="rtl">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: '#5B8CFF', margin: 0 }}>
                  {sharingWeekly ? 'מייצר…' : 'שתף דוח שבועי'}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>כרטיס 9:16 עם הסטטיסטיקות שלך</p>
              </div>
            </button>
          )}

          {/* Habit Correlation Insights */}
          {correlations.length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', marginBottom: 12, animation: 'cardStagger .38s var(--ease-out) .15s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, direction: 'rtl' }}>
                <BarChart2 style={{ width: 14, height: 14, color: '#5B8CFF' }} strokeWidth={2} />
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#5B8CFF', textTransform: 'uppercase', margin: 0 }}>תובנות הרגלים</p>
              </div>
              {correlations.map((c, i) => {
                const habit = HABITS.find(h => h.id === c.habitId)
                if (!habit) return null
                return (
                  <div key={c.habitId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < correlations.length - 1 ? `1px solid ${T.divider}` : 'none', direction: 'rtl' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.textSub, margin: 0, flex: 1 }}>{habit.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, color: c.lift > 0 ? '#4ADE80' : '#FF5C5C' }}>
                        {c.lift > 0 ? '+' : ''}{c.lift}
                      </span>
                      <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, color: T.textDim }}>נק׳</span>
                    </div>
                  </div>
                )
              })}
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: T.textFaint, marginTop: 8, lineHeight: 1.4 }}>
                השינוי בציון הממוצע בימים שעשית הרגל זה
              </p>
            </div>
          )}

          {/* Habit streak grid */}
          <HabitStreakGrid entries={entries} />

          {/* Charts */}
          {withEvening.length >= 2 && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '18px', marginBottom: 12, animation: 'cardStagger .38s var(--ease-out) .2s both' }}>
              <ScoreTrendChart entries={entries} />
              <HeatmapChart entries={entries} />
            </div>
          )}

          {/* Search + score filter */}
          {allWithEvening.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="חפש ניצחון..." dir="rtl"
                style={{ width: '100%', boxSizing: 'border-box', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '9px 14px', fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.text, outline: 'none', marginBottom: 8 }}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', direction: 'rtl' }}>
                {[0, 5, 7, 9].map(s => (
                  <button key={s} onClick={() => setMinScore(s)} style={{
                    padding: '4px 12px', borderRadius: 999,
                    border: `1px solid ${minScore === s ? T.accent : T.border2}`,
                    background: minScore === s ? `${T.accent}1F` : 'transparent',
                    color: minScore === s ? T.accent : T.textMuted,
                    fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', transition: 'all .15s',
                  }}>
                    {s === 0 ? 'הכל' : `${s}+`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Win entries */}
          {allWithEvening.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>🏆</div>
              <h2 dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 12, lineHeight: 1.1, letterSpacing: '-.5px' }}>הניצחון הראשון ממתין לך</h2>
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>סיים את היום הראשון שלך ותראה כאן את כל ההתקדמות שלך.</p>
            </div>
          ) : withEvening.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', textAlign: 'center' }}>
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>אין תוצאות</p>
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textDim }}>שנה את הסינון או החיפוש</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>— היסטוריה {(search || minScore > 0) ? `(${withEvening.length})` : ''}</p>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
                {withEvening.map((entry, idx) => {
                  const ev = entry.evening!
                  const c  = scoreColor(ev.score)
                  return (
                    <div key={entry.date} style={{
                      padding: '16px 18px',
                      borderBottom: idx < withEvening.length - 1 ? `1px solid ${T.divider}` : 'none',
                      borderRight: `3px solid ${c}`,
                      direction: 'rtl',
                    }}>
                      {/* Row top: date + score */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>{formatDate(entry.date)}</p>
                          {entry.morning?.identity && <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: 'rgba(251,191,36,.6)', letterSpacing: '1px', margin: 0 }} dir="rtl">{entry.morning.identity}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ textAlign: 'center', minWidth: 48 }}>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-.5px', color: c }}>{ev.score}</div>
                            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: c, marginTop: 2, fontWeight: 700 }}>{scoreLabel(ev.score)}</div>
                          </div>
                          <button onClick={() => handleShare(entry)} disabled={sharingEntry === entry.date}
                            style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${T.border2}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: sharingEntry === entry.date ? 0.5 : 1, color: T.textMuted, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700 }}>
                            <Share2 style={{ width: 11, height: 11 }} />{sharingEntry === entry.date ? '...' : 'שתף'}
                          </button>
                        </div>
                      </div>

                      {/* Win text */}
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.5, marginBottom: 4 }} dir="rtl">{ev.given ?? ev.win}</p>
                      {ev.lesson && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginBottom: 6 }} dir="rtl">{ev.lesson}</p>}

                      {/* Commitment dot */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: ev.commitmentDone ? '#4ADE80' : '#FF5C5C', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: ev.commitmentDone ? '#4ADE80' : '#FF5C5C' }}>{ev.commitmentDone ? 'עמדתי' : 'לא הספקתי'}</span>
                        {entry.morning?.oneThing && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted }} dir="rtl">· {entry.morning.oneThing}</span>}
                      </div>

                      {entry.morning && <div style={{ marginTop: 10 }}><EnergySlider value={entry.morning.energyLevel} onChange={() => {}} size="sm" readonly /></div>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
       </div>
      </div>
    </div>
  )
}
