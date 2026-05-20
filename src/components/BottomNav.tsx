import { Home, Zap, Trophy, ListTodo } from 'lucide-react'
import type { AppState } from '../types'

type View = AppState['currentView']

const TABS: { id: View; Icon: typeof Home; label: string }[] = [
  { id: 'home',  Icon: Home,     label: 'בית'    },
  { id: 'prime', Icon: Zap,      label: 'יומי'   },
  { id: 'wins',  Icon: Trophy,   label: 'גדילה'  },
  { id: 'tasks', Icon: ListTodo, label: 'משימות' },
]

const ACCENT = '#5B8CFF'

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
              background: active ? 'rgba(91,140,255,.08)' : 'transparent',
              borderRadius: 14,
              margin: '6px 4px 0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 4,
              paddingTop: 10,
              paddingBottom: 8,
              position: 'relative',
              transition: 'background .2s, opacity .15s',
              outline: 'none',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.opacity = '.75' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            {/* Active top indicator bar */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 24, height: 3, borderRadius: '0 0 3px 3px',
                background: ACCENT,
                boxShadow: `0 0 10px ${ACCENT}90`,
              }} />
            )}

            <Icon
              style={{
                width: 20, height: 20,
                color: active ? ACCENT : 'rgba(255,255,255,.3)',
                filter: active ? `drop-shadow(0 0 6px ${ACCENT}80)` : 'none',
                transition: 'all .2s cubic-bezier(.16,1,.3,1)',
                marginTop: 4,
              }}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '.5px',
              color: active ? ACCENT : 'rgba(255,255,255,.25)',
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
