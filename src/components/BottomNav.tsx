import { Home, Zap, Trophy, ListTodo, Settings } from 'lucide-react'
import type { AppState } from '../types'
import { useTheme } from '../contexts/ThemeContext'

type View = AppState['currentView']

const TABS: { id: View; Icon: typeof Home; label: string }[] = [
  { id: 'home',    Icon: Home,     label: 'בית'      },
  { id: 'prime',   Icon: Zap,      label: 'יומי'     },
  { id: 'wins',    Icon: Trophy,   label: 'גדילה'    },
  { id: 'tasks',   Icon: ListTodo, label: 'משימות'   },
  { id: 'profile', Icon: Settings, label: 'הגדרות'   },
]

const ACCENT_DARK  = '#5B8CFF'
const ACCENT_LIGHT = '#3B6FEF'

interface Props {
  current:  View
  onChange: (v: View) => void
}

export function BottomNav({ current, onChange }: Props) {
  const T = useTheme()
  const ACCENT = T.isDark ? ACCENT_DARK : ACCENT_LIGHT

  return (
    <nav style={{
      position: 'fixed',
      bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 460,
      height: 64,
      background: T.isDark
        ? 'rgba(13,14,19,.93)'
        : 'rgba(248,250,252,.95)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      borderRadius: 28,
      border: T.isDark
        ? '1px solid rgba(255,255,255,.10)'
        : '1px solid rgba(0,0,0,.10)',
      boxShadow: T.isDark
        ? '0 8px 48px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.06)'
        : '0 8px 48px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.9)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      zIndex: 30,
      direction: 'rtl',
    }}>
      {TABS.map(({ id, Icon, label }) => {
        const active = current === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              height: 48,
              border: 'none',
              background: active
                ? T.isDark ? 'rgba(91,140,255,.14)' : 'rgba(59,111,239,.12)'
                : 'transparent',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              cursor: 'pointer',
              transform: active ? 'scale(1.05)' : 'scale(1)',
              transition: 'all .28s cubic-bezier(.34,1.56,.64,1)',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon
              style={{
                width: 20, height: 20,
                color: active ? ACCENT : T.isDark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.28)',
                filter: active ? `drop-shadow(0 0 7px ${ACCENT}90)` : 'none',
                transition: 'all .22s cubic-bezier(.16,1,.3,1)',
              }}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '.5px',
              color: active ? ACCENT : T.isDark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.3)',
              fontFamily: 'Barlow Condensed, sans-serif',
              textTransform: 'uppercase',
              transition: 'color .22s',
              lineHeight: 1,
            }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
