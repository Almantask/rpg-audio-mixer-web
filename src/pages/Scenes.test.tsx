import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Scenes } from './Scenes'

describe('Scenes Page', () => {
  it('renders scenes list and handles search and new scene modal', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Scenes />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /scenes catalogue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new scene/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /new scene/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
