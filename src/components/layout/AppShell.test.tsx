import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders top bar title and sidebar navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppShell>
          <div>Main Content</div>
        </AppShell>
      </MemoryRouter>,
    )

    expect(screen.getByText('Arcanum Audio')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /campaign/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /scenes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /library/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /credits/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /trash/i })).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })
})
