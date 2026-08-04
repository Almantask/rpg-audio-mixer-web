import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { CampaignSessions } from './CampaignSessions'

describe('CampaignSessions Page', () => {
  it('renders campaign sessions list and opens add session modal', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/camp-1/sessions']}>
        <AppProvider>
          <Routes>
            <Route path="/campaigns/:campaignId/sessions" element={<CampaignSessions />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getAllByText(/shadows of the underdark/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /add new session/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /add new session/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
