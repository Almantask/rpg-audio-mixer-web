import { db } from './db'
import { getE2EState } from './e2eState'
import { getTracksForLevel } from './soundscapeCategoryRepository'
import { showError } from '@/lib/errors/errorStore'
import type { IntensityLevelNumber, SceneEffect, SceneSoundscape } from './types'

function createId(): string {
  return crypto.randomUUID()
}

export async function listSceneSoundscapes(sceneId: string): Promise<SceneSoundscape[]> {
  const items = await db.sceneSoundscapes.where('sceneId').equals(sceneId).toArray()
  return items.sort((left, right) => left.sortOrder - right.sortOrder)
}

export async function listSceneEffects(sceneId: string): Promise<SceneEffect[]> {
  const items = await db.sceneEffects.where('sceneId').equals(sceneId).toArray()
  return items.sort((left, right) => left.sortOrder - right.sortOrder)
}

export async function getDefaultIntensity(categoryId: string): Promise<IntensityLevelNumber> {
  for (const level of [1, 2, 3] as IntensityLevelNumber[]) {
    const trackIds = await getTracksForLevel(categoryId, level)
    if (trackIds.length > 0) return level
  }
  return 1
}

export async function addSoundscapeToScene(
  sceneId: string,
  categoryId: string,
  categoryName: string,
): Promise<void> {
  await addSoundscapesToScene(sceneId, [{ categoryId, categoryName }])
}

export async function addSoundscapesToScene(
  sceneId: string,
  categories: Array<{ categoryId: string; categoryName: string }>,
): Promise<void> {
  if (categories.length === 0) return
  let count = await db.sceneSoundscapes.where('sceneId').equals(sceneId).count()
  for (const category of categories) {
    const intensity = await getDefaultIntensity(category.categoryId)
    await db.sceneSoundscapes.add({
      id: createId(),
      sceneId,
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      volume: 100,
      intensity,
      sortOrder: count,
    })
    count += 1
  }
  await db.scenes.update(sceneId, { soundscapeCategoryCount: count })
}

export async function removeSoundscapeFromScene(
  sceneId: string,
  categoryId: string,
): Promise<void> {
  const item = await db.sceneSoundscapes
    .where('sceneId')
    .equals(sceneId)
    .filter((entry) => entry.categoryId === categoryId)
    .first()
  if (!item) return
  await db.sceneSoundscapes.delete(item.id)
  const count = await db.sceneSoundscapes.where('sceneId').equals(sceneId).count()
  await db.scenes.update(sceneId, { soundscapeCategoryCount: count })
}

export async function addEffectToScene(sceneId: string, name: string, fxTrackId?: string): Promise<void> {
  await addEffectsToScene(sceneId, [{ name, fxTrackId }])
}

export async function addEffectsToScene(
  sceneId: string,
  effects: Array<{ name: string; fxTrackId?: string }>,
): Promise<void> {
  if (effects.length === 0) return
  let count = await db.sceneEffects.where('sceneId').equals(sceneId).count()
  for (const effect of effects) {
    await db.sceneEffects.add({
      id: createId(),
      sceneId,
      fxTrackId: effect.fxTrackId,
      name: effect.name,
      volume: 100,
      sortOrder: count,
    })
    count += 1
  }
  await db.scenes.update(sceneId, { effectCount: count })
}

export async function removeEffectFromScene(sceneId: string, name: string): Promise<void> {
  const item = await db.sceneEffects
    .where('sceneId')
    .equals(sceneId)
    .filter((entry) => entry.name === name)
    .first()
  if (!item) return
  await db.sceneEffects.delete(item.id)
  const count = await db.sceneEffects.where('sceneId').equals(sceneId).count()
  await db.scenes.update(sceneId, { effectCount: count })
}

export async function updateSceneMasterVolume(sceneId: string, masterVolume: number): Promise<void> {
  await db.scenes.update(sceneId, { masterVolume })
}

export async function updateSceneMasterMuted(sceneId: string, masterMuted: boolean): Promise<void> {
  await db.scenes.update(sceneId, { masterMuted })
}

export async function updateSceneSoundboardMaster(sceneId: string, soundboardMaster: number): Promise<void> {
  await db.scenes.update(sceneId, { soundboardMaster })
}

export async function updateSceneSessionLocked(sceneId: string, sessionLocked: boolean): Promise<void> {
  await db.scenes.update(sceneId, { sessionLocked })
}

export async function updateSceneNotes(sceneId: string, notes: string): Promise<void> {
  const { composerSaveFail } = getE2EState()
  if (composerSaveFail) {
    showError('Failed to save scene notes due to a storage error.')
    throw new Error('Failed to save scene notes')
  }
  await db.scenes.update(sceneId, { notes: notes || undefined })
}

export async function updateCategoryVolume(
  sceneSoundscapeId: string,
  volume: number,
): Promise<void> {
  await db.sceneSoundscapes.update(sceneSoundscapeId, { volume })
}

export async function updateCategoryIntensity(
  sceneSoundscapeId: string,
  intensity: IntensityLevelNumber,
): Promise<void> {
  await db.sceneSoundscapes.update(sceneSoundscapeId, { intensity })
}

export async function updateCategoryLoadedTrack(
  sceneSoundscapeId: string,
  track: { id: string; name: string } | null,
): Promise<void> {
  if (track) {
    await db.sceneSoundscapes.update(sceneSoundscapeId, {
      loadedTrackId: track.id,
      loadedTrackName: track.name,
    })
    return
  }
  await db.sceneSoundscapes.update(sceneSoundscapeId, {
    loadedTrackId: undefined,
    loadedTrackName: undefined,
  })
}

export async function reorderSceneSoundscapes(sceneId: string, orderedIds: string[]): Promise<void> {
  await db.transaction('rw', db.sceneSoundscapes, async () => {
    for (let index = 0; index < orderedIds.length; index += 1) {
      await db.sceneSoundscapes.update(orderedIds[index], { sortOrder: index })
    }
  })
  void sceneId
}

export async function reorderSceneEffects(sceneId: string, orderedIds: string[]): Promise<void> {
  await db.transaction('rw', db.sceneEffects, async () => {
    for (let index = 0; index < orderedIds.length; index += 1) {
      await db.sceneEffects.update(orderedIds[index], { sortOrder: index })
    }
  })
  void sceneId
}

export function formatEffectHotkey(sortOrder: number): string | undefined {
  if (sortOrder >= 9) return undefined
  return `Num ${sortOrder + 1}`
}

export async function getTrackPool(
  categoryId: string,
  intensity: IntensityLevelNumber,
): Promise<Array<{ id: string; name: string }>> {
  const trackIds = await getTracksForLevel(categoryId, intensity)
  const tracks = await Promise.all(trackIds.map((id) => db.tracks.get(id)))
  return tracks
    .filter((track): track is NonNullable<typeof track> => Boolean(track))
    .map((track) => ({ id: track.id, name: track.name }))
}

export async function getCategoryTrackCounts(categoryId: string): Promise<{
  levelI: number
  levelII: number
  levelIII: number
  total: number
}> {
  const [levelI, levelII, levelIII] = await Promise.all([
    getTracksForLevel(categoryId, 1),
    getTracksForLevel(categoryId, 2),
    getTracksForLevel(categoryId, 3),
  ])
  return {
    levelI: levelI.length,
    levelII: levelII.length,
    levelIII: levelIII.length,
    total: levelI.length + levelII.length + levelIII.length,
  }
}
