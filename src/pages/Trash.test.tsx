import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Trash } from './Trash'

describe('Trash Page', () => {
  it('renders trash tabs and handles switching', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Trash />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /trash/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /campaigns/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sessions/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sessions/i }))
    expect(screen.getByText(/no deleted sessions/i)).toBeInTheDocument()
  })
})
