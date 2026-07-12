import { db } from './db'
import { getE2EState } from './e2eState'
import type { CreateSceneInput, Scene, UpdateSceneInput } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export async function listActiveScenes(): Promise<Scene[]> {
  const { scenesLoadFail } = getE2EState()
  if (scenesLoadFail) {
    throw new Error('Failed to load scenes')
  }

  const scenes = await db.scenes.filter((scene) => !scene.deletedAt).toArray()
  return scenes.sort((left, right) => right.createdAt - left.createdAt)
}

export async function getScene(id: string): Promise<Scene | undefined> {
  const scene = await db.scenes.get(id)
  if (!scene || scene.deletedAt) return undefined
  return scene
}

export async function createScene(input: CreateSceneInput): Promise<Scene> {
  const now = Date.now()
  const scene: Scene = {
    id: createId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    coverArtUrl: input.coverArtUrl,
    tags: [],
    soundscapeCategoryCount: 0,
    effectCount: 0,
    createdAt: now,
  }
  await db.scenes.add(scene)
  return scene
}

export async function updateScene(id: string, input: UpdateSceneInput): Promise<Scene> {
  const existing = await db.scenes.get(id)
  if (!existing || existing.deletedAt) {
    throw new Error('Scene not found')
  }

  const updated: Scene = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    description:
      input.description !== undefined ? input.description.trim() || undefined : existing.description,
    coverArtUrl: input.coverArtUrl !== undefined ? input.coverArtUrl : existing.coverArtUrl,
    tags: input.tags ?? existing.tags,
  }
  await db.scenes.put(updated)
  return updated
}

export async function duplicateScene(id: string): Promise<Scene> {
  const existing = await db.scenes.get(id)
  if (!existing || existing.deletedAt) {
    throw new Error('Scene not found')
  }

  const now = Date.now()
  const copy: Scene = {
    ...existing,
    id: createId(),
    name: `Copy of ${existing.name}`,
    sessionLocked: false,
    createdAt: now,
    deletedAt: undefined,
  }
  await db.scenes.add(copy)

  const soundscapes = await db.sceneSoundscapes.where('sceneId').equals(id).toArray()
  for (const item of soundscapes) {
    await db.sceneSoundscapes.add({
      ...item,
      id: createId(),
      sceneId: copy.id,
    })
  }

  const effects = await db.sceneEffects.where('sceneId').equals(id).toArray()
  for (const item of effects) {
    await db.sceneEffects.add({
      ...item,
      id: createId(),
      sceneId: copy.id,
    })
  }

  return copy
}

export async function softDeleteScene(id: string): Promise<void> {
  const deletedAt = Date.now()
  await db.scenes.update(id, { deletedAt })
  const links = await db.sessionSceneLinks.where('sceneId').equals(id).toArray()
  for (const link of links) {
    await db.sessionSceneLinks.delete(link.id)
    const count = await db.sessionSceneLinks.where('sessionId').equals(link.sessionId).count()
    await db.sessions.update(link.sessionId, { sceneCount: count })
  }
}

export async function restoreScene(id: string): Promise<void> {
  await db.scenes.update(id, { deletedAt: undefined })
}

export async function countSceneSessionLinks(sceneId: string): Promise<number> {
  return db.sessionSceneLinks.where('sceneId').equals(sceneId).count()
}

export async function listDeletedScenes(): Promise<Scene[]> {
  return db.scenes.filter((scene) => Boolean(scene.deletedAt)).toArray()
}

export function formatSceneStats(scene: Scene): string {
  return `${scene.soundscapeCategoryCount} SC · ${scene.effectCount} FX`
}

export function filterScenesByName(scenes: Scene[], query: string): Scene[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return scenes
  return scenes.filter((scene) => scene.name.toLowerCase().includes(normalized))
}
