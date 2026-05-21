import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Bell, BellOff, CloudOff, Copy, Check, Share2, Bot } from 'lucide-react'
import { getAICoachURL, setAICoachURL } from '../utils/aiCoachAPI'
import type { UserGoal, UserHabit } from '../types'
import { playCheck, playComplete } from '../utils/sounds'
import { useTheme } from '../contexts/ThemeContext'
import { getReminderTime, setReminderTime, requestAndScheduleReminder } from '../utils/reminder'
import { SUPABASE_READY, pushData, pullData } from '../utils/supabase'

interface Props {
  userName:         string
  goals:            UserGoal[]
  onSaveGoals:      (goals: UserGoal[]) => void
  theme?:           'dark' | 'light'
  onToggleTheme?:   () => void
  appData?:         object
  onImportData?:    (data: object) => void
  userHabits?:      UserHabit[]
  onSaveUserHabit?: (h: UserHabit) => void
  onDeleteUserHabit?: (id: string) => void
  streak?:          number
  totalDays?:       number
  avgScore?:        string
  referralCode?:    string
  onUpgrade?:       () => void
  isPro?:           boolean
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
            min={new Date().toISOString().slice(0, 10)}
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

export function ProfileScreen({ userName, goals, onSaveGoals, theme, onToggleTheme, appData, onImportData, userHabits = [], onSaveUserHabit, onDeleteUserHabit, streak = 0, totalDays = 0, avgScore = '—', referralCode, onUpgrade, isPro }: Props) {
  const T = useTheme()
  const [localGoals, setLocalGoals] = useState<UserGoal[]>(goals)
  const [saved, setSaved] = useState(false)

  // ── Custom Habits ──────────────────────────────────────────────────────────
  const [newHabitEmoji, setNewHabitEmoji] = useState('')
  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [newHabitSub,   setNewHabitSub]   = useState('')
  const [habitAdded, setHabitAdded] = useState(false)

  const FREE_HABIT_LIMIT = 3

  const addCustomHabit = () => {
    const title = newHabitTitle.trim()
    if (!title) return
    if (!isPro && userHabits.length >= FREE_HABIT_LIMIT) {
      onUpgrade?.()
      return
    }
    const habit: UserHabit = {
      id: `custom_${Date.now()}`,
      emoji: newHabitEmoji.trim() || '⭐',
      title,
      subtitle: newHabitSub.trim() || undefined,
      category: 'personal',
    }
    onSaveUserHabit?.(habit)
    setNewHabitEmoji('')
    setNewHabitTitle('')
    setNewHabitSub('')
    setHabitAdded(true)
    setTimeout(() => setHabitAdded(false), 1500)
  }

  // ── Referral ───────────────────────────────────────────────────────────────
  const [referralCopied, setReferralCopied] = useState(false)

  const copyReferral = () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${referralCode}`
    navigator.clipboard.writeText(url).then(() => {
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2000)
    }).catch(() => {})
  }

  const shareWhatsAppSummary = () => {
    const msg = encodeURIComponent(
      `🔥 SUCCESS OS — הדוח היומי שלי\n` +
      `STREAK: ${streak} ימים\n` +
      `סה"כ ימים: ${totalDays}\n` +
      `ממוצע ציון: ${avgScore}/10\n` +
      `הצטרף/י אליי: ${window.location.origin}${window.location.pathname}?ref=${referralCode ?? ''}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  // ── Partner share ──────────────────────────────────────────────────────────
  const [partnerCopied, setPartnerCopied] = useState(false)

  const sharePartnerLink = () => {
    const payload = { streak, totalDays, avgScore, date: new Date().toISOString().slice(0, 10) }
    const encoded = btoa(JSON.stringify(payload))
    const url = `${window.location.origin}${window.location.pathname}?partner=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setPartnerCopied(true)
      setTimeout(() => setPartnerCopied(false), 2000)
    }).catch(() => {})
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifTime,    setNotifTimeState] = useState(getReminderTime)
  const [notifStatus,  setNotifStatus]    = useState<'idle'|'scheduled'|'denied'|'unsupported'>('idle')
  const notifGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted'

  const handleScheduleNotif = async () => {
    const result = await requestAndScheduleReminder()
    setNotifStatus(result)
  }

  // ── AI Coach URL ──────────────────────────────────────────────────
  const [aiUrl,      setAiUrl]      = useState(getAICoachURL)
  const [aiUrlSaved, setAiUrlSaved] = useState(false)

  const saveAiUrl = () => {
    setAICoachURL(aiUrl)
    setAiUrlSaved(true)
    setTimeout(() => setAiUrlSaved(false), 2000)
  }

  // ── Supabase Sync ─────────────────────────────────────────────────────────
  const SYNC_KEY_STORE = 'success_sync_code'
  const [syncCode,    setSyncCode]    = useState(() => {
    const existing = localStorage.getItem(SYNC_KEY_STORE)
    if (existing) return existing
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    localStorage.setItem(SYNC_KEY_STORE, code)
    return code
  })
  const [syncStatus,  setSyncStatus]  = useState<'idle'|'pushing'|'pulling'|'ok'|'error'>('idle')
  const [codeCopied,  setCodeCopied]  = useState(false)
  const [importCode,  setImportCode]  = useState('')

  const handlePush = async () => {
    if (!appData) return
    setSyncStatus('pushing')
    const ok = await pushData(syncCode, appData)
    setSyncStatus(ok ? 'ok' : 'error')
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  const handlePull = async () => {
    const code = importCode.trim().toUpperCase() || syncCode
    setSyncStatus('pulling')
    const data = await pullData(code)
    if (data && onImportData) {
      onImportData(data)
      setSyncStatus('ok')
      localStorage.setItem(SYNC_KEY_STORE, code)
      setSyncCode(code)
    } else {
      setSyncStatus('error')
    }
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(syncCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }).catch(() => {})
  }

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

            {/* Custom Habits */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>הרגלים אישיים ({userHabits.length})</p>

              {userHabits.length > 0 && (
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
                  {userHabits.map((h, i) => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < userHabits.length - 1 ? `1px solid ${T.divider}` : 'none', direction: 'rtl' }}>
                      <span style={{ fontSize: 18 }}>{h.emoji}</span>
                      <span style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.textSub }}>{h.title}</span>
                      <button onClick={() => onDeleteUserHabit?.(h.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,92,92,.3)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5C5C' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,92,92,.3)' }}>
                        <Trash2 style={{ width: 13, height: 13 }} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>הוסף הרגל</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input value={newHabitEmoji} onChange={e => setNewHabitEmoji(e.target.value)}
                    placeholder="😀" maxLength={2}
                    style={{ width: 48, textAlign: 'center', background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, padding: '8px', fontFamily: 'Inter, sans-serif', fontSize: 18, color: T.text, outline: 'none' }} />
                  <input value={newHabitTitle} onChange={e => setNewHabitTitle(e.target.value)}
                    placeholder="שם ההרגל" dir="rtl"
                    style={{ flex: 1, background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.text, outline: 'none' }} />
                </div>
                <input value={newHabitSub} onChange={e => setNewHabitSub(e.target.value)}
                  placeholder="תיאור קצר (אופציונלי)" dir="rtl"
                  style={{ width: '100%', background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.text, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                <button onClick={addCustomHabit} dir="rtl"
                  style={{ width: '100%', padding: '9px', background: habitAdded ? 'rgba(74,222,128,.1)' : 'rgba(191,90,242,.08)', border: `1px solid ${habitAdded ? 'rgba(74,222,128,.3)' : 'rgba(191,90,242,.25)'}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: habitAdded ? '#4ADE80' : '#BF5AF2', transition: 'all .2s' }}>
                  {habitAdded ? '✓ נוסף!' : '+ הוסף הרגל'}
                </button>
              </div>
            </div>

            {/* Partner Share */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>שותף אחריות</p>
              <button onClick={sharePartnerLink} dir="rtl"
                style={{ width: '100%', padding: '13px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .2s' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: partnerCopied ? '#4ADE80' : T.textSub }}>
                  {partnerCopied ? '✓ הקישור הועתק!' : 'שתף את הסטטיסטיקות שלך'}
                </span>
                <Share2 style={{ width: 14, height: 14, color: partnerCopied ? '#4ADE80' : T.textMuted, flexShrink: 0 }} strokeWidth={2} />
              </button>
            </div>

            {/* PRO / Upgrade */}
            {!isPro && onUpgrade && (
              <div style={{ marginBottom: 20 }}>
                <button onClick={onUpgrade} dir="rtl"
                  style={{
                    width: '100%', padding: '16px',
                    background: 'linear-gradient(135deg, rgba(255,214,10,.12) 0%, rgba(255,159,10,.08) 100%)',
                    border: '1px solid rgba(255,214,10,.35)', borderRadius: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>👑</span>
                  <div dir="rtl" style={{ flex: 1, textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 900, color: '#FFD60A', margin: 0 }}>שדרג ל-PRO</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,214,10,.6)', margin: '3px 0 0' }}>הרגלים ללא הגבלה · AI Coach · ₪39/חודש</p>
                  </div>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, color: '#FFD60A', letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0 }}>שדרג →</span>
                </button>
              </div>
            )}

            {/* Referral + WhatsApp Share */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>שתף והרוויח</p>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {referralCode && (
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.divider}`, direction: 'rtl' }}>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', margin: '0 0 6px' }}>קוד הפניה שלך</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 900, color: '#FFD60A', letterSpacing: '3px', margin: 0 }}>{referralCode}</p>
                      <button onClick={copyReferral}
                        style={{ background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: referralCopied ? '#4ADE80' : T.textMuted, textTransform: 'uppercase' }}>
                        {referralCopied ? '✓ הועתק' : 'העתק קישור'}
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={shareWhatsAppSummary} dir="rtl"
                  style={{ width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💬</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#4ADE80' }}>שתף סיכום יומי ב-WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: T.divider, marginBottom: 20 }} />

            {/* Theme toggle */}
            {onToggleTheme && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>מראה</p>
                <button onClick={onToggleTheme} dir="rtl"
                  style={{ width: '100%', padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color .2s' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: T.text }}>
                    {theme === 'dark' ? '🌙 מצב כהה' : '☀️ מצב בהיר'}
                  </span>
                  <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: T.textMuted, textTransform: 'uppercase' }}>
                    {theme === 'dark' ? 'עבור לבהיר' : 'עבור לכהה'}
                  </span>
                </button>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: T.divider, marginBottom: 20 }} />

            {/* Notifications */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>תזכורת יומית</p>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, direction: 'rtl' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {notifGranted || notifStatus === 'scheduled'
                      ? <Bell style={{ width: 14, height: 14, color: '#4ADE80' }} strokeWidth={2} />
                      : <BellOff style={{ width: 14, height: 14, color: T.textMuted }} strokeWidth={2} />}
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: T.text }}>
                      {notifGranted || notifStatus === 'scheduled' ? 'תזכורת פעילה' : 'הפעל תזכורת'}
                    </span>
                  </div>
                  <input type="time" value={notifTime}
                    onChange={e => { setNotifTimeState(e.target.value); setReminderTime(e.target.value) }}
                    style={{ background: T.tagBg, border: `1px solid ${T.border2}`, color: T.text, padding: '5px 10px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 700, outline: 'none', borderRadius: 9, colorScheme: T.isDark ? 'dark' : 'light' }} />
                </div>
                <button onClick={handleScheduleNotif}
                  style={{ width: '100%', padding: '9px', background: notifStatus === 'scheduled' ? 'rgba(74,222,128,.1)' : T.tagBg, border: `1px solid ${notifStatus === 'scheduled' ? 'rgba(74,222,128,.3)' : T.border2}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: notifStatus === 'scheduled' ? '#4ADE80' : T.textSub, transition: 'all .2s' }} dir="rtl">
                  {notifStatus === 'scheduled' ? '✓ נקבעה תזכורת' : notifStatus === 'denied' ? 'הרשאה נדחתה — הפעל בדפדפן' : notifStatus === 'unsupported' ? 'לא נתמך בדפדפן זה' : 'קבע תזכורת'}
                </button>
              </div>
            </div>

            {/* AI Coach URL */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Bot style={{ width: 13, height: 13, color: '#5B8CFF' }} strokeWidth={2} />
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>מאמן AI (Claude)</p>
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 14px' }}>
                <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 11, color: T.textMuted, lineHeight: 1.5, margin: '0 0 10px' }}>
                  הוסף Worker URL לקבלת תגובות AI אישיות אחרי כל סיכום יום. הוראות הגדרה: <span style={{ color: '#5B8CFF' }}>worker/claude-coach.js</span>
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={aiUrl}
                    onChange={e => setAiUrl(e.target.value)}
                    placeholder="https://your-worker.workers.dev"
                    dir="ltr"
                    style={{
                      flex: 1, background: T.tagBg, border: `1px solid ${T.border2}`,
                      borderRadius: 9, padding: '8px 10px',
                      fontFamily: 'Inter, sans-serif', fontSize: 12, color: T.text, outline: 'none',
                    }}
                  />
                  <button onClick={saveAiUrl} style={{
                    padding: '8px 14px', borderRadius: 9,
                    background: aiUrlSaved ? 'rgba(74,222,128,.1)' : 'rgba(91,140,255,.1)',
                    border: `1px solid ${aiUrlSaved ? 'rgba(74,222,128,.3)' : 'rgba(91,140,255,.2)'}`,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                    color: aiUrlSaved ? '#4ADE80' : '#5B8CFF', whiteSpace: 'nowrap',
                  }}>
                    {aiUrlSaved ? '✓ נשמר' : 'שמור'}
                  </button>
                </div>
              </div>
            </div>

            {/* JSON Export */}
            {appData && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>גיבוי מקומי</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `success-os-backup-${new Date().toISOString().slice(0, 10)}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    dir="rtl"
                    style={{ flex: 1, padding: '10px', background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: T.textSub, transition: 'all .15s' }}>
                    ↓ ייצא JSON
                  </button>
                  <label style={{ flex: 1, padding: '10px', background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: T.textSub, textAlign: 'center', transition: 'all .15s' }} dir="rtl">
                    ↑ ייבא JSON
                    <input type="file" accept=".json" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file || !onImportData) return
                      const reader = new FileReader()
                      reader.onload = ev => {
                        try { onImportData(JSON.parse(ev.target!.result as string)) } catch { /* ignore */ }
                      }
                      reader.readAsText(file)
                    }} />
                  </label>
                </div>
              </div>
            )}

            {/* Supabase Sync */}
            {SUPABASE_READY ? (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>סנכרון בין מכשירים</p>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 16px' }}>
                  {/* Sync code display */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, direction: 'rtl' }}>
                    <div>
                      <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>קוד הסנכרון שלך</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: '#5B8CFF', letterSpacing: '3px', margin: 0 }}>{syncCode}</p>
                    </div>
                    <button onClick={copyCode} style={{ background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {codeCopied ? <Check style={{ width: 13, height: 13, color: '#4ADE80' }} /> : <Copy style={{ width: 13, height: 13, color: T.textMuted }} />}
                    </button>
                  </div>
                  {/* Push */}
                  <button onClick={handlePush} disabled={syncStatus === 'pushing'}
                    style={{ width: '100%', padding: '9px', background: 'rgba(91,140,255,.1)', border: '1px solid rgba(91,140,255,.2)', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#5B8CFF', marginBottom: 8, transition: 'all .2s' }} dir="rtl">
                    {syncStatus === 'pushing' ? 'שומר לענן…' : syncStatus === 'ok' ? '✓ נשמר בענן' : syncStatus === 'error' ? 'שגיאה — נסה שוב' : '↑ שמור לענן'}
                  </button>
                  {/* Pull */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={importCode} onChange={e => setImportCode(e.target.value.toUpperCase())}
                      placeholder="קוד ממכשיר אחר" dir="rtl" maxLength={6}
                      style={{ flex: 1, background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', letterSpacing: '2px', textTransform: 'uppercase' }} />
                    <button onClick={handlePull} disabled={syncStatus === 'pulling'}
                      style={{ padding: '8px 14px', background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: T.textSub, whiteSpace: 'nowrap' }}>
                      {syncStatus === 'pulling' ? '…' : '↓ טען'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRight: '3px solid rgba(91,140,255,.3)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl' }}>
                <CloudOff style={{ width: 16, height: 16, color: T.textMuted, flexShrink: 0 }} strokeWidth={1.5} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: T.textSub, margin: 0 }}>סנכרון ענן לא מופעל</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: T.textMuted, margin: '3px 0 0', lineHeight: 1.5 }}>הוסף VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY ל-.env להפעלה</p>
                </div>
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
