import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampaignCreateDialog } from './CampaignCreateDialog'

describe('CampaignCreateDialog', () => {
  it('requires a campaign name before creation', async () => {
    const onSubmit = vi.fn()
    render(
      <CampaignCreateDialog onOpenChange={vi.fn()} onSubmit={onSubmit} open />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/name is required/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits campaign details when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <CampaignCreateDialog onOpenChange={vi.fn()} onSubmit={onSubmit} open />,
    )

    await userEvent.type(screen.getByLabelText(/campaign name/i), 'Echoes of the Void')
    await userEvent.type(screen.getByLabelText(/description/i), 'Whispers from a shattered keep')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Echoes of the Void',
      description: 'Whispers from a shattered keep',
      coverArtUrl: undefined,
    })
  })
})
