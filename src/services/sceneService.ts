import type { Scene, SceneSoundboardEffect } from '../types/scene'
import { getScenes, saveScenes, getSessions, saveSessions, setLastPlayedSceneId } from './storageService'

export function getActiveScenes(): Scene[] {
  return getScenes().filter((s) => !s.deletedAt)
}

export function getSceneById(id: string): Scene | undefined {
  return getScenes().find((s) => s.id === id)
}

export function getScenesForSession(sessionId: string): Scene[] {
  const session = getSessions().find((s) => s.id === sessionId)
  if (!session || !session.sceneIds) return []
  const allScenes = getActiveScenes()
  return session.sceneIds
    .map((sceneId) => allScenes.find((s) => s.id === sceneId))
    .filter((s): s is Scene => Boolean(s))
}

export function createScene(data: {
  name: string
  description?: string
  backgroundUrl?: string
  tags?: string[]
  sessionId?: string
}): Scene {
  const scenes = getScenes()
  const now = new Date().toISOString()
  const newScene: Scene = {
    id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    description: data.description?.trim() || undefined,
    backgroundUrl: data.backgroundUrl || undefined,
    tags: data.tags || [],
    sessionIds: data.sessionId ? [data.sessionId] : [],
    soundboardEffects: [],
    soundscapeCategories: [],
    soundboardMasterVolume: 1,
    soundscapeMasterVolume: 1,
    isLocked: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }

  scenes.unshift(newScene)
  saveScenes(scenes)

  if (data.sessionId) {
    const sessions = getSessions()
    const session = sessions.find((s) => s.id === data.sessionId)
    if (session) {
      if (!session.sceneIds) session.sceneIds = []
      if (!session.sceneIds.includes(newScene.id)) {
        session.sceneIds.push(newScene.id)
        saveSessions(sessions)
      }
    }
  }

  return newScene
}

