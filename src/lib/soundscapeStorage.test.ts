import { describe, expect, it } from 'vitest'
import type { SoundscapeCategory } from '@/types/library'
import {
  categoryHasTracks,
  filterSoundscapeCategories,
  filterSoundscapeCategoriesForBrowse,
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

  describe('filterSoundscapeCategoriesForBrowse', () => {
    it('includes empty categories unlike picker filter', () => {
      const categories: SoundscapeCategory[] = [
        { id: '1', name: 'Weather', trackCount: 5, levels: { I: ['t1'], II: [], III: [] } },
        { id: '2', name: 'Empty Category', trackCount: 0, levels: { I: [], II: [], III: [] } },
      ]

      expect(filterSoundscapeCategoriesForBrowse(categories, {})).toEqual(categories)
      expect(filterSoundscapeCategories(categories, {})).toEqual([categories[0]])
    })

    it('filters categories by search and type', () => {
      const categories: SoundscapeCategory[] = [
        { id: '1', name: 'Weather', trackCount: 2, type: 'Environmental' },
        { id: '2', name: 'Tavern', trackCount: 2, type: 'Environmental' },
        { id: '3', name: 'Monsters', trackCount: 2, type: 'Creature' },
      ]

      expect(filterSoundscapeCategoriesForBrowse(categories, { search: 'Weather' })).toEqual([categories[0]])
      expect(filterSoundscapeCategoriesForBrowse(categories, { type: 'Creature' })).toEqual([categories[2]])
    })

    it('sorts categories by createdAt descending for recent sort', () => {
      const categories: SoundscapeCategory[] = [
        { id: '1', name: 'Weather', trackCount: 2, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', name: 'Interior', trackCount: 2, createdAt: '2024-01-03T00:00:00.000Z' },
        { id: '3', name: 'Monsters', trackCount: 2, createdAt: '2024-01-05T00:00:00.000Z' },
      ]

      expect(filterSoundscapeCategoriesForBrowse(categories, { sort: 'recent' })).toEqual([
        categories[2],
        categories[1],
        categories[0],
      ])
    })

    it('excludes soft-deleted categories', () => {
      const categories: SoundscapeCategory[] = [
        { id: '1', name: 'Weather', trackCount: 2 },
        { id: '2', name: 'Deleted', trackCount: 2, deletedAt: '2024-01-01T00:00:00.000Z' },
      ]

      expect(filterSoundscapeCategoriesForBrowse(categories, {})).toEqual([categories[0]])
    })
  })
})
