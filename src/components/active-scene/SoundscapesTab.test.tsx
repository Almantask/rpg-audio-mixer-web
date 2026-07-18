import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundscapesTab } from '@/components/active-scene/SoundscapesTab'
import type { ScenePlaybackState, SoundscapeTileState } from '@/lib/audio/sceneAudioManager'

const playScene = vi.fn(async () => undefined)
const stopAll = vi.fn()
const setSoundscapeMasterVolume = vi.fn()
const setSoundscapeMuted = vi.fn()
const canPlaySoundscape = vi.fn(() => true)
const reorderSoundscapeSlots = vi.fn()

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
    reorderSoundscapeSlots,
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

const reorderSlots = [
  ...slots,
  {
    id: 'slot-monsters',
    sceneId: 'scene-1',
    categoryId: 'cat-monsters',
    order: 2,
    intensity: 'II' as const,
    volume: 100,
    category: {
      id: 'cat-monsters',
      name: 'Monsters',
      trackCount: 1,
      type: 'COMBAT',
      levels: { I: [], II: ['t5'], III: [] },
    },
  },
]

function dragHandleFor(categoryName: string) {
  const card = document.querySelector(`[data-soundscape-category="${categoryName}"]`)
  const handle = card?.querySelector('[data-drag-handle]')
  if (!handle) {
    throw new Error(`Drag handle not found for ${categoryName}`)
  }
  return handle as HTMLElement
}

function cardFor(categoryName: string) {
  const card = document.querySelector(`[data-soundscape-category="${categoryName}"]`)
  if (!card) {
    throw new Error(`Card not found for ${categoryName}`)
  }
  return card as HTMLElement
}

function mockDataTransfer() {
  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData: vi.fn(),
    getData: vi.fn(() => ''),
    setDragImage: vi.fn(),
  }
}

function simulateDragOver(sourceCategory: string, targetCategory: string, clientY = 0) {
  const handle = dragHandleFor(sourceCategory)
  const target = cardFor(targetCategory)
  const dataTransfer = mockDataTransfer()
  fireEvent.dragStart(handle, { dataTransfer })
  fireEvent.dragOver(target, { dataTransfer, clientX: clientY === 0 ? 0 : 80, clientY })
}

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

  it('shows portaled tooltips for drag handle and card actions', async () => {
    const user = userEvent.setup()
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    const card = cardFor('Weather')
    const dragHandle = within(card).getByLabelText('Drag to reorder')
    await user.hover(dragHandle)
    let tooltip = await screen.findByRole('tooltip', { name: 'Drag to reorder' })
    expect(tooltip.parentElement).toBe(document.body)
    expect(card.contains(tooltip)).toBe(false)
    await user.unhover(dragHandle)

    const actions = [
      'Roll random track for Weather',
      'Play Weather',
      'Remove Weather',
    ] as const

    for (const label of actions) {
      const button = screen.getByRole('button', { name: label })
      await user.hover(button)
      tooltip = await screen.findByRole('tooltip', { name: label })
      expect(tooltip.parentElement).toBe(document.body)
      expect(card.contains(tooltip)).toBe(false)
      await user.unhover(button)
    }
  })
})

describe('SoundscapesTab category grid', () => {
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
      soundscapeMasterVolume: 100,
      soundscapeMuted: false,
    }
  })

  it('lays out category cards in a responsive two-column grid', () => {
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={slots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    const list = document.querySelector('[data-soundscape-category-list]')
    expect(list).toHaveClass(
      'grid',
      'min-w-0',
      'grid-cols-1',
      'gap-4',
      'sm:grid-cols-2',
      'md:grid-cols-3',
    )
  })
})

describe('SoundscapesTab live drag reorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canPlaySoundscape.mockReturnValue(true)
    playback = {
      soundboard: {},
      soundscapes: {
        'slot-weather': tile({ slotId: 'slot-weather', categoryName: 'Weather' }),
        'slot-interior': tile({ slotId: 'slot-interior', categoryName: 'Interior' }),
        'slot-monsters': tile({ slotId: 'slot-monsters', categoryName: 'Monsters' }),
      },
      soundboardMasterVolume: 100,
      soundscapeMasterVolume: 82,
      soundscapeMuted: false,
    }
  })

  it('reorders on dragover before drop (live)', () => {
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={reorderSlots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    simulateDragOver('Monsters', 'Weather')

    expect(reorderSoundscapeSlots).toHaveBeenCalledWith('scene-1', [
      'slot-monsters',
      'slot-weather',
      'slot-interior',
    ])
  })

  it('allows dragging back mid-drag (bidirectional live reorder)', () => {
    const { rerender } = render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={reorderSlots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    const handle = dragHandleFor('Weather')
    const dataTransfer = mockDataTransfer()
    fireEvent.dragStart(handle, { dataTransfer })

    fireEvent.dragOver(cardFor('Monsters'), { dataTransfer, clientX: 0, clientY: 0 })
    expect(reorderSoundscapeSlots).toHaveBeenLastCalledWith('scene-1', [
      'slot-interior',
      'slot-monsters',
      'slot-weather',
    ])

    const reorderedSlots = [
      { ...reorderSlots[1], order: 0 },
      { ...reorderSlots[2], order: 1 },
      { ...reorderSlots[0], order: 2 },
    ]
    rerender(
      <SoundscapesTab
        sceneId="scene-1"
        slots={reorderedSlots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    fireEvent.dragOver(cardFor('Interior'), { dataTransfer, clientX: 0, clientY: 0 })
    expect(reorderSoundscapeSlots).toHaveBeenLastCalledWith('scene-1', [
      'slot-weather',
      'slot-interior',
      'slot-monsters',
    ])
  })

  it('does not reorder while Session Lock is on', () => {
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={reorderSlots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
        locked
      />,
    )

    simulateDragOver('Monsters', 'Weather')
    expect(reorderSoundscapeSlots).not.toHaveBeenCalled()
  })

  it('shows a floating card preview that follows the pointer while dragging', () => {
    render(
      <SoundscapesTab
        sceneId="scene-1"
        slots={reorderSlots}
        onRemoveSlot={() => undefined}
        onAddSoundscape={() => undefined}
      />,
    )

    const handle = dragHandleFor('Weather')
    const dataTransfer = mockDataTransfer()
    const dragStart = new Event('dragstart', { bubbles: true, cancelable: true })
    Object.defineProperty(dragStart, 'clientX', { value: 48 })
    Object.defineProperty(dragStart, 'clientY', { value: 64 })
    Object.defineProperty(dragStart, 'dataTransfer', { value: dataTransfer })
    fireEvent(handle, dragStart)

    expect(dataTransfer.setDragImage).toHaveBeenCalled()
    const preview = screen.getByTestId('drag-card-preview')
    expect(preview).toBeVisible()
    expect(preview.textContent).toMatch(/Weather/i)

    const dragMove = new Event('drag', { bubbles: true, cancelable: true })
    Object.defineProperty(dragMove, 'clientX', { value: 120 })
    Object.defineProperty(dragMove, 'clientY', { value: 220 })
    fireEvent(handle, dragMove)
    expect(preview.style.transform).toContain('translate3d(')

    fireEvent.dragEnd(handle, { dataTransfer })
    expect(preview).not.toBeVisible()
  })
})
