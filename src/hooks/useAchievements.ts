import { useState, useEffect, useRef } from 'react'
import type { DayLog } from '../types'
import { playAchievement } from '../utils/sounds'

export interface Achievement {
  id: string
  icon: string
  name: string
  desc: string
  earnedDate?: string
}

export const ACHIEVEMENT_DEFS: Omit<Achievement, 'earnedDate'>[] = [
  { id: 'first_check',   icon: '⚡', name: 'ניצוץ ראשון',      desc: 'ביצעת את המשימה הראשונה שלך' },
  { id: 'first_elite',   icon: '🏆', name: 'ELITE ראשון',      desc: 'קיבלת ציון 80%+ ביום אחד' },
  { id: 'mission_done',  icon: '🎯', name: 'מבצע מושלם',       desc: 'סיימת את המשימה הראשית לראשונה' },
  { id: 'streak_3',      icon: '🔥', name: '3 ימים ברצף',      desc: 'streak של 3 ימים עם ≥3 משימות' },
  { id: 'streak_7',      icon: '💎', name: 'שבוע אש',          desc: 'streak של 7 ימים ברצף' },
  { id: 'streak_30',     icon: '👑', name: 'חודש של אגדות',    desc: 'streak של 30 ימים ברצף' },
  { id: 'perfect_day',   icon: '💯', name: 'יום מושלם',        desc: 'כל 5 המשימות + המשימה הראשית' },
  { id: 'ten_elite',     icon: '🌟', name: '10 ימי ELITE',      desc: 'השלמת 10 ימים עם ציון 80%+' },
  { id: 'fifty_days',    icon: '🚀', name: '50 יום',            desc: '50 ימי שימוש באפליקציה' },
  { id: 'centurion',     icon: '🛡️', name: 'מאה ימים',         desc: '100 ימי שימוש באפליקציה' },
]

type EarnedMap = Record<string, string> // id → date

function check(
  earned: EarnedMap,
  history: DayLog[],
  streak: number,
  done: number,
  mainTaskDone: boolean,
  dayCount: number,
): string[] {
  const newlyEarned: string[] = []
  const today = new Date().toLocaleDateString('he-IL')

  const eliteDays = history.filter(d => d.score >= 80).length

  const earn = (id: string) => {
    if (!earned[id]) newlyEarned.push(id)
  }

  if (done >= 1)                              earn('first_check')
  if (history.some(d => d.score >= 80))       earn('first_elite')
  if (mainTaskDone)                            earn('mission_done')
  if (streak >= 3)                             earn('streak_3')
  if (streak >= 7)                             earn('streak_7')
  if (streak >= 30)                            earn('streak_30')
  if (done === 5 && mainTaskDone)              earn('perfect_day')
  if (eliteDays >= 10)                         earn('ten_elite')
  if (dayCount >= 50)                          earn('fifty_days')
  if (dayCount >= 100)                         earn('centurion')

  return newlyEarned.map(id => {
    earned[id] = today
    return id
  })
}

export function useAchievements(
  history: DayLog[],
  streak: number,
  done: number,
  mainTaskDone: boolean,
  dayCount: number,
) {
  const [earned, setEarned] = useState<EarnedMap>(() => {
    try { return JSON.parse(localStorage.getItem('ss_achievements') ?? '{}') }
    catch { return {} }
  })

  const [toast, setToast] = useState<Achievement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const earnedCopy = { ...earned }
    const newIds = check(earnedCopy, history, streak, done, mainTaskDone, dayCount)

    if (newIds.length === 0) return

    setEarned(earnedCopy)
    localStorage.setItem('ss_achievements', JSON.stringify(earnedCopy))

    // Show toasts one by one (first only)
    const def = ACHIEVEMENT_DEFS.find(d => d.id === newIds[0])
    if (def) {
      playAchievement()
      setToast({ ...def, earnedDate: earnedCopy[def.id] })
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setToast(null), 4000)
    }
  }, [done, mainTaskDone, streak, history.length, dayCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const allAchievements: Achievement[] = ACHIEVEMENT_DEFS.map(d => ({
    ...d,
    earnedDate: earned[d.id],
  }))

  return { toast, allAchievements, dismissToast: () => setToast(null) }
}
