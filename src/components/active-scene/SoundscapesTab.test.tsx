import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundscapesTab } from '@/components/active-scene/SoundscapesTab'
import type { ScenePlaybackState, SoundscapeTileState } from '@/lib/audio/sceneAudioManager'

const playScene = vi.fn(async () => undefined)
const stopAll = vi.fn()
const setSoundscapeMasterVolume = vi.fn()
const setSoundscapeMuted = vi.fn()
const canPlaySoundscape = vi.fn(() => true)

function tile(partial: Partial<SoundscapeTileState> & Pick<SoundscapeTileState, 'slotId' | 'categoryName'>): SoundscapeTileState {
  return {
    playing: false,
    paused: false,
    progress: 0,
    intensity: 'II',
    volume: 100,
    hasLoadedTrack: false,
    ...partial,
  }
}

let playback: ScenePlaybackState = {
  soundboard: {},
  soundscapes: {},
  soundboardMasterVolume: 100,
  soundscapeMasterVolume: 100,
  soundscapeMuted: false,
}

vi.mock('@/context/SceneAudioContext', () => ({
  useSceneAudio: () => ({
    playback,
    playScene,
    stopAll,
    setSoundscapeMasterVolume,
    setSoundscapeMuted,
    getSoundscapeTileState: (slotId: string) => playback.soundscapes[slotId],
    playSoundscape: vi.fn(),
    pauseSoundscape: vi.fn(),
    rollSoundscapeRandom: vi.fn(),
    updateSlotVolume: vi.fn(),
    updateSlotIntensity: vi.fn(),
    canPlaySoundscape,
    setFocusedSoundscapeSlot: vi.fn(),
  }),
}))

vi.mock('@/context/CampaignDataContext', () => ({
  useCampaignData: () => ({
    reorderSoundscapeSlots: vi.fn(),
  }),
}))

const slots = [
  {
    id: 'slot-weather',
    sceneId: 'scene-1',
    categoryId: 'cat-weather',
    order: 0,
    intensity: 'II' as const,
    volume: 100,
    category: {
      id: 'cat-weather',
      name: 'Weather',
      trackCount: 2,
      type: 'WEATHER',
      levels: { I: ['t1'], II: ['t2'], III: [] },
    },
  },
  {
    id: 'slot-interior',
    sceneId: 'scene-1',
    categoryId: 'cat-interior',
    order: 1,
    intensity: 'II' as const,
    volume: 100,
    category: {
      id: 'cat-interior',
      name: 'Interior',
      trackCount: 2,
      type: 'TOWN',
      levels: { I: ['t3'], II: ['t4'], III: [] },
    },
  },
]

describe('SoundscapesTab Play/Stop Scene', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canPlaySoundscape.mockReturnValue(true)
    playback = {
      soundboard: {},
      soundscapes: {
        'slot-weather': tile({ slotId: 'slot-weather', categoryName: 'Weather' }),
        'slot-interior': tile({ slotId: 'slot-interior', categoryName: 'Interior' }),
      },
      soundboardMasterVolume: 100,
      soundscapeMasterVolume: 82,
      soundscapeMuted: false,
    }
  })

  it('shows Play Scene when no soundscapes are playing', () => {
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Play Scene' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Stop Scene' })).not.toBeInTheDocument()
  })

  it('calls playScene when Play Scene is pressed', async () => {
    const user = userEvent.setup()
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Play Scene' }))
    expect(playScene).toHaveBeenCalledTimes(1)
  })

  it('shows Stop Scene when all startable categories are playing', () => {
    playback.soundscapes['slot-weather'] = tile({
      slotId: 'slot-weather',
      categoryName: 'Weather',
      playing: true,
      progress: 0.2,
      trackName: 'Rain',
      currentTrackId: 't2',
      hasLoadedTrack: true,
    })
    playback.soundscapes['slot-interior'] = tile({
      slotId: 'slot-interior',
      categoryName: 'Interior',
      playing: true,
      progress: 0.1,
      trackName: 'Fire',
      currentTrackId: 't4',
      hasLoadedTrack: true,
    })

    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Stop Scene' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play Scene' })).not.toBeInTheDocument()
  })

  it('keeps Play Scene when some categories are still idle and startable', () => {
    playback.soundscapes['slot-weather'] = tile({
      slotId: 'slot-weather',
      categoryName: 'Weather',
      playing: true,
      progress: 0.2,
      trackName: 'Rain',
      currentTrackId: 't2',
      hasLoadedTrack: true,
    })

    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    expect(screen.getByRole('button', { name: 'Play Scene' })).toBeInTheDocument()
  })

  it('calls stopAll when Stop Scene is pressed', async () => {
    const user = userEvent.setup()
    playback.soundscapes['slot-weather'] = tile({
      slotId: 'slot-weather',
      categoryName: 'Weather',
      playing: true,
      progress: 0.2,
      trackName: 'Rain',
      currentTrackId: 't2',
      hasLoadedTrack: true,
    })
    playback.soundscapes['slot-interior'] = tile({
      slotId: 'slot-interior',
      categoryName: 'Interior',
      playing: true,
      progress: 0.1,
      trackName: 'Fire',
      currentTrackId: 't4',
      hasLoadedTrack: true,
    })

    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Stop Scene' }))
    expect(stopAll).toHaveBeenCalledTimes(1)
    expect(playScene).not.toHaveBeenCalled()
  })

  it('portals empty intensity tooltips outside the soundscape card', async () => {
    const user = userEvent.setup()
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    const emptyLevel = screen.getAllByRole('button', {
      name: '0 tracks. To have this level available add at least 1 track.',
    })[0]
    const card = emptyLevel.closest('[data-soundscape-category]')
    await user.hover(emptyLevel)

    const tooltip = await screen.findByRole('tooltip', {
      name: '0 tracks. To have this level available add at least 1 track.',
    })
    expect(tooltip.parentElement).toBe(document.body)
    expect(card?.contains(tooltip)).toBe(false)
  })
})
