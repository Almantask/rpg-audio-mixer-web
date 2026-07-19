import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

function renderSidebar(
  path = '/',
  state?: { campaignId?: string; sessionId?: string },
) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Sidebar open onNavigate={() => undefined} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders the Arcanum Audio brand wordmark', () => {
    renderSidebar()

    expect(screen.getByRole('heading', { name: 'Arcanum Audio' })).toBeInTheDocument()
    expect(screen.getByText('Session desk')).toBeInTheDocument()
    expect(document.querySelector('[data-brand-logo]')).toHaveAttribute(
      'src',
      `${import.meta.env.BASE_URL}logo3.png`,
    )
  })

  it('shows a close control instead of overlapping the brand when open', () => {
    renderSidebar()

    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
  })


  it('renders all primary navigation items', () => {
    renderSidebar()

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    for (const item of ['Home', 'Campaigns', 'Scenes', 'Library', 'Credits', 'Trash']) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('highlights Scenes when on the scenes route', () => {
    renderSidebar('/scenes')

    expect(screen.getByText('Scenes').closest('[data-sidebar-item="Scenes"]')).toHaveAttribute(
      'data-active',
      'true',
    )
  })

  it('highlights Campaigns on campaign and session drill-down routes', () => {
    renderSidebar('/campaigns/curse-of-strahd/sessions/1/scenes')

    const campaignsLink = screen.getByRole('link', { name: 'Campaigns' })
    expect(campaignsLink).toHaveAttribute('data-active', 'true')
    expect(campaignsLink).toHaveAttribute('aria-current', 'page')

    for (const link of screen.getAllByRole('link')) {
      if (link !== campaignsLink) {
        expect(link).not.toHaveAttribute('aria-current')
      }
    }
  })

  it('highlights Campaigns on Active Scene opened from a campaign session', () => {
    renderSidebar('/scenes/tavern/active', {
      campaignId: 'curse-of-strahd',
      sessionId: 'session-1',
    })

    expect(screen.getByRole('link', { name: 'Campaigns' })).toHaveAttribute(
      'data-active',
      'true',
    )
  })

})
