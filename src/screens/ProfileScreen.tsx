import { useState } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import type { UserGoal } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  userName:      string
  goals:         UserGoal[]
  onSaveGoals:   (goals: UserGoal[]) => void
  theme?:        'dark' | 'light'
  onToggleTheme?: () => void
}

const CATEGORIES: UserGoal['category'][] = ['עסקי', 'כספי', 'בריאות', 'קשרים', 'אישי']

const CAT_COLORS: Record<UserGoal['category'], string> = {
  'עסקי':   '#FBBF24',
  'כספי':   '#4ADE80',
  'בריאות': '#FF5C5C',
  'קשרים':  '#A78BFA',
  'אישי':   '#FB923C',
}

const GOAL_PLACEHOLDERS = [
  'להגיע ל-20,000₪ הכנסה חודשית',
  'לרוץ 10 ק"מ ללא עצירה',
  'לפרסם 3 פוסטים בשבוע',
  'לקרוא 24 ספרים השנה',
  'לחסוך 50,000₪ עד סוף השנה',
]

function GoalRow({ goal, onDelete, onUpdate }: {
  goal: UserGoal; onDelete: () => void; onUpdate: (g: UserGoal) => void
}) {
  const T = useTheme()
  const color = CAT_COLORS[goal.category]
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '14px 16px',
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRight: `3px solid ${color}`,
      borderRadius: 16,
      marginBottom: 10,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 6, boxShadow: `0 0 8px ${color}88` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          value={goal.title}
          onChange={e => onUpdate({ ...goal, title: e.target.value })}
          placeholder="הגדר יעד..."
          dir="rtl"
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700,
            color: T.text, padding: 0,
          }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { onUpdate({ ...goal, category: cat }); playCheck() }}
              style={{
                padding: '3px 10px', borderRadius: 999, border: '1px solid',
                fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px',
                cursor: 'pointer',
                background: goal.category === cat ? `${CAT_COLORS[cat]}22` : 'transparent',
                borderColor: goal.category === cat ? CAT_COLORS[cat] : T.border2,
                color: goal.category === cat ? CAT_COLORS[cat] : T.textDim,
                transition: 'all .15s',
              }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="date"
            value={goal.deadline ?? ''}
            onChange={e => onUpdate({ ...goal, deadline: e.target.value || undefined })}
            style={{
              background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border2}`,
              outline: 'none', color: goal.deadline ? T.textMuted : T.textFaint,
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
              letterSpacing: '1px', padding: '3px 0', colorScheme: 'dark',
            }}
          />
        </div>
      </div>
      <button onClick={onDelete}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,92,92,.3)', flexShrink: 0, transition: 'color .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5C5C' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,92,92,.3)' }}>
        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ProfileScreen({ userName, goals, onSaveGoals, theme, onToggleTheme }: Props) {
  const T = useTheme()
  const [localGoals, setLocalGoals] = useState<UserGoal[]>(goals)
  const [saved, setSaved] = useState(false)

  const addGoal = () => {
    if (localGoals.length >= 5) return
    playCheck()
    setLocalGoals(g => [...g, { id: `goal_${Date.now()}`, title: '', category: 'עסקי', createdAt: new Date().toISOString() }])
    setSaved(false)
  }

  const updateGoal = (id: string, updated: UserGoal) => {
    setLocalGoals(g => g.map(x => x.id === id ? updated : x))
    setSaved(false)
  }

  const deleteGoal = (id: string) => {
    setLocalGoals(g => g.filter(x => x.id !== id))
    setSaved(false)
  }

  const save = () => {
    const filled = localGoals.filter(g => g.title.trim().length > 0)
    onSaveGoals(filled)
    playComplete()
    setSaved(true)
  }

  const filledCount = localGoals.filter(g => g.title.trim().length > 0).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── Scrollable ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 100px' }}>

          {/* Hero */}
          <div style={{ padding: '16px 16px 14px' }}>
            <div className="today-hero" style={{
              background: T.isDark
                ? 'linear-gradient(135deg, rgba(167,139,250,.85) 0%, rgba(91,140,255,.65) 55%, rgba(74,222,128,.15) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
                : 'linear-gradient(135deg, rgba(139,92,246,.8) 0%, rgba(59,111,239,.7) 55%, rgba(16,185,129,.2) 100%), linear-gradient(180deg, #ede9fe 0%, #dde5ff 100%)',
              border: '1px solid rgba(167,139,250,.22)',
              boxShadow: '0 8px 32px rgba(167,139,250,.12)',
            }}>
              <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '7rem', opacity: .04, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>⚙</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div dir="rtl">
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>SETTINGS</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>פרופיל ויעדים</p>
                </div>
                {filledCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)' }}>
                    <CheckCircle style={{ width: 10, height: 10, color: '#4ADE80' }} strokeWidth={2.5} />
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: '#4ADE80', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{filledCount} יעדים</span>
                  </div>
                )}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.3)' }} dir="rtl">
                {userName}
              </p>
            </div>
          </div>

          <div style={{ padding: '0 16px' }}>

            {/* Goals section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>היעדים שלי ({filledCount}/5)</p>
                {filledCount >= 2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle style={{ width: 11, height: 11, color: '#4ADE80' }} />
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: '#4ADE80', letterSpacing: '1px' }}>מוכן לפריים</span>
                  </div>
                )}
              </div>

              {localGoals.length === 0 && (
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid rgba(251,191,36,.35)', borderRadius: 18, padding: '16px 18px', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#FBBF24', textTransform: 'uppercase', marginBottom: 10 }}>דוגמאות ליעדים</p>
                  {GOAL_PLACEHOLDERS.map((p, i) => (
                    <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 4 }} dir="rtl">· {p}</p>
                  ))}
                </div>
              )}

              {localGoals.map(goal => (
                <GoalRow key={goal.id} goal={goal} onDelete={() => deleteGoal(goal.id)} onUpdate={u => updateGoal(goal.id, u)} />
              ))}

              {localGoals.length < 5 && (
                <button onClick={addGoal} dir="rtl"
                  style={{
                    width: '100%', padding: '13px',
                    background: 'transparent', border: `1px dashed ${T.border2}`,
                    borderRadius: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    color: T.textDim, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                    transition: 'all .2s',
                  }}>
                  <Plus style={{ width: 15, height: 15 }} strokeWidth={2} />
                  הוסף יעד
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: T.divider, marginBottom: 20 }} />

            {/* Theme toggle */}
            {onToggleTheme && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>מראה</p>
                <button onClick={onToggleTheme} dir="rtl"
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'border-color .2s',
                  }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.text }}>
                    {theme === 'dark' ? '🌙 מצב כהה' : '☀️ מצב בהיר'}
                  </span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: T.textMuted, textTransform: 'uppercase' }}>
                    {theme === 'dark' ? 'עבור לבהיר' : 'עבור לכהה'}
                  </span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Save CTA */}
      <div style={{ flexShrink: 0, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', background: T.bg, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 16px' }}>
          {saved ? (
            <div style={{ padding: '10px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: '#4ADE80', background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 12 }} dir="rtl">
              ✓ היעדים נשמרו
            </div>
          ) : (
            <button onClick={save} disabled={filledCount === 0} className="btn-gold w-full" dir="rtl"
              style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              שמור יעדים
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
