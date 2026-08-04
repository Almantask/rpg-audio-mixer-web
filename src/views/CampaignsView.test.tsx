import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { CampaignsView } from './CampaignsView'

describe('CampaignsView', () => {
  it('renders campaigns list and allows opening creation modal', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <CampaignsView />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /active campaigns/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /create campaign/i }))

    expect(screen.getByRole('dialog', { name: /create campaign/i })).toBeInTheDocument()
  })
})
