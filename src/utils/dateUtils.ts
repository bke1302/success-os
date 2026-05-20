export function formatDate(iso: string, includeWeekday = false): string {
  const [y, m, d] = iso.split('-').map(Number)
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (includeWeekday) options.weekday = 'short'
  return new Date(y, m - 1, d).toLocaleDateString('he-IL', options)
}
