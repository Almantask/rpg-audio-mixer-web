export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTodayIso(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

/** Calendar date (YYYY-MM-DD) in the local timezone for session date fields. */
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

  today.setMonth(today.getMonth() - 1)
  return today.toISOString().slice(0, 10)
}

/**
 * Past instants for relative lastPlayedAt labels. Uses offsets from now so a later
 * "Resume"/"play" stamp always sorts above "Today", including early local mornings
 * and positive UTC offsets where calendar-noon would still be in the future.
 */
export function parseRelativeDateTime(label: string): string {
  const now = Date.now()
  if (label === 'Today') {
    return new Date(now - 60 * 60 * 1000).toISOString()
  }
  if (label === 'Yesterday') {
    return new Date(now - 25 * 60 * 60 * 1000).toISOString()
  }
  return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
}
