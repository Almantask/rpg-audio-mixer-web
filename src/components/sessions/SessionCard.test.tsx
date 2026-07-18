import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SessionCard } from '@/components/sessions/SessionCard'
import type { Session } from '@/types/campaign'

const session: Session = {
  id: 'session-1',
  campaignId: 'campaign-1',
  name: 'The Ancient Gate',
  number: 1,
  date: '2026-03-12',
  sceneCount: 4,
  description: 'Party approaches the gate.',
  coverArtUrl: 'https://example.com/session.jpg',
}

function renderSessionCard(overrides: Partial<Session> = {}, showLastActive = false) {
  return render(
    <MemoryRouter>
      <SessionCard
        session={{ ...session, ...overrides }}
        campaignId="campaign-1"
        showLastActive={showLastActive}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onOpen={vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('SessionCard hero surface', () => {
  it('renders as a cinematic hero card with cover art background', () => {
    renderSessionCard()

    const card = document.querySelector('[data-session-card="Session 1"]')
    expect(card?.className).toMatch(/border-gold\/25/)
    expect(document.querySelector('[data-hero-cover]')).toBeTruthy()
  })

  it('falls back to a dark gradient when cover art is missing', () => {
    renderSessionCard({ coverArtUrl: undefined })

    expect(document.querySelector('[data-hero-cover]')).toBeNull()
    expect(document.querySelector('[data-hero-fallback]')).toBeTruthy()
  })

  it('uses gold serif session title and muted metadata', () => {
    renderSessionCard()

    const title = screen.getByText('The Ancient Gate')
    expect(title.className).toMatch(/font-serif/)
    expect(title.className).toMatch(/text-gold/)
    expect(screen.getByText('Session 1').className).toMatch(/uppercase/)
    expect(screen.getByText(/4 Scenes/i).className).toMatch(/text-muted/)
  })

  it('keeps edit and delete actions available', () => {
    renderSessionCard()

    expect(screen.getByRole('button', { name: 'Edit Session 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Session 1' })).toBeInTheDocument()
  })
})
