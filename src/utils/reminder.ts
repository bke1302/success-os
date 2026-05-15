const KEY = 'reminder_time'

export function getReminderTime(): string {
  return localStorage.getItem(KEY) ?? '07:00'
}

export function setReminderTime(time: string): void {
  localStorage.setItem(KEY, time)
}

export async function requestAndScheduleReminder(): Promise<'scheduled' | 'denied' | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') return 'denied'

  const [h, m] = getReminderTime().split(':').map(Number)
  const now    = new Date()
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  // If time already passed today, schedule for tomorrow
  if (target <= now) target.setDate(target.getDate() + 1)

  const delay = target.getTime() - now.getTime()
  setTimeout(() => {
    new Notification('SUCCESS OS', {
      body: 'הבוקר שלך מתחיל עכשיו. בוא נקבע את המצב שלך.',
      icon: '/success-os/logo.svg',
      lang: 'he',
      dir:  'rtl',
    })
  }, delay)

  return 'scheduled'
}
