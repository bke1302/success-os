import { useState, useRef } from 'react'
import { Check, Trash2, ArrowUp, RotateCcw } from 'lucide-react'
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
      borderRight: isHigh && !done ? `3px solid ${T.accent}` : '3px solid transparent',
      opacity: done ? 0.45 : 1,
      transition: 'opacity .2s',
      direction: 'rtl',
    }}>

      {/* Checkbox */}
      <button
        onClick={() => { onToggle(); if (!done) playCheck(); else playComplete() }}
        style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: done ? 'none' : `2px solid ${isHigh ? T.accent : T.border2}`,
          background: done ? '#4ADE80' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: done ? '0 0 8px rgba(74,222,128,.3)' : 'none',
          transition: 'all .2s',
        }}>
        {done && <Check style={{ width: 12, height: 12, color: '#0E0F13' }} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Heebo, sans-serif',
          fontSize: 14, fontWeight: done ? 400 : 600,
          color: done ? T.textMuted : T.text,
          textDecoration: done ? 'line-through' : 'none',
          margin: 0, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{task.title}</p>

        {(task.dueDate || task.recurring) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            {task.dueDate && (
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10, fontWeight: 700, letterSpacing: '.5px',
                color: task.dueDate === todayStr() ? '#FBBF24' : T.textDim,
              }}>
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.recurring && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: '.5px',
              }}>
                <RotateCcw style={{ width: 9, height: 9 }} strokeWidth={2.5} />
                {task.recurring === 'daily' ? 'יומי' : 'שבועי'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, flexShrink: 0, color: 'rgba(255,92,92,.25)',
          transition: 'color .15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FF5C5C' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,92,92,.25)' }}
      >
        <Trash2 style={{ width: 14, height: 14 }} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function TasksScreen({ tasks, onSave, onDelete, onToggle }: Props) {
  const T = useTheme()
  const [filter,   setFilter]   = useState<Filter>('all')
  const [draft,    setDraft]    = useState('')
  const [highPrio, setHighPrio] = useState(false)
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
    onSave({ id: `task_${Date.now()}`, title, priority: highPrio ? 'high' : 'normal', createdAt: new Date().toISOString() })
    setDraft('')
    setHighPrio(false)
    inputRef.current?.focus()
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',   label: 'הכל'    },
    { id: 'today', label: 'היום'   },
    { id: 'done',  label: 'הושלמו' },
  ]

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg, transition: 'background .3s' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: '22px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-.5px' }} dir="rtl">משימות</h1>
          {incomplete.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 22, fontWeight: 900, color: T.accent, lineHeight: 1 }}>{incomplete.length}</span>
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase' }}>נותרו</span>
            </div>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 7, direction: 'rtl' }}>
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
      </div>

      {/* ── Quick add ── */}
      <div style={{ flexShrink: 0, padding: '10px 16px', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', gap: 8, background: T.bgRaised, transition: 'background .3s' }}>
        <button onClick={() => setHighPrio(h => !h)} title="עדיפות גבוהה" style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          border: `1px solid ${highPrio ? T.accent : T.border2}`,
          background: highPrio ? `${T.accent}24` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .15s',
        }}>
          <ArrowUp style={{ width: 14, height: 14, color: highPrio ? T.accent : T.textDim }} strokeWidth={2.5} />
        </button>

        <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="הוסף משימה…" dir="rtl"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Heebo, sans-serif', fontSize: 14, fontWeight: 500, color: T.text }} />

        <button onClick={addTask} disabled={!draft.trim()} style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0, border: 'none',
          background: draft.trim() ? T.accent : T.tagBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: draft.trim() ? 'pointer' : 'default', transition: 'all .15s',
          boxShadow: draft.trim() ? `0 2px 12px ${T.accent}4D` : 'none',
        }}>
          <ArrowUp style={{ width: 14, height: 14, color: draft.trim() ? '#fff' : T.textDim }} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 68px' }}>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '52px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${T.accent}14`, border: `1px solid ${T.accent}29`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Check style={{ width: 24, height: 24, color: `${T.accent}80` }} strokeWidth={2} />
            </div>
            <p dir="rtl" style={{ fontFamily: '"Frank Ruhl Libre", Georgia, serif', fontSize: 17, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>
              {filter === 'done' ? 'אין משימות שהושלמו' : 'הכל נקי'}
            </p>
            <p dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', fontSize: 13, color: T.textDim, lineHeight: 1.6 }}>
              {filter === 'done' ? 'סמן משימות כהושלמו.' : 'הוסף משימה למעלה.'}
            </p>
          </div>
        )}

        {/* Incomplete tasks */}
        {incomplete.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: 8, paddingRight: 4, direction: 'rtl' }}>— פעיל</p>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
              {incomplete.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === incomplete.length - 1}
                  onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
              ))}
            </div>
          </>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <>
            <p style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: 8, paddingRight: 4, direction: 'rtl' }}>— הושלמו</p>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', opacity: 0.65 }}>
              {completed.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === completed.length - 1}
                  onToggle={() => onToggle(task.id)} onDelete={() => onDelete(task.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
