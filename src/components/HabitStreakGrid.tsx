import { HABITS } from '../constants'
import type { DayEntry } from '../types'
import { useTheme } from '../contexts/ThemeContext'

interface Props { entries: DayEntry[] }

function getDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function habitStreak(habitId: string, entries: DayEntry[]): number {
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const date = getDateStr(i)
    const entry = entries.find(e => e.date === date)
    if (entry?.habits?.includes(habitId)) streak++
    else if (i > 0) break // allow today to be incomplete
  }
  return streak
}

const DAYS = 14

export function HabitStreakGrid({ entries }: Props) {
  const T = useTheme()

  const habitsWithData = HABITS.map(h => {
    const streak = habitStreak(h.id, entries)
    const days = Array.from({ length: DAYS }, (_, i) => {
      const date = getDateStr(DAYS - 1 - i)
      return !!entries.find(e => e.date === date)?.habits?.includes(h.id)
    })
    return { ...h, streak, days }
  }).filter(h => h.streak > 0 || h.days.some(Boolean))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 8)

  if (habitsWithData.length === 0) return null

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${T.divider}` }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>
          רצף הרגלים — 14 יום
        </p>
      </div>
      {habitsWithData.map((h, hi) => (
        <div key={h.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          borderBottom: hi < habitsWithData.length - 1 ? `1px solid ${T.divider}` : 'none',
          direction: 'rtl',
        }}>
          {/* Streak badge */}
          <div style={{
            minWidth: 32, height: 32, borderRadius: 10,
            background: h.streak >= 7 ? 'rgba(251,191,36,.12)' : h.streak >= 3 ? 'rgba(91,140,255,.1)' : T.tagBg,
            border: `1px solid ${h.streak >= 7 ? 'rgba(251,191,36,.3)' : h.streak >= 3 ? 'rgba(91,140,255,.2)' : T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 900,
              color: h.streak >= 7 ? '#FBBF24' : h.streak >= 3 ? '#5B8CFF' : T.textMuted,
            }}>{h.streak}</span>
          </div>

          {/* Title */}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: T.textSub, flex: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {h.title}
          </p>

          {/* 14-day dots */}
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            {h.days.map((done, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: 2,
                background: done
                  ? h.streak >= 7 ? '#FBBF24' : '#5B8CFF'
                  : T.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)',
                boxShadow: done && h.streak >= 7 ? '0 0 4px rgba(251,191,36,.5)' : done ? '0 0 4px rgba(91,140,255,.4)' : 'none',
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
