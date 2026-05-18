export interface MorningEntry {
  gratitudes:  [string, string, string]
  vision:      [string, string, string]
  identity:    string
  purpose:     string
  commitment:  string
  oneThing?:   string   // The ONE most important action
  incantation: string
  energyLevel: number
  completedAt: string
}

export interface EveningEntry {
  given:          string
  win:            string
  lesson:         string
  commitmentDone: boolean
  score:          number
  completedAt:    string
}

export interface DayEntry {
  date:           string        // YYYY-MM-DD
  morning?:       MorningEntry
  evening?:       EveningEntry
  habits?:        string[]
  energyCheckins?: EnergyCheckin[]  // midday + afternoon check-ins
}

export interface BurnTheBoats {
  commitment:  string
  consequence: string
  deadline:    string   // YYYY-MM-DD
  createdAt:   string
}

export interface FearEntry {
  id:       string
  fear:     string
  reframe:  string
  date:     string   // YYYY-MM-DD
}

export interface EnergyCheckin {
  score: number
  label: 'morning' | 'midday' | 'afternoon'
  time:  string   // ISO
}

export interface WeeklyPlan {
  weekStart: string            // YYYY-MM-DD (Monday)
  wins:      [string, string, string]
  goals:     [string, string, string]
  createdAt: string
}

export interface UserGoal {
  id:        string
  title:     string
  category:  'עסקי' | 'בריאות' | 'קשרים' | 'אישי' | 'כספי'
  deadline?: string   // YYYY-MM-DD
  createdAt: string
}

export interface Task {
  id:           string
  title:        string
  priority:     'high' | 'normal'
  dueDate?:     string        // YYYY-MM-DD
  recurring?:   'daily' | 'weekly'
  completedAt?: string        // ISO — present means done
  createdAt:    string
}

export interface AppState {
  entries:        DayEntry[]
  streak:         number
  totalDays:      number
  currentView:    'home' | 'prime' | 'actions' | 'inspire' | 'tasks' | 'wins' | 'fear' | 'weekly' | 'profile' | 'focus'
  burnTheBoats?:  BurnTheBoats
  fearEntries?:   FearEntry[]
  weeklyPlans?:   WeeklyPlan[]
  incantationB64?: string
  userName?:      string
  userGoals?:     UserGoal[]
  tasks?:         Task[]
}

export type DayPhase = 'morning' | 'day' | 'evening'
