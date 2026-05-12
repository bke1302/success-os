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
    title:    'שבוע גוף 💪',
    desc:     'הנכס הכי חשוב שלך — גוף חזק, אנרגיה אמיתית, לא מקום לתירוצים',
    color:    '#22c55e',
    habitIds: ['workout', 'water', 'healthy'],
  },
  {
    title:    'שבוע מוח 🧠',
    desc:     'מה שאתה לומד היום — מי שאתה מחר. ידע הוא הנשק האמיתי',
    color:    '#3b82f6',
    habitIds: ['read', 'learn', 'journal'],
  },
  {
    title:    'שבוע ייצור 🎯',
    desc:     'עמוק, ממוקד, בלי הסחות דעת — כאן קורה ההתקדמות האמיתית',
    color:    '#f5c435',
    habitIds: ['goal', 'noscroll', 'early'],
  },
  {
    title:    'שבוע רוח ⚡',
    desc:     'חידוש אנרגיה, נוכחות מלאה, ועשיית טוב — הכוח הפנימי שלך',
    color:    '#8b5cf6',
    habitIds: ['meditate', 'walk', 'kind'],
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
