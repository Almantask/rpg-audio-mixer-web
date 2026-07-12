import { describe, expect, it } from 'vitest'
import { filterScenesByName, formatSceneStats } from './sceneRepository'
import type { Scene } from './types'

const scenes: Scene[] = [
  {
    id: '1',
    name: "Dragon's Lair",
    tags: [],
    soundscapeCategoryCount: 4,
    effectCount: 12,
    createdAt: 1,
  },
  {
    id: '2',
    name: 'The Rusty Tankard',
    tags: [],
    soundscapeCategoryCount: 0,
    effectCount: 0,
    createdAt: 2,
  },
]

describe('sceneRepository helpers', () => {
  it('formats scene stats', () => {
    expect(formatSceneStats(scenes[0])).toBe('4 SC · 12 FX')
  })

  it('filters scenes by name', () => {
    const filtered = filterScenesByName(scenes, 'Dragon')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.name).toBe("Dragon's Lair")
  })
})
