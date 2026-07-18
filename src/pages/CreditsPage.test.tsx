import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CampaignDataProvider } from '@/context/CampaignDataContext'
import { APP_VERSION, DONATION_URL, REVIEW_URL } from '@/lib/creditsLinks'
import { CreditsPage } from '@/pages/CreditsPage'

function renderCreditsPage() {
  return render(
    <MemoryRouter>
      <CampaignDataProvider>
        <CreditsPage />
      </CampaignDataProvider>
    </MemoryRouter>,
  )
}

describe('CreditsPage', () => {
  it('shows the Credits heading without a page subtitle', () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    renderCreditsPage()

    expect(screen.getByRole('heading', { name: 'Credits' })).toBeInTheDocument()
    expect(
      screen.queryByText('App info, support links, and legal.'),
    ).not.toBeInTheDocument()
  })

  it('renders support actions and legal links', () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    renderCreditsPage()

    expect(screen.getByRole('heading', { name: 'Credits' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buy the Devs a Coffee/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Leave a Review/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/legal/privacy',
    )
    expect(screen.getByRole('link', { name: 'Attributions' })).toHaveAttribute(
      'href',
      '/credits/attributions',
    )
    expect(screen.getByText(new RegExp(`V ${APP_VERSION}`))).toBeInTheDocument()
  })

  it('opens the donation URL in a new tab', async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    renderCreditsPage()

    await user.click(screen.getByRole('button', { name: /Buy the Devs a Coffee/i }))

    expect(openSpy).toHaveBeenCalledWith(DONATION_URL, '_blank', 'noopener,noreferrer')
    openSpy.mockRestore()
  })

  it('opens the review URL in a new tab', async () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    renderCreditsPage()

    await user.click(screen.getByRole('button', { name: /Leave a Review/i }))

    expect(openSpy).toHaveBeenCalledWith(REVIEW_URL, '_blank', 'noopener,noreferrer')
    openSpy.mockRestore()
  })
})
