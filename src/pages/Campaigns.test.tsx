import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { Campaigns } from './Campaigns'

describe('Campaigns Page', () => {
  it('renders campaigns list and opens create campaign modal', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <Campaigns />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /active campaigns/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /create campaign/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
