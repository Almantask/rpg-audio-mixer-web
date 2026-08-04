import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { CampaignDataProvider, useCampaignData } from '@/context/CampaignDataContext'
import type { AppData } from '@/types/campaign'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'

function emptyAppData(overrides: Partial<AppData> = {}): AppData {
  return {
    campaigns: [],
    sessions: [],
    lastActiveSessionByCampaign: {},
    scenes: [],
    sessionSceneLinks: [],
    sceneSoundboardEntries: [],
    sceneSoundscapeSlots: [],
    sceneSoundboardSettings: [],
    sceneSoundscapeSettings: [],
    fxTracks: [],
    soundscapeCategories: [],
    soundscapeTracks: [],
    lastActiveSceneBySession: {},
    playStats: { soundscapeCategories: {}, fxTracks: {} },
    ...overrides,
  }
}

function makeTrack(
  partial: Partial<SoundscapeTrack> & Pick<SoundscapeTrack, 'id' | 'name'>,
): SoundscapeTrack {
  return {
    durationSeconds: 80,
    format: 'MP3',
    channels: 'Stereo',
    audioUrl: `/audio/${partial.id}.mp3`,
    createdAt: '2026-07-01T00:00:00.000Z',
    type: 'local',
    ...partial,
  }
}

function makeCategory(
  partial: Partial<SoundscapeCategory> & Pick<SoundscapeCategory, 'id' | 'name'>,
): SoundscapeCategory {
  return {
    trackCount: 0,
    createdAt: '2026-07-01T00:00:00.000Z',
    levels: { I: [], II: [], III: [] },
    ...partial,
  }
}

function seed(overrides: Partial<AppData> = {}) {
  window.localStorage.setItem('arcanum-audio-data', JSON.stringify(emptyAppData(overrides)))
}

function wrapper({ children }: { children: ReactNode }) {
  return <CampaignDataProvider>{children}</CampaignDataProvider>
}

describe('CampaignDataContext soundscape track trash', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      configurable: true,
      value: () => 'blob:test-soundscape-track',
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      configurable: true,
      value: () => undefined,
    })
  })

  it('soft-deletes an unused track by setting deletedAt', () => {
    seed({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
    })

    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      result.current.softDeleteSoundscapeTrack('t1')
    })

    const track = result.current.data.soundscapeTracks.find((item) => item.id === 't1')
    expect(track?.deletedAt).toBeTruthy()
    expect(result.current.activeSoundscapeTracks.map((item) => item.id)).toEqual([])
  })

  it('detaches the track from all category levels then soft-deletes', () => {
    seed({
      soundscapeTracks: [makeTrack({ id: 't1', name: 'Thunderous Downpour' })],
      soundscapeCategories: [
        makeCategory({
          id: 'weather',
          name: 'Weather',
          trackCount: 1,
          levels: { I: ['t1'], II: [], III: [] },
        }),
        makeCategory({
          id: 'interior',
          name: 'Interior',
          trackCount: 1,
          levels: { I: [], II: ['t1'], III: [] },
        }),
      ],
    })

    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      result.current.softDeleteSoundscapeTrack('t1')
    })

    const weather = result.current.data.soundscapeCategories.find((c) => c.id === 'weather')
    const interior = result.current.data.soundscapeCategories.find((c) => c.id === 'interior')
    expect(weather?.levels).toEqual({ I: [], II: [], III: [] })
    expect(weather?.trackCount).toBe(0)
    expect(interior?.levels).toEqual({ I: [], II: [], III: [] })
    expect(result.current.data.soundscapeTracks.find((t) => t.id === 't1')?.deletedAt).toBeTruthy()
    expect(weather).toBeTruthy()
  })

  it('restores a soft-deleted track without re-attaching to categories', () => {
    seed({
      soundscapeTracks: [
        makeTrack({
          id: 't1',
          name: 'Thunderous Downpour',
          deletedAt: '2026-07-10T00:00:00.000Z',
        }),
      ],
      soundscapeCategories: [
        makeCategory({
          id: 'weather',
          name: 'Weather',
          trackCount: 0,
          levels: { I: [], II: [], III: [] },
        }),
      ],
    })

    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      result.current.restoreSoundscapeTrack('t1')
    })

    const track = result.current.data.soundscapeTracks.find((item) => item.id === 't1')
    expect(track?.deletedAt).toBeUndefined()
    expect(result.current.activeSoundscapeTracks.map((item) => item.id)).toEqual(['t1'])
    expect(
      result.current.data.soundscapeCategories.find((c) => c.id === 'weather')?.levels?.I,
    ).toEqual([])
  })

  it('purges a soft-deleted track permanently', () => {
    seed({
      soundscapeTracks: [
        makeTrack({
          id: 't1',
          name: 'Thunderous Downpour',
          deletedAt: '2026-07-10T00:00:00.000Z',
        }),
      ],
    })

    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      result.current.purgeSoundscapeTrack('t1')
    })

    expect(result.current.data.soundscapeTracks.find((item) => item.id === 't1')).toBeUndefined()
  })

  it('bulk restores and purges trashed tracks via trash tab helpers', () => {
    seed({
      soundscapeTracks: [
        makeTrack({
          id: 't1',
          name: 'Thunderous Downpour',
          deletedAt: '2026-07-10T00:00:00.000Z',
        }),
        makeTrack({
          id: 't2',
          name: 'Forest Ambience',
          deletedAt: '2026-07-11T00:00:00.000Z',
        }),
      ],
    })

    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      const restoreResult = result.current.restoreTrashItems('tracks', ['t1', 't2'])
      expect(restoreResult.succeeded).toEqual(['t1', 't2'])
    })

    expect(result.current.activeSoundscapeTracks.map((t) => t.id).sort()).toEqual(['t1', 't2'])

    act(() => {
      result.current.softDeleteSoundscapeTrack('t1')
    })
    act(() => {
      result.current.softDeleteSoundscapeTrack('t2')
    })

    expect(
      result.current.data.soundscapeTracks.every((track) => Boolean(track.deletedAt)),
    ).toBe(true)

    let purgeResult!: { succeeded: string[]; failed: { id: string; reason: string }[] }
    act(() => {
      purgeResult = result.current.purgeTrashItems('tracks', ['t1', 't2'])
    })
    expect(purgeResult, JSON.stringify(purgeResult)).toEqual({
      succeeded: ['t1', 't2'],
      failed: [],
    })

    expect(result.current.data.soundscapeTracks).toEqual([])
  })

  it('humanizes imported local track names', () => {
    seed()
    const { result } = renderHook(() => useCampaignData(), { wrapper })

    act(() => {
      result.current.importSoundscapeTrack(
        new File(['audio'], 'thunderous_downpour.mp3', { type: 'audio/mpeg' }),
      )
    })

    expect(result.current.activeSoundscapeTracks[0]?.name).toBe('Thunderous Downpour')
  })
})
