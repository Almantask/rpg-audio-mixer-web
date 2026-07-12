import { describe, expect, it } from 'vitest'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import { createBundledSoundscapeLibrary } from '@/lib/seedBundledSoundscapes'
import { createDemoCampaignData } from '@/lib/seedDemoCampaign'

describe('seedBundledSoundscapes', () => {
  it('creates four categories with tracks mapped to intensity levels from assets', () => {
    const { categories, tracks } = createBundledSoundscapeLibrary('2026-01-01T00:00:00.000Z')

    expect(categories.map((category) => category.name)).toEqual(['Forest', 'Boss', 'Combat', 'Mystery'])
    expect(tracks).toHaveLength(21)

    const forest = categories.find((category) => category.name === 'Forest')!
    expect(forest.levels?.I).toHaveLength(3)
    expect(forest.levels?.II).toHaveLength(3)
    expect(forest.levels?.III).toHaveLength(0)

    const combat = categories.find((category) => category.name === 'Combat')!
    expect(combat.levels?.I).toHaveLength(0)
    expect(combat.levels?.II).toHaveLength(2)
    expect(combat.levels?.III).toHaveLength(2)

    const firstForestTrack = tracks.find((track) => track.id === forest.levels?.I[0])!
    expect(firstForestTrack.audioUrl).toBe(
      '/assets/audio/soundscapes/Forest/I/Moonroots of the Feywood.ogg',
    )
  })
})

describe('seedBundledFx', () => {
  it('creates bundled FX tracks for every soundboard asset', () => {
    const tracks = createBundledFxTracks()

    expect(tracks).toHaveLength(15)
    expect(tracks.every((track) => track.audioUrl.startsWith('/assets/audio/soundboard/'))).toBe(true)
    expect(tracks.some((track) => track.name === 'Owl Hooting')).toBe(true)
    expect(tracks.some((track) => track.name === 'Whip')).toBe(true)
  })
})

describe('seedDemoCampaign', () => {
  it('creates a demo campaign with bundled soundscapes and FX on the scene', () => {
    const demo = createDemoCampaignData()

    expect(demo.campaigns[0]?.name).toBe('Demo Adventure')
    expect(demo.sessions).toHaveLength(1)
    expect(demo.scenes[0]?.name).toBe('The Ancient Gate')
    expect(demo.sceneSoundscapeSlots).toHaveLength(4)
    expect(demo.sceneSoundboardEntries).toHaveLength(createBundledFxTracks().length)
    expect(demo.lastActiveSessionByCampaign['campaign-demo-adventure']).toBe(
      'session-campaign-demo-adventure-1',
    )
  })
})
