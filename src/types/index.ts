export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface DayLog {
  date: string
  score: number
  journal: string
  mainTask: string
  mainTaskDone?: boolean
  checks: Record<string, boolean>
  aiResponse?: string
}

export interface AppState {
  checks: Record<string, boolean>
  journal: string
  mainTask: string
  apiKey: string
  streak: number
  dayCount: number
  history: DayLog[]
}

export type TabId = 'today' | 'history' | 'settings'
