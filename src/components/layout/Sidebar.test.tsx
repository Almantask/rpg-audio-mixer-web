import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Sidebar, TopBar } from './Sidebar'

function renderSidebar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar open onNavigate={() => undefined} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders all primary navigation items', () => {
    renderSidebar()

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    for (const item of ['Home', 'Campaign', 'Scenes', 'Library', 'Credits', 'Trash']) {
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

  it('highlights Home on session drill-down routes', () => {
    renderSidebar('/campaigns/curse-of-strahd/sessions/1/scenes')

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('data-active', 'true')
    expect(homeLink).toHaveAttribute('aria-current', 'page')

    for (const link of screen.getAllByRole('link')) {
      if (link !== homeLink) {
        expect(link).not.toHaveAttribute('aria-current')
      }
    }
  })

  it('shows a static avatar placeholder without navigation', async () => {
    renderSidebar()

    const avatar = screen.getByLabelText('Profile avatar placeholder')
    expect(avatar).toBeInTheDocument()
    await userEvent.click(avatar)
    expect(window.location.pathname).toBe('/')
  })
})

describe('TopBar', () => {
  it('shows the Arcanum Audio title', () => {
    render(<TopBar onMenuToggle={() => undefined} />)
    expect(screen.getByRole('heading', { name: 'Arcanum Audio' })).toBeInTheDocument()
  })
})
