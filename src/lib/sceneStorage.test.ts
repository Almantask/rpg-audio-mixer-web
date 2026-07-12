import { describe, expect, it } from 'vitest'
import {
  filterScenesByName,
  dedupeSoundboardEntries,
  formatFxDuration,
  formatSceneStats,
  getActiveScenes,
  getHotkeyLabel,
  getLinkedSessionCount,
  getSceneStats,
  sortSessionScenes,
} from './sceneStorage'
import type { Scene, SceneSoundboardEntry, SceneSoundscapeSlot, SessionSceneLink } from '@/types/scene'

const scenes: Scene[] = [
  {
    id: 's1',
    name: 'Tavern',
    tags: ['Tavern'],
    createdAt: '2026-01-01T00:00:00.000Z',
    lastUsedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 's2',
    name: 'Forest',
    tags: ['Forest'],
    createdAt: '2026-02-01T00:00:00.000Z',
    lastUsedAt: '2026-03-01T00:00:00.000Z',
  },
]

const links: SessionSceneLink[] = [
  { id: 'l1', sessionId: 'session-1', sceneId: 's1', linkedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'l2', sessionId: 'session-1', sceneId: 's2', linkedAt: '2026-01-02T00:00:00.000Z', lastPlayedAt: '2026-03-02T00:00:00.000Z' },
]

const soundscapeSlots: SceneSoundscapeSlot[] = [
  { id: 'slot-1', sceneId: 's1', categoryId: 'weather', order: 0 },
  { id: 'slot-2', sceneId: 's1', categoryId: 'interior', order: 1 },
]

const soundboardEntries: SceneSoundboardEntry[] = [
  { id: 'entry-1', sceneId: 's1', fxTrackId: 'fx-1', order: 0 },
]

describe('sceneStorage', () => {
  it('sorts active scenes by most recently used', () => {
    const sorted = getActiveScenes(scenes)
    expect(sorted[0]?.name).toBe('Forest')
    expect(sorted[1]?.name).toBe('Tavern')
  })

  it('formats scene stats label', () => {
    expect(formatSceneStats(4, 12)).toBe('4 SC · 12 FX')
  })

  it('counts scene soundscape and fx totals', () => {
    expect(getSceneStats('s1', soundscapeSlots, soundboardEntries)).toEqual({
      soundscapeCount: 2,
      fxCount: 1,
    })
  })

  it('filters scenes by location name', () => {
    expect(filterScenesByName(scenes, 'forest').map((scene) => scene.name)).toEqual(['Forest'])
  })

  it('counts linked sessions for a scene', () => {
    expect(getLinkedSessionCount('s1', links)).toBe(1)
  })

  it('pins last active scene first in session sort', () => {
    const sorted = sortSessionScenes(scenes, 'session-1', links, 's1')
    expect(sorted[0]?.name).toBe('Tavern')
  })

  it('formats fx duration and hotkey labels', () => {
    expect(formatFxDuration(4)).toBe('0:04')
    expect(getHotkeyLabel(0)).toBe('Num 1')
    expect(getHotkeyLabel(9)).toBeUndefined()
  })

  it('dedupes soundboard entries by id and scene track', () => {
    const duplicateId: SceneSoundboardEntry = {
      id: 'soundboard-scene-the-ancient-gate-fx-bundled-6',
      sceneId: 'scene-the-ancient-gate',
      fxTrackId: 'fx-bundled-6',
      order: 1,
    }
    const duplicateTrack: SceneSoundboardEntry = {
      id: 'soundboard-entry-other',
      sceneId: 'scene-the-ancient-gate',
      fxTrackId: 'fx-bundled-6',
      order: 2,
    }
    const deduped = dedupeSoundboardEntries([duplicateId, duplicateId, duplicateTrack])
    expect(deduped).toHaveLength(1)
    expect(deduped[0]?.id).toBe('soundboard-scene-the-ancient-gate-fx-bundled-6')
  })
})
