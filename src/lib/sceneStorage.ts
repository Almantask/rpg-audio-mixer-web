import type { Scene, SceneSoundboardEntry, SceneSoundscapeSlot, SessionSceneLink } from '@/types/scene'

export function getActiveScenes(scenes: Scene[]): Scene[] {
  return scenes
    .filter((scene) => !scene.deletedAt)
    .sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())
}

export function getTrashedScenes(scenes: Scene[]): Scene[] {
  return scenes.filter((scene) => scene.deletedAt)
}

export function dedupeSoundboardEntries(entries: SceneSoundboardEntry[]): SceneSoundboardEntry[] {
  const byId = new Map<string, SceneSoundboardEntry>()
  for (const entry of entries) {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry)
    }
  }

  const bySceneTrack = new Map<string, SceneSoundboardEntry>()
  for (const entry of byId.values()) {
    const key = `${entry.sceneId}:${entry.fxTrackId}`
    const existing = bySceneTrack.get(key)
    if (!existing || entry.order < existing.order) {
      bySceneTrack.set(key, entry)
    }
  }

  return Array.from(bySceneTrack.values()).sort((a, b) => {
    if (a.sceneId !== b.sceneId) {
      return a.sceneId.localeCompare(b.sceneId)
    }
    return a.order - b.order
  })
}

export function getSceneStats(
  sceneId: string,
  soundscapeSlots: SceneSoundscapeSlot[],
  soundboardEntries: SceneSoundboardEntry[],
): { soundscapeCount: number; fxCount: number } {
  return {
    soundscapeCount: soundscapeSlots.filter((slot) => slot.sceneId === sceneId).length,
    fxCount: soundboardEntries.filter((entry) => entry.sceneId === sceneId).length,
  }
}

export function formatSceneStats(soundscapeCount: number, fxCount: number): string {
  return `${soundscapeCount} SC · ${fxCount} FX`
}

export function getSessionSceneLinksForSession(
  sessionId: string,
  links: SessionSceneLink[],
): SessionSceneLink[] {
  return links.filter((link) => link.sessionId === sessionId)
}

export function getLinkedSessionCount(sceneId: string, links: SessionSceneLink[]): number {
  return new Set(links.filter((link) => link.sceneId === sceneId).map((link) => link.sessionId))
    .size
}

export function sortSessionScenes(
  scenes: Scene[],
  sessionId: string,
  links: SessionSceneLink[],
  lastActiveSceneId?: string,
): Scene[] {
  const linkBySceneId = new Map(
    getSessionSceneLinksForSession(sessionId, links).map((link) => [link.sceneId, link]),
  )

  return [...scenes].sort((a, b) => {
    if (a.id === lastActiveSceneId) {
      return -1
    }
    if (b.id === lastActiveSceneId) {
      return 1
    }

    const aPlayed = linkBySceneId.get(a.id)?.lastPlayedAt ?? a.lastUsedAt
    const bPlayed = linkBySceneId.get(b.id)?.lastPlayedAt ?? b.lastUsedAt
    return new Date(bPlayed).getTime() - new Date(aPlayed).getTime()
  })
}

export function filterScenesByName<T extends { name: string; tags: string[] }>(
  scenes: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return scenes
  }
  return scenes.filter(
    (scene) =>
      scene.name.toLowerCase().includes(normalized) ||
      scene.tags.some((tag) => tag.toLowerCase().includes(normalized)),
  )
}

export function getUnlinkedScenesForSession(
  allScenes: Scene[],
  sessionId: string,
  links: SessionSceneLink[],
): Scene[] {
  const linkedIds = new Set(
    getSessionSceneLinksForSession(sessionId, links).map((link) => link.sceneId),
  )
  return getActiveScenes(allScenes).filter((scene) => !linkedIds.has(scene.id))
}

export function sortSoundboardEntries(entries: SceneSoundboardEntry[]): SceneSoundboardEntry[] {
  return [...entries].sort((a, b) => a.order - b.order)
}

export function sortSoundscapeSlots(slots: SceneSoundscapeSlot[]): SceneSoundscapeSlot[] {
  return [...slots].sort((a, b) => a.order - b.order)
}

export function getHotkeyLabel(orderIndex: number): string | undefined {
  if (orderIndex >= 9) {
    return undefined
  }
  return `Num ${orderIndex + 1}`
}

/** Maps Numpad1–9 / Digit1–9 to soundboard tile index 0–8. */
export function resolveSoundboardHotkeyIndex(code: string): number | undefined {
  const numpadMatch = /^Numpad([1-9])$/.exec(code)
  if (numpadMatch) {
    return Number(numpadMatch[1]) - 1
  }
  const digitMatch = /^Digit([1-9])$/.exec(code)
  if (digitMatch) {
    return Number(digitMatch[1]) - 1
  }
  return undefined
}

export function formatFxDuration(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0
  const minutes = Math.floor(safe / 60)
  const remaining = safe % 60
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export const PREDEFINED_SCENE_TAGS = [
  'Tavern',
  'Forest',
  'Combat',
  'City',
  'Dungeon',
  'Mystery',
  'Boss',
] as const
