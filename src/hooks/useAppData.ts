import { useState } from 'react'
import type { AppState, DayEntry, MorningEntry, EveningEntry } from '../types'

const KEY = 'prime_v1'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function initialState(): AppState {
  return { entries: [], streak: 0, totalDays: 0, currentView: 'prime' }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    return JSON.parse(raw) as AppState
  } catch {
    return initialState()
  }
}

function upsertToday(entries: DayEntry[], patch: Partial<Omit<DayEntry, 'date'>>): DayEntry[] {
  const key = todayKey()
  const idx = entries.findIndex(e => e.date === key)
  if (idx === -1) return [...entries, { date: key, ...patch }]
  const updated = [...entries]
  updated[idx] = { ...updated[idx], ...patch }
  return updated
}

function computeStreak(entries: DayEntry[]): number {
  const sorted = [...entries]
    .filter(e => e.evening && e.evening.score >= 6)
    .map(e => e.date)
    .sort()
    .reverse()

  if (sorted.length === 0) return 0

  let streak = 0
  let expected = todayKey()

  for (const date of sorted) {
    if (date === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else {
      break
    }
  }
  return streak
}

export function getDayPhase(): 'morning' | 'day' | 'evening' {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'day'
  return 'evening'
}

export function useAppData() {
  const [state, setStateRaw] = useState<AppState>(loadState)

  const persist = (next: AppState) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    setStateRaw(next)
  }

  const today = state.entries.find(e => e.date === todayKey())

  const saveMorning = (data: MorningEntry) => {
    const entries = upsertToday(state.entries, { morning: data })
    persist({ ...state, entries })
  }

  const saveEvening = (data: EveningEntry) => {
    const entries  = upsertToday(state.entries, { evening: data })
    const streak   = computeStreak(entries)
    const totalDays = entries.filter(e => e.evening).length
    persist({ ...state, entries, streak, totalDays })
  }

  const saveHabits = (habitIds: string[]) => {
    const entries = upsertToday(state.entries, { habits: habitIds })
    persist({ ...state, entries })
  }

  const setView = (v: 'prime' | 'wins' | 'fire' | 'actions' | 'inspire') =>
    persist({ ...state, currentView: v as AppState['currentView'] })

  const clearAll = () => {
    localStorage.removeItem(KEY)
    persist(initialState())
  }

  return { state, today, saveMorning, saveEvening, saveHabits, setView, clearAll }
}
