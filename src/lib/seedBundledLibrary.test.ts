import { describe, expect, it } from 'vitest'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import { createBundledSoundscapeLibrary } from '@/lib/seedBundledSoundscapes'
import {
  createDemoCampaignData,
  DEMO_SCENE_BONFIRE_DESCRIPTION,
  DEMO_SCENE_BONFIRE_ID,
  DEMO_SCENE_DESCRIPTION,
  DEMO_SCENE_ID,
} from '@/lib/seedDemoCampaign'

describe('seedBundledSoundscapes', () => {
  it('creates bundled categories with tracks mapped to intensity levels from assets', () => {
    const { categories, tracks } = createBundledSoundscapeLibrary('2026-01-01T00:00:00.000Z')

    expect(categories.map((category) => category.name)).toEqual([
      'Forest',
      'Boss',
      'Combat',
      'Mystery',
      'Bonfire',
      'Rain',
    ])
    expect(tracks).toHaveLength(31)

    const forest = categories.find((category) => category.name === 'Forest')!
    expect(forest.levels?.I).toHaveLength(3)
    expect(forest.levels?.II).toHaveLength(3)
    expect(forest.levels?.III).toHaveLength(0)

    const combat = categories.find((category) => category.name === 'Combat')!
    expect(combat.levels?.I).toHaveLength(0)
    expect(combat.levels?.II).toHaveLength(2)
    expect(combat.levels?.III).toHaveLength(2)

    const bonfire = categories.find((category) => category.name === 'Bonfire')!
    expect(bonfire.levels?.I).toHaveLength(4)
    expect(bonfire.levels?.II).toHaveLength(0)
    expect(bonfire.type).toBe('AMBIENCE')

    const rain = categories.find((category) => category.name === 'Rain')!
    expect(rain.levels?.I).toHaveLength(2)
    expect(rain.levels?.II).toHaveLength(2)
    expect(rain.levels?.III).toHaveLength(2)

    const firstForestTrack = tracks.find((track) => track.id === forest.levels?.I[0])!
    expect(firstForestTrack.audioUrl).toBe(
      '/assets/audio/soundscapes/Forest/I/Moonroots of the Feywood.ogg',
    )
    expect(tracks.find((track) => track.id === bonfire.levels?.I[0])?.audioUrl).toBe(
      '/assets/audio/soundscapes/Bonfire/I/Bonfire_%231.mp3',
    )
    expect(tracks.find((track) => track.id === rain.levels?.I[0])?.audioUrl).toBe(
      '/assets/audio/soundscapes/Rain/I/Relaxing_light_rain_%231.mp3',
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
    expect(tracks.find((track) => track.name === 'Arrow')?.durationSeconds).toBe(1)
    expect(tracks.find((track) => track.name === 'Dragon Roar2')?.durationSeconds).toBe(8)
    expect(tracks.find((track) => track.name === 'Owl Hooting')?.durationSeconds).toBe(4)
    expect(tracks.every((track) => track.durationSeconds >= 1)).toBe(true)
    expect(tracks.find((track) => track.name === 'Arrow')?.tags).toEqual([
      'Combat',
      'Weapon',
      'Impact',
    ])
    expect(tracks.find((track) => track.name === 'Dragon Roar2')?.tags).toEqual([
      'Creature',
      'Boss',
      'Impact',
    ])
  })
})

describe('seedDemoCampaign', () => {
  it('creates a demo campaign with two scenes and bundled soundscapes', () => {
    const demo = createDemoCampaignData()

    expect(demo.campaigns[0]?.name).toBe('Demo Adventure')
    expect(demo.sessions).toHaveLength(1)
    expect(demo.sessions[0]?.name).toBe('The Ancient Gate')
    expect(demo.sessions[0]?.sceneCount).toBe(2)
    expect(demo.scenes.map((scene) => scene.name)).toEqual([
      'The Ancient Gate',
      'Bonfire talk',
    ])
    expect(demo.scenes.find((scene) => scene.id === DEMO_SCENE_ID)?.description).toBe(
      DEMO_SCENE_DESCRIPTION,
    )
    expect(demo.scenes.find((scene) => scene.id === DEMO_SCENE_BONFIRE_ID)?.description).toBe(
      DEMO_SCENE_BONFIRE_DESCRIPTION,
    )
    expect(demo.sessionSceneLinks).toHaveLength(2)
    expect(demo.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_ID)).toHaveLength(
      4,
    )
    expect(
      demo.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_BONFIRE_ID),
    ).toHaveLength(3)
    expect(demo.sceneSoundboardEntries).toHaveLength(createBundledFxTracks().length)
    expect(demo.lastActiveSessionByCampaign['campaign-demo-adventure']).toBe(
      'session-campaign-demo-adventure-1',
    )
  })
})
