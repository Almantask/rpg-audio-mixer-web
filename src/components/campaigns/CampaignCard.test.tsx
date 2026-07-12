import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CampaignCard } from './CampaignCard'
import type { CampaignWithSessionCount } from '@/lib/storage/types'

const baseCampaign: CampaignWithSessionCount = {
  id: 'campaign-1',
  name: 'The Shattered Throne',
  description: 'A long quest',
  lastPlayedAt: Date.now(),
  createdAt: Date.now(),
  sessionCount: 2,
}

function renderCard(campaign = baseCampaign, onDelete = vi.fn()) {
  return render(
    <MemoryRouter>
      <CampaignCard campaign={campaign} onDelete={onDelete} />
    </MemoryRouter>,
  )
}

describe('CampaignCard', () => {
  it('shows Resume when the campaign has sessions', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /resume the shattered throne/i })).toBeInTheDocument()
  })

  it('shows Start when the campaign has no sessions', () => {
    renderCard({ ...baseCampaign, sessionCount: 0 })
    expect(screen.getByRole('button', { name: /start the shattered throne/i })).toBeInTheDocument()
  })

  it('hides description when empty', () => {
    renderCard({ ...baseCampaign, description: undefined })
    expect(screen.queryByText('A long quest')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete is clicked', async () => {
    const onDelete = vi.fn()
    renderCard(baseCampaign, onDelete)
    await userEvent.click(screen.getByRole('button', { name: /delete the shattered throne/i }))
    expect(onDelete).toHaveBeenCalledWith(baseCampaign)
  })
})
