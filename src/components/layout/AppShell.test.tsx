import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

function renderAppShell(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AppShell />} path="/">
          <Route element={<div>Page content</div>} index />
          <Route element={<div>Scenes page</div>} path="scenes" />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders the top bar, sidebar, and routed content', () => {
    renderAppShell()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('shows Arcanum Audio in the top bar', () => {
    renderAppShell()

    expect(screen.getByRole('heading', { name: 'Arcanum Audio' })).toBeInTheDocument()
  })

  it('does not show a settings or gear icon in the top bar', () => {
    renderAppShell()

    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/settings/i)).not.toBeInTheDocument()
  })
})

describe('AppShell sidebar toggle', () => {
  it('toggles sidebar visibility on narrow viewports via hamburger', async () => {
    renderAppShell()
    const user = userEvent.setup()

    const sidebar = document.getElementById('primary-navigation')
    expect(sidebar).toHaveAttribute('data-sidebar-open', 'false')

    await user.click(screen.getByRole('button', { name: 'Toggle navigation menu' }))
    expect(sidebar).toHaveAttribute('data-sidebar-open', 'true')
  })
})
