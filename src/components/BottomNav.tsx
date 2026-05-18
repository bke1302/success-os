import { Home, Zap, Timer, Trophy, ListTodo } from 'lucide-react'
import type { AppState } from '../types'

type View = AppState['currentView']

const TABS: { id: View; Icon: typeof Home; label: string }[] = [
  { id: 'home',    Icon: Home,     label: 'בית'   },
  { id: 'prime',   Icon: Zap,      label: 'יומי'  },
  { id: 'focus',   Icon: Timer,    label: 'פוקוס' },
  { id: 'wins',    Icon: Trophy,   label: 'גדילה' },
  { id: 'tasks',   Icon: ListTodo, label: 'משימות' },
]

const ACCENT = '#4F7DFF'

interface Props {
  current:  View
  onChange: (v: View) => void
}

export function BottomNav({ current, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'calc(var(--bottom-nav-h, 68px) + env(safe-area-inset-bottom))',
      background: 'var(--bottom-nav-bg, rgba(13,14,19,.97))',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: '1px solid var(--nav-border, rgba(255,255,255,.07))',
      display: 'flex', alignItems: 'flex-start',
      direction: 'ltr',
      zIndex: 30,
      paddingTop: 0,
      boxShadow: '0 -8px 32px rgba(0,0,0,.25)',
    }}>
      {TABS.map(({ id, Icon, label }) => {
        const active = current === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 5,
              paddingTop: 12,
              paddingBottom: 8,
              position: 'relative',
              transition: 'opacity .15s',
              outline: 'none',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.opacity = '.75' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            {/* Active indicator line at top */}
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: active ? 32 : 0, height: 2,
              background: ACCENT,
              borderRadius: '0 0 4px 4px',
              transition: 'width .25s cubic-bezier(.16,1,.3,1)',
            }} />

            <Icon
              style={{
                width: active ? 22 : 20,
                height: active ? 22 : 20,
                color: active ? ACCENT : 'rgba(255,255,255,.32)',
                filter: active ? `drop-shadow(0 0 8px ${ACCENT}99)` : 'none',
                transition: 'all .2s cubic-bezier(.16,1,.3,1)',
              }}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '.5px',
              color: active ? ACCENT : 'rgba(255,255,255,.28)',
              fontFamily: 'Barlow Condensed, sans-serif',
              textTransform: 'uppercase',
              transition: 'color .2s',
              lineHeight: 1,
            }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
