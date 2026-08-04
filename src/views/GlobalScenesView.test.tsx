import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { GlobalScenesView } from './GlobalScenesView'

describe('GlobalScenesView', () => {
  it('renders scenes catalogue, filter bar, and create modal', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <GlobalScenesView />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /scenes/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search scenes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new scene/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /new scene/i }))
    expect(screen.getByRole('dialog', { name: /new scene/i })).toBeInTheDocument()
  })
})
