import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { CampaignSessionsView } from './CampaignSessionsView'

describe('CampaignSessionsView', () => {
  it('renders campaign sessions list and handles session creation modal', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/camp-1/sessions']}>
        <AppProvider>
          <Routes>
            <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessionsView />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Shadows of the Underdark').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /add new session/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /add new session/i }))
    expect(screen.getByRole('dialog', { name: /add new session/i })).toBeInTheDocument()
  })
})
