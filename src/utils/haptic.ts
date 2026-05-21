// Haptic feedback via Vibration API (Android + some PWA)
// Silent no-op on iOS/unsupported browsers

type HapticType = 'tap' | 'check' | 'uncheck' | 'success' | 'error' | 'milestone'

const PATTERNS: Record<HapticType, number | number[]> = {
  tap:       6,
  check:     12,
  uncheck:   6,
  success:   [10, 60, 14],
  error:     [22, 12, 22],
  milestone: [14, 50, 14, 50, 24],
}

export function haptic(type: HapticType = 'tap') {
  if (!('vibrate' in navigator)) return
  navigator.vibrate(PATTERNS[type])
}
