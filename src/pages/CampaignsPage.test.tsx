import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'

function renderCampaignsPage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <ToastProvider>
          <CampaignsPage />
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('CampaignsPage', () => {
  it('shows empty state when there are no campaigns', () => {
    window.localStorage.clear()
    renderCampaignsPage()

    expect(screen.getByRole('heading', { name: 'Active Campaigns' })).toBeInTheDocument()
    expect(screen.getByText('No campaigns yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Campaign' })).toBeInTheDocument()
  })

  it('creates a campaign and shows it in the list', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderCampaignsPage()

    await user.click(screen.getByRole('button', { name: 'Create Campaign' }))
    await user.type(screen.getByLabelText('Campaign name'), 'The Shattered Throne')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('The Shattered Throne')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Campaign' })).toBeInTheDocument()
  })

  it('shows validation when campaign name is empty', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderCampaignsPage()

    await user.click(screen.getByRole('button', { name: 'Create Campaign' }))
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Campaign name is required')
  })

  it('edits a campaign description from the campaign card', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderCampaignsPage()

    await user.click(screen.getByRole('button', { name: 'Create Campaign' }))
    await user.type(screen.getByLabelText('Campaign name'), 'Demo Adventure')
    await user.type(screen.getByLabelText('Campaign description'), 'Old blurb')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await user.click(screen.getByRole('button', { name: 'Edit Demo Adventure' }))
    const editDialog = screen.getByRole('dialog', { name: 'Edit Campaign' })
    expect(editDialog).toBeInTheDocument()

    const description = within(editDialog).getByLabelText('Campaign description')
    await user.clear(description)
    await user.type(description, 'A ready-to-play sample campaign')
    await user.click(within(editDialog).getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit Campaign' })).not.toBeInTheDocument()
    })
    expect(
      document.querySelector('[data-campaign-description="Demo Adventure"]'),
    ).toHaveTextContent('A ready-to-play sample campaign')
  })
})
