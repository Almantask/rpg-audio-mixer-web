import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LibraryPage } from '@/pages/LibraryPage'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { ToastProvider } from '@/components/shared/ToastProvider'

function renderLibraryPage(initialEntry = '/library?tab=fx') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CampaignDataProvider>
        <ToastProvider>
          <LibraryPage />
        </ToastProvider>
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('shows the Library heading without a page subtitle', () => {
    window.localStorage.clear()
    renderLibraryPage()

    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument()
    expect(
      screen.queryByText('Browse soundscapes and sound effects.'),
    ).not.toBeInTheDocument()
  })

  it('shows Sound Effects tab actions without a browse subtitle', () => {
    window.localStorage.clear()
    renderLibraryPage('/library?tab=fx')

    expect(screen.getByRole('tab', { name: 'Sound Effects' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.queryByText('Browse, import, and manage your sound effects.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import FX' })).toBeInTheDocument()
  })

  it('shows Soundscapes tab actions without a browse subtitle', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderLibraryPage('/library?tab=fx')

    await user.click(screen.getByRole('tab', { name: 'Soundscapes' }))

    expect(
      screen.queryByText('Browse and manage your soundscape categories.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy Composition' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Free Compositions' })).toBeInTheDocument()
  })

  it('shows Soundscapes tab without Category Type or Sort Order sidebar filters', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    renderLibraryPage('/library?tab=fx')

    await user.click(screen.getByRole('tab', { name: 'Soundscapes' }))

    expect(screen.queryByLabelText('Category Type')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sort Order')).not.toBeInTheDocument()
    expect(screen.queryByText('All Types')).not.toBeInTheDocument()
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buy Composition' })).toBeInTheDocument()
  })
})
