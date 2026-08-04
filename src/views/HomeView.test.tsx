import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { HomeView } from './HomeView'

describe('HomeView', () => {
  it('renders active campaign hero and top stat cards', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <HomeView />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    expect(screen.getByText('Top Soundscape')).toBeInTheDocument()
    expect(screen.getByText('Top FX')).toBeInTheDocument()
  })
})
