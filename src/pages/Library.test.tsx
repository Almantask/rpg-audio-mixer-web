import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Library } from './Library'

describe('Library Page', () => {
  it('switches between soundscapes and sound effects tabs', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Library />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /soundscapes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sound effects/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /sound effects/i }))
    expect(screen.getByPlaceholderText(/search sound effects/i)).toBeInTheDocument()
  })
})
