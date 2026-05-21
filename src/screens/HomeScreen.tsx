import { Play, Check, Zap, Snowflake } from 'lucide-react'
import type { DayEntry, Task, HabitChallenge } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { getTodayFocusSessions } from './FocusScreen'
import { HABITS, QUOTES } from '../constants'
import { generateDailyBrief } from '../utils/aiCoach'

interface Props {
  dayCount:        number
  streak:          number
  today?:          DayEntry
  userName:        string
  entries:         DayEntry[]
  tasks:           Task[]
  challenge?:      HabitChallenge
  onStart:         () => void
  onNavigate:      (v: string) => void
  onRedemption?:   () => void
  streakFreezes?:  number
  onUseFreeze?:    (date: string) => void
  totalDays?:      number
  trialDaysLeft?:  number | null
  isPro?:          boolean
  onUpgrade?:      () => void
}

const RANKS = [
  { from: 0,   title: 'טירון',   color: '#9CA3AF', nextAt: 7   },
  { from: 7,   title: 'לוחם',    color: '#60A5FA', nextAt: 21  },
  { from: 21,  title: 'מפקד',    color: '#A78BFA', nextAt: 50  },
  { from: 50,  title: 'אלוף',    color: '#FFD60A', nextAt: 100 },
  { from: 100, title: 'לג\'נדה',  color: '#FF375F', nextAt: null },
]

function getRank(totalDays: number) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (totalDays >= r.from) rank = r
  }
  return rank
}

function getScoreTrend(entries: DayEntry[]): 'rising' | 'falling' | null {
  const last3 = entries.filter(e => e.evening).slice(-3)
  if (last3.length < 3) return null
  const [a, b, c] = last3.map(e => e.evening!.score)
  if (c > b && b > a) return 'rising'
  if (c < b && b < a) return 'falling'
  return null
}

