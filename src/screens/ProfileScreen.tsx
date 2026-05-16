import { useState } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import type { UserGoal } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  userName:   string
  goals:      UserGoal[]
  onSaveGoals: (goals: UserGoal[]) => void
}

const CATEGORIES: UserGoal['category'][] = ['עסקי', 'כספי', 'בריאות', 'קשרים', 'אישי']

const CAT_COLORS: Record<UserGoal['category'], string> = {
  'עסקי':   '#FFD60A',
  'כספי':   '#30D158',
  'בריאות': '#FF375F',
  'קשרים':  '#BF5AF2',
  'אישי':   '#FF9F0A',
}

const GOAL_PLACEHOLDERS = [
  'להגיע ל-20,000₪ הכנסה חודשית',
  'לרוץ 10 ק"מ ללא עצירה',
  'לפרסם 3 פוסטים בשבוע',
  'לקרוא 24 ספרים השנה',
  'לחסוך 50,000₪ עד סוף השנה',
]

function GoalRow({ goal, onDelete, onUpdate }: {
  goal: UserGoal
  onDelete: () => void
  onUpdate: (g: UserGoal) => void
}) {
  const T = useTheme()
  const color = CAT_COLORS[goal.category]
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '14px 16px',
      background: T.tagBg,
      border: `1px solid ${T.border}`,
      borderRight: `3px solid ${color}`,
      borderRadius: 14,
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
            fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 15, fontWeight: 700,
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
                borderColor: goal.category === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,.12)',
                color: goal.category === cat ? CAT_COLORS[cat] : 'rgba(255,255,255,.35)',
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
              background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.12)',
              outline: 'none', color: goal.deadline ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.2)',
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
              letterSpacing: '1px', padding: '3px 0', colorScheme: 'dark',
            }}
          />
          {goal.deadline && (
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, color: 'rgba(255,255,255,.25)', marginRight: 8 }}>
              יעד לתאריך
            </span>
          )}
        </div>
      </div>
      <button onClick={onDelete}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,55,95,.4)', flexShrink: 0 }}>
        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ProfileScreen({ userName, goals, onSaveGoals }: Props) {
  const T = useTheme()
  const [localGoals, setLocalGoals] = useState<UserGoal[]>(goals)
  const [saved, setSaved] = useState(false)

  const addGoal = () => {
    if (localGoals.length >= 5) return
    playCheck()
    setLocalGoals(g => [...g, {
      id: `goal_${Date.now()}`,
      title: '',
      category: 'עסקי',
      createdAt: new Date().toISOString(),
    }])
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
  const needsMore   = filledCount < 2

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* Header */}
      <div className="shrink-0" style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.6)', textTransform: 'uppercase', marginBottom: 6 }}>פרופיל</p>
        <h1 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 28, fontWeight: 900, color: T.text }} dir="rtl">
          {userName}
        </h1>
        <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textMuted, marginTop: 4 }} dir="rtl">
          הגדר את היעדים שלך — ה-PRIME יעזור לך לרדוף אחריהם כל יום
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '20px 20px 32px' }}>

        {/* Guidance banner */}
        {needsMore && (
          <div className="animate-slide-up" style={{
            padding: '14px 16px', marginBottom: 20,
            background: 'rgba(255,214,10,.07)', border: '1px solid rgba(255,214,10,.2)',
            borderRadius: 14,
          }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#C8A800', textTransform: 'uppercase', marginBottom: 6 }}>
              {filledCount === 0 ? 'אין יעדים מוגדרים' : 'יעד אחד — תוסיף עוד'}
            </p>
            <p style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.isDark ? 'rgba(255,214,10,.7)' : 'rgba(130,100,0,.85)', lineHeight: 1.6 }} dir="rtl">
              {filledCount === 0
                ? 'ללא יעדים ברורים, הפעולות שלך מפוזרות. הגדר לפחות 2 יעדים שמניעים אותך.'
                : 'יעד אחד זה טוב. שניים זה מערכת. הוסף עוד יעד אחד לפחות.'}
            </p>
          </div>
        )}

        {/* Goals list */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase' }}>
              היעדים שלי ({filledCount}/5)
            </p>
            {filledCount >= 2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle style={{ width: 12, height: 12, color: '#30D158' }} />
                <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: '#30D158', letterSpacing: '1px' }}>
                  מוכן לפריים
                </span>
              </div>
            )}
          </div>

          {localGoals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.4 }}>
              <p style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 16, fontWeight: 700, color: '#f2f2f7' }} dir="rtl">
                לחץ + כדי להוסיף יעד ראשון
              </p>
            </div>
          ) : (
            localGoals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onDelete={() => deleteGoal(goal.id)}
                onUpdate={updated => updateGoal(goal.id, updated)}
              />
            ))
          )}

          {localGoals.length < 5 && (
            <button onClick={addGoal}
              style={{
                width: '100%', padding: '14px',
                background: 'transparent', border: '1px dashed rgba(255,255,255,.15)',
                borderRadius: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'rgba(255,255,255,.35)',
                fontFamily: 'Heebo, sans-serif', fontSize: 13, fontWeight: 600,
                transition: 'border-color .2s, color .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,214,10,.3)'; e.currentTarget.style.color = '#FFD60A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.color = 'rgba(255,255,255,.35)' }}
              dir="rtl">
              <Plus style={{ width: 16, height: 16 }} strokeWidth={2} />
              הוסף יעד {localGoals.length === 0 ? 'ראשון' : ''}
            </button>
          )}
        </div>

        {/* Goal examples hint */}
        {localGoals.length === 0 && (
          <div className="card" style={{ borderRight: '3px solid rgba(255,214,10,.3)' }}>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,214,10,.5)', textTransform: 'uppercase', marginBottom: 12 }}>
              דוגמאות ליעדים
            </p>
            {GOAL_PLACEHOLDERS.map((p, i) => (
              <p key={i} style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: 'rgba(255,255,255,.35)', lineHeight: 1.5, marginBottom: 6 }} dir="rtl">· {p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Save CTA */}
      <div className="shrink-0" style={{ padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: `1px solid ${T.border}`, background: T.bgRaised, transition: 'background .3s' }}>
        {saved ? (
          <div style={{ padding: '18px', textAlign: 'center', fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontWeight: 700, fontSize: 16, color: '#30D158', background: 'rgba(48,209,88,.06)', border: '1px solid rgba(48,209,88,.2)', borderRadius: 12 }} dir="rtl">
            היעדים נשמרו
          </div>
        ) : (
          <button onClick={save} disabled={filledCount === 0}
            className="btn-gold w-full"
            style={{ padding: '18px', fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 16, fontWeight: 900 }}
            dir="rtl">
            שמור יעדים
          </button>
        )}
      </div>
    </div>
  )
}
