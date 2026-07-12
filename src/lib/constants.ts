export const TRASH_RETENTION_DAYS = 7
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000

export const SUPPORT_COFFEE_URL = 'https://buymeacoffee.com/arcanumaudio'
export const SUPPORT_REVIEW_URL = 'https://example.com/review/arcanum-audio'

export const APP_VERSION = '0.1.0'

export function daysRemaining(deletedAt: number, now = Date.now()): number {
  const expiresAt = deletedAt + TRASH_RETENTION_MS
  return Math.max(0, Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000)))
}

export function daysSinceDeleted(deletedAt: number, now = Date.now()): number {
  return Math.max(0, Math.floor((now - deletedAt) / (24 * 60 * 60 * 1000)))
}

export function formatSessionSubtitle(session: {
  number: number
  name: string
  description?: string
}): string {
  const label = `Session ${session.number}: ${session.name}`
  return session.description ? `${label} ${session.description}` : label
}

export function uniqueRestoredName(name: string): string {
  return `${name} (restored)`
}
