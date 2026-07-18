import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundboardTab } from '@/components/active-scene/SoundboardTab'
import type { ScenePlaybackState } from '@/lib/audio/sceneAudioManager'

const stopAll = vi.fn()
const setSoundboardMasterVolume = vi.fn()
const triggerSoundboard = vi.fn(async () => undefined)
const isSoundboardPlaying = vi.fn(() => false)
const reorderSoundboardEntries = vi.fn()

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
    reorderSoundboardEntries,
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

const reorderEntries = [
  entries[0],
  {
    id: 'entry-2',
    sceneId: 'scene-1',
    fxTrackId: 'fx-2',
    order: 1,
    track: {
      id: 'fx-2',
      name: 'Wolf Howl',
      tags: [],
      audioUrl: '/audio/wolf.ogg',
      durationSeconds: 2,
      baseIntensity: 'II' as const,
      type: 'COMBAT' as const,
      defaultVolume: 100,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'entry-3',
    sceneId: 'scene-1',
    fxTrackId: 'fx-3',
    order: 2,
    track: {
      id: 'fx-3',
      name: 'Door Creak',
      tags: [],
      audioUrl: '/audio/door.ogg',
      durationSeconds: 2,
      baseIntensity: 'I' as const,
      type: 'AMBIENT' as const,
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

  it('shows portaled tooltips for drag handle and remove', async () => {
    const user = userEvent.setup()
    render(
      <SoundboardTab
        sceneId="scene-1"
        entries={entries}
        onRemove={() => undefined}
        onAddSound={() => undefined}
      />,
    )

    const tile = document.querySelector('[data-soundboard-tile="Thunder Crack"]') as HTMLElement
    const dragHandle = within(tile).getByLabelText('Drag to reorder')
    await user.hover(dragHandle)
    let tooltip = await screen.findByRole('tooltip', { name: 'Drag to reorder' })
    expect(tooltip.parentElement).toBe(document.body)
    expect(tile.contains(tooltip)).toBe(false)
    await user.unhover(dragHandle)

    const removeButton = screen.getByRole('button', { name: 'Remove Thunder Crack' })
    await user.hover(removeButton)
    tooltip = await screen.findByRole('tooltip', { name: 'Remove Thunder Crack' })
    expect(tooltip.parentElement).toBe(document.body)
    expect(tile.contains(tooltip)).toBe(false)
  })
})

describe('SoundboardTab live drag reorder', () => {
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

  it('reorders tiles on dragover before drop (live)', () => {
    render(
      <SoundboardTab
        sceneId="scene-1"
        entries={reorderEntries}
        onRemove={() => undefined}
        onAddSound={() => undefined}
      />,
    )

    const handle = document.querySelector(
      '[data-soundboard-tile="Door Creak"] [data-drag-handle]',
    ) as HTMLElement
    const target = document.querySelector('[data-soundboard-tile="Thunder Crack"]') as HTMLElement
    const dataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: vi.fn(),
      getData: vi.fn(() => ''),
      setDragImage: vi.fn(),
    }

    fireEvent.dragStart(handle, { dataTransfer })
    fireEvent.dragOver(target, { dataTransfer, clientX: 0, clientY: 0 })

    expect(reorderSoundboardEntries).toHaveBeenCalledWith('scene-1', [
      'entry-3',
      'entry-1',
      'entry-2',
    ])
  })

  it('shows a floating tile preview while dragging', () => {
    render(
      <SoundboardTab
        sceneId="scene-1"
        entries={reorderEntries}
        onRemove={() => undefined}
        onAddSound={() => undefined}
      />,
    )

    const handle = document.querySelector(
      '[data-soundboard-tile="Thunder Crack"] [data-drag-handle]',
    ) as HTMLElement
    const dataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: vi.fn(),
      getData: vi.fn(() => ''),
      setDragImage: vi.fn(),
    }
    const dragStart = new Event('dragstart', { bubbles: true, cancelable: true })
    Object.defineProperty(dragStart, 'clientX', { value: 24 })
    Object.defineProperty(dragStart, 'clientY', { value: 32 })
    Object.defineProperty(dragStart, 'dataTransfer', { value: dataTransfer })
    fireEvent(handle, dragStart)

    expect(dataTransfer.setDragImage).toHaveBeenCalled()
    const preview = screen.getByTestId('drag-card-preview')
    expect(preview).toBeVisible()
    expect(preview.textContent).toMatch(/Thunder Crack/i)

    fireEvent.dragEnd(handle, { dataTransfer })
    expect(preview).not.toBeVisible()
  })
})
