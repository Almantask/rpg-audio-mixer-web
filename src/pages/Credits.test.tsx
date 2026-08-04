import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Credits } from './Credits'

describe('Credits Page', () => {
  it('renders support section and legal links', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Credits />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /credits/i })).toBeInTheDocument()
    expect(screen.getByText(/buy the devs a coffee/i)).toBeInTheDocument()
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
  })
})
