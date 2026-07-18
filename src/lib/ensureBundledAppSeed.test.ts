import { describe, expect, it } from 'vitest'
import type { AppData } from '@/types/campaign'
import { EMPTY_APP_DATA } from '@/types/campaign'
import { ensureBundledAppSeed } from '@/lib/ensureBundledAppSeed'
import { createBundledFxTracks } from '@/lib/seedBundledFx'
import {
  createDemoCampaignData,
  DEMO_CAMPAIGN_ID,
  DEMO_SCENE_BONFIRE_DESCRIPTION,
  DEMO_SCENE_BONFIRE_ID,
  DEMO_SCENE_DESCRIPTION,
  DEMO_SCENE_ID,
  DEMO_SESSION_ID,
  DEMO_SESSION_NAME,
} from '@/lib/seedDemoCampaign'

describe('ensureBundledAppSeed', () => {
  it('seeds bundled library and demo campaign on empty app data', () => {
    const next = ensureBundledAppSeed({ ...EMPTY_APP_DATA }, '2026-01-01T00:00:00.000Z')

    expect(next?.campaigns.some((campaign) => campaign.id === DEMO_CAMPAIGN_ID)).toBe(true)
    expect(next?.soundscapeCategories.map((category) => category.name)).toEqual([
      'Forest',
      'Boss',
      'Combat',
      'Mystery',
      'Bonfire',
      'Rain',
    ])
    expect(next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_ID)).toHaveLength(4)
    expect(
      next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_BONFIRE_ID),
    ).toHaveLength(3)
    expect(next?.scenes.some((scene) => scene.name === 'Bonfire talk')).toBe(true)
    expect(next?.sceneSoundboardEntries.filter((entry) => entry.sceneId === DEMO_SCENE_ID)).toHaveLength(15)
  })

  it('adds demo campaign even when other campaigns already exist', () => {
    const current: AppData = {
      ...EMPTY_APP_DATA,
      campaigns: [
        {
          id: 'campaign-custom',
          name: 'My Campaign',
          createdAt: '2026-01-01T00:00:00.000Z',
          lastPlayedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.campaigns).toHaveLength(2)
    expect(next?.campaigns.some((campaign) => campaign.id === DEMO_CAMPAIGN_ID)).toBe(true)
    expect(next?.campaigns.some((campaign) => campaign.id === 'campaign-custom')).toBe(true)
  })

  it('repairs demo scenes when the campaign exists without imported content', () => {
    const brokenDemo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...brokenDemo,
      sceneSoundscapeSlots: [],
      sceneSoundboardEntries: [],
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_ID)).toHaveLength(4)
    expect(
      next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_BONFIRE_ID),
    ).toHaveLength(3)
    expect(next?.sceneSoundboardEntries.filter((entry) => entry.sceneId === DEMO_SCENE_ID)).toHaveLength(15)
  })

  it('adds Bonfire talk scene to an existing Ancient Gate-only demo session', () => {
    const demo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...demo,
      scenes: demo.scenes.filter((scene) => scene.id === DEMO_SCENE_ID),
      sessionSceneLinks: demo.sessionSceneLinks.filter((link) => link.sceneId === DEMO_SCENE_ID),
      sceneSoundscapeSlots: demo.sceneSoundscapeSlots.filter(
        (slot) => slot.sceneId === DEMO_SCENE_ID,
      ),
      sessions: demo.sessions.map((session) => ({ ...session, sceneCount: 1 })),
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.scenes.some((scene) => scene.id === DEMO_SCENE_BONFIRE_ID)).toBe(true)
    expect(
      next?.sessionSceneLinks.some((link) => link.sceneId === DEMO_SCENE_BONFIRE_ID),
    ).toBe(true)
    expect(
      next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_BONFIRE_ID),
    ).toHaveLength(3)
  })

  it('adds bundled categories when legacy library data is present', () => {
    const current: AppData = {
      ...EMPTY_APP_DATA,
      soundscapeCategories: [
        {
          id: 'category-weather',
          name: 'Weather',
          trackCount: 1,
          levels: { I: ['track-light-rain'], II: [], III: [] },
        },
      ],
      soundscapeTracks: [
        {
          id: 'track-light-rain',
          name: 'Light Rain',
          durationSeconds: 120,
          format: 'MP3',
          channels: 'Stereo',
          audioUrl: '/assets/audio/soundboard/owl_hooting.ogg',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.soundscapeCategories.some((category) => category.name === 'Forest')).toBe(true)
    expect(next?.soundscapeCategories.some((category) => category.name === 'Weather')).toBe(true)
    expect(next?.campaigns.some((campaign) => campaign.id === DEMO_CAMPAIGN_ID)).toBe(true)
  })

  it('updates stale bundled FX durations and tags from the seed catalog', () => {
    const demo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...demo,
      fxTracks: createBundledFxTracks('2026-01-01T00:00:00.000Z').map((track) => ({
        ...track,
        durationSeconds: 3,
        tags: ['Combat'],
      })),
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.fxTracks.find((track) => track.name === 'Arrow')?.durationSeconds).toBe(1)
    expect(next?.fxTracks.find((track) => track.name === 'Dragon Roar2')?.durationSeconds).toBe(8)
    expect(next?.fxTracks.find((track) => track.name === 'Arrow')?.tags).toEqual([
      'Combat',
      'Weapon',
      'Impact',
    ])
    expect(next?.fxTracks.find((track) => track.name === 'Dragon Roar2')?.tags).toEqual([
      'Creature',
      'Boss',
      'Impact',
    ])
  })

  it('updates stale bundled FX even when Free Tracks remapped their ids', () => {
    const bundled = createBundledFxTracks('2026-01-01T00:00:00.000Z')
    const demo = createDemoCampaignData(
      {
        fxTracks: bundled.map((track, index) => ({
          ...track,
          id: `fx-free-${index}`,
          durationSeconds: 3,
          tags: ['Combat'],
        })),
      },
      '2026-01-01T00:00:00.000Z',
    )
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...demo,
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.fxTracks.find((track) => track.name === 'Arrow')?.durationSeconds).toBe(1)
    expect(next?.fxTracks.find((track) => track.name === 'Owl Hooting')?.durationSeconds).toBe(4)
    expect(next?.fxTracks.find((track) => track.name === 'Arrow')?.tags).toEqual([
      'Combat',
      'Weapon',
      'Impact',
    ])
  })

  it('repairs legacy demo session names that baked Session 1 into the name', () => {
    const demo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...demo,
      sessions: demo.sessions.map((session) =>
        session.id === DEMO_SESSION_ID
          ? { ...session, name: 'Session 1 — The Ancient Gate' }
          : session,
      ),
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.sessions.find((session) => session.id === DEMO_SESSION_ID)?.name).toBe(
      DEMO_SESSION_NAME,
    )
  })

  it('repairs stale demo scene descriptions when the campaign is already configured', () => {
    const demo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...demo,
      scenes: demo.scenes.map((scene) => {
        if (scene.id === DEMO_SCENE_ID) {
          return {
            ...scene,
            description: 'All bundled soundscapes and soundboard effects, ready to play.',
          }
        }
        if (scene.id === DEMO_SCENE_BONFIRE_ID) {
          return {
            ...scene,
            description: 'A quieter camp scene with forest, bonfire, and rain ambience.',
          }
        }
        return scene
      }),
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.scenes.find((scene) => scene.id === DEMO_SCENE_ID)?.description).toBe(
      DEMO_SCENE_DESCRIPTION,
    )
    expect(next?.scenes.find((scene) => scene.id === DEMO_SCENE_BONFIRE_ID)?.description).toBe(
      DEMO_SCENE_BONFIRE_DESCRIPTION,
    )
  })
})
