import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SceneCard } from './SceneCard'
import type { Scene } from '@/lib/storage/types'

const baseScene: Scene = {
  id: 'scene-1',
  name: 'Tavern',
  tags: ['Tavern'],
  soundscapeCategoryCount: 4,
  effectCount: 12,
  createdAt: Date.now(),
}

function renderCard(overrides?: Partial<Parameters<typeof SceneCard>[0]>) {
  const onDelete = vi.fn()
  const onDuplicate = vi.fn()
  const onEdit = vi.fn()
  render(
    <MemoryRouter>
      <SceneCard
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onEdit={onEdit}
        scene={baseScene}
        {...overrides}
      />
    </MemoryRouter>,
  )
  return { onDelete, onDuplicate, onEdit }
}

describe('SceneCard', () => {
  it('renders scene stats and tags', () => {
    renderCard()
    expect(screen.getByText('4 SC · 12 FX')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tavern' })).toBeInTheDocument()
  })

  it('shows Last Active badge when flagged', () => {
    renderCard({ isLastActive: true })
    expect(screen.getByTestId('last-active-badge')).toBeInTheDocument()
  })

  it('calls onEdit when edit is clicked', async () => {
    const { onEdit } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Edit Tavern' }))
    expect(onEdit).toHaveBeenCalledWith(baseScene)
  })

  it('has no play button', () => {
    renderCard()
    expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument()
  })
})
