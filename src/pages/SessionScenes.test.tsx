import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { SessionScenes } from './SessionScenes'

describe('SessionScenes Page', () => {
  it('renders session scenes and action buttons', () => {
    render(
      <MemoryRouter initialEntries={['/campaigns/camp-1/sessions/sess-14/scenes']}>
        <AppProvider>
          <Routes>
            <Route
              path="/campaigns/:campaignId/sessions/:sessionId/scenes"
              element={<SessionScenes />}
            />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /new scene/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import scene/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /import scene/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
