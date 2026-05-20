import { useState, useEffect } from 'react'

const MILESTONE_DAYS = [7, 14, 21, 30, 60, 100]

export function useMilestone(streak: number) {
  const [showMilestone, setShowMilestone] = useState(false)

  useEffect(() => {
    const lastShown = Number(localStorage.getItem('last_milestone_shown') ?? 0)
    if (MILESTONE_DAYS.includes(streak) && streak > lastShown) {
      localStorage.setItem('last_milestone_shown', String(streak))
      setTimeout(() => setShowMilestone(true), 800)
    }
  }, [streak])

  return { showMilestone, dismissMilestone: () => setShowMilestone(false) }
}
