export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTodayIso(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

export function parseRelativeDate(label: string): string {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  if (label === 'Today') {
    return today.toISOString().slice(0, 10)
  }
  if (label === 'Yesterday') {
    today.setDate(today.getDate() - 1)
    return today.toISOString().slice(0, 10)
  }

  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  return lastMonth.toISOString().slice(0, 10)
}
