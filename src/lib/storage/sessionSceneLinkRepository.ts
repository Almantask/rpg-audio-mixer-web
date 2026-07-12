import { db } from './db'
import type { Scene, SessionSceneLink } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export interface SessionSceneWithScene {
  link: SessionSceneLink
  scene: Scene
}

export async function listSessionScenes(sessionId: string): Promise<SessionSceneWithScene[]> {
  const links = await db.sessionSceneLinks.where('sessionId').equals(sessionId).toArray()
  const results: SessionSceneWithScene[] = []

  for (const link of links) {
    const scene = await db.scenes.get(link.sceneId)
    if (scene && !scene.deletedAt) {
      results.push({ link, scene })
    }
  }

  return results.sort((left, right) => {
    const leftPlayed = left.link.lastPlayedAt ?? 0
    const rightPlayed = right.link.lastPlayedAt ?? 0
    return rightPlayed - leftPlayed
  })
}

export function getLastActiveSceneId(items: SessionSceneWithScene[]): string | undefined {
  if (items.length === 0) return undefined
  const played = items.filter((item) => item.link.lastPlayedAt)
  if (played.length === 0) return undefined
  return played.sort(
    (left, right) => (right.link.lastPlayedAt ?? 0) - (left.link.lastPlayedAt ?? 0),
  )[0]?.scene.id
}

export async function linkScenesToSession(
  sessionId: string,
  sceneIds: string[],
): Promise<void> {
  const now = Date.now()
  const existing = await db.sessionSceneLinks.where('sessionId').equals(sessionId).toArray()
  const existingIds = new Set(existing.map((link) => link.sceneId))

  for (const sceneId of sceneIds) {
    if (existingIds.has(sceneId)) continue
    await db.sessionSceneLinks.add({
      id: createId(),
      sessionId,
      sceneId,
      createdAt: now,
    })
  }

  const count = await db.sessionSceneLinks.where('sessionId').equals(sessionId).count()
  await db.sessions.update(sessionId, { sceneCount: count })
}

export async function unlinkSceneFromSession(
  sessionId: string,
  sceneId: string,
): Promise<void> {
  const link = await db.sessionSceneLinks
    .where('sessionId')
    .equals(sessionId)
    .filter((item) => item.sceneId === sceneId)
    .first()
  if (!link) return
  await db.sessionSceneLinks.delete(link.id)
  const count = await db.sessionSceneLinks.where('sessionId').equals(sessionId).count()
  await db.sessions.update(sessionId, { sceneCount: count })
}

export async function listUnlinkedScenes(sessionId: string): Promise<Scene[]> {
  const links = await db.sessionSceneLinks.where('sessionId').equals(sessionId).toArray()
  const linkedIds = new Set(links.map((link) => link.sceneId))
  const scenes = await db.scenes.filter((scene) => !scene.deletedAt).toArray()
  return scenes.filter((scene) => !linkedIds.has(scene.id))
}

export async function touchSessionScenePlayed(
  sessionId: string,
  sceneId: string,
): Promise<void> {
  const link = await db.sessionSceneLinks
    .where('sessionId')
    .equals(sessionId)
    .filter((item) => item.sceneId === sceneId)
    .first()
  if (link) {
    await db.sessionSceneLinks.update(link.id, { lastPlayedAt: Date.now() })
  }
}
