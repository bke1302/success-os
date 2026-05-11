export interface MorningEntry {
  gratitudes:  [string, string, string]
  vision:      [string, string, string]  // 3 goals visualized as DONE
  identity:    string                    // "Today I AM ___"
  purpose:     string                    // WHY this matters deep down
  commitment:  string                    // the ONE massive action
  incantation: string
  energyLevel: number                    // 1-10
  completedAt: string
}

export interface EveningEntry {
  given:          string   // What did I GIVE today?
  win:            string   // kept for display compat
  lesson:         string
  commitmentDone: boolean
  score:          number   // 1-10
  completedAt:    string
}

export interface DayEntry {
  date:     string        // YYYY-MM-DD
  morning?: MorningEntry
  evening?: EveningEntry
}

export interface AppState {
  entries:     DayEntry[]
  streak:      number
  totalDays:   number
  currentView: 'prime' | 'wins'
}

export type DayPhase = 'morning' | 'day' | 'evening'
