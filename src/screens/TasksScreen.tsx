import { useState, useRef } from 'react'
import { Check, Trash2, ArrowUp, RotateCcw, ChevronDown } from 'lucide-react'
import type { Task } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { playCheck, playComplete } from '../utils/sounds'

interface Props {
  tasks:    Task[]
  onSave:   (task: Task) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

type Filter = 'all' | 'today' | 'done'

function todayStr() { return new Date().toISOString().slice(0, 10) }

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
}

function TaskRow({ task, onToggle, onDelete, isLast }: {
  task: Task; onToggle: () => void; onDelete: () => void; isLast: boolean
}) {
  const T = useTheme()
  const done   = !!task.completedAt
  const isHigh = task.priority === 'high'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${T.divider}`,
      borderRight: isHigh && !done ? '3px solid #5B8CFF' : '3px solid transparent',
      opacity: done ? 0.45 : 1,
      transition: 'opacity .2s',
      direction: 'rtl',
    }}>
      <button onClick={() => { onToggle(); if (!done) playCheck(); else playComplete() }}
        style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: done ? 'none' : `2px solid ${isHigh ? '#5B8CFF' : T.border2}`,
          background: done ? '#4ADE80' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: done ? '0 0 8px rgba(74,222,128,.3)' : 'none',
          transition: 'all .2s',
        }}>
        {done && <Check style={{ width: 12, height: 12, color: '#0E0F13' }} strokeWidth={3} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14, fontWeight: done ? 400 : 600,
          color: done ? T.textMuted : T.text,
          textDecoration: done ? 'line-through' : 'none',
          margin: 0, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{task.title}</p>
        {(task.dueDate || task.recurring) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            {task.dueDate && (
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '.5px', color: task.dueDate === todayStr() ? '#FBBF24' : T.textDim }}>
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.recurring && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: '.5px' }}>
                <RotateCcw style={{ width: 9, height: 9 }} strokeWidth={2.5} />
                {task.recurring === 'daily' ? 'יומי' : 'שבועי'}
              </span>
            )}
          </div>
        )}
      </div>

      <button onClick={onDelete}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, color: 'rgba(255,92,92,.2)', transition: 'color .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5C5C' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,92,92,.2)' }}
      >
        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function TasksScreen({ tasks, onSave, onDelete, onToggle }: Props) {
  const T = useTheme()
  const [filter,      setFilter]      = useState<Filter>('all')
  const [draft,       setDraft]       = useState('')
  const [highPrio,    setHighPrio]    = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [dueDate,     setDueDate]     = useState('')
  const [recurring,   setRecurring]   = useState<Task['recurring']>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const today = todayStr()

  const visible = tasks.filter(t => {
    if (filter === 'done')  return !!t.completedAt
    if (filter === 'today') return !t.completedAt && (!t.dueDate || t.dueDate <= today)
    return true
  })

  const sorted = [...visible].sort((a, b) => {
    const aDone = !!a.completedAt, bDone = !!b.completedAt
    if (aDone !== bDone) return aDone ? 1 : -1
    if (!aDone && a.priority !== b.priority) return a.priority === 'high' ? -1 : 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const incomplete = sorted.filter(t => !t.completedAt)
  const completed  = sorted.filter(t => !!t.completedAt)

  const addTask = () => {
    const title = draft.trim()
    if (!title) return
    playCheck()
    onSave({
      id: `task_${Date.now()}`,
      title,
      priority: highPrio ? 'high' : 'normal',
      createdAt: new Date().toISOString(),
      ...(dueDate ? { dueDate } : {}),
      ...(recurring ? { recurring } : {}),
    })
    setDraft('')
    setHighPrio(false)
    setDueDate('')
    setRecurring(undefined)
    setShowOptions(false)
    inputRef.current?.focus()
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',   label: 'הכל'    },
    { id: 'today', label: 'היום'   },
    { id: 'done',  label: 'הושלמו' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── Quick add ── */}
      <div style={{ flexShrink: 0, background: T.bg }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 16px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 10px 10px 14px',
          background: T.card,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
        }}>
          <button onClick={() => setHighPrio(h => !h)} style={{
            width: 28, height: 28, borderRadius: 9, flexShrink: 0,
            border: `1px solid ${highPrio ? '#5B8CFF' : T.border2}`,
            background: highPrio ? 'rgba(91,140,255,.15)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .15s',
          }}>
            <ArrowUp style={{ width: 13, height: 13, color: highPrio ? '#5B8CFF' : T.textDim }} strokeWidth={2.5} />
          </button>
          <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="הוסף משימה…" dir="rtl"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: T.text }} />
          <button onClick={addTask} disabled={!draft.trim()} style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0, border: 'none',
            background: draft.trim() ? '#5B8CFF' : T.tagBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: draft.trim() ? 'pointer' : 'default', transition: 'all .2s',
            boxShadow: draft.trim() ? '0 2px 12px rgba(91,140,255,.4)' : 'none',
          }}>
            <ArrowUp style={{ width: 14, height: 14, color: draft.trim() ? '#fff' : T.textDim }} strokeWidth={2.5} />
          </button>
          <button onClick={() => setShowOptions(v => !v)} style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0, border: `1px solid ${T.border2}`,
            background: showOptions ? T.tagBg : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .2s',
          }}>
            <ChevronDown style={{ width: 13, height: 13, color: T.textDim, transform: showOptions ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} strokeWidth={2} />
          </button>
        </div>

        {showOptions && (
          <div style={{ marginTop: 8, padding: '10px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} className="animate-slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: T.textMuted, textTransform: 'uppercase' }}>תאריך</span>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{ background: T.tagBg, border: `1px solid ${T.border2}`, borderRadius: 8, padding: '4px 8px', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, color: T.text, outline: 'none', colorScheme: T.isDark ? 'dark' : 'light' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: T.textMuted, textTransform: 'uppercase' }}>חזרה</span>
              {([undefined, 'daily', 'weekly'] as const).map(r => (
                <button key={String(r)} onClick={() => setRecurring(r)} style={{
                  padding: '3px 10px', borderRadius: 999,
                  border: `1px solid ${recurring === r ? T.accent : T.border2}`,
                  background: recurring === r ? `${T.accent}1F` : 'transparent',
                  color: recurring === r ? T.accent : T.textDim,
                  fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', transition: 'all .15s',
                }}>
                  {r === undefined ? 'אף' : r === 'daily' ? 'יומי' : 'שבועי'}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* ── Scrollable: hero + filter chips + task list (כמו HomeScreen) ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 80px' }}>

          {/* Hero */}
          <div style={{ padding: '16px 16px 14px' }}>
            <div className="today-hero" style={{
              background: T.isDark
                ? 'linear-gradient(135deg, rgba(91,140,255,.85) 0%, rgba(139,92,246,.6) 55%, rgba(16,185,129,.2) 100%), linear-gradient(180deg, #111318 0%, #1a1c24 100%)'
                : 'linear-gradient(135deg, rgba(59,111,239,.9) 0%, rgba(124,58,237,.7) 55%, rgba(16,185,129,.2) 100%), linear-gradient(180deg, #dde5ff 0%, #ede9fe 100%)',
              border: '1px solid rgba(91,140,255,.22)',
              boxShadow: '0 8px 32px rgba(91,140,255,.12)',
            }}>
              <div style={{ position: 'absolute', right: 14, top: -4, fontSize: '7rem', opacity: .04, lineHeight: 1, color: '#fff', pointerEvents: 'none', userSelect: 'none' }}>✓</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div dir="rtl">
                  <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>TASKS</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.6)', margin: 0 }}>ניהול משימות יומי</p>
                </div>
                {incomplete.length > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.4rem', fontWeight: 900, color: '#FBBF24', lineHeight: 1, letterSpacing: '-1.5px', margin: 0, textShadow: '0 0 24px rgba(251,191,36,.4)' }}>{incomplete.length}</p>
                    <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: 'rgba(251,191,36,.6)', textTransform: 'uppercase', margin: '3px 0 0' }}>נותרו</p>
                  </div>
                )}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-2px', margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 12px rgba(0,0,0,.3)' }} dir="rtl">משימות</p>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 7, direction: 'rtl' }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '5px 16px', borderRadius: 999,
                border: `1px solid ${filter === f.id ? T.accent : T.border2}`,
                background: filter === f.id ? `${T.accent}1F` : 'transparent',
                color: filter === f.id ? T.accent : T.textMuted,
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
                cursor: 'pointer', transition: 'all .15s',
              }}>{f.label}</button>
            ))}
          </div>

          {/* Task list */}
          <div style={{ padding: '0 16px' }}>

        {sorted.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '52px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(91,140,255,.1)', border: '1px solid rgba(91,140,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Check style={{ width: 24, height: 24, color: 'rgba(91,140,255,.6)' }} strokeWidth={2} />
            </div>
            <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800, color: T.textSub, marginBottom: 6, letterSpacing: '-.3px' }}>
              {filter === 'done' ? 'אין משימות שהושלמו' : 'הכל נקי'}
            </p>
            <p dir="rtl" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
              {filter === 'done' ? 'סמן משימות כהושלמו.' : 'הוסף משימה למעלה.'}
            </p>
          </div>
        )}

        {incomplete.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8, paddingRight: 4, direction: 'rtl' }}>— פעיל</p>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
              {incomplete.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === incomplete.length - 1}
                  onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
              ))}
            </div>
          </>
        )}

        {completed.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textMuted, textTransform: 'uppercase', marginBottom: 8, paddingRight: 4, direction: 'rtl' }}>— הושלמו</p>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', opacity: 0.6 }}>
              {completed.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === completed.length - 1}
                  onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
              ))}
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
