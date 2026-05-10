import { useState, useEffect } from 'react'
import { QUOTES } from '../constants'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  )
  
  // Try to load user preference from local storage (default false)
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('ss_notifications_enabled')
    return saved ? JSON.parse(saved) : false
  })

  // Ask for permission and enable
  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('הדפדפן שלך אינו תומך בהתראות (Notifications)')
      return
    }

    if (!enabled) {
      // Trying to enable
      let currentPerm = permission
      if (currentPerm !== 'granted') {
        currentPerm = await Notification.requestPermission()
        setPermission(currentPerm)
      }
      
      if (currentPerm === 'granted') {
        setEnabled(true)
        localStorage.setItem('ss_notifications_enabled', JSON.stringify(true))
        // Send a welcome notification
        new Notification('Success OS', {
          body: 'התראות מוטיבציה הופעלו בהצלחה!',
          icon: '/logo.svg'
        })
      } else {
        alert('עליך לאשר התראות בדפדפן כדי להשתמש בתכונה זו')
      }
    } else {
      // Trying to disable
      setEnabled(false)
      localStorage.setItem('ss_notifications_enabled', JSON.stringify(false))
    }
  }

  // Effect to handle the interval when enabled
  useEffect(() => {
    if (!enabled || permission !== 'granted') return

    // Every 3 hours
    const INTERVAL_MS = 3 * 60 * 60 * 1000 
    
    const id = setInterval(() => {
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      new Notification('תזכורת לפעולה ⚡', {
        body: quote,
        icon: '/logo.svg'
      })
    }, INTERVAL_MS)

    return () => clearInterval(id)
  }, [enabled, permission])

  return {
    permission,
    enabled,
    toggleNotifications
  }
}
