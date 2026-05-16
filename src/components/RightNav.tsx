import { Home, Zap, CheckSquare, Play, Trophy, Skull, Swords, User, Sun, Moon } from 'lucide-react'
import type { AppState } from '../types'

type View = AppState['currentView']

const NAV: { id: View; Icon: typeof Home; label: string; color: string }[] = [
  { id: 'home',    Icon: Home,        label: 'בית',   color: '#f2f2f7' },
  { id: 'prime',   Icon: Zap,         label: 'פריים', color: '#FFD60A' },
  { id: 'actions', Icon: CheckSquare, label: 'יומי',  color: '#30D158' },
  { id: 'inspire', Icon: Play,        label: 'השראה', color: '#FF375F' },
  { id: 'wins',    Icon: Trophy,      label: 'גדילה', color: '#FFD60A' },
  { id: 'fear',    Icon: Skull,       label: 'פחד',   color: '#BF5AF2' },
  { id: 'weekly',  Icon: Swords,      label: 'מלחמה', color: '#FF9F0A' },
]

interface Props {
  current: View
  onChange: (v: View) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function RightNav({ current, onChange, theme, onToggleTheme }: Props) {
  return (
    <nav style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: 62,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderLeft: '1px solid var(--nav-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      zIndex: 30,
      transition: 'background .3s, border-color .3s',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          fontFamily: 'Barlow Condensed, sans-serif',
          letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #FFD60A, #FF9F0A)',
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
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-h)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <Icon
                strokeWidth={active ? 2.5 : 1.5}
                style={{
                  width: active ? 20 : 18, height: active ? 20 : 18,
                  color: active ? color : 'var(--muted)',
                  opacity: active ? 1 : .85,
                  filter: active ? `drop-shadow(0 0 6px ${color}80)` : 'none',
                  transition: 'color .18s, filter .18s',
                }}
              />
              <span style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: '.3px',
                color: active ? color : 'var(--muted)',
                textTransform: 'uppercase',
                fontFamily: 'Barlow Condensed, sans-serif',
                transition: 'color .18s',
              }}>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile + Theme at bottom */}
      <div style={{ width: '100%', padding: '0 8px', marginTop: 4 }}>
        <div style={{ height: 1, background: 'var(--nav-border)', marginBottom: 6 }} />
        <button
          onClick={() => onChange('profile' as AppState['currentView'])}
          title="פרופיל"
          style={{
            width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
            borderRight: current === 'profile' ? '3px solid #FFD60A' : '3px solid transparent',
            background: current === 'profile' ? 'rgba(255,214,10,.1)' : 'transparent',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all .18s',
          }}>
          <User strokeWidth={current === 'profile' ? 2.5 : 1.5}
            style={{
              width: current === 'profile' ? 20 : 18, height: current === 'profile' ? 20 : 18,
              color: current === 'profile' ? '#FFD60A' : 'var(--muted)',
              filter: current === 'profile' ? 'drop-shadow(0 0 6px rgba(255,214,10,.5))' : 'none',
              transition: 'color .18s, filter .18s',
            }} />
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '.3px',
            color: current === 'profile' ? '#FFD60A' : 'var(--muted)',
            textTransform: 'uppercase', fontFamily: 'Barlow Condensed, sans-serif',
          }}>פרופיל</span>
        </button>

        {/* Theme toggle */}
        <div style={{ height: 1, background: 'var(--nav-border)', margin: '6px 0' }} />
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
            borderRight: '3px solid transparent',
            background: 'transparent',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'all .18s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-h)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          {theme === 'dark'
            ? <Sun strokeWidth={1.5} style={{ width: 17, height: 17, color: 'var(--muted)', transition: 'color .18s' }} />
            : <Moon strokeWidth={1.5} style={{ width: 17, height: 17, color: 'var(--muted)', transition: 'color .18s' }} />
          }
          <span style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: '.3px',
            color: 'var(--muted)', textTransform: 'uppercase', fontFamily: 'Barlow Condensed, sans-serif',
          }}>{theme === 'dark' ? 'בהיר' : 'כהה'}</span>
        </button>
      </div>
    </nav>
  )
}
