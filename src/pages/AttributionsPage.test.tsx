import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { saveE2EControls } from '@/lib/campaignStorage'
import { DEFAULT_E2E_CONTROLS } from '@/types/campaign'
import { AttributionsPage } from '@/pages/AttributionsPage'

function renderAttributionsPage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <AttributionsPage />
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('AttributionsPage', () => {
  it('shows sound library and open-source sections when ready', () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    saveE2EControls({ ...DEFAULT_E2E_CONTROLS, attributionsState: 'ready' })
    renderAttributionsPage()

    expect(screen.getByRole('heading', { name: 'Attributions' })).toBeInTheDocument()
    expect(screen.getByText('Sound library attributions')).toBeInTheDocument()
    expect(screen.getByText('Open-source licenses')).toBeInTheDocument()
    expect(screen.getByText(/Bundled soundscapes and effects/i)).toBeInTheDocument()
    expect(screen.getByText(/Arcanum Audio is built with open-source software/i)).toBeInTheDocument()
  })

  it('shows skeleton placeholders while loading', () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    saveE2EControls({ ...DEFAULT_E2E_CONTROLS, attributionsState: 'loading' })
    renderAttributionsPage()

    expect(document.querySelector('[data-attributions-skeleton]')).toBeInTheDocument()
    expect(screen.queryByText(/Bundled soundscapes and effects/i)).not.toBeInTheDocument()
  })

  it('shows an error with retry and recovers to ready content', async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    saveE2EControls({ ...DEFAULT_E2E_CONTROLS, attributionsState: 'error' })
    const user = userEvent.setup()
    renderAttributionsPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load attributions.')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(screen.getByText(/Bundled soundscapes and effects/i)).toBeInTheDocument()
    expect(screen.getByText(/Arcanum Audio is built with open-source software/i)).toBeInTheDocument()
  })
})
