import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Home } from './Home'

describe('Home Page', () => {
  it('renders Active Campaigns hero section and top stat cards', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Home />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Top Soundscape')).toBeInTheDocument()
    expect(screen.getByText('Top FX')).toBeInTheDocument()
  })
})
