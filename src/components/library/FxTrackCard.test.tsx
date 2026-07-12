import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FxTrackCard } from './FxTrackCard'
import type { FxTrack } from '@/lib/storage/types'

const track: FxTrack = {
  id: 'fx-1',
  name: 'Thunder Crack',
  duration: '0:04',
  baseIntensity: 2,
  fxType: 'IMPACT',
  tags: ['Impact'],
  defaultVolume: 100,
  createdAt: Date.now(),
}

describe('FxTrackCard', () => {
  it('renders title and metadata', () => {
    render(
      <FxTrackCard
        onDelete={vi.fn()}
        onPreview={vi.fn()}
        onSave={vi.fn()}
        onStopPreview={vi.fn()}
        track={track}
      />,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Thunder Crack' })).toBeInTheDocument()
    expect(screen.getByText('0:04 · II')).toBeInTheDocument()
  })

  it('shows playing state when previewing', () => {
    render(
      <FxTrackCard
        isPreviewing
        onDelete={vi.fn()}
        onPreview={vi.fn()}
        onSave={vi.fn()}
        onStopPreview={vi.fn()}
        track={track}
      />,
    )
    expect(screen.getByText('● PLAYING')).toBeInTheDocument()
  })

  it('calls onPreview when card body is clicked', async () => {
    const onPreview = vi.fn()
    render(
      <FxTrackCard
        onDelete={vi.fn()}
        onPreview={onPreview}
        onSave={vi.fn()}
        onStopPreview={vi.fn()}
        track={track}
      />,
    )
    await userEvent.click(screen.getByTestId('fx-track-body'))
    expect(onPreview).toHaveBeenCalledWith(track)
  })
})
