import { X, Zap, CheckSquare, Play, Trophy, Skull, Swords } from 'lucide-react'
import type { AppState } from '../types'

type View = AppState['currentView']

interface Props {
  currentView: View
  onNavigate:  (v: View) => void
  onClose:     () => void
}

const ITEMS: { id: View; label: string; labelHe: string; Icon: typeof Zap; color: string; desc: string }[] = [
  { id: 'prime',   label: 'PRIME',   labelHe: 'הכנת הבוקר',    Icon: Zap,         color: '#f5c435', desc: 'הכנה, התחייבות, הצהרה' },
  { id: 'actions', label: 'ACTIONS', labelHe: 'פעולות היום',   Icon: CheckSquare, color: '#22c55e', desc: 'הרגלים יומיים ומשימות' },
  { id: 'inspire', label: 'INSPIRE', labelHe: 'השראה',         Icon: Play,        color: '#ef4444', desc: 'ציטוטים וסרטוני מוטיבציה' },
  { id: 'wins',    label: 'GROWTH',  labelHe: 'קיר הגדילה',   Icon: Trophy,      color: '#f5c435', desc: 'ניצחונות, ציונים, תרשימים' },
  { id: 'fear',    label: 'FEAR',    labelHe: 'פחד לדלק',     Icon: Skull,       color: '#8b5cf6', desc: 'הפוך פחדים למנוע צמיחה' },
  { id: 'weekly',  label: 'WAR',     labelHe: 'חדר המלחמה',   Icon: Swords,      color: '#f97316', desc: 'תכנון שבועי ומטרות' },
]

export function MenuDrawer({ currentView, onNavigate, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col animate-slide-up"
        style={{ width: '80%', maxWidth: 320, background: '#0a0a0f', borderLeft: '1px solid #2a2a3d' }}
      >
        {/* Header */}
        <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid #2a2a3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="label-xs mb-1" style={{ color: '#f5c435' }}>SUCCESS OS</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: '#e8e8f0' }} dir="rtl">תפריט</p>
          </div>
          <button onClick={onClose}
            style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X className="w-4 h-4" style={{ color: '#6b6b8a' }} />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '12px 12px' }}>
          {ITEMS.map(({ id, labelHe, Icon, color, desc }, i) => {
            const active = currentView === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="w-full animate-slide-up"
                style={{
                  animationDelay: `${i * 40}ms`, animationFillMode: 'both',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', marginBottom: 6,
                  background: active ? `${color}12` : 'transparent',
                  border: `1px solid ${active ? color + '35' : '#2a2a3d'}`,
                  borderRadius: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'right',
                }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: active ? `${color}20` : '#12121a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${active ? color + '40' : '#2a2a3d'}` }}>
                  <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 1.5} style={{ color: active ? color : '#6b6b8a' }} />
                </div>
                <div dir="rtl" style={{ flex: 1, textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 900, color: active ? color : '#e8e8f0', marginBottom: 2 }}>{labelHe}</p>
                  <p style={{ fontSize: 11, color: '#6b6b8a' }}>{desc}</p>
                </div>
                {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2a2a3d' }}>
          <p style={{ fontSize: 11, color: '#6b6b8a', textAlign: 'center' }} dir="rtl">
            SUCCESS OS — מערכת ההפעלה של הגדולה
          </p>
        </div>
      </div>
    </>
  )
}
