import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SessionCard } from './SessionCard'
import type { Session } from '@/lib/storage/types'

const session: Session = {
  id: 'session-1',
  campaignId: 'campaign-1',
  name: 'The Howling Crags',
  number: 14,
  date: '2026-03-12',
  sceneCount: 4,
  createdAt: Date.now(),
}

describe('SessionCard', () => {
  it('renders session number, name, metadata, and Last Active badge', () => {
    render(
      <MemoryRouter>
        <SessionCard
          isLastActive
          onDelete={vi.fn()}
          onEdit={vi.fn()}
          session={session}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Session 14')).toBeInTheDocument()
    expect(screen.getByText('The Howling Crags')).toBeInTheDocument()
    expect(screen.getByText(/Mar 12 · 4 Scenes/)).toBeInTheDocument()
    expect(screen.getByLabelText('Last Active session')).toHaveTextContent('Last Active')
  })
})
