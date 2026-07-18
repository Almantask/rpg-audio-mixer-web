import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EditCampaignDialog } from '@/components/campaigns/EditCampaignDialog'

describe('EditCampaignDialog', () => {
  it('prefills name, description, and cover art', () => {
    render(
      <EditCampaignDialog
        open
        campaignName="Demo Adventure"
        initialName="Demo Adventure"
        initialDescription="Sample campaign"
        initialCoverArtUrl="data:image/png;base64,abc"
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Edit Campaign' })).toBeInTheDocument()
    expect(screen.getByLabelText('Campaign name')).toHaveValue('Demo Adventure')
    expect(screen.getByLabelText('Campaign description')).toHaveValue('Sample campaign')
    expect(screen.getByRole('button', { name: 'Campaign cover art' }).querySelector('img')).toHaveAttribute(
      'src',
      'data:image/png;base64,abc',
    )
  })

  it('saves updated description and cover art', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <EditCampaignDialog
        open
        campaignName="Demo Adventure"
        initialName="Demo Adventure"
        initialDescription="Old description"
        onOpenChange={vi.fn()}
        onSave={onSave}
      />,
    )

    const description = screen.getByLabelText('Campaign description')
    await user.clear(description)
    await user.type(description, 'New description for the road')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({
      name: 'Demo Adventure',
      description: 'New description for the road',
      coverArtUrl: undefined,
    })
  })
})
