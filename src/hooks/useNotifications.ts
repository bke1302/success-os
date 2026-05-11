import { useState, useEffect } from 'react'
import { QUOTES } from '../constants'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )

  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ss_notifications_enabled')
    return saved ? JSON.parse(saved) : false
  })

  // Reminder time: "HH:MM", empty = disabled
  const [reminderTime, setReminderTimeState] = useState<string>(() => {
    return localStorage.getItem('ss_reminder_time') ?? ''
  })

  const setReminderTime = (t: string) => {
    setReminderTimeState(t)
    localStorage.setItem('ss_reminder_time', t)
  }

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('הדפדפן שלך אינו תומך בהתראות')
      return
    }
    if (!enabled) {
      let perm = permission
      if (perm !== 'granted') {
        perm = await Notification.requestPermission()
        setPermission(perm)
      }
      if (perm === 'granted') {
        setEnabled(true)
        localStorage.setItem('ss_notifications_enabled', JSON.stringify(true))
        new Notification('Success OS', { body: 'התראות מוטיבציה הופעלו!', icon: '/logo.svg' })
      } else {
        alert('עליך לאשר התראות בדפדפן')
      }
    } else {
      setEnabled(false)
      localStorage.setItem('ss_notifications_enabled', JSON.stringify(false))
    }
  }

  // Motivational quotes every 3 hours
  useEffect(() => {
    if (!enabled || permission !== 'granted') return
    const id = setInterval(() => {
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      new Notification('תזכורת לפעולה ⚡', { body: quote, icon: '/logo.svg' })
    }, 3 * 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [enabled, permission])

  // Smart reminder — checks every minute at the configured time
  useEffect(() => {
    if (!reminderTime || permission !== 'granted') return

    const check = () => {
      const now  = new Date()
      const hhmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      if (hhmm !== reminderTime) return

      const lastFired = localStorage.getItem('ss_reminder_fired')
      const today     = now.toDateString()
      if (lastFired === today) return
      localStorage.setItem('ss_reminder_fired', today)

      try {
        const checks = JSON.parse(localStorage.getItem('ss_checks') ?? '{}') as Record<string, boolean>
        const done   = Object.values(checks).filter(Boolean).length
        new Notification('⏰ צ\'ק-אין יומי', {
          body: done >= 5
            ? `כל הכבוד! סיימת את כל 5 המשימות היום 🏆`
            : `עשית ${done}/5 משימות. עוד ${5 - done} נשארו — תמשיך!`,
          icon: '/logo.svg',
        })
      } catch {
        new Notification('⏰ Success OS', { body: 'הגיע הזמן לבדוק את ההתקדמות שלך!', icon: '/logo.svg' })
      }
    }

    check()
    const id = setInterval(check, 60 * 1000)
    return () => clearInterval(id)
  }, [reminderTime, permission])

  return { permission, enabled, toggleNotifications, reminderTime, setReminderTime }
}
