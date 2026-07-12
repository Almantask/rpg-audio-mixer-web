import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CreditsPage } from '@/pages/CreditsPage'

describe('CreditsPage', () => {
  it('renders support and legal links', () => {
    render(
      <MemoryRouter>
        <CreditsPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Credits' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /buy the devs a coffee/i })).toHaveAttribute(
      'href',
      'https://buymeacoffee.com/arcanumaudio',
    )
    expect(screen.getByRole('link', { name: 'Attributions' })).toHaveAttribute(
      'href',
      '/credits/attributions',
    )
  })
})
