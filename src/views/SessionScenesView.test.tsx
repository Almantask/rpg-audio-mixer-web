import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { SessionScenesView } from './SessionScenesView'

describe('SessionScenesView', () => {
  it('renders session scenes list and CTAs for New Scene and Import Scene', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/camp-1/sessions/sess-14/scenes']}>
        <AppProvider>
          <Routes>
            <Route
              path="/campaigns/:campaignId/sessions/:sessionId/scenes"
              element={<SessionScenesView />}
            />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/session scenes/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new scene/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import scene/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /import scene/i }))
    expect(screen.getByRole('dialog', { name: /import scene/i })).toBeInTheDocument()
  })
})
