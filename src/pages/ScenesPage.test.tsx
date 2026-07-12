import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ScenesPage } from '@/pages/ScenesPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'

function renderScenesPage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <ToastProvider>
          <ScenesPage />
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('ScenesPage', () => {
  it('shows empty state when there are no scenes', () => {
    window.localStorage.clear()
    renderScenesPage()

    expect(screen.getByRole('heading', { name: 'Scenes' })).toBeInTheDocument()
    expect(screen.getByText('No scenes yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Scene' })).toBeInTheDocument()
  })

  it('creates a scene and keeps the user on the scenes list', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderScenesPage()

    await user.click(screen.getByRole('button', { name: 'New Scene' }))
    await user.type(screen.getByLabelText('Scene name'), 'Tavern')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByText('Tavern')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Scenes' })).toBeInTheDocument()
  })

  it('shows no scenes match message when search has no results', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderScenesPage()

    await user.click(screen.getByRole('button', { name: 'New Scene' }))
    await user.type(screen.getByLabelText('Scene name'), 'Tavern')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await user.type(screen.getByLabelText('Search scenes'), 'Missing')
    expect(screen.getByText('No scenes match')).toBeInTheDocument()
  })
})
