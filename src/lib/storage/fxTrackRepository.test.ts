import { describe, expect, it } from 'vitest'
import { filterFxTracks } from './fxTrackRepository'
import type { FxTrack } from './types'

const tracks: FxTrack[] = [
  {
    id: '1',
    name: 'Alpha FX',
    duration: '0:01',
    baseIntensity: 1,
    fxType: 'UI',
    tags: [],
    defaultVolume: 100,
    createdAt: 100,
  },
  {
    id: '2',
    name: 'Thunder Crack',
    duration: '0:04',
    baseIntensity: 3,
    fxType: 'IMPACT',
    tags: ['Impact'],
    defaultVolume: 100,
    createdAt: 200,
  },
  {
    id: '3',
    name: 'Wolf Howl',
    duration: '0:03',
    baseIntensity: 2,
    fxType: 'CREATURE',
    tags: ['Creature', 'Combat'],
    defaultVolume: 100,
    createdAt: 300,
  },
]

describe('filterFxTracks', () => {
  it('filters by search name', () => {
    const filtered = filterFxTracks(tracks, { search: 'Thunder' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.name).toBe('Thunder Crack')
  })

  it('filters by tag search', () => {
    const filtered = filterFxTracks(tracks, { search: 'CREATURE' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.name).toBe('Wolf Howl')
  })

  it('filters by fx type', () => {
    const filtered = filterFxTracks(tracks, { fxType: 'IMPACT' })
    expect(filtered.map((track) => track.name)).toEqual(['Thunder Crack'])
  })

  it('filters by max base intensity', () => {
    const filtered = filterFxTracks(tracks, { maxBaseIntensity: 1 })
    expect(filtered.map((track) => track.name)).toEqual(['Alpha FX'])
  })

  it('sorts by name ascending', () => {
    const filtered = filterFxTracks(tracks, { sortOrder: 'name-asc' })
    expect(filtered.map((track) => track.name)).toEqual(['Alpha FX', 'Thunder Crack', 'Wolf Howl'])
  })
})
