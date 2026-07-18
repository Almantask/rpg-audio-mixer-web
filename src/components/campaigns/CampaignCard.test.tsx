import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import type { Campaign } from '@/types/campaign'

const campaign: Campaign = {
  id: 'campaign-1',
  name: 'Demo Adventure',
  description: 'A ready-to-play sample campaign',
  coverArtUrl: 'https://example.com/demo.jpg',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastPlayedAt: '2026-01-01T00:00:00.000Z',
}

function renderCampaignCard(overrides: Partial<Campaign> = {}, sessionCount = 1) {
  return render(
    <MemoryRouter>
      <CampaignCard
        campaign={{ ...campaign, ...overrides }}
        sessionCount={sessionCount}
        onDelete={vi.fn()}
        onOpen={vi.fn()}
        onEdit={vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('CampaignCard hero surface', () => {
  it('renders as a cinematic hero card with cover art background', () => {
    renderCampaignCard()

    const card = document.querySelector('[data-campaign-card="Demo Adventure"]')
    expect(card?.className).toMatch(/border-gold\/25/)
    expect(document.querySelector('[data-hero-cover]')).toBeTruthy()
    expect(document.querySelector('[data-campaign-cover="Demo Adventure"]')).toBeTruthy()
  })

  it('falls back to a dark gradient when cover art is missing', () => {
    renderCampaignCard({ coverArtUrl: undefined })

    expect(document.querySelector('[data-hero-cover]')).toBeNull()
    expect(document.querySelector('[data-hero-fallback]')).toBeTruthy()
  })

  it('uses gold serif title and muted meta like the home hero', () => {
    renderCampaignCard()

    const title = screen.getByText('Demo Adventure')
    expect(title.className).toMatch(/font-serif/)
    expect(title.className).toMatch(/text-gold/)
    expect(screen.getByText('A ready-to-play sample campaign').className).toMatch(/text-muted/)
    expect(screen.getByText('1 session').className).toMatch(/uppercase/)
  })

  it('keeps edit, delete, and resume actions available', () => {
    renderCampaignCard()

    expect(screen.getByRole('button', { name: 'Edit Demo Adventure' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Demo Adventure' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
  })
})
