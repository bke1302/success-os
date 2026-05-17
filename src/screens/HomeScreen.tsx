import { useState, useEffect } from 'react'
import { Bell, Menu, ChevronLeft, Flame, Check, Plus } from 'lucide-react'
import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { getTodayFocusSessions } from './FocusScreen'
import { HABITS, CATEGORY_COLORS, QUOTES } from '../constants'

interface Props {
  dayCount:   number
  streak:     number
  today?:     DayEntry
  userName:   string
  entries:    DayEntry[]
  onStart:    () => void
  onNavigate: (v: 'home' | 'prime' | 'actions' | 'inspire' | 'wins' | 'fear' | 'weekly' | 'focus') => void
}

const QUOTE_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=80',
]

const CATEGORY_EMOJI: Record<string, string> = {
  production: '⚡',
  learning:   '📚',
  network:    '🤝',
  discipline: '💪',
}

function getGreeting(hour: number): { text: string; emoji: string; sub: string } {
  if (hour < 12) return { text: 'בוקר טוב',     emoji: '🌅', sub: 'כל יום הוא הזדמנות לגדול.' }
  if (hour < 17) return { text: 'צהריים טובים', emoji: '☀️', sub: 'המשך חזק — היום עוד לא נגמר.' }
  return               { text: 'ערב טוב',       emoji: '🌙', sub: 'שעת הסיכום. מה נתת היום?' }
}

