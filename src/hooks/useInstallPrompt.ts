import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [installPrompt,    setInstallPrompt]    = useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const count = Number(localStorage.getItem('app_visit_count') ?? 0) + 1
    localStorage.setItem('app_visit_count', String(count))

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      if (count >= 3 && !localStorage.getItem('install_dismissed')) {
        setShowInstallBanner(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const triggerInstall = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(installPrompt as any)?.prompt?.()
    setShowInstallBanner(false)
  }

  const dismissInstall = () => {
    localStorage.setItem('install_dismissed', '1')
    setShowInstallBanner(false)
  }

  return { showInstallBanner, triggerInstall, dismissInstall }
}
