import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundboardTab } from '@/components/active-scene/SoundboardTab'
import type { ScenePlaybackState } from '@/lib/audio/sceneAudioManager'

const stopAll = vi.fn()
const setSoundboardMasterVolume = vi.fn()
const triggerSoundboard = vi.fn(async () => undefined)
const isSoundboardPlaying = vi.fn(() => false)

let playback: ScenePlaybackState = {
  soundboard: {},
  soundscapes: {},
  soundboardMasterVolume: 85,
  soundscapeMasterVolume: 100,
  soundscapeMuted: false,
}

vi.mock('@/context/SceneAudioContext', () => ({
  useSceneAudio: () => ({
    playback,
    stopAll,
    setSoundboardMasterVolume,
    triggerSoundboard,
    isSoundboardPlaying,
  }),
}))

vi.mock('@/context/CampaignDataContext', () => ({
  useCampaignData: () => ({
    reorderSoundboardEntries: vi.fn(),
  }),
}))

const entries = [
  {
    id: 'entry-1',
    sceneId: 'scene-1',
    fxTrackId: 'fx-1',
    order: 0,
    track: {
      id: 'fx-1',
      name: 'Thunder Crack',
      tags: [],
      audioUrl: '/audio/thunder.ogg',
      durationSeconds: 2,
      baseIntensity: 'II' as const,
      type: 'COMBAT' as const,
      defaultVolume: 100,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
]

describe('SoundboardTab master controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    playback = {
      soundboard: {},
      soundscapes: {},
      soundboardMasterVolume: 85,
      soundscapeMasterVolume: 100,
      soundscapeMuted: false,
    }
  })

  it('places Stop All to the left of the Soundboard Master volume slider', () => {
    render(
      <SoundboardTab
        sceneId="scene-1"
        entries={entries}
        onRemove={() => undefined}
        onAddSound={() => undefined}
      />,
    )

    const masterCard = screen.getByText('Soundboard Master').closest('div')
    expect(masterCard).toBeTruthy()
    const row = within(masterCard as HTMLElement).getByRole('button', { name: 'Stop All' }).parentElement
    expect(row).toBeTruthy()

    const stopAllButton = within(row as HTMLElement).getByRole('button', { name: 'Stop All' })
    const slider = within(row as HTMLElement).getByLabelText('Soundboard Master volume')
    expect(stopAllButton.compareDocumentPosition(slider) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(row as HTMLElement).queryByText('🔊')).not.toBeInTheDocument()
  })

  it('calls stopAll when Stop All is pressed', async () => {
    const user = userEvent.setup()
    render(
      <SoundboardTab
        sceneId="scene-1"
        entries={entries}
        onRemove={() => undefined}
        onAddSound={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Stop All' }))
    expect(stopAll).toHaveBeenCalledTimes(1)
  })
})
