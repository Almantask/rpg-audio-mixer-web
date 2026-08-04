import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { LibraryView } from './LibraryView'

describe('LibraryView', () => {
  it('switches tabs and opens add soundscape modal', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <LibraryView />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /soundscapes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sound effects/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sound effects/i }))
    expect(screen.getByPlaceholderText(/search effects/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /soundscapes/i }))
    expect(screen.getByRole('button', { name: /\+ add soundscape/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /\+ add soundscape/i }))
    expect(screen.getByRole('dialog', { name: /add soundscape category/i })).toBeInTheDocument()
  })
})
