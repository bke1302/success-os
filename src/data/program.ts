// ─── 4-Week Rotating Program ──────────────────────────────────────────────────
// Each week has a theme and 3 mandatory habit IDs.
// The cycle repeats every 4 weeks (28 days), escalating with each cycle.

export interface WeekTheme {
  title:    string
  desc:     string
  color:    string
  habitIds: string[]   // must match HABITS[].id in constants.ts
}

export const WEEK_THEMES: WeekTheme[] = [
  {
    title:    'שבוע ייצור 🎯',
    desc:     'תעשה. תיצור. תמכור. ייצור הוא מה שמפריד בין חולמים למצליחנים',
    color:    '#f5c435',
    habitIds: ['deepwork', 'content', 'revenue'],
  },
  {
    title:    'שבוע למידה 📚',
    desc:     'כל מה שאתה לומד היום הופך ליתרון תחרותי מחר — אל תפסיק לגדול',
    color:    '#3b82f6',
    habitIds: ['read', 'learn', 'goals'],
  },
  {
    title:    'שבוע משמעת ⚡',
    desc:     'המשמעת היא הגשר בין מטרות להישגים — אין קיצורי דרך, אין תירוצים',
    color:    '#ef4444',
    habitIds: ['workout', 'early', 'noscroll'],
  },
  {
    title:    'שבוע קשרים 🤝',
    desc:     'הרשת שלך היא הנכס שלך — אנשים שמגיעים רחוק בונים קשרים כל יום',
    color:    '#22c55e',
    habitIds: ['outreach', 'give', 'plan'],
  },
]

/** Returns the current week theme (1-indexed week, 4-week cycle). */
export function getCurrentWeekTheme(dayCount: number): WeekTheme {
  const weekIdx = Math.floor((Math.max(dayCount - 1, 0)) / 7) % 4
  return WEEK_THEMES[weekIdx]
}

/** Returns the 3 required habit IDs for today's program day. */
export function getTodayRequiredHabitIds(dayCount: number): string[] {
  return getCurrentWeekTheme(dayCount).habitIds
}

/** Returns the program week number (1-4) for display. */
export function getProgramWeekNumber(dayCount: number): number {
  return (Math.floor((Math.max(dayCount - 1, 0)) / 7) % 4) + 1
}
