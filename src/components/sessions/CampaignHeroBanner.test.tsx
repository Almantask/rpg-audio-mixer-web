import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampaignHeroBanner } from '@/components/sessions/SessionCard'

describe('CampaignHeroBanner', () => {
  it('shows the campaign description and an edit control', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <CampaignHeroBanner
        campaignName="Demo Adventure"
        description="A ready-to-play sample campaign"
        onEdit={onEdit}
      />,
    )

    expect(screen.getByText('A ready-to-play sample campaign')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit Demo Adventure' }))
    expect(onEdit).toHaveBeenCalled()
  })

  it('shows a clear add cover art control when no cover is set', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(<CampaignHeroBanner campaignName="Demo Adventure" onEdit={onEdit} />)

    const addCover = screen.getByRole('button', { name: 'Add cover art' })
    expect(addCover).toBeInTheDocument()
    await user.click(addCover)
    expect(onEdit).toHaveBeenCalled()
  })

  it('prompts to add a description when none exists', () => {
    render(<CampaignHeroBanner campaignName="Demo Adventure" onEdit={vi.fn()} />)

    expect(screen.getByText('Add a description')).toBeInTheDocument()
  })
})