export function HomeScreen({ streak, today, userName, entries, onStart, onNavigate }: Props) {
  const T = useTheme()
  const hour = new Date().getHours()
  const { text: greetText, emoji: greetEmoji, sub: greetSub } = getGreeting(hour)

  const [quoteIdx, setQuoteIdx] = useState(() => {
    const d = new Date().getDay()
    return d % QUOTE_IMAGES.length
  })
  const [imgLoaded, setImgLoaded] = useState(false)

  // Auto-rotate quote every 6 seconds
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTE_IMAGES.length), 6000)
    return () => clearInterval(id)
  }, [])

  // Stats
  const completedHabits = today?.habits ?? []
  const totalHabits = HABITS.length
  const focusSessions = getTodayFocusSessions()
  const last7 = entries.filter(e => e.evening).slice(-7)
  const avg7  = last7.length
    ? Math.round(last7.reduce((s, e) => s + (e.evening?.score ?? 0), 0) / last7.length * 10) / 10
    : null
  const totalDays = entries.length

  // Score ring
  const ringR    = 38
  const ringCirc = 2 * Math.PI * ringR
  const ringPct  = avg7 ? avg7 / 10 : 0
  const ringColor = !avg7 ? '#4F7DFF' : avg7 >= 7 ? '#FFD60A' : avg7 >= 5 ? '#FF9F0A' : '#FF375F'

  // Preview habits (first 4)
  const previewHabits = HABITS.slice(0, 4)

  const cardBg = T.isDark ? '#1A1C22' : '#FFFFFF'
  const cardBorder = T.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'
  const accent = '#4F7DFF'

  return (
    <div style={{
      height: '100%',
      background: T.bg,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      transition: 'background .3s',
    }}>
      <div style={{ padding: '0 0 16px', maxWidth: 480, margin: '0 auto' }}>

        {/* ── Top header ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 12px',
          direction: 'ltr',
        }}>
          {/* Hamburger */}
          <button
            onClick={() => onNavigate('weekly')}
            style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 12, width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Menu style={{ width: 18, height: 18, color: T.textMuted }} strokeWidth={2} />
          </button>

          {/* Center greeting */}
          <div style={{ flex: 1, textAlign: 'center', direction: 'rtl' }}>
            <p dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.2,
              margin: 0,
            }}>
              {greetEmoji} {greetText}, {userName}
            </p>
            <p dir="rtl" style={{
              fontFamily: 'Heebo, sans-serif',
              fontSize: 11.5, color: T.textMuted, margin: '2px 0 0', lineHeight: 1.4,
            }}>{greetSub}</p>
          </div>

          {/* Bell */}
          <button
            style={{
              background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: 12, width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              position: 'relative',
            }}
          >
            <Bell style={{ width: 18, height: 18, color: T.textMuted }} strokeWidth={2} />
            {streak > 0 && (
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: '#FFD60A',
                boxShadow: '0 0 6px rgba(255,214,10,.7)',
              }} />
            )}
          </button>
        </div>

        {/* ── Quote card ──────────────────────────────────────────── */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            height: 160,
            background: T.isDark
              ? 'linear-gradient(135deg, #1a1c2e 0%, #0f1020 100%)'
              : 'linear-gradient(135deg, #1a2040 0%, #0f1020 100%)',
          }}>
            {/* Background image */}
            <img
              src={QUOTE_IMAGES[quoteIdx]}
              alt=""
              onLoad={() => setImgLoaded(true)}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: imgLoaded ? 0.45 : 0,
                transition: 'opacity .8s ease',
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.35) 100%)',
            }} />

            {/* Quote text */}
            <div style={{
              position: 'relative', zIndex: 1,
              padding: '22px 22px 18px',
              display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between',
            }}>
              <p dir="rtl" style={{
                fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                fontSize: 16.5, fontWeight: 700, color: '#fff',
                lineHeight: 1.55, margin: 0,
                textShadow: '0 1px 8px rgba(0,0,0,.5)',
                maxWidth: 280,
              }}>
                {QUOTES[(quoteIdx * 7 + Math.floor(streak / 3)) % QUOTES.length]}
              </p>

              {/* Dots */}
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                {QUOTE_IMAGES.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setQuoteIdx(i)}
                    style={{
                      width: i === quoteIdx ? 18 : 6, height: 6,
                      borderRadius: 3,
                      background: i === quoteIdx ? '#fff' : 'rgba(255,255,255,.35)',
                      cursor: 'pointer',
                      transition: 'all .3s cubic-bezier(.16,1,.3,1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tasks / Habits section ───────────────────────────── */}
        <div style={{ padding: '0 16px 16px' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 12, direction: 'rtl',
          }}>
            <p dir="rtl" style={{
              fontFamily: '"Frank Ruhl Libre", Georgia, serif',
              fontSize: 16, fontWeight: 900, color: T.text, margin: 0,
            }}>המשימות שלי להיום</p>
            <button
              onClick={() => onNavigate('actions')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                color: accent, fontSize: 12, fontWeight: 700,
                fontFamily: 'Barlow Condensed, sans-serif',
                letterSpacing: '.5px',
              }}
              dir="rtl"
            >
              ראה הכל <ChevronLeft style={{ width: 13, height: 13 }} strokeWidth={2.5} />
            </button>
          </div>

          {/* Task list card */}
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 18,
            overflow: 'hidden',
          }}>
            {previewHabits.map((habit, i) => {
              const done = completedHabits.includes(habit.id)
              const color = CATEGORY_COLORS[habit.category] ?? '#4F7DFF'
              const emoji = CATEGORY_EMOJI[habit.category] ?? '•'
              return (
                <div
                  key={habit.id}
                  onClick={() => onNavigate('actions')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    borderBottom: i < previewHabits.length - 1
                      ? `1px solid ${T.isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'}` : 'none',
                    cursor: 'pointer',
                    direction: 'rtl',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.isDark ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.025)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Category icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 17,
                  }}>
                    {emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p dir="rtl" style={{
                      fontFamily: 'Heebo, sans-serif',
                      fontSize: 14, fontWeight: 700,
                      color: done ? T.textMuted : T.text,
                      margin: 0, lineHeight: 1.3,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{habit.title}</p>
                    <p dir="rtl" style={{
                      fontFamily: 'Heebo, sans-serif',
                      fontSize: 11.5, color: T.textDim,
                      margin: '2px 0 0', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{habit.subtitle}</p>
                  </div>

                  {/* Checkbox */}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: done ? 'none' : `2px solid ${T.isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.18)'}`,
                    background: done ? accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: done ? `0 0 10px ${accent}55` : 'none',
                    transition: 'all .2s',
                  }}>
                    {done && <Check style={{ width: 13, height: 13, color: '#fff' }} strokeWidth={3} />}
                  </div>
                </div>
              )
            })}

            {/* Add task row */}
            <div
              onClick={onStart}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px',
                cursor: 'pointer', direction: 'rtl',
                borderTop: `1px solid ${T.isDark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)'}`,
                transition: 'background .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.isDark ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.02)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px dashed ${T.isDark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus style={{ width: 11, height: 11, color: T.textMuted }} strokeWidth={2.5} />
              </div>
              <span dir="rtl" style={{
                fontFamily: 'Heebo, sans-serif',
                fontSize: 13.5, fontWeight: 600, color: T.textMuted,
              }}>התחל את הפריים של היום</span>
            </div>
          </div>
        </div>

        {/* ── Stats bar ────────────────────────────────────────── */}
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: 18,
            padding: '16px 20px',
            display: 'flex', alignItems: 'center',
            direction: 'ltr',
            gap: 0,
          }}>
            {/* Streak */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              paddingRight: 20, borderRight: `1px solid ${T.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'}`,
            }}>
              <Flame style={{ width: 22, height: 22, color: '#FF9F0A' }} strokeWidth={2} fill="rgba(255,159,10,.25)" />
              <div>
                <p style={{
                  fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                  fontSize: 24, fontWeight: 900, color: T.isDark ? '#FFD60A' : '#8B6800',
                  margin: 0, lineHeight: 1,
                }}>{streak}</p>
                <p style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontSize: 8.5, fontWeight: 700, letterSpacing: '1.5px',
                  color: T.textDim, textTransform: 'uppercase', margin: 0,
                }}>STREAK</p>
              </div>
            </div>

            {/* Score ring */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {avg7 !== null ? (
                <div style={{ position: 'relative', width: 90, height: 90 }}>
                  <svg width={90} height={90} viewBox="0 0 90 90">
                    <circle cx={45} cy={45} r={ringR} fill="none"
                      stroke={T.isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}
                      strokeWidth={5.5} />
                    <circle cx={45} cy={45} r={ringR} fill="none"
                      stroke={ringColor} strokeWidth={5.5} strokeLinecap="round"
                      strokeDasharray={ringCirc}
                      strokeDashoffset={ringCirc * (1 - ringPct)}
                      transform="rotate(-90 45 45)"
                      style={{
                        transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)',
                        filter: `drop-shadow(0 0 6px ${ringColor}88)`,
                      }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                      fontSize: 20, fontWeight: 900, color: ringColor, lineHeight: 1,
                    }}>{avg7}</span>
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: 7.5, fontWeight: 700, letterSpacing: '1.5px',
                      color: T.textDim, textTransform: 'uppercase', marginTop: 2,
                    }}>ניקוד</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={onStart}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: `${accent}14`,
                    border: `2px dashed ${accent}40`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                    fontSize: 12, fontWeight: 900, color: accent,
                    textAlign: 'center', lineHeight: 1.3,
                  }} dir="rtl">התחל<br/>היום</span>
                </div>
              )}
            </div>

            {/* Mini stats */}
            <div style={{
              paddingLeft: 20, borderLeft: `1px solid ${T.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'}`,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {[
                { v: `${completedHabits.length}/${totalHabits}`, l: 'הרגלים',  c: '#30D158' },
                { v: `${focusSessions}`,                         l: 'פוקוס',   c: accent },
                { v: `${totalDays}`,                             l: 'ימים',    c: T.text },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: '"Frank Ruhl Libre", Georgia, serif',
                    fontSize: 16, fontWeight: 900, color: c, margin: 0, lineHeight: 1,
                  }}>{v}</p>
                  <p style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 8, fontWeight: 700, letterSpacing: '1px',
                    color: T.textDim, textTransform: 'uppercase', margin: '2px 0 0',
                  }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick actions ────────────────────────────────────── */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
          {[
            { label: 'פחדים',  view: 'fear'   as const, color: '#BF5AF2', emoji: '🔥' },
            { label: 'שבועי',  view: 'weekly' as const, color: '#FF9F0A', emoji: '⚔️' },
          ].map(({ label, view, color, emoji }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              style={{
                flex: 1,
                background: T.isDark ? `${color}10` : `${color}0d`,
                border: `1px solid ${color}25`,
                borderRadius: 14,
                padding: '14px 12px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}20` }}
              onMouseLeave={e => { e.currentTarget.style.background = T.isDark ? `${color}10` : `${color}0d` }}
            >
              <span style={{ fontSize: 16 }}>{emoji}</span>
              <span dir="rtl" style={{
                fontFamily: 'Heebo, sans-serif',
                fontSize: 13, fontWeight: 700, color,
              }}>{label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
