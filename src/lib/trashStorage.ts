export const TRASH_RETENTION_DAYS = 7

const MS_PER_DAY = 86_400_000

export function resolveRestoredName(name: string, existingNames: string[]): string {
  const normalized = name.trim().toLowerCase()
  const hasCollision = existingNames.some((existing) => existing.trim().toLowerCase() === normalized)
  return hasCollision ? `${name} (restored)` : name
}

export function daysSinceDeleted(deletedAt: string, now = Date.now()): number {
  const deletedMs = new Date(deletedAt).getTime()
  return Math.floor((now - deletedMs) / MS_PER_DAY)
}

export function daysRemaining(deletedAt: string, now = Date.now()): number {
  return Math.max(0, TRASH_RETENTION_DAYS - daysSinceDeleted(deletedAt, now))
}

export function sortByDaysRemaining<T extends { deletedAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aRemaining = a.deletedAt ? daysRemaining(a.deletedAt) : TRASH_RETENTION_DAYS
    const bRemaining = b.deletedAt ? daysRemaining(b.deletedAt) : TRASH_RETENTION_DAYS
    return aRemaining - bRemaining
  })
}
