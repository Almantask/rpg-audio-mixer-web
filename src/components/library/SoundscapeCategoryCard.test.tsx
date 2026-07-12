import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SoundscapeCategoryCard } from './SoundscapeCategoryCard'
import type { SoundscapeCategoryWithCounts } from '@/lib/storage/types'

const category: SoundscapeCategoryWithCounts = {
  id: 'cat-1',
  name: 'Weather',
  levelICount: 3,
  levelIICount: 5,
  levelIIICount: 2,
  createdAt: Date.now(),
}

describe('SoundscapeCategoryCard', () => {
  it('renders intensity breakdown', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard
          category={category}
          onDelete={vi.fn()}
          onPreview={vi.fn()}
          onStopPreview={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('I: 3 · II: 5 · III: 2')).toBeInTheDocument()
  })

  it('shows playing state when previewing', () => {
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard
          category={category}
          isPreviewing
          onDelete={vi.fn()}
          onPreview={vi.fn()}
          onStopPreview={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('● PLAYING')).toBeInTheDocument()
  })

  it('calls onPreview when preview button is clicked', async () => {
    const onPreview = vi.fn()
    render(
      <MemoryRouter>
        <SoundscapeCategoryCard
          category={category}
          onDelete={vi.fn()}
          onPreview={onPreview}
          onStopPreview={vi.fn()}
        />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Preview Weather' }))
    expect(onPreview).toHaveBeenCalledWith(category)
  })
})
