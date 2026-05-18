import { Play, Flame, Check } from 'lucide-react'
import type { DayEntry, Task } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { getTodayFocusSessions } from './FocusScreen'
import { HABITS, QUOTES } from '../constants'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  userName:   string
  entries:    DayEntry[]
  tasks:      Task[]
  onStart:    () => void
  onNavigate: (v: string) => void
}

function getGreeting(hour: number): { text: string; sub: string } {
  if (hour < 12) return { text: 'בוקר טוב',     sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
  if (hour < 17) return { text: 'צהריים טובים', sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
  return               { text: 'ערב טוב',       sub: new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) }
}

export function HomeScreen({ streak, today, userName, entries, tasks, onStart, onNavigate }: Props) {
  const T = useTheme()
  const hour = new Date().getHours()
  const { text: greetText, sub: greetSub } = getGreeting(hour)

  // Stats
  const completedHabits  = today?.habits ?? []
  const totalHabits      = HABITS.length
  const habitsDone       = completedHabits.length
  const focusSessions    = getTodayFocusSessions()
  const last7            = entries.filter(e => e.evening).slice(-7)
  const avg7             = last7.length
    ? Math.round(last7.reduce((s, e) => s + (e.evening?.score ?? 0), 0) / last7.length * 10) / 10
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

  // Habit preview (up to 4, shown when no tasks or as fallback)
  const previewHabits = HABITS.slice(0, 4)
  const showTasks     = incompleteTasks.length > 0

  // Progress bar width for habits
  const habitPct = totalHabits > 0 ? habitsDone / totalHabits : 0

  return (
    <div style={{
      height: '100%',
      background: T.bg,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      transition: 'background .3s',
    }}>
      <div style={{ padding: '0 0 68px', maxWidth: 480, margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div dir="rtl">
              <p dir="rtl" style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 20, fontWeight: 900, color: T.text, margin: 0, lineHeight: 1.2,
              }}>
                {greetText}, {userName}
              </p>
              <p dir="rtl" style={{
                fontFamily: 'Heebo, sans-serif',
                fontSize: 12, color: T.textMuted, margin: '3px 0 0',
              }}>{greetSub}</p>
            </div>

            {/* Streak pill */}
            {streak > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                background: 'rgba(251,191,36,.08)',
                border: '1px solid rgba(251,191,36,.2)',
                borderRadius: 999, flexShrink: 0,
              }}>
                <Flame style={{ width: 13, height: 13, color: '#FBBF24' }} strokeWidth={2} fill="rgba(251,191,36,.3)" />
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 13, fontWeight: 900, color: T.isDark ? '#FBBF24' : '#92400E', lineHeight: 1,
                }}>{streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Summary Card ───────────────────────────── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 18,
            padding: '16px 18px',
            boxShadow: T.cardShadow,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 14, direction: 'rtl',
            }}>
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 9, fontWeight: 700, letterSpacing: '2px',
                color: T.textMuted, textTransform: 'uppercase', margin: 0,
              }}>סיכום היום</p>
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: '1px',
              }}>
                {today?.morning ? 'פריים הושלם ✓' : 'פריים לא התחיל'}
              </span>
            </div>

            {/* Habits progress */}
            <div style={{ marginBottom: 12 }} dir="rtl">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Heebo, sans-serif', fontSize: 12, fontWeight: 600, color: T.textSub }}>הרגלים</span>
                <span style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: habitsDone === totalHabits && totalHabits > 0 ? '#4ADE80' : T.textMuted,
                }}>{habitsDone}/{totalHabits}</span>
              </div>
              <div style={{
                height: 4, background: T.border2, borderRadius: 2, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${habitPct * 100}%`,
                  background: habitPct === 1 ? '#4ADE80' : '#5B8CFF',
                  borderRadius: 2,
                  transition: 'width .6s cubic-bezier(.16,1,.3,1)',
                  boxShadow: habitPct === 1 ? '0 0 8px rgba(74,222,128,.4)' : '0 0 6px rgba(91,140,255,.3)',
                }} />
              </div>
            </div>

            {/* Focus + Score row */}
            <div style={{ display: 'flex', gap: 12, direction: 'rtl' }}>
              <div style={{
                flex: 1, padding: '10px 12px',
                background: T.isDark ? 'rgba(91,140,255,.06)' : 'rgba(91,140,255,.05)',
                borderRadius: 10, border: `1px solid rgba(91,140,255,.1)`,
              }}>
                <p style={{
                  fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                  fontSize: 20, fontWeight: 900, color: '#5B8CFF', margin: 0, lineHeight: 1,
                }}>{focusSessions}</p>
                <p style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px',
                  color: T.textDim, textTransform: 'uppercase', margin: '3px 0 0',
                }}>פוקוס</p>
              </div>
              {avg7 !== null ? (
                <div style={{
                  flex: 1, padding: '10px 12px',
                  background: T.isDark ? 'rgba(74,222,128,.06)' : 'rgba(74,222,128,.05)',
                  borderRadius: 10, border: `1px solid rgba(74,222,128,.1)`,
                }}>
                  <p style={{
                    fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                    fontSize: 20, fontWeight: 900, color: '#4ADE80', margin: 0, lineHeight: 1,
                  }}>{avg7}</p>
                  <p style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px',
                    color: T.textDim, textTransform: 'uppercase', margin: '3px 0 0',
                  }}>ממוצע</p>
                </div>
              ) : (
                <div style={{
                  flex: 1, padding: '10px 12px',
                  background: T.tagBg, borderRadius: 10, border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p style={{
                    fontFamily: 'Heebo, sans-serif', fontSize: 11,
                    color: T.textDim, textAlign: 'center', margin: 0, lineHeight: 1.4,
                  }} dir="rtl">עוד אין ניקוד</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Today task / habits preview ──────────────────── */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, direction: 'rtl',
          }}>
            <p dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 15, fontWeight: 900, color: T.text, margin: 0,
            }}>{showTasks ? 'משימות פתוחות' : 'הרגלים להיום'}</p>
            <button
              onClick={() => onNavigate(showTasks ? 'tasks' : 'actions')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10, fontWeight: 700, letterSpacing: '1px',
                color: '#5B8CFF', textTransform: 'uppercase',
              }}
              dir="rtl"
            >ראה הכל →</button>
          </div>

          <div style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 18, overflow: 'hidden',
            boxShadow: T.cardShadow,
          }}>
            {showTasks ? (
              incompleteTasks.map((task, i) => (
                <div
                  key={task.id}
                  onClick={() => onNavigate('tasks')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < incompleteTasks.length - 1 ? `1px solid ${T.divider}` : 'none',
                    cursor: 'pointer', direction: 'rtl',
                    borderRight: task.priority === 'high' ? '2px solid #5B8CFF' : `1px solid transparent`,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${task.priority === 'high' ? '#5B8CFF' : T.border2}`,
                  }} />
                  <p style={{
                    fontFamily: 'Heebo, sans-serif',
                    fontSize: 14, fontWeight: 600, color: T.text,
                    margin: 0, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{task.title}</p>
                  {task.priority === 'high' && (
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: 8.5, fontWeight: 700, letterSpacing: '1px',
                      color: '#5B8CFF', textTransform: 'uppercase',
                    }}>HIGH</span>
                  )}
                </div>
              ))
            ) : (
              previewHabits.map((habit, i) => {
                const done = completedHabits.includes(habit.id)
                return (
                  <div
                    key={habit.id}
                    onClick={() => onNavigate('actions')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px',
                      borderBottom: i < previewHabits.length - 1 ? `1px solid ${T.divider}` : 'none',
                      cursor: 'pointer', direction: 'rtl',
                      transition: 'background .15s',
                    }}
                  >
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
                    <p style={{
                      fontFamily: 'Heebo, sans-serif',
                      fontSize: 14, fontWeight: done ? 400 : 600,
                      color: done ? T.textMuted : T.text,
                      textDecoration: done ? 'line-through' : 'none',
                      margin: 0, flex: 1,
                    }}>{habit.title}</p>
                  </div>
                )
              })
            )}

            {/* Prime CTA if no morning yet */}
            {!today?.morning && (
              <div
                onClick={onStart}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '13px 16px',
                  borderTop: `1px solid ${T.divider}`,
                  cursor: 'pointer', direction: 'rtl',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px dashed rgba(91,140,255,.4)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Play style={{ width: 9, height: 9, color: '#5B8CFF' }} fill="#5B8CFF" strokeWidth={0} />
                </div>
                <span style={{
                  fontFamily: 'Heebo, sans-serif',
                  fontSize: 13, fontWeight: 600, color: '#5B8CFF',
                }}>התחל פריים יומי</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Focus Shortcut ───────────────────────────────── */}
        <div style={{ padding: '0 16px 14px' }}>
          <button
            onClick={() => onNavigate('focus')}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              background: 'rgba(91,140,255,.07)',
              border: '1px solid rgba(91,140,255,.18)',
              borderRadius: 16,
              cursor: 'pointer', direction: 'rtl',
              transition: 'background .15s, border-color .15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(91,140,255,.12)'
              e.currentTarget.style.borderColor = 'rgba(91,140,255,.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(91,140,255,.07)'
              e.currentTarget.style.borderColor = 'rgba(91,140,255,.18)'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(91,140,255,.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play style={{ width: 14, height: 14, color: '#5B8CFF' }} fill="#5B8CFF" strokeWidth={0} />
            </div>
            <div dir="rtl">
              <p style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 15, fontWeight: 900, color: T.text, margin: 0,
              }}>התחל סשן פוקוס</p>
              <p style={{
                fontFamily: 'Heebo, sans-serif',
                fontSize: 11, color: T.textMuted, margin: '2px 0 0',
              }}>25 דקות עבודה עמוקה</p>
            </div>
          </button>
        </div>

        {/* ── Daily Quote ──────────────────────────────────── */}
        <div style={{ padding: '4px 24px 8px' }}>
          <p dir="rtl" style={{
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            fontSize: 14, fontStyle: 'italic', fontWeight: 400,
            color: T.textMuted, textAlign: 'center', lineHeight: 1.7, margin: 0,
          }}>
            "{quote}"
          </p>
        </div>

      </div>
    </div>
  )
}
