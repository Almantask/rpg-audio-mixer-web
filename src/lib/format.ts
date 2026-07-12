export function formatSessionCount(count: number): string {
  if (count === 1) return '1 session'
  return `${count} sessions`
}

export function formatSceneCount(count: number): string {
  if (count === 1) return '1 Scene'
  return `${count} Scenes`
}

export function formatSessionLabel(number: number): string {
  return `Session ${number}`
}

export function formatSessionDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function formatSessionMetadata(date: string, sceneCount: number): string {
  return `${formatSessionDate(date)} · ${formatSceneCount(sceneCount)}`
}

export function formatSessionTitle(number: number, name: string): string {
  return `Session ${number} – ${name}`
}

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
