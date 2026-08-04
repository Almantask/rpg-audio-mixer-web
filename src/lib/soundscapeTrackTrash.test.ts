import { describe, expect, it } from 'vitest'
import type { SoundscapeCategory, SoundscapeTrack } from '@/types/library'
import {
  detachTrackFromCategories,
  findSoundscapeTrackUsage,
  getActiveSoundscapeTracks,
  getTrashedSoundscapeTracks,
  humanizeAudioFileName,
} from '@/lib/soundscapeTrackTrash'

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

describe('soundscapeTrackTrash helpers', () => {
  it('splits active and trashed soundscape tracks by deletedAt', () => {
    const tracks = [
      makeTrack({ id: 'a', name: 'Active' }),
      makeTrack({ id: 'b', name: 'Trashed', deletedAt: '2026-07-10T00:00:00.000Z' }),
    ]

    expect(getActiveSoundscapeTracks(tracks).map((t) => t.id)).toEqual(['a'])
    expect(getTrashedSoundscapeTracks(tracks).map((t) => t.id)).toEqual(['b'])
  })

  it('finds category usage across intensity levels', () => {
    const categories = [
      makeCategory({
        id: 'weather',
        name: 'Weather',
        levels: { I: ['t1'], II: [], III: [] },
      }),
      makeCategory({
        id: 'interior',
        name: 'Interior',
        levels: { I: [], II: ['t1'], III: [] },
      }),
      makeCategory({
        id: 'other',
        name: 'Other',
        levels: { I: ['t2'], II: [], III: [] },
      }),
    ]

    const usage = findSoundscapeTrackUsage('t1', categories)
    expect(usage.map((entry) => entry.categoryName)).toEqual(['Weather', 'Interior'])
    expect(usage[0]?.levels).toEqual(['I'])
    expect(usage[1]?.levels).toEqual(['II'])
  })

  it('flags playlist-as-level impact when track is a youtube playlist', () => {
    const track = makeTrack({
      id: 'pl1',
      name: 'YouTube Playlist (PL6789)',
      type: 'youtube-playlist',
    })
    const categories = [
      makeCategory({
        id: 'weather',
        name: 'Weather',
        levels: { I: ['pl1'], II: [], III: [] },
      }),
    ]

    const usage = findSoundscapeTrackUsage('pl1', categories, track)
    expect(usage[0]?.playlistOccupiesLevel).toBe(true)
  })

  it('detaches a track from all category levels and updates trackCount', () => {
    const categories = [
      makeCategory({
        id: 'weather',
        name: 'Weather',
        trackCount: 2,
        defaultTrackId: 't1',
        levels: { I: ['t1', 't2'], II: ['t1'], III: [] },
      }),
    ]

    const next = detachTrackFromCategories('t1', categories)
    expect(next[0]?.levels).toEqual({ I: ['t2'], II: [], III: [] })
    expect(next[0]?.trackCount).toBe(1)
    expect(next[0]?.defaultTrackId).toBeUndefined()
  })

  it('humanizes local audio filenames for display names', () => {
    expect(humanizeAudioFileName('thunderous_downpour.mp3')).toBe('Thunderous Downpour')
    expect(humanizeAudioFileName('forest-ambience.ogg')).toBe('Forest Ambience')
  })
})
