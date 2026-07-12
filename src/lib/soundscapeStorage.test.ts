import { describe, expect, it } from 'vitest'
import type { SoundscapeCategory } from '@/types/library'
import {
  categoryHasTracks,
  filterSoundscapeCategories,
  getCategoryLayerCount,
} from '@/lib/soundscapeStorage'

describe('soundscapeStorage', () => {
  it('excludes categories with zero tracks from picker lists', () => {
    const categories: SoundscapeCategory[] = [
      { id: '1', name: 'Weather', trackCount: 5, levels: { I: ['t1'], II: [], III: [] } },
      { id: '2', name: 'Empty Category', trackCount: 0, levels: { I: [], II: [], III: [] } },
    ]

    expect(filterSoundscapeCategories(categories, {})).toEqual([categories[0]])
  })

  it('filters categories by search and type', () => {
    const categories: SoundscapeCategory[] = [
      { id: '1', name: 'Weather', trackCount: 2, type: 'WEATHER' },
      { id: '2', name: 'Tavern', trackCount: 2, type: 'TOWN' },
      { id: '3', name: 'Forest', trackCount: 2, type: 'AMBIENCE' },
    ]

    expect(filterSoundscapeCategories(categories, { search: 'Weather' })).toEqual([categories[0]])
    expect(filterSoundscapeCategories(categories, { type: 'AMBIENCE' })).toEqual([categories[2]])
  })

  it('counts layers with assigned tracks', () => {
    const category: SoundscapeCategory = {
      id: '1',
      name: 'Weather',
      trackCount: 12,
      levels: {
        I: ['a', 'b'],
        II: ['c', 'd', 'e'],
        III: ['f'],
      },
    }

    expect(getCategoryLayerCount(category)).toBe(3)
    expect(categoryHasTracks(category)).toBe(true)
  })
})
