export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

export function speakHebrew(text: string, onEnd?: () => void): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang    = 'he-IL'
  u.rate    = 0.85
  u.pitch   = 1.0
  u.volume  = 1.0
  if (onEnd) u.onend = onEnd
  window.speechSynthesis.speak(u)
}

export function stopSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel()
}
