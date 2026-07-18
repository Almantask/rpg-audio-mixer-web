import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FxCard } from '@/components/library/FxCard'
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

const track: FxTrack = {
  id: 'fx-dog',
  name: 'Dog Bark',
  type: 'ONESHOT',
  durationSeconds: 3,
  audioUrl: '/assets/audio/soundboard/dog_bark.ogg',
  tags: ['Creature'],
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('FxCard tags', () => {
  it('prefills the Tags field with existing comma-separated tags when editing', async () => {
    const user = userEvent.setup()
    render(<FxCard track={track} onUpdate={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Edit Dog Bark' }))

    expect(screen.getByLabelText('FX tag')).toHaveValue('Creature')
  })

  it('saves multiple comma-separated tags and shows them on the card', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const { rerender } = render(<FxCard track={track} onUpdate={onUpdate} />)

    await user.click(screen.getByRole('button', { name: 'Edit Dog Bark' }))
    const input = screen.getByLabelText('FX tag')
    await user.clear(input)
    await user.type(input, 'Creature, Combat, Magic')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onUpdate).toHaveBeenCalledWith({
      name: 'Dog Bark',
      tags: ['Creature', 'Combat', 'Magic'],
    })

    rerender(
      <FxCard
        track={{ ...track, tags: ['Creature', 'Combat', 'Magic'] }}
        onUpdate={onUpdate}
      />,
    )

    expect(screen.getByRole('button', { name: 'Edit Dog Bark' }).closest('[data-fx-card]')).toHaveAttribute(
      'data-fx-card',
      'Dog Bark',
    )
    const card = screen.getByRole('button', { name: 'Edit Dog Bark' }).closest('[data-fx-card]')!
    expect(card.querySelector('[data-fx-tag="Creature"]')).toBeTruthy()
    expect(card.querySelector('[data-fx-tag="Combat"]')).toBeTruthy()
    expect(card.querySelector('[data-fx-tag="Magic"]')).toBeTruthy()
  })
})
