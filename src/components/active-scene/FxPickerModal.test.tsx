import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FxPickerModal } from '@/components/active-scene/FxPickerModal'
import type { FxTrack } from '@/types/library'

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    },
  )
})

const tracks: FxTrack[] = [
  {
    id: 'fx-thunder',
    name: 'Thunder Crack',
    durationSeconds: 4,
    baseIntensity: 'II',
    type: 'IMPACT',
    tags: ['IMPACT'],
    audioUrl: '/audio/thunder.mp3',
    defaultVolume: 0.8,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'fx-wolf',
    name: 'Wolf Howl',
    durationSeconds: 3,
    baseIntensity: 'I',
    type: 'CREATURE',
    tags: ['CREATURE'],
    audioUrl: '/audio/wolf.mp3',
    defaultVolume: 0.7,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

vi.mock('@/lib/audioPreview', () => ({
  audioPreview: {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    isPlaying: vi.fn(() => false),
    getCurrentTrackId: vi.fn(() => null),
    subscribe: vi.fn((listener: (id: string | null, name: string | null, playing: boolean) => void) => {
      listener(null, null, false)
      return () => undefined
    }),
  },
}))

describe('FxPickerModal', () => {
  it('directs empty library users to Library — Sound Effects and hides Add Selected', () => {
    render(
      <FxPickerModal
        open
        onOpenChange={() => undefined}
        tracks={[]}
        excludedTrackIds={[]}
        onAddSelected={() => undefined}
      />,
    )

    expect(document.querySelector('[data-fx-picker-empty]')).toHaveTextContent(
      /Library.*Sound Effects/i,
    )
    expect(screen.queryByRole('button', { name: /Add Selected/ })).not.toBeInTheDocument()
  })

  it('hides Add Selected when every library FX is already on the soundboard', () => {
    render(
      <FxPickerModal
        open
        onOpenChange={() => undefined}
        tracks={tracks}
        excludedTrackIds={tracks.map((track) => track.id)}
        onAddSelected={() => undefined}
      />,
    )

    expect(document.querySelector('[data-fx-picker-all-on-board]')).toHaveTextContent(
      /already on this soundboard/i,
    )
    expect(screen.queryByRole('button', { name: /Add Selected/ })).not.toBeInTheDocument()
  })

  it('shows a single clear-filters action after a no-match search', async () => {
    const user = userEvent.setup()

    render(
      <FxPickerModal
        open
        onOpenChange={() => undefined}
        tracks={tracks}
        excludedTrackIds={[]}
        onAddSelected={() => undefined}
      />,
    )

    await user.type(screen.getByPlaceholderText('Search effects…'), 'nonexistent')

    expect(document.querySelector('[data-fx-no-match]')).toHaveTextContent(
      'No effects match your filters',
    )
    expect(document.querySelectorAll('[data-fx-picker-clear-filters]')).toHaveLength(1)

    await user.click(document.querySelector('[data-fx-picker-clear-filters]') as HTMLElement)
    expect(screen.getByText('Thunder Crack')).toBeInTheDocument()
  })

  it('enables Add Selected after checking effects', async () => {
    const user = userEvent.setup()
    const onAddSelected = vi.fn()

    render(
      <FxPickerModal
        open
        onOpenChange={() => undefined}
        tracks={tracks}
        excludedTrackIds={[]}
        onAddSelected={onAddSelected}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add Selected (0)' })
    expect(addButton).toBeDisabled()

    await user.click(document.querySelector('[data-fx-picker-check="fx-thunder"]') as HTMLElement)
    expect(screen.getByRole('button', { name: 'Add Selected (1)' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Add Selected (1)' }))
    expect(onAddSelected).toHaveBeenCalledWith(['fx-thunder'])
  })
})
