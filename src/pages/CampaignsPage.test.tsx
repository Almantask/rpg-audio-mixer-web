import { render, screen } from '@testing-library/react'
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
})
