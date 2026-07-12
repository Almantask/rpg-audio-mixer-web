import { describe, expect, it } from 'vitest'
import {
  categoryHasTracks,
  filterPickerCategories,
  getCategoryTrackStats,
} from './soundscapePickerUtils'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'

const weather: SoundscapeCategoryWithCounts = {
  id: '1',
  name: 'Weather',
  categoryType: 'Ambience',
  levelICount: 4,
  levelIICount: 4,
  levelIIICount: 4,
  createdAt: 1,
}

const tavern: SoundscapeCategoryWithCounts = {
  id: '2',
  name: 'Tavern',
  categoryType: 'Interior',
  levelICount: 2,
  levelIICount: 0,
  levelIIICount: 0,
  createdAt: 2,
}

const empty: SoundscapeCategoryWithCounts = {
  id: '3',
  name: 'Empty Category',
  levelICount: 0,
  levelIICount: 0,
  levelIIICount: 0,
  createdAt: 3,
}

describe('soundscapePickerUtils', () => {
  it('computes track and layer counts', () => {
    expect(getCategoryTrackStats(weather)).toEqual({ trackCount: 12, layerCount: 3 })
  })

  it('excludes categories with zero tracks', () => {
    expect(categoryHasTracks(empty)).toBe(false)
    const filtered = filterPickerCategories([weather, empty], {})
    expect(filtered.map((item) => item.name)).toEqual(['Weather'])
  })

  it('filters by search and category type', () => {
    const filtered = filterPickerCategories([weather, tavern], {
      search: 'Weather',
      categoryType: 'Ambience',
    })
    expect(filtered.map((item) => item.name)).toEqual(['Weather'])
  })
})
