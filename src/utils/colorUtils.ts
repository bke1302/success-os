export function scoreColor(score: number): string {
  if (score >= 9) return '#FFD60A'
  if (score >= 7) return '#30D158'
  if (score >= 5) return '#FF9F0A'
  return '#FF375F'
}

export function scoreLabel(score: number): string {
  if (score >= 9) return 'PEAK'
  if (score >= 7) return 'SOLID'
  if (score >= 5) return 'GRIND'
  return 'START'
}