export function duplicateScene(sceneId: string, targetSessionId?: string): Scene | undefined {
  const original = getSceneById(sceneId)
  if (!original) return undefined

  const now = new Date().toISOString()
  const clone: Scene = {
    ...original,
    id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: `Copy of ${original.name}`,
    soundboardEffects: original.soundboardEffects ? [...original.soundboardEffects.map((e) => ({ ...e }))] : [],
    soundscapeCategories: original.soundscapeCategories ? [...original.soundscapeCategories] : [],
    sessionIds: targetSessionId ? [targetSessionId] : [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }

  const scenes = getScenes()
  scenes.unshift(clone)
  saveScenes(scenes)

  if (targetSessionId) {
    const sessions = getSessions()
    const session = sessions.find((s) => s.id === targetSessionId)
    if (session) {
      if (!session.sceneIds) session.sceneIds = []
      if (!session.sceneIds.includes(clone.id)) {
        session.sceneIds.push(clone.id)
        saveSessions(sessions)
      }
    }
  }

  return clone
}

export function updateScene(id: string, updates: Partial<Scene>): Scene | undefined {
  const scenes = getScenes()
  const idx = scenes.findIndex((s) => s.id === id)
  if (idx === -1) return undefined

  scenes[idx] = {
    ...scenes[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  saveScenes(scenes)
  return scenes[idx]
}

export function touchScenePlayed(id: string): void {
  const scenes = getScenes()
  const idx = scenes.findIndex((s) => s.id === id)
  if (idx !== -1) {
    scenes[idx].lastPlayedAt = new Date().toISOString()
    saveScenes(scenes)
  }
  setLastPlayedSceneId(id)
}

export function softDeleteScene(id: string): void {
  const scenes = getScenes()
  const idx = scenes.findIndex((s) => s.id === id)
  if (idx !== -1) {
    scenes[idx].deletedAt = new Date().toISOString()
    saveScenes(scenes)
  }

  // Also remove sceneId from sessions
  const sessions = getSessions()
  sessions.forEach((s) => {
    if (s.sceneIds) {
      s.sceneIds = s.sceneIds.filter((sid) => sid !== id)
    }
  })
  saveSessions(sessions)
}

export function unlinkSceneFromSession(sceneId: string, sessionId: string): void {
  const sessions = getSessions()
  const session = sessions.find((s) => s.id === sessionId)
  if (session && session.sceneIds) {
    session.sceneIds = session.sceneIds.filter((id) => id !== sceneId)
    saveSessions(sessions)
  }

  const scenes = getScenes()
  const scene = scenes.find((sc) => sc.id === sceneId)
  if (scene && scene.sessionIds) {
    scene.sessionIds = scene.sessionIds.filter((sid) => sid !== sessionId)
    saveScenes(scenes)
  }
}

export function importScenesToSession(sceneIds: string[], sessionId: string): void {
  const sessions = getSessions()
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) return

  if (!session.sceneIds) session.sceneIds = []
  sceneIds.forEach((id) => {
    if (!session.sceneIds!.includes(id)) {
      session.sceneIds!.push(id)
    }
  })
  saveSessions(sessions)

  const scenes = getScenes()
  scenes.forEach((sc) => {
    if (sceneIds.includes(sc.id)) {
      if (!sc.sessionIds) sc.sessionIds = []
      if (!sc.sessionIds.includes(sessionId)) {
        sc.sessionIds.push(sessionId)
      }
    }
  })
  saveScenes(scenes)
}

export function addEffectToSceneSoundboard(sceneId: string, effect: Omit<SceneSoundboardEffect, 'id' | 'order'>): Scene | undefined {
  const scene = getSceneById(sceneId)
  if (!scene) return undefined

  const currentFx = scene.soundboardEffects || []
  if (currentFx.length >= 24) return scene // board full

  const newFx: SceneSoundboardEffect = {
    ...effect,
    id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    hotkey: currentFx.length < 9 ? currentFx.length + 1 : undefined,
    order: currentFx.length,
  }

  return updateScene(sceneId, {
    soundboardEffects: [...currentFx, newFx],
  })
}

export function removeEffectFromSceneSoundboard(sceneId: string, tileId: string): Scene | undefined {
  const scene = getSceneById(sceneId)
  if (!scene) return undefined

  const remaining = (scene.soundboardEffects || []).filter((tile) => tile.id !== tileId)
  // Re-assign hotkeys & order
  const reordered = remaining.map((tile, index) => ({
    ...tile,
    order: index,
    hotkey: index < 9 ? index + 1 : undefined,
  }))

  return updateScene(sceneId, {
    soundboardEffects: reordered,
  })
}

export function reorderSceneSoundboardEffects(sceneId: string, reorderedFx: SceneSoundboardEffect[]): Scene | undefined {
  const updated = reorderedFx.map((tile, index) => ({
    ...tile,
    order: index,
    hotkey: index < 9 ? index + 1 : undefined,
  }))
  return updateScene(sceneId, { soundboardEffects: updated })
}

export function getTrashScenes(): Scene[] {
  return getScenes().filter((s) => s.deletedAt)
}

export function restoreScene(id: string): Scene | undefined {
  const scenes = getScenes()
  const target = scenes.find((s) => s.id === id)
  if (!target) return undefined

  let newName = target.name
  const activeNames = scenes.filter((s) => !s.deletedAt && s.id !== id).map((s) => s.name)
  if (activeNames.includes(newName)) {
    newName = `${newName} (restored)`
  }

  target.name = newName
  target.deletedAt = null
  target.updatedAt = new Date().toISOString()
  saveScenes(scenes)
  return target
}

export function purgeScene(id: string): void {
  const scenes = getScenes().filter((s) => s.id !== id)
  saveScenes(scenes)
}

export function purgeAllTrashScenes(): void {
  const scenes = getScenes().filter((s) => !s.deletedAt)
  saveScenes(scenes)
}
