import { describe, expect, it } from 'vitest'
import {
  buildExpandedSoundscapePool,
  computeSoundboardGain,
  computeSoundscapeGain,
  defaultIntensityForCategoryLevels,
  pickExpandedSoundscapeEntry,
  pickRandomTrackId,
  resolveConfiguredTrackId,
  resolvePlaySceneSlotAction,
  resolveSceneIntensityForYoutube,
} from './sceneAudioManager'

describe('sceneAudioManager helpers', () => {
  it('computes soundboard gain from master volume using cubic mapping', () => {
    expect(computeSoundboardGain(100)).toBe(1)
    expect(computeSoundboardGain(50)).toBeCloseTo(0.125, 5)
    expect(computeSoundboardGain(0)).toBe(0)
  })

  it('computes soundscape gain from master, slot volume, mute, and optional multiplier', () => {
    expect(computeSoundscapeGain(100, 100, false, 1)).toBe(1)
    expect(computeSoundscapeGain(100, 100, true, 1)).toBe(0)
    expect(computeSoundscapeGain(100, 100, false, 0.4)).toBeCloseTo(0.4, 5)
    expect(computeSoundscapeGain(50, 50, false, 1)).toBeCloseTo(0.015625, 5)
  })

  it('picks a random track from the pool', () => {
    const pool = ['a', 'b', 'c']
    const picked = pickRandomTrackId(pool)
    expect(pool).toContain(picked)
  })

  it('returns undefined when pool is empty', () => {
    expect(pickRandomTrackId([])).toBeUndefined()
  })

  it('resolves play scene slot actions', () => {
    expect(
      resolvePlaySceneSlotAction({ playing: true, paused: false, trackIds: ['a'] }),
    ).toBe('skip-playing')
    expect(
      resolvePlaySceneSlotAction({ playing: false, paused: false, trackIds: [] }),
    ).toBe('skip-empty')
    expect(
      resolvePlaySceneSlotAction({ playing: false, paused: true, trackIds: ['a'] }),
    ).toBe('resume')
    expect(
      resolvePlaySceneSlotAction({ playing: false, paused: false, trackIds: ['a'] }),
    ).toBe('start')
  })

  it('preserves runtime currentTrackId when reconfigure omits it', () => {
    expect(
      resolveConfiguredTrackId({
        incomingTrackId: undefined,
        existingTrackId: 'yt-playlist',
        trackIds: ['yt-playlist'],
      }),
    ).toBe('yt-playlist')
    expect(
      resolveConfiguredTrackId({
        incomingTrackId: undefined,
        existingTrackId: 'yt-playlist',
        trackIds: ['other'],
      }),
    ).toBeUndefined()
    expect(
      resolveConfiguredTrackId({
        incomingTrackId: 'fresh',
        existingTrackId: 'yt-playlist',
        trackIds: ['fresh', 'yt-playlist'],
      }),
    ).toBe('fresh')
  })

  it('expands YouTube playlist videos into the shared intensity pool', () => {
    const picks = buildExpandedSoundscapePool(
      ['local-1', 'yt-pl'],
      {
        'local-1': {
          id: 'local-1',
          name: 'Rain',
          audioUrl: '/rain.ogg',
          durationSeconds: 60,
        },
        'yt-pl': {
          id: 'yt-pl',
          name: 'YouTube Playlist (PL6789)',
          audioUrl: 'https://youtube.com/playlist?list=PL6789',
          durationSeconds: 540,
          type: 'youtube-playlist',
          playlistVideos: [
            { youtubeId: 'a', name: 'Playlist Video A (PL678)', durationSeconds: 180 },
            { youtubeId: 'b', name: 'Playlist Video B (PL678)', durationSeconds: 120 },
            { youtubeId: 'c', name: 'Playlist Video C (PL678)', durationSeconds: 240 },
          ],
        },
      },
    )
    expect(picks).toHaveLength(4)
    expect(picks.filter((pick) => pick.kind === 'playlist-video')).toHaveLength(3)
    expect(pickExpandedSoundscapeEntry(picks)).toBeTruthy()
  })

  it('defaults intensity to the first non-empty level', () => {
    expect(defaultIntensityForCategoryLevels({ I: ['a'], II: ['b'], III: [] })).toBe('I')
    expect(defaultIntensityForCategoryLevels({ I: [], II: ['b'], III: [] })).toBe('II')
    expect(defaultIntensityForCategoryLevels({ I: [], II: [], III: [] })).toBe('II')
  })

  it('realigns default intensity II to I when only Level I has YouTube content', () => {
    const tracksById = {
      local: {
        id: 'local',
        name: 'Rain',
        audioUrl: '/rain.ogg',
        durationSeconds: 60,
      },
      yt: {
        id: 'yt',
        name: 'YouTube Playlist (PL6789)',
        audioUrl: 'https://youtube.com/playlist?list=PL6789',
        durationSeconds: 180,
        type: 'youtube-playlist' as const,
        playlistVideos: [{ youtubeId: 'a', name: 'A', durationSeconds: 180 }],
      },
    }
    expect(
      resolveSceneIntensityForYoutube('II', { I: ['yt'], II: ['local'], III: [] }, tracksById),
    ).toBe('I')
    expect(
      resolveSceneIntensityForYoutube('II', { I: ['yt'], II: ['yt'], III: [] }, tracksById),
    ).toBe('II')
    expect(
      resolveSceneIntensityForYoutube('III', { I: ['yt'], II: ['local'], III: [] }, tracksById),
    ).toBe('III')
  })
})
