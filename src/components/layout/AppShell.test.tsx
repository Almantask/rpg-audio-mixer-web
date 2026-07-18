import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

function renderAppShell() {
  return render(
    <MemoryRouter initialEntries={['/scenes']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/scenes"
            element={
              <header>
                <h2>Scenes</h2>
                <p>Curate and manage your immersive environments.</p>
              </header>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('keeps the mobile open-menu control in a fixed top bar above page content', () => {
    renderAppShell()

    const openMenu = screen.getByRole('button', { name: 'Open menu' })
    const topBar = openMenu.closest('[data-mobile-top-bar]')

    expect(topBar).toBeInTheDocument()
    expect(topBar).toHaveClass('fixed', 'top-0', 'z-[60]')
  })

  it('reserves main top padding for the mobile top bar without sm:p-* overriding it', () => {
    renderAppShell()

    const main = screen.getByRole('main')

    expect(main.className).toMatch(/\bpt-14\b/)
    expect(main.className).not.toMatch(/\bsm:p-6\b/)
    expect(main.className).toMatch(/\bsm:px-6\b/)
    expect(main.className).toMatch(/\blg:p-6\b/)
  })

  it('hides the open-menu control while the sidebar is open', async () => {
    const user = userEvent.setup()
    renderAppShell()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.queryByRole('button', { name: 'Open menu' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
  })
})
