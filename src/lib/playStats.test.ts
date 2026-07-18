import { describe, expect, it } from 'vitest'
import type { PlayStats } from '@/types/campaign'
import {
  getTopFxTrack,
  getTopSoundscapeCategory,
  incrementFxPlayCount,
  incrementSoundscapePlayCount,
  resolveCategoryPreviewTrackId,
} from './playStats'

const emptyStats: PlayStats = { soundscapeCategories: {}, fxTracks: {} }

describe('playStats', () => {
  it('returns the highest-count soundscape category', () => {
    const stats = incrementSoundscapePlayCount(
      incrementSoundscapePlayCount(emptyStats, 'cat-a'),
      'cat-b',
    )
    stats.soundscapeCategories['cat-b'] = 5

    const top = getTopSoundscapeCategory(stats, [
      { id: 'cat-a', name: 'Rain', trackCount: 1 },
      { id: 'cat-b', name: 'Chant', trackCount: 2 },
    ])

    expect(top?.category.name).toBe('Chant')
    expect(top?.count).toBe(5)
  })

  it('returns the highest-count FX track', () => {
    const stats = incrementFxPlayCount(incrementFxPlayCount(emptyStats, 'fx-a'), 'fx-b')
    stats.fxTracks['fx-b'] = 10

    const top = getTopFxTrack(stats, [
      {
        id: 'fx-a',
        name: 'Whip',
        durationSeconds: 1,
        baseIntensity: 'I',
        type: 'OTHER',
        tags: [],
        audioUrl: '/a.ogg',
        defaultVolume: 80,
        createdAt: '2020-01-01',
      },
      {
        id: 'fx-b',
        name: 'Dragon Roar',
        durationSeconds: 1,
        baseIntensity: 'III',
        type: 'CREATURE',
        tags: [],
        audioUrl: '/b.ogg',
        defaultVolume: 80,
        createdAt: '2020-01-01',
      },
    ])

    expect(top?.track.name).toBe('Dragon Roar')
    expect(top?.count).toBe(10)
  })

  it('prefers default track id for category preview', () => {
    const trackId = resolveCategoryPreviewTrackId({
      id: 'cat-1',
      name: 'Ominous Chant',
      trackCount: 2,
      defaultTrackId: 'default-track',
      levels: { I: ['first'], II: [], III: [] },
    })
    expect(trackId).toBe('default-track')
  })

  it('falls back to first loopable track when no default is set', () => {
    const trackId = resolveCategoryPreviewTrackId({
      id: 'cat-1',
      name: 'Ominous Chant',
      trackCount: 2,
      levels: { I: [], II: ['second'], III: [] },
    })
    expect(trackId).toBe('second')
  })
})
