import { describe, expect, it } from 'vitest'
import type { AppData } from '@/types/campaign'
import { EMPTY_APP_DATA } from '@/types/campaign'
import { ensureBundledAppSeed } from '@/lib/ensureBundledAppSeed'
import { createDemoCampaignData, DEMO_CAMPAIGN_ID, DEMO_SCENE_ID } from '@/lib/seedDemoCampaign'

describe('ensureBundledAppSeed', () => {
  it('seeds bundled library and demo campaign on empty app data', () => {
    const next = ensureBundledAppSeed({ ...EMPTY_APP_DATA }, '2026-01-01T00:00:00.000Z')

    expect(next?.campaigns.some((campaign) => campaign.id === DEMO_CAMPAIGN_ID)).toBe(true)
    expect(next?.soundscapeCategories.map((category) => category.name)).toEqual([
      'Forest',
      'Boss',
      'Combat',
      'Mystery',
    ])
    expect(next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_ID)).toHaveLength(4)
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

  it('repairs demo scene when the campaign exists without imported content', () => {
    const brokenDemo = createDemoCampaignData(undefined, '2026-01-01T00:00:00.000Z')
    const current: AppData = {
      ...EMPTY_APP_DATA,
      ...brokenDemo,
      sceneSoundscapeSlots: [],
      sceneSoundboardEntries: [],
    }

    const next = ensureBundledAppSeed(current, '2026-01-01T00:00:00.000Z')

    expect(next?.sceneSoundscapeSlots.filter((slot) => slot.sceneId === DEMO_SCENE_ID)).toHaveLength(4)
    expect(next?.sceneSoundboardEntries.filter((entry) => entry.sceneId === DEMO_SCENE_ID)).toHaveLength(15)
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
})
