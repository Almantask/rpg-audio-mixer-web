import { db } from './db'

export type PlayStatEntityType = 'soundscape' | 'fx'

export interface PlayStat {
  id: string
  entityType: PlayStatEntityType
  entityId: string
  playCount: number
}

function statId(entityType: PlayStatEntityType, entityId: string): string {
  return `${entityType}:${entityId}`
}

export async function incrementPlayStat(
  entityType: PlayStatEntityType,
  entityId: string,
): Promise<number> {
  const id = statId(entityType, entityId)
  const existing = await db.playStats.get(id)
  const playCount = (existing?.playCount ?? 0) + 1
  await db.playStats.put({ id, entityType, entityId, playCount })
  return playCount
}

export async function getPlayCount(
  entityType: PlayStatEntityType,
  entityId: string,
): Promise<number> {
  const stat = await db.playStats.get(statId(entityType, entityId))
  return stat?.playCount ?? 0
}

export async function getTopSoundscapeStat(): Promise<{ entityId: string; playCount: number } | null> {
  const stats = await db.playStats.where('entityType').equals('soundscape').toArray()
  if (stats.length === 0) return null
  const top = stats.sort((left, right) => right.playCount - left.playCount)[0]
  return top ? { entityId: top.entityId, playCount: top.playCount } : null
}

export async function getTopFxStat(): Promise<{ entityId: string; playCount: number } | null> {
  const stats = await db.playStats.where('entityType').equals('fx').toArray()
  if (stats.length === 0) return null
  const top = stats.sort((left, right) => right.playCount - left.playCount)[0]
  return top ? { entityId: top.entityId, playCount: top.playCount } : null
}

export async function setPlayCount(
  entityType: PlayStatEntityType,
  entityId: string,
  playCount: number,
): Promise<void> {
  const id = statId(entityType, entityId)
  await db.playStats.put({ id, entityType, entityId, playCount })
}