function getGreeting(hour: number): { text: string; sub: string } {
  if (hour < 12) return { text: 'בוקר טוב',     sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
  if (hour < 17) return { text: 'צהריים טובים', sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
  return               { text: 'ערב טוב',       sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
}

export function HomeScreen({ streak, today, userName, entries, tasks, challenge, onStart, onNavigate, onRedemption, streakFreezes = 0, onUseFreeze, totalDays = 0, trialDaysLeft, isPro, onUpgrade }: Props) {
  const T = useTheme()
  const hour = new Date().getHours()
  const { text: greetText, sub: greetSub } = getGreeting(hour)

  // Streak recovery: yesterday had morning but no evening
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10) })()
  const yesterdayEntry = entries.find(e => e.date === yesterday)
  const showRecovery   = !!(yesterdayEntry?.morning && !yesterdayEntry?.evening)
  const showFreeze     = !yesterdayEntry?.evening && !showRecovery && streakFreezes > 0 && streak > 0

  const rank       = getRank(totalDays)
  const scoreTrend = getScoreTrend(entries)

  // Stats
  const completedHabits = today?.habits ?? []
  const totalHabits     = HABITS.length
  const habitsDone      = completedHabits.length
  const focusSessions   = getTodayFocusSessions()
  const last7       = entries.filter(e => e.evening).slice(-7)
  const last7scores = last7.map(e => e.evening!.score).filter(s => typeof s === 'number')
  const avg7        = last7scores.length
    ? Math.round(last7scores.reduce((s, n) => s + n, 0) / last7scores.length * 10) / 10
    : null

  // Daily quote — stable per day
  const dateHash = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const quoteIdx = parseInt(dateHash) % QUOTES.length
  const quote    = QUOTES[quoteIdx] ?? QUOTES[0]

  // Task preview — incomplete, up to 4
  const incompleteTasks = tasks
    .filter(t => !t.completedAt)
    .sort((a, b) => (a.priority === 'high' && b.priority !== 'high' ? -1 : 1))
    .slice(0, 4)

  const previewHabits = HABITS.slice(0, 4)
  const showTasks     = incompleteTasks.length > 0
  const habitPct      = totalHabits > 0 ? habitsDone / totalHabits : 0
  const hasBriefData  = entries.filter(e => e.evening).length >= 2
  const brief         = hasBriefData ? generateDailyBrief(entries, streak) : null

  return (
    <div style={{
      height: '100%',
      background: T.bg,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      transition: 'background .3s',
    }}>
      <div style={{ padding: '0 0 80px', maxWidth: 480, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 20px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div dir="rtl">
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', margin: 0, marginBottom: 3 }}>SUCCESS OS</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-.8px', lineHeight: 1.1 }}>
              {greetText}, {userName}
            </p>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 999, background: `${rank.color}18`, border: `1px solid ${rank.color}40`, flexShrink: 0 }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: rank.color, textTransform: 'uppercase' }}>
              {rank.title}
            </span>
          </div>
        </div>

        {/* ── TODAY HERO CARD ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div className="today-hero" style={{
            background: T.isDark
              ? 'linear-gradient(135deg, rgba(91,140,255,.85) 0%, rgba(109,40,217,.75) 55%, rgba(16,185,129,.22) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
              : 'linear-gradient(135deg, rgba(59,111,239,.9) 0%, rgba(109,40,217,.8) 55%, rgba(16,185,129,.3) 100%), linear-gradient(180deg, #dde5ff 0%, #eef2ff 100%)',
            border: '1px solid rgba(91,140,255,.22)',
            boxShadow: '0 8px 32px rgba(91,140,255,.15)',
          }}>
            {/* Watermark */}
            <div style={{ position:'absolute', right: 14, top: -4, fontSize: '7rem', opacity: .04, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>⚡</div>

            {/* Top row: TODAY label + morning badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
              <div dir="rtl">
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>TODAY</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>{greetSub}</p>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 999, background: today?.morning ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.08)', border: `1px solid ${today?.morning ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.12)'}`, flexShrink: 0 }}>
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: today?.morning ? '#4ADE80' : 'rgba(255,255,255,.38)' }}>
                  {today?.morning ? 'PRIME ✓' : 'NO PRIME'}
                </span>
              </div>
            </div>

            {/* Bottom row: brief / greeting + streak */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div dir="rtl" style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
                {brief ? (
                  <>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>
                      {brief.headline}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.58)', margin: '7px 0 0', lineHeight: 1.5 }}>
                      {brief.body}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,.3)' }}>
                      {greetText}
                    </p>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.42)', margin: '6px 0 0', textTransform: 'uppercase' }}>
                      {userName}
                    </p>
                  </>
                )}
              </div>
              {streak > 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#FBBF24', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, textShadow: '0 0 24px rgba(251,191,36,.4)' }}>{streak}</p>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: 'rgba(251,191,36,.55)', textTransform: 'uppercase', margin: '4px 0 0' }}>STREAK</p>
                </div>
              ) : (
                <button onClick={onStart} style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,.92)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(91,140,255,.4)',
                }}>
                  <Play style={{ width: 16, height: 16, color: '#5B8CFF' }} fill="#5B8CFF" strokeWidth={0} />
                </button>
              )}
            </div>

            {/* Habit progress bar */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: 18 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${habitPct * 100}%`,
                  background: habitPct === 1 ? '#4ADE80' : 'rgba(255,255,255,.75)',
                  borderRadius: 2, transition: 'width .6s cubic-bezier(.16,1,.3,1)',
                  boxShadow: habitPct === 1 ? '0 0 8px rgba(74,222,128,.5)' : 'none',
                }} />
              </div>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,.32)', margin: '5px 0 0', textTransform: 'uppercase' }} dir="rtl">
                {habitsDone}/{totalHabits} הרגלים
              </p>
            </div>
          </div>
        </div>

        {/* ── 4-stat grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '0 16px', marginBottom: 14 }}>
          <div className="stat-box sm gold animate-card-stagger stagger-1">
            <div className="stat-val">{streak || '—'}</div>
            <div className="stat-lbl">STREAK</div>
          </div>
          <div className="stat-box sm blue animate-card-stagger stagger-2">
            <div className="stat-val">{focusSessions}</div>
            <div className="stat-lbl">פוקוס</div>
          </div>
          <div className="stat-box sm animate-card-stagger stagger-3">
            <div className="stat-val" style={{ color: T.textSub }}>{habitsDone}</div>
            <div className="stat-lbl">הרגלים</div>
          </div>
          <div className="stat-box sm green animate-card-stagger stagger-4">
            <div className="stat-val">{avg7 ?? '—'}</div>
            <div className="stat-lbl">ממוצע</div>
          </div>
        </div>

        {/* ── Trial / Pro Banner ── */}
        {!isPro && trialDaysLeft !== null && trialDaysLeft !== undefined && (
          <div style={{ padding: '0 16px 14px' }}>
            <button onClick={onUpgrade} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: trialDaysLeft <= 3
                ? 'linear-gradient(135deg, rgba(255,214,10,.12) 0%, rgba(255,159,10,.08) 100%)'
                : 'rgba(255,214,10,.06)',
              border: `1px solid ${trialDaysLeft <= 3 ? 'rgba(255,214,10,.4)' : 'rgba(255,214,10,.18)'}`,
              borderRadius: 14, cursor: 'pointer', direction: 'rtl', transition: 'all .2s',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>👑</span>
              <div dir="rtl" style={{ flex: 1, textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 800, color: '#FFD60A', margin: 0, letterSpacing: '-.3px' }}>
                  {trialDaysLeft === 0 ? 'הניסיון הסתיים — שדרג ל-PRO' : `${trialDaysLeft} ימים נותרו בניסיון`}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,214,10,.6)', margin: '2px 0 0' }}>
                  לחץ לשדרוג ₪39/חודש בלבד
                </p>
              </div>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: '#FFD60A', textTransform: 'uppercase', flexShrink: 0 }}>שדרג →</span>
            </button>
          </div>
        )}

        {/* ── Score Trend Alert ── */}
        {scoreTrend && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: scoreTrend === 'rising' ? 'rgba(74,222,128,.07)' : 'rgba(255,55,95,.07)',
              border: `1px solid ${scoreTrend === 'rising' ? 'rgba(74,222,128,.25)' : 'rgba(255,55,95,.25)'}`,
              borderRadius: 14, direction: 'rtl',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{scoreTrend === 'rising' ? '📈' : '📉'}</span>
              <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: scoreTrend === 'rising' ? '#4ADE80' : '#FF375F', margin: 0 }}>
                {scoreTrend === 'rising' ? '3 ימים ברצף עולה — אתה במומנטום. תנצל את זה!' : '3 ימים ברצף יורד — זה הזמן לשנות משהו קטן'}
              </p>
            </div>
          </div>
        )}

        {/* ── Streak Recovery Banner ── */}
        {showRecovery && onRedemption && (
          <div style={{ padding: '0 16px 14px' }}>
            <button onClick={onRedemption} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', textAlign: 'right',
              background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.25)',
              borderRadius: 16, cursor: 'pointer', direction: 'rtl',
              transition: 'background .15s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(251,191,36,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ width: 16, height: 16, color: '#FBBF24' }} fill="#FBBF24" strokeWidth={0} />
              </div>
              <div dir="rtl" style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: '#FBBF24', margin: 0, letterSpacing: '-.3px' }}>שחזר את אתמול</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, margin: '2px 0 0' }}>שכחת לסיים אתמול? לחץ לשחזור הסטריק</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Streak Freeze Banner ── */}
        {showFreeze && onUseFreeze && (
          <div style={{ padding: '0 16px 14px' }}>
            <button onClick={() => onUseFreeze(yesterday)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              background: 'rgba(96,165,250,.07)', border: '1px solid rgba(96,165,250,.25)',
              borderRadius: 16, cursor: 'pointer', direction: 'rtl',
              transition: 'background .15s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(96,165,250,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Snowflake style={{ width: 16, height: 16, color: '#60A5FA' }} strokeWidth={2} />
              </div>
              <div dir="rtl" style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: '#60A5FA', margin: 0, letterSpacing: '-.3px' }}>הקפא סטריק — {streakFreezes} נותרו</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, margin: '2px 0 0' }}>השתמש בהקפאה כדי להציל את הסטריק שלך</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Habit Challenge Card ── */}
        {challenge && (
          <div style={{ padding: '0 16px 14px' }}>
            <button onClick={() => onNavigate('challenge')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', textAlign: 'right',
              background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.2)',
              borderRadius: 16, cursor: 'pointer', direction: 'rtl',
              transition: 'background .15s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(74,222,128,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>🏆</span>
              </div>
              <div dir="rtl" style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: '#4ADE80', margin: 0, letterSpacing: '-.3px' }}>אתגר 30 יום</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, margin: '2px 0 0' }}>
                  {HABITS.find(h => h.id === challenge.habitId)?.title} · {entries.filter(e => e.date >= challenge.startDate && e.habits?.includes(challenge.habitId)).length}/30 ימים
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── Task / Habit preview ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, direction: 'rtl' }}>
            <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-.3px' }}>
              {showTasks ? 'משימות פתוחות' : 'הרגלים להיום'}
            </p>
            <button onClick={() => onNavigate(showTasks ? 'tasks' : 'actions')}
              aria-label={showTasks ? 'ראה את כל המשימות' : 'ראה את כל ההרגלים'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#5B8CFF', textTransform: 'uppercase' }}
              dir="rtl">ראה הכל →</button>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: T.cardShadow }}>
            {showTasks ? (
              incompleteTasks.map((task, i) => (
                <div key={task.id} onClick={() => onNavigate('tasks')} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px',
                  borderBottom: i < incompleteTasks.length - 1 ? `1px solid ${T.divider}` : 'none',
                  cursor: 'pointer', direction: 'rtl',
                  borderRight: task.priority === 'high' ? '3px solid #5B8CFF' : '3px solid transparent',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${task.priority === 'high' ? '#5B8CFF' : T.border2}` }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.text, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                  {task.priority === 'high' && (
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8.5, fontWeight: 700, letterSpacing: '1px', color: '#5B8CFF', textTransform: 'uppercase' }}>HIGH</span>
                  )}
                </div>
              ))
            ) : (
              previewHabits.map((habit, i) => {
                const done = completedHabits.includes(habit.id)
                return (
                  <div key={habit.id} onClick={() => onNavigate('actions')} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < previewHabits.length - 1 ? `1px solid ${T.divider}` : 'none',
                    cursor: 'pointer', direction: 'rtl',
                    transition: 'background .15s',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: done ? 'none' : `2px solid ${T.border2}`,
                      background: done ? '#4ADE80' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: done ? '0 0 6px rgba(74,222,128,.3)' : 'none',
                      transition: 'all .2s',
                    }}>
                      {done && <Check style={{ width: 11, height: 11, color: '#000' }} strokeWidth={3} />}
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: done ? 400 : 600, color: done ? T.textMuted : T.text, textDecoration: done ? 'line-through' : 'none', margin: 0, flex: 1 }}>{habit.title}</p>
                  </div>
                )
              })
            )}

            {/* Prime CTA if no morning yet */}
            {!today?.morning && (
              <div onClick={onStart} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px', borderTop: `1px solid ${T.divider}`,
                cursor: 'pointer', direction: 'rtl',
              }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px dashed rgba(91,140,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play style={{ width: 9, height: 9, color: '#5B8CFF' }} fill="#5B8CFF" strokeWidth={0} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#5B8CFF' }}>התחל פריים יומי</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Focus CTA ── */}
        <div style={{ padding: '0 16px 14px' }}>
          <button onClick={() => onNavigate('focus')} aria-label="התחל סשן פוקוס 25 דקות" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 18px',
            background: 'rgba(91,140,255,.07)', border: '1px solid rgba(91,140,255,.18)',
            borderRadius: 16, cursor: 'pointer', direction: 'rtl',
            transition: 'background .15s, border-color .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,140,255,.12)'; e.currentTarget.style.borderColor = 'rgba(91,140,255,.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,140,255,.07)'; e.currentTarget.style.borderColor = 'rgba(91,140,255,.18)' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(91,140,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play style={{ width: 14, height: 14, color: '#5B8CFF' }} fill="#5B8CFF" strokeWidth={0} />
            </div>
            <div dir="rtl">
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-.3px' }}>התחל סשן פוקוס</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>25 דקות עבודה עמוקה</p>
            </div>
          </button>
        </div>

        {/* ── Habit Challenge entry (if no active challenge) ── */}
        {!challenge && (
          <div style={{ padding: '0 16px 14px' }}>
            <button onClick={() => onNavigate('challenge')} aria-label="התחל אתגר 30 יום" style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: 'rgba(74,222,128,.05)', border: '1px dashed rgba(74,222,128,.2)',
              borderRadius: 16, cursor: 'pointer', direction: 'rtl',
              transition: 'background .15s',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(74,222,128,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16 }}>🎯</span>
              </div>
              <div dir="rtl">
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>התחל אתגר 30 יום</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>בחר הרגל ובנה זהות חדשה</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Daily Quote ── */}
        <div style={{ padding: '4px 24px 8px' }}>
          <p dir="rtl" style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 14, fontStyle: 'italic', fontWeight: 400, color: T.textMuted, textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
            "{quote}"
          </p>
        </div>

      </div>
    </div>
  )
}
