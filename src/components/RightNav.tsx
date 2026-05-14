import { Home, Zap, CheckSquare, Play, Trophy, Skull, Swords } from 'lucide-react'
import type { AppState } from '../types'

type View = AppState['currentView']

const NAV: { id: View; Icon: typeof Home; label: string; color: string }[] = [
  { id: 'home',    Icon: Home,        label: 'בית',   color: '#f2f2f7' },
  { id: 'prime',   Icon: Zap,         label: 'PRIME', color: '#FFD60A' },
  { id: 'actions', Icon: CheckSquare, label: 'יומי',  color: '#30D158' },
  { id: 'inspire', Icon: Play,        label: 'השראה', color: '#FF375F' },
  { id: 'wins',    Icon: Trophy,      label: 'גדילה', color: '#FFD60A' },
  { id: 'fear',    Icon: Skull,       label: 'פחד',   color: '#BF5AF2' },
  { id: 'weekly',  Icon: Swords,      label: 'WAR',   color: '#FF9F0A' },
]

interface Props {
  current: View
  onChange: (v: View) => void
}

export function RightNav({ current, onChange }: Props) {
  return (
    <nav style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: 62,
      background: 'rgba(8,8,8,0.97)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderLeft: '1px solid rgba(255,255,255,.07)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          fontFamily: 'Barlow Condensed, sans-serif',
          letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #FF375F, #BF5AF2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
        }}>S</div>
        <div style={{ fontSize: 6, fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginTop: 2 }}>OS</div>
      </div>

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,.07)', marginBottom: 8 }} />

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: '0 8px', flex: 1 }}>
        {NAV.map(({ id, Icon, label, color }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={label}
              style={{
                width: '100%',
                padding: '9px 0',
                borderRadius: 10,
                border: 'none',
                borderRight: active ? `3px solid ${color}` : '3px solid transparent',
                background: active ? `${color}1a` : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                transition: 'all .18s',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <Icon
                strokeWidth={active ? 2.5 : 1.5}
                style={{
                  width: 18, height: 18,
                  color: active ? color : 'rgba(255,255,255,.38)',
                  opacity: active ? 1 : .85,
                  transition: 'color .18s',
                }}
              />
              <span style={{
                fontSize: 7.5,
                fontWeight: 800,
                letterSpacing: '.5px',
                color: active ? color : 'rgba(255,255,255,.3)',
                textTransform: 'uppercase',
                fontFamily: 'Barlow Condensed, sans-serif',
                transition: 'color .18s',
              }}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
