import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { TrashView } from './TrashView'

describe('TrashView', () => {
  it('renders entity tabs and empty state when trash is empty', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <TrashView />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /trash/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /campaigns/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sessions/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /scenes/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sessions/i }))
    expect(screen.getByText(/no deleted sessions/i)).toBeInTheDocument()
  })
})
