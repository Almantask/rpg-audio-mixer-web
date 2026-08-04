import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { ActiveScene } from './ActiveScene'

describe('ActiveScene Page', () => {
  it('renders active scene tabs and handles tab switching', () => {
    render(
      <MemoryRouter initialEntries={['/scenes/scene-1']}>
        <AppProvider>
          <Routes>
            <Route path="/scenes/:sceneId" element={<ActiveScene />} />
          </Routes>
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /dragon's lair/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /soundscapes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /soundboard/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /soundboard/i }))
    expect(screen.getByText(/soundboard master/i)).toBeInTheDocument()
  })
})
