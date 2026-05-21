import type { AppState } from '../types'

const TRIAL_DAYS = 14

export function usePro(state: AppState) {
  const isPro = !!state.isPro

  const trialDaysLeft = (() => {
    if (isPro) return null
    if (!state.trialStarted) return TRIAL_DAYS
    const elapsed = Math.floor((Date.now() - new Date(state.trialStarted).getTime()) / 86_400_000)
    return Math.max(0, TRIAL_DAYS - elapsed)
  })()

  const isTrialExpired = !isPro && trialDaysLeft === 0

  return { isPro, trialDaysLeft, isTrialExpired }
}
