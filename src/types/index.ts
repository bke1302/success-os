export interface MorningEntry {
  gratitudes: [string, string, string]
  incantation: string
  commitment: string
  energyLevel: number  // 1-10
  completedAt: string  // ISO
}

export interface EveningEntry {
  win: string
  lesson: string
  commitmentDone: boolean
  score: number        // 1-10
  completedAt: string  // ISO
}

export interface DayEntry {
  date: string         // YYYY-MM-DD
  morning?: MorningEntry
  evening?: EveningEntry
}

export interface AppState {
  entries: DayEntry[]
  streak: number
  totalDays: number
  currentView: 'prime' | 'wins'
}

export type DayPhase = 'morning' | 'day' | 'evening'
