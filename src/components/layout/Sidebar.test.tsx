import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

function renderSidebar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar isOpen onNavigate={() => undefined} />
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('renders six primary navigation items without a divider', () => {
    renderSidebar()

    const nav = screen.getByRole('navigation', { name: 'Primary navigation' })
    const links = nav.querySelectorAll('a')
    expect(links).toHaveLength(6)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Campaign' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Scenes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Credits' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Trash' })).toBeInTheDocument()
    expect(nav.querySelector('[role="separator"]')).not.toBeInTheDocument()
  })

  it('highlights Home on the home route', () => {
    renderSidebar('/')

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-sidebar-active',
      'true',
    )
    expect(screen.getByRole('link', { name: 'Campaign' })).toHaveAttribute(
      'data-sidebar-active',
      'false',
    )
  })

  it('highlights Scenes on the scenes route', () => {
    renderSidebar('/scenes')

    expect(screen.getByRole('link', { name: 'Scenes' })).toHaveAttribute(
      'data-sidebar-active',
      'true',
    )
  })

  it('keeps Home highlighted during campaign drill-down', () => {
    renderSidebar('/campaigns/e2e-campaign/sessions/e2e-session/scenes')

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'data-sidebar-active',
      'true',
    )
    expect(screen.getByRole('link', { name: 'Campaign' })).toHaveAttribute(
      'data-sidebar-active',
      'false',
    )
  })

  it('shows a static avatar placeholder in the footer', () => {
    renderSidebar()

    expect(screen.getByLabelText('Profile avatar placeholder')).toBeInTheDocument()
  })
})
